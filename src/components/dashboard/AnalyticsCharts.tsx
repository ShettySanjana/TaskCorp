import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import type { Task } from "@/types/task";
import { USERS } from "@/data/users";

interface Props {
  tasks: Task[];
}

const STATUS_COLORS: Record<string, string> = {
  Pending: "hsl(var(--status-pending))",
  "In Progress": "hsl(var(--status-progress))",
  Completed: "hsl(var(--status-completed))",
  Blocked: "hsl(var(--status-blocked))",
};

const PRIORITY_COLORS: Record<string, string> = {
  Low: "hsl(var(--priority-low))",
  Medium: "hsl(var(--priority-medium))",
  High: "hsl(var(--priority-high))",
  Critical: "hsl(var(--priority-critical))",
};

export default function AnalyticsCharts({ tasks }: Props) {
  const statusData = useMemo(
    () =>
      ["Pending", "In Progress", "Completed", "Blocked"].map((s) => ({
        name: s,
        value: tasks.filter((t) => t.status === s).length,
      })),
    [tasks],
  );

  const priorityData = useMemo(
    () =>
      ["Low", "Medium", "High", "Critical"].map((p) => ({
        name: p,
        value: tasks.filter((t) => t.priority === p).length,
      })),
    [tasks],
  );

  const userData = useMemo(
    () =>
      USERS.map((u) => ({
        name: u.name.split(" ")[0],
        completed: tasks.filter((t) => t.assignedTo === u.id && t.status === "Completed").length,
        open: tasks.filter((t) => t.assignedTo === u.id && t.status !== "Completed").length,
      })),
    [tasks],
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="card-elevated p-5">
        <h3 className="font-display font-semibold mb-1">Tasks by status</h3>
        <p className="text-xs text-muted-foreground mb-4">Distribution across the workspace</p>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={statusData}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
            >
              {statusData.map((d) => (
                <Cell key={d.name} fill={STATUS_COLORS[d.name]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="card-elevated p-5">
        <h3 className="font-display font-semibold mb-1">Priority breakdown</h3>
        <p className="text-xs text-muted-foreground mb-4">Where the team's attention goes</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={priorityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {priorityData.map((d) => (
                <Cell key={d.name} fill={PRIORITY_COLORS[d.name]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card-elevated p-5">
        <h3 className="font-display font-semibold mb-1">Workload by member</h3>
        <p className="text-xs text-muted-foreground mb-4">Open vs. completed per teammate</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={userData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="open" stackId="a" fill="hsl(var(--status-progress))" radius={[0, 0, 0, 0]} />
            <Bar dataKey="completed" stackId="a" fill="hsl(var(--status-completed))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
