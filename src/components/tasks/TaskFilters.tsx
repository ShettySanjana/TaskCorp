import { Search, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRIORITIES, STATUSES } from "@/types/task";
import { USERS } from "@/data/users";

export type SortKey = "due-asc" | "due-desc" | "priority" | "created-desc" | "name";

interface Props {
  search: string;
  setSearch: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  priority: string;
  setPriority: (v: string) => void;
  user?: string;
  setUser?: (v: string) => void;
  showUserFilter?: boolean;
  sort?: SortKey;
  setSort?: (v: SortKey) => void;
}

export default function TaskFilters({
  search, setSearch, status, setStatus, priority, setPriority, user, setUser, showUserFilter = true,
  sort, setSort,
}: Props) {
  return (
    <div className="card-elevated p-4 flex flex-col lg:flex-row gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks by name..."
          className="pl-9"
        />
      </div>

      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="lg:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={priority} onValueChange={setPriority}>
        <SelectTrigger className="lg:w-40"><SelectValue placeholder="Priority" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
        </SelectContent>
      </Select>

      {showUserFilter && setUser && (
        <Select value={user ?? "all"} onValueChange={setUser}>
          <SelectTrigger className="lg:w-44"><SelectValue placeholder="Assignee" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All assignees</SelectItem>
            {USERS.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
          </SelectContent>
        </Select>
      )}

      {sort && setSort && (
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="lg:w-44">
            <ArrowUpDown className="w-3.5 h-3.5 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="due-asc">Due (soonest)</SelectItem>
            <SelectItem value="due-desc">Due (latest)</SelectItem>
            <SelectItem value="priority">Priority (highest)</SelectItem>
            <SelectItem value="created-desc">Recently created</SelectItem>
            <SelectItem value="name">Name (A–Z)</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
