import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  Calendar,
  CreditCard,
  Dumbbell,
  Flag,
  Image,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Mail,
  MessageSquare,
  Newspaper,
  Package,
  Settings,
  ShoppingBag,
  Users,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n/LanguageContext";
import { adminApi } from "@/lib/api";
import { config } from "@/lib/config";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";

const links = [
  { to: "/", key: "dashboard", icon: LayoutDashboard },
  { to: "/support", key: "support", icon: LifeBuoy },
  { to: "/users", key: "users", icon: Users },
  { to: "/products", key: "products", icon: Package },
  { to: "/orders", key: "orders", icon: ShoppingBag },
  { to: "/bookings", key: "bookings", icon: Calendar },
  { to: "/workouts", key: "workouts", icon: Dumbbell },
  { to: "/exercises", key: "exercises", icon: Video },
  { to: "/credits", key: "credits", icon: CreditCard },
  { to: "/blog", key: "blog", icon: Newspaper },
  { to: "/content", key: "content", icon: Flag },
  { to: "/newsletter", key: "newsletter", icon: Mail },
  { to: "/messages", key: "messages", icon: MessageSquare },
  { to: "/media", key: "media", icon: Image },
  { to: "/broadcasts", key: "broadcasts", icon: Bell },
  { to: "/settings", key: "settings", icon: Settings },
] as const;

export function Shell() {
  const { t, locale, setLocale } = useI18n();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar p-4 md:flex md:flex-col">
        <div className="mb-6 px-2">
          <p className="font-display text-sm tracking-[0.2em] text-primary">KWOKA</p>
          <p className="text-xs text-muted-foreground">{t.app.tagline}</p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent",
                  isActive && "bg-sidebar-accent text-primary",
                )
              }
            >
              <l.icon className="h-4 w-4" />
              {t.nav[l.key]}
            </NavLink>
          ))}
        </nav>
        <Button
          variant="ghost"
          className="mt-4 w-full justify-start"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          <LogOut className="h-4 w-4" />
          {t.auth.logout}
        </Button>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="md:hidden font-display text-sm text-primary">KWOKA</div>
          <p className="hidden text-sm text-muted-foreground sm:block">
            {user?.name} · {user?.email}
          </p>
          <div className="ml-auto flex items-center gap-2">
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as "en" | "es")}
              className="rounded-md border border-input bg-background px-2 py-1 text-sm"
            >
              <option value="en">{t.common.english}</option>
              <option value="es">{t.common.spanish}</option>
            </select>
            <Button
              variant="outline"
              onClick={async () => {
                await adminApi.resetDemo();
                toast.success(t.common.resetDone);
                window.location.reload();
              }}
            >
              {t.common.reset}
            </Button>
          </div>
        </header>
        {config.useMocks ? (
          <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-200">
            {t.app.mocksBanner}
          </div>
        ) : null}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
