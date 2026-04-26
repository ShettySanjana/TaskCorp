import type { Task } from "@/types/task";
import { PRIORITY_WEIGHT } from "@/types/task";

const isOverdue = (t: Task) =>
  t.status !== "Completed" && new Date(t.dueDate) < new Date(new Date().toDateString());

/**
 * Calculate weighted performance score 0-100.
 * Completed tasks add weighted points; overdue tasks subtract.
 */
export function calculatePerformance(tasks: Task[]): {
  score: number;
  completed: number;
  overdue: number;
  total: number;
  inProgress: number;
} {
  const total = tasks.length;
  if (total === 0) return { score: 0, completed: 0, overdue: 0, total: 0, inProgress: 0 };

  const completed = tasks.filter((t) => t.status === "Completed").length;
  const overdue = tasks.filter(isOverdue).length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;

  const earned = tasks
    .filter((t) => t.status === "Completed")
    .reduce((sum, t) => sum + PRIORITY_WEIGHT[t.priority], 0);
  const possible = tasks.reduce((sum, t) => sum + PRIORITY_WEIGHT[t.priority], 0);
  const overduePenalty = tasks
    .filter(isOverdue)
    .reduce((sum, t) => sum + PRIORITY_WEIGHT[t.priority] * 0.5, 0);

  const raw = possible === 0 ? 0 : ((earned - overduePenalty) / possible) * 100;
  const score = Math.max(0, Math.min(100, Math.round(raw)));
  return { score, completed, overdue, total, inProgress };
}

export const isTaskOverdue = isOverdue;
