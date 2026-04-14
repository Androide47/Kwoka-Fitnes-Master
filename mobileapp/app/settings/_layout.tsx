import React from 'react';
import { Stack } from 'expo-router';
import { useAppColors } from '@/hooks/use-app-colors';
import { useLanguageStore } from '@/store/language-store';

export default function SettingsLayout() {
  const colors = useAppColors();
  const language = useLanguageStore((s) => s.language);
  const t = useLanguageStore((s) => s.t);
  void language;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" options={{ title: t('nav.settings') }} />
      <Stack.Screen name="notifications" options={{ title: t('settings.notifications') }} />
      <Stack.Screen name="help" options={{ title: t('settings.help') }} />
      <Stack.Screen name="dark-mode" options={{ title: t('settings.appearance') }} />
      <Stack.Screen name="account" options={{ title: t('settings.accountTitle') }} />
      <Stack.Screen name="goals" options={{ title: t('settings.goalsTitle') }} />
      <Stack.Screen name="about" options={{ title: t('settings.about') }} />
    </Stack>
  );
}
