import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { USERS } from "@/data/users";

const KEY = "taskcorp.currentUser.v1";

interface Ctx {
  currentUserId: string;
  setCurrentUserId: (id: string) => void;
  isAdmin: boolean;
}

const CurrentUserContext = createContext<Ctx | undefined>(undefined);

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [currentUserId, setCurrentUserIdState] = useState<string>(() => {
    return localStorage.getItem(KEY) || "admin";
  });

  useEffect(() => {
    localStorage.setItem(KEY, currentUserId);
  }, [currentUserId]);

  const setCurrentUserId = (id: string) => setCurrentUserIdState(id);
  const isAdmin = currentUserId === "admin";

  return (
    <CurrentUserContext.Provider value={{ currentUserId, setCurrentUserId, isAdmin }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) throw new Error("useCurrentUser must be used inside CurrentUserProvider");
  return ctx;
}

export const ALL_IDENTITIES = [
  { id: "admin", name: "Admin", role: "Workspace owner", initials: "AD", color: "231 70% 56%" },
  ...USERS,
];

export const getIdentity = (id: string) =>
  ALL_IDENTITIES.find((u) => u.id === id) ?? ALL_IDENTITIES[0];
