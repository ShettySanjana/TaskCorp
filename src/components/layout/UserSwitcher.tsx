import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ALL_IDENTITIES, useCurrentUser } from "@/context/CurrentUserContext";

export default function UserSwitcher() {
  const { currentUserId, setCurrentUserId } = useCurrentUser();
  const me = ALL_IDENTITIES.find((u) => u.id === currentUserId)!;

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-9 h-9 rounded-full text-white text-xs font-semibold flex items-center justify-center"
        style={{ background: `hsl(${me.color})` }}
      >
        {me.initials}
      </div>
      <Select value={currentUserId} onValueChange={setCurrentUserId}>
        <SelectTrigger className="w-[180px] h-9 border-border">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ALL_IDENTITIES.map((u) => (
            <SelectItem key={u.id} value={u.id}>
              <div className="flex flex-col">
                <span className="font-medium">{u.name}</span>
                <span className="text-[10px] text-muted-foreground">{u.role}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
