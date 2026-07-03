"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireProfile } from "@/lib/auth";
import { sendPaymentEmail } from "@/lib/email";

type SupabaseClient = Awaited<ReturnType<typeof requireProfile>>["supabase"];
type PaymentEmailRow = {
  user_id: string;
  payment_month: string;
  amount_cents: number;
  status: "due" | "paid";
};

async function queuePaymentEmail(
  supabase: SupabaseClient,
  payment: PaymentEmailRow | null | undefined,
) {
  if (!payment) return;

  const { data: worker, error } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", payment.user_id)
    .maybeSingle();

  if (error) {
    console.error(`[email] could not load worker profile ${payment.user_id}: ${error.message}`);
    return;
  }
  if (!worker?.email) {
    console.warn(`[email] skipped payment notification: worker ${payment.user_id} has no email on file.`);
    return;
  }

  await sendPaymentEmail({
    to: worker.email,
    workerName: worker.full_name,
    status: payment.status,
    amountCents: payment.amount_cents,
    paymentMonth: payment.payment_month,
  });
}

const paymentSchema = z.object({
  user_id: z.uuid(),
  payment_month: z.string().regex(/^\d{4}-\d{2}$/),
  amount: z.coerce.number().min(0),
  status: z.enum(["due", "paid"]),
  note: z.string().trim().max(500).optional(),
});

export async function recordPayment(formData: FormData) {
  const { supabase, profile } = await requireProfile("admin");
  const parsed = paymentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/payments?error=Please%20provide%20valid%20payment%20details.");
  const value = parsed.data;

  const { data, error } = await supabase
    .from("monthly_payments")
    .upsert(
      {
        user_id: value.user_id,
        payment_month: `${value.payment_month}-01`,
        amount_cents: Math.round(value.amount * 100),
        status: value.status,
        note: value.note || null,
        paid_at: value.status === "paid" ? new Date().toISOString() : null,
        created_by: profile.id,
      },
      { onConflict: "user_id,payment_month" },
    )
    .select("user_id, payment_month, amount_cents, status")
    .single();

  if (error) redirect(`/payments?error=${encodeURIComponent(error.message)}`);
  await queuePaymentEmail(supabase, data);
  revalidatePath("/payments");
  redirect("/payments?notice=Monthly%20payment%20saved.");
}

const paymentStatusSchema = z.object({
  payment_id: z.uuid(),
  status: z.enum(["due", "paid"]),
});

export async function updatePaymentStatus(formData: FormData) {
  const { supabase } = await requireProfile("admin");
  const parsed = paymentStatusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/payments?error=Please%20provide%20a%20valid%20payment%20status.");
  const value = parsed.data;

  const { data, error } = await supabase
    .from("monthly_payments")
    .update({
      status: value.status,
      paid_at: value.status === "paid" ? new Date().toISOString() : null,
    })
    .eq("id", value.payment_id)
    .select("user_id, payment_month, amount_cents, status")
    .single();

  if (error) redirect(`/payments?error=${encodeURIComponent(error.message)}`);
  await queuePaymentEmail(supabase, data);
  revalidatePath("/payments");
  redirect("/payments?notice=Payment%20status%20updated.");
}
