'use client';

import { useState } from 'react';
import { CopyIcon } from '@/components/icons';
import { taskPromptClass } from '@/lib/styles';

export function TaskPrompt({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);

  async function copyPrompt() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className={`${taskPromptClass} relative pr-14`}>
      <p className="m-0 whitespace-pre-wrap">{prompt}</p>
      <button
        type="button"
        onClick={copyPrompt}
        className="absolute right-3 top-3 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[rgba(17,102,75,0.12)] bg-white text-[#11664b] shadow-[0_8px_18px_rgba(22,34,29,0.06)] transition hover:-translate-y-px hover:bg-[#e7f3ed]"
        aria-label="Copy task prompt"
        title={copied ? 'Copied' : 'Copy prompt'}
      >
        <CopyIcon className="h-4 w-4" />
      </button>
      {copied && (
        <span className="absolute right-3 top-12 rounded-full bg-[#11664b] px-2.5 py-1 text-[0.72rem] font-semibold text-white shadow-sm">
          Copied
        </span>
      )}
    </div>
  );
}
