'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireProfile } from '@/lib/auth';

const stepRanges = [
  '10-25',
  '25-50',
  '50-75',
  '75-100',
  '100-130',
  '130-200',
] as const;
const taskSchema = z.object({
  external_task_id: z.string().trim().min(1).max(80),
  task_url: z.url(),
  step_range: z.enum(stepRanges),
  task_language: z.string().trim().min(1).max(60),
  prompt: z.string().trim().min(5).max(5000),
  fee: z.coerce.number().min(0).max(100000).default(3),
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
    prompt: task.prompt,
    fee_cents: Math.round(task.fee * 100),
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
    prompt: task.prompt,
    fee_cents: Math.round(task.fee * 100),
  });

  if (error) notice(path, error.message, true);
  revalidatePath(path);
  revalidatePath(`/users/${assigned_to}`);
  notice(path, 'Task assigned successfully.');
}

export async function startReview(taskId: string, userId: string) {
  const { supabase } = await requireProfile('admin');
  const { error } = await supabase
    .from('tasks')
    .update({ status: 'under_review' })
    .eq('id', taskId);
  if (error) notice(`/users/${userId}`, error.message, true);
  revalidatePath(`/users/${userId}`);
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
  revalidatePath('/payments');
  notice(`/users/${userId}`, `Task marked ${status.replace('_', ' ')}.`);
}
