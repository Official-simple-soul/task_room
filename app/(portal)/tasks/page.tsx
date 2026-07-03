import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  claimTask,
  completeTask,
  decideTask,
  deleteTask,
  reassignTask,
  revertTaskApproval,
  startReview,
} from '@/app/actions/tasks';
import { ClipboardIcon, PlusIcon } from '@/components/icons';
import { Message } from '@/components/message';
import { PageHeader } from '@/components/page-header';
import { StatusPill } from '@/components/status-pill';
import { SubmitButton } from '@/components/submit-button';
import { TaskPrompt } from '@/components/task-prompt';
import { TaskRateAnnouncement } from '@/components/task-rate-announcement';
import { TaskRulesSidebar } from '@/components/task-rules-sidebar';
import { requireProfile } from '@/lib/auth';
import { dateLabel, money, statusLabels } from '@/lib/format';
import { findProjectBySlug, getActiveProjects } from '@/lib/projects';
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
  warningButtonClass,
} from '@/lib/styles';
import type { Project, ProjectStatus, Task, TaskStatus } from '@/lib/types';

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

const projectStatusMeta: Record<
  ProjectStatus,
  {
    label: string;
    tone: string;
    note: string;
  }
> = {
  in_progress: {
    label: 'In progress',
    tone: 'border-[#bfe1cc] bg-[#eff9f0] text-[#11664b] dark:border-[#10b981]/25 dark:bg-[#10b981]/8 dark:text-[#10b981]',
    note: 'This project is active and available for normal task work.',
  },
  paused: {
    label: 'Paused',
    tone: 'border-[#f3d79d] bg-[#fff8ea] text-[#9a6408] dark:border-[#ff9800]/25 dark:bg-[#ff9800]/8 dark:text-[#ffb74d]',
    note: 'This project is paused. Existing work remains visible, but new activity may be temporarily limited.',
  },
  closed: {
    label: 'Closed',
    tone: 'border-[#f2c9c9] bg-[#fff3f3] text-[#ae3939] dark:border-[#ef4444]/25 dark:bg-[#ef4444]/8 dark:text-[#fca5a5]',
    note: 'This project is closed. Existing records remain visible for reference.',
  },
};

function TaskStatusFilter({
  status,
  tasks,
  projectSlug,
}: {
  status?: TaskStatus;
  tasks: Task[];
  projectSlug?: string;
}) {
  const projectQuery = projectSlug
    ? `project=${encodeURIComponent(projectSlug)}`
    : '';
  const hrefForStatus = (nextStatus?: TaskStatus) => {
    const params = new URLSearchParams(projectQuery);
    if (nextStatus) params.set('status', nextStatus);
    const query = params.toString();
    return query ? `/tasks?${query}` : '/tasks';
  };

  return (
    <nav
      className="my-4 mb-[1.4rem] flex flex-wrap gap-2.5 rounded-2xl border border-[#edf3ef] bg-[#11664b]/6 p-3 dark:border-[#222c26] dark:bg-[#10b981]/4"
      aria-label="Filter tasks by status"
    >
      <Link
        href={hrefForStatus()}
        className={cn(
          'inline-flex items-center gap-[0.55rem] rounded-full border px-4 py-2 text-[0.88rem] font-semibold transition hover:-translate-y-px',
          !status
            ? 'border-[#11664b] bg-[#11664b] text-white shadow-sm dark:border-[#10b981] dark:bg-[#10b981] dark:text-[#060a08]'
            : 'border-transparent bg-white text-[#405247] hover:bg-white hover:border-[#11664b]/20 dark:bg-[#131b17] dark:text-[#8da398] dark:hover:bg-[#1a2520] dark:hover:text-[#10b981]',
        )}
      >
        All{' '}
        <span
          className={cn(
            'min-w-7 rounded-full px-2 py-0.5 text-center text-[0.74rem] font-extrabold',
            !status
              ? 'bg-white/20 text-white dark:bg-[#060a08]/15 dark:text-[#060a08]'
              : 'bg-[#11664b]/10 text-[#11664b] dark:bg-[#10b981]/15 dark:text-[#10b981]',
          )}
        >
          {tasks.length}
        </span>
      </Link>
      {filterStatuses.map((option) => (
        <Link
          href={hrefForStatus(option)}
          className={cn(
            'inline-flex items-center gap-[0.55rem] rounded-full border px-4 py-2 text-[0.88rem] font-semibold transition hover:-translate-y-px',
            status === option
              ? 'border-[#11664b] bg-[#11664b] text-white shadow-sm dark:border-[#10b981] dark:bg-[#10b981] dark:text-[#060a08]'
              : 'border-transparent bg-white text-[#405247] hover:bg-white hover:border-[#11664b]/20 dark:bg-[#131b17] dark:text-[#8da398] dark:hover:bg-[#1a2520] dark:hover:text-[#10b981]',
          )}
          key={option}
        >
          {statusLabels[option]}{' '}
          <span
            className={cn(
              'min-w-7 rounded-full px-2 py-0.5 text-center text-[0.74rem] font-extrabold',
              status === option
                ? 'bg-white/20 text-white dark:bg-[#060a08]/15 dark:text-[#060a08]'
                : 'bg-[#11664b]/10 text-[#11664b] dark:bg-[#10b981]/15 dark:text-[#10b981]',
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
              'group border-b border-[#edf1ee] bg-white last:border-b-0 open:bg-[#fbfdfb] dark:border-[#222c26] dark:bg-[#0f1512] dark:open:bg-[#131b17]/60 transition-all duration-250',
              statusBorderClass[task.status],
            )}
            key={task.id}
          >
            <summary className="grid cursor-pointer list-none grid-cols-[1fr_auto] items-center gap-4 px-4 py-3.5 transition hover:bg-[#f6fbf6] dark:hover:bg-[#1a2520]/40 sm:grid-cols-[1.1fr_1fr_auto] [&::-webkit-details-marker]:hidden">
              <div className="min-w-0">
                <p className="m-0 truncate text-[0.98rem] font-bold text-[#16221d] dark:text-[#ecf2ee]">
                  {task.external_task_id}
                </p>
                <p className="m-0 mt-1 truncate text-[0.82rem] text-[#68766e] dark:text-[#8da398]">
                  {task.task_language} | {task.step_range} steps
                  {task.application ? ` | ${task.application}` : ''}
                </p>
              </div>
              <div className="hidden min-w-0 text-[0.84rem] text-[#68766e] dark:text-[#8da398] sm:block">
                <span className="font-semibold text-[#11664b] dark:text-[#10b981]">
                  {money(task.fee_cents)}
                </span>{' '}
                | {dateLabel(task.created_at)} | {task.rework_count} reworks
                {showAssignee ? (
                  <span className="block truncate">
                    Worker:{' '}
                    {assigneeNames[task.assigned_to] ?? task.assigned_to}
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status={task.status} />
                <span className="hidden text-[0.8rem] font-bold text-[#11664b] dark:text-[#10b981] group-open:hidden md:inline">
                  View
                </span>
                <span className="hidden text-[0.8rem] font-bold text-[#68766e] dark:text-[#8da398] group-open:inline md:inline">
                  Close
                </span>
              </div>
            </summary>

            <div className="border-t border-[#edf1ee] dark:border-[#222c26] px-4 py-5">
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
                  className="mt-4 grid gap-4 rounded-2xl border border-[#edf1ee] dark:border-[#222c26] bg-[#fbfdfb] dark:bg-[#131b17] p-4 shadow-[0_10px_30px_rgba(17,102,75,0.02)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
                >
                  <input type="hidden" name="return_path" value={returnPath} />
                  <label className={labelClass}>
                    Reassign pending task
                    <select
                      className={cn(inputClass, 'dark:bg-[#1a231f]')}
                      name="assigned_to"
                      defaultValue={task.assigned_to}
                      required
                    >
                      {users.map((user) => (
                        <option key={user.id} value={user.id} className="dark:bg-[#131b17]">
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
              {actions(task)}
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
  searchParams: Promise<{
    notice?: string;
    error?: string;
    status?: string;
    project?: string;
  }>;
}) {
  const { supabase, profile } = await requireProfile();
  const { notice, error, status, project } = await searchParams;
  const activeStatus = selectedStatus(status);
  const projects = await getActiveProjects(supabase);
  const selectedProject = findProjectBySlug(projects, project);
  const projectSlug = selectedProject?.slug;
  const tasksPath = projectSlug
    ? `/tasks?project=${encodeURIComponent(projectSlug)}`
    : '/tasks';

  if (profile.role === 'admin') {
    const [{ data }, { data: usersData }] = await Promise.all([
      supabase
        .from('tasks')
        .select('*')
        .eq('project_id', selectedProject?.id ?? '')
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

    const meta = projectStatusMeta[selectedProject.status];

    return (
      <>
        <TaskRulesSidebar />
        <PageHeader
          eyebrow="Administration"
          title="Tasks"
          subtitle={`A compact list for ${selectedProject?.name ?? 'the selected project'}. Open a row to view details and actions.`}
          rightSide={
            <span
              className={cn(
                'inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-[0.82rem] font-bold',
                meta.tone,
              )}
            >
              {meta.label}
            </span>
          }
        />
        <Message notice={notice} error={error} />
        <TaskRateAnnouncement project={selectedProject} />
        <TaskStatusFilter
          status={activeStatus}
          tasks={tasks}
          projectSlug={projectSlug}
        />
        <section className="my-6 flex flex-col gap-5 rounded-2xl border border-[#edf3ef] bg-[linear-gradient(135deg,rgba(231,243,237,0.7)_0%,rgba(255,255,255,0.85)_100%)] dark:border-[#1d2721] dark:bg-[linear-gradient(135deg,#13281f_0%,rgba(15,21,18,0.4)_100%)] p-[1.8rem] shadow-[0_4px_20px_rgba(22,34,29,0.02)] sm:flex-row sm:items-center sm:justify-between transition-all duration-300">
          <div>
            <p className={eyebrowClass}>Task summary</p>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#11664b] shadow-[0_10px_24px_rgba(17,102,75,0.08)] dark:bg-[#0f1512] dark:text-[#10b981] dark:shadow-none">
                <ClipboardIcon className="h-5 w-5" />
              </span>
              <h2 className="m-0 text-[1.15rem] font-semibold tracking-[-0.025em] text-[#16221d] dark:text-[#ecf2ee]">
                {displayedTasks.length} visible tasks
              </h2>
            </div>
            <p className="mt-2.5 max-w-[520px] text-[0.95rem] leading-[1.7] text-[#68766e] dark:text-[#8da398]">
              Click a task row to expand the URL, prompt, payment, rework count,
              and available review actions.
            </p>
          </div>
          <Link
            href={
              projectSlug
                ? `/tasks/assign?project=${encodeURIComponent(projectSlug)}`
                : '/tasks/assign'
            }
            className={buttonClass}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Assign task
          </Link>
        </section>
        <TaskList
          tasks={displayedTasks}
          showAssignee
          users={users}
          assigneeNames={assigneeNames}
          returnPath={tasksPath}
          emptyMessage={`No ${
            activeStatus ? statusLabels[activeStatus].toLowerCase() : ''
          } tasks found.`}
          actions={(task) =>
            task.status === 'completed' ? (
              <form
                action={startReview.bind(null, task.id, task.assigned_to)}
                className="mt-5 grid gap-3 rounded-2xl border border-[#edf1ee] bg-white/80 p-4 sm:grid-cols-[minmax(180px,260px)_auto] sm:items-end"
              >
                <input type="hidden" name="return_path" value={tasksPath} />
                <label className={labelClass}>
                  Final step count
                  <input
                    className={inputClass}
                    name="final_step_count"
                    type="number"
                    min="1"
                    step="1"
                    required
                    defaultValue={task.final_step_count ?? ''}
                    placeholder="Adjust if needed"
                  />
                </label>
                <SubmitButton
                  label="Move to review"
                  pendingLabel="Moving to review..."
                  className={buttonClass}
                />
                <p className="m-0 text-[0.82rem] leading-5 text-[#68766e] sm:col-span-2">
                  The task fee will recalculate automatically from this final
                  step count when moved to review.
                </p>
              </form>
            ) : task.status === 'under_review' ? (
              <form
                action={decideTask.bind(null, task.id, task.assigned_to)}
                className="mt-5 rounded-2xl border border-[#edf1ee] bg-white/80 p-4"
              >
                <input type="hidden" name="return_path" value={tasksPath} />
                <textarea
                  className={inputClass}
                  name="admin_comment"
                  rows={2}
                  placeholder="Feedback required for rework; optional otherwise."
                />
                <div className={actionsClass}>
                  <SubmitButton
                    label="Approve"
                    pendingLabel="Approving..."
                    className={buttonClass}
                    name="status"
                    value="approved"
                    confirmMessage={`Approve task ${task.external_task_id}? This will add the task fee to the worker's earnings.`}
                  />
                  <SubmitButton
                    label="Request rework"
                    pendingLabel="Requesting..."
                    className={warningButtonClass}
                    name="status"
                    value="rework"
                  />
                  <SubmitButton
                    label="Reject"
                    pendingLabel="Rejecting..."
                    className={dangerButtonClass}
                    name="status"
                    value="rejected"
                  />
                </div>
              </form>
            ) : task.status === 'approved' ? (
              <form
                action={revertTaskApproval.bind(
                  null,
                  task.id,
                  task.assigned_to,
                )}
                className={actionsClass}
              >
                <input type="hidden" name="return_path" value={tasksPath} />
                <SubmitButton
                  label="Revert approval"
                  pendingLabel="Reverting..."
                  baseClassName={secondaryButtonClass}
                  confirmMessage={`Revert approval for task ${task.external_task_id}? It will move back to under review.`}
                />
              </form>
            ) : null
          }
        />
      </>
    );
  }

  const { data } = await supabase.rpc('get_my_tasks');
  const tasks = ((data ?? []) as Task[]).filter((task) =>
    selectedProject ? task.project_id === selectedProject.id : true,
  );
  const displayedTasks = activeStatus
    ? tasks.filter((task) => task.status === activeStatus)
    : tasks;

  const meta = projectStatusMeta[selectedProject.status];

  return (
    <>
      <TaskRulesSidebar />
      <PageHeader
        eyebrow="Work queue"
        title="Tasks"
        subtitle={`A slim list for ${selectedProject?.name ?? 'the selected project'}. Open a row to view the full prompt, URL, and actions.`}
        rightSide={
          <span
            className={cn(
              'inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-[0.82rem] font-bold',
              meta.tone,
            )}
          >
            {meta.label}
          </span>
        }
      />
      <Message notice={notice} error={error} />
      <TaskRateAnnouncement project={selectedProject} />
      <section className="mb-5 rounded-2xl border border-[#f3d79d] bg-[#fff8ea] px-4 py-3 text-[0.92rem] leading-6 text-[#6a4a12] dark:border-[#ff9800]/25 dark:bg-[#ff9800]/8 dark:text-amber-200">
        <strong className="text-[#9a6408] dark:text-amber-400">Quality reminder:</strong> tasks sent
        back for rework more than once may have their fee reduced. Review the
        prompt carefully before submitting.
      </section>
      <TaskStatusFilter
        status={activeStatus}
        tasks={tasks}
        projectSlug={projectSlug}
      />
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
