export default function ProgressBar({ value, tone = "primary" }: { value: number; tone?: "primary" | "completed" | "warning" }) {
  const v = Math.max(0, Math.min(100, value));
  const color =
    tone === "completed"
      ? "bg-status-completed"
      : tone === "warning"
      ? "bg-status-pending"
      : "bg-gradient-primary";
  return (
    <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${v}%` }} />
    </div>
  );
}
