import { useState, type FormEvent } from "react";
import { getMemberSession } from "@/lib/auth";
import { memberProfileApi } from "@/lib/api/memberProfileApi";
import type { FitnessLevel } from "@/lib/api/types";
import type { UnitSystem } from "@/lib/units";
import {
  heightToInches,
  toDisplayHeight,
  toDisplayWeight,
  weightToPounds,
} from "@/lib/units";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const UserSettings = () => {
  const session = getMemberSession();
  const stored = session
    ? memberProfileApi.getForUser(session.user.id, session.user.email)
    : null;

  const [name, setName] = useState(session?.user.name ?? "");
  const [phone, setPhone] = useState(stored?.phone ?? "");
  const [birthday, setBirthday] = useState(stored?.birthday ?? "");
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(stored?.unitSystem ?? "imperial");
  const [heightIn, setHeightIn] = useState(stored?.heightIn ?? "");
  const [weightLb, setWeightLb] = useState(stored?.weightLb ?? "");
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel | "">(stored?.fitnessLevel ?? "");
  const [goals, setGoals] = useState((stored?.goals ?? []).join(", "));
  const [habits, setHabits] = useState((stored?.habits ?? []).join(", "));
  const [medicalConditions, setMedicalConditions] = useState(stored?.medicalConditions ?? "");

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!session || !stored) {
      toast.error("Sign in to save settings.");
      return;
    }
    memberProfileApi.save({
      ...stored,
      userId: session.user.id,
      email: session.user.email,
      phone: phone.trim(),
      birthday,
      unitSystem,
      heightIn: heightIn.trim(),
      weightLb: weightLb.trim(),
      fitnessLevel: fitnessLevel || "",
      goals: goals
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean),
      habits: habits
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean),
      medicalConditions: medicalConditions.trim(),
      completedAt: stored.completedAt ?? new Date().toISOString(),
    });
    toast.success("Settings saved locally (demo).");
  };

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl mb-2">Account settings</h1>
      <p className="text-muted-foreground mb-8">Manage your member profile.</p>
      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle className="font-display text-base">Your information</CardTitle>
          <CardDescription>Signed in as {session?.user.email ?? "member"}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="set-email">Email</Label>
              <Input id="set-email" value={session?.user.email ?? ""} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="set-name">Display name</Label>
              <Input
                id="set-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="set-phone">Phone</Label>
              <Input
                id="set-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 …"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="set-birthday">Birthday</Label>
              <Input
                id="set-birthday"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Units</Label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { value: "imperial", label: "Imperial (in / lb)" },
                    { value: "metric", label: "Metric (cm / kg)" },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setUnitSystem(option.value)}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm transition-colors",
                      unitSystem === option.value
                        ? "border-secondary bg-secondary/15 text-white"
                        : "border-border text-muted-foreground hover:border-white/30 hover:text-white",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="set-height">Height ({unitSystem === "metric" ? "cm" : "in"})</Label>
                <Input
                  id="set-height"
                  type="number"
                  min={1}
                  step="0.1"
                  value={toDisplayHeight(heightIn, unitSystem)}
                  onChange={(e) => setHeightIn(heightToInches(e.target.value, unitSystem))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="set-weight">Weight ({unitSystem === "metric" ? "kg" : "lb"})</Label>
                <Input
                  id="set-weight"
                  type="number"
                  min={1}
                  step="0.1"
                  value={toDisplayWeight(weightLb, unitSystem)}
                  onChange={(e) => setWeightLb(weightToPounds(e.target.value, unitSystem))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="set-level">Fitness level</Label>
              <Input
                id="set-level"
                value={fitnessLevel}
                onChange={(e) => setFitnessLevel(e.target.value as FitnessLevel | "")}
                placeholder="beginner / intermediate / advanced"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="set-goals">Goals</Label>
              <Input
                id="set-goals"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="Comma-separated"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="set-habits">Habits</Label>
              <Input
                id="set-habits"
                value={habits}
                onChange={(e) => setHabits(e.target.value)}
                placeholder="Comma-separated"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="set-medical">Medical conditions</Label>
              <Textarea
                id="set-medical"
                rows={3}
                value={medicalConditions}
                onChange={(e) => setMedicalConditions(e.target.value)}
              />
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
