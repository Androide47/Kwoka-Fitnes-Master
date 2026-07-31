import { NavLink, Outlet, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Dumbbell,
  Library,
  Calendar,
  MessageSquare,
  FileText,
  Settings,
  Info,
  LogOut,
} from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import { cn } from "@/lib/utils";
import { clearTrainerSession } from "@/lib/auth";
import { WorkoutLibraryProvider } from "@/context/WorkoutLibraryContext";

const trainerNav = [
  { to: "/trainer", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/trainer/workouts", label: "Workouts", icon: Dumbbell },
  { to: "/trainer/library", label: "Library", icon: Library },
  { to: "/trainer/calendar", label: "Calendar", icon: Calendar },
  { to: "/trainer/chat", label: "Chat", icon: MessageSquare },
  { to: "/trainer/blog", label: "Blog", icon: FileText },
  { to: "/trainer/settings", label: "Settings", icon: Settings },
  { to: "/trainer/about", label: "About", icon: Info },
];

const TrainerLayout = () => {
  const handleSignOut = () => {
    clearTrainerSession();
    window.location.href = "/login";
  };

  return (
    <WorkoutLibraryProvider>
      <div className="min-h-screen bg-background flex">
        <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-card/50">
          <Link to="/" className="flex items-center gap-2 p-4 border-b border-border">
            <img src={logoIcon} alt="" className="h-8 w-8" />
            <span className="font-display text-xs tracking-wider text-white">COACH PANEL</span>
          </Link>
          <p className="px-4 pt-3 text-[10px] font-display tracking-widest text-muted-foreground">
            ADMIN TOOLS
          </p>
          <nav className="flex flex-col gap-1 p-3">
            {trainerNav.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
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
          <div className="mt-auto p-3 border-t border-border space-y-1">
            <Link
              to="/dashboard"
              className="block rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Switch to member account
            </Link>
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
        <div className="flex-1 flex flex-col min-w-0">
          <header className="border-b border-border px-4 py-3 flex items-center justify-between gap-4">
            <span className="font-display text-sm tracking-wider md:hidden">Coach</span>
            <nav className="md:hidden flex flex-wrap gap-2">
              {trainerNav.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      "text-xs px-2 py-1 rounded",
                      isActive ? "bg-secondary/15 text-white" : "text-muted-foreground",
                    )
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </header>
          <main className="flex-1 p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </WorkoutLibraryProvider>
  );
};

export default TrainerLayout;
