import type { TaskHistoryEntry } from "@/types/task";

const KEY = "taskcorp.audit.v1";

export interface AuditEntry extends TaskHistoryEntry {
  taskId: string;
  taskName?: string;
  action: "create" | "update" | "delete" | "comment" | "status";
}

const uid = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2));

export function readAudit(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuditEntry[]) : [];
  } catch {
    return [];
  }
}

export function writeAudit(entries: AuditEntry[]) {
  // cap at 500 most recent entries
  const trimmed = entries.slice(-500);
  localStorage.setItem(KEY, JSON.stringify(trimmed));
}

export function appendAudit(entry: Omit<AuditEntry, "id" | "createdAt"> & { id?: string; createdAt?: string }) {
  const list = readAudit();
  list.push({
    ...entry,
    id: entry.id ?? uid(),
    createdAt: entry.createdAt ?? new Date().toISOString(),
  });
  writeAudit(list);
  // notify same-tab listeners
  window.dispatchEvent(new CustomEvent("taskcorp:audit"));
}

export function clearAudit() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("taskcorp:audit"));
}
