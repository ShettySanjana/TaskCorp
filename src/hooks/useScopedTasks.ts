import { useMemo } from "react";
import { useTasks } from "./useTasks";
import { useCurrentUser } from "@/context/CurrentUserContext";
import type { Task } from "@/types/task";

/**
 * Role-aware task selector.
 *
 * Admin -> sees every task in the workspace.
 * Employee -> sandboxed to tasks where assignedTo === currentUserId.
 *
 * This is the single source of truth for visible tasks across every page,
 * search, filter, calendar and analytics surface.
 */
export function useScopedTasks(): {
  tasks: Task[];
  allTasks: Task[];
  isAdmin: boolean;
  currentUserId: string;
  addTask: ReturnType<typeof useTasks>["addTask"];
  updateTask: ReturnType<typeof useTasks>["updateTask"];
  deleteTask: ReturnType<typeof useTasks>["deleteTask"];
  addComment: ReturnType<typeof useTasks>["addComment"];
} {
  const { tasks, addTask, updateTask, deleteTask, addComment } = useTasks();
  const { currentUserId, isAdmin } = useCurrentUser();

  const scoped = useMemo(
    () => (isAdmin ? tasks : tasks.filter((t) => t.assignedTo === currentUserId)),
    [tasks, isAdmin, currentUserId],
  );

  return {
    tasks: scoped,
    allTasks: tasks,
    isAdmin,
    currentUserId,
    addTask,
    updateTask,
    deleteTask,
    addComment,
  };
}

/** Permission helpers — apply at logic layer, not just UI. */
export const permissions = {
  canCreate: (isAdmin: boolean) => isAdmin,
  canDelete: (isAdmin: boolean) => isAdmin,
  canReassign: (isAdmin: boolean) => isAdmin,
  canEditMetadata: (isAdmin: boolean) => isAdmin,
  canChangeStatus: (isAdmin: boolean, task: { assignedTo: string }, userId: string) =>
    isAdmin || task.assignedTo === userId,
  canComment: (_isAdmin: boolean, task: { assignedTo: string }, userId: string) =>
    _isAdmin || task.assignedTo === userId,
};
