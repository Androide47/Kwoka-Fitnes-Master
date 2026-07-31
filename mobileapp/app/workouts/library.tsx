import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';
import { Pencil, Trash2, Plus } from 'lucide-react-native';
import { useGlobalStyles } from '@/hooks/use-themed-styles';
import { useAppColors } from '@/hooks/use-app-colors';
import { useWorkoutStore } from '@/store/workout-store';
import { useLanguageStore } from '@/store/language-store';
import { Button } from '@/components/Button';
import { createCoachBuilderStyles } from '@/utils/coach-builder-styles';

type LibraryTab = 'exercises' | 'workouts' | 'routines';

export default function CoachLibraryScreen() {
  const router = useRouter();
  const globalStyles = useGlobalStyles();
  const colors = useAppColors();
  const { t } = useLanguageStore();
  const styles = useMemo(() => createCoachBuilderStyles(colors), [colors]);

  const exercises = useWorkoutStore(s => s.exercises);
  const workoutsRaw = useWorkoutStore(s => s.workouts);
  const routines = useWorkoutStore(s => s.routines);
  const getLibraryWorkouts = useWorkoutStore(s => s.getLibraryWorkouts);
  const getExerciseById = useWorkoutStore(s => s.getExerciseById);
  const getWorkoutById = useWorkoutStore(s => s.getWorkoutById);
  const deleteExercise = useWorkoutStore(s => s.deleteExercise);
  const deleteWorkout = useWorkoutStore(s => s.deleteWorkout);
  const deleteRoutine = useWorkoutStore(s => s.deleteRoutine);

  const library = useMemo(() => getLibraryWorkouts(), [workoutsRaw, getLibraryWorkouts]);
  const [tab, setTab] = useState<LibraryTab>('exercises');

  const confirmDelete = (
    kind: 'exercise' | 'workout' | 'routine',
    id: string,
    name: string,
  ) => {
    Alert.alert(
      t('coach.deleteConfirmTitle'),
      t('coach.deleteConfirmBody').replace('{name}', name),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            if (kind === 'exercise') deleteExercise(id);
            else if (kind === 'workout') deleteWorkout(id);
            else deleteRoutine(id);
          },
        },
      ],
    );
  };

  const createHref =
    tab === 'exercises'
      ? '/workouts/create-exercise'
      : tab === 'workouts'
        ? '/workouts/create'
        : '/workouts/create-routine';

  return (
    <SafeAreaView style={globalStyles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>{t('coach.librarySubtitle')}</Text>

        <View style={styles.tabsContainer}>
          {(
            [
              ['exercises', t('coach.tabExercises'), exercises.length],
              ['workouts', t('coach.tabWorkouts'), library.length],
              ['routines', t('coach.tabRoutines'), (routines ?? []).length],
            ] as const
          ).map(([key, label, count]) => (
            <TouchableOpacity
              key={key}
              style={[styles.tab, tab === key && styles.activeTab]}
              onPress={() => setTab(key)}
            >
              <Text style={[styles.tabText, tab === key && styles.activeTabText]}>
                {label} ({count})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ marginBottom: 12 }}>
          <Button
            title={
              tab === 'exercises'
                ? t('coach.createExercise')
                : tab === 'workouts'
                  ? t('coach.createWorkout')
                  : t('coach.createRoutine')
            }
            onPress={() => router.push(createHref as Href)}
            icon={<Plus size={18} color="#fff" />}
          />
        </View>

        {tab === 'exercises' &&
          (exercises.length === 0 ? (
            <Text style={styles.emptyText}>{t('coach.noExercisesInLibrary')}</Text>
          ) : (
            exercises.map(ex => (
              <View key={ex.id} style={styles.libraryCard}>
                <View style={styles.libraryCardHeader}>
                  <Text style={styles.libraryTitle}>{ex.name}</Text>
                  <View style={styles.libraryActions}>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() =>
                        router.push(`/workouts/create-exercise?id=${ex.id}` as Href)
                      }
                    >
                      <Pencil size={18} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => confirmDelete('exercise', ex.id, ex.name)}
                    >
                      <Trash2 size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.libraryMeta}>
                  {ex.category} · {t(`common.${ex.difficulty}`)}
                </Text>
                {ex.videoUrl ? (
                  <Text style={styles.libraryMeta} numberOfLines={1}>
                    {ex.videoUrl}
                  </Text>
                ) : null}
                {ex.description ? (
                  <Text style={styles.libraryMeta}>{ex.description}</Text>
                ) : null}
              </View>
            ))
          ))}

        {tab === 'workouts' &&
          (library.length === 0 ? (
            <Text style={styles.emptyText}>{t('coach.emptyLibrary')}</Text>
          ) : (
            library.map(workout => (
              <View key={workout.id} style={styles.libraryCard}>
                <View style={styles.libraryCardHeader}>
                  <Text style={styles.libraryTitle}>{workout.name}</Text>
                  <View style={styles.libraryActions}>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => router.push(`/workouts/create?id=${workout.id}` as Href)}
                    >
                      <Pencil size={18} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => confirmDelete('workout', workout.id, workout.name)}
                    >
                      <Trash2 size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.libraryMeta}>{workout.description}</Text>
                <View style={styles.badgeRow}>
                  {workout.exercises.map(line => (
                    <View key={`${workout.id}-${line.exerciseId}`} style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {getExerciseById(line.exerciseId)?.name ?? line.exerciseId}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))
          ))}

        {tab === 'routines' &&
          ((routines ?? []).length === 0 ? (
            <Text style={styles.emptyText}>{t('coach.emptyRoutines')}</Text>
          ) : (
            (routines ?? []).map(routine => (
              <View key={routine.id} style={styles.libraryCard}>
                <View style={styles.libraryCardHeader}>
                  <Text style={styles.libraryTitle}>{routine.name}</Text>
                  <View style={styles.libraryActions}>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() =>
                        router.push(`/workouts/create-routine?id=${routine.id}` as Href)
                      }
                    >
                      <Pencil size={18} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => confirmDelete('routine', routine.id, routine.name)}
                    >
                      <Trash2 size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.libraryMeta}>{routine.description}</Text>
                <View style={styles.badgeRow}>
                  {routine.workoutIds.map(wid => (
                    <View key={wid} style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {getWorkoutById(wid)?.name ?? wid}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}
