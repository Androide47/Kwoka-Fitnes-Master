import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Calendar, Clock } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useGlobalStyles } from '@/hooks/use-themed-styles';
import { useAppColors } from '@/hooks/use-app-colors';
import type { AppColors } from '@/constants/color-palettes';
import { useCalendarStore } from '@/store/calendar-store';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { formatDate } from '@/utils/date-utils';

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.md,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: theme.spacing.lg,
    },
    formContainer: {
      gap: theme.spacing.md,
    },
    inputGroup: {
      marginBottom: theme.spacing.md,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: theme.spacing.sm,
    },
    dateContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.backgroundLight,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dateText: {
      fontSize: 16,
      color: colors.text,
    },
    timeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    timeInput: {
      flex: 1,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    button: {
      flex: 1,
    },
  });
}

export default function BlockTimeScreen() {
  const router = useRouter();
  const { blockTime } = useCalendarStore();
  const user = useAuthStore((s) => s.user);
  const { t } = useLanguageStore();
  const globalStyles = useGlobalStyles();
  const colors = useAppColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [reason, setReason] = useState('');

  const handleBlockTime = () => {
    const startDate = new Date(date);
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    startDate.setHours(startHours, startMinutes, 0, 0);

    const endDate = new Date(date);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    endDate.setHours(endHours, endMinutes, 0, 0);

    blockTime({
      trainerId: user?.id ?? '',
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      isFullDay: false,
      reason: reason || t('calendar.defaultBlockReason'),
    });

    router.back();
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('calendar.fieldDate')}</Text>
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>{formatDate(date.toISOString())}</Text>
              <Calendar size={20} color={colors.primary} />
            </View>
          </View>

          <View style={styles.timeContainer}>
            <View style={styles.timeInput}>
              <Text style={styles.label}>{t('calendar.fieldStartTime')}</Text>
              <Input
                value={startTime}
                onChangeText={setStartTime}
                leftIcon={<Clock size={20} color={colors.textSecondary} />}
                keyboardType="numbers-and-punctuation"
              />
            </View>

            <View style={styles.timeInput}>
              <Text style={styles.label}>{t('calendar.fieldEndTime')}</Text>
              <Input
                value={endTime}
                onChangeText={setEndTime}
                leftIcon={<Clock size={20} color={colors.textSecondary} />}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('calendar.fieldReasonOptional')}</Text>
            <Input
              placeholder={t('calendar.blockReasonPlaceholder')}
              value={reason}
              onChangeText={setReason}
              multiline
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={t('common.cancel')}
              onPress={() => router.back()}
              variant="outline"
              style={styles.button}
            />

            <Button title={t('calendar.blockTime')} onPress={handleBlockTime} style={styles.button} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
