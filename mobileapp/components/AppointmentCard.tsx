import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, MapPin, User } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import type { AppColors } from '@/constants/color-palettes';
import { Appointment } from '@/types';
import { useLanguageStore } from '@/store/language-store';
import { formatDate, formatTime } from '@/utils/date-utils';

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderLeftWidth: 4,
      ...theme.shadows.small,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
    description: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    details: {
      gap: theme.spacing.sm,
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    detailText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
  });
}

interface AppointmentCardProps {
  appointment: Appointment;
  showClientName?: boolean;
  onPress?: () => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  showClientName = false,
  onPress,
}) => {
  const colors = useAppColors();
  const { t } = useLanguageStore();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return colors.primary;
      case 'completed':
        return colors.success;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const statusColor = getStatusColor(appointment.status);

  return (
    <TouchableOpacity
      style={[styles.container, { borderLeftColor: statusColor }]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{appointment.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{t(`calendar.${appointment.status}`)}</Text>
        </View>
      </View>

      {appointment.description && (
        <Text style={styles.description} numberOfLines={2}>
          {appointment.description}
        </Text>
      )}

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Clock size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>
            {formatDate(appointment.startTime)} • {formatTime(appointment.startTime)} -{' '}
            {formatTime(appointment.endTime)}
          </Text>
        </View>

        {appointment.location && (
          <View style={styles.detailItem}>
            <MapPin size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>{appointment.location}</Text>
          </View>
        )}

        {showClientName && (
          <View style={styles.detailItem}>
            <User size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>
              {t('clients.clientIdLabel')}: {appointment.clientId}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};
