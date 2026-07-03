import type { TaskStatus } from './types';

const lagosMonthFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Africa/Lagos',
  year: 'numeric',
  month: '2-digit',
});

export function monthKey(value: string) {
  const parts = Object.fromEntries(
    lagosMonthFormatter.formatToParts(new Date(value)).map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}`;
}

export type MonthBucketedTask = {
  assigned_to: string;
  status: TaskStatus;
  fee_cents: number;
  created_at: string;
  claimed_at: string | null;
  completed_at: string | null;
  reviewed_at: string | null;
  approved_at: string | null;
};

export function taskEffectiveMonth(task: MonthBucketedTask) {
  return monthKey(
    task.approved_at ?? task.reviewed_at ?? task.completed_at ?? task.claimed_at ?? task.created_at,
  );
}
