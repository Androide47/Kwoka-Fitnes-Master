import { StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import type { AppColors } from '@/constants/color-palettes';

export function createProfileScreenStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.md,
    },
    scrollView: {
      flex: 1,
      padding: theme.spacing.md,
    },
    profileHeader: {
      flexDirection: 'row',
      marginBottom: theme.spacing.lg,
    },
    profileInfo: {
      marginLeft: theme.spacing.md,
      flex: 1,
      justifyContent: 'center',
    },
    profileName: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    profileEmail: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    streakContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    streakLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginRight: theme.spacing.sm,
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.lg,
    },
    actionButton: {
      alignItems: 'center',
      width: '22%',
    },
    actionIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    actionText: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: theme.spacing.md,
    },
    measurementsCard: {
      marginBottom: theme.spacing.md,
    },
    measurementsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
    },
    measurementItem: {
      width: '45%',
    },
    measurementLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    measurementValue: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    goalsCard: {
      marginBottom: theme.spacing.lg,
    },
    goalsList: {
      gap: theme.spacing.sm,
    },
    goalItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    goalBullet: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginRight: theme.spacing.sm,
    },
    goalText: {
      fontSize: 16,
      color: colors.text,
    },
    settingsButtons: {
      marginBottom: theme.spacing.xl,
    },
    settingsButton: {
      marginBottom: theme.spacing.md,
    },
    logoutButton: {
      borderColor: colors.error,
    },
    trainerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    trainerInfo: {
      flex: 1,
    },
    trainerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    trainerSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    trainerActions: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    trainerAction: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.backgroundLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    clientsList: {
      paddingBottom: theme.spacing.md,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    calendarButton: {
      width: '100%',
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    editButtonText: {
      color: colors.primary,
      fontWeight: '600',
      fontSize: 14,
    },
  });
}
