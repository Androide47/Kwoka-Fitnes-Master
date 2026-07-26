import { StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import type { AppColors } from '@/constants/color-palettes';

export function createCoachHomeStyles(colors: AppColors) {
  return StyleSheet.create({
    scrollView: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
    },
    header: {
      marginBottom: theme.spacing.lg,
    },
    eyebrow: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primary,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    greeting: {
      fontSize: 26,
      fontWeight: '700',
      color: colors.text,
    },
    date: {
      fontSize: 15,
      color: colors.textSecondary,
      marginTop: 4,
    },
    statsRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      alignItems: 'center',
      ...theme.shadows.small,
    },
    statValue: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.primary,
    },
    statLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 4,
      textAlign: 'center',
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    sectionLink: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    actionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    actionTile: {
      width: '48%',
      flexGrow: 1,
      backgroundColor: colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      minHeight: 96,
      justifyContent: 'space-between',
      ...theme.shadows.small,
    },
    actionTilePrimary: {
      backgroundColor: colors.primary,
    },
    actionIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.backgroundLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    actionIconWrapOnPrimary: {
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    actionLabel: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    actionLabelOnPrimary: {
      color: '#fff',
    },
    actionHint: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    actionHintOnPrimary: {
      color: 'rgba(255,255,255,0.85)',
    },
    listCard: {
      backgroundColor: colors.card,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      marginBottom: theme.spacing.lg,
      ...theme.shadows.small,
    },
    listRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      gap: theme.spacing.sm,
    },
    listRowLast: {
      borderBottomWidth: 0,
    },
    listBody: {
      flex: 1,
    },
    listTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    listSubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    unreadBadge: {
      minWidth: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 6,
    },
    unreadBadgeText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '700',
    },
    emptyBox: {
      backgroundColor: colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    mediaStrip: {
      marginBottom: theme.spacing.lg,
    },
    mediaThumb: {
      width: 88,
      height: 110,
      borderRadius: theme.borderRadius.md,
      marginRight: theme.spacing.sm,
      backgroundColor: colors.backgroundLight,
      overflow: 'hidden',
    },
    mediaImage: {
      width: '100%',
      height: '100%',
    },
    mediaCaption: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 6,
      paddingVertical: 4,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    mediaCaptionText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: '600',
    },
    sessionActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    sessionChip: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: colors.card,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sessionChipText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
  });
}
