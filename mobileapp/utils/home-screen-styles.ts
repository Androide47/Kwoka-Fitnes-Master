import { StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import type { AppColors } from '@/constants/color-palettes';

export function createHomeScreenStyles(colors: AppColors) {
  return StyleSheet.create({
    scrollView: {
      flex: 1,
      padding: theme.spacing.md,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    greeting: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    date: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    weekContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.small,
    },
    dayColumn: {
      alignItems: 'center',
      gap: 8,
    },
    dayText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    todayText: {
      color: colors.primary,
      fontWeight: '700',
    },
    dayCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.backgroundLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dayCircleActive: {
      backgroundColor: colors.primary,
    },
    dayCircleToday: {
      borderWidth: 2,
      borderColor: colors.primary,
      backgroundColor: 'transparent',
    },
    todayIndicator: {
      color: colors.primary,
      fontSize: 20,
      fontWeight: '700',
      marginTop: -2,
    },
    todayWorkoutContainer: {
      marginBottom: theme.spacing.lg,
    },
    upcomingList: {
      gap: theme.spacing.md,
    },
    upcomingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      gap: theme.spacing.md,
    },
    upcomingDate: {
      alignItems: 'center',
      backgroundColor: colors.backgroundLight,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: theme.borderRadius.sm,
      width: 50,
    },
    upcomingDayName: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    upcomingDayNum: {
      fontSize: 18,
      color: colors.text,
      fontWeight: '700',
    },
    upcomingContent: {
      flex: 1,
    },
    upcomingTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    upcomingSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    achievementCard: {
      marginBottom: theme.spacing.lg,
    },
    achievementHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    achievementTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginLeft: theme.spacing.sm,
    },
    achievementContent: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    achievementItem: {
      alignItems: 'center',
    },
    achievementValue: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.primary,
    },
    achievementLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    statsCard: {
      backgroundColor: colors.backgroundLight,
      marginBottom: theme.spacing.lg,
    },
    statsTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: theme.spacing.md,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.primary,
    },
    statLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: theme.spacing.md,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    welcomeCard: {
      position: 'absolute',
      top: 100,
      left: 20,
      right: 20,
      backgroundColor: colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      ...theme.shadows.medium,
      zIndex: 1000,
    },
    welcomeContent: {
      alignItems: 'center',
    },
    welcomeTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    welcomeText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: theme.spacing.lg,
      textAlign: 'center',
      lineHeight: 22,
    },
    welcomeTips: {
      alignSelf: 'stretch',
      marginBottom: theme.spacing.lg,
    },
    welcomeTip: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    welcomeTipIcon: {
      marginRight: theme.spacing.sm,
    },
    welcomeTipText: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
    },
    welcomeButton: {
      backgroundColor: colors.primary,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
    },
    welcomeButtonText: {
      color: colors.text,
      fontWeight: '600',
      fontSize: 16,
    },
    tipsCard: {
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    tipsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    tipsTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginLeft: theme.spacing.sm,
    },
    tipsList: {
      gap: theme.spacing.sm,
    },
    tipItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    tipBullet: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginTop: 6,
      marginRight: theme.spacing.sm,
    },
    tipText: {
      fontSize: 14,
      color: colors.textSecondary,
      flex: 1,
      lineHeight: 20,
    },
  });
}
