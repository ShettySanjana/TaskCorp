import { getUser } from "@/data/users";

export default function UserAvatar({ userId, size = 32 }: { userId: string; size?: number }) {
  const u = getUser(userId);
  if (!u) return null;
  return (
    <div className="flex items-center gap-2">
      <div
        className="rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
        style={{ width: size, height: size, background: `hsl(${u.color})` }}
        title={u.name}
      >
        {u.initials}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{u.name}</p>
        <p className="text-xs text-muted-foreground truncate">{u.role}</p>
      </div>
    </div>
  );
}
