import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, MapPin, User, CalendarPlus, ChevronDown, ChevronUp } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import type { AppColors } from '@/constants/color-palettes';
import { Appointment } from '@/types';
import { useLanguageStore } from '@/store/language-store';
import { useAuthStore } from '@/store/auth-store';
import { getAppointmentLocationParts } from '@/utils/appointment-utils';
import { appointmentToCalendarEvent, addToDeviceCalendar, openAddressInMaps } from '@/utils/add-to-calendar';
import { formatDate, formatTime } from '@/utils/date-utils';
import { Button } from '@/components/Button';

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
      gap: theme.spacing.sm,
    },
    headerExpanded: {
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
      marginTop: theme.spacing.sm,
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
    calendarActions: {
      marginTop: theme.spacing.md,
      gap: theme.spacing.sm,
    },
  });
}

interface AppointmentCardProps {
  appointment: Appointment;
  showClientName?: boolean;
  onPress?: () => void;
  collapsible?: boolean;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  showClientName = false,
  onPress,
  collapsible = false,
}) => {
  const colors = useAppColors();
  const { t } = useLanguageStore();
  const clients = useAuthStore(s => s.clients);
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [expanded, setExpanded] = useState(false);
  const isExpanded = collapsible ? expanded : true;

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
  const locationParts = getAppointmentLocationParts(appointment.location, t);
  const mapAddress = locationParts.address;
  const clientName = clients.find(client => client.id === appointment.clientId)?.name;

  const handleHeaderPress = () => {
    if (collapsible) {
      setExpanded(prev => !prev);
      return;
    }
    onPress?.();
  };

  return (
    <View style={[styles.container, { borderLeftColor: statusColor }]}>
      <TouchableOpacity
        onPress={handleHeaderPress}
        activeOpacity={collapsible || onPress ? 0.8 : 1}
        disabled={!collapsible && !onPress}
        accessibilityRole="button"
        accessibilityState={collapsible ? { expanded: isExpanded } : undefined}
        accessibilityLabel={
          collapsible
            ? isExpanded
              ? t('calendar.collapseAppointment')
              : t('calendar.expandAppointment')
            : undefined
        }
      >
        <View style={[styles.header, isExpanded && styles.headerExpanded]}>
          <Text style={styles.title}>{appointment.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{t(`calendar.${appointment.status}`)}</Text>
          </View>
          {collapsible ? (
            isExpanded ? (
              <ChevronUp size={20} color={colors.text} />
            ) : (
              <ChevronDown size={20} color={colors.text} />
            )
          ) : null}
        </View>

        {!isExpanded ? (
          <View style={styles.detailItem}>
            <Clock size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>
              {formatDate(appointment.startTime)} • {formatTime(appointment.startTime)}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>

      {isExpanded ? (
        <>
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
                <Text style={styles.detailText}>
                  {locationParts.address
                    ? `${locationParts.sessionType} • ${locationParts.address}`
                    : locationParts.sessionType}
                </Text>
              </View>
            )}

            {showClientName && (
              <View style={styles.detailItem}>
                <User size={16} color={colors.textSecondary} />
                <Text style={styles.detailText}>{clientName ?? t('coach.unknownClient')}</Text>
              </View>
            )}
          </View>

          {appointment.status !== 'cancelled' ? (
            <View style={styles.calendarActions}>
              <Button
                title={t('calendar.addToCalendar')}
                onPress={() => void addToDeviceCalendar(appointmentToCalendarEvent(appointment, t))}
                variant="outline"
                size="small"
                icon={<CalendarPlus size={16} color={colors.primary} />}
              />
              {mapAddress ? (
                <Button
                  title={t('calendar.openInMaps')}
                  onPress={() => void openAddressInMaps(mapAddress)}
                  variant="outline"
                  size="small"
                  icon={<MapPin size={16} color={colors.primary} />}
                />
              ) : null}
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
};
