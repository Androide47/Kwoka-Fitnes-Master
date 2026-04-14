import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useGlobalStyles } from '@/hooks/use-themed-styles';
import { useAppColors } from '@/hooks/use-app-colors';
import type { AppColors } from '@/constants/color-palettes';
import { useLanguageStore } from '@/store/language-store';
import { Button } from '@/components/Button';

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.md,
    },
    message: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.textSecondary,
      marginBottom: theme.spacing.lg,
    },
  });
}

export default function CreateWorkoutScreen() {
  const router = useRouter();
  const globalStyles = useGlobalStyles();
  const colors = useAppColors();
  const { t } = useLanguageStore();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={globalStyles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.container}>
        <Text style={styles.message}>{t('workouts.createWorkoutComingSoon')}</Text>
        <Button title={t('common.back')} onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}
