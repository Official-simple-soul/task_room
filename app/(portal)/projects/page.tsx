import { createProject, deleteProject, updateProject } from '@/app/actions/projects';
import { ClipboardIcon, EditIcon, PlusIcon } from '@/components/icons';
import { Message } from '@/components/message';
import { PageHeader } from '@/components/page-header';
import { ProjectBucketFields } from '@/components/project-bucket-fields';
import { SubmitButton } from '@/components/submit-button';
import { requireProfile } from '@/lib/auth';
import { bucketFeeDollars, bucketLabel, sortProjectBuckets } from '@/lib/projects';
import {
  dangerButtonClass,
  fieldGridClass,
  inputClass,
  labelClass,
  panelClass,
  secondaryButtonClass,
} from '@/lib/styles';
import type { Project } from '@/lib/types';

const defaultBuckets = [
  { label: '10-25', min: 10, max: 25, fee: '3.00' },
  { label: '26-50', min: 26, max: 50, fee: '3.50' },
  { label: '51-75', min: 51, max: 75, fee: '4.50' },
  { label: '76-130', min: 76, max: 130, fee: '6.00' },
  { label: '130-200', min: 130, max: 200, fee: '9.00' },
];

const projectStatusLabels = {
  in_progress: 'In progress',
  paused: 'Paused',
  closed: 'Closed',
} as const;

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const { supabase } = await requireProfile('admin');
  const { notice, error } = await searchParams;
  const { data } = await supabase
    .from('projects')
    .select(
      'id, name, slug, logo_url, description, status, project_task_buckets(id, project_id, label, min_steps, max_steps, fee_cents, sort_order)',
    )
    .order('created_at', { ascending: false });
  const projects = (data ?? []) as Project[];

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Projects"
        subtitle="Create workspaces with their own task buckets and payment rates."
      />
      <Message notice={notice} error={error} />
      <section className={panelClass}>
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f3ed] text-[#11664b] dark:bg-[#10b981]/15 dark:text-[#10b981]">
            <PlusIcon className="h-5 w-5" />
          </span>
          <h2 className="m-0 text-[1.15rem] font-semibold tracking-[-0.025em]">
            Create project
          </h2>
        </div>
        <form action={createProject} className="grid gap-6">
          <div className={fieldGridClass}>
            <label className={labelClass}>
              Project name
              <input
                className={inputClass}
                name="name"
                required
                placeholder="mm-eagle-os-world-2-tech"
              />
            </label>
            <label className={labelClass}>
              Slug
              <input
                className={inputClass}
                name="slug"
                placeholder="Auto-generated if empty"
              />
            </label>
            <label className={labelClass}>
              Logo URL
              <input
                className={inputClass}
                name="logo_url"
                type="url"
                placeholder="Optional"
              />
            </label>
            <label className={`${labelClass} md:col-span-3`}>
              Description
              <textarea
                className={inputClass}
                name="description"
                rows={3}
                placeholder="Optional project notes for admin context."
              />
            </label>
          </div>
          <div>
            <h3 className="mb-3 text-[0.95rem] font-semibold text-[#16221d] dark:text-[#ecf2ee]">
              Payment buckets
            </h3>
            <ProjectBucketFields defaults={defaultBuckets} />
          </div>
          <SubmitButton label="Create project" pendingLabel="Creating..." />
        </form>
      </section>
      <section className={panelClass}>
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f3ed] text-[#11664b] dark:bg-[#10b981]/15 dark:text-[#10b981]">
            <ClipboardIcon className="h-5 w-5" />
          </span>
          <h2 className="m-0 text-[1.15rem] font-semibold tracking-[-0.025em]">
            Existing projects
          </h2>
        </div>
        <div className="grid gap-4">
          {projects.map((project) => (
            <article
              className="rounded-2xl border border-[#edf1ee] bg-white p-4 shadow-sm dark:border-[#1d2721] dark:bg-[#0f1512]"
              key={project.id}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="m-0 text-[1.05rem] font-bold text-[#16221d] dark:text-[#ecf2ee]">
                    {project.name}
                  </h3>
                  <p className="m-0 mt-1 text-[0.86rem] text-[#68766e] dark:text-[#8da398]">
                    /tasks?project={project.slug} |{' '}
                    {projectStatusLabels[project.status]}
                  </p>
                  {project.description ? (
                    <p className="mt-2 max-w-[640px] text-[0.9rem] leading-6 text-[#4c5b51] dark:text-[#a4b8ad]">
                      {project.description}
                    </p>
                  ) : null}
                </div>
                <details className="relative">
                  <summary className="cursor-pointer list-none text-[0.9rem] font-semibold text-[#ae3939] dark:text-red-400 [&::-webkit-details-marker]:hidden">
                    Delete
                  </summary>
                  <div className="absolute right-0 z-20 mt-2 w-[280px] rounded-2xl border border-[#f2c9c9] bg-white p-4 text-left shadow-[0_18px_45px_rgba(22,34,29,0.14)] dark:border-[#ef4444]/30 dark:bg-[#131b17] dark:shadow-none">
                    <p className="m-0 text-[0.88rem] leading-5 text-[#5e4826] dark:text-amber-200">
                      Delete {project.name} and its payment buckets. Projects
                      with existing tasks cannot be deleted. This cannot be
                      undone.
                    </p>
                    <form action={deleteProject} className="mt-3">
                      <input type="hidden" name="project_id" value={project.id} />
                      <SubmitButton
                        label="Confirm delete"
                        pendingLabel="Deleting..."
                        className="w-full"
                        baseClassName={dangerButtonClass}
                      />
                    </form>
                  </div>
                </details>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
                {sortProjectBuckets(project.project_task_buckets).map((bucket) => (
                  <div
                    className="rounded-2xl bg-[#f6fbf7] px-4 py-3 dark:bg-[#161d19]"
                    key={bucket.id}
                  >
                    <span className="block text-[0.78rem] font-semibold text-[#68766e] dark:text-[#8da398]">
                      {bucketLabel(bucket)} steps
                    </span>
                    <strong className="mt-1 block text-[1.1rem] text-[#11664b] dark:text-[#10b981]">
                      ${bucketFeeDollars(bucket)}
                    </strong>
                  </div>
                ))}
              </div>
              <details className="mt-4 rounded-2xl border border-[#edf1ee] bg-[#fbfdfb] p-4 dark:border-[#222c26] dark:bg-[#131b17]">
                <summary className="flex w-fit cursor-pointer list-none items-center gap-2 rounded-xl bg-[#e7f3ed] px-3 py-2 text-[0.9rem] font-semibold text-[#11664b] transition hover:-translate-y-px [&::-webkit-details-marker]:hidden dark:bg-[#12281e] dark:text-[#10b981]">
                  <EditIcon className="h-4 w-4" />
                  Edit project
                </summary>
                <form
                  action={updateProject.bind(null, project.id)}
                  className="mt-5 grid gap-6"
                >
                  <div className={fieldGridClass}>
                    <label className={labelClass}>
                      Project name
                      <input
                        className={inputClass}
                        name="name"
                        required
                        defaultValue={project.name}
                      />
                    </label>
                    <label className={labelClass}>
                      Slug
                      <input
                        className={inputClass}
                        name="slug"
                        required
                        defaultValue={project.slug}
                      />
                    </label>
                    <label className={labelClass}>
                      Status
                      <select
                        className={inputClass}
                        name="status"
                        defaultValue={project.status}
                      >
                        <option value="in_progress">In progress</option>
                        <option value="paused">Paused</option>
                        <option value="closed">Closed</option>
                      </select>
                    </label>
                    <label className={labelClass}>
                      Logo URL
                      <input
                        className={inputClass}
                        name="logo_url"
                        type="url"
                        placeholder="Optional"
                        defaultValue={project.logo_url ?? ''}
                      />
                    </label>
                    <label className={`${labelClass} md:col-span-2`}>
                      Description
                      <textarea
                        className={inputClass}
                        name="description"
                        rows={3}
                        defaultValue={project.description ?? ''}
                      />
                    </label>
                  </div>
                  <div>
                    <h4 className="mb-3 text-[0.95rem] font-semibold text-[#16221d] dark:text-[#ecf2ee]">
                      Payment buckets
                    </h4>
                    <ProjectBucketFields
                      buckets={sortProjectBuckets(project.project_task_buckets)}
                    />
                  </div>
                  <SubmitButton
                    label="Save project"
                    pendingLabel="Saving..."
                    baseClassName={secondaryButtonClass}
                    confirmMessage={`Save changes to ${project.name}?`}
                  />
                </form>
              </details>
            </article>
          ))}
          {!projects.length ? (
            <p className="py-3 text-[0.92rem] text-[#68766e] dark:text-[#8da398]">
              No projects have been created yet.
            </p>
          ) : null}
        </div>
      </section>
    </>
  );
}
