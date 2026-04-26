import { Pencil, Trash2, CalendarDays } from "lucide-react";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import UserAvatar from "./UserAvatar";
import ProgressBar from "./ProgressBar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUSES, type Task, type TaskStatus } from "@/types/task";

interface Props {
  tasks: Task[];
  onEdit?: (t: Task) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: TaskStatus) => void;
  showAssignee?: boolean;
  compact?: boolean;
}

const isOverdue = (t: Task) =>
  t.status !== "Completed" && new Date(t.dueDate) < new Date(new Date().toDateString());

export default function TaskTable({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  showAssignee = true,
}: Props) {
  return (
    <div className="card-elevated overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-secondary/60 text-muted-foreground">
              <th className="px-5 py-3 font-medium">Task</th>
              <th className="px-5 py-3 font-medium">Priority</th>
              <th className="px-5 py-3 font-medium">Status</th>
              {showAssignee && <th className="px-5 py-3 font-medium">Assignee</th>}
              <th className="px-5 py-3 font-medium">Due</th>
              <th className="px-5 py-3 font-medium">Progress</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => {
              const overdue = isOverdue(t);
              return (
                <tr key={t.id} className="border-t border-border hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-4 max-w-sm">
                    <p className="font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{t.description}</p>
                    <span className="inline-block mt-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-5 py-4"><PriorityBadge priority={t.priority} /></td>
                  <td className="px-5 py-4">
                    {onStatusChange ? (
                      <Select value={t.status} onValueChange={(v) => onStatusChange(t.id, v as TaskStatus)}>
                        <SelectTrigger className="h-8 w-[140px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <StatusBadge status={t.status} />
                    )}
                  </td>
                  {showAssignee && (
                    <td className="px-5 py-4"><UserAvatar userId={t.assignedTo} size={28} /></td>
                  )}
                  <td className={`px-5 py-4 ${overdue ? "text-destructive font-semibold" : ""}`}>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {new Date(t.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                    {overdue && <span className="ml-2 text-[10px] uppercase">Overdue</span>}
                  </td>
                  <td className="px-5 py-4 w-40">
                    <ProgressBar value={t.progress ?? 0} tone={t.status === "Completed" ? "completed" : "primary"} />
                    <span className="text-[10px] text-muted-foreground mt-1 inline-block">{t.progress ?? 0}%</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex gap-1">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(t)}
                          aria-label="Edit"
                          className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(t.id)}
                          aria-label="Delete"
                          className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
