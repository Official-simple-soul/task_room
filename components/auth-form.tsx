'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { login, register, type AuthFormState } from '@/app/actions/auth';
import { buttonClass, cn, inputClass, labelClass } from '@/lib/styles';

type Mode = 'login' | 'register';
const showDevCredentials =
  process.env.NEXT_PUBLIC_SHOW_DEV_CREDENTIALS === 'true';

export function AuthForm() {
  const [mode, setMode] = useState<Mode>('login');
  const [loginState, loginAction] = useActionState<AuthFormState, FormData>(
    login,
    {},
  );
  const [registerState, registerAction] = useActionState<AuthFormState, FormData>(
    register,
    {},
  );

  return (
    <div className="rounded-[18px] border border-[#e2e8e3] bg-white p-[2.2rem] shadow-[0_14px_42px_rgb(22_34_29_/_6%)]">
      <div
        className="mb-8 flex border-b-2 border-[#e2e8e3]"
        role="tablist"
        aria-label="Authentication mode"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'login'}
          aria-controls="login-panel"
          className={cn(
            'relative bottom-[-2px] flex-1 cursor-pointer border-0 border-b-[3px] border-transparent bg-transparent py-4 text-[0.95rem] font-semibold text-[#68766e] transition hover:text-[#16221d]',
            mode === 'login' && 'border-b-[#11664b] text-[#11664b]',
          )}
          onClick={() => setMode('login')}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'register'}
          aria-controls="register-panel"
          className={cn(
            'relative bottom-[-2px] flex-1 cursor-pointer border-0 border-b-[3px] border-transparent bg-transparent py-4 text-[0.95rem] font-semibold text-[#68766e] transition hover:text-[#16221d]',
            mode === 'register' && 'border-b-[#11664b] text-[#11664b]',
          )}
          onClick={() => setMode('register')}
        >
          Create account
        </button>
      </div>
      {mode === 'login' ? (
        <form
          action={loginAction}
          className="grid gap-[1.3rem]"
          aria-label="Sign in"
          id="login-panel"
          role="tabpanel"
        >
          <label className={labelClass}>
            Email
            <input className={inputClass} name="email" type="email" required autoComplete="email" />
          </label>
          <label className={labelClass}>
            Password
            <input
              className={inputClass}
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </label>
          <AuthError message={loginState.error} />
          <SubmitButton label="Sign in" pendingLabel="Signing in..." />
        </form>
      ) : (
        <form
          action={registerAction}
          className="grid gap-[1.3rem]"
          aria-label="Create account"
          id="register-panel"
          role="tabpanel"
        >
          <label className={labelClass}>
            Full name
            <input
              className={inputClass}
              name="full_name"
              required
              minLength={2}
              autoComplete="name"
            />
          </label>
          <label className={labelClass}>
            Email
            <input className={inputClass} name="email" type="email" required autoComplete="email" />
          </label>
          <label className={labelClass}>
            Password
            <input
              className={inputClass}
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>
          <AuthError message={registerState.error} />
          <SubmitButton label="Create worker account" pendingLabel="Creating account..." />
        </form>
      )}
      {showDevCredentials && (
        <p className="mt-7 border-t border-[#e2e8e3] pt-[1.4rem] text-[0.85rem] leading-[1.8] text-[#68766e]">
          Local admin: <strong>admin@taskroom.local</strong> /{' '}
          <strong>Admin123!</strong>
          <br />
          Local user: <strong>user@taskroom.local</strong> /{' '}
          <strong>User123!</strong>
        </p>
      )}
    </div>
  );
}

function AuthError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p
      className="rounded-[10px] bg-[#fde9e9] px-4 py-3 text-[0.9rem] font-medium text-[#ae3939]"
      role="alert"
      aria-live="polite"
    >
      {message}
    </p>
  );
}

function SubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      className={cn(
        buttonClass,
        'mt-2.5 w-full',
        pending && 'cursor-not-allowed opacity-70 hover:translate-y-0 hover:bg-[#11664b]',
      )}
      type="submit"
      disabled={pending}
      aria-disabled={pending}
    >
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          {pendingLabel}
        </span>
      ) : (
        label
      )}
    </button>
  );
}
