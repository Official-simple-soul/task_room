import { requireProfile } from '@/lib/auth';
import { Message } from '@/components/message';
import { addTaskGlobal } from '@/app/actions/tasks';
import Link from 'next/link';
import { ClipboardIcon, PlusIcon } from '@/components/icons';
import { PageHeader } from '@/components/page-header';
import {
  buttonClass,
  fieldGridClass,
  inputClass,
  labelClass,
  panelClass,
  textButtonClass,
} from '@/lib/styles';

const ranges = ['10-25', '25-50', '50-75', '75-100', '100-130', '130-200'];

type UserOption = {
  id: string;
  full_name: string;
};

export default async function AssignTaskPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const { supabase } = await requireProfile('admin');
  const { notice, error } = await searchParams;
  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'user')
    .order('full_name');

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Assign task"
        subtitle="Create a new assignment and select the worker to assign it to."
      />
      <Message notice={notice} error={error} />
      <section className={panelClass}>
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f3ed] text-[#11664b]">
            <ClipboardIcon className="h-5 w-5" />
          </span>
          <h2 className="m-0 text-[1.15rem] font-semibold tracking-[-0.025em]">
            Task details
          </h2>
        </div>
        <form action={addTaskGlobal} className={fieldGridClass}>
          <label className={labelClass}>
            Assign to
            <select className={inputClass} name="assigned_to" required>
              <option value="">Select worker</option>
              {((users ?? []) as UserOption[]).map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name}
                </option>
              ))}
            </select>
          </label>
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
              {ranges.map((r) => (
                <option key={r}>{r}</option>
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
          <div className="mt-2.5 flex gap-2.5">
            <button className={buttonClass} type="submit">
              <PlusIcon className="mr-2 h-4 w-4" />
              Assign task
            </button>
            <Link href="/tasks" className={textButtonClass}>
              Back to tasks
            </Link>
          </div>
        </form>
      </section>
    </>
  );
}
