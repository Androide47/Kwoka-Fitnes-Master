import { useMemo, useState, type FormEvent } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { ExerciseItem, RoutineTemplate, WorkoutTemplate } from "@/data/mockTrainer";
import { useWorkoutLibrary } from "@/context/WorkoutLibraryContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type DeleteTarget =
  | { kind: "exercise"; id: string; name: string }
  | { kind: "workout"; id: string; name: string }
  | { kind: "routine"; id: string; name: string };

const TrainerLibrary = () => {
  const {
    exercises,
    workouts,
    routines,
    upsertExercise,
    deleteExercise,
    upsertWorkout,
    deleteWorkout,
    upsertRoutine,
    deleteRoutine,
    exerciseById,
    workoutById,
  } = useWorkoutLibrary();

  const [editingExercise, setEditingExercise] = useState<ExerciseItem | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutTemplate | null>(null);
  const [editingRoutine, setEditingRoutine] = useState<RoutineTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const workoutDraftIds = editingWorkout?.exerciseIds ?? [];
  const routineDraftIds = editingRoutine?.workoutIds ?? [];

  const referringWorkouts = useMemo(() => {
    if (!deleteTarget || deleteTarget.kind !== "exercise") return [];
    return workouts.filter((w) => w.exerciseIds.includes(deleteTarget.id));
  }, [deleteTarget, workouts]);

  const referringRoutines = useMemo(() => {
    if (!deleteTarget || deleteTarget.kind !== "workout") return [];
    return routines.filter((r) => r.workoutIds.includes(deleteTarget.id));
  }, [deleteTarget, routines]);

  const toggleWorkoutExercise = (id: string) => {
    if (!editingWorkout) return;
    setEditingWorkout({
      ...editingWorkout,
      exerciseIds: editingWorkout.exerciseIds.includes(id)
        ? editingWorkout.exerciseIds.filter((x) => x !== id)
        : [...editingWorkout.exerciseIds, id],
    });
  };

  const toggleRoutineWorkout = (id: string) => {
    if (!editingRoutine) return;
    setEditingRoutine({
      ...editingRoutine,
      workoutIds: editingRoutine.workoutIds.includes(id)
        ? editingRoutine.workoutIds.filter((x) => x !== id)
        : [...editingRoutine.workoutIds, id],
    });
  };

  const saveExerciseEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingExercise) return;
    if (!editingExercise.name.trim()) {
      toast.error("Exercise name is required.");
      return;
    }
    upsertExercise({
      ...editingExercise,
      name: editingExercise.name.trim(),
      youtubeUrl: editingExercise.youtubeUrl.trim(),
      instructions: editingExercise.instructions.trim(),
    });
    setEditingExercise(null);
    toast.success("Exercise updated.");
  };

  const saveWorkoutEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingWorkout) return;
    if (!editingWorkout.name.trim()) {
      toast.error("Workout name is required.");
      return;
    }
    if (editingWorkout.exerciseIds.length === 0) {
      toast.error("A workout needs at least one exercise.");
      return;
    }
    upsertWorkout({
      ...editingWorkout,
      name: editingWorkout.name.trim(),
      description: editingWorkout.description.trim() || "Custom workout",
    });
    setEditingWorkout(null);
    toast.success("Workout updated.");
  };

  const saveRoutineEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingRoutine) return;
    if (!editingRoutine.name.trim()) {
      toast.error("Routine name is required.");
      return;
    }
    if (editingRoutine.workoutIds.length === 0) {
      toast.error("A routine needs at least one workout.");
      return;
    }
    upsertRoutine({
      ...editingRoutine,
      name: editingRoutine.name.trim(),
      description: editingRoutine.description.trim() || "Custom routine",
    });
    setEditingRoutine(null);
    toast.success("Routine updated.");
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.kind === "exercise") {
      deleteExercise(deleteTarget.id);
      toast.success(`Deleted exercise "${deleteTarget.name}".`);
    } else if (deleteTarget.kind === "workout") {
      deleteWorkout(deleteTarget.id);
      toast.success(`Deleted workout "${deleteTarget.name}".`);
    } else {
      deleteRoutine(deleteTarget.id);
      toast.success(`Deleted routine "${deleteTarget.name}".`);
    }
    setDeleteTarget(null);
  };

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="mb-2 font-display text-3xl">Library</h1>
        <p className="text-muted-foreground">
          Browse, edit, and delete exercises, workouts, and routines.
        </p>
      </div>

      <Tabs defaultValue="exercises">
        <TabsList className="flex h-auto flex-wrap gap-1">
          <TabsTrigger value="exercises">Exercises ({exercises.length})</TabsTrigger>
          <TabsTrigger value="workouts">Workouts ({workouts.length})</TabsTrigger>
          <TabsTrigger value="routines">Routines ({routines.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="exercises" className="mt-6">
          {exercises.length === 0 ? (
            <p className="text-sm text-muted-foreground">No exercises in the library yet.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {exercises.map((ex) => (
                <Card key={ex.id} className="bg-card/80">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="font-display text-base">{ex.name}</CardTitle>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label={`Edit ${ex.name}`}
                          onClick={() => setEditingExercise({ ...ex })}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          aria-label={`Delete ${ex.name}`}
                          onClick={() =>
                            setDeleteTarget({ kind: "exercise", id: ex.id, name: ex.name })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {ex.youtubeUrl && (
                      <p className="truncate text-xs text-primary">{ex.youtubeUrl}</p>
                    )}
                    {ex.instructions && (
                      <p className="mt-2 text-xs text-muted-foreground">{ex.instructions}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="workouts" className="mt-6">
          {workouts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No workouts in the library yet.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {workouts.map((w) => (
                <Card key={w.id} className="bg-card/80">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="font-display text-base">{w.name}</CardTitle>
                        <CardDescription className="mt-1">{w.description}</CardDescription>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label={`Edit ${w.name}`}
                          onClick={() => setEditingWorkout({ ...w, exerciseIds: [...w.exerciseIds] })}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          aria-label={`Delete ${w.name}`}
                          onClick={() =>
                            setDeleteTarget({ kind: "workout", id: w.id, name: w.name })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {w.exerciseIds.map((eid) => (
                        <li key={eid}>· {exerciseById(eid)?.name ?? eid}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="routines" className="mt-6">
          {routines.length === 0 ? (
            <p className="text-sm text-muted-foreground">No routines in the library yet.</p>
          ) : (
            <div className="space-y-3">
              {routines.map((r) => (
                <Card key={r.id} className="bg-card/80">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="font-display text-base">{r.name}</CardTitle>
                        <CardDescription className="mt-1">{r.description}</CardDescription>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label={`Edit ${r.name}`}
                          onClick={() =>
                            setEditingRoutine({ ...r, workoutIds: [...r.workoutIds] })
                          }
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          aria-label={`Delete ${r.name}`}
                          onClick={() =>
                            setDeleteTarget({ kind: "routine", id: r.id, name: r.name })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {r.workoutIds.map((wid) => (
                        <Badge key={wid} variant="secondary">
                          {workoutById(wid)?.name ?? wid}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit exercise */}
      <Dialog open={Boolean(editingExercise)} onOpenChange={(o) => !o && setEditingExercise(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Edit exercise</DialogTitle>
            <DialogDescription>Update name, demo video, and instructions.</DialogDescription>
          </DialogHeader>
          {editingExercise && (
            <form onSubmit={saveExerciseEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-ex-name">Name</Label>
                <Input
                  id="edit-ex-name"
                  value={editingExercise.name}
                  onChange={(e) =>
                    setEditingExercise({ ...editingExercise, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-ex-yt">YouTube URL</Label>
                <Input
                  id="edit-ex-yt"
                  value={editingExercise.youtubeUrl}
                  onChange={(e) =>
                    setEditingExercise({ ...editingExercise, youtubeUrl: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-ex-instructions">Instructions</Label>
                <Textarea
                  id="edit-ex-instructions"
                  rows={3}
                  value={editingExercise.instructions}
                  onChange={(e) =>
                    setEditingExercise({ ...editingExercise, instructions: e.target.value })
                  }
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingExercise(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-secondary text-white hover:bg-secondary/90">
                  Save changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit workout */}
      <Dialog open={Boolean(editingWorkout)} onOpenChange={(o) => !o && setEditingWorkout(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Edit workout</DialogTitle>
            <DialogDescription>Update details and which exercises belong here.</DialogDescription>
          </DialogHeader>
          {editingWorkout && (
            <form onSubmit={saveWorkoutEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-wo-name">Name</Label>
                <Input
                  id="edit-wo-name"
                  value={editingWorkout.name}
                  onChange={(e) =>
                    setEditingWorkout({ ...editingWorkout, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-wo-desc">Description</Label>
                <Input
                  id="edit-wo-desc"
                  value={editingWorkout.description}
                  onChange={(e) =>
                    setEditingWorkout({ ...editingWorkout, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Exercises</Label>
                <ul className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
                  {exercises.map((ex) => (
                    <li key={ex.id} className="flex items-start gap-3">
                      <Checkbox
                        id={`edit-pick-ex-${ex.id}`}
                        checked={workoutDraftIds.includes(ex.id)}
                        onCheckedChange={() => toggleWorkoutExercise(ex.id)}
                        className="mt-1"
                      />
                      <label htmlFor={`edit-pick-ex-${ex.id}`} className="cursor-pointer text-sm">
                        {ex.name}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingWorkout(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-secondary text-white hover:bg-secondary/90">
                  Save changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit routine */}
      <Dialog open={Boolean(editingRoutine)} onOpenChange={(o) => !o && setEditingRoutine(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Edit routine</DialogTitle>
            <DialogDescription>Update details and which workouts belong here.</DialogDescription>
          </DialogHeader>
          {editingRoutine && (
            <form onSubmit={saveRoutineEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-rt-name">Name</Label>
                <Input
                  id="edit-rt-name"
                  value={editingRoutine.name}
                  onChange={(e) =>
                    setEditingRoutine({ ...editingRoutine, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-rt-desc">Description</Label>
                <Input
                  id="edit-rt-desc"
                  value={editingRoutine.description}
                  onChange={(e) =>
                    setEditingRoutine({ ...editingRoutine, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Workouts</Label>
                <ul className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
                  {workouts.map((w) => (
                    <li key={w.id} className="flex items-start gap-3">
                      <Checkbox
                        id={`edit-pick-wo-${w.id}`}
                        checked={routineDraftIds.includes(w.id)}
                        onCheckedChange={() => toggleRoutineWorkout(w.id)}
                        className="mt-1"
                      />
                      <label htmlFor={`edit-pick-wo-${w.id}`} className="cursor-pointer text-sm">
                        {w.name}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingRoutine(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-secondary text-white hover:bg-secondary/90">
                  Save changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.kind}?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  This will permanently remove{" "}
                  <span className="text-foreground">"{deleteTarget?.name}"</span> from the library.
                </p>
                {deleteTarget?.kind === "exercise" && referringWorkouts.length > 0 && (
                  <p>
                    It will also be removed from {referringWorkouts.length} workout
                    {referringWorkouts.length === 1 ? "" : "s"} (
                    {referringWorkouts.map((w) => w.name).join(", ")}).
                  </p>
                )}
                {deleteTarget?.kind === "workout" && referringRoutines.length > 0 && (
                  <p>
                    It will also be removed from {referringRoutines.length} routine
                    {referringRoutines.length === 1 ? "" : "s"} (
                    {referringRoutines.map((r) => r.name).join(", ")}).
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TrainerLibrary;
