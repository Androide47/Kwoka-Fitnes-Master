import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { theme } from '@/constants/theme';
import { useGlobalStyles } from '@/hooks/use-themed-styles';
import { useAppColors } from '@/hooks/use-app-colors';
import type { AppColors } from '@/constants/color-palettes';
import { useLanguageStore } from '@/store/language-store';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

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
    name: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginBottom: theme.spacing.sm,
    },
    tagline: {
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 24,
      marginBottom: theme.spacing.lg,
    },
    metaLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    metaValue: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '600',
    },
    metaRow: {
      marginBottom: theme.spacing.md,
    },
  });
}

export default function AboutScreen() {
  const router = useRouter();
  const { t } = useLanguageStore();
  const globalStyles = useGlobalStyles();
  const colors = useAppColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const version = Constants.expoConfig?.version ?? '1.0.0';
  const build =
    Constants.nativeBuildVersion ??
    Constants.expoConfig?.ios?.buildNumber ??
    Constants.expoConfig?.android?.versionCode?.toString() ??
    '—';

  return (
    <SafeAreaView style={globalStyles.container}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Button
            title={t('settings.back')}
            onPress={() => router.back()}
            variant="text"
            style={styles.backButton}
          />
          <Text style={styles.title}>{t('settings.about')}</Text>
        </View>

        <Card>
          <Text style={styles.name}>{t('app.name')}</Text>
          <Text style={styles.tagline}>{t('settings.aboutTagline')}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{t('settings.aboutVersion')}</Text>
            <Text style={styles.metaValue}>{version}</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{t('settings.aboutBuild')}</Text>
            <Text style={styles.metaValue}>{String(build)}</Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
