import { NavLink, Outlet, Link } from "react-router-dom";
import { LayoutDashboard, Users, Calendar, Settings, LogOut } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import { cn } from "@/lib/utils";
import { clearTrainerSession } from "@/lib/auth";

const trainerNav = [
  { to: "/trainer", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/trainer/clients", label: "Your clients", icon: Users },
  { to: "/trainer/schedule", label: "Schedule", icon: Calendar },
  { to: "/trainer/settings", label: "Trainer profile", icon: Settings },
];

const TrainerLayout = () => {
  const handleSignOut = () => {
    clearTrainerSession();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-card/50">
        <Link to="/" className="flex items-center gap-2 p-4 border-b border-border">
          <img src={logoIcon} alt="" className="h-8 w-8" />
          <span className="font-display text-xs tracking-wider text-white">TRAINER</span>
        </Link>
        <p className="px-4 pt-3 text-[10px] font-display tracking-widest text-muted-foreground">
          COACH TOOLS
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
          <span className="font-display text-sm tracking-wider md:hidden">Trainer</span>
          <nav className="md:hidden flex flex-wrap gap-2">
            {trainerNav.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn("text-xs px-2 py-1 rounded", isActive ? "bg-secondary/15 text-white" : "text-muted-foreground")
                }
              >
                {label.replace("Your ", "")}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TrainerLayout;
