import { addTask, decideTask, startReview } from '@/app/actions/tasks';
import { ClipboardIcon, PlusIcon, UserIcon } from '@/components/icons';
import { Message } from '@/components/message';
import { PageHeader } from '@/components/page-header';
import { StatusPill } from '@/components/status-pill';
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
  taskPromptClass,
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
      .select('id, full_name')
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
          <button className={buttonClass} type="submit">
            <PlusIcon className="mr-2 h-4 w-4" />
            Assign task
          </button>
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
                    {money(task.fee_cents)} | {dateLabel(task.created_at)}
                  </p>
                </div>
                <StatusPill status={task.status} />
              </div>
              <p className={taskPromptClass}>{task.prompt}</p>
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
                  <button className={buttonClass}>Move to review</button>
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
                    <button
                      className={buttonClass}
                      name="status"
                      value="approved"
                    >
                      Approve
                    </button>
                    <button
                      className={warningButtonClass}
                      name="status"
                      value="rework"
                    >
                      Request rework
                    </button>
                    <button
                      className={dangerButtonClass}
                      name="status"
                      value="rejected"
                    >
                      Reject
                    </button>
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
