import { useMemo, useState } from "react";
import { useScopedTasks } from "@/hooks/useScopedTasks";
import CalendarView from "@/components/tasks/CalendarView";
import TaskDetailDialog from "@/components/tasks/TaskDetailDialog";
import type { Task } from "@/types/task";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { USERS } from "@/data/users";

export default function CalendarPage() {
  const { tasks, addComment, currentUserId, isAdmin } = useScopedTasks();
  const [scope, setScope] = useState<string>("all");
  const [active, setActive] = useState<Task | null>(null);
  const [open, setOpen] = useState(false);

  // Admin can further narrow by assignee; employees are already locked to themselves.
  const visible = useMemo(() => {
    if (!isAdmin || scope === "all") return tasks;
    return tasks.filter((t) => t.assignedTo === scope);
  }, [tasks, scope, isAdmin]);

  const liveTask = active ? tasks.find((t) => t.id === active.id) ?? null : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? "Visualise deadlines across the team. Click any task to view details."
              : "Your upcoming deadlines. Click any task to view details."}
          </p>
        </div>
        {isAdmin && (
          <Select value={scope} onValueChange={setScope}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All assignees</SelectItem>
              {USERS.map((u) => (
                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <CalendarView
        tasks={visible}
        onTaskClick={(t) => {
          setActive(t);
          setOpen(true);
        }}
      />

      <TaskDetailDialog
        open={open}
        onOpenChange={setOpen}
        task={liveTask}
        currentUserId={currentUserId}
        onAddComment={addComment}
      />
    </div>
  );
}
