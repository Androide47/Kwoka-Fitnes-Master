import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Calendar, Camera, FileText } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import type { AppColors } from '@/constants/color-palettes';
import { ProgressEntry } from '@/types';
import { useLanguageStore } from '@/store/language-store';
import { formatDate } from '@/utils/date-utils';

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      ...theme.shadows.small,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    typeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    typeText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    dateText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    content: {
      minHeight: 60,
    },
    photoContainer: {
      position: 'relative',
      height: 150,
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
    },
    photo: {
      width: '100%',
      height: '100%',
    },
    morePhotosIndicator: {
      position: 'absolute',
      bottom: 8,
      right: 8,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
    },
    morePhotosText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '600',
    },
    measurementsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
    },
    measurement: {
      minWidth: 80,
    },
    measurementLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    measurementValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    moreMeasurementsText: {
      fontSize: 14,
      color: colors.primary,
      marginTop: 8,
    },
    noteText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
  });
}

interface ProgressCardProps {
  entry: ProgressEntry;
  onPress?: () => void;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({ entry, onPress }) => {
  const colors = useAppColors();
  const { t } = useLanguageStore();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const entryTypeLabel =
    entry.type === 'photo'
      ? t('progress.photos')
      : entry.type === 'measurement'
        ? t('progress.measurements')
        : entry.type === 'note'
          ? t('progress.notes')
          : entry.type;

  const renderIcon = () => {
    switch (entry.type) {
      case 'photo':
        return <Camera size={20} color={colors.primary} />;
      case 'measurement':
        return <FileText size={20} color={colors.primary} />;
      case 'note':
        return <FileText size={20} color={colors.primary} />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (entry.type) {
      case 'photo':
        return (
          <View style={styles.photoContainer}>
            {entry.photos && entry.photos.length > 0 && (
              <Image source={{ uri: entry.photos[0] }} style={styles.photo} contentFit="cover" />
            )}
            {entry.photos && entry.photos.length > 1 && (
              <View style={styles.morePhotosIndicator}>
                <Text style={styles.morePhotosText}>+{entry.photos.length - 1}</Text>
              </View>
            )}
          </View>
        );
      case 'measurement':
        return (
          <View style={styles.measurementsContainer}>
            {entry.measurements?.weight ? (
              <View style={styles.measurement}>
                <Text style={styles.measurementLabel}>{t('progress.weight')}</Text>
                <Text style={styles.measurementValue}>
                  {entry.measurements.weight} {t('common.unitLbs')}
                </Text>
              </View>
            ) : null}
            {entry.measurements?.bodyFat && (
              <View style={styles.measurement}>
                <Text style={styles.measurementLabel}>{t('progress.bodyFat')}</Text>
                <Text style={styles.measurementValue}>{entry.measurements.bodyFat}%</Text>
              </View>
            )}
            {Object.keys(entry.measurements || {}).length > 3 && (
              <Text style={styles.moreMeasurementsText}>
                +{Object.keys(entry.measurements || {}).length - 3} {t('progress.moreMeasurements')}
              </Text>
            )}
          </View>
        );
      case 'note':
        return (
          <Text style={styles.noteText} numberOfLines={3}>
            {entry.notes}
          </Text>
        );
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          {renderIcon()}
          <Text style={styles.typeText}>{entryTypeLabel}</Text>
        </View>

        <View style={styles.dateContainer}>
          <Calendar size={16} color={colors.textSecondary} />
          <Text style={styles.dateText}>{formatDate(entry.date)}</Text>
        </View>
      </View>

      <View style={styles.content}>{renderContent()}</View>
    </TouchableOpacity>
  );
};
