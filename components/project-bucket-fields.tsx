'use client';

import { useState } from 'react';
import { bucketFeeDollars } from '@/lib/projects';
import {
  dangerButtonClass,
  inputClass,
  labelClass,
  secondaryButtonClass,
} from '@/lib/styles';
import type { ProjectBucket } from '@/lib/types';
import { FaTrash } from 'react-icons/fa';

type BucketDraft = {
  id: string;
  label: string;
  min_steps: string;
  max_steps: string;
  fee: string;
};

type ProjectBucketFieldsProps = {
  buckets?: ProjectBucket[];
  defaults?: Array<{
    label: string;
    min: number;
    max: number;
    fee: string;
  }>;
};

function emptyBucket(): BucketDraft {
  return {
    id: '',
    label: '',
    min_steps: '',
    max_steps: '',
    fee: '',
  };
}

function fromProjectBucket(bucket: ProjectBucket): BucketDraft {
  return {
    id: bucket.id,
    label: bucket.label,
    min_steps: String(bucket.min_steps),
    max_steps: String(bucket.max_steps),
    fee: bucketFeeDollars(bucket),
  };
}

export function ProjectBucketFields({
  buckets,
  defaults,
}: ProjectBucketFieldsProps) {
  const [rows, setRows] = useState<BucketDraft[]>(
    buckets?.length
      ? buckets.map(fromProjectBucket)
      : (defaults?.map((bucket) => ({
          id: '',
          label: bucket.label,
          min_steps: String(bucket.min),
          max_steps: String(bucket.max),
          fee: bucket.fee,
        })) ?? [emptyBucket()]),
  );

  const updateRow = (index: number, key: keyof BucketDraft, value: string) => {
    setRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row,
      ),
    );
  };

  const removeRow = (index: number) => {
    setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
  };

  return (
    <div className="grid gap-3">
      {rows.map((bucket, index) => (
        <div
          className="flex items-center gap-2"
          key={`${bucket.id || 'new'}-${index}`}
        >
          <div className="w-full grid gap-3 rounded-2xl border border-[#edf1ee] bg-[#f8fbf7] p-3 md:grid-cols-[1fr_0.75fr_0.75fr_0.75fr_auto] dark:border-[#222c26] dark:bg-[#161d19]">
            <input type="hidden" name="bucket_id" value={bucket.id} />
            <label className={labelClass}>
              Label
              <input
                className={inputClass}
                name="bucket_label"
                value={bucket.label}
                onChange={(event) =>
                  updateRow(index, 'label', event.target.value)
                }
                placeholder="10-25"
                required
              />
            </label>
            <label className={labelClass}>
              Min steps
              <input
                className={inputClass}
                name="bucket_min"
                type="number"
                min="1"
                step="1"
                value={bucket.min_steps}
                onChange={(event) =>
                  updateRow(index, 'min_steps', event.target.value)
                }
                required
              />
            </label>
            <label className={labelClass}>
              Max steps
              <input
                className={inputClass}
                name="bucket_max"
                type="number"
                min="1"
                step="1"
                value={bucket.max_steps}
                onChange={(event) =>
                  updateRow(index, 'max_steps', event.target.value)
                }
                required
              />
            </label>
            <label className={labelClass}>
              Fee USD
              <input
                className={inputClass}
                name="bucket_fee"
                type="number"
                min="0"
                step="0.01"
                value={bucket.fee}
                onChange={(event) =>
                  updateRow(index, 'fee', event.target.value)
                }
                required
              />
            </label>
          </div>
          <FaTrash
            className="cursor-pointer"
            type="button"
            color="red"
            onClick={() => removeRow(index)}
          />
        </div>
      ))}
      <button
        className={secondaryButtonClass}
        type="button"
        onClick={() => setRows((current) => [...current, emptyBucket()])}
      >
        Add bucket row
      </button>
    </div>
  );
}
