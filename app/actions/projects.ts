'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireProfile } from '@/lib/auth';
import { slugifyProjectName } from '@/lib/projects';

const deleteProjectSchema = z.object({
  project_id: z.uuid(),
});

const projectSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().max(120).optional(),
  status: z.enum(['in_progress', 'paused', 'closed']).optional(),
  logo_url: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || null)
    .pipe(z.url().nullable()),
  description: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((value) => value || null),
});

function notice(path: string, message: string, failed = false): never {
  redirect(
    `${path}?${failed ? 'error' : 'notice'}=${encodeURIComponent(message)}`,
  );
}

function parseBucketRows(formData: FormData) {
  const ids = formData.getAll('bucket_id').map(String);
  const labels = formData.getAll('bucket_label').map(String);
  const mins = formData.getAll('bucket_min').map(String);
  const maxes = formData.getAll('bucket_max').map(String);
  const fees = formData.getAll('bucket_fee').map(String);

  return labels
    .map((label, index) => ({
      id: ids[index]?.trim() || null,
      label: label.trim(),
      min_steps: Number(mins[index]),
      max_steps: Number(maxes[index]),
      fee_cents: Math.round(Number(fees[index]) * 100),
      sort_order: index + 1,
    }))
    .filter(
      (bucket) =>
        bucket.label &&
        Number.isInteger(bucket.min_steps) &&
        Number.isInteger(bucket.max_steps) &&
        Number.isFinite(bucket.fee_cents) &&
        bucket.min_steps > 0 &&
        bucket.max_steps >= bucket.min_steps &&
        bucket.fee_cents >= 0,
    );
}

function bucketInsertPayload({
  id,
  ...bucket
}: ReturnType<typeof parseBucketRows>[number]) {
  void id;
  return bucket;
}

export async function createProject(formData: FormData) {
  const { supabase, profile } = await requireProfile('admin');
  const parsed = projectSchema.safeParse(Object.fromEntries(formData));
  const path = '/projects';

  if (!parsed.success) notice(path, 'Please provide valid project details.', true);

  const buckets = parseBucketRows(formData);
  if (!buckets.length) {
    notice(path, 'Add at least one valid payment bucket.', true);
  }

  const slug = slugifyProjectName(parsed.data.slug || parsed.data.name);
  if (!slug) notice(path, 'Project slug could not be generated.', true);

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      name: parsed.data.name,
      slug,
      status: parsed.data.status ?? 'in_progress',
      logo_url: parsed.data.logo_url,
      description: parsed.data.description,
      created_by: profile.id,
    })
    .select('id')
    .single();

  if (error) notice(path, error.message, true);

  const { error: bucketError } = await supabase
    .from('project_task_buckets')
    .insert(
      buckets.map((bucket) => ({
        ...bucketInsertPayload(bucket),
        project_id: project.id,
      })),
    );

  if (bucketError) notice(path, bucketError.message, true);

  revalidatePath('/projects');
  revalidatePath('/tasks');
  revalidatePath('/tasks/assign');
  notice(path, 'Project created successfully.');
}

export async function updateProject(projectId: string, formData: FormData) {
  const { supabase } = await requireProfile('admin');
  const parsed = projectSchema.safeParse(Object.fromEntries(formData));
  const path = '/projects';

  if (!parsed.success) notice(path, 'Please provide valid project details.', true);

  const buckets = parseBucketRows(formData);
  if (!buckets.length) {
    notice(path, 'Add at least one valid payment bucket.', true);
  }

  const slug = slugifyProjectName(parsed.data.slug || parsed.data.name);
  if (!slug) notice(path, 'Project slug could not be generated.', true);

  const { error } = await supabase
    .from('projects')
    .update({
      name: parsed.data.name,
      slug,
      status: parsed.data.status ?? 'in_progress',
      logo_url: parsed.data.logo_url,
      description: parsed.data.description,
    })
    .eq('id', projectId);

  if (error) notice(path, error.message, true);

  const submittedBucketIds = buckets
    .map((bucket) => bucket.id)
    .filter((id): id is string => Boolean(id));

  const { data: existingBuckets, error: existingError } = await supabase
    .from('project_task_buckets')
    .select('id')
    .eq('project_id', projectId);

  if (existingError) notice(path, existingError.message, true);

  const removedBucketIds = (existingBuckets ?? [])
    .map((bucket) => bucket.id as string)
    .filter((id) => !submittedBucketIds.includes(id));

  if (removedBucketIds.length) {
    const { error: deleteError } = await supabase
      .from('project_task_buckets')
      .delete()
      .eq('project_id', projectId)
      .in('id', removedBucketIds);

    if (deleteError) notice(path, deleteError.message, true);
  }

  for (const bucket of buckets) {
    const payload = {
      project_id: projectId,
      label: bucket.label,
      min_steps: bucket.min_steps,
      max_steps: bucket.max_steps,
      fee_cents: bucket.fee_cents,
      sort_order: bucket.sort_order,
    };

    const { error: bucketError } = bucket.id
      ? await supabase
          .from('project_task_buckets')
          .update(payload)
          .eq('id', bucket.id)
          .eq('project_id', projectId)
      : await supabase.from('project_task_buckets').insert(payload);

    if (bucketError) notice(path, bucketError.message, true);
  }

  revalidatePath('/projects');
  revalidatePath('/tasks');
  revalidatePath('/tasks/assign');
  revalidatePath('/users');
  notice(path, 'Project updated successfully.');
}

export async function deleteProject(formData: FormData) {
  const { supabase } = await requireProfile('admin');
  const parsed = deleteProjectSchema.safeParse(Object.fromEntries(formData));
  const path = '/projects';

  if (!parsed.success) notice(path, 'Select a valid project to delete.', true);

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', parsed.data.project_id);

  if (error) {
    if (error.code === '23503') {
      notice(
        path,
        'This project still has tasks assigned to it. Reassign or delete those tasks first.',
        true,
      );
    }
    notice(path, error.message, true);
  }

  revalidatePath('/projects');
  revalidatePath('/tasks');
  revalidatePath('/tasks/assign');
  notice(path, 'Project deleted successfully.');
}
