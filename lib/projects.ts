import type { SupabaseClient } from '@supabase/supabase-js';
import type { Project, ProjectBucket } from '@/lib/types';

export const defaultProjectSlug = 'mm-eagle-os-world-1-tech';

export function slugifyProjectName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

export function bucketLabel(bucket: Pick<ProjectBucket, 'label' | 'min_steps' | 'max_steps'>) {
  return bucket.label || `${bucket.min_steps}-${bucket.max_steps}`;
}

export function bucketFeeDollars(bucket: Pick<ProjectBucket, 'fee_cents'>) {
  return (bucket.fee_cents / 100).toFixed(2);
}

export function sortProjectBuckets(buckets: ProjectBucket[] | null | undefined) {
  return [...(buckets ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order || a.min_steps - b.min_steps,
  );
}

export function bucketForStepCount(
  buckets: ProjectBucket[] | null | undefined,
  stepCount: number,
) {
  return sortProjectBuckets(buckets)
    .find((bucket) => stepCount >= bucket.min_steps && stepCount <= bucket.max_steps);
}

export function compatibleStepRangeForBucket(
  bucket: Pick<ProjectBucket, 'min_steps' | 'max_steps'>,
) {
  if (bucket.max_steps <= 25) return '10-25';
  if (bucket.max_steps <= 50) return '26-50';
  if (bucket.max_steps <= 75) return '51-75';
  if (bucket.max_steps <= 130) return '76-130';
  return '130-200';
}

export function feeCentsFromDollars(value: number | undefined, fallback: number) {
  if (typeof value === 'number') return Math.round(value * 100);
  return fallback;
}

export async function getActiveProjects(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('projects')
    .select(
      'id, name, slug, logo_url, description, status, project_task_buckets(id, project_id, label, min_steps, max_steps, fee_cents, sort_order)',
    )
    .neq('status', 'closed')
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []) as Project[];
}

export function firstProjectSlug(projects: Project[]) {
  return projects[0]?.slug ?? defaultProjectSlug;
}

export function findProjectBySlug(projects: Project[], slug?: string | null) {
  return projects.find((project) => project.slug === slug) ?? projects[0] ?? null;
}
