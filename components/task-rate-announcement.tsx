import { DollarIcon } from '@/components/icons';
import { bucketFeeDollars, bucketLabel, sortProjectBuckets } from '@/lib/projects';
import { taskPaymentRates } from '@/lib/task-rates';
import type { Project } from '@/lib/types';

export function TaskRateAnnouncement({ project }: { project?: Project | null }) {
  const projectRates = sortProjectBuckets(project?.project_task_buckets);
  const rates = projectRates.length
    ? projectRates.map((bucket) => ({
        range: bucketLabel(bucket),
        price: `$${bucketFeeDollars(bucket)}`,
      }))
    : taskPaymentRates;

  return (
    <section className="mb-5 overflow-hidden rounded-[24px] border border-[rgba(17,102,75,0.14)] bg-[radial-gradient(circle_at_top_right,rgba(22,164,102,0.18),transparent_32%),linear-gradient(135deg,#0f5f46_0%,#11664b_45%,#163228_100%)] p-5 text-white shadow-[0_22px_60px_rgba(22,34,29,0.14)]">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur">
            <DollarIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="m-0 text-[0.75rem] font-bold uppercase tracking-[0.14em] text-white/70">
              Updated task payment
            </p>
            <h2 className="m-0 mt-1 text-[1.2rem] font-bold tracking-[-0.03em]">
              {project ? `${project.name} rates apply moving forward` : 'New task rates apply moving forward'}
            </h2>
          </div>
        </div>
        <p className="m-0 max-w-[420px] text-[0.9rem] leading-6 text-white/75">
          Fees are based on the expected step count. Admin can still override a
          task fee when needed.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {rates.map((rate) => (
          <div
            key={rate.range}
            className="rounded-2xl border border-white/10 bg-white/12 px-4 py-3 backdrop-blur"
          >
            <span className="block text-[0.78rem] font-semibold text-white/65">
              {rate.range} steps
            </span>
            <strong className="mt-1 block text-[1.2rem] tracking-[-0.04em]">
              {rate.price}
            </strong>
          </div>
        ))}
      </div>
    </section>
  );
}
