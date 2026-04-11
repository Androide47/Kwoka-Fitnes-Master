import { useState, type FormEvent } from "react";
import { getMemberSession } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const UserSettings = () => {
  const session = getMemberSession();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    toast.success("Settings saved locally (demo).");
  };

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl mb-2">Account settings</h1>
      <p className="text-muted-foreground mb-8">Manage your member profile.</p>
      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle className="font-display text-base">Your information</CardTitle>
          <CardDescription>Signed in as {session?.email ?? "member"}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="set-email">Email</Label>
              <Input id="set-email" value={session?.email ?? ""} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="set-name">Display name</Label>
              <Input id="set-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="set-phone">Phone (optional)</Label>
              <Input id="set-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 …" />
            </div>
            <Button type="submit" className="bg-secondary text-white hover:bg-secondary/90">
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSettings;
