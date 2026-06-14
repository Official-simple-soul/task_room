'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireProfile } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

const deleteUserSchema = z.object({
  user_id: z.uuid(),
});

function notice(message: string, failed = false): never {
  redirect(`/users?${failed ? 'error' : 'notice'}=${encodeURIComponent(message)}`);
}

export async function deleteUser(formData: FormData) {
  const { supabase, profile } = await requireProfile('admin');
  const parsed = deleteUserSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    notice('Select a valid user to delete.', true);
  }

  const userId = parsed.data.user_id;
  if (userId === profile.id) {
    notice('You cannot delete your own admin account.', true);
  }

  const { data: target, error: targetError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', userId)
    .eq('role', 'user')
    .maybeSingle();

  if (targetError) notice(targetError.message, true);
  if (!target) notice('Only worker accounts can be deleted.', true);

  let adminClient: ReturnType<typeof createAdminClient>;
  try {
    adminClient = createAdminClient();
  } catch {
    notice('User deletion is not configured. Add SUPABASE_SERVICE_ROLE_KEY.', true);
  }

  const { error: historyError } = await adminClient
    .from('task_status_history')
    .update({ changed_by: null })
    .eq('changed_by', userId);
  if (historyError) notice(historyError.message, true);

  const { error: paymentsError } = await adminClient
    .from('monthly_payments')
    .delete()
    .eq('user_id', userId);
  if (paymentsError) notice(paymentsError.message, true);

  const { error: tasksError } = await adminClient
    .from('tasks')
    .delete()
    .eq('assigned_to', userId);
  if (tasksError) notice(tasksError.message, true);

  const { error } = await adminClient.auth.admin.deleteUser(userId);
  if (error) notice(error.message, true);

  revalidatePath('/users');
  revalidatePath('/dashboard');
  revalidatePath('/tasks');
  revalidatePath('/payments');
  revalidatePath('/records');
  notice('User deleted successfully.');
}
