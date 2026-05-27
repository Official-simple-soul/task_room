'use client';

import { useState } from 'react';
import { login, register } from '@/app/actions/auth';
import { buttonClass, cn, inputClass, labelClass } from '@/lib/styles';

type Mode = 'login' | 'register';

export function AuthForm() {
  const [mode, setMode] = useState<Mode>('login');

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
          action={login}
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
          <button className={`${buttonClass} mt-2.5 w-full`} type="submit">
            Sign in
          </button>
        </form>
      ) : (
        <form
          action={register}
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
          <button className={`${buttonClass} mt-2.5 w-full`} type="submit">
            Create worker account
          </button>
        </form>
      )}
      <p className="mt-7 border-t border-[#e2e8e3] pt-[1.4rem] text-[0.85rem] leading-[1.8] text-[#68766e]">
        Local admin: <strong>admin@taskroom.local</strong> /{' '}
        <strong>Admin123!</strong>
        <br />
        Local user: <strong>user@taskroom.local</strong> /{' '}
        <strong>User123!</strong>
      </p>
    </div>
  );
}
