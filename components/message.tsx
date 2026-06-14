'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CheckIcon, XCircleIcon } from '@/components/icons';

export function Message({
  notice,
  error,
}: {
  notice?: string;
  error?: string;
}) {
  const message = notice ?? error;
  const isError = Boolean(error);

  if (!message) return null;

  return <MessageToast key={`${isError ? 'error' : 'notice'}:${message}`} message={message} isError={isError} />;
}

function MessageToast({
  message,
  isError,
}: {
  message: string;
  isError: boolean;
}) {
  const [visible, setVisible] = useState(Boolean(message));
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const cleanedUrl = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('notice');
    params.delete('error');
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(false);
      router.replace(cleanedUrl, { scroll: false });
    }, isError ? 7000 : 4500);

    return () => window.clearTimeout(timer);
  }, [cleanedUrl, isError, message, router]);

  if (!visible) return null;

  const close = () => {
    setVisible(false);
    router.replace(cleanedUrl, { scroll: false });
  };

  return (
    <div
      className={`fixed right-4 top-4 z-50 w-[min(calc(100%-2rem),24rem)] overflow-hidden rounded-3xl border px-4 pb-4 pt-3 text-sm shadow-[0_18px_50px_rgba(22,34,29,0.16)] ${
        isError
          ? 'border-[#f3b8b8] bg-[#fff3f3] text-[#7d2424]'
          : 'border-[#bfe1cc] bg-[#eff9f0] text-[#13462f]'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3 pr-8">
        <span
          className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl ${
            isError ? 'bg-[#fbe0e0] text-[#ae3939]' : 'bg-[#ddf2dd] text-[#11664b]'
          }`}
        >
          {isError ? (
            <XCircleIcon className="h-5 w-5" />
          ) : (
            <CheckIcon className="h-5 w-5" />
          )}
        </span>
        <div className="min-w-0">
          <p className="mb-1 text-sm font-semibold tracking-[-0.02em]">
            {isError ? 'Error' : 'Success'}
          </p>
          <p className="whitespace-pre-wrap text-[0.92rem] leading-5">
            {message}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={close}
        className="absolute right-3 top-3 rounded-full p-1.5 opacity-70 transition hover:bg-black/5 hover:opacity-100"
        aria-label="Close notification"
      >
        <XCircleIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
