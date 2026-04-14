import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useLanguageStore } from '@/store/language-store';
import { useAppColors } from '@/hooks/use-app-colors';

const backButtonStyles = StyleSheet.create({
  touch: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
});

function CalendarIndexBackButton() {
  const router = useRouter();
  const colors = useAppColors();
  const t = useLanguageStore((s) => s.t);
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };
  return (
    <TouchableOpacity
      onPress={goBack}
      style={backButtonStyles.touch}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={t('common.back')}
    >
      <ArrowLeft size={22} color={colors.text} />
    </TouchableOpacity>
  );
}

export default function CalendarStackLayout() {
  const language = useLanguageStore((s) => s.language);
  const t = useLanguageStore((s) => s.t);
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
          title: t('nav.calendar'),
          headerLeft: () => <CalendarIndexBackButton />,
          headerLeftContainerStyle: {
            alignItems: 'center',
            justifyContent: 'center',
          },
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
