import { useMemo, useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { authApi } from "@/lib/api/authApi";
import {
  GOAL_OPTIONS,
  HABIT_OPTIONS,
  memberProfileApi,
} from "@/lib/api/memberProfileApi";
import type { FitnessLevel, MemberProfile } from "@/lib/api/types";
import type { UnitSystem } from "@/lib/units";
import {
  heightToInches,
  toDisplayHeight,
  toDisplayWeight,
  weightToPounds,
} from "@/lib/units";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type FromState = { from?: { pathname: string; search?: string; hash?: string } };

const STEPS = [
  { id: "about", title: "About you", description: "Contact details and birthday." },
  { id: "body", title: "Body baseline", description: "Height and starting weight." },
  { id: "fitness", title: "Fitness profile", description: "Level and training goals." },
  { id: "lifestyle", title: "Lifestyle", description: "Habits and health notes." },
] as const;

function toggleValue(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

const Onboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const session = authApi.getMemberSession();

  const initial = useMemo(() => {
    if (!session) return null;
    return memberProfileApi.getForUser(session.user.id, session.user.email);
  }, [session]);

  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<MemberProfile | null>(initial);

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (memberProfileApi.isCompleteFor(session.user.id)) {
    const from = (location.state as FromState | null)?.from;
    const to =
      from?.pathname && from.pathname !== "/onboarding"
        ? `${from.pathname}${from.search ?? ""}${from.hash ?? ""}`
        : "/dashboard";
    return <Navigate to={to} replace />;
  }

  if (!profile) {
    return null;
  }

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const update = (patch: Partial<MemberProfile>) => {
    setProfile((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const validateStep = (): boolean => {
    if (step === 0) {
      if (!profile.phone.trim()) {
        toast.error("Add a phone number so we can reach you.");
        return false;
      }
      if (!profile.birthday) {
        toast.error("Enter your birthday.");
        return false;
      }
    }
    if (step === 1) {
      if (!profile.heightIn.trim() || Number(profile.heightIn) <= 0) {
        toast.error(profile.unitSystem === "metric" ? "Enter your height in cm." : "Enter your height in inches.");
        return false;
      }
      if (!profile.weightLb.trim() || Number(profile.weightLb) <= 0) {
        toast.error(profile.unitSystem === "metric" ? "Enter your weight in kg." : "Enter your weight in pounds.");
        return false;
      }
    }
    if (step === 2) {
      if (!profile.fitnessLevel) {
        toast.error("Select your fitness level.");
        return false;
      }
      if (profile.goals.length === 0) {
        toast.error("Pick at least one goal.");
        return false;
      }
    }
    if (step === 3 && profile.habits.length === 0) {
      toast.error("Select at least one habit you want to build or keep.");
      return false;
    }
    return true;
  };

  const finishDestination = () => {
    const from = (location.state as FromState | null)?.from;
    if (from?.pathname && from.pathname !== "/onboarding" && from.pathname !== "/register") {
      return `${from.pathname}${from.search ?? ""}${from.hash ?? ""}`;
    }
    return "/dashboard";
  };

  const handleContinue = (e: FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    const saved = memberProfileApi.save(profile);
    setProfile(saved);

    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }

    memberProfileApi.complete(saved);
    toast.success("Profile ready—welcome aboard.");
    navigate(finishDestination(), { replace: true });
  };

  const handleBack = () => {
    memberProfileApi.save(profile);
    setStep((s) => Math.max(0, s - 1));
  };

  return (
    <Card className="w-full max-w-lg border-border bg-card/80">
      <CardHeader>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Step {step + 1} of {STEPS.length}
        </p>
        <CardTitle className="font-display text-2xl">{current.title}</CardTitle>
        <CardDescription>{current.description}</CardDescription>
        <div className="flex gap-2 pt-2">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i <= step ? "bg-secondary" : "bg-muted",
              )}
              aria-hidden
            />
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleContinue} className="space-y-5">
          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="onb-phone">Phone</Label>
                <Input
                  id="onb-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+1 555 000 0000"
                  value={profile.phone}
                  onChange={(e) => update({ phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="onb-birthday">Birthday</Label>
                <Input
                  id="onb-birthday"
                  type="date"
                  value={profile.birthday}
                  onChange={(e) => update({ birthday: e.target.value })}
                />
              </div>
            </>
          )}

          {step === 1 && (
            <div className="space-y-4">
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
                      onClick={() => update({ unitSystem: option.value as UnitSystem })}
                      className={cn(
                        "rounded-md border px-3 py-2 text-sm transition-colors",
                        profile.unitSystem === option.value
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
                  <Label htmlFor="onb-height">
                    Height ({profile.unitSystem === "metric" ? "cm" : "in"})
                  </Label>
                  <Input
                    id="onb-height"
                    type="number"
                    min={1}
                    step="0.1"
                    placeholder={profile.unitSystem === "metric" ? "173" : "68"}
                    value={toDisplayHeight(profile.heightIn, profile.unitSystem)}
                    onChange={(e) =>
                      update({ heightIn: heightToInches(e.target.value, profile.unitSystem) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="onb-weight">
                    Weight ({profile.unitSystem === "metric" ? "kg" : "lb"})
                  </Label>
                  <Input
                    id="onb-weight"
                    type="number"
                    min={1}
                    step="0.1"
                    placeholder={profile.unitSystem === "metric" ? "73" : "160"}
                    value={toDisplayWeight(profile.weightLb, profile.unitSystem)}
                    onChange={(e) =>
                      update({ weightLb: weightToPounds(e.target.value, profile.unitSystem) })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label>Fitness level</Label>
                <div className="grid gap-2">
                  {(
                    [
                      { value: "beginner", label: "Beginner" },
                      { value: "intermediate", label: "Intermediate" },
                      { value: "advanced", label: "Advanced" },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => update({ fitnessLevel: option.value as FitnessLevel })}
                      className={cn(
                        "rounded-md border px-3 py-2 text-left text-sm transition-colors",
                        profile.fitnessLevel === option.value
                          ? "border-secondary bg-secondary/15 text-white"
                          : "border-border text-muted-foreground hover:border-white/30 hover:text-white",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Goals</Label>
                <div className="grid gap-2">
                  {GOAL_OPTIONS.map((goal) => {
                    const checked = profile.goals.includes(goal);
                    return (
                      <label
                        key={goal}
                        className="flex cursor-pointer items-center gap-3 rounded-md border border-border px-3 py-2 text-sm hover:border-white/30"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => update({ goals: toggleValue(profile.goals, goal) })}
                        />
                        <span>{goal}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-2">
                <Label>Habits you want to focus on</Label>
                <div className="grid gap-2">
                  {HABIT_OPTIONS.map((habit) => {
                    const checked = profile.habits.includes(habit);
                    return (
                      <label
                        key={habit}
                        className="flex cursor-pointer items-center gap-3 rounded-md border border-border px-3 py-2 text-sm hover:border-white/30"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() =>
                            update({ habits: toggleValue(profile.habits, habit) })
                          }
                        />
                        <span>{habit}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="onb-medical">Medical conditions (optional)</Label>
                <Textarea
                  id="onb-medical"
                  rows={3}
                  placeholder="Injuries, allergies, or anything your coach should know…"
                  value={profile.medicalConditions}
                  onChange={(e) => update({ medicalConditions: e.target.value })}
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <Button type="button" variant="outline" className="flex-1" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button type="submit" className="flex-1 bg-secondary text-white hover:bg-secondary/90">
              {isLast ? "Finish setup" : "Continue"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default Onboarding;
