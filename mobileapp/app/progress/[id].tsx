import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { theme } from '@/constants/theme';
import { useGlobalStyles } from '@/hooks/use-themed-styles';
import { useAppColors } from '@/hooks/use-app-colors';
import type { AppColors } from '@/constants/color-palettes';
import { useProgressStore } from '@/store/progress-store';
import { useLanguageStore } from '@/store/language-store';
import { ProgressCard } from '@/components/ProgressCard';
import { formatDate } from '@/utils/date-utils';

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    scroll: { flex: 1 },
    content: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
    },
    fullNote: {
      marginTop: theme.spacing.md,
      fontSize: 16,
      lineHeight: 24,
      color: colors.text,
    },
    photoStrip: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
    extraPhoto: {
      width: 120,
      height: 120,
      borderRadius: theme.borderRadius.md,
      backgroundColor: colors.backgroundLight,
    },
    measurementBlock: {
      marginTop: theme.spacing.md,
      padding: theme.spacing.md,
      backgroundColor: colors.card,
      borderRadius: theme.borderRadius.md,
    },
    measurementRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.xs,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    measurementLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    measurementValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
  });
}

export default function ProgressEntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const globalStyles = useGlobalStyles();
  const colors = useAppColors();
  const { t } = useLanguageStore();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const entry = useProgressStore(s => s.entries.find(e => e.id === id));

  useEffect(() => {
    if (!id) return;
    if (!entry) {
      Alert.alert(t('common.error'), t('progress.entryNotFound'), [
        { text: t('common.ok'), onPress: () => router.back() },
      ]);
    }
  }, [id, entry, router, t]);

  if (!entry) {
    return (
      <SafeAreaView style={globalStyles.container} edges={['bottom', 'left', 'right']}>
        <View style={styles.content} />
      </SafeAreaView>
    );
  }

  const m = entry.measurements;
  const measurementRows: { label: string; value: string }[] = [];
  if (m?.weight != null) {
    measurementRows.push({ label: t('progress.weight'), value: `${m.weight} ${t('common.unitLbs')}` });
  }
  if (m?.bodyFat != null) {
    measurementRows.push({ label: t('progress.bodyFat'), value: `${m.bodyFat}%` });
  }
  if (m?.chest != null) {
    measurementRows.push({ label: t('progress.chest'), value: `${m.chest} ${t('common.unitIn')}` });
  }
  if (m?.waist != null) {
    measurementRows.push({ label: t('progress.waist'), value: `${m.waist} ${t('common.unitIn')}` });
  }
  if (m?.hips != null) {
    measurementRows.push({ label: t('progress.hips'), value: `${m.hips} ${t('common.unitIn')}` });
  }
  if (m?.arms != null) {
    measurementRows.push({ label: t('progress.arms'), value: `${m.arms} ${t('common.unitIn')}` });
  }
  if (m?.thighs != null) {
    measurementRows.push({ label: t('progress.thighs'), value: `${m.thighs} ${t('common.unitIn')}` });
  }
  if (m?.notes) {
    measurementRows.push({ label: t('workouts.notes'), value: m.notes });
  }

  const extraPhotos = entry.photos && entry.photos.length > 1 ? entry.photos.slice(1) : [];

  return (
    <SafeAreaView style={globalStyles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ProgressCard entry={entry} />

        {entry.type === 'note' && entry.notes ? (
          <Text style={styles.fullNote}>{entry.notes}</Text>
        ) : null}

        {entry.type === 'photo' && extraPhotos.length > 0 ? (
          <View style={styles.photoStrip}>
            {extraPhotos.map(uri => (
              <Image key={uri} source={{ uri }} style={styles.extraPhoto} contentFit="cover" />
            ))}
          </View>
        ) : null}

        {entry.type === 'measurement' && measurementRows.length > 0 ? (
          <View style={styles.measurementBlock}>
            <Text style={styles.measurementLabel}>{formatDate(entry.date)}</Text>
            {measurementRows.map(row => (
              <View key={row.label} style={styles.measurementRow}>
                <Text style={styles.measurementLabel}>{row.label}</Text>
                <Text style={styles.measurementValue}>{row.value}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
