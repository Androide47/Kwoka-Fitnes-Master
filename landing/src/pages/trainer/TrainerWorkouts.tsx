import { useMemo, useState, type FormEvent } from "react";
import {
  mockClients,
  mockWorkoutLibrary,
  mockSavedRoutines,
  mockRoutineAssignments,
  weekDays,
  type ExerciseItem,
  type RoutineAssignment,
  type SavedRoutine,
  type WeekDay,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const TrainerWorkouts = () => {
  const [library, setLibrary] = useState<WorkoutTemplate[]>(mockWorkoutLibrary);
  const [routines, setRoutines] = useState<SavedRoutine[]>(mockSavedRoutines);
  const [assignments, setAssignments] = useState<RoutineAssignment[]>(mockRoutineAssignments);

  // Set Routine flow: client → day → routine → save
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedDay, setSelectedDay] = useState<WeekDay | "">("");
  const [selectedRoutineId, setSelectedRoutineId] = useState("");

  // Create Routine form
  const [routineName, setRoutineName] = useState("");
  const [selectedWorkoutIds, setSelectedWorkoutIds] = useState<string[]>([]);

  // Add Workout form
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDescription, setWorkoutDescription] = useState("");
  const [exerciseName, setExerciseName] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [instructions, setInstructions] = useState("");
  const [draftExercises, setDraftExercises] = useState<ExerciseItem[]>([]);

  const selectedClient = useMemo(
    () => mockClients.find((c) => c.id === selectedClientId),
    [selectedClientId],
  );

  const clientAssignments = useMemo(
    () => assignments.filter((a) => a.clientId === selectedClientId),
    [assignments, selectedClientId],
  );

  const assignedDays = useMemo(
    () => new Set(clientAssignments.map((a) => a.day)),
    [clientAssignments],
  );

  const toggleWorkout = (id: string) => {
    setSelectedWorkoutIds((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id],
    );
  };

  const addExerciseToDraft = () => {
    if (!exerciseName.trim()) {
      toast.error("Exercise name is required.");
      return;
    }
    setDraftExercises((prev) => [
      ...prev,
      {
        id: `ex-${Date.now()}`,
        name: exerciseName.trim(),
        youtubeUrl: youtubeUrl.trim(),
        instructions: instructions.trim(),
      },
    ]);
    setExerciseName("");
    setYoutubeUrl("");
    setInstructions("");
    toast.success("Exercise added to workout draft.");
  };

  const saveWorkout = (e: FormEvent) => {
    e.preventDefault();
    if (!workoutName.trim()) {
      toast.error("Workout name is required.");
      return;
    }
    if (draftExercises.length === 0) {
      toast.error("Add at least one exercise (YouTube URL + instructions).");
      return;
    }
    const next: WorkoutTemplate = {
      id: `w-${Date.now()}`,
      name: workoutName.trim(),
      description: workoutDescription.trim() || "Custom workout",
      exercises: draftExercises,
    };
    setLibrary((prev) => [next, ...prev]);
    setWorkoutName("");
    setWorkoutDescription("");
    setDraftExercises([]);
    toast.success("Workout saved to library (demo).");
  };

  const createRoutine = () => {
    if (!routineName.trim()) {
      toast.error("Routine name is required.");
      return;
    }
    if (selectedWorkoutIds.length === 0) {
      toast.error("Select at least one workout.");
      return;
    }
    const next: SavedRoutine = {
      id: `r-${Date.now()}`,
      name: routineName.trim(),
      workoutIds: selectedWorkoutIds,
      savedAt: new Date().toISOString().slice(0, 10),
    };
    setRoutines((prev) => [next, ...prev]);
    setRoutineName("");
    setSelectedWorkoutIds([]);
    toast.success("Routine saved. You can now assign it from Set Routine.");
  };

  const saveAssignment = () => {
    if (!selectedClient) {
      toast.error("Select a client first.");
      return;
    }
    if (!selectedDay) {
      toast.error("Select a day for this routine.");
      return;
    }
    if (!selectedRoutineId) {
      toast.error("Select a routine.");
      return;
    }
    const existing = assignments.find(
      (a) => a.clientId === selectedClient.id && a.day === selectedDay,
    );
    if (existing) {
      const routine = routines.find((r) => r.id === existing.routineId);
      toast.error(
        `${selectedClient.name} already has "${routine?.name ?? "a routine"}" assigned on ${selectedDay}. Remove it first to assign a new one.`,
      );
      return;
    }
    const next: RoutineAssignment = {
      id: `a-${Date.now()}`,
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      routineId: selectedRoutineId,
      day: selectedDay,
      assignedAt: new Date().toISOString().slice(0, 10),
    };
    setAssignments((prev) => [next, ...prev]);
    setSelectedDay("");
    setSelectedRoutineId("");
    toast.success(`Routine assigned to ${selectedClient.name} for ${selectedDay}.`);
  };

  const removeAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    toast.success("Routine assignment removed.");
  };

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="font-display text-3xl mb-2">Workouts</h1>
        <p className="text-muted-foreground">
          Build workouts, group them into routines, and assign a routine to each client's day —
          demo only.
        </p>
      </div>

      <Tabs defaultValue="set-routine">
        <TabsList className="flex h-auto flex-wrap gap-1">
          <TabsTrigger value="set-routine">Set Routine</TabsTrigger>
          <TabsTrigger value="add-workout">Add Workout</TabsTrigger>
          <TabsTrigger value="library">Workout library</TabsTrigger>
          <TabsTrigger value="saved">Saved routines</TabsTrigger>
        </TabsList>

        {/* Select client → Select day → Select Routine → Save */}
        <TabsContent value="set-routine" className="space-y-6 mt-6">
          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle className="font-display text-base">Select client</CardTitle>
              <CardDescription>Choose who this routine is for.</CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedClientId}
                onValueChange={(value) => {
                  setSelectedClientId(value);
                  setSelectedDay("");
                }}
              >
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
                Select a day for this routine
              </CardTitle>
              <CardDescription>
                Days that already have a routine assigned are disabled.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedDay}
                onValueChange={(value) => setSelectedDay(value as WeekDay)}
                disabled={!selectedClient}
              >
                <SelectTrigger className="max-w-md">
                  <SelectValue
                    placeholder={selectedClient ? "Pick a day…" : "Select a client first…"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {weekDays.map((day) => {
                    const taken = assignedDays.has(day);
                    return (
                      <SelectItem key={day} value={day} disabled={taken}>
                        {day}
                        {taken ? " — routine already assigned" : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle className="font-display text-base">Select Routine</CardTitle>
              <CardDescription>
                Pick one of your saved routines to assign to that day.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedRoutineId} onValueChange={setSelectedRoutineId}>
                <SelectTrigger className="max-w-md">
                  <SelectValue placeholder="Pick a routine…" />
                </SelectTrigger>
                <SelectContent>
                  {routines.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name} · {r.workoutIds.length}{" "}
                      {r.workoutIds.length === 1 ? "workout" : "workouts"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {routines.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No routines yet — create one in the Saved routines tab.
                </p>
              )}

              <Button
                type="button"
                className="bg-secondary text-white hover:bg-secondary/90"
                onClick={saveAssignment}
              >
                Save
              </Button>
            </CardContent>
          </Card>

          {selectedClient && (
            <Card className="bg-card/80">
              <CardHeader>
                <CardTitle className="font-display text-base">
                  {selectedClient.name}'s week
                </CardTitle>
                <CardDescription>
                  Routines currently assigned to this client. Remove one to free up its day.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {clientAssignments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No routines assigned yet.</p>
                ) : (
                  weekDays
                    .filter((day) => assignedDays.has(day))
                    .map((day) => {
                      const assignment = clientAssignments.find((a) => a.day === day)!;
                      const routine = routines.find((r) => r.id === assignment.routineId);
                      return (
                        <div
                          key={assignment.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4"
                        >
                          <div>
                            <p className="font-medium text-sm">
                              {day} — {routine?.name ?? "Routine"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              assigned {assignment.assignedAt}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeAssignment(assignment.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      );
                    })
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Add Workout: YouTube URL, Instructions, Save */}
        <TabsContent value="add-workout" className="mt-6">
          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle className="font-display text-base">Add Workout</CardTitle>
              <CardDescription>
                Build a workout with exercise demos (YouTube URL) and instructions, then save.
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

                <div className="rounded-lg border border-border p-4 space-y-4">
                  <p className="font-display text-sm tracking-wide">Add exercise</p>
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
                    <Label htmlFor="yt-url">YouTube URL video</Label>
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
                  <Button type="button" variant="outline" onClick={addExerciseToDraft}>
                    Add exercise to draft
                  </Button>
                </div>

                {draftExercises.length > 0 && (
                  <ul className="space-y-2">
                    {draftExercises.map((ex) => (
                      <li key={ex.id} className="rounded-md border border-border px-3 py-2 text-sm">
                        <p className="font-medium">{ex.name}</p>
                        {ex.youtubeUrl && (
                          <p className="text-xs text-primary truncate">{ex.youtubeUrl}</p>
                        )}
                        {ex.instructions && (
                          <p className="text-xs text-muted-foreground">{ex.instructions}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                <Button type="submit" className="bg-secondary text-white hover:bg-secondary/90">
                  Save
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {library.map((w) => (
              <Card key={w.id} className="bg-card/80">
                <CardHeader>
                  <CardTitle className="font-display text-base">{w.name}</CardTitle>
                  <CardDescription>{w.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {w.exercises.map((ex) => (
                      <li key={ex.id} className="border-b border-border/60 pb-2 last:border-0">
                        <p className="font-medium">{ex.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {ex.instructions}
                        </p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Saved routines: create reusable routines + list them */}
        <TabsContent value="saved" className="space-y-6 mt-6">
          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle className="font-display text-base">Create routine</CardTitle>
              <CardDescription>
                Name the routine and select workouts to include. Assign it to a client from the
                Set Routine tab.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 max-w-md">
                <Label htmlFor="routine-name">Routine name</Label>
                <Input
                  id="routine-name"
                  value={routineName}
                  onChange={(e) => setRoutineName(e.target.value)}
                  placeholder="e.g. Race prep week"
                />
              </div>

              <div>
                <p className="mb-3 text-sm font-medium">Select Workouts</p>
                <ul className="space-y-3">
                  {library.map((w) => {
                    const checked = selectedWorkoutIds.includes(w.id);
                    return (
                      <li
                        key={w.id}
                        className="flex items-start gap-3 rounded-lg border border-border p-3"
                      >
                        <Checkbox
                          id={`wo-${w.id}`}
                          checked={checked}
                          onCheckedChange={() => toggleWorkout(w.id)}
                        />
                        <label htmlFor={`wo-${w.id}`} className="cursor-pointer flex-1">
                          <span className="font-medium text-sm">{w.name}</span>
                          <span className="block text-xs text-muted-foreground">
                            {w.description} · {w.exercises.length} exercises
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <Button
                type="button"
                className="bg-secondary text-white hover:bg-secondary/90"
                onClick={createRoutine}
              >
                Save Routine
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle className="font-display text-base">Saved Routines</CardTitle>
              <CardDescription>Reusable routines you can assign to clients.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {routines.length === 0 ? (
                <p className="text-sm text-muted-foreground">No routines saved yet.</p>
              ) : (
                routines.map((r) => {
                  const routineAssignments = assignments.filter((a) => a.routineId === r.id);
                  return (
                    <div
                      key={r.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4"
                    >
                      <div>
                        <p className="font-medium text-sm">{r.name}</p>
                        <p className="text-xs text-muted-foreground">
                          saved {r.savedAt}
                          {routineAssignments.length > 0 &&
                            ` · assigned to ${routineAssignments
                              .map((a) => `${a.clientName} (${a.day})`)
                              .join(", ")}`}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {r.workoutIds.map((wid) => {
                            const w = library.find((x) => x.id === wid);
                            return (
                              <Badge key={wid} variant="secondary">
                                {w?.name ?? wid}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrainerWorkouts;
