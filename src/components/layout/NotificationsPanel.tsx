import { useMemo, useState } from "react";
import { Bell, AlertOctagon, CheckCircle2, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTasks } from "@/hooks/useTasks";
import { useCurrentUser } from "@/context/CurrentUserContext";
import { isTaskOverdue } from "@/lib/scoring";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const { tasks } = useTasks();
  const { currentUserId, isAdmin } = useCurrentUser();

  const visible = useMemo(
    () => (isAdmin ? tasks : tasks.filter((t) => t.assignedTo === currentUserId)),
    [tasks, currentUserId, isAdmin],
  );

  const overdue = visible.filter(isTaskOverdue);
  const blocked = visible.filter((t) => t.status === "Blocked");
  const recentlyCompleted = visible
    .filter((t) => t.status === "Completed")
    .slice(0, 3);
  const newlyAssigned = visible
    .filter((t) => t.status === "Pending")
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 3);

  const adminAlerts = isAdmin && blocked.length >= 1
    ? [{ id: "sys-blocked", title: `${blocked.length} task${blocked.length > 1 ? "s" : ""} currently blocked`, meta: "Action needed to unblock the team" }]
    : [];

  const total = overdue.length + recentlyCompleted.length + newlyAssigned.length + adminAlerts.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Notifications"
          className="relative w-10 h-10 rounded-full border border-border hover:bg-secondary transition-all hover:scale-105 flex items-center justify-center"
        >
          <Bell className="w-4 h-4" />
          {overdue.length > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold flex items-center justify-center animate-pulse">
              {overdue.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="px-4 py-3 border-b border-border">
          <h4 className="font-display font-semibold">Notifications</h4>
          <p className="text-xs text-muted-foreground">{total} updates</p>
        </div>
        <ScrollArea className="h-80">
          <div className="p-2 space-y-1">
            {overdue.map((t) => (
              <NotificationItem
                key={`o-${t.id}`}
                tone="destructive"
                icon={<AlertOctagon className="w-4 h-4" />}
                title={`Overdue: ${t.name}`}
                meta={`Due ${formatDistanceToNow(new Date(t.dueDate), { addSuffix: true })}`}
              />
            ))}
            {newlyAssigned.map((t) => (
              <NotificationItem
                key={`n-${t.id}`}
                tone="primary"
                icon={<Clock className="w-4 h-4" />}
                title={`New task: ${t.name}`}
                meta={`Created ${formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}`}
              />
            ))}
            {recentlyCompleted.map((t) => (
              <NotificationItem
                key={`c-${t.id}`}
                tone="completed"
                icon={<CheckCircle2 className="w-4 h-4" />}
                title={`Completed: ${t.name}`}
                meta="Marked as done"
              />
            ))}
            {total === 0 && (
              <div className="text-center py-10 text-sm text-muted-foreground">
                You're all caught up 🎉
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function NotificationItem({
  icon,
  title,
  meta,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  meta: string;
  tone: "primary" | "destructive" | "completed";
}) {
  const toneClass =
    tone === "destructive"
      ? "bg-destructive/10 text-destructive"
      : tone === "completed"
      ? "bg-status-completed-bg text-status-completed"
      : "bg-primary/10 text-primary";
  return (
    <div className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-secondary/60 transition-colors">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${toneClass}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground">{meta}</p>
      </div>
    </div>
  );
}
