import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Task } from "@/types/task";

interface Props {
  tasks: Task[];
  onTaskClick?: (t: Task) => void;
}

const PRIORITY_COLOR: Record<string, string> = {
  Low: "bg-priority-low",
  Medium: "bg-priority-medium",
  High: "bg-priority-high",
  Critical: "bg-priority-critical",
};

export default function CalendarView({ tasks, onTaskClick }: Props) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const monthLabel = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });

  const days = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const last = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const startDow = first.getDay();
    const total = startDow + last.getDate();
    const padEnd = (7 - (total % 7)) % 7;
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= last.getDate(); d++)
      cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    for (let i = 0; i < padEnd; i++) cells.push(null);
    return cells;
  }, [cursor]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      const key = t.dueDate.slice(0, 10);
      const arr = map.get(key) ?? [];
      arr.push(t);
      map.set(key, arr);
    }
    return map;
  }, [tasks]);

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);

  return (
    <div className="card-elevated p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-semibold">Calendar</h3>
          <p className="text-xs text-muted-foreground">Tasks scheduled by due date</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-medium text-sm w-32 text-center">{monthLabel}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="px-2 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          if (!d) return <div key={i} className="h-24 rounded-md bg-secondary/30" />;
          const key = d.toISOString().slice(0, 10);
          const dayTasks = tasksByDay.get(key) ?? [];
          const isToday = key === todayKey;
          return (
            <div
              key={i}
              className={`h-24 rounded-md border p-1.5 flex flex-col gap-0.5 overflow-hidden transition-colors ${
                isToday ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-secondary/50"
              }`}
            >
              <div className={`text-xs font-semibold ${isToday ? "text-primary" : ""}`}>{d.getDate()}</div>
              <div className="flex-1 space-y-0.5 overflow-hidden">
                {dayTasks.slice(0, 3).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onTaskClick?.(t)}
                    className={`w-full text-left text-[10px] truncate text-white px-1.5 py-0.5 rounded hover:opacity-80 transition-opacity ${PRIORITY_COLOR[t.priority]}`}
                    title={t.name}
                  >
                    {t.name}
                  </button>
                ))}
                {dayTasks.length > 3 && (
                  <p className="text-[10px] text-muted-foreground px-1">+{dayTasks.length - 3} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
