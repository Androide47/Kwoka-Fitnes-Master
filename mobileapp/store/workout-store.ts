import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exercise, Workout, WorkoutExercise } from '@/types';
import { workoutsApi } from '@/utils/api';
import { addDaysToYmd, toLocalYmd } from '@/utils/date-utils';

function mergeScheduled(workout: Workout, schedule: Record<string, string>): Workout {
  const scheduledFor = schedule[workout.id] ?? workout.scheduledFor;
  return scheduledFor ? { ...workout, scheduledFor } : { ...workout };
}

interface CompletedExercise {
  workoutId: string;
  exerciseId: string;
  completedAt: string;
}

interface CompletedWorkout {
  id: string;
  completedAt: string;
  /** When false, the user ended the session before finishing all exercises. Omitted/undefined means fully completed (legacy data). */
  finished?: boolean;
  /** True when the scheduled day passed and the workout was never fully completed. */
  missed?: boolean;
}

interface WorkoutState {
  exercises: Exercise[];
  workouts: Workout[];
  activeWorkout: Workout | null;
  activeExerciseIndex: number;
  activeGroupIndex: number;
  isWorkoutActive: boolean;
  completedExercises: CompletedExercise[];
  completedWorkouts: CompletedWorkout[];
  /** workoutId -> due calendar day (YYYY-MM-DD, local) */
  scheduledWorkoutDates: Record<string, string>;

  // Exercise library actions
  getExercises: () => Exercise[];
  getExerciseById: (id: string) => Exercise | undefined;
  addExercise: (exercise: Exercise) => void;
  updateExercise: (id: string, data: Partial<Exercise>) => void;

  // Workout actions
  getWorkouts: () => Workout[];
  getWorkoutById: (id: string) => Workout | undefined;
  addWorkout: (workout: Workout) => void;
  updateWorkout: (id: string, data: Partial<Workout>) => void;
  deleteWorkout: (id: string) => void;
  hydrateFromApi: () => Promise<void>;
  syncPastDueWorkouts: () => void;

  // Active workout session actions
  startWorkout: (workoutId: string) => void;
  endWorkout: () => void;
  nextExercise: () => void;
  previousExercise: () => void;
  setActiveGroupIndex: (index: number) => void;
  getCurrentExercise: () => WorkoutExercise | null;
  updateExerciseNotes: (exerciseId: string, notes: string) => void;

  // Completion tracking
  markExerciseCompleted: (workoutId: string, exerciseId: string) => void;
  isExerciseCompleted: (workoutId: string, exerciseId: string) => boolean;
  markWorkoutCompleted: (workoutId: string) => void;
  markWorkoutUnfinished: (workoutId: string) => void;
  isWorkoutCompleted: (workoutId: string) => boolean;
  isWorkoutFullyCompleted: (workoutId: string) => boolean;
  isWorkoutMissed: (workoutId: string) => boolean;
  repeatWorkout: (workoutId: string) => void;
  getCompletedWorkouts: () => CompletedWorkout[];
  getWorkoutCompletionCount: () => number;
  getRecentCompletedWorkouts: (limit?: number) => Workout[];
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      exercises: [],
      workouts: [],
      activeWorkout: null,
      activeExerciseIndex: 0,
      activeGroupIndex: 0,
      isWorkoutActive: false,
      completedExercises: [],
      completedWorkouts: [],
      scheduledWorkoutDates: {},

      // Exercise library actions
      getExercises: () => get().exercises,

      getExerciseById: (id) => {
        return get().exercises.find(exercise => exercise.id === id);
      },

      addExercise: (exercise) => {
        set(state => ({
          exercises: [...state.exercises, exercise]
        }));
      },

      updateExercise: (id, data) => {
        set(state => ({
          exercises: state.exercises.map(exercise =>
            exercise.id === id ? { ...exercise, ...data } : exercise
          )
        }));
      },

      // Workout actions
      getWorkouts: () => {
        const { workouts, scheduledWorkoutDates } = get();
        const schedule = scheduledWorkoutDates ?? {};
        return workouts.map(w => mergeScheduled(w, schedule));
      },

      // Hydration from backend
      hydrateFromApi: async () => {
        try {
          const { workouts, exercises } = await workoutsApi.listWorkouts();

          set(state => {
            const prev = state.scheduledWorkoutDates ?? {};
            const nextDates = { ...prev };
            const todayYmd = toLocalYmd(new Date());
            workouts.forEach((w, i) => {
              if (nextDates[w.id] == null || nextDates[w.id] === '') {
                nextDates[w.id] = addDaysToYmd(todayYmd, i);
              }
            });
            return {
              workouts,
              exercises,
              scheduledWorkoutDates: nextDates,
            };
          });
          get().syncPastDueWorkouts();
        } catch (e) {
          console.warn('Failed to hydrate workouts', e);
        }
      },

      syncPastDueWorkouts: () => {
        const {
          workouts,
          completedWorkouts,
          activeWorkout,
          isWorkoutActive,
          scheduledWorkoutDates,
        } = get();
        const schedule = scheduledWorkoutDates ?? {};
        const todayYmd = toLocalYmd(new Date());
        const completedIds = new Set(completedWorkouts.map(c => c.id));
        const toMark: string[] = [];

        for (const w of workouts) {
          const due = schedule[w.id];
          if (!due || due >= todayYmd) continue;
          if (completedIds.has(w.id)) continue;
          if (isWorkoutActive && activeWorkout?.id === w.id) continue;
          toMark.push(w.id);
        }

        if (toMark.length === 0) return;

        const now = new Date().toISOString();
        set(state => {
          const existing = new Set(state.completedWorkouts.map(c => c.id));
          const additions = toMark
            .filter(id => !existing.has(id))
            .map(id => ({
              id,
              completedAt: now,
              finished: false as const,
              missed: true as const,
            }));
          if (additions.length === 0) return state;
          return {
            completedWorkouts: [...state.completedWorkouts, ...additions],
          };
        });
      },

      getWorkoutById: (id) => {
        const workout = get().workouts.find(w => w.id === id);
        if (!workout) return undefined;
        return mergeScheduled(workout, get().scheduledWorkoutDates ?? {});
      },

      addWorkout: (workout) => {
        set(state => {
          const schedule = state.scheduledWorkoutDates ?? {};
          const todayYmd = toLocalYmd(new Date());
          return {
            workouts: [...state.workouts, workout],
            scheduledWorkoutDates: {
              ...schedule,
              [workout.id]: schedule[workout.id] ?? todayYmd,
            },
          };
        });
      },

      updateWorkout: (id, data) => {
        set(state => ({
          workouts: state.workouts.map(workout =>
            workout.id === id ? { ...workout, ...data } : workout
          )
        }));
      },

      deleteWorkout: (id) => {
        set(state => {
          const { [id]: _removed, ...restSchedule } = state.scheduledWorkoutDates ?? {};
          return {
            workouts: state.workouts.filter(workout => workout.id !== id),
            scheduledWorkoutDates: restSchedule,
          };
        });
      },

      // Active workout session actions
      startWorkout: (workoutId) => {
        const workout = get().getWorkoutById(workoutId);
        if (workout) {
          set({
            activeWorkout: workout,
            activeExerciseIndex: 0,
            activeGroupIndex: 0,
            isWorkoutActive: true
          });
        }
      },

      endWorkout: () => {
        set({
          activeWorkout: null,
          activeExerciseIndex: 0,
          activeGroupIndex: 0,
          isWorkoutActive: false
        });
      },

      nextExercise: () => {
        const { activeWorkout, activeExerciseIndex } = get();
        if (activeWorkout && activeExerciseIndex < activeWorkout.exercises.length - 1) {
          set({ activeExerciseIndex: activeExerciseIndex + 1 });
        }
      },

      previousExercise: () => {
        const { activeExerciseIndex } = get();
        if (activeExerciseIndex > 0) {
          set({ activeExerciseIndex: activeExerciseIndex - 1 });
        }
      },

      setActiveGroupIndex: (index) => {
        set({ activeGroupIndex: index });
      },

      getCurrentExercise: () => {
        const { activeWorkout, activeExerciseIndex } = get();
        if (activeWorkout && activeWorkout.exercises.length > 0) {
          return activeWorkout.exercises[activeExerciseIndex];
        }
        return null;
      },

      updateExerciseNotes: (exerciseId, notes) => {
        const { activeWorkout } = get();
        if (activeWorkout) {
          const updatedExercises = activeWorkout.exercises.map(ex =>
            ex.exerciseId === exerciseId ? { ...ex, notes } : ex
          );

          set({
            activeWorkout: {
              ...activeWorkout,
              exercises: updatedExercises
            }
          });
        }
      },

      // Completion tracking
      markExerciseCompleted: (workoutId, exerciseId) => {
        const now = new Date().toISOString();

        set(state => {
          // Check if already completed
          const isAlreadyCompleted = state.completedExercises.some(
            ex => ex.workoutId === workoutId && ex.exerciseId === exerciseId
          );

          if (isAlreadyCompleted) {
            return state;
          }

          return {
            completedExercises: [
              ...state.completedExercises,
              { workoutId, exerciseId, completedAt: now }
            ]
          };
        });
      },

      isExerciseCompleted: (workoutId, exerciseId) => {
        return get().completedExercises.some(
          ex => ex.workoutId === workoutId && ex.exerciseId === exerciseId
        );
      },

      markWorkoutCompleted: (workoutId) => {
        const now = new Date().toISOString();

        set(state => {
          const idx = state.completedWorkouts.findIndex(w => w.id === workoutId);
          if (idx === -1) {
            return {
              completedWorkouts: [
                ...state.completedWorkouts,
                { id: workoutId, completedAt: now, finished: true },
              ],
            };
          }
          const existing = state.completedWorkouts[idx];
          if (existing.finished !== false) {
            return state;
          }
          const next = [...state.completedWorkouts];
          next[idx] = {
            ...existing,
            completedAt: now,
            finished: true,
            missed: undefined,
          };
          return { completedWorkouts: next };
        });
      },

      markWorkoutUnfinished: (workoutId) => {
        const now = new Date().toISOString();

        set(state => {
          const idx = state.completedWorkouts.findIndex(w => w.id === workoutId);
          if (idx !== -1) {
            const existing = state.completedWorkouts[idx];
            if (existing.finished !== false) {
              return state;
            }
            const next = [...state.completedWorkouts];
            next[idx] = {
              ...existing,
              completedAt: now,
              finished: false,
              missed: false,
            };
            return { completedWorkouts: next };
          }
          return {
            completedWorkouts: [
              ...state.completedWorkouts,
              { id: workoutId, completedAt: now, finished: false, missed: false },
            ],
          };
        });
      },

      isWorkoutCompleted: (workoutId) => {
        return get().completedWorkouts.some(w => w.id === workoutId);
      },

      isWorkoutFullyCompleted: (workoutId) => {
        const entry = get().completedWorkouts.find(w => w.id === workoutId);
        if (!entry) return false;
        return entry.finished !== false;
      },

      isWorkoutMissed: (workoutId) => {
        const entry = get().completedWorkouts.find(w => w.id === workoutId);
        return entry?.missed === true;
      },

      repeatWorkout: (workoutId) => {
        const todayYmd = toLocalYmd(new Date());
        set(state => {
          const schedule = state.scheduledWorkoutDates ?? {};
          return {
            completedWorkouts: state.completedWorkouts.filter(w => w.id !== workoutId),
            completedExercises: state.completedExercises.filter(ex => ex.workoutId !== workoutId),
            scheduledWorkoutDates: {
              ...schedule,
              [workoutId]: todayYmd,
            },
          };
        });
      },

      getCompletedWorkouts: () => {
        return get().completedWorkouts;
      },

      getWorkoutCompletionCount: () => {
        return get().completedWorkouts.filter(w => w.finished !== false).length;
      },

      getRecentCompletedWorkouts: (limit = 5) => {
        const { completedWorkouts } = get();
        const workouts = get().getWorkouts();

        const finishedOnly = completedWorkouts.filter(w => w.finished !== false);

        // Sort by completion date (newest first)
        const sortedCompletions = [...finishedOnly].sort(
          (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        );

        // Get the most recent completions up to the limit
        const recentCompletions = sortedCompletions.slice(0, limit);

        // Map to actual workout objects
        return recentCompletions
          .map(completion => workouts.find(w => w.id === completion.id))
          .filter(Boolean) as Workout[];
      },
    }),
    {
      name: 'workout-storage',
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<WorkoutState>),
        scheduledWorkoutDates: {
          ...current.scheduledWorkoutDates,
          ...((persisted as Partial<WorkoutState>).scheduledWorkoutDates ?? {}),
        },
      }),
    }
  )
);