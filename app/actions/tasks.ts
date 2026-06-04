'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireProfile } from '@/lib/auth';
import { acceptedTaskStepRanges, taskFeeCents } from '@/lib/task-rates';

const taskSchema = z.object({
  external_task_id: z.string().trim().min(1).max(80),
  task_url: z.url(),
  step_range: z.enum(acceptedTaskStepRanges),
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

function notice(path: string, message: string, failed = false): never {
  redirect(
    `${path}?${failed ? 'error' : 'notice'}=${encodeURIComponent(message)}`,
  );
}

export async function claimTask(taskId: string) {
  const { supabase } = await requireProfile('user');
  const { error } = await supabase.rpc('claim_task', { p_task_id: taskId });
  if (error) notice('/tasks', error.message, true);
  revalidatePath('/tasks');
  notice('/tasks', 'Task claimed. The working URL is now available.');
}

export async function completeTask(taskId: string) {
  const { supabase } = await requireProfile('user');
  const { error } = await supabase.rpc('complete_task', { p_task_id: taskId });
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
  const { error } = await supabase.from('tasks').insert({
    assigned_to: userId,
    created_by: profile.id,
    external_task_id: task.external_task_id,
    task_url: task.task_url,
    step_range: task.step_range,
    task_language: task.task_language,
    application: task.application,
    prompt: task.prompt,
    fee_cents: taskFeeCents(task.step_range, task.fee),
  });

  if (error) notice(path, error.message, true);
  revalidatePath(path);
  revalidatePath('/users');
  notice(path, 'Task assigned successfully.');
}

export async function addTaskGlobal(formData: FormData) {
  const { supabase, profile } = await requireProfile('admin');
  const parsed = taskSchema.safeParse(Object.fromEntries(formData));
  const path = `/tasks`;
  if (!parsed.success) notice(path, 'Please provide valid task details.', true);

  const task = parsed.data;
  const assigned_to = String(formData.get('assigned_to') ?? '').trim();
  if (!assigned_to)
    notice(path, 'Please select a user to assign this task to.', true);

  const { error } = await supabase.from('tasks').insert({
    assigned_to,
    created_by: profile.id,
    external_task_id: task.external_task_id,
    task_url: task.task_url,
    step_range: task.step_range,
    task_language: task.task_language,
    application: task.application,
    prompt: task.prompt,
    fee_cents: taskFeeCents(task.step_range, task.fee),
  });

  if (error) notice(path, error.message, true);
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
  const { data, error } = await supabase
    .from('tasks')
    .update({
      external_task_id: task.external_task_id,
      task_url: task.task_url,
      step_range: task.step_range,
      task_language: task.task_language,
      application: task.application,
      prompt: task.prompt,
      fee_cents: taskFeeCents(task.step_range, task.fee),
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
    .select('id')
    .maybeSingle();

  if (error) notice(returnPath, error.message, true);
  if (!data) {
    notice(returnPath, 'Only pending tasks can be reassigned.', true);
  }

  revalidatePath(returnPath);
  revalidatePath('/tasks');
  revalidatePath(`/users/${assignedTo}`);
  notice(returnPath, 'Task reassigned successfully.');
}

export async function startReview(taskId: string, userId: string) {
  const { supabase } = await requireProfile('admin');
  const { error } = await supabase
    .from('tasks')
    .update({ status: 'under_review' })
    .eq('id', taskId);
  if (error) notice(`/users/${userId}`, error.message, true);
  revalidatePath(`/users/${userId}`);
  revalidatePath('/tasks');
  revalidatePath('/dashboard');
  notice(`/users/${userId}`, 'Task is now under review.');
}

export async function decideTask(
  taskId: string,
  userId: string,
  formData: FormData,
) {
  const { supabase } = await requireProfile('admin');
  const status = z
    .enum(['approved', 'rework', 'rejected'])
    .parse(formData.get('status'));
  const comment = String(formData.get('admin_comment') ?? '').trim() || null;
  if (status === 'rework' && !comment) {
    notice(
      `/users/${userId}`,
      'Add a comment explaining the requested rework.',
      true,
    );
  }

  const { error } = await supabase
    .from('tasks')
    .update({ status, admin_comment: comment })
    .eq('id', taskId);
  if (error) notice(`/users/${userId}`, error.message, true);
  revalidatePath(`/users/${userId}`);
  revalidatePath('/tasks');
  revalidatePath('/dashboard');
  revalidatePath('/leaderboard');
  revalidatePath('/payments');
  notice(`/users/${userId}`, `Task marked ${status.replace('_', ' ')}.`);
}
