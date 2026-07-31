import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ExerciseItem, RoutineTemplate, WorkoutTemplate } from "@/data/mockTrainer";
import * as api from "@/lib/api/workoutLibraryApi";

type WorkoutLibraryContextValue = {
  exercises: ExerciseItem[];
  workouts: WorkoutTemplate[];
  routines: RoutineTemplate[];
  upsertExercise: (exercise: ExerciseItem) => void;
  deleteExercise: (id: string) => void;
  upsertWorkout: (workout: WorkoutTemplate) => void;
  deleteWorkout: (id: string) => void;
  upsertRoutine: (routine: RoutineTemplate) => void;
  deleteRoutine: (id: string) => void;
  exerciseById: (id: string) => ExerciseItem | undefined;
  workoutById: (id: string) => WorkoutTemplate | undefined;
  routineById: (id: string) => RoutineTemplate | undefined;
};

const WorkoutLibraryContext = createContext<WorkoutLibraryContextValue | null>(null);

export function WorkoutLibraryProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0);
  const library = useMemo(() => {
    void version;
    return api.getWorkoutLibrary();
  }, [version]);

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const value = useMemo<WorkoutLibraryContextValue>(() => {
    const exerciseMap = new Map(library.exercises.map((e) => [e.id, e]));
    const workoutMap = new Map(library.workouts.map((w) => [w.id, w]));
    const routineMap = new Map(library.routines.map((r) => [r.id, r]));

    return {
      exercises: library.exercises,
      workouts: library.workouts,
      routines: library.routines,
      upsertExercise: (exercise) => {
        api.upsertExercise(exercise);
        bump();
      },
      deleteExercise: (id) => {
        api.deleteExercise(id);
        bump();
      },
      upsertWorkout: (workout) => {
        api.upsertWorkout(workout);
        bump();
      },
      deleteWorkout: (id) => {
        api.deleteWorkout(id);
        bump();
      },
      upsertRoutine: (routine) => {
        api.upsertRoutine(routine);
        bump();
      },
      deleteRoutine: (id) => {
        api.deleteRoutine(id);
        bump();
      },
      exerciseById: (id) => exerciseMap.get(id),
      workoutById: (id) => workoutMap.get(id),
      routineById: (id) => routineMap.get(id),
    };
  }, [library, bump]);

  return (
    <WorkoutLibraryContext.Provider value={value}>{children}</WorkoutLibraryContext.Provider>
  );
}

export function useWorkoutLibrary() {
  const ctx = useContext(WorkoutLibraryContext);
  if (!ctx) throw new Error("useWorkoutLibrary must be used within WorkoutLibraryProvider");
  return ctx;
}
