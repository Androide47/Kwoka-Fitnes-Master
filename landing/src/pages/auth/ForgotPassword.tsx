import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type AccountKind = "member" | "trainer";

type ForgotPasswordProps = {
  accountKind: AccountKind;
};

const ForgotPassword = ({ accountKind }: ForgotPasswordProps) => {
  const isCoach = accountKind === "trainer";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const resetDemoPath = isCoach ? "/reset-password/coach" : "/reset-password";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Enter the email for your account.");
      return;
    }
    // Cognito forgot-password flow will replace this demo success state.
    setSent(true);
    toast.success("If that email exists, a reset link will be sent (demo).");
  };

  return (
    <Card className="w-full max-w-md border-border bg-card/80">
      <CardHeader>
        <CardTitle className="font-display text-2xl">
          {isCoach ? "Coach password recovery" : "Recover password"}
        </CardTitle>
        <CardDescription>
          {sent
            ? "Check your inbox for a reset link. Cognito email delivery is not connected yet."
            : isCoach
              ? "Enter the email on your coach account and we’ll send a reset link."
              : "Enter your account email and we’ll send a reset link."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Demo: open the reset form to set a new password. Real recovery will use a Cognito email
              link.
            </p>
            <Button asChild className="w-full bg-secondary text-white hover:bg-secondary/90">
              <Link to={resetDemoPath}>Continue to reset password</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
            >
              Try another email
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/contact-support" state={{ accountKind }}>
                Contact support
              </Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full bg-secondary text-white hover:bg-secondary/90">
              Send reset link
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/login" state={{ accountKind }} className="text-white hover:underline">
            Back to sign in
          </Link>
        </p>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Still stuck?{" "}
          <Link
            to="/contact-support"
            state={{ accountKind }}
            className="text-white hover:underline"
          >
            Contact support
          </Link>
        </p>
        {isCoach && (
          <p className="mt-3 text-center text-sm text-muted-foreground">
            <Link to="/forgot-password" className="text-white hover:underline">
              Client password recovery
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ForgotPassword;
