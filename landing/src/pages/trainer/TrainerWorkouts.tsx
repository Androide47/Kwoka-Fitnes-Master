import { useMemo, useState, type FormEvent } from "react";
import { format, startOfDay } from "date-fns";
import { X } from "lucide-react";
import {
  mockClients,
  mockSavedRoutines,
  type RoutineDay,
  type SavedRoutine,
} from "@/data/mockTrainer";
import { useWorkoutLibrary } from "@/context/WorkoutLibraryContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const TrainerWorkouts = () => {
  const {
    exercises,
    workouts,
    routines,
    upsertExercise,
    upsertWorkout,
    upsertRoutine,
    exerciseById,
    workoutById,
  } = useWorkoutLibrary();

  const [assignments, setAssignments] = useState<SavedRoutine[]>(mockSavedRoutines);

  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedRoutineId, setSelectedRoutineId] = useState("");

  const [exerciseName, setExerciseName] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [instructions, setInstructions] = useState("");

  const [workoutName, setWorkoutName] = useState("");
  const [workoutDescription, setWorkoutDescription] = useState("");
  const [draftExerciseIds, setDraftExerciseIds] = useState<string[]>([]);

  const [routineName, setRoutineName] = useState("");
  const [routineDescription, setRoutineDescription] = useState("");
  const [draftWorkoutIds, setDraftWorkoutIds] = useState<string[]>([]);

  const selectedClient = useMemo(
    () => mockClients.find((c) => c.id === selectedClientId),
    [selectedClientId],
  );

  const selectedRoutine = useMemo(
    () => routines.find((r) => r.id === selectedRoutineId),
    [routines, selectedRoutineId],
  );

  const selectedDateKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

  const existingAssignment = useMemo(
    () =>
      selectedClientId && selectedDateKey
        ? assignments.find((r) => r.clientId === selectedClientId && r.date === selectedDateKey)
        : undefined,
    [assignments, selectedClientId, selectedDateKey],
  );

  const toggleDraftExercise = (id: string) => {
    setDraftExerciseIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleDraftWorkout = (id: string) => {
    setDraftWorkoutIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const saveExercise = (e: FormEvent) => {
    e.preventDefault();
    if (!exerciseName.trim()) {
      toast.error("Exercise name is required.");
      return;
    }
    upsertExercise({
      id: `e-${Date.now()}`,
      name: exerciseName.trim(),
      youtubeUrl: youtubeUrl.trim(),
      instructions: instructions.trim(),
    });
    setExerciseName("");
    setYoutubeUrl("");
    setInstructions("");
    toast.success("Exercise saved to library.");
  };

  const saveWorkout = (e: FormEvent) => {
    e.preventDefault();
    if (!workoutName.trim()) {
      toast.error("Workout name is required.");
      return;
    }
    if (draftExerciseIds.length === 0) {
      toast.error("Add at least one exercise to this workout.");
      return;
    }
    upsertWorkout({
      id: `w-${Date.now()}`,
      name: workoutName.trim(),
      description: workoutDescription.trim() || "Custom workout",
      exerciseIds: draftExerciseIds,
    });
    setWorkoutName("");
    setWorkoutDescription("");
    setDraftExerciseIds([]);
    toast.success("Workout saved to library.");
  };

  const saveRoutineTemplate = (e: FormEvent) => {
    e.preventDefault();
    if (!routineName.trim()) {
      toast.error("Routine name is required.");
      return;
    }
    if (draftWorkoutIds.length === 0) {
      toast.error("Add at least one workout to this routine.");
      return;
    }
    upsertRoutine({
      id: `rt-${Date.now()}`,
      name: routineName.trim(),
      description: routineDescription.trim() || "Custom routine",
      workoutIds: draftWorkoutIds,
    });
    setRoutineName("");
    setRoutineDescription("");
    setDraftWorkoutIds([]);
    toast.success("Routine saved to library.");
  };

  const assignRoutine = () => {
    if (!selectedClient) {
      toast.error("Select a client first.");
      return;
    }
    if (!selectedDate) {
      toast.error("Select a date for this routine.");
      return;
    }
    if (!selectedRoutine) {
      toast.error("Select a routine.");
      return;
    }
    const dateLabel = format(selectedDate, "EEEE, MMM d, yyyy");
    if (existingAssignment) {
      toast.error(
        `${selectedClient.name} already has "${existingAssignment.name}" assigned on ${dateLabel}.`,
      );
      return;
    }
    const next: SavedRoutine = {
      id: `r-${Date.now()}`,
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      date: format(selectedDate, "yyyy-MM-dd"),
      day: format(selectedDate, "EEEE") as RoutineDay,
      routineId: selectedRoutine.id,
      name: selectedRoutine.name,
      savedAt: new Date().toISOString().slice(0, 10),
    };
    setAssignments((prev) => [next, ...prev]);
    setSelectedDate(undefined);
    setSelectedRoutineId("");
    toast.success(`Routine assigned to ${selectedClient.name} for ${dateLabel} (demo).`);
  };

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="mb-2 font-display text-3xl">Workouts</h1>
        <p className="text-muted-foreground">
          Build exercises, compose workouts, assemble routines, then assign a routine to a client.
          Manage everything in Library.
        </p>
      </div>

      <Tabs defaultValue="set-routine">
        <TabsList className="flex h-auto flex-wrap gap-1">
          <TabsTrigger value="set-routine">Set Routine</TabsTrigger>
          <TabsTrigger value="create-exercise">Create Exercise</TabsTrigger>
          <TabsTrigger value="create-workout">Create Workout</TabsTrigger>
          <TabsTrigger value="create-routine">Create Routine</TabsTrigger>
        </TabsList>

        <TabsContent value="set-routine" className="mt-6 space-y-6">
          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle className="font-display text-base">Set Routine</CardTitle>
              <CardDescription>
                Pick a date, choose the client and routine, then save the assignment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start">
                <div className="flex flex-col items-center lg:items-start">
                  <DatePicker
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    minDate={startOfDay(new Date())}
                    size="lg"
                    className="rounded-lg border border-border p-3"
                  />
                  {selectedDate && (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Date:{" "}
                      <span className="text-foreground">
                        {format(selectedDate, "EEEE, MMM d, yyyy")}
                      </span>
                    </p>
                  )}
                  {existingAssignment && (
                    <p className="mt-2 text-sm text-destructive">
                      {selectedClient?.name} already has "{existingAssignment.name}" assigned on{" "}
                      {format(
                        new Date(`${existingAssignment.date}T00:00:00`),
                        "EEEE, MMM d, yyyy",
                      )}
                      . Pick another date or client.
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-6">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-foreground">Client</Label>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Who this routine is for.
                      </p>
                    </div>
                    <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pick a client…" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockClients.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name} — {c.goal}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedClient && (
                      <p className="text-sm text-muted-foreground">
                        <span className="text-foreground">{selectedClient.name}</span> ·{" "}
                        {selectedClient.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-foreground">Routine</Label>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Template with one or more workouts.
                      </p>
                    </div>
                    <Select value={selectedRoutineId} onValueChange={setSelectedRoutineId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pick a routine…" />
                      </SelectTrigger>
                      <SelectContent>
                        {routines.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name} · {r.workoutIds.length} workout
                            {r.workoutIds.length === 1 ? "" : "s"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedRoutine && (
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>{selectedRoutine.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedRoutine.workoutIds.map((wid) => (
                            <Badge key={wid} variant="secondary">
                              {workoutById(wid)?.name ?? wid}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    className="w-full bg-secondary text-white hover:bg-secondary/90 sm:w-auto"
                    onClick={assignRoutine}
                    disabled={Boolean(existingAssignment)}
                  >
                    Save assignment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {assignments.length > 0 && (
            <Card className="bg-card/80">
              <CardHeader>
                <CardTitle className="font-display text-base">Assigned routines</CardTitle>
                <CardDescription>Recent client assignments (local demo state).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {assignments.map((r) => {
                  const template = routines.find((t) => t.id === r.routineId);
                  return (
                    <div
                      key={r.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4"
                    >
                      <div>
                        <p className="text-sm font-medium">{r.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.clientName} · {r.day} {r.date} · saved {r.savedAt}
                        </p>
                        {template && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {template.workoutIds.map((wid) => (
                              <Badge key={wid} variant="secondary">
                                {workoutById(wid)?.name ?? wid}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="create-exercise" className="mt-6 space-y-6">
          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle className="font-display text-base">Create Exercise</CardTitle>
              <CardDescription>
                Exercises are the building blocks. Add a demo video and coaching cues.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveExercise} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ex-name">Exercise name</Label>
                  <Input
                    id="ex-name"
                    value={exerciseName}
                    onChange={(e) => setExerciseName(e.target.value)}
                    placeholder="e.g. Goblet squat"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yt-url">YouTube URL</Label>
                  <Input
                    id="yt-url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=…"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ex-instructions">Instructions</Label>
                  <Textarea
                    id="ex-instructions"
                    rows={3}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Cues, tempo, common mistakes…"
                  />
                </div>
                <Button type="submit" className="bg-secondary text-white hover:bg-secondary/90">
                  Save exercise
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create-workout" className="mt-6 space-y-6">
          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle className="font-display text-base">Create Workout</CardTitle>
              <CardDescription>
                A workout is made of multiple exercises from your library.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveWorkout} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="wo-name">Workout name</Label>
                    <Input
                      id="wo-name"
                      value={workoutName}
                      onChange={(e) => setWorkoutName(e.target.value)}
                      placeholder="e.g. Lower body power"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wo-desc">Description</Label>
                    <Input
                      id="wo-desc"
                      value={workoutDescription}
                      onChange={(e) => setWorkoutDescription(e.target.value)}
                      placeholder="Short summary"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="font-display text-sm tracking-wide">Select exercises</p>
                  {exercises.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Create an exercise first, then come back to build a workout.
                    </p>
                  ) : (
                    <ul className="max-h-72 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
                      {exercises.map((ex) => {
                        const checked = draftExerciseIds.includes(ex.id);
                        return (
                          <li key={ex.id} className="flex items-start gap-3">
                            <Checkbox
                              id={`pick-ex-${ex.id}`}
                              checked={checked}
                              onCheckedChange={() => toggleDraftExercise(ex.id)}
                              className="mt-1"
                            />
                            <label
                              htmlFor={`pick-ex-${ex.id}`}
                              className="flex-1 cursor-pointer text-sm"
                            >
                              <span className="font-medium">{ex.name}</span>
                              {ex.instructions && (
                                <span className="mt-0.5 block text-xs text-muted-foreground line-clamp-1">
                                  {ex.instructions}
                                </span>
                              )}
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {draftExerciseIds.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {draftExerciseIds.map((id) => (
                        <Badge key={id} variant="secondary" className="gap-1 pr-1">
                          {exerciseById(id)?.name ?? id}
                          <button
                            type="button"
                            aria-label={`Remove ${exerciseById(id)?.name ?? id}`}
                            className="rounded-sm p-0.5 hover:bg-background/40"
                            onClick={() => toggleDraftExercise(id)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Button type="submit" className="bg-secondary text-white hover:bg-secondary/90">
                  Save workout
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create-routine" className="mt-6 space-y-6">
          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle className="font-display text-base">Create Routine</CardTitle>
              <CardDescription>
                A routine is made of one or more workouts. Assign it later under Set Routine.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveRoutineTemplate} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="rt-name">Routine name</Label>
                    <Input
                      id="rt-name"
                      value={routineName}
                      onChange={(e) => setRoutineName(e.target.value)}
                      placeholder="e.g. Strength + Conditioning"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rt-desc">Description</Label>
                    <Input
                      id="rt-desc"
                      value={routineDescription}
                      onChange={(e) => setRoutineDescription(e.target.value)}
                      placeholder="Short summary"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="font-display text-sm tracking-wide">Select workouts</p>
                  {workouts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Create a workout first, then come back to build a routine.
                    </p>
                  ) : (
                    <ul className="max-h-72 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
                      {workouts.map((w) => {
                        const checked = draftWorkoutIds.includes(w.id);
                        return (
                          <li key={w.id} className="flex items-start gap-3">
                            <Checkbox
                              id={`pick-wo-${w.id}`}
                              checked={checked}
                              onCheckedChange={() => toggleDraftWorkout(w.id)}
                              className="mt-1"
                            />
                            <label
                              htmlFor={`pick-wo-${w.id}`}
                              className="flex-1 cursor-pointer text-sm"
                            >
                              <span className="font-medium">{w.name}</span>
                              <span className="mt-0.5 block text-xs text-muted-foreground">
                                {w.description} · {w.exerciseIds.length} exercise
                                {w.exerciseIds.length === 1 ? "" : "s"}
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {draftWorkoutIds.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {draftWorkoutIds.map((id) => (
                        <Badge key={id} variant="secondary" className="gap-1 pr-1">
                          {workoutById(id)?.name ?? id}
                          <button
                            type="button"
                            aria-label={`Remove ${workoutById(id)?.name ?? id}`}
                            className="rounded-sm p-0.5 hover:bg-background/40"
                            onClick={() => toggleDraftWorkout(id)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Button type="submit" className="bg-secondary text-white hover:bg-secondary/90">
                  Save routine
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrainerWorkouts;
