import {
  addTask,
  decideTask,
  startReview,
  updateTask,
} from '@/app/actions/tasks';
import { ClipboardIcon, PlusIcon } from '@/components/icons';
import { Message } from '@/components/message';
import { PageHeader } from '@/components/page-header';
import { StatusPill } from '@/components/status-pill';
import { SubmitButton } from '@/components/submit-button';
import { TaskPrompt } from '@/components/task-prompt';
import { requireProfile } from '@/lib/auth';
import { dateLabel, money } from '@/lib/format';
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
  statusBorderClass,
  taskCardClass,
  taskGridClass,
  taskLinkClass,
  taskTitleClass,
  warningButtonClass,
} from '@/lib/styles';
import type { Task } from '@/lib/types';

const ranges = ['10-25', '25-50', '50-75', '75-100', '100-130', '130-200'];

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
  const [{ data: user }, { data }] = await Promise.all([
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
  ]);
  if (!user) return <p>User not found.</p>;
  const tasks = (data ?? []) as Task[];

  return (
    <>
      <PageHeader
        eyebrow="User account"
        title={user.full_name || 'Unnamed user'}
        subtitle={`${tasks.length} assignments | ${money(tasks.filter((task) => task.status === 'approved').reduce((sum, task) => sum + task.fee_cents, 0))} approved`}
      />
      <Message notice={notice} error={error} />
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
          <label className={labelClass}>
            Task ID
            <input
              className={inputClass}
              name="external_task_id"
              required
              placeholder="TASK-002"
            />
          </label>
          <label className={labelClass}>
            URL
            <input
              className={inputClass}
              name="task_url"
              type="url"
              required
              placeholder="https://..."
            />
          </label>
          <label className={labelClass}>
            Expected steps
            <select className={inputClass} name="step_range">
              {ranges.map((range) => (
                <option key={range}>{range}</option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Language
            <input
              className={inputClass}
              name="task_language"
              required
              placeholder="Python"
            />
          </label>
          <label className={labelClass}>
            Application name
            <input
              className={inputClass}
              name="application"
              placeholder="Visual Studio Code"
            />
          </label>
          <label className={labelClass}>
            Fee (USD)
            <input
              className={inputClass}
              name="fee"
              type="number"
              min="0"
              step="0.01"
              defaultValue="3.00"
            />
          </label>
          <label className={`${labelClass} md:col-span-3`}>
            Task prompt
            <textarea
              className={inputClass}
              name="prompt"
              rows={4}
              required
              placeholder="Describe the task and acceptance criteria."
            />
          </label>
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
                <form
                  action={updateTask.bind(null, task.id, id)}
                  className="mt-4 rounded-2xl border border-[#edf1ee] bg-white/70 p-4"
                >
                  <h4 className="mb-3 text-[0.95rem] font-semibold text-[#16221d]">
                    Edit task details
                  </h4>
                  <div className={fieldGridClass}>
                    <label className={labelClass}>
                      Task ID
                      <input
                        className={inputClass}
                        name="external_task_id"
                        required
                        defaultValue={task.external_task_id}
                      />
                    </label>
                    <label className={labelClass}>
                      URL
                      <input
                        className={inputClass}
                        name="task_url"
                        type="url"
                        required
                        defaultValue={task.task_url ?? ''}
                      />
                    </label>
                    <label className={labelClass}>
                      Expected steps
                      <select
                        className={inputClass}
                        name="step_range"
                        defaultValue={task.step_range}
                      >
                        {ranges.map((range) => (
                          <option key={range}>{range}</option>
                        ))}
                      </select>
                    </label>
                    <label className={labelClass}>
                      Language
                      <input
                        className={inputClass}
                        name="task_language"
                        required
                        defaultValue={task.task_language}
                      />
                    </label>
                    <label className={labelClass}>
                      Application name
                      <input
                        className={inputClass}
                        name="application"
                        defaultValue={task.application ?? ''}
                      />
                    </label>
                    <label className={labelClass}>
                      Fee (USD)
                      <input
                        className={inputClass}
                        name="fee"
                        type="number"
                        min="0"
                        step="0.01"
                        defaultValue={(task.fee_cents / 100).toFixed(2)}
                      />
                    </label>
                    <label className={`${labelClass} md:col-span-3`}>
                      Task prompt
                      <textarea
                        className={inputClass}
                        name="prompt"
                        rows={3}
                        required
                        defaultValue={task.prompt}
                      />
                    </label>
                    <SubmitButton
                      label="Save task changes"
                      pendingLabel="Saving task..."
                    />
                  </div>
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
              {task.admin_comment && (
                <div className={commentClass}>
                  <strong>Feedback</strong>
                  {task.admin_comment}
                </div>
              )}
              {task.status === 'completed' && (
                <form
                  action={startReview.bind(null, task.id, id)}
                  className={actionsClass}
                >
                  <SubmitButton
                    label="Move to review"
                    pendingLabel="Moving to review..."
                    className={buttonClass}
                  />
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
