import { statusLabels } from '@/lib/format';
import { cn } from '@/lib/styles';
import type { TaskStatus } from '@/lib/types';
import {
  AlertIcon,
  CheckIcon,
  ClockIcon,
  RefreshIcon,
  XCircleIcon,
} from './icons';

const statusClass: Record<TaskStatus, string> = {
  pending: 'bg-[#edf1ef] text-[#53645a]',
  claimed: 'bg-[#e7f3ed] text-[#11664b]',
  completed: 'bg-[#eaf0fc] text-[#34568d]',
  under_review: 'bg-[#eaf0fc] text-[#34568d]',
  approved: 'bg-[#e7f3ed] text-[#11664b]',
  rework: 'bg-[#fff3df] text-[#a56308]',
  rejected: 'bg-[#fde9e9] text-[#ae3939]',
};

export function StatusPill({ status }: { status: TaskStatus }) {
  const Icon =
    status === 'approved'
      ? CheckIcon
      : status === 'rework'
        ? RefreshIcon
        : status === 'rejected'
          ? XCircleIcon
          : status === 'pending'
            ? ClockIcon
            : status === 'under_review'
              ? AlertIcon
              : RefreshIcon;

  return (
    <span
      className={cn(
        'inline-flex min-w-max items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-[0.95rem] py-[0.45rem] text-[0.82rem] font-bold',
        statusClass[status],
      )}
    >
      <Icon className="h-4 w-4" />
      {statusLabels[status]}
    </span>
  );
}
