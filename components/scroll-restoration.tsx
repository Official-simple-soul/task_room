'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const storageKey = 'taskroom:form-scroll';

type StoredScroll = {
  pathname: string;
  scrollY: number;
  createdAt: number;
};

export function FormScrollRestoration() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    window.history.scrollRestoration = 'manual';

    function rememberScroll(event: SubmitEvent) {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;

      sessionStorage.setItem(
        storageKey,
        JSON.stringify({
          pathname: window.location.pathname,
          scrollY: window.scrollY,
          createdAt: Date.now(),
        } satisfies StoredScroll),
      );
    }

    document.addEventListener('submit', rememberScroll, true);
    return () => document.removeEventListener('submit', rememberScroll, true);
  }, []);

  useEffect(() => {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return;

    try {
      const stored = JSON.parse(raw) as StoredScroll;
      const fresh = Date.now() - stored.createdAt < 15000;

      if (fresh && stored.pathname === pathname) {
        window.requestAnimationFrame(() => {
          window.scrollTo({ top: stored.scrollY, behavior: 'instant' });
          sessionStorage.removeItem(storageKey);
        });
      } else {
        sessionStorage.removeItem(storageKey);
      }
    } catch {
      sessionStorage.removeItem(storageKey);
    }
  }, [pathname, searchParams]);

  return null;
}
