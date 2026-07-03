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
  pending: 'bg-[#edf1ef] text-[#53645a] dark:bg-[#131b17] dark:text-[#8da398]',
  claimed: 'bg-[#e7f3ed] text-[#11664b] dark:bg-[#10b981]/10 dark:text-[#10b981] dark:border dark:border-[#10b981]/15',
  completed: 'bg-[#eaf0fc] text-[#34568d] dark:bg-[#2d6fa8]/10 dark:text-[#63b3ed] dark:border dark:border-[#2d6fa8]/15',
  under_review: 'bg-[#eaf0fc] text-[#34568d] dark:bg-[#2d6fa8]/10 dark:text-[#63b3ed] dark:border dark:border-[#2d6fa8]/15',
  approved: 'bg-[#e7f3ed] text-[#11664b] dark:bg-[#10b981]/10 dark:text-[#10b981] dark:border dark:border-[#10b981]/15',
  rework: 'bg-[#fff3df] text-[#a56308] dark:bg-[#ff9800]/10 dark:text-[#ffb74d] dark:border dark:border-[#ff9800]/15',
  rejected: 'bg-[#fde9e9] text-[#ae3939] dark:bg-[#ef4444]/10 dark:text-[#fca5a5] dark:border dark:border-[#ef4444]/15',
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
