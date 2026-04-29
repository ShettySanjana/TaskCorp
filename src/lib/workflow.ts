import type { TaskStatus } from "@/types/task";

/**
 * Finite-state workflow rules for task status transitions.
 *
 *  Pending      -> In Progress
 *  In Progress  -> Completed | Blocked
 *  Blocked      -> In Progress
 *  Completed    -> (locked / immutable)
 */
export const ALLOWED_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  Pending: ["In Progress"],
  "In Progress": ["Completed", "Blocked"],
  Blocked: ["In Progress"],
  Completed: [],
};

export function canTransition(from: TaskStatus, to: TaskStatus): boolean {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function nextStatuses(from: TaskStatus): TaskStatus[] {
  // includes current status so the Select can stay on its current value
  return Array.from(new Set<TaskStatus>([from, ...ALLOWED_TRANSITIONS[from]]));
}

export function isLocked(status: TaskStatus): boolean {
  return status === "Completed";
}
