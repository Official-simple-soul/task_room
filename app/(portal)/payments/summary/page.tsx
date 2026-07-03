import { ClipboardIcon } from '@/components/icons';
import { PageHeader } from '@/components/page-header';
import { requireProfile } from '@/lib/auth';
import { money, monthLabel, statusLabels } from '@/lib/format';
import {
  buttonClass,
  cn,
  emptyClass,
  inputClass,
  labelClass,
  panelClass,
  tableClass,
  tdClass,
  thClass,
} from '@/lib/styles';
import type { TaskStatus } from '@/lib/types';

const lagosMonthFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Africa/Lagos',
  year: 'numeric',
  month: '2-digit',
});

function monthKey(value: string) {
  const parts = Object.fromEntries(
    lagosMonthFormatter.formatToParts(new Date(value)).map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}`;
}

type SummaryTask = {
  assigned_to: string;
  status: TaskStatus;
  fee_cents: number;
  created_at: string;
  claimed_at: string | null;
  completed_at: string | null;
  reviewed_at: string | null;
  approved_at: string | null;
};

function effectiveDate(task: SummaryTask) {
  return (
    task.approved_at ?? task.reviewed_at ?? task.completed_at ?? task.claimed_at ?? task.created_at
  );
}

export default async function PaymentsSummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; status?: string }>;
}) {
  const { month, status } = await searchParams;
  const { supabase } = await requireProfile('admin');
  const [{ data: users }, { data: summaryTasks }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'user')
      .order('full_name'),
    supabase
      .from('tasks')
      .select(
        'assigned_to, status, fee_cents, created_at, claimed_at, completed_at, reviewed_at, approved_at',
      ),
  ]);

  const selectedMonth = month?.match(/^\d{4}-\d{2}$/) ? month : monthKey(new Date().toISOString());
  const selectedStatus: TaskStatus | 'all' =
    status === 'all' || (status && status in statusLabels) ? (status as TaskStatus | 'all') : 'approved';

  const monthTasks = ((summaryTasks ?? []) as SummaryTask[]).filter(
    (task) => monthKey(effectiveDate(task)) === selectedMonth,
  );

  const taskSummary = (users ?? []).map((user) => {
    const userTasks = monthTasks.filter((task) => task.assigned_to === user.id);
    const filteredTasks =
      selectedStatus === 'all'
        ? userTasks
        : userTasks.filter((task) => task.status === selectedStatus);
    const approvedFeeCents = userTasks
      .filter((task) => task.status === 'approved')
      .reduce((sum, task) => sum + task.fee_cents, 0);
    return {
      id: user.id,
      full_name: user.full_name,
      taskCount: filteredTasks.length,
      approvedFeeCents,
    };
  });
  const taskSummaryTotals = taskSummary.reduce(
    (totals, row) => ({
      taskCount: totals.taskCount + row.taskCount,
      approvedFeeCents: totals.approvedFeeCents + row.approvedFeeCents,
    }),
    { taskCount: 0, approvedFeeCents: 0 },
  );
  const taskCountLabel = selectedStatus === 'all' ? 'Total tasks' : statusLabels[selectedStatus];

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Monthly task summary"
        subtitle="See how many tasks each worker completed in a given month, broken down by status, before recording their payment."
        icon={<ClipboardIcon className="h-5 w-5" />}
      />
      <section className={`${panelClass} overflow-x-auto`}>
        <form className="mb-5 grid gap-4 sm:grid-cols-[minmax(160px,200px)_minmax(180px,220px)_auto]">
          <label className={labelClass}>
            Month
            <input
              className={cn(inputClass, 'dark:bg-[#131b17]')}
              name="month"
              type="month"
              defaultValue={selectedMonth}
            />
          </label>
          <label className={labelClass}>
            Status
            <select
              className={cn(inputClass, 'dark:bg-[#131b17]')}
              name="status"
              defaultValue={selectedStatus}
            >
              <option value="all" className="dark:bg-[#131b17]">
                All statuses
              </option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value} className="dark:bg-[#131b17]">
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button className={`${buttonClass} self-end`} type="submit">
            Apply filter
          </button>
        </form>
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>User</th>
              <th className={thClass}>{taskCountLabel}</th>
              <th className={thClass}>Approved fee ({monthLabel(`${selectedMonth}-01`)})</th>
            </tr>
          </thead>
          <tbody>
            {taskSummary.map((row) => (
              <tr key={row.id}>
                <td className={tdClass}>
                  <strong className="text-[#16221d] dark:text-[#ecf2ee]">
                    {row.full_name || 'Unnamed user'}
                  </strong>
                </td>
                <td className={tdClass}>{row.taskCount}</td>
                <td className={cn(tdClass, 'font-bold text-[#11664b] dark:text-[#10b981]')}>
                  {money(row.approvedFeeCents)}
                </td>
              </tr>
            ))}
            {taskSummary.length ? (
              <tr>
                <td className={cn(tdClass, 'font-bold text-[#16221d] dark:text-[#ecf2ee]')}>
                  Total
                </td>
                <td className={cn(tdClass, 'font-bold text-[#16221d] dark:text-[#ecf2ee]')}>
                  {taskSummaryTotals.taskCount}
                </td>
                <td className={cn(tdClass, 'font-bold text-[#11664b] dark:text-[#10b981]')}>
                  {money(taskSummaryTotals.approvedFeeCents)}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        {!taskSummary.length && <p className={emptyClass}>No workers found.</p>}
      </section>
    </>
  );
}
