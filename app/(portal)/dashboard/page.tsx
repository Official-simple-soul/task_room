import Link from 'next/link';
import {
  ArrowRightIcon,
  CheckIcon,
  ClipboardIcon,
  ClockIcon,
  DashboardIcon,
  DollarIcon,
  RefreshIcon,
  UsersIcon,
  WalletIcon,
} from '@/components/icons';
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
          icon={<DashboardIcon className="h-5 w-5" />}
        />
        <div className="mb-8 grid grid-cols-1 gap-[1.3rem] sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Active users"
            value={profiles?.length ?? 0}
            icon={<UsersIcon className="h-6 w-6" />}
          />
          <StatCard
            label="Awaiting review"
            value={
              assigned.filter((task) => task.status === 'completed').length
            }
            icon={<ClockIcon className="h-6 w-6" />}
          />
          <StatCard
            label="Approved value"
            value={money(earned)}
            icon={<CheckIcon className="h-6 w-6" />}
          />
          <StatCard
            label="Payments recorded"
            value={money(
              (payments ?? []).reduce(
                (sum, payment) => sum + payment.amount_cents,
                0,
              ),
            )}
            icon={<WalletIcon className="h-6 w-6" />}
          />
        </div>
        <section className="my-6 flex flex-col gap-8 rounded-[14px] border border-[#eef2f0] bg-[linear-gradient(135deg,#e7f3ed_0%,rgba(231,243,237,0.5)_100%)] p-8 shadow-[0_2px_8px_rgba(22,34,29,0.04)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#11664b] shadow-[0_10px_24px_rgba(17,102,75,0.10)]">
              <ClipboardIcon className="h-6 w-6" />
            </span>
            <h2 className="m-0 text-[1.15rem] font-semibold tracking-[-0.025em]">
              Assignment management
            </h2>
            <p className="mt-2.5 text-[0.95rem] text-[#68766e]">
              Open a user to assign new tasks or process submitted work.
            </p>
          </div>
          <Link className={buttonClass} href="/users">
            Manage users
            <ArrowRightIcon className="ml-2 h-4 w-4" />
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
          icon={<ClipboardIcon className="h-6 w-6" />}
        />
        <StatCard
          label="In progress"
          value={
            tasks.filter((task) => ['claimed', 'rework'].includes(task.status))
              .length
          }
          icon={<RefreshIcon className="h-6 w-6" />}
        />
        <StatCard
          label="Approved"
          value={tasks.filter((task) => task.status === 'approved').length}
          icon={<CheckIcon className="h-6 w-6" />}
        />
        <StatCard
          label="Total earned"
          value={money(totalEarned)}
          icon={<DollarIcon className="h-6 w-6" />}
        />
      </div>
      <section className={panelClass}>
        <div className="mb-[1.15rem] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="m-0 text-[1.15rem] font-semibold tracking-[-0.025em]">
              Recent assignments
            </h2>
          </div>
          <Link
            href="/tasks"
            className="inline-flex items-center gap-1.5 text-[0.9rem] font-semibold text-[#11664b]"
          >
            View all tasks
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid">
          {tasks.slice(0, 4).map((task) => (
            <div
              className="flex items-center justify-between gap-5 border-t border-[#edf1ee] py-[1.1rem] first:border-t-0 hover:bg-[rgba(231,243,237,0.3)]"
              key={task.id}
            >
              <div className="flex items-center gap-3">
                <span className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-[#e7f3ed] text-[#11664b] sm:flex">
                  <ClipboardIcon className="h-6 w-6" />
                </span>
                <div>
                  <strong>{task.external_task_id}</strong>
                  <span className="mt-1 block text-[0.87rem] font-medium text-[#68766e]">
                    {task.task_language} | {task.step_range} steps
                  </span>
                </div>
              </div>
              <StatusPill status={task.status} />
            </div>
          ))}
          {!tasks.length && (
            <p className={emptyClass}>No tasks assigned yet.</p>
          )}
        </div>
      </section>
    </>
  );
}
