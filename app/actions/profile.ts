'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireProfile } from '@/lib/auth';

const paymentMethodSchema = z.object({
  payment_bank_name: z.string().trim().max(120),
  payment_account_number: z.string().trim().max(60),
  payment_account_name: z.string().trim().max(160),
});

export async function updatePaymentMethod(formData: FormData) {
  const { supabase } = await requireProfile('user');
  const parsed = paymentMethodSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirect('/settings?error=Please%20provide%20valid%20payment%20details.');
  }

  const value = parsed.data;
  const { error } = await supabase.rpc('update_my_payment_method', {
    p_bank_name: value.payment_bank_name,
    p_account_number: value.payment_account_number,
    p_account_name: value.payment_account_name,
  });

  if (error) redirect(`/settings?error=${encodeURIComponent(error.message)}`);

  revalidatePath('/settings');
  revalidatePath('/payments');
  redirect('/settings?notice=Payment%20method%20saved.');
}
