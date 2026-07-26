import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Check, Plus } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useGlobalStyles } from '@/hooks/use-themed-styles';
import { useAppColors } from '@/hooks/use-app-colors';
import type { AppColors } from '@/constants/color-palettes';
import { useAuthStore } from '@/store/auth-store';
import { useWorkoutStore } from '@/store/workout-store';
import { useLanguageStore } from '@/store/language-store';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import type { WorkoutExercise } from '@/types';
import { toLocalYmd } from '@/utils/date-utils';

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.md,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: theme.spacing.lg,
      lineHeight: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: theme.spacing.sm,
    },
    difficultyRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    chip: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      backgroundColor: colors.card,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    chipTextActive: {
      color: '#fff',
    },
    exerciseList: {
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    exerciseItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      gap: theme.spacing.sm,
    },
    exerciseItemSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.backgroundLight,
    },
    exerciseInfo: {
      flex: 1,
    },
    exerciseName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    exerciseMeta: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    checkBox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkBoxSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    emptyExercises: {
      padding: theme.spacing.lg,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    footer: {
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
  });
}

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export default function CreateWorkoutScreen() {
  const router = useRouter();
  const globalStyles = useGlobalStyles();
  const colors = useAppColors();
  const { t } = useLanguageStore();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const user = useAuthStore(s => s.user);
  const exercises = useWorkoutStore(s => s.exercises);
  const addWorkout = useWorkoutStore(s => s.addWorkout);
  const addExercise = useWorkoutStore(s => s.addExercise);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('45');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggleExercise = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };

  const ensureDemoExercises = () => {
    if (exercises.length > 0) return;
    // Fallback if hydrate hasn't filled the library yet
    const seeds = [
      {
        id: `ex-local-${Date.now()}-1`,
        name: 'Squat',
        description: 'Bodyweight or barbell squat',
        category: 'Legs',
        difficulty: 'beginner' as const,
      },
      {
        id: `ex-local-${Date.now()}-2`,
        name: 'Push-up',
        description: 'Chest and triceps',
        category: 'Chest',
        difficulty: 'beginner' as const,
      },
      {
        id: `ex-local-${Date.now()}-3`,
        name: 'Plank',
        description: 'Core stability',
        category: 'Core',
        difficulty: 'beginner' as const,
      },
    ];
    seeds.forEach(addExercise);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('coach.workoutNameRequired'));
      return;
    }
    if (selectedIds.length === 0) {
      Alert.alert(t('common.error'), t('coach.exercisesRequired'));
      return;
    }

    setSaving(true);
    const workoutExercises: WorkoutExercise[] = selectedIds.map((exerciseId, index) => ({
      exerciseId,
      group: String.fromCharCode(65 + Math.floor(index / 2)),
      sets: 3,
      reps: 10,
      restTime: 60,
    }));

    addWorkout({
      id: `workout-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || t('coach.customWorkoutDesc'),
      exercises: workoutExercises,
      createdAt: new Date().toISOString(),
      createdBy: user?.id ?? 'trainer',
      duration: Math.max(5, parseInt(duration, 10) || 45),
      difficulty,
      scheduledFor: toLocalYmd(new Date()),
    });

    setSaving(false);
    Alert.alert(t('common.success'), t('coach.workoutSaved'), [
      { text: t('common.ok'), onPress: () => router.back() },
    ]);
  };

  useEffect(() => {
    ensureDemoExercises();
  }, []);

  const library = useWorkoutStore(s => s.exercises);

  return (
    <SafeAreaView style={globalStyles.container} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subtitle}>{t('coach.createWorkoutSubtitle')}</Text>

          <Input
            label={t('coach.workoutName')}
            value={name}
            onChangeText={setName}
            placeholder={t('coach.workoutNamePlaceholder')}
          />
          <Input
            label={t('coach.workoutDescription')}
            value={description}
            onChangeText={setDescription}
            placeholder={t('coach.workoutDescriptionPlaceholder')}
            multiline
          />
          <Input
            label={t('workouts.duration')}
            value={duration}
            onChangeText={setDuration}
            keyboardType="number-pad"
            placeholder="45"
          />

          <Text style={styles.label}>{t('workouts.difficulty')}</Text>
          <View style={styles.difficultyRow}>
            {(['beginner', 'intermediate', 'advanced'] as Difficulty[]).map(level => (
              <TouchableOpacity
                key={level}
                style={[styles.chip, difficulty === level && styles.chipActive]}
                onPress={() => setDifficulty(level)}
              >
                <Text style={[styles.chipText, difficulty === level && styles.chipTextActive]}>
                  {t(`common.${level}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>{t('workouts.exercises')}</Text>
          {library.length === 0 ? (
            <View style={styles.emptyExercises}>
              <Text style={styles.emptyText}>{t('coach.noExercisesInLibrary')}</Text>
              <Button
                title={t('coach.seedExercises')}
                onPress={ensureDemoExercises}
                variant="outline"
                icon={<Plus size={18} color={colors.primary} />}
              />
            </View>
          ) : (
            <View style={styles.exerciseList}>
              {library.map(ex => {
                const selected = selectedIds.includes(ex.id);
                return (
                  <TouchableOpacity
                    key={ex.id}
                    style={[styles.exerciseItem, selected && styles.exerciseItemSelected]}
                    onPress={() => toggleExercise(ex.id)}
                  >
                    <View style={[styles.checkBox, selected && styles.checkBoxSelected]}>
                      {selected && <Check size={14} color="#fff" />}
                    </View>
                    <View style={styles.exerciseInfo}>
                      <Text style={styles.exerciseName}>{ex.name}</Text>
                      <Text style={styles.exerciseMeta}>
                        {ex.category} · {t(`common.${ex.difficulty}`)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={styles.footer}>
            <Button
              title={t('coach.saveToLibrary')}
              onPress={handleSave}
              loading={saving}
              disabled={saving}
            />
            <Button title={t('common.cancel')} onPress={() => router.back()} variant="outline" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
