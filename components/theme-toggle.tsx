'use client';

import { useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from './icons';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const isLight = document.documentElement.classList.contains('light');
    setTheme(isLight ? 'light' : 'dark');
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);

    if (nextTheme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
  };

  if (!mounted) {
    return (
      <div className="h-10 w-full rounded-xl bg-[#e7f3ed]/20 dark:bg-[#131b17]/50 animate-pulse border border-transparent dark:border-[#222c26]/50" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#d4ded8] bg-white px-4 py-2.5 text-[0.92rem] font-semibold text-[#11664b] shadow-sm transition-all duration-300 hover:-translate-y-px hover:border-[#98b8a8] hover:bg-[#f6fbf7] active:translate-y-0 dark:border-[#222c26] dark:bg-[#131b17] dark:text-[#ecf2ee] dark:hover:bg-[#1a2520] dark:hover:border-[#2e3d34] dark:hover:text-[#10b981] dark:shadow-none"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span className="flex items-center gap-2.5">
        {theme === 'dark' ? (
          <SunIcon className="size-4.5 text-amber-500 transition-transform duration-500 hover:rotate-45" />
        ) : (
          <MoonIcon className="size-4.5 text-indigo-600 transition-transform duration-500 hover:-rotate-12" />
        )}
        <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
      </span>
    </button>
  );
}
