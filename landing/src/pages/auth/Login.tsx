import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, Dumbbell, Eye, EyeOff, ArrowRight } from "lucide-react";
import { setMemberSession, setTrainerSession, clearTrainerSession, clearMemberSession } from "@/lib/auth";
import { DEMO_TRAINER_EMAIL } from "@/lib/sessionCredits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

type AccountKind = "member" | "trainer";

type FromState = { from?: { pathname: string; search?: string; hash?: string } };

const copy: Record<AccountKind, { title: string; description: string; cta: string }> = {
  member: {
    title: "Welcome back",
    description: "Sign in to track workouts, book sessions and manage your plan.",
    cta: "Sign in to your account",
  },
  trainer: {
    title: "Coach portal",
    description: "Sign in to manage your clients, schedule and programs.",
    cta: "Sign in as trainer",
  },
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as FromState | null)?.from;
  const fromPath = from?.pathname ?? "";
  const defaultKind: AccountKind = fromPath.startsWith("/trainer") ? "trainer" : "member";
  const [accountKind, setAccountKind] = useState<AccountKind>(defaultKind);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Enter an email for the demo.");
      return;
    }
    if (accountKind === "trainer") {
      clearMemberSession();
      setTrainerSession(email.trim());
      toast.success("Signed in (demo)");
      const trainerTo =
        fromPath.startsWith("/trainer") && fromPath !== "/login"
          ? `${fromPath}${from?.search ?? ""}${from?.hash ?? ""}`
          : "/trainer";
      navigate(trainerTo, { replace: true });
      return;
    }
    clearTrainerSession();
    setMemberSession(email.trim());
    toast.success("Signed in (demo)");
    const memberTo =
      fromPath && fromPath !== "/login"
        ? `${fromPath}${from?.search ?? ""}${from?.hash ?? ""}`
        : "/dashboard";
    navigate(memberTo, { replace: true });
  };

  const { title, description, cta } = copy[accountKind];

  return (
    <Card className="w-full max-w-md border-border bg-card/80 shadow-lg shadow-black/20">
      <CardHeader className="space-y-4 pb-4">
        <Tabs
          value={accountKind}
          onValueChange={(v) => setAccountKind(v as AccountKind)}
        >
          <TabsList className="grid h-11 w-full grid-cols-2">
            <TabsTrigger value="member" className="gap-2 text-sm">
              <User className="h-4 w-4" aria-hidden />
              Member
            </TabsTrigger>
            <TabsTrigger value="trainer" className="gap-2 text-sm">
              <Dumbbell className="h-4 w-4" aria-hidden />
              Trainer
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="space-y-1.5">
          <CardTitle className="font-display text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder={accountKind === "trainer" ? DEMO_TRAINER_EMAIL : "you@example.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password">Password</Label>
              <button
                type="button"
                onClick={() => toast.info("Demo only—any password works.")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full gap-2 bg-secondary text-white hover:bg-secondary/90"
          >
            {cta}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </form>
        {accountKind === "trainer" && (
          <button
            type="button"
            onClick={() => setEmail(DEMO_TRAINER_EMAIL)}
            className="mt-4 w-full rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
          >
            Try the demo trainer account — <span className="text-primary">{DEMO_TRAINER_EMAIL}</span>
          </button>
        )}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/register" state={location.state} className="text-white hover:underline">
            Create an account
          </Link>
        </p>
        <p className="mt-3 text-center text-xs text-muted-foreground/70">
          Demo only—no real authentication.
        </p>
      </CardContent>
    </Card>
  );
};

export default Login;
