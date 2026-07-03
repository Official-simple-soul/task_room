'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { login, register, type AuthFormState } from '@/app/actions/auth';
import { FormFeedback } from '@/components/form-feedback';
import { PasswordInput } from '@/components/password-input';
import { SubmitButton } from '@/components/submit-button';
import { cn, inputClass, labelClass } from '@/lib/styles';

type Mode = 'login' | 'register';
const showDevCredentials =
  process.env.NEXT_PUBLIC_SHOW_DEV_CREDENTIALS === 'true';

export function AuthForm() {
  const [mode, setMode] = useState<Mode>('login');
  const [loginState, loginAction] = useActionState<AuthFormState, FormData>(
    login,
    {},
  );
  const [registerState, registerAction] = useActionState<
    AuthFormState,
    FormData
  >(register, {});

  return (
    <div className="rounded-[18px] border border-[#e2e8e3] bg-white p-[2.2rem] shadow-[0_14px_42px_rgb(22_34_29_/_6%)] dark:border-[#1d2721] dark:bg-[#0f1512]/90 dark:backdrop-blur-md dark:shadow-[0_14px_42px_rgba(0,0,0,0.3)]">
      <div
        className="mb-8 flex border-b-2 border-[#e2e8e3] dark:border-[#1d2721]"
        role="tablist"
        aria-label="Authentication mode"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'login'}
          aria-controls="login-panel"
          className={cn(
            'relative bottom-[-2px] flex-1 cursor-pointer border-0 border-b-[3px] border-transparent bg-transparent py-4 text-[0.95rem] font-semibold text-[#68766e] transition hover:text-[#16221d] dark:text-[#8da398] dark:hover:text-[#ecf2ee]',
            mode === 'login' && 'border-b-[#11664b] text-[#11664b] dark:border-b-[#10b981] dark:text-[#10b981]',
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
            'relative bottom-[-2px] flex-1 cursor-pointer border-0 border-b-[3px] border-transparent bg-transparent py-4 text-[0.95rem] font-semibold text-[#68766e] transition hover:text-[#16221d] dark:text-[#8da398] dark:hover:text-[#ecf2ee]',
            mode === 'register' && 'border-b-[#11664b] text-[#11664b] dark:border-b-[#10b981] dark:text-[#10b981]',
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
            <input
              className={inputClass}
              name="email"
              type="email"
              required
              autoComplete="email"
            />
          </label>
          <label className={labelClass}>
            Password
            <PasswordInput
              name="password"
              autoComplete="current-password"
            />
          </label>
          <div className="-mt-2 flex justify-end">
            <Link
              href="/forgot-password"
              className="text-[0.86rem] font-semibold text-[#11664b] hover:underline dark:text-[#10b981]"
            >
              Forgot password?
            </Link>
          </div>
          <FormFeedback error={loginState.error} />
          <SubmitButton label="Sign in" pendingLabel="Signing in..." className="mt-2.5 w-full" />
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
            <input
              className={inputClass}
              name="email"
              type="email"
              required
              autoComplete="email"
            />
          </label>
          <label className={labelClass}>
            Password
            <PasswordInput
              name="password"
              autoComplete="new-password"
              minLength={8}
            />
          </label>
          <FormFeedback error={registerState.error} />
          <SubmitButton
            label="Create worker account"
            pendingLabel="Creating account..."
            className="mt-2.5 w-full"
          />
        </form>
      )}
      {showDevCredentials && (
        <p className="mt-7 border-t border-[#e2e8e3] pt-[1.4rem] text-[0.85rem] leading-[1.8] text-[#68766e] dark:border-[#1d2721] dark:text-[#8da398]">
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
