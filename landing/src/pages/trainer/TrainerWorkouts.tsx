import { useMemo, useState, type FormEvent } from "react";
import { format, startOfDay } from "date-fns";
import { X } from "lucide-react";
import {
  mockClients,
  mockExerciseLibrary,
  mockWorkoutLibrary,
  mockRoutineLibrary,
  mockSavedRoutines,
  type ExerciseItem,
  type RoutineDay,
  type RoutineTemplate,
  type SavedRoutine,
  type WorkoutTemplate,
} from "@/data/mockTrainer";
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
  const [exercises, setExercises] = useState<ExerciseItem[]>(mockExerciseLibrary);
  const [workouts, setWorkouts] = useState<WorkoutTemplate[]>(mockWorkoutLibrary);
  const [routineLibrary, setRoutineLibrary] = useState<RoutineTemplate[]>(mockRoutineLibrary);
  const [assignments, setAssignments] = useState<SavedRoutine[]>(mockSavedRoutines);

  // Set Routine: client → date → routine → save
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedRoutineId, setSelectedRoutineId] = useState("");

  // Exercise creator
  const [exerciseName, setExerciseName] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [instructions, setInstructions] = useState("");

  // Workout creator
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDescription, setWorkoutDescription] = useState("");
  const [draftExerciseIds, setDraftExerciseIds] = useState<string[]>([]);

  // Routine creator
  const [routineName, setRoutineName] = useState("");
  const [routineDescription, setRoutineDescription] = useState("");
  const [draftWorkoutIds, setDraftWorkoutIds] = useState<string[]>([]);

  const selectedClient = useMemo(
    () => mockClients.find((c) => c.id === selectedClientId),
    [selectedClientId],
  );

  const selectedRoutine = useMemo(
    () => routineLibrary.find((r) => r.id === selectedRoutineId),
    [routineLibrary, selectedRoutineId],
  );

  const selectedDateKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

  const existingAssignment = useMemo(
    () =>
      selectedClientId && selectedDateKey
        ? assignments.find((r) => r.clientId === selectedClientId && r.date === selectedDateKey)
        : undefined,
    [assignments, selectedClientId, selectedDateKey],
  );

  const exerciseById = useMemo(() => {
    const map = new Map(exercises.map((e) => [e.id, e]));
    return (id: string) => map.get(id);
  }, [exercises]);

  const workoutById = useMemo(() => {
    const map = new Map(workouts.map((w) => [w.id, w]));
    return (id: string) => map.get(id);
  }, [workouts]);

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
    const next: ExerciseItem = {
      id: `e-${Date.now()}`,
      name: exerciseName.trim(),
      youtubeUrl: youtubeUrl.trim(),
      instructions: instructions.trim(),
    };
    setExercises((prev) => [next, ...prev]);
    setExerciseName("");
    setYoutubeUrl("");
    setInstructions("");
    toast.success("Exercise saved to library (demo).");
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
    const next: WorkoutTemplate = {
      id: `w-${Date.now()}`,
      name: workoutName.trim(),
      description: workoutDescription.trim() || "Custom workout",
      exerciseIds: draftExerciseIds,
    };
    setWorkouts((prev) => [next, ...prev]);
    setWorkoutName("");
    setWorkoutDescription("");
    setDraftExerciseIds([]);
    toast.success("Workout saved to library (demo).");
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
    const next: RoutineTemplate = {
      id: `rt-${Date.now()}`,
      name: routineName.trim(),
      description: routineDescription.trim() || "Custom routine",
      workoutIds: draftWorkoutIds,
    };
    setRoutineLibrary((prev) => [next, ...prev]);
    setRoutineName("");
    setRoutineDescription("");
    setDraftWorkoutIds([]);
    toast.success("Routine saved to library (demo).");
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
          Build exercises, compose workouts, assemble routines, then assign a routine to a client —
          demo only.
        </p>
      </div>

      <Tabs defaultValue="set-routine">
        <TabsList className="flex h-auto flex-wrap gap-1">
          <TabsTrigger value="set-routine">Set Routine</TabsTrigger>
          <TabsTrigger value="create-exercise">Create Exercise</TabsTrigger>
          <TabsTrigger value="create-workout">Create Workout</TabsTrigger>
          <TabsTrigger value="create-routine">Create Routine</TabsTrigger>
        </TabsList>

        {/* Client → date → routine → save */}
        <TabsContent value="set-routine" className="mt-6 space-y-6">
          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle className="font-display text-base">Select client</CardTitle>
              <CardDescription>Choose who this routine is for.</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger className="max-w-md">
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
                <p className="mt-3 text-sm text-muted-foreground">
                  Selected: <span className="text-foreground">{selectedClient.name}</span> (
                  {selectedClient.email})
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle className="font-display text-base">
                Select a date for this routine
              </CardTitle>
              <CardDescription>
                Pick the exact day the client should do this routine.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DatePicker
                selected={selectedDate}
                onSelect={setSelectedDate}
                minDate={startOfDay(new Date())}
                className="inline-block rounded-lg border border-border p-1"
              />
              {selectedDate && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Selected:{" "}
                  <span className="text-foreground">
                    {format(selectedDate, "EEEE, MMM d, yyyy")}
                  </span>
                </p>
              )}
              {existingAssignment && (
                <p className="mt-3 text-sm text-destructive">
                  {selectedClient?.name} already has "{existingAssignment.name}" assigned on{" "}
                  {format(new Date(`${existingAssignment.date}T00:00:00`), "EEEE, MMM d, yyyy")}.
                  Pick another date or client.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle className="font-display text-base">Select Routine</CardTitle>
              <CardDescription>
                Choose a routine template (one or more workouts) to assign.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedRoutineId} onValueChange={setSelectedRoutineId}>
                <SelectTrigger className="max-w-md">
                  <SelectValue placeholder="Pick a routine…" />
                </SelectTrigger>
                <SelectContent>
                  {routineLibrary.map((r) => (
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

              <Button
                type="button"
                className="bg-secondary text-white hover:bg-secondary/90"
                onClick={assignRoutine}
                disabled={Boolean(existingAssignment)}
              >
                Save
              </Button>
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
                  const template = routineLibrary.find((t) => t.id === r.routineId);
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

        {/* Exercise creator */}
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

        {/* Workout creator — pick exercises */}
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

        {/* Routine creator — pick workouts */}
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

      <section className="space-y-4 border-t border-border pt-10">
        <div>
          <h2 className="mb-1 font-display text-2xl">Library</h2>
          <p className="text-sm text-muted-foreground">
            Everything you’ve saved — exercises, workouts, and routines.
          </p>
        </div>

        <Tabs defaultValue="library-exercises">
          <TabsList className="flex h-auto flex-wrap gap-1">
            <TabsTrigger value="library-exercises">
              Exercises ({exercises.length})
            </TabsTrigger>
            <TabsTrigger value="library-workouts">
              Workouts ({workouts.length})
            </TabsTrigger>
            <TabsTrigger value="library-routines">
              Routines ({routineLibrary.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library-exercises" className="mt-6">
            {exercises.length === 0 ? (
              <p className="text-sm text-muted-foreground">No exercises saved yet.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {exercises.map((ex) => (
                  <div key={ex.id} className="rounded-lg border border-border bg-card/80 p-4">
                    <p className="text-sm font-medium">{ex.name}</p>
                    {ex.youtubeUrl && (
                      <p className="mt-1 truncate text-xs text-primary">{ex.youtubeUrl}</p>
                    )}
                    {ex.instructions && (
                      <p className="mt-2 text-xs text-muted-foreground">{ex.instructions}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="library-workouts" className="mt-6">
            {workouts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No workouts saved yet.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {workouts.map((w) => (
                  <div key={w.id} className="rounded-lg border border-border bg-card/80 p-4">
                    <p className="text-sm font-medium">{w.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{w.description}</p>
                    <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                      {w.exerciseIds.map((eid) => (
                        <li key={eid}>· {exerciseById(eid)?.name ?? eid}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="library-routines" className="mt-6">
            {routineLibrary.length === 0 ? (
              <p className="text-sm text-muted-foreground">No routines saved yet.</p>
            ) : (
              <div className="space-y-3">
                {routineLibrary.map((r) => (
                  <div key={r.id} className="rounded-lg border border-border bg-card/80 p-4">
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {r.workoutIds.map((wid) => (
                        <Badge key={wid} variant="secondary">
                          {workoutById(wid)?.name ?? wid}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default TrainerWorkouts;
