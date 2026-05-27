import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { StatusPill } from '@/components/status-pill';
import { requireProfile } from '@/lib/auth';
import { money } from '@/lib/format';
import { buttonClass, emptyClass, panelClass } from '@/lib/styles';
import type { MonthlyMetric, Task } from '@/lib/types';

export default async function DashboardPage() {
  const { supabase, profile } = await requireProfile();

  if (profile.role === 'admin') {
    const [{ data: profiles }, { data: tasks }, { data: payments }] =
      await Promise.all([
        supabase.from('profiles').select('id').eq('role', 'user'),
        supabase.from('tasks').select('id, status, fee_cents'),
        supabase
          .from('monthly_payments')
          .select('amount_cents')
          .eq('status', 'paid'),
      ]);
    const assigned = tasks ?? [];
    const earned = assigned
      .filter((task) => task.status === 'approved')
      .reduce((sum, task) => sum + task.fee_cents, 0);

    return (
      <>
        <PageHeader
          eyebrow="Overview"
          title="Admin dashboard"
          subtitle="Monitor delivery, review work, and close monthly payments."
        />
        <div className="mb-8 grid grid-cols-1 gap-[1.3rem] sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Active users" value={profiles?.length ?? 0} />
          <StatCard
            label="Awaiting review"
            value={
              assigned.filter((task) => task.status === 'completed').length
            }
          />
          <StatCard label="Approved value" value={money(earned)} />
          <StatCard
            label="Payments recorded"
            value={money(
              (payments ?? []).reduce(
                (sum, payment) => sum + payment.amount_cents,
                0,
              ),
            )}
          />
        </div>
        <section className="my-6 flex flex-col gap-8 rounded-[14px] border border-[#eef2f0] bg-[linear-gradient(135deg,#e7f3ed_0%,rgba(231,243,237,0.5)_100%)] p-8 shadow-[0_2px_8px_rgba(22,34,29,0.04)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="m-0 text-[1.15rem] font-semibold tracking-[-0.025em]">
              Assignment management
            </h2>
            <p className="mt-2.5 text-[0.95rem] text-[#68766e]">
              Open a user to assign new tasks or process submitted work.
            </p>
          </div>
          <Link className={buttonClass} href="/users">
            Manage users
          </Link>
        </section>
      </>
    );
  }

  const [{ data: taskData }, { data: metricsData }] = await Promise.all([
    supabase.rpc('get_my_tasks'),
    supabase.rpc('get_my_monthly_metrics'),
  ]);
  const tasks = (taskData ?? []) as Task[];
  const metrics = (metricsData ?? []) as MonthlyMetric[];
  const totalEarned = metrics.reduce(
    (sum, metric) => sum + Number(metric.earned_cents),
    0,
  );

  return (
      <>
      <PageHeader
        eyebrow="Overview"
        title={`Welcome, ${profile.full_name || 'worker'}`}
        subtitle="Your current workload, progress, and approved earnings."
      />
      <div className="mb-8 grid grid-cols-1 gap-[1.3rem] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pending tasks"
          value={tasks.filter((task) => task.status === 'pending').length}
        />
        <StatCard
          label="In progress"
          value={
            tasks.filter((task) => ['claimed', 'rework'].includes(task.status))
              .length
          }
        />
        <StatCard
          label="Approved"
          value={tasks.filter((task) => task.status === 'approved').length}
        />
        <StatCard label="Total earned" value={money(totalEarned)} />
      </div>
      <section className={panelClass}>
        <div className="mb-[1.15rem] flex items-center justify-between">
          <h2 className="m-0 text-[1.15rem] font-semibold tracking-[-0.025em]">
            Recent assignments
          </h2>
          <Link href="/tasks" className="text-[0.9rem] font-semibold text-[#11664b]">
            View all tasks
          </Link>
        </div>
        <div className="grid">
          {tasks.slice(0, 4).map((task) => (
            <div
              className="flex items-center justify-between gap-5 border-t border-[#edf1ee] py-[1.1rem] first:border-t-0 hover:bg-[rgba(231,243,237,0.3)]"
              key={task.id}
            >
              <div>
                <strong>{task.external_task_id}</strong>
                <span className="mt-1 block text-[0.87rem] font-medium text-[#68766e]">
                  {task.task_language} | {task.step_range} steps
                </span>
              </div>
              <StatusPill status={task.status} />
            </div>
          ))}
          {!tasks.length && <p className={emptyClass}>No tasks assigned yet.</p>}
        </div>
      </section>
    </>
  );
}
