import { useEffect, useState } from "react";
import { readAudit, type AuditEntry } from "@/lib/audit";

export function useAudit(): AuditEntry[] {
  const [entries, setEntries] = useState<AuditEntry[]>(() => readAudit());

  useEffect(() => {
    const refresh = () => setEntries(readAudit());
    window.addEventListener("taskcorp:audit", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("taskcorp:audit", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return entries;
}
