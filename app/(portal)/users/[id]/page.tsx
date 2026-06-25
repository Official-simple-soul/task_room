import {
  addTask,
  decideTask,
  deleteTask,
  reassignTask,
  revertTaskApproval,
  startReview,
  updateTask,
} from '@/app/actions/tasks';
import { ClipboardIcon, EditIcon, PlusIcon } from '@/components/icons';
import { Message } from '@/components/message';
import { PageHeader } from '@/components/page-header';
import { StatusPill } from '@/components/status-pill';
import { SubmitButton } from '@/components/submit-button';
import { TaskFormFields } from '@/components/task-form-fields';
import { TaskPrompt } from '@/components/task-prompt';
import { TaskRateAnnouncement } from '@/components/task-rate-announcement';
import { requireProfile } from '@/lib/auth';
import { dateLabel, money } from '@/lib/format';
import { getActiveProjects } from '@/lib/projects';
import {
  actionsClass,
  buttonClass,
  commentClass,
  dangerButtonClass,
  emptyClass,
  fieldGridClass,
  hiddenUrlClass,
  inputClass,
  labelClass,
  panelClass,
  secondaryButtonClass,
  statusBorderClass,
  taskCardClass,
  taskGridClass,
  taskLinkClass,
  taskTitleClass,
  warningButtonClass,
} from '@/lib/styles';
import type { Task } from '@/lib/types';

const deletableStatuses = ['pending', 'rework', 'rejected'];

export default async function UserDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const { id } = await params;
  const { notice, error } = await searchParams;
  const { supabase } = await requireProfile('admin');
  const [{ data: user }, { data }, { data: usersData }, projects] =
    await Promise.all([
    supabase
      .from('profiles')
      .select(
        'id, full_name, payment_bank_name, payment_account_number, payment_account_name',
      )
      .eq('id', id)
      .eq('role', 'user')
      .single(),
    supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'user')
      .order('full_name'),
    getActiveProjects(supabase),
  ]);
  if (!user) return <p>User not found.</p>;
  const tasks = (data ?? []) as Task[];
  const users = (usersData ?? []) as Array<{ id: string; full_name: string }>;

  return (
    <>
      <PageHeader
        eyebrow="User account"
        title={user.full_name || 'Unnamed user'}
        subtitle={`${tasks.length} assignments | ${money(tasks.filter((task) => task.status === 'approved').reduce((sum, task) => sum + task.fee_cents, 0))} approved`}
      />
      <Message notice={notice} error={error} />
      <TaskRateAnnouncement project={projects[0]} />
      <section className={panelClass}>
        <div className="mb-[1.15rem] flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f3ed] text-[#11664b]">
            <ClipboardIcon className="h-5 w-5" />
          </span>
          <h2 className="m-0 text-[1.15rem] font-semibold tracking-[-0.025em]">
            Payment details
          </h2>
        </div>
        <dl className="grid gap-4 sm:grid-cols-3 [&_dd]:mt-1.5 [&_dd]:font-bold [&_dt]:text-[0.78rem] [&_dt]:text-[#68766e]">
          <div>
            <dt>Bank</dt>
            <dd>{user.payment_bank_name || '-'}</dd>
          </div>
          <div>
            <dt>Account number</dt>
            <dd>{user.payment_account_number || '-'}</dd>
          </div>
          <div>
            <dt>Account name</dt>
            <dd>{user.payment_account_name || '-'}</dd>
          </div>
        </dl>
      </section>
      <section className={panelClass}>
        <div className="mb-[1.15rem] flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f3ed] text-[#11664b]">
            <PlusIcon className="h-5 w-5" />
          </span>
          <h2 className="m-0 text-[1.15rem] font-semibold tracking-[-0.025em]">
            Assign new task
          </h2>
        </div>
        <form action={addTask.bind(null, id)} className={fieldGridClass}>
          <TaskFormFields projects={projects} />
          <SubmitButton label="Assign task" pendingLabel="Assigning..." />
        </form>
      </section>
      <section className={panelClass}>
        <div className="mb-[1.15rem] flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f3ed] text-[#11664b]">
            <ClipboardIcon className="h-5 w-5" />
          </span>
          <h2 className="m-0 text-[1.15rem] font-semibold tracking-[-0.025em]">
            Task history
          </h2>
        </div>
        <div className={taskGridClass}>
          {tasks.map((task) => (
            <article
              className={`${taskCardClass} ${statusBorderClass[task.status]}`}
              key={task.id}
            >
              <div className={taskTitleClass}>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e7f3ed] text-[#11664b]">
                  <ClipboardIcon className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <h3 className="m-0 text-[1.18rem] tracking-[-0.03em]">
                    {task.external_task_id}
                  </h3>
                  <p className="m-0 text-[0.92rem] text-[#4c5b51]">
                    {task.task_language} | {task.step_range} steps |{' '}
                    {money(task.fee_cents)} | {dateLabel(task.created_at)} |{' '}
                    {task.rework_count} reworks
                  </p>
                  <p className="mt-1 text-[0.88rem] font-medium text-[#68766e]">
                    Final steps: {task.final_step_count ?? 'Not submitted yet'}
                  </p>
                  {task.application && (
                    <p className="mt-1 text-[0.88rem] font-medium text-[#68766e]">
                      Application: {task.application}
                    </p>
                  )}
                </div>
                <StatusPill status={task.status} />
              </div>
              <TaskPrompt prompt={task.prompt} />
              {task.status !== 'approved' && (
                <details className="mt-4 rounded-2xl border border-[#edf1ee] bg-white/70 p-4">
                  <summary className="flex w-fit cursor-pointer list-none items-center gap-2 rounded-xl bg-[#e7f3ed] px-3 py-2 text-[0.9rem] font-semibold text-[#11664b] transition hover:-translate-y-px [&::-webkit-details-marker]:hidden">
                    <EditIcon className="h-4 w-4" />
                    Edit task
                  </summary>
                  <form
                    action={updateTask.bind(null, task.id, id)}
                    className="mt-4"
                  >
                    <h4 className="mb-3 text-[0.95rem] font-semibold text-[#16221d]">
                      Edit task details
                    </h4>
                    <div className={fieldGridClass}>
                      <TaskFormFields
                        defaults={task}
                        projects={projects}
                        promptRows={3}
                      />
                      <SubmitButton
                        label="Save task changes"
                        pendingLabel="Saving task..."
                      />
                    </div>
                  </form>
                </details>
              )}
              {task.status === 'pending' && (
                <form
                  action={reassignTask.bind(null, task.id)}
                  className="mt-4 grid gap-4 rounded-2xl border border-[#edf1ee] bg-white/90 p-4 shadow-[0_10px_30px_rgba(17,102,75,0.05)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
                >
                  <input
                    type="hidden"
                    name="return_path"
                    value={`/users/${id}`}
                  />
                  <label className={labelClass}>
                    Reassign pending task
                    <select
                      className={inputClass}
                      name="assigned_to"
                      defaultValue={task.assigned_to}
                      required
                    >
                      {users.map((worker) => (
                        <option key={worker.id} value={worker.id}>
                          {worker.full_name || 'Unnamed worker'}
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
              {task.task_url ? (
                <a
                  className={taskLinkClass}
                  href={task.task_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {task.task_url}
                </a>
              ) : (
                <p className={hiddenUrlClass}>No task URL available.</p>
              )}
              {deletableStatuses.includes(task.status) && (
                <form
                  action={deleteTask.bind(null, task.id)}
                  className={actionsClass}
                >
                  <input
                    type="hidden"
                    name="return_path"
                    value={`/users/${id}`}
                  />
                  <SubmitButton
                    label="Delete task"
                    pendingLabel="Deleting..."
                    className={dangerButtonClass}
                  />
                </form>
              )}
              {task.admin_comment && (
                <div className={commentClass}>
                  <strong>Feedback</strong>
                  {task.admin_comment}
                </div>
              )}
              {task.status === 'completed' && (
                <form
                  action={startReview.bind(null, task.id, id)}
                  className="mt-5 grid gap-3 rounded-2xl border border-[#edf1ee] bg-white/80 p-4 sm:grid-cols-[minmax(180px,260px)_auto] sm:items-end"
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
              )}
              {task.status === 'under_review' && (
                <form
                  action={decideTask.bind(null, task.id, id)}
                  className="mt-4"
                >
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
              )}
              {task.status === 'approved' && (
                <form
                  action={revertTaskApproval.bind(null, task.id, id)}
                  className={actionsClass}
                >
                  <SubmitButton
                    label="Revert approval"
                    pendingLabel="Reverting..."
                    baseClassName={secondaryButtonClass}
                    confirmMessage={`Revert approval for task ${task.external_task_id}? It will move back to under review.`}
                  />
                </form>
              )}
            </article>
          ))}
          {!tasks.length && (
            <p className={emptyClass}>This user has no assigned tasks.</p>
          )}
        </div>
      </section>
    </>
  );
}
