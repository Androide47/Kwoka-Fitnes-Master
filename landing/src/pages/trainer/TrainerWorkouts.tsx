import { useMemo, useState, type FormEvent } from "react";
import { format, startOfDay } from "date-fns";
import {
  mockClients,
  mockWorkoutLibrary,
  mockSavedRoutines,
  type ExerciseItem,
  type RoutineDay,
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
import { toast } from "sonner";

const TrainerWorkouts = () => {
  const [library, setLibrary] = useState<WorkoutTemplate[]>(mockWorkoutLibrary);
  const [routines, setRoutines] = useState<SavedRoutine[]>(mockSavedRoutines);

  // Set Routine flow: client → date → routine → save
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedRoutineId, setSelectedRoutineId] = useState("");

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

  const selectedRoutine = useMemo(
    () => library.find((w) => w.id === selectedRoutineId),
    [library, selectedRoutineId],
  );

  const selectedDateKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

  // Routine already assigned to this client on the selected date, if any.
  const existingAssignment = useMemo(
    () =>
      selectedClientId && selectedDateKey
        ? routines.find((r) => r.clientId === selectedClientId && r.date === selectedDateKey)
        : undefined,
    [routines, selectedClientId, selectedDateKey],
  );

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

  const saveRoutine = () => {
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
      workoutIds: [selectedRoutine.id],
      name: selectedRoutine.name,
      savedAt: new Date().toISOString().slice(0, 10),
    };
    setRoutines((prev) => [next, ...prev]);
    setSelectedDate(undefined);
    setSelectedRoutineId("");
    toast.success(`Routine assigned to ${selectedClient.name} for ${dateLabel} (demo).`);
  };

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="font-display text-3xl mb-2">Workouts</h1>
        <p className="text-muted-foreground">
          Select a client, pick a date, assign a routine, add workouts with YouTube demos — demo
          only.
        </p>
      </div>

      <Tabs defaultValue="set-routine">
        <TabsList className="flex h-auto flex-wrap gap-1">
          <TabsTrigger value="set-routine">Set Routine</TabsTrigger>
          <TabsTrigger value="add-workout">Add Workout</TabsTrigger>
          <TabsTrigger value="library">Workout library</TabsTrigger>
          <TabsTrigger value="saved">Saved routines</TabsTrigger>
        </TabsList>

        {/* Select client → Select a date → Select Routine → Save */}
        <TabsContent value="set-routine" className="space-y-6 mt-6">
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
              <CardDescription>Choose the routine to assign from your library.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedRoutineId} onValueChange={setSelectedRoutineId}>
                <SelectTrigger className="max-w-md">
                  <SelectValue placeholder="Pick a routine…" />
                </SelectTrigger>
                <SelectContent>
                  {library.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name} · {w.exercises.length} exercises
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRoutine && (
                <p className="text-sm text-muted-foreground">
                  {selectedRoutine.description} · {selectedRoutine.exercises.length} exercises
                </p>
              )}

              <Button
                type="button"
                className="bg-secondary text-white hover:bg-secondary/90"
                onClick={saveRoutine}
                disabled={Boolean(existingAssignment)}
              >
                Save
              </Button>
            </CardContent>
          </Card>
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

        <TabsContent value="saved" className="mt-6">
          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle className="font-display text-base">Saved Routines</CardTitle>
              <CardDescription>Routines assigned to clients (local demo state).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {routines.length === 0 ? (
                <p className="text-sm text-muted-foreground">No routines saved yet.</p>
              ) : (
                routines.map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4"
                  >
                    <div>
                      <p className="font-medium text-sm">{r.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.clientName} · {r.day} {r.date} · saved {r.savedAt}
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
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrainerWorkouts;
