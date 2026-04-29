import { useMemo, useState } from "react";
import { CheckCircle2, Clock, AlertOctagon, ListTodo, Bell, Download } from "lucide-react";
import { useScopedTasks } from "@/hooks/useScopedTasks";
import HeroBanner from "@/components/dashboard/HeroBanner";
import StatCard from "@/components/dashboard/StatCard";
import TaskFilters, { type SortKey } from "@/components/tasks/TaskFilters";
import TaskTable from "@/components/tasks/TaskTable";
import TaskDetailDialog from "@/components/tasks/TaskDetailDialog";
import EmptyState from "@/components/tasks/EmptyState";
import ProgressBar from "@/components/tasks/ProgressBar";
import { Button } from "@/components/ui/button";
import { getIdentity } from "@/context/CurrentUserContext";
import { calculatePerformance, isTaskOverdue } from "@/lib/scoring";
import { sortTasks } from "@/lib/sort";
import { canTransition } from "@/lib/workflow";
import { exportTasksCSV } from "@/lib/export";
import type { Task, TaskStatus } from "@/types/task";
import { toast } from "sonner";

export default function EmployeeDashboard() {
  // Scoped: admins see everything; employees only see their own assigned work.
  const { tasks: myTasks, updateTask, addComment, currentUserId, isAdmin } = useScopedTasks();
  const me = getIdentity(currentUserId);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [sort, setSort] = useState<SortKey>("priority");

  const [detail, setDetail] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filtered = useMemo(() => {
    const list = myTasks.filter((t) => {
      const ms = t.name.toLowerCase().includes(search.toLowerCase());
      const mst = status === "all" || t.status === status;
      const mp = priority === "all" || t.priority === priority;
      return ms && mst && mp;
    });
    return sortTasks(list, sort);
  }, [myTasks, search, status, priority, sort]);

  const perf = calculatePerformance(myTasks);
  const overdue = myTasks.filter(isTaskOverdue);
  const liveDetail = detail ? myTasks.find((t) => t.id === detail.id) ?? null : null;

  return (
    <div className="space-y-8">
      <HeroBanner
        eyebrow={isAdmin ? "Admin preview" : `Hi, ${me.name.split(" ")[0]}`}
        title={isAdmin ? "Workspace-wide employee view" : "Stay in flow. Ship great work today."}
        subtitle={
          isAdmin
            ? "As an admin you can preview the full task pool. Switch identity to view a specific employee's sandboxed dashboard."
            : "Your assigned tasks, sorted by what matters most. Update status as you progress to keep your team in sync."
        }
      >
        <Button
          variant="outline"
          onClick={() => {
            exportTasksCSV(myTasks, `${me.name.replace(/ /g, "-")}-tasks.csv`);
            toast.success("Exported your tasks");
          }}
        >
          <Download className="w-4 h-4 mr-2" /> Export
        </Button>
      </HeroBanner>

      {(perf.total > 0 && (overdue.length > 0 || perf.total - perf.completed > 0)) && (
        <div className="card-elevated p-4 flex items-start gap-3 border-l-4 border-l-status-pending animate-fade-in">
          <Bell className="w-5 h-5 text-status-pending mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">
              {overdue.length > 0
                ? `${overdue.length} overdue task${overdue.length > 1 ? "s" : ""} need attention`
                : `${perf.total - perf.completed} open task${perf.total - perf.completed > 1 ? "s" : ""} on your plate`}
            </p>
            <p className="text-xs text-muted-foreground">
              Update statuses regularly so your team has accurate visibility.
            </p>
          </div>
        </div>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={isAdmin ? "All tasks" : "My tasks"} value={perf.total} hint={`${perf.inProgress} in progress`} icon={ListTodo} tone="primary" />
        <StatCard label="Completed" value={perf.completed} hint="Great job!" icon={CheckCircle2} tone="completed" />
        <StatCard label="Pending" value={myTasks.filter((t) => t.status === "Pending").length} hint="Pick one to start" icon={Clock} tone="pending" />
        <StatCard label="Overdue" value={overdue.length} hint="Resolve soon" icon={AlertOctagon} tone="blocked" />
      </section>

      <section className="card-elevated p-6">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h3 className="font-display text-lg font-semibold">Performance score</h3>
            <p className="text-xs text-muted-foreground">Weighted by completion, priority and overdue penalties</p>
          </div>
          <span className={`font-display text-3xl font-bold ${perf.score >= 70 ? "text-status-completed" : perf.score >= 40 ? "text-primary" : "text-status-pending"}`}>
            {perf.score}%
          </span>
        </div>
        <ProgressBar value={perf.score} tone={perf.score >= 70 ? "completed" : "primary"} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 text-sm">
          <Stat label="Completed" value={perf.completed} />
          <Stat label="In progress" value={perf.inProgress} />
          <Stat label="Pending" value={myTasks.filter((t) => t.status === "Pending").length} />
          <Stat label="Overdue" value={overdue.length} tone="destructive" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">{isAdmin ? "All tasks" : "My tasks"}</h2>
        <TaskFilters
          search={search} setSearch={setSearch}
          status={status} setStatus={setStatus}
          priority={priority} setPriority={setPriority}
          showUserFilter={false}
          sort={sort} setSort={setSort}
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
            showAssignee={isAdmin}
            onRowClick={(t) => { setDetail(t); setDetailOpen(true); }}
            onStatusChange={(id, s) => {
              const target = myTasks.find((x) => x.id === id);
              if (!target) {
                toast.error("You do not have access to this task.");
                return;
              }
              if (!canTransition(target.status, s as TaskStatus)) {
                toast.error(`Cannot move task from ${target.status} to ${s}`);
                return;
              }
              updateTask(id, { status: s, progress: s === "Completed" ? 100 : undefined as any }, currentUserId);
              toast.success(`Status updated to ${s}`);
            }}
          />
        )}
      </section>

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

function Stat({ label, value, tone }: { label: string; value: number; tone?: "destructive" }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className={`font-semibold text-lg ${tone === "destructive" ? "text-destructive" : ""}`}>{value}</p>
    </div>
  );
}
