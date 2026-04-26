import { useMemo, useState } from "react";
import { CheckCircle2, Clock, AlertOctagon, ListTodo, Bell } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import HeroBanner from "@/components/dashboard/HeroBanner";
import StatCard from "@/components/dashboard/StatCard";
import TaskFilters from "@/components/tasks/TaskFilters";
import TaskTable from "@/components/tasks/TaskTable";
import EmptyState from "@/components/tasks/EmptyState";
import ProgressBar from "@/components/tasks/ProgressBar";
import { USERS } from "@/data/users";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function EmployeeDashboard() {
  const { tasks, updateTask } = useTasks();
  const [userId, setUserId] = useState(USERS[0].id);
  const me = USERS.find((u) => u.id === userId)!;

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");

  const myTasks = useMemo(() => tasks.filter((t) => t.assignedTo === userId), [tasks, userId]);

  const filtered = useMemo(() => {
    return myTasks.filter((t) => {
      const ms = t.name.toLowerCase().includes(search.toLowerCase());
      const mst = status === "all" || t.status === status;
      const mp = priority === "all" || t.priority === priority;
      return ms && mst && mp;
    });
  }, [myTasks, search, status, priority]);

  const total = myTasks.length;
  const completed = myTasks.filter((t) => t.status === "Completed").length;
  const pending = myTasks.filter((t) => t.status === "Pending").length;
  const blocked = myTasks.filter((t) => t.status === "Blocked").length;
  const performance = total === 0 ? 0 : Math.round((completed / total) * 100);

  const overdue = myTasks.filter(
    (t) => t.status !== "Completed" && new Date(t.dueDate) < new Date(new Date().toDateString())
  );

  return (
    <div className="space-y-8">
      <HeroBanner
        eyebrow={`Hi, ${me.name.split(" ")[0]}`}
        title="Stay in flow. Ship great work today."
        subtitle="Your assigned tasks, sorted by what matters most. Update status as you progress to keep your team in sync."
      >
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Viewing as</span>
          <Select value={userId} onValueChange={setUserId}>
            <SelectTrigger className="w-56 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {USERS.map((u) => (
                <SelectItem key={u.id} value={u.id}>{u.name} · {u.role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </HeroBanner>

      {(pending > 0 || overdue.length > 0) && (
        <div className="card-elevated p-4 flex items-start gap-3 border-l-4 border-l-status-pending">
          <Bell className="w-5 h-5 text-status-pending mt-0.5" />
          <div>
            <p className="font-semibold text-sm">
              {overdue.length > 0
                ? `${overdue.length} overdue task${overdue.length > 1 ? "s" : ""} need attention`
                : `${pending} pending task${pending > 1 ? "s" : ""} waiting to be picked up`}
            </p>
            <p className="text-xs text-muted-foreground">
              Update statuses regularly so your team has accurate visibility.
            </p>
          </div>
        </div>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My tasks" value={total} hint={`${myTasks.filter(t => t.status === "In Progress").length} in progress`} icon={ListTodo} tone="primary" />
        <StatCard label="Completed" value={completed} hint="Great job!" icon={CheckCircle2} tone="completed" />
        <StatCard label="Pending" value={pending} hint="Pick one to start" icon={Clock} tone="pending" />
        <StatCard label="Blocked" value={blocked} hint="Resolve blockers" icon={AlertOctagon} tone="blocked" />
      </section>

      <section className="card-elevated p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-display text-lg font-semibold">My performance</h3>
            <p className="text-xs text-muted-foreground">Completed vs. assigned</p>
          </div>
          <span className="font-display text-2xl font-bold text-primary">{performance}%</span>
        </div>
        <ProgressBar value={performance} tone={performance >= 70 ? "completed" : "primary"} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 text-sm">
          <div><p className="text-muted-foreground text-xs">Completed</p><p className="font-semibold">{completed}</p></div>
          <div><p className="text-muted-foreground text-xs">In progress</p><p className="font-semibold">{myTasks.filter(t => t.status === "In Progress").length}</p></div>
          <div><p className="text-muted-foreground text-xs">Pending</p><p className="font-semibold">{pending}</p></div>
          <div><p className="text-muted-foreground text-xs">Blocked</p><p className="font-semibold">{blocked}</p></div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">My tasks</h2>
        <TaskFilters
          search={search} setSearch={setSearch}
          status={status} setStatus={setStatus}
          priority={priority} setPriority={setPriority}
          showUserFilter={false}
        />

        {filtered.length === 0 ? (
          <div className="card-elevated">
            <EmptyState
              title={myTasks.length === 0 ? "No tasks assigned to you yet" : "Nothing matches your filters"}
              subtitle={myTasks.length === 0 ? "Sit tight — your manager will assign tasks soon." : "Try clearing some filters to see more."}
            />
          </div>
        ) : (
          <TaskTable
            tasks={filtered}
            showAssignee={false}
            onStatusChange={(id, s) => {
              updateTask(id, { status: s, progress: s === "Completed" ? 100 : undefined as any });
              toast.success(`Status updated to ${s}`);
            }}
          />
        )}
      </section>
    </div>
  );
}
