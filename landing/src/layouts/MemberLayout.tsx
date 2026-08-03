import { NavLink, Outlet, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Dumbbell,
  TrendingUp,
  CalendarDays,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import { cn } from "@/lib/utils";
import { clearMemberSession } from "@/lib/auth";

const memberNav = [
  { to: "/dashboard", label: "Dashboard", short: "Home", icon: LayoutDashboard },
  { to: "/workouts", label: "Workouts", short: "Workouts", icon: Dumbbell },
  { to: "/progress", label: "Progress", short: "Progress", icon: TrendingUp },
  { to: "/calendar", label: "Calendar", short: "Calendar", icon: CalendarDays },
  { to: "/messages", label: "Messages", short: "Chat", icon: MessageSquare },
  { to: "/settings", label: "Account settings", short: "Settings", icon: Settings },
];

const MemberLayout = () => {
  const handleSignOut = () => {
    clearMemberSession();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-card/50">
        <Link to="/" className="flex items-center gap-2 border-b border-border p-4">
          <img src={logoIcon} alt="" className="h-8 w-8" />
          <span className="font-display text-xs tracking-wider text-white">KWOKA</span>
        </Link>
        <nav className="flex flex-col gap-1 p-3">
          {memberNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary/15 text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-border p-3">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-2 border-b border-border px-3 py-3 md:hidden">
          <Link to="/dashboard" className="font-display text-xs tracking-wider">
            Account
          </Link>
          <div className="flex flex-wrap justify-end gap-1">
            {memberNav.map(({ to, short }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "rounded px-2 py-1 text-[10px]",
                    isActive ? "bg-secondary/15 text-white" : "text-muted-foreground",
                  )
                }
              >
                {short}
              </NavLink>
            ))}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MemberLayout;
