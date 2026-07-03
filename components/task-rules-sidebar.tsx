'use client';

import { useState } from 'react';
import {
  AlertIcon,
  CheckIcon,
  ClipboardIcon,
  ClockIcon,
  XCircleIcon,
} from '@/components/icons';
import { cn } from '@/lib/styles';

const guidelines = [
  {
    title: 'Capture screenshots at the correct moment',
    body: 'The start screenshot must show the state before the event happens. The end screenshot must show the result after the event has happened.',
  },
  {
    title: 'Run the code or tests after changes',
    body: 'Always verify your work by running the relevant command, test, build, or lint check after making changes.',
  },
  {
    title: 'Push the repository only when required',
    body: 'If the task specifically requires a remote repository, push it before submitting. If a remote is not requested, this step is optional.',
  },
  {
    title: 'Review every event before submitting',
    body: 'Go through all recorded events and make sure each one is addressed, accurate, and complete.',
  },
  {
    title: 'Create executable Express apps',
    body: 'An Express server should not be only a single loose file. Include the expected project structure, such as package.json, dependencies, and source folders or files so the app can run correctly.',
  },
  {
    title: 'Keep Enter key timestamps aligned',
    body: 'For Enter key events, the start and end timestamps should be the same.',
  },
  {
    title: 'Avoid long pauses in recordings',
    body: 'If you need a break or lose your place, use the pause hotkey instead of leaving a long silent gap in the video or event stream.',
  },
  {
    title: 'Write prompts with enough context',
    body: 'The prompt should contain the details the agent needs to complete the task without guessing.',
  },
  {
    title: 'Keep execution technically correct',
    body: 'The order of execution, code quality, and implementation choices should be realistic and technically sound.',
  },
  {
    title: 'Avoid PII and typos',
    body: 'Do not include personal information, sensitive data, or avoidable typographical errors.',
  },
  {
    title: 'Do not ask for intentional bugs',
    body: 'Avoid prompts that ask the agent to write code and deliberately introduce issues. That is not realistic task behavior.',
  },
  {
    title: 'Avoid public repos or organizations',
    body: 'Do not create public repositories, organizations, or similar public resources unless the task explicitly requires it and it is safe to do so.',
  },
  {
    title: 'Stay under the event cap',
    body: 'Avoid creating more than 200 events. The cap is 200.',
  },
  {
    title: 'Do not rely on another LLM',
    body: 'Avoid prompts that ask the agent to use GitHub Copilot or another LLM to write the code. The agent should be able to complete the user request directly.',
  },
];

const examples = [
  {
    title: 'Typing event example',
    before: 'Start: the terminal input is empty and ready for typing.',
    after: 'End: the full command, such as pnpm run lint, is visible after typing.',
  },
  {
    title: 'Click event example',
    before: 'Start: the cursor is positioned on the UI element before clicking.',
    after: 'End: the click has happened and the expected UI change is visible.',
  },
];

export function TaskRulesSidebar() {
  const [open, setOpen] = useState(true);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'fixed right-4 top-24 z-40 inline-flex items-center gap-2 rounded-full border border-[#d9e8df] bg-white px-4 py-2.5 text-[0.88rem] font-bold text-[#11664b] shadow-[0_10px_30px_rgba(22,34,29,0.08)] transition hover:-translate-y-px hover:border-[#11664b] dark:border-[#222c26] dark:bg-[#131b17] dark:text-[#10b981] dark:shadow-none dark:hover:border-[#10b981]',
          open && 'pointer-events-none opacity-0',
        )}
      >
        <ClipboardIcon className="h-4 w-4" />
        Task rules
      </button>

      <aside
        className={cn(
          'fixed bottom-4 right-4 top-4 z-40 flex w-[min(430px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[24px] border border-[#dbe9e1] bg-white shadow-[0_28px_80px_rgba(22,34,29,0.15)] transition duration-300 dark:border-[#222c26] dark:bg-[#0f1512] dark:shadow-[0_28px_80px_rgba(0,0,0,0.4)]',
          open
            ? 'translate-x-0 opacity-100'
            : 'pointer-events-none translate-x-[calc(100%+2rem)] opacity-0',
        )}
        aria-label="Task completion rules"
      >
        <div className="border-b border-[#edf1ee] dark:border-[#222c26] bg-[radial-gradient(circle_at_top_right,rgba(22,164,102,0.22),transparent_34%),linear-gradient(135deg,#0f5f46,#163228)] dark:bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_40%),linear-gradient(135deg,#0d4332,#091a14)] p-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <ClipboardIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-white/65">
                  Task guide
                </p>
                <h2 className="m-0 mt-1 text-[1.35rem] font-bold tracking-[-0.04em]">
                  Rules for quality submissions
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full bg-white/12 p-2 text-white transition hover:bg-white/20"
              aria-label="Close task rules"
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-4 text-[0.92rem] leading-6 text-white/78">
            Use this as your checklist before submitting. Clean screenshots,
            realistic prompts, and verified code make reviews faster.
          </p>
        </div>

        <div className="overflow-y-auto p-5">
          <section className="mb-5 rounded-2xl border border-[#dcebe2] bg-[#f7fbf8] p-4 dark:border-[#222c26] dark:bg-[#161d19]">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e7f3ed] text-[#11664b] dark:bg-[#10b981]/15 dark:text-[#10b981]">
                <ClockIcon className="h-4 w-4" />
              </span>
              <h3 className="m-0 text-[0.98rem] font-bold text-[#16221d] dark:text-[#ecf2ee]">
                Screenshot timing examples
              </h3>
            </div>
            <div className="grid gap-3">
              {examples.map((example) => (
                <div
                  key={example.title}
                  className="rounded-xl border border-[#edf1ee] bg-white p-3 dark:border-[#222c26] dark:bg-[#0f1512]"
                >
                  <p className="m-0 text-[0.9rem] font-bold text-[#11664b] dark:text-[#10b981]">
                    {example.title}
                  </p>
                  <div className="mt-3 grid gap-2">
                    <p className="m-0 rounded-xl bg-[#fff8ea] px-3 py-2 text-[0.84rem] leading-5 text-[#6a4a12] dark:bg-[#ff9800]/10 dark:text-amber-200">
                      <strong className="dark:text-amber-400">Before:</strong> {example.before}
                    </p>
                    <p className="m-0 rounded-xl bg-[#e9f4ec] px-3 py-2 text-[0.84rem] leading-5 text-[#11664b] dark:bg-[#10b981]/10 dark:text-[#10b981]">
                      <strong className="dark:text-[#10b981]">After:</strong> {example.after}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-3">
            {guidelines.map((item, index) => (
              <article
                key={item.title}
                className="grid grid-cols-[auto_1fr] gap-3 rounded-xl border border-[#edf1ee] bg-white p-3 shadow-[0_10px_26px_rgba(22,34,29,0.02)] dark:border-[#222c26] dark:bg-[#131b17] dark:shadow-none"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e7f3ed] text-[0.82rem] font-bold text-[#11664b] dark:bg-[#10b981]/15 dark:text-[#10b981]">
                  {index + 1}
                </span>
                <div>
                  <h3 className="m-0 flex items-center gap-2 text-[0.92rem] font-bold text-[#16221d] dark:text-[#ecf2ee]">
                    {index < 4 ? (
                      <CheckIcon className="h-4 w-4 text-[#11664b] dark:text-[#10b981]" />
                    ) : index > 8 ? (
                      <AlertIcon className="h-4 w-4 text-[#a56308] dark:text-amber-500" />
                    ) : null}
                    {item.title}
                  </h3>
                  <p className="m-0 mt-1.5 text-[0.84rem] leading-5 text-[#5b6b61] dark:text-[#8da398]">
                    {item.body}
                  </p>
                </div>
              </article>
            ))}
          </section>
        </div>
      </aside>
    </>
  );
}
