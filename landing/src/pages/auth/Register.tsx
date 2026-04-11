import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { setMemberSession, clearTrainerSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Email is required.");
      return;
    }
    clearTrainerSession();
    setMemberSession(email.trim());
    toast.success("Account created (demo)");
    navigate("/dashboard", { replace: true });
  };

  return (
    <Card className="w-full max-w-md border-border bg-card/80">
      <CardHeader>
        <CardTitle className="font-display text-2xl">Create account</CardTitle>
        <CardDescription>Demo registration—data stays in this browser only.</CardDescription>
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
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-white hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};

export default Register;
