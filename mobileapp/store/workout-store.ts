import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Attachment, Exercise, ExerciseFeedback, RoutineAssignment, RoutineTemplate, Workout, WorkoutExercise } from '@/types';
import { workoutsApi } from '@/utils/api';
import { addDaysToYmd, toLocalYmd } from '@/utils/date-utils';
import { useAuthStore } from './auth-store';

function feedbackKey(workoutId: string, exerciseId: string) {
  return `${workoutId}:${exerciseId}`;
}

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
  routines: RoutineTemplate[];
  activeWorkout: Workout | null;
  activeExerciseIndex: number;
  activeGroupIndex: number;
  isWorkoutActive: boolean;
  completedExercises: CompletedExercise[];
  completedWorkouts: CompletedWorkout[];
  /** Client comments + media keyed by workoutId:exerciseId */
  exerciseFeedback: Record<string, ExerciseFeedback>;
  /** workoutId -> due calendar day (YYYY-MM-DD, local) */
  scheduledWorkoutDates: Record<string, string>;
  /** Coach → client routine assignments */
  routineAssignments: RoutineAssignment[];

  // Exercise library actions
  getExercises: () => Exercise[];
  getExerciseById: (id: string) => Exercise | undefined;
  addExercise: (exercise: Exercise) => void;
  updateExercise: (id: string, data: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;

  // Workout actions
  getWorkouts: () => Workout[];
  /** Library templates (not personalized client copies). */
  getLibraryWorkouts: () => Workout[];
  getWorkoutsForClient: (clientId: string) => Workout[];
  getWorkoutById: (id: string) => Workout | undefined;
  addWorkout: (workout: Workout) => void;
  updateWorkout: (id: string, data: Partial<Workout>) => void;
  deleteWorkout: (id: string) => void;

  // Routine templates (one or more library workouts)
  getRoutines: () => RoutineTemplate[];
  getRoutineById: (id: string) => RoutineTemplate | undefined;
  addRoutine: (routine: RoutineTemplate) => void;
  updateRoutine: (id: string, data: Partial<RoutineTemplate>) => void;
  deleteRoutine: (id: string) => void;

  assignRoutineToClient: (params: {
    clientId: string;
    templateWorkoutId: string;
    date: string;
  }) => RoutineAssignment | null;
  assignRoutineTemplateToClient: (params: {
    clientId: string;
    routineId: string;
    date: string;
  }) => RoutineAssignment | null;
  getRoutineAssignments: () => RoutineAssignment[];
  getAssignmentsForClient: (clientId: string) => RoutineAssignment[];
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

  // Client exercise feedback (comments + attachments)
  getExerciseFeedback: (workoutId: string, exerciseId: string) => ExerciseFeedback | undefined;
  setExerciseComment: (workoutId: string, exerciseId: string, comment: string) => void;
  addExerciseAttachment: (workoutId: string, exerciseId: string, attachment: Attachment) => void;
  removeExerciseAttachment: (workoutId: string, exerciseId: string, attachmentId: string) => void;

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
      routines: [],
      activeWorkout: null,
      activeExerciseIndex: 0,
      activeGroupIndex: 0,
      isWorkoutActive: false,
      completedExercises: [],
      completedWorkouts: [],
      exerciseFeedback: {},
      scheduledWorkoutDates: {},
      routineAssignments: [],

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

      deleteExercise: (id) => {
        set(state => ({
          exercises: state.exercises.filter(exercise => exercise.id !== id),
          workouts: state.workouts.map(workout => ({
            ...workout,
            exercises: workout.exercises.filter(ex => ex.exerciseId !== id),
          })),
        }));
      },

      // Workout actions
      getWorkouts: () => {
        const { workouts, scheduledWorkoutDates } = get();
        const schedule = scheduledWorkoutDates ?? {};
        return workouts.map(w => mergeScheduled(w, schedule));
      },

      getLibraryWorkouts: () => {
        return get().getWorkouts().filter(w => !w.clientId);
      },

      getWorkoutsForClient: (clientId) => {
        return get().getWorkouts().filter(w => w.clientId === clientId);
      },

      getRoutineAssignments: () => {
        return [...(get().routineAssignments ?? [])].sort(
          (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
        );
      },

      getAssignmentsForClient: (clientId) => {
        return get().getRoutineAssignments().filter(a => a.clientId === clientId);
      },

      assignRoutineToClient: ({ clientId, templateWorkoutId, date }) => {
        const template = get().getWorkoutById(templateWorkoutId);
        if (!template || template.clientId) return null;

        const existing = (get().routineAssignments ?? []).find(
          a => a.clientId === clientId && a.date === date,
        );
        if (existing) return null;

        const user = useAuthStore.getState().user;
        const now = new Date().toISOString();
        const workoutId = `workout-${Date.now()}`;
        const personalized: Workout = {
          ...template,
          id: workoutId,
          clientId,
          templateId: template.id,
          createdAt: now,
          createdBy: user?.id ?? template.createdBy,
          scheduledFor: date,
          name: template.name,
        };
        const assignment: RoutineAssignment = {
          id: `assign-${Date.now()}`,
          clientId,
          workoutId,
          workoutIds: [workoutId],
          templateId: template.id,
          date,
          name: template.name,
          createdAt: now,
        };

        set(state => ({
          workouts: [...state.workouts, personalized],
          scheduledWorkoutDates: {
            ...(state.scheduledWorkoutDates ?? {}),
            [workoutId]: date,
          },
          routineAssignments: [assignment, ...(state.routineAssignments ?? [])],
        }));

        return assignment;
      },

      assignRoutineTemplateToClient: ({ clientId, routineId, date }) => {
        const routine = get().getRoutineById(routineId);
        if (!routine || routine.workoutIds.length === 0) return null;

        const existing = (get().routineAssignments ?? []).find(
          a => a.clientId === clientId && a.date === date,
        );
        if (existing) return null;

        const user = useAuthStore.getState().user;
        const now = new Date().toISOString();
        const personalizedWorkouts: Workout[] = [];
        const scheduleUpdates: Record<string, string> = {};

        routine.workoutIds.forEach((templateId, index) => {
          const template = get().getWorkoutById(templateId);
          if (!template || template.clientId) return;
          const workoutId = `workout-${Date.now()}-${index}`;
          personalizedWorkouts.push({
            ...template,
            id: workoutId,
            clientId,
            templateId: template.id,
            createdAt: now,
            createdBy: user?.id ?? template.createdBy,
            scheduledFor: date,
            name: template.name,
          });
          scheduleUpdates[workoutId] = date;
        });

        if (personalizedWorkouts.length === 0) return null;

        const workoutIds = personalizedWorkouts.map(w => w.id);
        const assignment: RoutineAssignment = {
          id: `assign-${Date.now()}`,
          clientId,
          workoutId: workoutIds[0],
          workoutIds,
          routineId: routine.id,
          date,
          name: routine.name,
          createdAt: now,
        };

        set(state => ({
          workouts: [...state.workouts, ...personalizedWorkouts],
          scheduledWorkoutDates: {
            ...(state.scheduledWorkoutDates ?? {}),
            ...scheduleUpdates,
          },
          routineAssignments: [assignment, ...(state.routineAssignments ?? [])],
        }));

        return assignment;
      },

      getRoutines: () => [...(get().routines ?? [])],

      getRoutineById: (id) => (get().routines ?? []).find(r => r.id === id),

      addRoutine: (routine) => {
        set(state => ({
          routines: [routine, ...(state.routines ?? [])],
        }));
      },

      updateRoutine: (id, data) => {
        set(state => ({
          routines: (state.routines ?? []).map(routine =>
            routine.id === id ? { ...routine, ...data } : routine,
          ),
        }));
      },

      deleteRoutine: (id) => {
        set(state => ({
          routines: (state.routines ?? []).filter(routine => routine.id !== id),
        }));
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
          // Library templates (no client) stay unscheduled until assigned.
          if (!workout.clientId) {
            return { workouts: [...state.workouts, workout] };
          }
          const schedule = state.scheduledWorkoutDates ?? {};
          const due = workout.scheduledFor ?? toLocalYmd(new Date());
          return {
            workouts: [...state.workouts, workout],
            scheduledWorkoutDates: {
              ...schedule,
              [workout.id]: schedule[workout.id] ?? due,
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
            routines: (state.routines ?? []).map(routine => ({
              ...routine,
              workoutIds: routine.workoutIds.filter(wid => wid !== id),
            })),
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

      getExerciseFeedback: (workoutId, exerciseId) => {
        return get().exerciseFeedback[feedbackKey(workoutId, exerciseId)];
      },

      setExerciseComment: (workoutId, exerciseId, comment) => {
        const key = feedbackKey(workoutId, exerciseId);
        const now = new Date().toISOString();
        set(state => {
          const existing = state.exerciseFeedback[key];
          return {
            exerciseFeedback: {
              ...state.exerciseFeedback,
              [key]: {
                workoutId,
                exerciseId,
                comment,
                attachments: existing?.attachments ?? [],
                updatedAt: now,
              },
            },
          };
        });
      },

      addExerciseAttachment: (workoutId, exerciseId, attachment) => {
        const key = feedbackKey(workoutId, exerciseId);
        const now = new Date().toISOString();
        set(state => {
          const existing = state.exerciseFeedback[key];
          return {
            exerciseFeedback: {
              ...state.exerciseFeedback,
              [key]: {
                workoutId,
                exerciseId,
                comment: existing?.comment ?? '',
                attachments: [...(existing?.attachments ?? []), attachment],
                updatedAt: now,
              },
            },
          };
        });
      },

      removeExerciseAttachment: (workoutId, exerciseId, attachmentId) => {
        const key = feedbackKey(workoutId, exerciseId);
        const existing = get().exerciseFeedback[key];
        if (!existing) return;
        const now = new Date().toISOString();
        set(state => ({
          exerciseFeedback: {
            ...state.exerciseFeedback,
            [key]: {
              ...existing,
              attachments: existing.attachments.filter(a => a.id !== attachmentId),
              updatedAt: now,
            },
          },
        }));
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
        routines: (persisted as Partial<WorkoutState>).routines ?? current.routines ?? [],
        scheduledWorkoutDates: {
          ...current.scheduledWorkoutDates,
          ...((persisted as Partial<WorkoutState>).scheduledWorkoutDates ?? {}),
        },
        exerciseFeedback: {
          ...current.exerciseFeedback,
          ...((persisted as Partial<WorkoutState>).exerciseFeedback ?? {}),
        },
      }),
    }
  )
);