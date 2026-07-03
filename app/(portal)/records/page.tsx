import { CalendarIcon, CheckIcon, ClipboardIcon, DollarIcon } from '@/components/icons';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { StatusPill } from '@/components/status-pill';
import { requireProfile } from '@/lib/auth';
import { dateLabel, money } from '@/lib/format';
import {
  buttonClass,
  cn,
  emptyClass,
  inputClass,
  labelClass,
  panelClass,
} from '@/lib/styles';
import type { Task, TaskStatus } from '@/lib/types';

type ReviewRecordTask = Task & {
  review_started_at: string | null;
};

const lagosDateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Africa/Lagos',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const longDateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Africa/Lagos',
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

function dateKey(value: string) {
  const parts = Object.fromEntries(
    lagosDateFormatter
      .formatToParts(new Date(value))
      .map((part) => [part.type, part.value]),
  );

  return `${parts.year}-${parts.month}-${parts.day}`;
}

function longDateLabel(key: string) {
  return longDateFormatter.format(new Date(`${key}T00:00:00+01:00`));
}

function groupByDate(tasks: ReviewRecordTask[]) {
  return tasks.reduce<Record<string, ReviewRecordTask[]>>((groups, task) => {
    if (!task.review_started_at) return groups;
    const key = dateKey(task.review_started_at);
    groups[key] = [...(groups[key] ?? []), task];
    return groups;
  }, {});
}

export default async function DailyRecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { supabase } = await requireProfile('admin');
  const { date } = await searchParams;
  const selectedDate = date?.match(/^\d{4}-\d{2}-\d{2}$/) ? date : undefined;

  const [{ data }, { data: profilesData }] = await Promise.all([
    supabase
      .from('tasks')
      .select('*')
      .not('review_started_at', 'is', null)
      .order('review_started_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'user')
      .order('full_name'),
  ]);

  const workerNames = Object.fromEntries(
    (profilesData ?? []).map((profile) => [
      profile.id,
      profile.full_name || 'Unnamed worker',
    ]),
  );
  const tasks = ((data ?? []) as ReviewRecordTask[]).filter((task) => {
    if (!selectedDate || !task.review_started_at) return true;
    return dateKey(task.review_started_at) === selectedDate;
  });
  const grouped = groupByDate(tasks);
  const dateGroups = Object.entries(grouped).sort(([a], [b]) =>
    b.localeCompare(a),
  );
  const todayKey = dateKey(new Date().toISOString());
  const todayCount = ((data ?? []) as ReviewRecordTask[]).filter(
    (task) => task.review_started_at && dateKey(task.review_started_at) === todayKey,
  ).length;
  const totalValue = tasks.reduce((sum, task) => sum + task.fee_cents, 0);
  const finalSteps = tasks.reduce(
    (sum, task) => sum + (task.final_step_count ?? 0),
    0,
  );

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Daily records"
        subtitle="Tasks are counted here when you move them to under review after submitting them to the higher platform."
        icon={<CalendarIcon className="h-5 w-5" />}
      />

      <div className="mb-8 grid grid-cols-1 gap-[1.3rem] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Submitted today"
          value={todayCount}
          icon={<ClipboardIcon className="h-6 w-6" />}
        />
        <StatCard
          label="Visible records"
          value={tasks.length}
          icon={<CheckIcon className="h-6 w-6" />}
        />
        <StatCard
          label="Final steps"
          value={finalSteps}
          icon={<CalendarIcon className="h-6 w-6" />}
        />
        <StatCard
          label="Task value"
          value={money(totalValue)}
          icon={<DollarIcon className="h-6 w-6" />}
        />
      </div>

      <section className={`${panelClass} mb-6`}>
        <form className="grid gap-4 sm:grid-cols-[minmax(180px,260px)_auto_auto] sm:items-end">
          <label className={labelClass}>
            Filter by submitted date
            <input
              className={cn(inputClass, 'dark:bg-[#131b17]')}
              name="date"
              type="date"
              defaultValue={selectedDate ?? ''}
            />
          </label>
          <button className={buttonClass} type="submit">
            Apply filter
          </button>
          {selectedDate ? (
            <a
              href="/records"
              className="inline-flex w-fit items-center justify-center rounded-xl px-4 py-2.5 text-[0.92rem] font-semibold text-[#68766e] hover:bg-[#edf1ee] dark:text-[#8da398] dark:hover:bg-[#1a2520] transition duration-150"
            >
              Clear
            </a>
          ) : null}
        </form>
      </section>

      <div className="grid gap-5">
        {dateGroups.map(([key, records]) => (
          <section className={panelClass} key={key}>
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-[0.76rem] font-bold uppercase tracking-[0.13em] text-[#11664b] dark:text-[#10b981]">
                  Submitted record
                </p>
                <h2 className="m-0 text-[1.25rem] font-bold tracking-[-0.035em] text-[#16221d] dark:text-[#ecf2ee]">
                  {longDateLabel(key)}
                </h2>
              </div>
              <div className="rounded-full bg-[#e7f3ed] px-4 py-2 text-[0.9rem] font-bold text-[#11664b] dark:bg-[#10b981]/15 dark:text-[#10b981]">
                {records.length} task{records.length === 1 ? '' : 's'}
              </div>
            </div>

            <div className="grid overflow-hidden rounded-2xl border border-[#edf1ee] dark:border-[#222c26]">
              {records.map((task) => (
                <article
                  className="grid gap-3 border-b border-[#edf1ee] dark:border-[#222c26] bg-white dark:bg-[#131b17] p-4 last:border-b-0 lg:grid-cols-[1fr_auto] lg:items-center"
                  key={task.id}
                >
                  <div>
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <h3 className="m-0 text-[1rem] font-bold text-[#16221d] dark:text-[#ecf2ee]">
                        {task.external_task_id}
                      </h3>
                      <StatusPill status={task.status as TaskStatus} />
                    </div>
                    <p className="m-0 text-[0.9rem] leading-6 text-[#68766e] dark:text-[#8da398]">
                      {workerNames[task.assigned_to] ?? 'Unnamed worker'} |{' '}
                      {task.task_language} | expected {task.step_range} steps |
                      final {task.final_step_count ?? '-'} steps
                    </p>
                    <p className="m-0 mt-1 text-[0.84rem] text-[#849087] dark:text-[#687a70]">
                      Moved to review: {dateLabel(task.review_started_at)}
                    </p>
                  </div>
                  <div className="text-left lg:text-right">
                    <strong className="block text-[1rem] text-[#16221d] dark:text-[#ecf2ee]">
                      {money(task.fee_cents)}
                    </strong>
                    <span className="text-[0.84rem] text-[#68766e] dark:text-[#8da398]">
                      {task.rework_count} rework
                      {task.rework_count === 1 ? '' : 's'}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}

        {!dateGroups.length && (
          <section className={`${panelClass} ${emptyClass}`}>
            No tasks have been moved to review for this date yet.
          </section>
        )}
      </div>
    </>
  );
}
