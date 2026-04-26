import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarDays, MessageSquare, History, Send, User } from "lucide-react";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import ProgressBar from "./ProgressBar";
import type { Task } from "@/types/task";
import { getIdentity } from "@/context/CurrentUserContext";
import { formatDistanceToNow, format } from "date-fns";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  task: Task | null;
  currentUserId: string;
  onAddComment: (taskId: string, message: string, authorId: string) => void;
}

export default function TaskDetailDialog({ open, onOpenChange, task, currentUserId, onAddComment }: Props) {
  const [comment, setComment] = useState("");

  if (!task) return null;

  const assignee = getIdentity(task.assignedTo);
  const me = getIdentity(currentUserId);

  const submitComment = () => {
    if (!comment.trim()) return;
    onAddComment(task.id, comment.trim(), currentUserId);
    setComment("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{task.category}</span>
          </div>
          <DialogTitle className="font-display text-2xl pt-2">{task.name}</DialogTitle>
        </DialogHeader>

        <div className="text-sm text-muted-foreground -mt-2">{task.description || "No description provided."}</div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-border">
          <Meta label="Assignee" value={assignee.name} />
          <Meta label="Due" value={format(new Date(task.dueDate), "MMM d, yyyy")} icon={<CalendarDays className="w-3 h-3" />} />
          <Meta label="Created" value={formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })} />
          <Meta label="Progress" value={`${task.progress ?? 0}%`} />
        </div>

        <div className="px-1">
          <ProgressBar value={task.progress ?? 0} tone={task.status === "Completed" ? "completed" : "primary"} />
        </div>

        <Tabs defaultValue="comments" className="flex-1 flex flex-col min-h-0">
          <TabsList className="self-start">
            <TabsTrigger value="comments" className="gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Comments ({task.comments?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <History className="w-3.5 h-3.5" /> History ({task.history?.length ?? 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comments" className="flex-1 flex flex-col min-h-0 mt-3">
            <ScrollArea className="flex-1 pr-3 max-h-64">
              <div className="space-y-3">
                {(task.comments ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No comments yet — be the first.</p>
                ) : (
                  task.comments!.map((c) => {
                    const u = getIdentity(c.authorId);
                    return (
                      <div key={c.id} className="flex gap-3 animate-fade-in">
                        <div
                          className="w-8 h-8 rounded-full text-white text-xs font-semibold flex items-center justify-center shrink-0"
                          style={{ background: `hsl(${u.color})` }}
                        >
                          {u.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <p className="text-sm font-semibold">{u.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="mt-1 text-sm bg-secondary/60 rounded-lg px-3 py-2">{c.message}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full text-white text-xs font-semibold flex items-center justify-center shrink-0"
                  style={{ background: `hsl(${me.color})` }}
                >
                  {me.initials}
                </div>
                <div className="flex-1 space-y-2">
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={`Comment as ${me.name}...`}
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitComment();
                    }}
                  />
                  <div className="flex justify-end">
                    <Button size="sm" onClick={submitComment} disabled={!comment.trim()}>
                      <Send className="w-3.5 h-3.5 mr-1.5" /> Comment
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-3">
            <ScrollArea className="max-h-80 pr-3">
              <ol className="relative border-l border-border ml-3 space-y-4">
                {(task.history ?? [])
                  .slice()
                  .reverse()
                  .map((h) => {
                    const u = getIdentity(h.authorId);
                    return (
                      <li key={h.id} className="ml-6">
                        <span
                          className="absolute -left-2 w-4 h-4 rounded-full border-2 border-background flex items-center justify-center"
                          style={{ background: `hsl(${u.color})` }}
                        >
                          <User className="w-2 h-2 text-white" />
                        </span>
                        <p className="text-sm">
                          <span className="font-semibold">{u.name}</span>{" "}
                          {h.field === "created" ? (
                            "created this task"
                          ) : h.field === "comment" ? (
                            "added a comment"
                          ) : (
                            <>
                              changed <strong>{h.field}</strong>
                              {h.from !== undefined && (
                                <>
                                  {" from "}
                                  <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">
                                    {h.field === "assignedTo" ? getIdentity(h.from).name : h.from || "—"}
                                  </code>
                                </>
                              )}
                              {h.to !== undefined && (
                                <>
                                  {" to "}
                                  <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">
                                    {h.field === "assignedTo" ? getIdentity(h.to).name : h.to || "—"}
                                  </code>
                                </>
                              )}
                            </>
                          )}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {format(new Date(h.createdAt), "MMM d, yyyy · h:mm a")}
                        </p>
                      </li>
                    );
                  })}
              </ol>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function Meta({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold flex items-center gap-1 mt-0.5">
        {icon}
        {value}
      </p>
    </div>
  );
}
