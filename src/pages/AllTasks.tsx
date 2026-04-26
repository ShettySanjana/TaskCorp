import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/hooks/useTasks";
import TaskFilters from "@/components/tasks/TaskFilters";
import TaskTable from "@/components/tasks/TaskTable";
import TaskFormDialog from "@/components/tasks/TaskFormDialog";
import EmptyState from "@/components/tasks/EmptyState";
import type { Task } from "@/types/task";
import { toast } from "sonner";

export default function AllTasks() {
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [user, setUser] = useState("all");

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const ms = t.name.toLowerCase().includes(search.toLowerCase());
      const mst = status === "all" || t.status === status;
      const mp = priority === "all" || t.priority === priority;
      const mu = user === "all" || t.assignedTo === user;
      return ms && mst && mp && mu;
    });
  }, [tasks, search, status, priority, user]);

  const handleSubmit = (data: Omit<Task, "id" | "createdAt"> & { id?: string }) => {
    if (data.id) {
      const { id, ...rest } = data;
      updateTask(id, rest);
      toast.success("Task updated");
    } else {
      const { id: _, ...rest } = data;
      addTask(rest);
      toast.success("Task created");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold">All tasks</h1>
          <p className="text-muted-foreground">A full view of everything happening across your team.</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> New task
        </Button>
      </div>

      <TaskFilters
        search={search} setSearch={setSearch}
        status={status} setStatus={setStatus}
        priority={priority} setPriority={setPriority}
        user={user} setUser={setUser}
      />

      {filtered.length === 0 ? (
        <div className="card-elevated">
          <EmptyState />
        </div>
      ) : (
        <TaskTable
          tasks={filtered}
          onEdit={(t) => { setEditing(t); setOpen(true); }}
          onDelete={(id) => { deleteTask(id); toast.success("Task deleted"); }}
          onStatusChange={(id, s) => updateTask(id, { status: s, progress: s === "Completed" ? 100 : undefined as any })}
        />
      )}

      <TaskFormDialog open={open} onOpenChange={setOpen} initial={editing} onSubmit={handleSubmit} />
    </div>
  );
}
