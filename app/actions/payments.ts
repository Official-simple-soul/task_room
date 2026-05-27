"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireProfile } from "@/lib/auth";

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

  const { error } = await supabase.from("monthly_payments").upsert(
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
  );

  if (error) redirect(`/payments?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/payments");
  redirect("/payments?notice=Monthly%20payment%20saved.");
}
