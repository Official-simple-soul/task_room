'use client';

import { useFormStatus } from 'react-dom';
import { buttonClass, cn } from '@/lib/styles';

export function SubmitButton({
  label,
  pendingLabel,
  className,
}: {
  label: string;
  pendingLabel: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      className={cn(
        buttonClass,
        className,
        pending &&
          'cursor-not-allowed opacity-70 hover:translate-y-0 hover:bg-[#11664b]',
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
