import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useGlobalStyles } from '@/hooks/use-themed-styles';
import { useAppColors } from '@/hooks/use-app-colors';
import { useAuthStore } from '@/store/auth-store';
import { useWorkoutStore } from '@/store/workout-store';
import { useLanguageStore } from '@/store/language-store';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { createCoachBuilderStyles } from '@/utils/coach-builder-styles';
import { addDaysToYmd, toLocalYmd } from '@/utils/date-utils';
import { StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import type { AppColors } from '@/constants/color-palettes';

function createAssignStyles(colors: AppColors) {
  const base = createCoachBuilderStyles(colors);
  return {
    ...base,
    ...StyleSheet.create({
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
      stepTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: theme.spacing.sm,
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
      routineItem: {
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        marginBottom: theme.spacing.sm,
      },
      routineItemSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.backgroundLight,
      },
      routineName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
      },
      routineMeta: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 4,
      },
    }),
  };
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
  const styles = useMemo(() => createAssignStyles(colors), [colors]);
  const clients = useAuthStore(s => s.clients);
  const routines = useWorkoutStore(s => s.routines);
  const getWorkoutById = useWorkoutStore(s => s.getWorkoutById);
  const assignRoutineTemplateToClient = useWorkoutStore(s => s.assignRoutineTemplateToClient);

  const dateOptions = useMemo(() => buildDateOptions(14, language), [language]);
  const routineList = routines ?? [];

  const [selectedClientId, setSelectedClientId] = useState(params.clientId ?? clients[0]?.id ?? '');
  const [selectedDate, setSelectedDate] = useState(dateOptions[0]?.ymd ?? toLocalYmd(new Date()));
  const [selectedRoutineId, setSelectedRoutineId] = useState(routineList[0]?.id ?? '');

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const selectedRoutine = routineList.find(r => r.id === selectedRoutineId);
  const selectedDateLabel = dateOptions.find(d => d.ymd === selectedDate)?.label ?? selectedDate;

  const handleAssign = () => {
    if (!selectedClientId) {
      Alert.alert(t('common.error'), t('coach.selectClientRequired'));
      return;
    }
    if (!selectedRoutineId) {
      Alert.alert(t('common.error'), t('coach.selectRoutineRequired'));
      return;
    }

    const result = assignRoutineTemplateToClient({
      clientId: selectedClientId,
      routineId: selectedRoutineId,
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
        {routineList.length === 0 ? (
          <View>
            <Text style={styles.emptyText}>{t('coach.emptyRoutines')}</Text>
            <Button
              title={t('coach.createRoutine')}
              onPress={() => router.push('/workouts/create-routine' as Href)}
              variant="outline"
            />
          </View>
        ) : (
          routineList.map(routine => {
            const selected = routine.id === selectedRoutineId;
            return (
              <TouchableOpacity
                key={routine.id}
                style={[styles.routineItem, selected && styles.routineItemSelected]}
                onPress={() => setSelectedRoutineId(routine.id)}
              >
                <Text style={styles.routineName}>{routine.name}</Text>
                <Text style={styles.routineMeta}>
                  {routine.workoutIds.length}{' '}
                  {routine.workoutIds.length === 1
                    ? t('coach.workoutSingular')
                    : t('coach.workoutPlural')}
                  {' · '}
                  {routine.workoutIds
                    .map(wid => getWorkoutById(wid)?.name ?? wid)
                    .join(', ')}
                </Text>
              </TouchableOpacity>
            );
          })
        )}

        {selectedClient && selectedRoutine && (
          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              {t('coach.assignSummaryPrefix')}{' '}
              <Text style={styles.summaryStrong}>{selectedRoutine.name}</Text>
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
