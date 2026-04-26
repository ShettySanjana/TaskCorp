import type { TaskPriority } from "@/types/task";

const styles: Record<TaskPriority, string> = {
  Low: "border-priority-low/30 text-priority-low",
  Medium: "border-priority-medium/40 text-priority-medium",
  High: "border-priority-high/50 text-priority-high",
  Critical: "border-priority-critical/60 text-priority-critical bg-priority-critical/5",
};

export default function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${styles[priority]}`}>
      {priority}
    </span>
  );
}
