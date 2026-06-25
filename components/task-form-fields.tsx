'use client';

import { useState } from 'react';
import {
  bucketFeeDollars,
  bucketLabel,
  compatibleStepRangeForBucket,
  sortProjectBuckets,
} from '@/lib/projects';
import { inputClass, labelClass } from '@/lib/styles';
import type { Project, ProjectBucket } from '@/lib/types';

type TaskFormDefaults = {
  external_task_id?: string;
  task_url?: string | null;
  step_range?: string;
  project_id?: string;
  task_bucket_id?: string | null;
  task_language?: string;
  application?: string | null;
  fee_cents?: number;
  prompt?: string;
};

type TaskFormFieldsProps = {
  defaults?: TaskFormDefaults;
  promptRows?: number;
  projects: Project[];
  defaultProjectId?: string;
};

function moneyInputValue(cents: number) {
  return (cents / 100).toFixed(2);
}

function firstBucket(project?: Project | null) {
  return sortProjectBuckets(project?.project_task_buckets)[0] ?? null;
}

function findBucket(project: Project | null | undefined, bucketId?: string | null) {
  const buckets = sortProjectBuckets(project?.project_task_buckets);
  return buckets.find((bucket) => bucket.id === bucketId) ?? buckets[0] ?? null;
}

function stepRangeValue(bucket: ProjectBucket | null, fallback?: string) {
  return bucket ? compatibleStepRangeForBucket(bucket) : fallback ?? '10-25';
}

export function TaskFormFields({
  defaults,
  promptRows = 4,
  projects,
  defaultProjectId,
}: TaskFormFieldsProps) {
  const initialProject =
    projects.find((project) => project.id === (defaults?.project_id ?? defaultProjectId)) ??
    projects[0] ??
    null;
  const initialBucket =
    findBucket(initialProject, defaults?.task_bucket_id) ?? firstBucket(initialProject);
  const [projectId, setProjectId] = useState(initialProject?.id ?? '');
  const [bucketId, setBucketId] = useState(initialBucket?.id ?? '');
  const [fee, setFee] = useState(
    moneyInputValue(defaults?.fee_cents ?? initialBucket?.fee_cents ?? 300),
  );
  const selectedProject =
    projects.find((project) => project.id === projectId) ?? projects[0] ?? null;
  const selectedBuckets = sortProjectBuckets(selectedProject?.project_task_buckets);
  const selectedBucket =
    selectedBuckets.find((bucket) => bucket.id === bucketId) ??
    selectedBuckets[0] ??
    null;

  return (
    <>
      <label className={labelClass}>
        Task ID
        <input
          className={inputClass}
          name="external_task_id"
          required
          placeholder="TASK-002"
          defaultValue={defaults?.external_task_id ?? ''}
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
          defaultValue={defaults?.task_url ?? ''}
        />
      </label>
      <label className={labelClass}>
        Project
        <select
          className={inputClass}
          name="project_id"
          required
          value={projectId}
          onChange={(event) => {
            const nextProjectId = event.target.value;
            const nextProject =
              projects.find((project) => project.id === nextProjectId) ?? null;
            const nextBucket = firstBucket(nextProject);
            setProjectId(nextProjectId);
            setBucketId(nextBucket?.id ?? '');
            setFee(moneyInputValue(nextBucket?.fee_cents ?? 300));
          }}
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Expected steps
        <select
          className={inputClass}
          name="task_bucket_id"
          required
          value={bucketId}
          onChange={(event) => {
            const nextBucketId = event.target.value;
            const nextBucket =
              selectedBuckets.find((bucket) => bucket.id === nextBucketId) ?? null;
            setBucketId(nextBucketId);
            setFee(moneyInputValue(nextBucket?.fee_cents ?? 300));
          }}
        >
          {selectedBuckets.map((bucket) => (
            <option key={bucket.id} value={bucket.id}>
              {bucketLabel(bucket)} steps | ${bucketFeeDollars(bucket)}
            </option>
          ))}
        </select>
      </label>
      <input
        type="hidden"
        name="step_range"
        value={stepRangeValue(selectedBucket, defaults?.step_range)}
      />
      <label className={labelClass}>
        Language
        <input
          className={inputClass}
          name="task_language"
          required
          placeholder="Python"
          defaultValue={defaults?.task_language ?? ''}
        />
      </label>
      <label className={labelClass}>
        Application name
        <input
          className={inputClass}
          name="application"
          placeholder="Visual Studio Code"
          defaultValue={defaults?.application ?? ''}
        />
      </label>
      <label className={labelClass}>
        Fee (USD, editable)
        <input
          className={inputClass}
          name="fee"
          type="number"
          min="0"
          step="0.01"
          value={fee}
          onChange={(event) => setFee(event.target.value)}
        />
      </label>
      <label className={`${labelClass} md:col-span-3`}>
        Task prompt
        <textarea
          className={inputClass}
          name="prompt"
          rows={promptRows}
          required
          placeholder="Describe the task and acceptance criteria."
          defaultValue={defaults?.prompt ?? ''}
        />
      </label>
    </>
  );
}
