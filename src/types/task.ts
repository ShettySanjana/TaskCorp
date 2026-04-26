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
}

export const STATUSES: TaskStatus[] = ["Pending", "In Progress", "Completed", "Blocked"];
export const PRIORITIES: TaskPriority[] = ["Low", "Medium", "High", "Critical"];
export const CATEGORIES: TaskCategory[] = ["Bug", "Feature", "Enhancement"];
