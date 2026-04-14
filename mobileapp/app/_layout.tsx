import React, { useEffect, useMemo } from 'react';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/auth-store';
import { useWorkoutStore } from '@/store/workout-store';
import { useLanguageStore } from '@/store/language-store';
import { useAppColors, useResolvedDarkMode } from '@/hooks/use-app-colors';
import { AppState, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // Add any custom fonts here if needed
  });
  
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated } = useAuthStore();
  const hydrateWorkouts = useWorkoutStore(s => s.hydrateFromApi);
  const colors = useAppColors();
  const isDark = useResolvedDarkMode();
  const language = useLanguageStore(s => s.language);
  const t = useLanguageStore(s => s.t);

  const navigationTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.card,
        text: colors.text,
        border: colors.border,
        notification: colors.secondary,
      },
    };
  }, [isDark, colors]);
  
  useEffect(() => {
    if (error) throw error;
  }, [error]);
  
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);
  
  useEffect(() => {
    // Check if the user is authenticated
    const inAuthGroup = segments[0] === '(tabs)';
    
    if (!isAuthenticated && inAuthGroup) {
      // Redirect to the login page if not authenticated
      router.replace('/login');
    } else if (isAuthenticated && segments[0] === 'login') {
      // Redirect to the home page if already authenticated
      router.replace('/');
    }
  }, [isAuthenticated, segments]);

  useEffect(() => {
    if (isAuthenticated) {
      hydrateWorkouts();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active' && useAuthStore.getState().isAuthenticated) {
        useWorkoutStore.getState().syncPastDueWorkouts();
      }
    });
    return () => sub.remove();
  }, []);
  
  if (!loaded) {
    return null;
  }
  
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <ThemeProvider value={navigationTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
            headerShadowVisible: false,
            contentStyle: {
              backgroundColor: colors.background,
            },
            // iOS: chevron-only back (no route segment like "(tabs)" as label).
            headerBackButtonDisplayMode: Platform.OS === 'ios' ? 'minimal' : undefined,
            headerBackTitleVisible: Platform.OS === 'android' ? false : undefined,
          }}
        >
          {/* `title` is used as the back label even when headerShown is false */}
          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false, title: t('nav.home') }}
          />
          <Stack.Screen
            name="login"
            options={{ headerShown: false, title: t('auth.login') }}
          />
          <Stack.Screen
            name="workouts/[id]"
            options={{
              title: t('screen.workoutDetails'),
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="workouts/create"
            options={{
              title: t('screen.createWorkout'),
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="progress/[id]"
            options={{
              title: t('screen.progressDetails'),
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="progress/photo"
            options={{
              headerShown: false,
              title: t('screen.addPhotos'),
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="progress/measurement"
            options={{
              headerShown: false,
              title: t('screen.addMeasurements'),
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="progress/note"
            options={{
              headerShown: false,
              title: t('screen.addNote'),
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="messages/[id]"
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="calendar"
            options={{ headerShown: false, title: t('nav.calendar') }}
          />
          <Stack.Screen
            name="clients/[id]"
            options={{
              title: t('screen.clientDetails'),
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              headerShown: false,
              title: t('nav.settings'),
              animation: 'slide_from_right',
            }}
          />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}