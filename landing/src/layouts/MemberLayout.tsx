import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Settings, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import logoIcon from "@/assets/logo-icon.png";
import { cn } from "@/lib/utils";
import { clearMemberSession } from "@/lib/auth";

const memberNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/settings", label: "Account settings", icon: Settings },
];

const MemberLayout = () => {
  const handleSignOut = () => {
    clearMemberSession();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-card/50">
        <Link to="/" className="flex items-center gap-2 p-4 border-b border-border">
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
        <div className="mt-auto p-3 border-t border-border">
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
        <header className="md:hidden flex items-center justify-between border-b border-border px-4 py-3">
          <Link to="/dashboard" className="font-display text-xs tracking-wider">
            Account
          </Link>
          <div className="flex gap-2">
            {memberNav.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn("text-xs px-2 py-1 rounded", isActive ? "bg-secondary/15 text-white" : "text-muted-foreground")
                }
              >
                {label === "Account settings" ? "Settings" : label}
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
