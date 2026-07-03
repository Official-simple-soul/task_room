import { AuthForm } from '@/components/auth-form';

export default function LoginPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-[1140px] items-center gap-[clamp(3rem,10vw,9rem)] px-8 py-12 lg:grid-cols-[minmax(340px,1fr)_minmax(380px,480px)]">
      <section className="mb-10 lg:mb-0">
        <h1 className="my-7 mb-4 max-w-[590px] text-[clamp(2.7rem,5vw,4.25rem)] leading-[1.04] tracking-[-0.07em]">
          Focused work, accountable review.
        </h1>
        <p className="max-w-[510px] text-[1.08rem] leading-[1.7] text-[#68766e] dark:text-[#8da398]">
          Claim assigned tasks, submit completed work, and track approvals and
          earnings in one secure workspace.
        </p>
      </section>
      <section className="grid gap-4">
        <AuthForm />
      </section>
    </main>
  );
}
