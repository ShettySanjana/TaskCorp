import { useMemo, useState } from "react";
import { Activity, Filter, Trash2 } from "lucide-react";
import { useAudit } from "@/hooks/useAudit";
import { clearAudit } from "@/lib/audit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getIdentity } from "@/context/CurrentUserContext";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const ACTION_LABEL: Record<string, string> = {
  create: "created",
  update: "updated",
  delete: "deleted",
  comment: "commented on",
  status: "moved",
};

const ACTION_TONE: Record<string, string> = {
  create: "bg-status-completed-bg text-status-completed",
  update: "bg-primary/10 text-primary",
  delete: "bg-destructive/10 text-destructive",
  comment: "bg-secondary text-foreground",
  status: "bg-status-progress-bg text-status-progress",
};

export default function ActivityLog() {
  const entries = useAudit();
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("all");

  const filtered = useMemo(() => {
    return entries
      .slice()
      .reverse()
      .filter((e) => {
        const matchesSearch =
          !search ||
          (e.taskName ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (e.note ?? "").toLowerCase().includes(search.toLowerCase());
        const matchesAction = action === "all" || e.action === action;
        return matchesSearch && matchesAction;
      });
  }, [entries, search, action]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </span>
            System activity
          </h1>
          <p className="text-muted-foreground">
            Chronological audit trail of every action taken in the workspace.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            clearAudit();
            toast.success("Audit log cleared");
          }}
        >
          <Trash2 className="w-4 h-4 mr-2" /> Clear log
        </Button>
      </div>

      <div className="card-elevated p-4 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[220px]">
          <Input
            placeholder="Search by task or note..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              <SelectItem value="create">Created</SelectItem>
              <SelectItem value="update">Updated</SelectItem>
              <SelectItem value="status">Status change</SelectItem>
              <SelectItem value="delete">Deleted</SelectItem>
              <SelectItem value="comment">Comments</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="card-elevated p-6">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            No activity yet. Actions will appear here as your team works.
          </p>
        ) : (
          <ol className="relative border-l border-border ml-3 space-y-5">
            {filtered.map((e) => {
              const u = getIdentity(e.authorId);
              return (
                <li key={e.id} className="ml-6">
                  <span
                    className="absolute -left-2 w-4 h-4 rounded-full border-2 border-background"
                    style={{ background: `hsl(${u.color})` }}
                  />
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold">{u.name}</span>{" "}
                        <span className={`inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${ACTION_TONE[e.action]}`}>
                          {ACTION_LABEL[e.action] ?? e.action}
                        </span>{" "}
                        {e.taskName && <span className="font-medium">"{e.taskName}"</span>}
                      </p>
                      {e.field && e.field !== "created" && e.field !== "deleted" && e.field !== "comment" && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {e.field}: <code className="bg-secondary px-1.5 py-0.5 rounded">{e.field === "assignedTo" ? getIdentity(e.from ?? "").name : e.from || "—"}</code>{" → "}
                          <code className="bg-secondary px-1.5 py-0.5 rounded">{e.field === "assignedTo" ? getIdentity(e.to ?? "").name : e.to || "—"}</code>
                        </p>
                      )}
                      {e.note && e.action === "comment" && (
                        <p className="text-xs text-muted-foreground mt-0.5 italic">"{e.note}"</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(e.createdAt), { addSuffix: true })}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {format(new Date(e.createdAt), "MMM d, yyyy · h:mm a")}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
