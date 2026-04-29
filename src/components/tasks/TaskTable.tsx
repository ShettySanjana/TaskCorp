import { Pencil, Trash2, CalendarDays, MessageSquare, Lock } from "lucide-react";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import UserAvatar from "./UserAvatar";
import ProgressBar from "./ProgressBar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Task, type TaskStatus } from "@/types/task";
import { isLocked, nextStatuses } from "@/lib/workflow";

interface Props {
  tasks: Task[];
  onEdit?: (t: Task) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: TaskStatus) => void;
  onRowClick?: (t: Task) => void;
  showAssignee?: boolean;
}

const isOverdue = (t: Task) =>
  t.status !== "Completed" && new Date(t.dueDate) < new Date(new Date().toDateString());

export default function TaskTable({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  onRowClick,
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
              const commentCount = t.comments?.length ?? 0;
              const clickable = !!onRowClick;
              return (
                <tr
                  key={t.id}
                  onClick={() => onRowClick?.(t)}
                  className={`border-t border-border transition-colors ${
                    clickable ? "cursor-pointer hover:bg-secondary/40" : "hover:bg-secondary/30"
                  }`}
                >
                  <td className="px-5 py-4 max-w-sm">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">{t.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{t.description}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            {t.category}
                          </span>
                          {commentCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                              <MessageSquare className="w-3 h-3" /> {commentCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4"><PriorityBadge priority={t.priority} /></td>
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    {onStatusChange && !isLocked(t.status) ? (
                      <Select value={t.status} onValueChange={(v) => onStatusChange(t.id, v as TaskStatus)}>
                        <SelectTrigger className="h-8 w-[140px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {nextStatuses(t.status).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <StatusBadge status={t.status} />
                        {isLocked(t.status) && <Lock className="w-3 h-3 text-muted-foreground" aria-label="Locked" />}
                      </span>
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
                  <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
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
