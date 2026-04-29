import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, UserRound, ListChecks, CalendarDays, Activity, Moon, Sun, Sparkles, ShieldCheck } from "lucide-react";
import NotificationsPanel from "./NotificationsPanel";
import UserSwitcher from "./UserSwitcher";
import { useCurrentUser, getIdentity } from "@/context/CurrentUserContext";

const ADMIN_NAV = [
  { to: "/", label: "Admin", icon: LayoutDashboard, end: true },
  { to: "/tasks", label: "All Tasks", icon: ListChecks },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/activity", label: "Activity", icon: Activity },
];
const EMPLOYEE_NAV = [
  { to: "/employee", label: "My Dashboard", icon: UserRound, end: true },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
];

export default function AppLayout() {
  const [dark, setDark] = useState<boolean>(() => localStorage.getItem("taskcorp.theme") === "dark");
  const { isAdmin, currentUserId } = useCurrentUser();
  const identity = getIdentity(currentUserId);
  const navItems = useMemo(() => (isAdmin ? ADMIN_NAV : EMPLOYEE_NAV), [isAdmin]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("taskcorp.theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border sticky top-0 h-screen">
        <div className="px-6 py-6 flex items-center gap-3 border-b border-sidebar-border">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-elevated">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold leading-none text-sidebar-accent-foreground">TaskCorp</h1>
            <p className="text-xs text-sidebar-foreground/70 mt-1">Performance OS</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          <p className="px-3 pb-2 text-[10px] uppercase tracking-widest text-sidebar-foreground/50">Workspace</p>
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:translate-x-0.5 ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-elevated"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="rounded-lg bg-sidebar-accent/40 p-4">
            <p className="text-xs text-sidebar-foreground/80">Productivity tip</p>
            <p className="text-sm font-medium text-sidebar-accent-foreground mt-1">
              Review overdue tasks at the start of every day.
            </p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between px-6 lg:px-10 py-4 gap-4">
            <div className="md:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold">TaskCorp</span>
            </div>
            <div className="hidden md:block flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Welcome back</p>
              <h2 className="font-display font-semibold text-lg truncate">Your workspace overview</h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:block">
                <UserSwitcher />
              </div>
              <NotificationsPanel />
              <button
                aria-label="Toggle theme"
                onClick={() => setDark((p) => !p)}
                className="w-10 h-10 rounded-full border border-border hover:bg-secondary transition-all hover:scale-105 flex items-center justify-center"
              >
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* mobile nav */}
          <nav className="md:hidden flex gap-1 px-4 pb-3 overflow-x-auto">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                    isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="sm:hidden px-4 pb-3">
            <UserSwitcher />
          </div>
        </header>

        <main className="flex-1 px-6 lg:px-10 py-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
