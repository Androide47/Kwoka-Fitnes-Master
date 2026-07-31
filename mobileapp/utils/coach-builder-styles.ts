import { StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import type { AppColors } from '@/constants/color-palettes';

/** Shared styles for coach create/assign/library builder screens. */
export function createCoachBuilderStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.md,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: theme.spacing.lg,
      lineHeight: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: theme.spacing.sm,
    },
    difficultyRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    chip: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      backgroundColor: colors.card,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    chipTextActive: {
      color: '#fff',
    },
    selectList: {
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    selectItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      gap: theme.spacing.sm,
    },
    selectItemSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.backgroundLight,
    },
    selectInfo: {
      flex: 1,
    },
    selectName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    selectMeta: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    checkBox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkBoxSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    emptyBox: {
      padding: theme.spacing.lg,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    footer: {
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    libraryCard: {
      backgroundColor: colors.card,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.small,
    },
    libraryCardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    libraryTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
    },
    libraryMeta: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
      lineHeight: 18,
    },
    libraryActions: {
      flexDirection: 'row',
      gap: 4,
    },
    iconButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.sm,
    },
    badge: {
      backgroundColor: colors.backgroundLight,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    tabsContainer: {
      flexDirection: 'row',
      marginBottom: theme.spacing.md,
      backgroundColor: colors.card,
      borderRadius: theme.borderRadius.md,
      padding: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: theme.borderRadius.sm,
    },
    activeTab: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    activeTabText: {
      color: '#fff',
    },
  });
}
