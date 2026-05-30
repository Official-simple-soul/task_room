'use client';

import { ButtonHTMLAttributes } from 'react';
import { useFormStatus } from 'react-dom';
import { buttonClass, cn } from '@/lib/styles';

export function SubmitButton({
  label,
  pendingLabel,
  baseClassName = buttonClass,
  className,
  disabled,
  type,
  ...props
}: {
  label: string;
  pendingLabel: string;
  baseClassName?: string;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <button
      className={cn(
        baseClassName,
        className,
        isDisabled && 'cursor-not-allowed opacity-70 hover:translate-y-0',
      )}
      type={type ?? 'submit'}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      {...props}
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
