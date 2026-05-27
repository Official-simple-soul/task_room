export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export const brandClass =
  'text-[1.35rem] font-[750] tracking-[-0.04em] text-[#11664b]';

export const buttonClass =
  'inline-flex w-fit cursor-pointer items-center justify-center rounded-[10px] border-0 bg-[#11664b] px-[1.3rem] py-[0.85rem] text-[0.95rem] font-semibold text-white transition hover:-translate-y-px hover:bg-[#0a513b] active:translate-y-0';

export const warningButtonClass =
  'inline-flex w-fit cursor-pointer items-center justify-center rounded-[10px] border-0 bg-[#fff3df] px-[1.3rem] py-[0.85rem] text-[0.95rem] font-semibold text-[#a56308] transition hover:-translate-y-px active:translate-y-0';

export const dangerButtonClass =
  'inline-flex w-fit cursor-pointer items-center justify-center rounded-[10px] border-0 bg-[#fde9e9] px-[1.3rem] py-[0.85rem] text-[0.95rem] font-semibold text-[#ae3939] transition hover:-translate-y-px active:translate-y-0';

export const textButtonClass =
  'cursor-pointer border-0 bg-transparent px-[0.9rem] py-[0.8rem] text-[#68766e]';

export const panelClass =
  'my-6 rounded-[14px] border border-[#eef2f0] bg-white p-[1.8rem] shadow-[0_2px_8px_rgba(22,34,29,0.04)]';

export const inputClass =
  'w-full rounded-[10px] border-[1.5px] border-[#d4ded8] bg-white px-[0.9rem] py-[0.82rem] text-[0.95rem] text-[#16221d] transition focus:border-[#11664b] focus:shadow-[0_0_0_3px_rgba(17,102,75,0.10)] focus:outline-none';

export const labelClass =
  'grid gap-[0.55rem] text-[0.9rem] font-[550] text-[#38473f]';

export const eyebrowClass =
  'mb-[0.55rem] text-[0.76rem] font-[650] uppercase tracking-[0.13em] text-[#11664b]';

export const pageTitleClass =
  'mb-[0.55rem] text-[clamp(2rem,4vw,2.5rem)] tracking-[-0.055em] text-[#16221d]';

export const pageSubtitleClass = 'm-0 max-w-[650px] leading-[1.6] text-[#68766e]';

export const tableClass = 'w-full border-collapse text-left text-[0.91rem]';

export const thClass =
  'border-b border-[#edf1ee] px-2.5 py-[0.85rem] text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-[#68766e] first:pl-0';

export const tdClass = 'border-b border-[#edf1ee] px-2.5 py-[0.85rem] first:pl-0';

export const emptyClass = 'py-3 text-[0.92rem] text-[#68766e]';

export const fieldGridClass =
  'grid grid-cols-1 items-end gap-4 md:grid-cols-3';

export const paymentGridClass =
  'grid grid-cols-1 items-end gap-4 lg:grid-cols-4';

export const taskGridClass =
  'grid grid-cols-1 gap-[1.3rem] md:grid-cols-[repeat(auto-fit,minmax(320px,1fr))]';

export const taskCardClass =
  'rounded-[22px] bg-[linear-gradient(180deg,#ffffff_0%,#f6fbf6_100%)] p-[1.8rem] shadow-[0_18px_44px_rgba(22,34,29,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_54px_rgba(22,34,29,0.11)]';

export const taskTitleClass =
  'grid grid-cols-[1fr_auto] items-start gap-[0.85rem]';

export const taskPromptClass =
  'my-[1.15rem] rounded-2xl bg-[#f8fbf7] p-[1rem_1.1rem] text-[0.95rem] leading-[1.7] text-[#394a40]';

export const taskMetaClass =
  'mb-4 grid grid-cols-2 gap-6 [&_dd]:mt-1.5 [&_dd]:font-bold [&_dt]:text-[0.78rem] [&_dt]:text-[#68766e]';

export const taskLinkClass =
  'inline-flex w-full items-center justify-between overflow-hidden rounded-[14px] bg-[#e9f4ec] px-4 py-[0.9rem] text-[0.9rem] text-[#11664b]';

export const hiddenUrlClass =
  'inline-flex w-full items-center justify-between overflow-hidden rounded-[14px] bg-[#f4f8f4] px-4 py-[0.9rem] text-[0.9rem] text-[#6a7b6f]';

export const commentClass =
  'my-4 mb-[0.9rem] grid gap-1.5 border-l-4 border-[#a56308] bg-[#fff3df] px-4 py-[0.9rem] text-[0.92rem] text-[#5e4826]';

export const actionsClass =
  'mt-5 flex flex-wrap justify-start gap-[0.85rem]';

export const statusBorderClass: Record<string, string> = {
  pending: 'border-l-[5px] border-l-[#f6b93e]',
  claimed: 'border-l-[5px] border-l-[#11664b]',
  rework: 'border-l-[5px] border-l-[#11664b]',
  approved: 'border-l-[5px] border-l-[#2f855a]',
  under_review: 'border-l-[5px] border-l-[#2d6fa8]',
  completed: 'border-l-[5px] border-l-[#2d6fa8]',
  rejected: 'border-l-[5px] border-l-[#ae3939]',
};
