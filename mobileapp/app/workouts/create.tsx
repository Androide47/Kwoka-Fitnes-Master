import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { Check, Plus } from 'lucide-react-native';
import { useGlobalStyles } from '@/hooks/use-themed-styles';
import { useAppColors } from '@/hooks/use-app-colors';
import { useAuthStore } from '@/store/auth-store';
import { useWorkoutStore } from '@/store/workout-store';
import { useLanguageStore } from '@/store/language-store';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { createCoachBuilderStyles } from '@/utils/coach-builder-styles';
import type { Workout, WorkoutExercise } from '@/types';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export default function CreateWorkoutScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const globalStyles = useGlobalStyles();
  const colors = useAppColors();
  const { t } = useLanguageStore();
  const styles = useMemo(() => createCoachBuilderStyles(colors), [colors]);
  const user = useAuthStore(s => s.user);
  const exercises = useWorkoutStore(s => s.exercises);
  const getWorkoutById = useWorkoutStore(s => s.getWorkoutById);
  const addWorkout = useWorkoutStore(s => s.addWorkout);
  const updateWorkout = useWorkoutStore(s => s.updateWorkout);
  const addExercise = useWorkoutStore(s => s.addExercise);

  const existing = id ? getWorkoutById(id) : undefined;
  const isEdit = Boolean(existing && !existing.clientId);

  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [duration, setDuration] = useState(String(existing?.duration ?? 45));
  const [difficulty, setDifficulty] = useState<Difficulty>(
    existing?.difficulty ?? 'intermediate',
  );
  const [selectedIds, setSelectedIds] = useState<string[]>(
    existing?.exercises.map(e => e.exerciseId) ?? [],
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!existing || existing.clientId) return;
    setName(existing.name);
    setDescription(existing.description);
    setDuration(String(existing.duration));
    setDifficulty(existing.difficulty);
    setSelectedIds(existing.exercises.map(e => e.exerciseId));
  }, [existing?.id]);

  const toggleExercise = (exerciseId: string) => {
    setSelectedIds(prev =>
      prev.includes(exerciseId) ? prev.filter(x => x !== exerciseId) : [...prev, exerciseId],
    );
  };

  const ensureDemoExercises = () => {
    if (exercises.length > 0) return;
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

  useEffect(() => {
    ensureDemoExercises();
  }, []);

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

    const payload: Workout = {
      id: existing && !existing.clientId ? existing.id : `workout-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || t('coach.customWorkoutDesc'),
      exercises: workoutExercises,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      createdBy: existing?.createdBy ?? user?.id ?? 'trainer',
      duration: Math.max(5, parseInt(duration, 10) || 45),
      difficulty,
    };

    if (isEdit) {
      updateWorkout(payload.id, payload);
    } else {
      addWorkout(payload);
    }

    setSaving(false);
    Alert.alert(
      t('common.success'),
      isEdit ? t('coach.workoutUpdated') : t('coach.workoutSaved'),
      [{ text: t('common.ok'), onPress: () => router.back() }],
    );
  };

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
          <Text style={styles.subtitle}>
            {isEdit ? t('coach.editWorkoutSubtitle') : t('coach.createWorkoutSubtitle')}
          </Text>

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
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>{t('coach.noExercisesInLibrary')}</Text>
              <Button
                title={t('coach.createExercise')}
                onPress={() => router.push('/workouts/create-exercise' as Href)}
                variant="outline"
                icon={<Plus size={18} color={colors.primary} />}
              />
            </View>
          ) : (
            <View style={styles.selectList}>
              {library.map(ex => {
                const selected = selectedIds.includes(ex.id);
                return (
                  <TouchableOpacity
                    key={ex.id}
                    style={[styles.selectItem, selected && styles.selectItemSelected]}
                    onPress={() => toggleExercise(ex.id)}
                  >
                    <View style={[styles.checkBox, selected && styles.checkBoxSelected]}>
                      {selected && <Check size={14} color="#fff" />}
                    </View>
                    <View style={styles.selectInfo}>
                      <Text style={styles.selectName}>{ex.name}</Text>
                      <Text style={styles.selectMeta}>
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
              title={isEdit ? t('coach.saveChanges') : t('coach.saveToLibrary')}
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
