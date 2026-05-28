import { ForgotPasswordForm } from '@/components/password-reset-forms';

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-[520px] items-center px-8 py-12">
      <section className="rounded-[18px] border border-[#e2e8e3] bg-white p-[2.2rem] shadow-[0_14px_42px_rgb(22_34_29_/_6%)]">
        <h1 className="mb-3 text-[2rem] font-bold tracking-[-0.055em] text-[#16221d]">
          Reset your password
        </h1>
        <p className="mb-8 leading-[1.6] text-[#68766e]">
          Enter your account email and we will send a secure password reset
          link.
        </p>
        <ForgotPasswordForm />
      </section>
    </main>
  );
}
