import emptyImg from "@/assets/empty-tasks.png";

export default function EmptyState({ title = "No tasks available", subtitle = "Create your first task to get started." }: { title?: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <img src={emptyImg} alt="No tasks illustration" width={280} height={210} loading="lazy" className="mb-6 opacity-90" />
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-2 max-w-sm">{subtitle}</p>
    </div>
  );
}
