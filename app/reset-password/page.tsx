import { redirect } from 'next/navigation';
import { ResetPasswordForm } from '@/components/password-reset-forms';
import { createClient } from '@/lib/supabase/server';

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/forgot-password');

  return (
    <main className="mx-auto grid min-h-screen max-w-[520px] items-center px-8 py-12">
      <section className="rounded-[18px] border border-[#e2e8e3] bg-white p-[2.2rem] shadow-[0_14px_42px_rgb(22_34_29_/_6%)]">
        <h1 className="mb-3 text-[2rem] font-bold tracking-[-0.055em] text-[#16221d]">
          Choose a new password
        </h1>
        <p className="mb-8 leading-[1.6] text-[#68766e]">
          Enter a new password for your TaskRoom account.
        </p>
        <ResetPasswordForm />
      </section>
    </main>
  );
}
