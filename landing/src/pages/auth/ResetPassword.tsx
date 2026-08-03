import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type AccountKind = "member" | "trainer";

type ResetPasswordProps = {
  accountKind: AccountKind;
};

const ResetPassword = ({ accountKind }: ResetPasswordProps) => {
  const navigate = useNavigate();
  const isCoach = accountKind === "trainer";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error("Enter a new password.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    // Cognito confirmForgotPassword will replace this demo success path.
    toast.success("Password updated (demo). Sign in with your new password.");
    navigate("/login", { replace: true, state: { accountKind } });
  };

  return (
    <Card className="w-full max-w-md border-border bg-card/80">
      <CardHeader>
        <CardTitle className="font-display text-2xl">
          {isCoach ? "Set coach password" : "Set new password"}
        </CardTitle>
        <CardDescription>
          Choose a new password for your {isCoach ? "coach" : "client"} account. Cognito is not
          connected yet—this is a demo form.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-password">New password</Label>
            <Input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reset-confirm">Confirm password</Label>
            <Input
              id="reset-confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full bg-secondary text-white hover:bg-secondary/90">
            Update password
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/login" state={{ accountKind }} className="text-white hover:underline">
            Back to sign in
          </Link>
        </p>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Need help?{" "}
          <Link
            to="/contact-support"
            state={{ accountKind }}
            className="text-white hover:underline"
          >
            Contact support
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};

export default ResetPassword;
