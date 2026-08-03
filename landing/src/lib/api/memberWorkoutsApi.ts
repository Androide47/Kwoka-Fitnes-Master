import { addDays, format, startOfToday } from "date-fns";
import { getWorkoutLibrary } from "@/lib/api/workoutLibraryApi";
import type { ExerciseItem, WorkoutTemplate } from "@/data/mockTrainer";
import { readJson, writeJson } from "@/lib/api/storage";

const ASSIGNMENTS_KEY = "kwoka_member_workout_assignments";
const COMPLETIONS_KEY = "kwoka_member_workout_completions";

export type MemberWorkoutStatus = "upcoming" | "completed" | "skipped";

export type MemberWorkoutAssignment = {
  id: string;
  /** Library workout template id */
  workoutId: string;
  name: string;
  description: string;
  /** YYYY-MM-DD */
  scheduledFor: string;
  exerciseIds: string[];
};

export type MemberWorkoutCompletion = {
  assignmentId: string;
  status: "completed" | "skipped";
  completedExerciseIds: string[];
  notes: string;
  completedAt: string;
};

export type MemberWorkoutView = MemberWorkoutAssignment & {
  status: MemberWorkoutStatus;
  exercises: ExerciseItem[];
  completion: MemberWorkoutCompletion | null;
};

function dayKey(offset: number): string {
  return format(addDays(startOfToday(), offset), "yyyy-MM-dd");
}

/** Seed assignments relative to today so the demo stays useful over time. */
function seedAssignments(): MemberWorkoutAssignment[] {
  const lib = getWorkoutLibrary();
  const byId = (id: string): WorkoutTemplate | undefined =>
    lib.workouts.find((w) => w.id === id);

  const pick = (
    id: string,
    offset: number,
    fallbackName: string,
  ): MemberWorkoutAssignment | null => {
    const w = byId(id);
    if (!w) return null;
    return {
      id: `asg-${id}-${offset}`,
      workoutId: w.id,
      name: w.name || fallbackName,
      description: w.description,
      scheduledFor: dayKey(offset),
      exerciseIds: [...w.exerciseIds],
    };
  };

  return [
    pick("w3", -2, "Upper Push"),
    pick("w1", -1, "Full Body Strength"),
    pick("w1", 0, "Full Body Strength"),
    pick("w2", 1, "HIIT Cardio Blast"),
    pick("w3", 3, "Upper Push"),
    pick("w2", 5, "HIIT Cardio Blast"),
  ].filter(Boolean) as MemberWorkoutAssignment[];
}

function readAssignments(): MemberWorkoutAssignment[] {
  const stored = readJson<MemberWorkoutAssignment[] | null>(ASSIGNMENTS_KEY, null);
  if (stored && stored.length > 0) return stored;
  const seeded = seedAssignments();
  writeJson(ASSIGNMENTS_KEY, seeded);
  return seeded;
}

function readCompletions(): MemberWorkoutCompletion[] {
  return readJson<MemberWorkoutCompletion[]>(COMPLETIONS_KEY, []);
}

function writeCompletions(next: MemberWorkoutCompletion[]) {
  writeJson(COMPLETIONS_KEY, next);
}

function resolveStatus(
  assignment: MemberWorkoutAssignment,
  completion: MemberWorkoutCompletion | null,
): MemberWorkoutStatus {
  if (completion?.status === "completed") return "completed";
  if (completion?.status === "skipped") return "skipped";
  const today = format(startOfToday(), "yyyy-MM-dd");
  if (assignment.scheduledFor < today) return "skipped";
  return "upcoming";
}

function toView(assignment: MemberWorkoutAssignment): MemberWorkoutView {
  const lib = getWorkoutLibrary();
  const completion =
    readCompletions().find((c) => c.assignmentId === assignment.id) ?? null;
  const exercises = assignment.exerciseIds
    .map((id) => lib.exercises.find((e) => e.id === id))
    .filter(Boolean) as ExerciseItem[];

  return {
    ...assignment,
    status: resolveStatus(assignment, completion),
    exercises,
    completion,
  };
}

export const memberWorkoutsApi = {
  list(): MemberWorkoutView[] {
    return readAssignments()
      .map(toView)
      .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));
  },

  listUpcoming(): MemberWorkoutView[] {
    return this.list().filter((w) => w.status === "upcoming");
  },

  listPast(): MemberWorkoutView[] {
    return this.list().filter((w) => w.status !== "upcoming");
  },

  getToday(): MemberWorkoutView | null {
    const today = format(startOfToday(), "yyyy-MM-dd");
    return this.list().find((w) => w.scheduledFor === today) ?? null;
  },

  getById(id: string): MemberWorkoutView | null {
    return this.list().find((w) => w.id === id) ?? null;
  },

  markExerciseDone(assignmentId: string, exerciseId: string, done: boolean) {
    const completions = readCompletions();
    const existing = completions.find((c) => c.assignmentId === assignmentId);
    const base: MemberWorkoutCompletion = existing ?? {
      assignmentId,
      status: "completed",
      completedExerciseIds: [],
      notes: "",
      completedAt: new Date().toISOString(),
    };
    const ids = new Set(base.completedExerciseIds);
    if (done) ids.add(exerciseId);
    else ids.delete(exerciseId);
    const next: MemberWorkoutCompletion = {
      ...base,
      completedExerciseIds: [...ids],
      completedAt: new Date().toISOString(),
    };
    writeCompletions([
      next,
      ...completions.filter((c) => c.assignmentId !== assignmentId),
    ]);
    return this.getById(assignmentId);
  },

  complete(assignmentId: string, notes = "") {
    const view = this.getById(assignmentId);
    if (!view) return null;
    const completions = readCompletions();
    const next: MemberWorkoutCompletion = {
      assignmentId,
      status: "completed",
      completedExerciseIds:
        completions.find((c) => c.assignmentId === assignmentId)?.completedExerciseIds ??
        view.exerciseIds,
      notes: notes.trim(),
      completedAt: new Date().toISOString(),
    };
    writeCompletions([
      next,
      ...completions.filter((c) => c.assignmentId !== assignmentId),
    ]);
    return this.getById(assignmentId);
  },

  resetDemo() {
    writeJson(ASSIGNMENTS_KEY, seedAssignments());
    writeJson(COMPLETIONS_KEY, []);
  },
};
