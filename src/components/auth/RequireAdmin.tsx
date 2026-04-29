import { ReactNode } from "react";
import { useCurrentUser } from "@/context/CurrentUserContext";
import AccessDenied from "@/pages/AccessDenied";

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAdmin } = useCurrentUser();
  if (!isAdmin) return <AccessDenied />;
  return <>{children}</>;
}
