import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useGlobalStyles } from '@/hooks/use-themed-styles';
import { useAppColors } from '@/hooks/use-app-colors';
import type { AppColors } from '@/constants/color-palettes';
import { useLanguageStore } from '@/store/language-store';
import { useThemeStore, type ThemeMode } from '@/store/theme-store';
import { Button } from '@/components/Button';

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    backButton: {
      width: 'auto',
      marginRight: theme.spacing.md,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    hint: {
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 22,
      marginBottom: theme.spacing.lg,
    },
    options: {
      gap: theme.spacing.sm,
    },
    option: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    optionSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.backgroundLight,
    },
    optionTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
    },
  });
}

export default function DarkModeSettingsScreen() {
  const router = useRouter();
  const { t } = useLanguageStore();
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const globalStyles = useGlobalStyles();
  const colors = useAppColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const options: { value: ThemeMode; title: string }[] = [
    { value: 'light', title: t('settings.modeLight') },
    { value: 'dark', title: t('settings.modeDark') },
    { value: 'system', title: t('settings.modeSystem') },
  ];

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Button
            title={t('settings.back')}
            onPress={() => router.back()}
            variant="text"
            style={styles.backButton}
          />
          <Text style={styles.title}>{t('settings.appearance')}</Text>
        </View>

        <Text style={styles.hint}>{t('settings.appearanceHint')}</Text>

        <View style={styles.options}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.option, mode === opt.value && styles.optionSelected]}
              onPress={() => setMode(opt.value)}
              activeOpacity={0.8}
            >
              <Text style={styles.optionTitle}>{opt.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
