import type { Task } from "@/types/task";
import { PRIORITY_WEIGHT } from "@/types/task";
import type { SortKey } from "@/components/tasks/TaskFilters";

export function sortTasks(tasks: Task[], key: SortKey): Task[] {
  const arr = [...tasks];
  switch (key) {
    case "due-asc":
      return arr.sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate));
    case "due-desc":
      return arr.sort((a, b) => +new Date(b.dueDate) - +new Date(a.dueDate));
    case "priority":
      return arr.sort((a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]);
    case "created-desc":
      return arr.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    case "name":
      return arr.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return arr;
  }
}
