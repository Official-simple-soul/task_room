'use client';

import { useState } from 'react';
import { taskRateCents, taskStepRanges } from '@/lib/task-rates';
import { inputClass, labelClass } from '@/lib/styles';

type TaskFormDefaults = {
  external_task_id?: string;
  task_url?: string | null;
  step_range?: string;
  task_language?: string;
  application?: string | null;
  fee_cents?: number;
  prompt?: string;
};

type TaskFormFieldsProps = {
  defaults?: TaskFormDefaults;
  promptRows?: number;
};

function moneyInputValue(cents: number) {
  return (cents / 100).toFixed(2);
}

function rangeOptions(current?: string) {
  const ranges = [...taskStepRanges];
  if (current && !ranges.includes(current as (typeof taskStepRanges)[number])) {
    return [current, ...ranges];
  }

  return ranges;
}

export function TaskFormFields({
  defaults,
  promptRows = 4,
}: TaskFormFieldsProps) {
  const initialRange = defaults?.step_range ?? taskStepRanges[0];
  const [stepRange, setStepRange] = useState(initialRange);
  const [fee, setFee] = useState(
    moneyInputValue(defaults?.fee_cents ?? taskRateCents[initialRange] ?? 300),
  );

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
        Expected steps
        <select
          className={inputClass}
          name="step_range"
          value={stepRange}
          onChange={(event) => {
            const range = event.target.value;
            setStepRange(range);
            setFee(moneyInputValue(taskRateCents[range] ?? 300));
          }}
        >
          {rangeOptions(defaults?.step_range).map((range) => (
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
