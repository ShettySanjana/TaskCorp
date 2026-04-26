import type { TaskStatus } from "@/types/task";

const styles: Record<TaskStatus, string> = {
  Pending: "bg-status-pending-bg text-status-pending",
  "In Progress": "bg-status-progress-bg text-status-progress",
  Completed: "bg-status-completed-bg text-status-completed",
  Blocked: "bg-status-blocked-bg text-status-blocked",
};

export default function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
