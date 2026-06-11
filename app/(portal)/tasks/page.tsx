import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  claimTask,
  completeTask,
  deleteTask,
  reassignTask,
  startReview,
} from '@/app/actions/tasks';
import { ClipboardIcon, PlusIcon } from '@/components/icons';
import { Message } from '@/components/message';
import { PageHeader } from '@/components/page-header';
import { StatusPill } from '@/components/status-pill';
import { SubmitButton } from '@/components/submit-button';
import { TaskPrompt } from '@/components/task-prompt';
import { TaskRateAnnouncement } from '@/components/task-rate-announcement';
import { requireProfile } from '@/lib/auth';
import { dateLabel, money, statusLabels } from '@/lib/format';
import {
  actionsClass,
  buttonClass,
  cn,
  commentClass,
  dangerButtonClass,
  emptyClass,
  eyebrowClass,
  hiddenUrlClass,
  inputClass,
  labelClass,
  panelClass,
  secondaryButtonClass,
  statusBorderClass,
  taskLinkClass,
  taskMetaClass,
} from '@/lib/styles';
import type { Task, TaskStatus } from '@/lib/types';

type UserOption = {
  id: string;
  full_name: string;
};
const deletableStatuses: TaskStatus[] = ['pending', 'rework', 'rejected'];

const filterStatuses: TaskStatus[] = [
  'pending',
  'claimed',
  'completed',
  'under_review',
  'approved',
  'rework',
  'rejected',
];

function selectedStatus(status?: string): TaskStatus | undefined {
  return filterStatuses.includes(status as TaskStatus)
    ? (status as TaskStatus)
    : undefined;
}

function TaskStatusFilter({
  status,
  tasks,
}: {
  status?: TaskStatus;
  tasks: Task[];
}) {
  return (
    <nav
      className="my-4 mb-[1.4rem] flex flex-wrap gap-3 rounded-2xl border border-[rgba(17,102,75,0.12)] bg-[rgba(17,102,75,0.08)] p-[0.95rem]"
      aria-label="Filter tasks by status"
    >
      <Link
        href="/tasks"
        className={cn(
          'inline-flex items-center gap-[0.55rem] rounded-full border px-4 py-3 text-[0.9rem] font-semibold transition hover:-translate-y-px hover:border-[rgba(17,102,75,0.15)]',
          !status
            ? 'border-[#11664b] bg-[#11664b] text-white shadow-sm'
            : 'border-transparent bg-white text-[#405247] hover:bg-white',
        )}
      >
        All{' '}
        <span
          className={cn(
            'min-w-8 rounded-full px-[0.55rem] py-[0.18rem] text-center text-[0.78rem] font-bold',
            !status
              ? 'bg-[rgba(255,255,255,0.25)] text-white'
              : 'bg-[rgba(17,102,75,0.12)] text-[#11664b]',
          )}
        >
          {tasks.length}
        </span>
      </Link>
      {filterStatuses.map((option) => (
        <Link
          href={`/tasks?status=${option}`}
          className={cn(
            'inline-flex items-center gap-[0.55rem] rounded-full border px-4 py-3 text-[0.9rem] font-semibold transition hover:-translate-y-px hover:border-[rgba(17,102,75,0.15)]',
            status === option
              ? 'border-[#11664b] bg-[#11664b] text-white shadow-sm'
              : 'border-transparent bg-white text-[#405247] hover:bg-white',
          )}
          key={option}
        >
          {statusLabels[option]}{' '}
          <span
            className={cn(
              'min-w-8 rounded-full px-[0.55rem] py-[0.18rem] text-center text-[0.78rem] font-bold',
              status === option
                ? 'bg-[rgba(255,255,255,0.25)] text-white'
                : 'bg-[rgba(17,102,75,0.12)] text-[#11664b]',
            )}
          >
            {tasks.filter((task) => task.status === option).length}
          </span>
        </Link>
      ))}
    </nav>
  );
}

function TaskList({
  tasks,
  emptyMessage,
  showAssignee = false,
  users = [],
  assigneeNames = {},
  returnPath = '/tasks',
  actions,
}: {
  tasks: Task[];
  emptyMessage: string;
  showAssignee?: boolean;
  users?: UserOption[];
  assigneeNames?: Record<string, string>;
  returnPath?: string;
  actions: (task: Task) => ReactNode;
}) {
  if (!tasks.length) {
    return (
      <section className={`${panelClass} ${emptyClass}`}>
        {emptyMessage}
      </section>
    );
  }

  return (
    <section className={`${panelClass} overflow-hidden p-0`}>
      <div className="grid">
        {tasks.map((task) => (
          <details
            className={cn(
              'group border-b border-[#edf1ee] bg-white last:border-b-0 open:bg-[#fbfdfb]',
              statusBorderClass[task.status],
            )}
            key={task.id}
          >
            <summary className="grid cursor-pointer list-none grid-cols-[1fr_auto] items-center gap-4 px-4 py-3 transition hover:bg-[#f6fbf6] sm:grid-cols-[1.1fr_1fr_auto] [&::-webkit-details-marker]:hidden">
              <div className="min-w-0">
                <p className="m-0 truncate text-[0.98rem] font-bold text-[#16221d]">
                  {task.external_task_id}
                </p>
                <p className="m-0 mt-1 truncate text-[0.82rem] text-[#68766e]">
                  {task.task_language} | {task.step_range} steps
                  {task.application ? ` | ${task.application}` : ''}
                </p>
              </div>
              <div className="hidden min-w-0 text-[0.84rem] text-[#68766e] sm:block">
                <span className="font-semibold text-[#405247]">
                  {money(task.fee_cents)}
                </span>{' '}
                | {dateLabel(task.created_at)} | {task.rework_count} reworks
                {showAssignee ? (
                  <span className="block truncate">
                    Assigned:{' '}
                    {assigneeNames[task.assigned_to] ?? task.assigned_to}
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status={task.status} />
                <span className="hidden text-[0.8rem] font-semibold text-[#11664b] group-open:hidden md:inline">
                  View
                </span>
                <span className="hidden text-[0.8rem] font-semibold text-[#68766e] group-open:inline md:inline">
                  Close
                </span>
              </div>
            </summary>

            <div className="border-t border-[#edf1ee] px-4 py-5">
              <TaskPrompt prompt={task.prompt} />
              <dl className={taskMetaClass}>
                <div>
                  <dt>Fee</dt>
                  <dd>{money(task.fee_cents)}</dd>
                </div>
                <div>
                  <dt>Expected steps</dt>
                  <dd>{task.step_range}</dd>
                </div>
                <div>
                  <dt>Final steps</dt>
                  <dd>{task.final_step_count ?? '-'}</dd>
                </div>
                <div>
                  <dt>Assigned</dt>
                  <dd>{dateLabel(task.created_at)}</dd>
                </div>
                <div>
                  <dt>Reworks</dt>
                  <dd>{task.rework_count}</dd>
                </div>
                {showAssignee ? (
                  <div>
                    <dt>Assigned to</dt>
                    <dd className="break-all">
                      {assigneeNames[task.assigned_to] ?? task.assigned_to}
                    </dd>
                  </div>
                ) : null}
              </dl>
              {task.admin_comment && (
                <div className={commentClass}>
                  <strong>Admin feedback</strong>
                  {task.admin_comment}
                </div>
              )}
              {task.task_url ? (
                <a
                  href={task.task_url}
                  target="_blank"
                  rel="noreferrer"
                  className={taskLinkClass}
                >
                  {task.task_url}
                </a>
              ) : (
                task.status !== 'approved' && (
                  <p className={hiddenUrlClass}>
                    URL hidden until this task is claimed.
                  </p>
                )
              )}
              {showAssignee && task.status === 'pending' && (
                <form
                  action={reassignTask.bind(null, task.id)}
                  className="mt-4 grid gap-4 rounded-2xl border border-[#edf1ee] bg-white/90 p-4 shadow-[0_10px_30px_rgba(17,102,75,0.05)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
                >
                  <input type="hidden" name="return_path" value={returnPath} />
                  <label className={labelClass}>
                    Reassign pending task
                    <select
                      className={inputClass}
                      name="assigned_to"
                      defaultValue={task.assigned_to}
                      required
                    >
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.full_name || 'Unnamed worker'}
                        </option>
                      ))}
                    </select>
                  </label>
                  <SubmitButton
                    label="Reassign"
                    pendingLabel="Reassigning..."
                    baseClassName={secondaryButtonClass}
                    className="self-end justify-self-end"
                  />
                </form>
              )}
              {showAssignee && deletableStatuses.includes(task.status) && (
                <form
                  action={deleteTask.bind(null, task.id)}
                  className={actionsClass}
                >
                  <input type="hidden" name="return_path" value={returnPath} />
                  <SubmitButton
                    label="Delete task"
                    pendingLabel="Deleting..."
                    className={dangerButtonClass}
                  />
                </form>
              )}
              {actions(task)}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string; status?: string }>;
}) {
  const { supabase, profile } = await requireProfile();
  const { notice, error, status } = await searchParams;
  const activeStatus = selectedStatus(status);

  if (profile.role === 'admin') {
    const [{ data }, { data: usersData }] = await Promise.all([
      supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'user')
        .order('full_name'),
    ]);
    const tasks = (data ?? []) as Task[];
    const users = (usersData ?? []) as UserOption[];
    const assigneeNames = Object.fromEntries(
      users.map((user) => [user.id, user.full_name || 'Unnamed worker']),
    );
    const displayedTasks = activeStatus
      ? tasks.filter((task) => task.status === activeStatus)
      : tasks;

    return (
      <>
        <PageHeader
          eyebrow="Administration"
          title="Tasks"
          subtitle="A compact list for scanning large task volumes. Open a row to view details and actions."
        />
        <Message notice={notice} error={error} />
        <TaskRateAnnouncement />
        <TaskStatusFilter status={activeStatus} tasks={tasks} />
        <section className="my-6 flex flex-col gap-5 rounded-[14px] border border-[rgba(17,102,75,0.14)] bg-[linear-gradient(135deg,rgba(231,243,237,0.9)_0%,rgba(255,255,255,0.95)_100%)] p-[1.8rem] shadow-[0_2px_8px_rgba(22,34,29,0.04)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className={eyebrowClass}>Task summary</p>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#11664b] shadow-[0_10px_24px_rgba(17,102,75,0.10)]">
                <ClipboardIcon className="h-5 w-5" />
              </span>
              <h2 className="m-0 text-[1.15rem] font-semibold tracking-[-0.025em]">
                {displayedTasks.length} visible tasks
              </h2>
            </div>
            <p className="mt-2.5 max-w-[520px] text-[0.95rem] leading-[1.7] text-[#68766e]">
              Click a task row to expand the URL, prompt, payment, rework count,
              and available review actions.
            </p>
          </div>
          <Link href="/tasks/assign" className={buttonClass}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Assign task
          </Link>
        </section>
        <TaskList
          tasks={displayedTasks}
          showAssignee
          users={users}
          assigneeNames={assigneeNames}
          returnPath="/tasks"
          emptyMessage={`No ${
            activeStatus ? statusLabels[activeStatus].toLowerCase() : ''
          } tasks found.`}
          actions={(task) =>
            task.status === 'completed' ? (
              <form
                action={startReview.bind(null, task.id, task.assigned_to)}
                className={actionsClass}
              >
                <SubmitButton
                  label="Move to review"
                  pendingLabel="Moving to review..."
                  className={buttonClass}
                />
              </form>
            ) : null
          }
        />
      </>
    );
  }

  const { data } = await supabase.rpc('get_my_tasks');
  const tasks = (data ?? []) as Task[];
  const displayedTasks = activeStatus
    ? tasks.filter((task) => task.status === activeStatus)
    : tasks;

  return (
    <>
      <PageHeader
        eyebrow="Work queue"
        title="Tasks"
        subtitle="A slim list of your assignments. Open a row to view the full prompt, URL, and actions."
      />
      <Message notice={notice} error={error} />
      <TaskRateAnnouncement />
      <section className="mb-5 rounded-2xl border border-[#f3d79d] bg-[#fff8ea] px-4 py-3 text-[0.92rem] leading-6 text-[#6a4a12]">
        <strong className="text-[#9a6408]">Quality reminder:</strong> tasks sent
        back for rework more than once may have their fee reduced. Review the
        prompt carefully before submitting.
      </section>
      <TaskStatusFilter status={activeStatus} tasks={tasks} />
      <TaskList
        tasks={displayedTasks}
        emptyMessage={
          tasks.length && activeStatus
            ? `No ${statusLabels[activeStatus].toLowerCase()} tasks found.`
            : 'You do not have assigned tasks yet.'
        }
        actions={(task) => (
          <div className={actionsClass}>
            {task.status === 'pending' && (
              <form action={claimTask.bind(null, task.id)}>
                <SubmitButton
                  label="Claim task"
                  pendingLabel="Claiming..."
                  className={buttonClass}
                />
              </form>
            )}
            {(task.status === 'claimed' || task.status === 'rework') && (
              <form
                action={completeTask.bind(null, task.id)}
                className="grid gap-3 rounded-2xl border border-[#edf1ee] bg-white/80 p-4 sm:grid-cols-[minmax(180px,260px)_auto] sm:items-end"
              >
                <label className={labelClass}>
                  Final step count
                  <input
                    className={inputClass}
                    name="final_step_count"
                    type="number"
                    min="1"
                    step="1"
                    required
                    placeholder="e.g. 58"
                    defaultValue={task.final_step_count ?? ''}
                  />
                </label>
                <SubmitButton
                  label="Mark completed"
                  pendingLabel="Submitting..."
                  className={buttonClass}
                />
              </form>
            )}
          </div>
        )}
      />
    </>
  );
}
