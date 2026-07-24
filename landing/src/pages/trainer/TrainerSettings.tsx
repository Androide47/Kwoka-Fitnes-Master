import { useState, type FormEvent } from "react";
import { getTrainerSession } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const TrainerSettings = () => {
  const session = getTrainerSession();
  const [firstName, setFirstName] = useState("Alex");
  const [lastName, setLastName] = useState("Coach");
  const [phone, setPhone] = useState("+1 555 0100");
  const [headline, setHeadline] = useState("Strength & conditioning");
  const [bio, setBio] = useState("Personal box trainer focused on sustainable progress.");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [bookingNotifs, setBookingNotifs] = useState(true);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    toast.success("Settings saved locally (demo).");
  };

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="font-display text-3xl mb-2">Settings</h1>
        <p className="text-muted-foreground">Coach profile and notification preferences (demo).</p>
      </div>

      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle className="font-display text-base">User Info / Settings</CardTitle>
          <CardDescription>Signed in as {session?.email ?? "trainer"}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tr-first">First name</Label>
                <Input
                  id="tr-first"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tr-last">Last name</Label>
                <Input id="tr-last" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tr-phone">Phone</Label>
              <Input id="tr-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tr-headline">Headline</Label>
              <Input
                id="tr-headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tr-bio">Description / bio</Label>
              <Textarea
                id="tr-bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Your experience, certifications, training style…"
              />
            </div>

            <div className="space-y-4 rounded-lg border border-border p-4">
              <p className="font-display text-sm tracking-wide">Notifications</p>
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="email-n" className="font-normal">
                  Email notifications
                </Label>
                <Switch id="email-n" checked={emailNotifs} onCheckedChange={setEmailNotifs} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="book-n" className="font-normal">
                  Booking alerts
                </Label>
                <Switch id="book-n" checked={bookingNotifs} onCheckedChange={setBookingNotifs} />
              </div>
            </div>

            <Button type="submit" className="bg-secondary text-white hover:bg-secondary/90">
              Save
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainerSettings;
