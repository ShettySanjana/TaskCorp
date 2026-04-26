import { useMemo, useState } from "react";
import { Plus, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/hooks/useTasks";
import TaskFilters, { type SortKey } from "@/components/tasks/TaskFilters";
import TaskTable from "@/components/tasks/TaskTable";
import TaskFormDialog from "@/components/tasks/TaskFormDialog";
import TaskDetailDialog from "@/components/tasks/TaskDetailDialog";
import EmptyState from "@/components/tasks/EmptyState";
import { useCurrentUser } from "@/context/CurrentUserContext";
import { sortTasks } from "@/lib/sort";
import { exportTasksCSV, exportTasksPDF } from "@/lib/export";
import type { Task } from "@/types/task";
import { toast } from "sonner";

export default function AllTasks() {
  const { tasks, addTask, updateTask, deleteTask, addComment } = useTasks();
  const { currentUserId } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const [detail, setDetail] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [user, setUser] = useState("all");
  const [sort, setSort] = useState<SortKey>("created-desc");

  const filtered = useMemo(() => {
    const list = tasks.filter((t) => {
      const ms = t.name.toLowerCase().includes(search.toLowerCase());
      const mst = status === "all" || t.status === status;
      const mp = priority === "all" || t.priority === priority;
      const mu = user === "all" || t.assignedTo === user;
      return ms && mst && mp && mu;
    });
    return sortTasks(list, sort);
  }, [tasks, search, status, priority, user, sort]);

  const handleSubmit = (data: Omit<Task, "id" | "createdAt"> & { id?: string }) => {
    if (data.id) {
      const { id, ...rest } = data;
      updateTask(id, rest, currentUserId);
      toast.success("Task updated");
    } else {
      const { id: _, ...rest } = data;
      addTask(rest, currentUserId);
      toast.success("Task created");
    }
  };

  const liveDetail = detail ? tasks.find((t) => t.id === detail.id) ?? null : null;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold">All tasks</h1>
          <p className="text-muted-foreground">A full view of everything happening across your team.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => { exportTasksCSV(filtered); toast.success("CSV exported"); }}>
            <Download className="w-4 h-4 mr-2" /> CSV
          </Button>
          <Button variant="outline" onClick={() => exportTasksPDF(filtered, "TaskCorp – All tasks")}>
            <FileText className="w-4 h-4 mr-2" /> PDF
          </Button>
          <Button onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> New task
          </Button>
        </div>
      </div>

      <TaskFilters
        search={search} setSearch={setSearch}
        status={status} setStatus={setStatus}
        priority={priority} setPriority={setPriority}
        user={user} setUser={setUser}
        sort={sort} setSort={setSort}
      />

      {filtered.length === 0 ? (
        <div className="card-elevated">
          <EmptyState />
        </div>
      ) : (
        <TaskTable
          tasks={filtered}
          onEdit={(t) => { setEditing(t); setOpen(true); }}
          onRowClick={(t) => { setDetail(t); setDetailOpen(true); }}
          onDelete={(id) => { deleteTask(id); toast.success("Task deleted"); }}
          onStatusChange={(id, s) => {
            updateTask(id, { status: s, progress: s === "Completed" ? 100 : undefined as any }, currentUserId);
            toast.success(`Status updated to ${s}`);
          }}
        />
      )}

      <TaskFormDialog open={open} onOpenChange={setOpen} initial={editing} onSubmit={handleSubmit} />
      <TaskDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        task={liveDetail}
        currentUserId={currentUserId}
        onAddComment={(id, msg, author) => { addComment(id, msg, author); toast.success("Comment added"); }}
      />
    </div>
  );
}
