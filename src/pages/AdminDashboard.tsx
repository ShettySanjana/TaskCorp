import { useMemo, useState } from "react";
import { Plus, ListTodo, CheckCircle2, Clock, AlertOctagon, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/hooks/useTasks";
import HeroBanner from "@/components/dashboard/HeroBanner";
import StatCard from "@/components/dashboard/StatCard";
import TaskFilters from "@/components/tasks/TaskFilters";
import TaskTable from "@/components/tasks/TaskTable";
import TaskFormDialog from "@/components/tasks/TaskFormDialog";
import EmptyState from "@/components/tasks/EmptyState";
import ProgressBar from "@/components/tasks/ProgressBar";
import { USERS } from "@/data/users";
import type { Task, TaskStatus } from "@/types/task";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [user, setUser] = useState("all");

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "all" || t.status === status;
      const matchesPriority = priority === "all" || t.priority === priority;
      const matchesUser = user === "all" || t.assignedTo === user;
      return matchesSearch && matchesStatus && matchesPriority && matchesUser;
    });
  }, [tasks, search, status, priority, user]);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const pending = tasks.filter((t) => t.status === "Pending").length;
  const blocked = tasks.filter((t) => t.status === "Blocked").length;
  const performance = total === 0 ? 0 : Math.round((completed / total) * 100);

  // simple status distribution
  const dist = (["Pending", "In Progress", "Completed", "Blocked"] as TaskStatus[]).map((s) => ({
    label: s,
    count: tasks.filter((t) => t.status === s).length,
  }));

  const handleSubmit = (data: Omit<Task, "id" | "createdAt"> & { id?: string }) => {
    if (data.id) {
      const { id, ...rest } = data;
      updateTask(id, rest);
      toast.success("Task updated");
    } else {
      const { id: _ignore, ...rest } = data;
      addTask(rest);
      toast.success("Task created");
    }
  };

  const openCreate = () => { setEditing(null); setOpen(true); };
  const openEdit = (t: Task) => { setEditing(t); setOpen(true); };

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
        <Button size="lg" variant="outline" onClick={() => { setStatus("Blocked"); }}>
          <AlertOctagon className="w-4 h-4 mr-2" /> View blockers
        </Button>
      </HeroBanner>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total tasks" value={total} hint={`${USERS.length} active members`} icon={ListTodo} tone="primary" />
        <StatCard label="Completed" value={completed} hint={`${performance}% performance`} icon={CheckCircle2} tone="completed" />
        <StatCard label="Pending" value={pending} hint="Awaiting action" icon={Clock} tone="pending" />
        <StatCard label="Blocked" value={blocked} hint="Need unblocking" icon={AlertOctagon} tone="blocked" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card-elevated p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-lg font-semibold">Status distribution</h3>
              <p className="text-xs text-muted-foreground">Live snapshot of all tasks across the workspace</p>
            </div>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-4">
            {dist.map((d) => {
              const pct = total === 0 ? 0 : Math.round((d.count / total) * 100);
              const tone =
                d.label === "Completed" ? "completed" : d.label === "Pending" ? "warning" : "primary";
              return (
                <div key={d.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium">{d.label}</span>
                    <span className="text-muted-foreground">{d.count} · {pct}%</span>
                  </div>
                  <ProgressBar value={pct} tone={tone as any} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-elevated p-6">
          <h3 className="font-display text-lg font-semibold">Team workload</h3>
          <p className="text-xs text-muted-foreground mb-4">Open tasks per member</p>
          <div className="space-y-3">
            {USERS.map((u) => {
              const open = tasks.filter((t) => t.assignedTo === u.id && t.status !== "Completed").length;
              return (
                <div key={u.id} className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full text-white text-xs font-semibold flex items-center justify-center shrink-0"
                    style={{ background: `hsl(${u.color})` }}
                  >
                    {u.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.role}</p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{open}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold">All tasks</h2>
            <p className="text-sm text-muted-foreground">Search, filter and manage every task in the workspace.</p>
          </div>
          <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> New task</Button>
        </div>

        <TaskFilters
          search={search} setSearch={setSearch}
          status={status} setStatus={setStatus}
          priority={priority} setPriority={setPriority}
          user={user} setUser={setUser}
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
            onDelete={(id) => { deleteTask(id); toast.success("Task deleted"); }}
            onStatusChange={(id, s) => updateTask(id, { status: s, progress: s === "Completed" ? 100 : undefined as any })}
          />
        )}
      </section>

      <TaskFormDialog open={open} onOpenChange={setOpen} initial={editing} onSubmit={handleSubmit} />
    </div>
  );
}
