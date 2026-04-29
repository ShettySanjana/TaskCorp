import { useMemo, useState } from "react";
import { Plus, ListTodo, CheckCircle2, Clock, AlertOctagon, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScopedTasks } from "@/hooks/useScopedTasks";
import HeroBanner from "@/components/dashboard/HeroBanner";
import StatCard from "@/components/dashboard/StatCard";
import AnalyticsCharts from "@/components/dashboard/AnalyticsCharts";
import TaskFilters, { type SortKey } from "@/components/tasks/TaskFilters";
import TaskTable from "@/components/tasks/TaskTable";
import TaskFormDialog from "@/components/tasks/TaskFormDialog";
import TaskDetailDialog from "@/components/tasks/TaskDetailDialog";
import EmptyState from "@/components/tasks/EmptyState";
import { USERS } from "@/data/users";
import { calculatePerformance, isTaskOverdue } from "@/lib/scoring";
import { sortTasks } from "@/lib/sort";
import { canTransition } from "@/lib/workflow";
import { exportTasksCSV, exportTasksPDF } from "@/lib/export";
import type { Task, TaskStatus } from "@/types/task";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { tasks, addTask, updateTask, deleteTask, addComment, currentUserId } = useScopedTasks();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const [detail, setDetail] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [user, setUser] = useState("all");
  const [sort, setSort] = useState<SortKey>("due-asc");

  const filtered = useMemo(() => {
    const list = tasks.filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "all" || t.status === status;
      const matchesPriority = priority === "all" || t.priority === priority;
      const matchesUser = user === "all" || t.assignedTo === user;
      return matchesSearch && matchesStatus && matchesPriority && matchesUser;
    });
    return sortTasks(list, sort);
  }, [tasks, search, status, priority, user, sort]);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const pending = tasks.filter((t) => t.status === "Pending").length;
  const blocked = tasks.filter((t) => t.status === "Blocked").length;

  const handleSubmit = (data: Omit<Task, "id" | "createdAt"> & { id?: string }) => {
    if (data.id) {
      const { id, ...rest } = data;
      updateTask(id, rest, currentUserId);
      toast.success("Task updated");
    } else {
      const { id: _ignore, ...rest } = data;
      addTask(rest, currentUserId);
      toast.success("Task created");
    }
  };

  const openCreate = () => { setEditing(null); setOpen(true); };
  const openEdit = (t: Task) => { setEditing(t); setOpen(true); };
  const liveDetail = detail ? tasks.find((t) => t.id === detail.id) ?? null : null;

  return (
    <div className="space-y-8">
      <HeroBanner
        eyebrow="Admin workspace"
        title="Run your team like a high-performance engine."
        subtitle="Create, assign and track tasks across your organization. Spot bottlenecks before they slow your team down."
      >
        <Button size="lg" onClick={openCreate} className="shadow-elevated">
          <Plus className="w-4 h-4 mr-2" /> New task
        </Button>
        <Button size="lg" variant="outline" onClick={() => setStatus("Blocked")}>
          <AlertOctagon className="w-4 h-4 mr-2" /> View blockers
        </Button>
      </HeroBanner>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total tasks" value={total} hint={`${USERS.length} active members`} icon={ListTodo} tone="primary" />
        <StatCard label="Completed" value={completed} hint={`${total === 0 ? 0 : Math.round((completed / total) * 100)}% completion`} icon={CheckCircle2} tone="completed" />
        <StatCard label="Pending" value={pending} hint="Awaiting action" icon={Clock} tone="pending" />
        <StatCard label="Blocked" value={blocked} hint="Need unblocking" icon={AlertOctagon} tone="blocked" />
      </section>

      <AnalyticsCharts tasks={tasks} />

      <section className="card-elevated p-6">
        <h3 className="font-display text-lg font-semibold mb-1">Team performance leaderboard</h3>
        <p className="text-xs text-muted-foreground mb-4">Weighted score factoring completion, overdue tasks, and task priority.</p>
        <div className="space-y-3">
          {USERS.map((u) => {
            const ut = tasks.filter((t) => t.assignedTo === u.id);
            const { score, completed: c, overdue: o, total: tot } = calculatePerformance(ut);
            return (
              <div key={u.id} className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full text-white text-xs font-semibold flex items-center justify-center shrink-0"
                  style={{ background: `hsl(${u.color})` }}
                >
                  {u.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="text-sm font-semibold truncate">{u.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {c}/{tot} done · {o} overdue
                      </p>
                    </div>
                    <span className={`font-display font-bold tabular-nums ${score >= 70 ? "text-status-completed" : score >= 40 ? "text-primary" : "text-status-pending"}`}>
                      {score}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        score >= 70 ? "bg-status-completed" : score >= 40 ? "bg-primary" : "bg-status-pending"
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold">All tasks</h2>
            <p className="text-sm text-muted-foreground">Search, filter, sort and manage every task in the workspace.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => { exportTasksCSV(filtered); toast.success("CSV exported"); }}>
              <Download className="w-4 h-4 mr-2" /> CSV
            </Button>
            <Button variant="outline" onClick={() => exportTasksPDF(filtered, "TaskCorp – Admin Report")}>
              <FileText className="w-4 h-4 mr-2" /> PDF
            </Button>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> New task</Button>
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
            <EmptyState
              title={tasks.length === 0 ? "No tasks available" : "No tasks match your filters"}
              subtitle={tasks.length === 0 ? "Create your first task to get started." : "Try adjusting search or filters."}
            />
          </div>
        ) : (
          <TaskTable
            tasks={filtered}
            onEdit={openEdit}
            onRowClick={(t) => { setDetail(t); setDetailOpen(true); }}
            onDelete={(id) => { deleteTask(id); toast.success("Task deleted"); }}
            onStatusChange={(id, s) => {
              updateTask(id, { status: s, progress: s === "Completed" ? 100 : undefined as any }, currentUserId);
              toast.success(`Status updated to ${s}`);
            }}
          />
        )}
      </section>

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
