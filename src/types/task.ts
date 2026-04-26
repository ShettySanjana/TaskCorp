export type TaskStatus = "Pending" | "In Progress" | "Completed" | "Blocked";
export type TaskPriority = "Low" | "Medium" | "High" | "Critical";
export type TaskCategory = "Bug" | "Feature" | "Enhancement";

export interface User {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string; // hsl token suffix
}

export interface TaskComment {
  id: string;
  authorId: string;
  message: string;
  createdAt: string;
}

export interface TaskHistoryEntry {
  id: string;
  authorId: string;
  field: string; // e.g., "status", "priority", "assignedTo", "created", "deleted", "progress"
  from?: string;
  to?: string;
  note?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo: string; // user id
  dueDate: string; // ISO date
  category: TaskCategory;
  createdAt: string;
  progress?: number; // 0..100
  comments?: TaskComment[];
  history?: TaskHistoryEntry[];
}

export const STATUSES: TaskStatus[] = ["Pending", "In Progress", "Completed", "Blocked"];
export const PRIORITIES: TaskPriority[] = ["Low", "Medium", "High", "Critical"];
export const CATEGORIES: TaskCategory[] = ["Bug", "Feature", "Enhancement"];

export const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
  Critical: 4,
};
