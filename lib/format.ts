import type { TaskStatus } from "./types";

export const statusLabels: Record<TaskStatus, string> = {
  pending: "Pending",
  claimed: "In progress",
  completed: "Completed",
  under_review: "Under review",
  approved: "Approved",
  rework: "Rework required",
  rejected: "Rejected",
};

export function money(cents: number | string | null | undefined) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(cents ?? 0) / 100);
}

export function monthLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${value.slice(0, 10)}T00:00:00`));
}

export function dateLabel(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
