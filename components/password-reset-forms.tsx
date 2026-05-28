'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import {
  changePassword,
  requestPasswordReset,
  resetPassword,
  type AuthFormState,
} from '@/app/actions/auth';
import { FormFeedback } from '@/components/form-feedback';
import { PasswordInput } from '@/components/password-input';
import { SubmitButton } from '@/components/submit-button';
import { inputClass, labelClass } from '@/lib/styles';

export function ForgotPasswordForm() {
  const [state, action] = useActionState<AuthFormState, FormData>(
    requestPasswordReset,
    {},
  );

  return (
    <form action={action} className="grid gap-[1.3rem]">
      <label className={labelClass}>
        Email address
        <input
          className={inputClass}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
      </label>
      <FormFeedback error={state.error} success={state.success} />
      <SubmitButton
        label="Send reset link"
        pendingLabel="Sending reset link..."
        className="mt-2.5 w-full"
      />
      <Link
        href="/login"
        className="text-center text-[0.9rem] font-semibold text-[#11664b] hover:underline"
      >
        Back to sign in
      </Link>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action] = useActionState<AuthFormState, FormData>(
    resetPassword,
    {},
  );

  return (
    <form action={action} className="grid gap-[1.3rem]">
      <PasswordFields />
      <FormFeedback error={state.error} success={state.success} />
      <SubmitButton
        label="Update password"
        pendingLabel="Updating password..."
        className="mt-2.5 w-full"
      />
      {state.success && (
        <Link
          href="/login"
          className="text-center text-[0.9rem] font-semibold text-[#11664b] hover:underline"
        >
          Go to sign in
        </Link>
      )}
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, action] = useActionState<AuthFormState, FormData>(
    changePassword,
    {},
  );

  return (
    <form action={action} className="grid max-w-xl gap-[1.3rem]">
      <PasswordFields />
      <FormFeedback error={state.error} success={state.success} />
      <SubmitButton
        label="Change password"
        pendingLabel="Changing password..."
        className="mt-2.5"
      />
    </form>
  );
}

function PasswordFields() {
  return (
    <>
      <label className={labelClass}>
        New password
        <PasswordInput
          name="password"
          autoComplete="new-password"
          minLength={8}
          placeholder="At least 8 characters"
        />
      </label>
      <label className={labelClass}>
        Confirm new password
        <PasswordInput
          name="confirm_password"
          autoComplete="new-password"
          minLength={8}
          placeholder="Repeat password"
        />
      </label>
    </>
  );
}
