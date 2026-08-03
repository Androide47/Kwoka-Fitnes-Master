import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { memberWorkoutsApi } from "@/lib/api/memberWorkoutsApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const UserWorkoutDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [version, setVersion] = useState(0);
  const workout = useMemo(() => (id ? memberWorkoutsApi.getById(id) : null), [id, version]);
  const [notes, setNotes] = useState(workout?.completion?.notes ?? "");

  if (!workout) {
    return (
      <div className="max-w-2xl">
        <h1 className="mb-2 font-display text-3xl">Workout not found</h1>
        <Button asChild variant="outline">
          <Link to="/workouts">Back to workouts</Link>
        </Button>
      </div>
    );
  }

  const doneIds = new Set(workout.completion?.completedExerciseIds ?? []);

  const toggleExercise = (exerciseId: string, checked: boolean) => {
    memberWorkoutsApi.markExerciseDone(workout.id, exerciseId, checked);
    setVersion((n) => n + 1);
  };

  const finish = () => {
    memberWorkoutsApi.complete(workout.id, notes);
    toast.success("Workout logged.");
    navigate("/workouts", { replace: true });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link to="/workouts">← Workouts</Link>
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm text-muted-foreground">
              {format(parseISO(workout.scheduledFor), "EEEE, MMM d, yyyy")}
            </p>
            <h1 className="font-display text-3xl">{workout.name}</h1>
            <p className="mt-1 text-muted-foreground">{workout.description}</p>
          </div>
          <Badge variant={workout.status === "completed" ? "default" : "outline"}>
            {workout.status}
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        {workout.exercises.map((ex) => {
          const checked = doneIds.has(ex.id);
          return (
            <Card key={ex.id} className="bg-card/80">
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={`ex-${ex.id}`}
                    checked={checked}
                    onCheckedChange={(v) => toggleExercise(ex.id, v === true)}
                    disabled={workout.status === "completed"}
                    className="mt-1"
                  />
                  <div className="min-w-0 flex-1">
                    <CardTitle className="font-display text-base">
                      <label htmlFor={`ex-${ex.id}`} className="cursor-pointer">
                        {ex.name}
                      </label>
                    </CardTitle>
                    <CardDescription className="mt-1">{ex.instructions}</CardDescription>
                    {ex.youtubeUrl && (
                      <a
                        href={ex.youtubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-xs text-primary hover:underline"
                      >
                        Watch demo
                      </a>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {workout.status !== "completed" && (
        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle className="font-display text-base">Session notes</CardTitle>
            <CardDescription>Optional — how did it feel?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wo-notes">Notes</Label>
              <Textarea
                id="wo-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Energy, form cues, anything for your coach…"
              />
            </div>
            <Button className="bg-secondary text-white hover:bg-secondary/90" onClick={finish}>
              Complete workout
            </Button>
          </CardContent>
        </Card>
      )}

      {workout.status === "completed" && workout.completion?.notes && (
        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle className="font-display text-base">Your notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{workout.completion.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserWorkoutDetail;
