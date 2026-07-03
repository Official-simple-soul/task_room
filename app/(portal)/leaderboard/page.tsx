import Link from 'next/link';
import {
  CheckIcon,
  ClockIcon,
  MedalIcon,
  TrophyIcon,
} from '@/components/icons';
import { PageHeader } from '@/components/page-header';
import { requireProfile } from '@/lib/auth';
import { money } from '@/lib/format';
import { cn, panelClass } from '@/lib/styles';
import type { LeaderboardEntry, LeaderboardPeriod } from '@/lib/types';

const periods: Array<{
  value: LeaderboardPeriod;
  label: string;
  headline: string;
}> = [
  { value: 'day', label: 'Today', headline: 'Leaderboard today' },
  { value: 'week', label: 'This week', headline: 'Leaderboard this week' },
  { value: 'month', label: 'This month', headline: 'Leaderboard this month' },
  {
    value: 'last_month',
    label: 'Last month',
    headline: 'Leaderboard last month',
  },
  { value: 'all', label: 'All time', headline: 'Leaderboard all time' },
];

function parsePeriod(value?: string): LeaderboardPeriod {
  return value === 'day' ||
    value === 'month' ||
    value === 'last_month' ||
    value === 'all'
    ? value
    : 'week';
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period } = await searchParams;
  const activePeriod = parsePeriod(period);
  const activePeriodMeta = periods.find((item) => item.value === activePeriod)!;
  const { supabase } = await requireProfile();
  const { data } = await supabase.rpc('get_leaderboard', {
    p_period: activePeriod,
  });
  const entries = ((data ?? []) as LeaderboardEntry[]).map((entry) => ({
    ...entry,
    rank: Number(entry.rank),
    completed_count: Number(entry.completed_count),
    approved_count: Number(entry.approved_count),
    earned_cents: Number(entry.earned_cents),
  }));
  const topThree = entries.slice(0, 3);
  const remaining = entries.slice(3);
  const totalCompleted = entries.reduce(
    (sum, entry) => sum + entry.completed_count,
    0,
  );

  return (
    <>
      <PageHeader
        eyebrow="Performance"
        title={activePeriodMeta.headline}
        subtitle="A motivating ranking of completed task volume using each worker's second name."
        icon={<TrophyIcon className="h-5 w-5" />}
      />

      <section className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#edf3ef] bg-[linear-gradient(135deg,#e7f3ed_0%,rgba(255,255,255,0.85)_100%)] dark:border-[#1d2721] dark:bg-[linear-gradient(135deg,#13281f_0%,rgba(15,21,18,0.4)_100%)] p-5 shadow-[0_10px_30px_rgba(22,34,29,0.02)] lg:flex-row lg:items-center lg:justify-between transition-all duration-300">
        <div>
          <p className="m-0 text-[0.78rem] font-bold uppercase tracking-[0.13em] text-[#11664b] dark:text-[#10b981]">
            Worker leaderboard
          </p>
          <h2 className="mt-2 text-[1.35rem] font-bold tracking-[-0.04em] text-[#16221d] dark:text-[#ecf2ee]">
            {totalCompleted} completed tasks
            {activePeriod === 'all' ? ' overall' : ' in this period'}
          </h2>
        </div>
        <nav className="flex flex-wrap gap-2" aria-label="Leaderboard period">
          {periods.map((item) => (
            <Link
              key={item.value}
              href={`/leaderboard?period=${item.value}`}
              className={cn(
                'rounded-full border px-4 py-2 text-[0.88rem] font-semibold transition hover:-translate-y-px',
                activePeriod === item.value
                  ? 'border-[#11664b] bg-[#11664b] text-white shadow-sm dark:border-[#10b981] dark:bg-[#10b981] dark:text-[#060a08]'
                  : 'border-transparent bg-white text-[#405247] hover:border-[#11664b]/20 dark:bg-[#131b17] dark:text-[#8da398] dark:hover:border-[#10b981]/30',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </section>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {topThree.map((entry, index) => (
          <TopWorkerCard key={entry.worker_alias} entry={entry} index={index} />
        ))}
      </div>

      <section className={`${panelClass} overflow-hidden`}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f3ed] text-[#11664b] dark:bg-[#10b981]/15 dark:text-[#10b981]">
              <TrophyIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="m-0 text-[1.15rem] font-semibold tracking-[-0.025em] text-[#16221d] dark:text-[#ecf2ee]">
                Full ranking
              </h2>
              <p className="m-0 mt-1 text-[0.88rem] text-[#68766e] dark:text-[#8da398]">
                Workers are shown by second name so performance is motivating.
              </p>
            </div>
          </div>
          <span className="hidden rounded-full bg-[#e7f3ed] px-3 py-1 text-[0.82rem] font-semibold text-[#11664b] dark:bg-[#10b981]/15 dark:text-[#10b981] sm:inline-flex">
            {entries.length} workers
          </span>
        </div>

        <div className="max-h-[520px] overflow-y-auto pr-1">
          {remaining.length ? (
            <div className="grid gap-3">
              {remaining.map((entry) => (
                <LeaderboardRow key={entry.worker_alias} entry={entry} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-[#d4ded8] dark:border-[#222c26] bg-[#f8fbf7] dark:bg-[#161d19]/40 px-4 py-5 text-[0.92rem] text-[#68766e] dark:text-[#8da398]">
              Once more workers complete tasks, they will appear here below the
              top three.
            </p>
          )}
        </div>
      </section>
    </>
  );
}

function TopWorkerCard({
  entry,
  index,
  }: {
  entry: LeaderboardEntry;
  index: number;
}) {
  const rankStyles = [
    'from-[#11664b] to-[#16a466] text-white dark:from-[#0d4e38] dark:to-[#10b981] dark:text-[#ecf2ee]',
    'from-[#dfe9e3] to-white text-[#16221d] dark:from-[#131d18] dark:to-[#1b2b22] dark:text-[#ecf2ee]',
    'from-[#fff3df] to-white text-[#16221d] dark:from-[#211b11] dark:to-[#332515] dark:text-amber-200',
  ];

  return (
    <article
      className={cn(
        'relative overflow-hidden rounded-[24px] border border-[rgba(17,102,75,0.12)] dark:border-[#222c26]/60 bg-gradient-to-br p-6 shadow-[0_18px_44px_rgba(22,34,29,0.08)] dark:shadow-[0_14px_32px_rgba(0,0,0,0.2)]',
        rankStyles[index],
      )}
    >
      <div className="relative z-10 flex items-start justify-between gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-current backdrop-blur">
          <MedalIcon className="h-6 w-6" />
        </span>
        <span className="rounded-full bg-white/25 px-3 py-1 text-[0.8rem] font-bold">
          #{entry.rank}
        </span>
      </div>
      <h2 className="relative z-10 mt-6 text-[1.35rem] font-bold tracking-[-0.04em]">
        {entry.worker_alias}
      </h2>
      <p className="relative z-10 mt-2 text-[0.9rem] opacity-80">
        {entry.is_current_user ? 'Your position' : 'Worker'}
      </p>
      <div className="relative z-10 mt-7 grid grid-cols-2 gap-3">
        <Metric
          icon={<ClockIcon className="h-4 w-4" />}
          label="Completed"
          value={entry.completed_count}
        />
        <Metric
          icon={<CheckIcon className="h-4 w-4" />}
          label="Approved"
          value={entry.approved_count}
        />
      </div>
      <div className="pointer-events-none absolute -bottom-8 -right-8 text-current opacity-10">
        <TrophyIcon className="h-32 w-32" />
      </div>
    </article>
  );
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div
      className={cn(
        'grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border border-[#edf1ee] bg-white px-4 py-4 shadow-[0_8px_20px_rgba(22,34,29,0.02)] transition-all duration-200 hover:-translate-y-0.5 dark:border-[#222c26] dark:bg-[#131b17] dark:shadow-none',
        entry.is_current_user && 'border-[#11664b] bg-[#f2faf5] dark:border-[#10b981] dark:bg-[#10b981]/5',
      )}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e7f3ed] text-[0.9rem] font-bold text-[#11664b] dark:bg-[#10b981]/15 dark:text-[#10b981]">
        #{entry.rank}
      </span>
      <div className="min-w-0">
        <p className="m-0 truncate text-[0.98rem] font-bold text-[#16221d] dark:text-[#ecf2ee]">
          {entry.worker_alias}
        </p>
        <p className="m-0 mt-1 text-[0.84rem] text-[#68766e] dark:text-[#8da398]">
          {entry.approved_count} approved | {money(entry.earned_cents)} approved
          value
        </p>
      </div>
      <span className="inline-flex items-center gap-2 rounded-full bg-[#e7f3ed] px-3 py-1.5 text-[0.9rem] font-bold text-[#11664b] dark:bg-[#10b981]/15 dark:text-[#10b981]">
        <ClockIcon className="h-4 w-4" />
        {entry.completed_count}
      </span>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-white/20 px-3 py-3 backdrop-blur">
      <span className="inline-flex items-center gap-1.5 text-[0.78rem] font-semibold opacity-80">
        {icon}
        {label}
      </span>
      <strong className="mt-1 block text-[1.45rem] leading-none tracking-[-0.04em]">
        {value}
      </strong>
    </div>
  );
}
