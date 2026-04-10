import { WorkoutExercise } from '@/types';

export interface ExerciseGroup {
  label: string;
  exercises: WorkoutExercise[];
}

export function groupExercises(exercises: WorkoutExercise[]): ExerciseGroup[] {
  const map = new Map<string, WorkoutExercise[]>();

  for (const ex of exercises) {
    const label = ex.group ?? 'A';
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(ex);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, exercises]) => ({ label, exercises }));
}
