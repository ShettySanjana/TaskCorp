import type { Task } from "@/types/task";
import { getIdentity } from "@/context/CurrentUserContext";

export function tasksToCSV(tasks: Task[]): string {
  const header = [
    "ID",
    "Name",
    "Description",
    "Priority",
    "Status",
    "Assignee",
    "Due Date",
    "Category",
    "Progress",
    "Created",
  ];
  const escape = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const rows = tasks.map((t) =>
    [
      t.id,
      t.name,
      t.description ?? "",
      t.priority,
      t.status,
      getIdentity(t.assignedTo).name,
      t.dueDate,
      t.category,
      String(t.progress ?? 0),
      new Date(t.createdAt).toISOString(),
    ]
      .map(escape)
      .join(","),
  );
  return [header.map(escape).join(","), ...rows].join("\n");
}

export function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportTasksCSV(tasks: Task[], filename = "taskcorp-tasks.csv") {
  downloadFile(tasksToCSV(tasks), filename, "text/csv;charset=utf-8;");
}

export function exportTasksPDF(tasks: Task[], title = "TaskCorp Report") {
  const styles = `
    body{font-family:'Inter',system-ui,sans-serif;color:#0f172a;padding:32px;}
    h1{font-size:22px;margin:0 0 4px 0;}
    p.meta{color:#64748b;font-size:12px;margin:0 0 24px 0;}
    table{width:100%;border-collapse:collapse;font-size:11px;}
    th,td{border:1px solid #e2e8f0;padding:6px 8px;text-align:left;vertical-align:top;}
    th{background:#f1f5f9;text-transform:uppercase;letter-spacing:.06em;font-size:10px;color:#475569;}
    .pill{display:inline-block;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:600;}
    .pri-Critical{background:#fee2e2;color:#b91c1c;} .pri-High{background:#ffedd5;color:#c2410c;}
    .pri-Medium{background:#dbeafe;color:#1d4ed8;} .pri-Low{background:#e2e8f0;color:#475569;}
    .st-Completed{background:#dcfce7;color:#15803d;} .st-Pending{background:#fef3c7;color:#a16207;}
    .st-Blocked{background:#fee2e2;color:#b91c1c;} .st-In{background:#dbeafe;color:#1d4ed8;}
    @media print{body{padding:16px;}}
  `;
  const rows = tasks
    .map((t) => {
      const stClass = t.status === "In Progress" ? "st-In" : `st-${t.status}`;
      return `<tr>
        <td><strong>${escapeHtml(t.name)}</strong><br/><span style="color:#64748b">${escapeHtml(t.description ?? "")}</span></td>
        <td><span class="pill pri-${t.priority}">${t.priority}</span></td>
        <td><span class="pill ${stClass}">${t.status}</span></td>
        <td>${escapeHtml(getIdentity(t.assignedTo).name)}</td>
        <td>${new Date(t.dueDate).toLocaleDateString()}</td>
        <td>${t.category}</td>
        <td>${t.progress ?? 0}%</td>
      </tr>`;
    })
    .join("");

  const html = `<!doctype html><html><head><meta charset="utf-8"/><title>${escapeHtml(title)}</title><style>${styles}</style></head><body>
    <h1>${escapeHtml(title)}</h1>
    <p class="meta">Generated ${new Date().toLocaleString()} · ${tasks.length} task${tasks.length === 1 ? "" : "s"}</p>
    <table><thead><tr>
      <th>Task</th><th>Priority</th><th>Status</th><th>Assignee</th><th>Due</th><th>Category</th><th>Progress</th>
    </tr></thead><tbody>${rows}</tbody></table>
    <script>window.addEventListener('load',()=>setTimeout(()=>window.print(),250));</script>
  </body></html>`;

  const w = window.open("", "_blank", "width=1024,height=768");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
