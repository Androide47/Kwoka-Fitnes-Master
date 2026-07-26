import React from 'react';
import { Stack } from 'expo-router';
import { useLanguageStore } from '@/store/language-store';
import { useAppColors } from '@/hooks/use-app-colors';

export default function CalendarStackLayout() {
  const language = useLanguageStore(s => s.language);
  const t = useLanguageStore(s => s.t);
  const colors = useAppColors();
  void language;

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: t('calendar.createAppointmentTitle'),
        }}
      />
      <Stack.Screen
        name="book"
        options={{
          title: t('calendar.bookSession'),
        }}
      />
      <Stack.Screen
        name="block-time"
        options={{
          title: t('calendar.blockTime'),
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: t('screen.appointmentDetails'),
        }}
      />
    </Stack>
  );
}
