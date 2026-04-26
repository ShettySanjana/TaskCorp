import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "primary" | "completed" | "pending" | "blocked";
}

const tones = {
  primary: "bg-primary/10 text-primary",
  completed: "bg-status-completed-bg text-status-completed",
  pending: "bg-status-pending-bg text-status-pending",
  blocked: "bg-status-blocked-bg text-status-blocked",
};

export default function StatCard({ label, value, hint, icon: Icon, tone = "primary" }: Props) {
  return (
    <div className="card-elevated p-5 flex items-start justify-between">
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="font-display text-3xl font-bold mt-2">{value}</p>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tones[tone]}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}
