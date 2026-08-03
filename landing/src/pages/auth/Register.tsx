import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";
import { authApi } from "@/lib/api/authApi";
import { getPanelPath } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type FromState = { from?: { pathname: string; search?: string; hash?: string } };

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const panelPath = getPanelPath();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  if (panelPath) {
    return <Navigate to={panelPath} replace />;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Email is required.");
      return;
    }
    authApi.registerMember({ email, name });
    toast.success("Account created—complete your profile next.");
    navigate("/onboarding", { replace: true, state: location.state });
  };

  return (
    <Card className="w-full max-w-md border-border bg-card/80">
      <CardHeader>
        <CardTitle className="font-display text-2xl">Create account</CardTitle>
        <CardDescription>
          Demo registration—after this you’ll set up phone, body metrics, goals, and habits.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reg-name">Display name</Label>
            <Input id="reg-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-email">Email</Label>
            <Input
              id="reg-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-pass">Password</Label>
            <Input id="reg-pass" type="password" placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full bg-secondary text-white hover:bg-secondary/90">
            Register
          </Button>
        </form>

        <SocialAuthButtons />

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" state={location.state} className="text-white hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};

export default Register;
