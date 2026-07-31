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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGlobalStyles } from '@/hooks/use-themed-styles';
import { useAppColors } from '@/hooks/use-app-colors';
import { useWorkoutStore } from '@/store/workout-store';
import { useLanguageStore } from '@/store/language-store';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { createCoachBuilderStyles } from '@/utils/coach-builder-styles';
import type { Exercise } from '@/types';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export default function CreateExerciseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const globalStyles = useGlobalStyles();
  const colors = useAppColors();
  const { t } = useLanguageStore();
  const styles = useMemo(() => createCoachBuilderStyles(colors), [colors]);
  const getExerciseById = useWorkoutStore(s => s.getExerciseById);
  const addExercise = useWorkoutStore(s => s.addExercise);
  const updateExercise = useWorkoutStore(s => s.updateExercise);

  const existing = id ? getExerciseById(id) : undefined;
  const isEdit = Boolean(existing);

  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [videoUrl, setVideoUrl] = useState(existing?.videoUrl ?? '');
  const [category, setCategory] = useState(existing?.category ?? 'General');
  const [difficulty, setDifficulty] = useState<Difficulty>(existing?.difficulty ?? 'beginner');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!existing) return;
    setName(existing.name);
    setDescription(existing.description);
    setVideoUrl(existing.videoUrl ?? '');
    setCategory(existing.category);
    setDifficulty(existing.difficulty);
  }, [existing?.id]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('coach.exerciseNameRequired'));
      return;
    }

    setSaving(true);
    const payload: Exercise = {
      id: existing?.id ?? `ex-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || t('coach.customExerciseDesc'),
      videoUrl: videoUrl.trim() || undefined,
      category: category.trim() || 'General',
      difficulty,
    };

    if (isEdit) {
      updateExercise(payload.id, payload);
    } else {
      addExercise(payload);
    }

    setSaving(false);
    Alert.alert(
      t('common.success'),
      isEdit ? t('coach.exerciseUpdated') : t('coach.exerciseSaved'),
      [{ text: t('common.ok'), onPress: () => router.back() }],
    );
  };

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
            {isEdit ? t('coach.editExerciseSubtitle') : t('coach.createExerciseSubtitle')}
          </Text>

          <Input
            label={t('coach.exerciseName')}
            value={name}
            onChangeText={setName}
            placeholder={t('coach.exerciseNamePlaceholder')}
          />
          <Input
            label={t('coach.exerciseCategory')}
            value={category}
            onChangeText={setCategory}
            placeholder={t('coach.exerciseCategoryPlaceholder')}
          />
          <Input
            label={t('coach.exerciseVideoUrl')}
            value={videoUrl}
            onChangeText={setVideoUrl}
            placeholder="https://www.youtube.com/watch?v=…"
            autoCapitalize="none"
          />
          <Input
            label={t('coach.exerciseInstructions')}
            value={description}
            onChangeText={setDescription}
            placeholder={t('coach.exerciseInstructionsPlaceholder')}
            multiline
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

          <View style={styles.footer}>
            <Button
              title={isEdit ? t('coach.saveChanges') : t('coach.saveExercise')}
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
