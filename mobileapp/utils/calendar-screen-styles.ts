import { StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import type { AppColors } from '@/constants/color-palettes';

export function createCalendarScreenStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    calendarContainer: {
      marginBottom: theme.spacing.md,
    },
    calendarList: {
      paddingVertical: theme.spacing.sm,
    },
    dayItem: {
      width: 60,
      height: 80,
      borderRadius: theme.borderRadius.md,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.sm,
    },
    selectedDayItem: {
      backgroundColor: colors.primary,
    },
    blockedDayItem: {
      backgroundColor: colors.error,
      opacity: 0.8,
    },
    dayName: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    dayNumber: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    selectedDayText: {
      color: colors.text,
    },
    todayText: {
      color: colors.primary,
      fontWeight: '700',
    },
    blockedDayText: {
      color: colors.text,
    },
    tabsContainer: {
      flexDirection: 'row',
      marginBottom: theme.spacing.md,
      backgroundColor: colors.backgroundLight,
      borderRadius: theme.borderRadius.md,
      padding: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
      borderRadius: theme.borderRadius.sm,
    },
    activeTab: {
      backgroundColor: colors.card,
    },
    tabText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    activeTabText: {
      color: colors.text,
      fontWeight: '600',
    },
    selectedDateContainer: {
      marginBottom: theme.spacing.md,
    },
    selectedDateText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    tabContent: {
      flex: 1,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    addButton: {
      position: 'absolute',
      bottom: theme.spacing.lg,
      right: theme.spacing.lg,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.medium,
    },
    availabilityCard: {
      marginBottom: theme.spacing.md,
    },
    availabilityTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: theme.spacing.sm,
    },
    availabilityDate: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    availabilityActions: {
      gap: theme.spacing.md,
    },
    blockedTimesCard: {
      flex: 1,
    },
    blockedTimesTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: theme.spacing.md,
    },
    blockedTimeItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    blockedTimeInfo: {
      flex: 1,
    },
    blockedTimeHours: {
      fontSize: 16,
      color: colors.text,
      marginBottom: 2,
    },
    blockedTimeReason: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    unblockButton: {
      padding: theme.spacing.sm,
    },
    blockTimeButton: {
      marginTop: theme.spacing.md,
    },
  });
}
