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
  role: Role;
};

export type Task = {
  id: string;
  external_task_id: string;
  assigned_to: string;
  task_url: string | null;
  step_range: string;
  task_language: string;
  prompt: string;
  fee_cents: number;
  status: TaskStatus;
  admin_comment: string | null;
  created_at: string;
  claimed_at: string | null;
  completed_at: string | null;
  reviewed_at: string | null;
};

export type MonthlyMetric = {
  month: string;
  attempted: number;
  approved: number;
  rejected: number;
  available_reworks: number;
  earned_cents: number;
};

export type LeaderboardPeriod = "day" | "week" | "month";

export type LeaderboardEntry = {
  rank: number;
  worker_alias: string;
  completed_count: number;
  approved_count: number;
  earned_cents: number;
  is_current_user: boolean;
};
