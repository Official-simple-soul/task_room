export type Role = "admin" | "user";
export type TaskStatus =
  | "pending"
  | "claimed"
  | "completed"
  | "under_review"
  | "approved"
  | "rework"
  | "rejected";

export type Profile = {
  id: string;
  full_name: string;
  email?: string | null;
  role: Role;
  payment_bank_name?: string | null;
  payment_account_number?: string | null;
  payment_account_name?: string | null;
};

export type ProjectStatus = 'in_progress' | 'paused' | 'closed';

export type ProjectBucket = {
  id: string;
  project_id: string;
  label: string;
  min_steps: number;
  max_steps: number;
  fee_cents: number;
  sort_order: number;
};

export type Project = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  status: ProjectStatus;
  project_task_buckets?: ProjectBucket[];
};

export type Task = {
  id: string;
  external_task_id: string;
  assigned_to: string;
  project_id: string;
  task_bucket_id: string | null;
  project_name?: string | null;
  project_slug?: string | null;
  bucket_label?: string | null;
  task_url: string | null;
  step_range: string;
  task_language: string;
  application: string | null;
  prompt: string;
  fee_cents: number;
  final_step_count: number | null;
  rework_count: number;
  status: TaskStatus;
  admin_comment: string | null;
  created_at: string;
  claimed_at: string | null;
  completed_at: string | null;
  review_started_at: string | null;
  reviewed_at: string | null;
  approved_at: string | null;
};

export type MonthlyMetric = {
  month: string;
  attempted: number;
  approved: number;
  rejected: number;
  available_reworks: number;
  earned_cents: number;
};

export type LeaderboardPeriod =
  | "day"
  | "week"
  | "month"
  | "last_month"
  | "all";

export type LeaderboardEntry = {
  rank: number;
  worker_alias: string;
  completed_count: number;
  approved_count: number;
  earned_cents: number;
  is_current_user: boolean;
};
