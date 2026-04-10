import { StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import type { AppColors } from '@/constants/color-palettes';

export function createProgressTabStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.md,
    },
    clientSelector: {
      marginBottom: theme.spacing.md,
    },
    clientSelectorTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: theme.spacing.sm,
    },
    clientList: {
      paddingVertical: theme.spacing.sm,
    },
    clientItem: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      backgroundColor: colors.card,
      marginRight: theme.spacing.sm,
    },
    clientItemSelected: {
      backgroundColor: colors.primary,
    },
    clientItemText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    clientItemTextSelected: {
      color: colors.text,
    },
    tabContainer: {
      flexDirection: 'row',
      marginBottom: theme.spacing.md,
      backgroundColor: colors.backgroundLight,
      borderRadius: theme.borderRadius.md,
      padding: 4,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      gap: 4,
    },
    activeTab: {
      backgroundColor: colors.card,
    },
    tabText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    activeTabText: {
      color: colors.text,
      fontWeight: '600',
    },
    yearSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
      gap: theme.spacing.lg,
    },
    yearButton: {
      padding: theme.spacing.sm,
    },
    yearText: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      minWidth: 60,
      textAlign: 'center',
    },
    monthSection: {
      marginBottom: theme.spacing.xl,
    },
    monthTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    monthDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: theme.spacing.md,
    },
    listContent: {
      paddingBottom: theme.spacing.xl * 2,
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
    fabContainer: {
      position: 'absolute',
      bottom: theme.spacing.lg,
      right: theme.spacing.lg,
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    fab: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.medium,
    },
  });
}
