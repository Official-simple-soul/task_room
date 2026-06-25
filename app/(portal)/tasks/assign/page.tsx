import { requireProfile } from '@/lib/auth';
import { Message } from '@/components/message';
import { addTaskGlobal } from '@/app/actions/tasks';
import Link from 'next/link';
import { ClipboardIcon } from '@/components/icons';
import { PageHeader } from '@/components/page-header';
import { SubmitButton } from '@/components/submit-button';
import { TaskFormFields } from '@/components/task-form-fields';
import { TaskRateAnnouncement } from '@/components/task-rate-announcement';
import { findProjectBySlug, getActiveProjects } from '@/lib/projects';
import {
  fieldGridClass,
  inputClass,
  labelClass,
  panelClass,
  textButtonClass,
} from '@/lib/styles';

type UserOption = {
  id: string;
  full_name: string;
};

export default async function AssignTaskPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string; project?: string }>;
}) {
  const { supabase } = await requireProfile('admin');
  const { notice, error, project } = await searchParams;
  const [{ data: users }, projects] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'user')
      .order('full_name'),
    getActiveProjects(supabase),
  ]);
  const selectedProject = findProjectBySlug(projects, project);
  const tasksPath = selectedProject
    ? `/tasks?project=${encodeURIComponent(selectedProject.slug)}`
    : '/tasks';

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Assign task"
        subtitle="Create a new assignment and select the worker to assign it to."
      />
      <Message notice={notice} error={error} />
      <TaskRateAnnouncement project={selectedProject} />
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
          <input type="hidden" name="return_path" value={tasksPath} />
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
          <TaskFormFields
            projects={projects}
            defaultProjectId={selectedProject?.id}
          />
          <div className="mt-2.5 flex gap-2.5">
            <SubmitButton label="Assign task" pendingLabel="Assigning..." />
            <Link href={tasksPath} className={textButtonClass}>
              Back to tasks
            </Link>
          </div>
        </form>
      </section>
    </>
  );
}
