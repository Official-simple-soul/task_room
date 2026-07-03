'use client';

import { useState } from 'react';
import { inputClass } from '@/lib/styles';

export function PasswordInput({
  name,
  autoComplete,
  minLength,
  placeholder,
}: {
  name: string;
  autoComplete: string;
  minLength?: number;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        className={`${inputClass} pr-20`}
        name={name}
        type={visible ? 'text' : 'password'}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-md px-2 py-1 text-[0.78rem] font-semibold text-[#11664b] transition hover:bg-[#e7f3ed] dark:text-[#10b981] dark:hover:bg-[#12281e]"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
      >
        {visible ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}
