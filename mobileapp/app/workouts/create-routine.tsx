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
import { Check } from 'lucide-react-native';
import { useGlobalStyles } from '@/hooks/use-themed-styles';
import { useAppColors } from '@/hooks/use-app-colors';
import { useAuthStore } from '@/store/auth-store';
import { useWorkoutStore } from '@/store/workout-store';
import { useLanguageStore } from '@/store/language-store';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { createCoachBuilderStyles } from '@/utils/coach-builder-styles';
import type { RoutineTemplate } from '@/types';

export default function CreateRoutineScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const globalStyles = useGlobalStyles();
  const colors = useAppColors();
  const { t } = useLanguageStore();
  const styles = useMemo(() => createCoachBuilderStyles(colors), [colors]);
  const user = useAuthStore(s => s.user);
  const workoutsRaw = useWorkoutStore(s => s.workouts);
  const getLibraryWorkouts = useWorkoutStore(s => s.getLibraryWorkouts);
  const getRoutineById = useWorkoutStore(s => s.getRoutineById);
  const addRoutine = useWorkoutStore(s => s.addRoutine);
  const updateRoutine = useWorkoutStore(s => s.updateRoutine);

  const library = useMemo(() => getLibraryWorkouts(), [workoutsRaw, getLibraryWorkouts]);
  const existing = id ? getRoutineById(id) : undefined;
  const isEdit = Boolean(existing);

  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [selectedIds, setSelectedIds] = useState<string[]>(existing?.workoutIds ?? []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!existing) return;
    setName(existing.name);
    setDescription(existing.description);
    setSelectedIds([...existing.workoutIds]);
  }, [existing?.id]);

  const toggleWorkout = (workoutId: string) => {
    setSelectedIds(prev =>
      prev.includes(workoutId) ? prev.filter(x => x !== workoutId) : [...prev, workoutId],
    );
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('coach.routineNameRequired'));
      return;
    }
    if (selectedIds.length === 0) {
      Alert.alert(t('common.error'), t('coach.workoutsRequired'));
      return;
    }

    setSaving(true);
    const payload: RoutineTemplate = {
      id: existing?.id ?? `routine-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || t('coach.customRoutineDesc'),
      workoutIds: selectedIds,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      createdBy: existing?.createdBy ?? user?.id ?? 'trainer',
    };

    if (isEdit) {
      updateRoutine(payload.id, payload);
    } else {
      addRoutine(payload);
    }

    setSaving(false);
    Alert.alert(
      t('common.success'),
      isEdit ? t('coach.routineUpdated') : t('coach.routineSaved'),
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
            {isEdit ? t('coach.editRoutineSubtitle') : t('coach.createRoutineSubtitle')}
          </Text>

          <Input
            label={t('coach.routineName')}
            value={name}
            onChangeText={setName}
            placeholder={t('coach.routineNamePlaceholder')}
          />
          <Input
            label={t('coach.workoutDescription')}
            value={description}
            onChangeText={setDescription}
            placeholder={t('coach.routineDescriptionPlaceholder')}
            multiline
          />

          <Text style={styles.label}>{t('coach.selectWorkouts')}</Text>
          {library.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>{t('coach.emptyLibrary')}</Text>
              <Button
                title={t('coach.createWorkout')}
                onPress={() => router.push('/workouts/create' as Href)}
                variant="outline"
              />
            </View>
          ) : (
            <View style={styles.selectList}>
              {library.map(workout => {
                const selected = selectedIds.includes(workout.id);
                return (
                  <TouchableOpacity
                    key={workout.id}
                    style={[styles.selectItem, selected && styles.selectItemSelected]}
                    onPress={() => toggleWorkout(workout.id)}
                  >
                    <View style={[styles.checkBox, selected && styles.checkBoxSelected]}>
                      {selected && <Check size={14} color="#fff" />}
                    </View>
                    <View style={styles.selectInfo}>
                      <Text style={styles.selectName}>{workout.name}</Text>
                      <Text style={styles.selectMeta}>
                        {workout.duration} {t('workouts.minutesShort')} ·{' '}
                        {workout.exercises.length} {t('workouts.exercises').toLowerCase()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={styles.footer}>
            <Button
              title={isEdit ? t('coach.saveChanges') : t('coach.saveRoutine')}
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
