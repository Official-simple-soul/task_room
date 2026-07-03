export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export const brandClass =
  'text-[1.35rem] font-[800] tracking-[-0.05em] text-[#11664b] dark:text-[#10b981] drop-shadow-[0_2px_8px_rgba(16,185,129,0.15)] transition-all duration-300';

export const buttonClass =
  'inline-flex w-fit cursor-pointer items-center justify-center rounded-xl border border-transparent bg-[#11664b] px-[1.3rem] py-[0.82rem] text-[0.95rem] font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0e523c] hover:shadow-[0_8px_20px_rgba(17,102,75,0.25)] active:translate-y-0 dark:bg-[#10b981] dark:text-[#060a08] dark:hover:bg-[#34d399] dark:hover:shadow-[0_8px_20px_rgba(16,185,129,0.3)]';

export const secondaryButtonClass =
  'inline-flex w-fit cursor-pointer items-center justify-center rounded-xl border border-[#d4ded8] bg-white px-[1rem] py-[0.8rem] text-[0.95rem] font-semibold text-[#11664b] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#98b8a8] hover:bg-[#f6fbf7] active:translate-y-0 dark:border-[#222c26] dark:bg-[#131b17] dark:text-[#10b981] dark:hover:border-[#2e3d34] dark:hover:bg-[#1a2520]';

export const warningButtonClass =
  'inline-flex w-fit cursor-pointer items-center justify-center rounded-xl border border-[#ffd599]/20 bg-[#fff3df] px-[1.3rem] py-[0.82rem] text-[0.95rem] font-semibold text-[#a56308] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ffeac7] active:translate-y-0 dark:border-[#ff9800]/20 dark:bg-[#2c1d0f] dark:text-[#ffb74d] dark:hover:bg-[#3c2a17]';

export const dangerButtonClass =
  'inline-flex w-fit cursor-pointer items-center justify-center rounded-xl border border-[#fca5a5]/20 bg-[#fde9e9] px-[1.3rem] py-[0.82rem] text-[0.95rem] font-semibold text-[#ae3939] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#fbd5d5] active:translate-y-0 dark:border-[#ef4444]/20 dark:bg-[#2c0f0f] dark:text-[#fca5a5] dark:hover:bg-[#3c1717]';

export const textButtonClass =
  'cursor-pointer border-0 bg-transparent px-[0.9rem] py-[0.8rem] text-[#68766e] transition-all duration-300 hover:text-[#11664b] dark:text-[#8da398] dark:hover:text-[#10b981]';

export const panelClass =
  'my-6 rounded-2xl border border-[#eef2f0] bg-white p-[1.8rem] shadow-[0_4px_20px_rgba(22,34,29,0.02)] transition-all duration-300 hover:shadow-[0_10px_30px_rgba(22,34,29,0.04)] dark:border-[#1d2721] dark:bg-[#0f1512]/90 dark:backdrop-blur-md dark:shadow-[0_4px_30px_rgba(0,0,0,0.2)]';

export const inputClass =
  'w-full rounded-xl border-[1.5px] border-[#d4ded8] bg-white px-[0.9rem] py-[0.8rem] text-[0.95rem] text-[#16221d] transition-all duration-200 focus:border-[#11664b] focus:shadow-[0_0_0_3px_rgba(17,102,75,0.08)] focus:outline-none dark:border-[#222c26] dark:bg-[#131b17] dark:text-[#ecf2ee] dark:focus:border-[#10b981] dark:focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)]';

export const labelClass =
  'grid gap-[0.55rem] text-[0.9rem] font-[550] text-[#38473f] dark:text-[#a4b8ad]';

export const eyebrowClass =
  'mb-[0.55rem] text-[0.76rem] font-[650] uppercase tracking-[0.13em] text-[#11664b] dark:text-[#10b981] drop-shadow-[0_2px_8px_rgba(16,185,129,0.1)]';

export const pageTitleClass =
  'mb-[0.55rem] text-[clamp(2rem,4vw,2.5rem)] tracking-[-0.055em] text-[#16221d] dark:text-[#ecf2ee] font-semibold';

export const pageSubtitleClass =
  'm-0 max-w-[650px] leading-[1.6] text-[#68766e] dark:text-[#8da398]';

export const tableClass = 'w-full border-collapse text-left text-[0.91rem] text-[#16221d] dark:text-[#ecf2ee]';

export const thClass =
  'border-b border-[#edf1ee] px-2.5 py-[0.85rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#68766e] dark:border-[#222c26] dark:text-[#8da398] first:pl-0';

export const tdClass =
  'border-b border-[#edf1ee] px-2.5 py-[0.85rem] first:pl-0 dark:border-[#222c26]';

export const emptyClass = 'py-3 text-[0.92rem] text-[#68766e] dark:text-[#8da398]';

export const fieldGridClass = 'grid grid-cols-1 items-end gap-4 md:grid-cols-3';

export const paymentGridClass =
  'grid grid-cols-1 items-end gap-4 lg:grid-cols-4';

export const taskGridClass = 'grid grid-cols-1 gap-[1.3rem]';

export const taskCardClass =
  'rounded-2xl border border-[#edf1ee] bg-[linear-gradient(180deg,#ffffff_0%,#f6fbf6_100%)] p-[1.8rem] shadow-[0_10px_30px_rgba(22,34,29,0.04)] transition-all duration-350 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(22,34,29,0.08)] dark:border-[#1d2721] dark:bg-[linear-gradient(180deg,#0f1512_0%,#131a16_100%)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_20px_45px_rgba(0,0,0,0.45)]';

export const taskTitleClass =
  'grid grid-cols-[auto_1fr_auto] items-start gap-[0.85rem]';

export const taskPromptClass =
  'my-[1.15rem] rounded-2xl bg-[#f8fbf7] p-[1rem_1.1rem] text-[0.95rem] leading-[1.7] text-[#394a40] dark:bg-[#161d19] dark:text-[#a4b8ad] border border-transparent dark:border-[#222c26]';

export const taskMetaClass =
  'mb-4 grid grid-cols-2 gap-6 sm:grid-cols-3 [&_dd]:mt-1.5 [&_dd]:font-bold [&_dd]:text-[#16221d] dark:[&_dd]:text-[#ecf2ee] [&_dt]:text-[0.78rem] [&_dt]:text-[#68766e] dark:[&_dt]:text-[#8da398]';

export const taskLinkClass =
  'inline-flex w-full items-center justify-between overflow-hidden rounded-xl bg-[#e9f4ec] px-4 py-[0.9rem] text-[0.9rem] font-semibold text-[#11664b] transition-all duration-350 hover:bg-[#def0e3] dark:bg-[#12281e] dark:text-[#10b981] dark:hover:bg-[#173527]';

export const hiddenUrlClass =
  'inline-flex w-full items-center justify-between overflow-hidden rounded-xl bg-[#f4f8f4] px-4 py-[0.9rem] text-[0.9rem] text-[#6a7b6f] border border-[#d4ded8] dark:bg-[#131b17] dark:text-[#8da398] dark:border-[#222c26]';

export const commentClass =
  'my-4 mb-[0.9rem] grid gap-1.5 border-l-4 border-amber-500 bg-amber-500/10 px-4 py-[0.9rem] text-[0.92rem] text-[#5e4826] dark:text-amber-200 border-l-[#a56308] dark:border-l-amber-500 rounded-r-xl';

export const actionsClass = 'mt-5 flex flex-wrap justify-start gap-[0.85rem]';

export const statusBorderClass: Record<string, string> = {
  pending: 'border-l-[5px] border-l-[#f6b93e]',
  claimed: 'border-l-[5px] border-l-[#11664b] dark:border-[#10b981]',
  rework: 'border-l-[5px] border-l-[#11664b] dark:border-[#10b981]',
  approved: 'border-l-[5px] border-l-[#2f855a] dark:border-[#10b981]',
  under_review: 'border-l-[5px] border-l-[#2d6fa8]',
  completed: 'border-l-[5px] border-l-[#2d6fa8]',
  rejected: 'border-l-[5px] border-l-[#ae3939]',
};
