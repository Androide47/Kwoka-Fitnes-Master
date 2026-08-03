import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contactApi } from "@/lib/api/contactApi";
import { toast } from "sonner";

type AccountKind = "member" | "trainer";

type SupportState = {
  accountKind?: AccountKind;
};

const ContactSupport = () => {
  const location = useLocation();
  const accountKind =
    (location.state as SupportState | null)?.accountKind === "trainer" ? "trainer" : "member";
  const isCoach = accountKind === "trainer";
  const recoverPath = isCoach ? "/forgot-password/coach" : "/forgot-password";

  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !details.trim()) {
      toast.error("Email and a short description are required.");
      return;
    }
    contactApi.submitIssue({
      email: email.trim(),
      category: "account",
      details: `[Password recovery · ${isCoach ? "coach" : "client"}] ${details.trim()}`,
    });
    setSubmitted(true);
    toast.success("Support request recorded (demo).");
  };

  return (
    <Card className="w-full max-w-md border-border bg-card/80">
      <CardHeader>
        <CardTitle className="font-display text-2xl">Contact support</CardTitle>
        <CardDescription>
          {submitted
            ? "Thanks—we’ll follow up when support email is connected."
            : `Need help recovering your ${isCoach ? "coach" : "client"} account? Tell us what happened.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Demo only—no ticket is sent yet. You can return to password recovery or sign in.
            </p>
            <Button asChild className="w-full bg-secondary text-white hover:bg-secondary/90">
              <Link to={recoverPath}>Back to password recovery</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/login" state={{ accountKind }}>
                Back to sign in
              </Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="support-email">Email on your account</Label>
              <Input
                id="support-email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-details">How can we help?</Label>
              <Textarea
                id="support-details"
                required
                rows={5}
                placeholder="I didn’t get a reset email, I no longer have access to that inbox…"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full bg-secondary text-white hover:bg-secondary/90">
              Send to support
            </Button>
          </form>
        )}

        {!submitted && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to={recoverPath} className="text-white hover:underline">
              Back to password recovery
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactSupport;
