import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, PRIORITIES, type Task } from "@/types/task";
import { USERS } from "@/data/users";
import { nextStatuses } from "@/lib/workflow";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial?: Task | null;
  onSubmit: (data: Omit<Task, "id" | "createdAt"> & { id?: string }) => void;
}

const today = () => new Date().toISOString().slice(0, 10);

const empty = {
  name: "",
  description: "",
  priority: "Medium" as Task["priority"],
  status: "Pending" as Task["status"],
  assignedTo: USERS[0].id,
  dueDate: today(),
  category: "Feature" as Task["category"],
  progress: 0,
};

export default function TaskFormDialog({ open, onOpenChange, initial, onSubmit }: Props) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name,
        description: initial.description,
        priority: initial.priority,
        status: initial.status,
        assignedTo: initial.assignedTo,
        dueDate: initial.dueDate,
        category: initial.category,
        progress: initial.progress ?? 0,
      });
    } else {
      setForm(empty);
    }
  }, [initial, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit({ ...form, id: initial?.id });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {initial ? "Edit task" : "Create new task"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Task name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Improve checkout performance"
              required
            />
          </div>

          <div>
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Briefly describe the task and acceptance criteria..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm((p) => ({ ...p, priority: v as Task["priority"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((p) => ({ ...p, status: v as Task["status"] }))}
                disabled={initial?.status === "Completed"}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(initial ? nextStatuses(initial.status) : (["Pending"] as Task["status"][])).map((x) => (
                    <SelectItem key={x} value={x}>{x}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v as Task["category"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Assigned to</Label>
              <Select value={form.assignedTo} onValueChange={(v) => setForm((p) => ({ ...p, assignedTo: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {USERS.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="due">Due date</Label>
              <Input
                id="due"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="prog">Progress ({form.progress}%)</Label>
              <Input
                id="prog"
                type="range"
                min={0}
                max={100}
                step={5}
                value={form.progress}
                onChange={(e) => setForm((p) => ({ ...p, progress: Number(e.target.value) }))}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{initial ? "Save changes" : "Create task"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
