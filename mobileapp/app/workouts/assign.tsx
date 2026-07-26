import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useGlobalStyles } from '@/hooks/use-themed-styles';
import { useAppColors } from '@/hooks/use-app-colors';
import type { AppColors } from '@/constants/color-palettes';
import { useAuthStore } from '@/store/auth-store';
import { useWorkoutStore } from '@/store/workout-store';
import { useLanguageStore } from '@/store/language-store';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { addDaysToYmd, toLocalYmd } from '@/utils/date-utils';

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
    stepTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: theme.spacing.sm,
    },
    clientRow: {
      flexDirection: 'row',
      marginBottom: theme.spacing.lg,
    },
    clientItem: {
      alignItems: 'center',
      marginRight: theme.spacing.md,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      width: 88,
      backgroundColor: colors.card,
    },
    clientItemSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.backgroundLight,
    },
    clientName: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: theme.spacing.xs,
      textAlign: 'center',
    },
    clientNameSelected: {
      color: colors.text,
      fontWeight: '600',
    },
    dateRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    dateChip: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      minWidth: 72,
      alignItems: 'center',
    },
    dateChipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    dateChipDay: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
    },
    dateChipDaySelected: {
      color: 'rgba(255,255,255,0.85)',
    },
    dateChipNum: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginTop: 2,
    },
    dateChipNumSelected: {
      color: '#fff',
    },
    workoutItem: {
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      marginBottom: theme.spacing.sm,
    },
    workoutItemSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.backgroundLight,
    },
    workoutName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    workoutMeta: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    footer: {
      marginTop: theme.spacing.lg,
      gap: theme.spacing.sm,
      paddingBottom: theme.spacing.xl,
    },
    summary: {
      backgroundColor: colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    summaryText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    summaryStrong: {
      color: colors.text,
      fontWeight: '700',
    },
  });
}

function buildDateOptions(count: number, language: string) {
  const locale = language === 'es' ? 'es-ES' : 'en-US';
  const today = toLocalYmd(new Date());
  return Array.from({ length: count }, (_, i) => {
    const ymd = addDaysToYmd(today, i);
    const [y, m, d] = ymd.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return {
      ymd,
      dayName: date.toLocaleDateString(locale, { weekday: 'short' }),
      dayNum: date.getDate(),
      label: date.toLocaleDateString(locale, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      }),
    };
  });
}

export default function AssignRoutineScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ clientId?: string }>();
  const globalStyles = useGlobalStyles();
  const colors = useAppColors();
  const { t } = useLanguageStore();
  const language = useLanguageStore(s => s.language);
  const styles = useMemo(() => createStyles(colors), [colors]);
  const clients = useAuthStore(s => s.clients);
  const getLibraryWorkouts = useWorkoutStore(s => s.getLibraryWorkouts);
  const assignRoutineToClient = useWorkoutStore(s => s.assignRoutineToClient);
  const workoutsRaw = useWorkoutStore(s => s.workouts);

  const library = useMemo(() => getLibraryWorkouts(), [workoutsRaw, getLibraryWorkouts]);
  const dateOptions = useMemo(() => buildDateOptions(14, language), [language]);

  const [selectedClientId, setSelectedClientId] = useState(params.clientId ?? clients[0]?.id ?? '');
  const [selectedDate, setSelectedDate] = useState(dateOptions[0]?.ymd ?? toLocalYmd(new Date()));
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(library[0]?.id ?? '');

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const selectedWorkout = library.find(w => w.id === selectedWorkoutId);
  const selectedDateLabel = dateOptions.find(d => d.ymd === selectedDate)?.label ?? selectedDate;

  const handleAssign = () => {
    if (!selectedClientId) {
      Alert.alert(t('common.error'), t('coach.selectClientRequired'));
      return;
    }
    if (!selectedWorkoutId) {
      Alert.alert(t('common.error'), t('coach.selectRoutineRequired'));
      return;
    }

    const result = assignRoutineToClient({
      clientId: selectedClientId,
      templateWorkoutId: selectedWorkoutId,
      date: selectedDate,
    });

    if (!result) {
      Alert.alert(t('common.error'), t('coach.assignmentConflict'));
      return;
    }

    Alert.alert(t('common.success'), t('coach.assignmentSaved'), [
      { text: t('common.ok'), onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={globalStyles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>{t('coach.assignSubtitle')}</Text>

        <Text style={styles.stepTitle}>1. {t('coach.selectClient')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clientRow}>
          {clients.map(client => {
            const selected = client.id === selectedClientId;
            return (
              <TouchableOpacity
                key={client.id}
                style={[styles.clientItem, selected && styles.clientItemSelected]}
                onPress={() => setSelectedClientId(client.id)}
              >
                <Avatar source={client.avatar} name={client.name} size={44} />
                <Text
                  style={[styles.clientName, selected && styles.clientNameSelected]}
                  numberOfLines={2}
                >
                  {client.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.stepTitle}>2. {t('coach.selectDate')}</Text>
        <View style={styles.dateRow}>
          {dateOptions.map(opt => {
            const selected = opt.ymd === selectedDate;
            return (
              <TouchableOpacity
                key={opt.ymd}
                style={[styles.dateChip, selected && styles.dateChipSelected]}
                onPress={() => setSelectedDate(opt.ymd)}
              >
                <Text style={[styles.dateChipDay, selected && styles.dateChipDaySelected]}>
                  {opt.dayName}
                </Text>
                <Text style={[styles.dateChipNum, selected && styles.dateChipNumSelected]}>
                  {opt.dayNum}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.stepTitle}>3. {t('coach.selectRoutine')}</Text>
        {library.length === 0 ? (
          <View>
            <Text style={styles.emptyText}>{t('coach.emptyLibrary')}</Text>
            <Button
              title={t('coach.createWorkout')}
              onPress={() => router.push('/workouts/create')}
              variant="outline"
            />
          </View>
        ) : (
          library.map(workout => {
            const selected = workout.id === selectedWorkoutId;
            return (
              <TouchableOpacity
                key={workout.id}
                style={[styles.workoutItem, selected && styles.workoutItemSelected]}
                onPress={() => setSelectedWorkoutId(workout.id)}
              >
                <Text style={styles.workoutName}>{workout.name}</Text>
                <Text style={styles.workoutMeta}>
                  {workout.duration} {t('workouts.minutesShort')} · {t(`common.${workout.difficulty}`)} ·{' '}
                  {workout.exercises.length} {t('workouts.exercises').toLowerCase()}
                </Text>
              </TouchableOpacity>
            );
          })
        )}

        {selectedClient && selectedWorkout && (
          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              {t('coach.assignSummaryPrefix')}{' '}
              <Text style={styles.summaryStrong}>{selectedWorkout.name}</Text>
              {' → '}
              <Text style={styles.summaryStrong}>{selectedClient.name}</Text>
              {' · '}
              <Text style={styles.summaryStrong}>{selectedDateLabel}</Text>
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Button title={t('coach.confirmAssign')} onPress={handleAssign} />
          <Button title={t('common.cancel')} onPress={() => router.back()} variant="outline" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
