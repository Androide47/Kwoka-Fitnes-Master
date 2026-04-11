import { useState, type FormEvent } from "react";
import { getTrainerSession } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const TrainerSettings = () => {
  const session = getTrainerSession();
  const [headline, setHeadline] = useState("Strength & conditioning");
  const [bio, setBio] = useState("");

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    toast.success("Trainer profile saved locally (demo).");
  };

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl mb-2">Trainer profile</h1>
      <p className="text-muted-foreground mb-8">How clients see you on Kwoka.</p>
      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle className="font-display text-base">Public profile</CardTitle>
          <CardDescription>Signed in as {session?.email ?? "trainer"}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tr-headline">Headline</Label>
              <Input id="tr-headline" value={headline} onChange={(e) => setHeadline(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tr-bio">Bio</Label>
              <Textarea
                id="tr-bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Your experience, certifications, training style…"
              />
            </div>
            <Button type="submit" className="bg-secondary text-white hover:bg-secondary/90">
              Save profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainerSettings;
