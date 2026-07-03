'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireProfile } from '@/lib/auth';
import { sendTaskEmail, type TaskEmailPayload } from '@/lib/email';
import {
  bucketForStepCount,
  compatibleStepRangeForBucket,
  feeCentsFromDollars,
} from '@/lib/projects';
import type { ProjectBucket } from '@/lib/types';

type SupabaseClient = Awaited<ReturnType<typeof requireProfile>>['supabase'];
type TaskEmailRow = {
  external_task_id: string;
  assigned_to: string;
  task_language: string;
  step_range: string;
  fee_cents: number;
};

const taskSchema = z.object({
  external_task_id: z.string().trim().min(1).max(80),
  task_url: z.url(),
  project_id: z.uuid(),
  task_bucket_id: z.uuid(),
  step_range: z.string().trim().optional(),
  task_language: z.string().trim().min(1).max(60),
  application: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => value || null),
  prompt: z.string().trim().min(5).max(5000),
  fee: z.preprocess(
    (value) => (String(value ?? '').trim() === '' ? undefined : value),
    z.coerce.number().min(0).max(100000).optional(),
  ),
});
const reassignSchema = z.object({
  assigned_to: z.uuid(),
  return_path: z.string().startsWith('/').default('/tasks'),
});
const completeTaskSchema = z.object({
  final_step_count: z.coerce.number().int().min(1).max(100000),
});
const deleteTaskSchema = z.object({
  return_path: z.string().startsWith('/').default('/tasks'),
});
const startReviewSchema = z.object({
  final_step_count: z.coerce.number().int().min(1).max(100000),
  return_path: z
    .string()
    .startsWith('/')
    .optional()
    .transform((value) => value ?? ''),
});
const decideTaskSchema = z.object({
  status: z.enum(['approved', 'rework', 'rejected']),
  admin_comment: z.string().trim().optional(),
  return_path: z
    .string()
    .startsWith('/')
    .optional()
    .transform((value) => value ?? ''),
});
const revertApprovalSchema = z.object({
  return_path: z
    .string()
    .startsWith('/')
    .optional()
    .transform((value) => value ?? ''),
});

function notice(path: string, message: string, failed = false): never {
  redirect(
    `${path}?${failed ? 'error' : 'notice'}=${encodeURIComponent(message)}`,
  );
}

async function loadTaskBucket(
  supabase: SupabaseClient,
  bucketId: string,
  projectId?: string,
) {
  let query = supabase
    .from('project_task_buckets')
    .select('id, project_id, label, min_steps, max_steps, fee_cents, sort_order')
    .eq('id', bucketId);

  if (projectId) query = query.eq('project_id', projectId);

  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(error.message);
  return data as ProjectBucket | null;
}

function taskPayloadFromBucket(
  task: z.infer<typeof taskSchema>,
  bucket: ProjectBucket,
) {
  return {
    project_id: bucket.project_id,
    task_bucket_id: bucket.id,
    step_range: compatibleStepRangeForBucket(bucket),
    fee_cents: feeCentsFromDollars(task.fee, bucket.fee_cents),
  };
}

async function reviewPricingForTask(
  supabase: SupabaseClient,
  taskId: string,
  finalStepCount: number,
) {
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('project_id')
    .eq('id', taskId)
    .maybeSingle();
  if (taskError) throw new Error(taskError.message);
  if (!task?.project_id) throw new Error('Task project was not found.');

  const { data: buckets, error: bucketError } = await supabase
    .from('project_task_buckets')
    .select('id, project_id, label, min_steps, max_steps, fee_cents, sort_order')
    .eq('project_id', task.project_id);
  if (bucketError) throw new Error(bucketError.message);

  const bucket = bucketForStepCount(
    (buckets ?? []) as ProjectBucket[],
    finalStepCount,
  );
  if (!bucket) {
    throw new Error('No payment bucket matches the final step count.');
  }

  return {
    task_bucket_id: bucket.id,
    step_range: compatibleStepRangeForBucket(bucket),
    fee_cents: bucket.fee_cents,
  };
}

async function queueTaskEmail(
  supabase: SupabaseClient,
  task: TaskEmailRow | null | undefined,
  status: TaskEmailPayload['status'],
  comment?: string | null,
) {
  if (!task) return;

  const { data: worker, error } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', task.assigned_to)
    .maybeSingle();

  if (error) {
    console.error(`[email] could not load worker profile ${task.assigned_to}: ${error.message}`);
    return;
  }
  if (!worker?.email) {
    console.warn(`[email] skipped task notification: worker ${task.assigned_to} has no email on file.`);
    return;
  }

  await sendTaskEmail({
    to: worker.email,
    workerName: worker.full_name,
    taskId: task.external_task_id,
    status,
    language: task.task_language,
    stepRange: task.step_range,
    feeCents: task.fee_cents,
    comment,
  });
}

export async function claimTask(taskId: string) {
  const { supabase } = await requireProfile('user');
  const { error } = await supabase.rpc('claim_task', { p_task_id: taskId });
  if (error) notice('/tasks', error.message, true);
  revalidatePath('/tasks');
  notice('/tasks', 'Task claimed. The working URL is now available.');
}

export async function completeTask(taskId: string, formData: FormData) {
  const { supabase } = await requireProfile('user');
  const parsed = completeTaskSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    notice('/tasks', 'Enter the final step count before submitting.', true);
  }

  const { error } = await supabase.rpc('complete_task', {
    p_task_id: taskId,
    p_final_step_count: parsed.data.final_step_count,
  });
  if (error) notice('/tasks', error.message, true);
  revalidatePath('/tasks');
  revalidatePath('/dashboard');
  revalidatePath('/leaderboard');
  notice('/tasks', 'Task submitted for admin review.');
}

export async function addTask(userId: string, formData: FormData) {
  const { supabase, profile } = await requireProfile('admin');
  const parsed = taskSchema.safeParse(Object.fromEntries(formData));
  const path = `/users/${userId}`;
  if (!parsed.success) notice(path, 'Please provide valid task details.', true);

  const task = parsed.data;
  const bucket = await loadTaskBucket(
    supabase,
    task.task_bucket_id,
    task.project_id,
  );
  if (!bucket) notice(path, 'Please select a valid project step bucket.', true);
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      assigned_to: userId,
      created_by: profile.id,
      external_task_id: task.external_task_id,
      task_url: task.task_url,
      task_language: task.task_language,
      application: task.application,
      prompt: task.prompt,
      ...taskPayloadFromBucket(task, bucket),
    })
    .select('external_task_id, assigned_to, task_language, step_range, fee_cents')
    .single();

  if (error) notice(path, error.message, true);
  await queueTaskEmail(supabase, data, 'assigned');
  revalidatePath(path);
  revalidatePath('/users');
  notice(path, 'Task assigned successfully.');
}

export async function addTaskGlobal(formData: FormData) {
  const { supabase, profile } = await requireProfile('admin');
  const parsed = taskSchema.safeParse(Object.fromEntries(formData));
  const path = String(formData.get('return_path') ?? '/tasks');
  if (!parsed.success) notice(path, 'Please provide valid task details.', true);

  const task = parsed.data;
  const bucket = await loadTaskBucket(
    supabase,
    task.task_bucket_id,
    task.project_id,
  );
  if (!bucket) notice(path, 'Please select a valid project step bucket.', true);
  const assigned_to = String(formData.get('assigned_to') ?? '').trim();
  if (!assigned_to)
    notice(path, 'Please select a user to assign this task to.', true);

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      assigned_to,
      created_by: profile.id,
      external_task_id: task.external_task_id,
      task_url: task.task_url,
      task_language: task.task_language,
      application: task.application,
      prompt: task.prompt,
      ...taskPayloadFromBucket(task, bucket),
    })
    .select('external_task_id, assigned_to, task_language, step_range, fee_cents')
    .single();

  if (error) notice(path, error.message, true);
  await queueTaskEmail(supabase, data, 'assigned');
  revalidatePath(path);
  revalidatePath(`/users/${assigned_to}`);
  notice(path, 'Task assigned successfully.');
}

export async function updateTask(
  taskId: string,
  userId: string,
  formData: FormData,
) {
  const { supabase } = await requireProfile('admin');
  const parsed = taskSchema.safeParse(Object.fromEntries(formData));
  const path = `/users/${userId}`;
  if (!parsed.success) notice(path, 'Please provide valid task details.', true);

  const task = parsed.data;
  const bucket = await loadTaskBucket(
    supabase,
    task.task_bucket_id,
    task.project_id,
  );
  if (!bucket) notice(path, 'Please select a valid project step bucket.', true);
  const { data, error } = await supabase
    .from('tasks')
    .update({
      external_task_id: task.external_task_id,
      task_url: task.task_url,
      task_language: task.task_language,
      application: task.application,
      prompt: task.prompt,
      ...taskPayloadFromBucket(task, bucket),
    })
    .eq('id', taskId)
    .neq('status', 'approved')
    .select('id')
    .maybeSingle();

  if (error) notice(path, error.message, true);
  if (!data) notice(path, 'Approved tasks cannot be edited.', true);

  revalidatePath(path);
  revalidatePath('/tasks');
  notice(path, 'Task updated successfully.');
}

export async function reassignTask(taskId: string, formData: FormData) {
  const { supabase } = await requireProfile('admin');
  const parsed = reassignSchema.safeParse(Object.fromEntries(formData));
  const fallbackPath = '/tasks';

  if (!parsed.success) {
    notice(fallbackPath, 'Please select a valid worker to reassign this task.', true);
  }

  const { assigned_to: assignedTo, return_path: returnPath } = parsed.data;
  const { data, error } = await supabase
    .from('tasks')
    .update({ assigned_to: assignedTo })
    .eq('id', taskId)
    .eq('status', 'pending')
    .select('external_task_id, assigned_to, task_language, step_range, fee_cents')
    .maybeSingle();

  if (error) notice(returnPath, error.message, true);
  if (!data) {
    notice(returnPath, 'Only pending tasks can be reassigned.', true);
  }

  await queueTaskEmail(supabase, data, 'assigned');
  revalidatePath(returnPath);
  revalidatePath('/tasks');
  revalidatePath(`/users/${assignedTo}`);
  notice(returnPath, 'Task reassigned successfully.');
}

export async function deleteTask(taskId: string, formData: FormData) {
  const { supabase } = await requireProfile('admin');
  const parsed = deleteTaskSchema.safeParse(Object.fromEntries(formData));
  const returnPath = parsed.success ? parsed.data.return_path : '/tasks';

  const { data, error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .in('status', ['pending', 'rework', 'rejected'])
    .select('id, assigned_to')
    .maybeSingle();

  if (error) notice(returnPath, error.message, true);
  if (!data) {
    notice(
      returnPath,
      'Only pending, rework, or rejected tasks can be deleted.',
      true,
    );
  }

  revalidatePath(returnPath);
  revalidatePath('/tasks');
  revalidatePath(`/users/${data.assigned_to}`);
  notice(returnPath, 'Task deleted successfully.');
}

export async function startReview(
  taskId: string,
  userId: string,
  formData: FormData,
) {
  const { supabase } = await requireProfile('admin');
  const parsed = startReviewSchema.safeParse(Object.fromEntries(formData));
  const returnPath = parsed.success && parsed.data.return_path
    ? parsed.data.return_path
    : `/users/${userId}`;
  if (!parsed.success) {
    notice(
      returnPath,
      'Enter the final step count before moving this task to review.',
      true,
    );
  }

  let pricing;
  try {
    pricing = await reviewPricingForTask(
      supabase,
      taskId,
      parsed.data.final_step_count,
    );
  } catch (pricingError) {
    notice(
      returnPath,
      pricingError instanceof Error
        ? pricingError.message
        : 'Unable to calculate the task fee.',
      true,
    );
  }

  const { data, error } = await supabase
    .from('tasks')
    .update({
      status: 'under_review',
      final_step_count: parsed.data.final_step_count,
      ...pricing,
    })
    .eq('id', taskId)
    .select('external_task_id, assigned_to, task_language, step_range, fee_cents')
    .maybeSingle();
  if (error) notice(returnPath, error.message, true);
  await queueTaskEmail(supabase, data, 'under_review');
  revalidatePath(`/users/${userId}`);
  revalidatePath('/tasks');
  revalidatePath('/dashboard');
  revalidatePath('/records');
  notice(returnPath, 'Task is now under review.');
}

export async function decideTask(
  taskId: string,
  userId: string,
  formData: FormData,
) {
  const { supabase } = await requireProfile('admin');
  const parsed = decideTaskSchema.safeParse(Object.fromEntries(formData));
  const returnPath = parsed.success && parsed.data.return_path
    ? parsed.data.return_path
    : `/users/${userId}`;

  if (!parsed.success) {
    notice(returnPath, 'Please provide a valid review decision.', true);
  }

  const status = parsed.data.status;
  const comment = parsed.data.admin_comment || null;
  if (status === 'rework' && !comment) {
    notice(
      returnPath,
      'Add a comment explaining the requested rework.',
      true,
    );
  }

  const { data, error } = await supabase
    .from('tasks')
    .update({ status, admin_comment: comment })
    .eq('id', taskId)
    .select('external_task_id, assigned_to, task_language, step_range, fee_cents')
    .maybeSingle();
  if (error) notice(returnPath, error.message, true);
  await queueTaskEmail(supabase, data, status, comment);
  revalidatePath(`/users/${userId}`);
  revalidatePath('/tasks');
  revalidatePath('/dashboard');
  revalidatePath('/leaderboard');
  revalidatePath('/payments');
  notice(returnPath, `Task marked ${status.replace('_', ' ')}.`);
}

export async function revertTaskApproval(
  taskId: string,
  userId: string,
  formData: FormData,
) {
  const { supabase } = await requireProfile('admin');
  const parsed = revertApprovalSchema.safeParse(Object.fromEntries(formData));
  const returnPath = parsed.success && parsed.data.return_path
    ? parsed.data.return_path
    : `/users/${userId}`;

  const { data, error } = await supabase
    .from('tasks')
    .update({ status: 'under_review', admin_comment: null })
    .eq('id', taskId)
    .eq('status', 'approved')
    .select('id')
    .maybeSingle();

  if (error) notice(returnPath, error.message, true);
  if (!data) notice(returnPath, 'Only approved tasks can be reverted.', true);

  revalidatePath(`/users/${userId}`);
  revalidatePath('/tasks');
  revalidatePath('/dashboard');
  revalidatePath('/leaderboard');
  revalidatePath('/payments');
  revalidatePath('/records');
  notice(returnPath, 'Approval reverted. Task is back under review.');
}
