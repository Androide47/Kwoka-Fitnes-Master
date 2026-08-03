import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";
import { authApi } from "@/lib/api/authApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type AccountKind = "member" | "trainer";

type FromState = { from?: { pathname: string; search?: string; hash?: string } };

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as FromState | null)?.from;
  const fromPath = from?.pathname ?? "";
  const defaultKind: AccountKind = fromPath.startsWith("/trainer") ? "trainer" : "member";
  const [accountKind, setAccountKind] = useState<AccountKind>(defaultKind);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isCoach = accountKind === "trainer";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Enter an email for the demo.");
      return;
    }
    authApi.login({
      email: email.trim(),
      role: isCoach ? "trainer" : "client",
      password,
    });
    if (isCoach) {
      toast.success("Signed in (demo)");
      const trainerTo =
        fromPath.startsWith("/trainer") && fromPath !== "/login"
          ? `${fromPath}${from?.search ?? ""}${from?.hash ?? ""}`
          : "/trainer";
      navigate(trainerTo, { replace: true });
      return;
    }
    toast.success("Signed in (demo)");
    const memberTo =
      fromPath && fromPath !== "/login"
        ? `${fromPath}${from?.search ?? ""}${from?.hash ?? ""}`
        : "/dashboard";
    navigate(memberTo, { replace: true });
  };

  return (
    <Card className="w-full max-w-md border-border bg-card/80">
      <CardHeader>
        <CardTitle className="font-display text-2xl">
          {isCoach ? "Coach sign in" : "Sign in"}
        </CardTitle>
        <CardDescription>
          {isCoach
            ? "Access coach tools for your clients."
            : "Demo only—no real authentication."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full bg-secondary text-white hover:bg-secondary/90">
            Sign in
          </Button>
        </form>

        {!isCoach && <SocialAuthButtons />}

        {isCoach ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Not a coach?{" "}
            <button
              type="button"
              onClick={() => setAccountKind("member")}
              className="text-white hover:underline"
            >
              Client sign in
            </button>
          </p>
        ) : (
          <>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              New here?{" "}
              <Link to="/register" state={location.state} className="text-white hover:underline">
                Create an account
              </Link>
            </p>
            <p className="mt-3 text-center text-sm text-muted-foreground">
              <button
                type="button"
                onClick={() => setAccountKind("trainer")}
                className="text-white hover:underline"
              >
                Coach login
              </button>
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default Login;
