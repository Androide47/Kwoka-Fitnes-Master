import {
  mockExerciseLibrary,
  mockRoutineLibrary,
  mockWorkoutLibrary,
  type ExerciseItem,
  type RoutineTemplate,
  type WorkoutTemplate,
} from "@/data/mockTrainer";
import { readJson, writeJson } from "@/lib/api/storage";

const KEY = "kwoka.workoutLibrary.v1";

export type WorkoutLibraryState = {
  exercises: ExerciseItem[];
  workouts: WorkoutTemplate[];
  routines: RoutineTemplate[];
};

const defaults = (): WorkoutLibraryState => ({
  exercises: mockExerciseLibrary,
  workouts: mockWorkoutLibrary,
  routines: mockRoutineLibrary,
});

export function getWorkoutLibrary(): WorkoutLibraryState {
  const raw = readJson<Partial<WorkoutLibraryState> | null>(KEY, null);
  if (!raw) return defaults();
  return {
    exercises: Array.isArray(raw.exercises) ? raw.exercises : defaults().exercises,
    workouts: Array.isArray(raw.workouts) ? raw.workouts : defaults().workouts,
    routines: Array.isArray(raw.routines) ? raw.routines : defaults().routines,
  };
}

function save(next: WorkoutLibraryState) {
  writeJson(KEY, next);
  return next;
}

export function upsertExercise(exercise: ExerciseItem): WorkoutLibraryState {
  const lib = getWorkoutLibrary();
  const idx = lib.exercises.findIndex((e) => e.id === exercise.id);
  const exercises =
    idx >= 0
      ? lib.exercises.map((e) => (e.id === exercise.id ? exercise : e))
      : [exercise, ...lib.exercises];
  return save({ ...lib, exercises });
}

export function deleteExercise(id: string): WorkoutLibraryState {
  const lib = getWorkoutLibrary();
  return save({
    ...lib,
    exercises: lib.exercises.filter((e) => e.id !== id),
    workouts: lib.workouts.map((w) => ({
      ...w,
      exerciseIds: w.exerciseIds.filter((eid) => eid !== id),
    })),
  });
}

export function upsertWorkout(workout: WorkoutTemplate): WorkoutLibraryState {
  const lib = getWorkoutLibrary();
  const idx = lib.workouts.findIndex((w) => w.id === workout.id);
  const workouts =
    idx >= 0
      ? lib.workouts.map((w) => (w.id === workout.id ? workout : w))
      : [workout, ...lib.workouts];
  return save({ ...lib, workouts });
}

export function deleteWorkout(id: string): WorkoutLibraryState {
  const lib = getWorkoutLibrary();
  return save({
    ...lib,
    workouts: lib.workouts.filter((w) => w.id !== id),
    routines: lib.routines.map((r) => ({
      ...r,
      workoutIds: r.workoutIds.filter((wid) => wid !== id),
    })),
  });
}

export function upsertRoutine(routine: RoutineTemplate): WorkoutLibraryState {
  const lib = getWorkoutLibrary();
  const idx = lib.routines.findIndex((r) => r.id === routine.id);
  const routines =
    idx >= 0
      ? lib.routines.map((r) => (r.id === routine.id ? routine : r))
      : [routine, ...lib.routines];
  return save({ ...lib, routines });
}

export function deleteRoutine(id: string): WorkoutLibraryState {
  const lib = getWorkoutLibrary();
  return save({
    ...lib,
    routines: lib.routines.filter((r) => r.id !== id),
  });
}
