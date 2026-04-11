import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { setMemberSession, setTrainerSession, clearTrainerSession, clearMemberSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

type AccountKind = "member" | "trainer";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname?: string } } };
  const from = location.state?.from?.pathname;
  const defaultKind: AccountKind =
    from?.startsWith("/trainer") ? "trainer" : "member";
  const [accountKind, setAccountKind] = useState<AccountKind>(defaultKind);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
      navigate(from && from.startsWith("/trainer") ? from : "/trainer", { replace: true });
      return;
    }
    clearTrainerSession();
    setMemberSession(email.trim());
    toast.success("Signed in (demo)");
    navigate(from && from !== "/login" ? from : "/dashboard", { replace: true });
  };

  return (
    <Card className="w-full max-w-md border-border bg-card/80">
      <CardHeader>
        <CardTitle className="font-display text-2xl">Sign in</CardTitle>
        <CardDescription>Demo only—no real authentication.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label className="text-foreground">Sign in as</Label>
            <RadioGroup
              value={accountKind}
              onValueChange={(v) => setAccountKind(v as AccountKind)}
              className="grid gap-2"
            >
              <div className="flex items-center space-x-3 rounded-md border border-border p-3">
                <RadioGroupItem value="member" id="acct-member" />
                <Label htmlFor="acct-member" className="flex-1 cursor-pointer font-normal">
                  Member
                  <span className="block text-xs text-muted-foreground">Your training account</span>
                </Label>
              </div>
              <div className="flex items-center space-x-3 rounded-md border border-border p-3">
                <RadioGroupItem value="trainer" id="acct-trainer" />
                <Label htmlFor="acct-trainer" className="flex-1 cursor-pointer font-normal">
                  Trainer
                  <span className="block text-xs text-muted-foreground">Coach tools for your clients</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
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
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
            <Link to="/register" className="text-white hover:underline">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};

export default Login;
