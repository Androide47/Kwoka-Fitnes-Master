import { StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import type { AppColors } from '@/constants/color-palettes';

export function createClientDetailStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.md,
    },
    header: {
      marginBottom: theme.spacing.md,
    },
    profileHeader: {
      flexDirection: 'row',
      marginBottom: theme.spacing.md,
    },
    profileInfo: {
      marginLeft: theme.spacing.md,
      flex: 1,
      justifyContent: 'center',
    },
    name: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    email: {
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
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: colors.backgroundLight,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.sm,
    },
    profileActionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tabs: {
      flexDirection: 'row',
      backgroundColor: colors.backgroundLight,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.md,
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
    tabContent: {
      flex: 1,
    },
    analyticsCard: {
      marginBottom: theme.spacing.md,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: theme.spacing.md,
    },
    analyticsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    analyticsItem: {
      width: '48%',
      backgroundColor: colors.backgroundLight,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      alignItems: 'center',
    },
    analyticsValue: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: 4,
    },
    analyticsLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    lastActive: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    progressSummary: {
      backgroundColor: colors.backgroundLight,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
    },
    progressSummaryTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: theme.spacing.sm,
    },
    progressItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    progressLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    progressValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    positiveChange: {
      color: colors.success,
    },
    negativeChange: {
      color: colors.error,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    seeAllText: {
      fontSize: 14,
      color: colors.primary,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    goalsContainer: {
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    goalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
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
    addButton: {
      marginTop: theme.spacing.sm,
    },
    tabActions: {
      marginBottom: theme.spacing.md,
    },
    tabPanelButton: {
      marginBottom: theme.spacing.sm,
    },
  });
}
