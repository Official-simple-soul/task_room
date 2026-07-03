'use client';

import { useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/styles';

export function FilterSubmitButton({
  label,
  pendingLabel,
  className,
}: {
  label: string;
  pendingLabel: string;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <button
      type="submit"
      disabled={isPending}
      aria-disabled={isPending}
      className={cn(className, isPending && 'cursor-not-allowed opacity-70')}
      onClick={(event) => {
        const form = event.currentTarget.form;
        if (!form) return;
        event.preventDefault();

        const params = new URLSearchParams();
        for (const [key, value] of new FormData(form).entries()) {
          if (typeof value === 'string' && value) params.set(key, value);
        }

        startTransition(() => {
          const query = params.toString();
          router.push(query ? `${pathname}?${query}` : pathname);
        });
      }}
    >
      {isPending ? (
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
