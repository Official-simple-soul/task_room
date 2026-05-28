import { claimTask, completeTask } from '@/app/actions/tasks';
import { ClipboardIcon, PlusIcon } from '@/components/icons';
import Link from 'next/link';
import { Message } from '@/components/message';
import { PageHeader } from '@/components/page-header';
import { StatusPill } from '@/components/status-pill';
import { requireProfile } from '@/lib/auth';
import { dateLabel, money, statusLabels } from '@/lib/format';
import {
  actionsClass,
  buttonClass,
  cn,
  commentClass,
  emptyClass,
  eyebrowClass,
  hiddenUrlClass,
  panelClass,
  statusBorderClass,
  taskCardClass,
  taskGridClass,
  taskLinkClass,
  taskMetaClass,
  taskPromptClass,
  taskTitleClass,
} from '@/lib/styles';
import type { Task, TaskStatus } from '@/lib/types';

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

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string; status?: string }>;
}) {
  const { supabase, profile } = await requireProfile();
  const { notice, error, status } = await searchParams;
  const activeStatus = selectedStatus(status);

  if (profile.role === 'admin') {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    const tasks = (data ?? []) as Task[];
    const displayedTasks = activeStatus
      ? tasks.filter((task) => task.status === activeStatus)
      : tasks;

    return (
      <>
        <PageHeader
          eyebrow="Administration"
          title="Tasks"
          subtitle="Overview of all assigned tasks and review workflow."
        />
        <Message notice={notice} error={error} />
        <TaskStatusFilter status={activeStatus} tasks={tasks} />
        <section className="my-6 flex flex-col gap-5 rounded-[14px] border border-[rgba(17,102,75,0.14)] bg-[linear-gradient(135deg,rgba(231,243,237,0.9)_0%,rgba(255,255,255,0.95)_100%)] p-[1.8rem] shadow-[0_2px_8px_rgba(22,34,29,0.04)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className={eyebrowClass}>Task summary</p>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#11664b] shadow-[0_10px_24px_rgba(17,102,75,0.10)]">
                <ClipboardIcon className="h-5 w-5" />
              </span>
              <h2 className="m-0 text-[1.15rem] font-semibold tracking-[-0.025em]">
                Task management
              </h2>
            </div>
            <p className="mt-2.5 max-w-[520px] text-[0.95rem] leading-[1.7] text-[#68766e]">
              Create, monitor, and route assignments from one place with a clean
              task overview.
            </p>
          </div>
          <Link href="/tasks/assign" className={buttonClass}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Assign task
          </Link>
        </section>
        <div className={taskGridClass}>
          {displayedTasks.map((task) => (
            <article
              className={cn(taskCardClass, statusBorderClass[task.status])}
              key={task.id}
            >
              <div className={taskTitleClass}>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e7f3ed] text-[#11664b]">
                  <ClipboardIcon className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <h2 className="m-0 text-[1.18rem] tracking-[-0.03em]">
                    {task.external_task_id}
                  </h2>
                  <p className="m-0 text-[0.92rem] text-[#4c5b51]">
                    {task.task_language} | {task.step_range} expected steps
                  </p>
                  <p className="mt-1.5 text-[0.9rem] text-[#68766e]">
                    Assigned to: {task.assigned_to}
                  </p>
                </div>
                <StatusPill status={task.status} />
              </div>
              <p className={taskPromptClass}>{task.prompt}</p>
              <dl className={taskMetaClass}>
                <div>
                  <dt>Fee</dt>
                  <dd>{money(task.fee_cents)}</dd>
                </div>
                <div>
                  <dt>Assigned</dt>
                  <dd>{dateLabel(task.created_at)}</dd>
                </div>
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
                <p className={hiddenUrlClass}>URL hidden until claimed.</p>
              )}
              {task.status === 'completed' && (
                <form
                  action={completeTask.bind(null, task.id)}
                  className={actionsClass}
                >
                  <button className={buttonClass}>Move to review</button>
                </form>
              )}
            </article>
          ))}
          {!displayedTasks.length && (
            <section className={`${panelClass} ${emptyClass}`}>
              No {activeStatus ? statusLabels[activeStatus].toLowerCase() : ''}{' '}
              tasks found.
            </section>
          )}
        </div>
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
        subtitle="Claim a pending task to reveal its working link. Approved work is permanently closed."
      />
      <Message notice={notice} error={error} />
      <TaskStatusFilter status={activeStatus} tasks={tasks} />
      <div className={taskGridClass}>
        {displayedTasks.map((task) => (
          <article
            className={cn(taskCardClass, statusBorderClass[task.status])}
            key={task.id}
          >
            <div className={taskTitleClass}>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e7f3ed] text-[#11664b]">
                <ClipboardIcon className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <h2 className="m-0 text-[1.18rem] tracking-[-0.03em]">
                  {task.external_task_id}
                </h2>
                <p className="m-0 text-[0.92rem] text-[#4c5b51]">
                  {task.task_language} | {task.step_range} expected steps
                </p>
              </div>
              <StatusPill status={task.status} />
            </div>
            <p className={taskPromptClass}>{task.prompt}</p>
            <dl className={taskMetaClass}>
              <div>
                <dt>Fee</dt>
                <dd>{money(task.fee_cents)}</dd>
              </div>
              <div>
                <dt>Assigned</dt>
                <dd>{dateLabel(task.created_at)}</dd>
              </div>
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
            <div className={actionsClass}>
              {task.status === 'pending' && (
                <form action={claimTask.bind(null, task.id)}>
                  <button className={buttonClass}>Claim task</button>
                </form>
              )}
              {(task.status === 'claimed' || task.status === 'rework') && (
                <form action={completeTask.bind(null, task.id)}>
                  <button className={buttonClass}>Mark completed</button>
                </form>
              )}
            </div>
          </article>
        ))}
        {!displayedTasks.length && (
          <section className={`${panelClass} ${emptyClass}`}>
            {tasks.length && activeStatus
              ? `No ${statusLabels[activeStatus].toLowerCase()} tasks found.`
              : 'You do not have assigned tasks yet.'}
          </section>
        )}
      </div>
    </>
  );
}
