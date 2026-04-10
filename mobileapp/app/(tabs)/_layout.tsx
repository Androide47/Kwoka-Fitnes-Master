import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, Dumbbell, BarChart, MessageCircle, User } from 'lucide-react-native';
import { useAppColors } from '@/hooks/use-app-colors';
import type { AppColors } from '@/constants/color-palettes';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';

function createTabStyles(colors: AppColors) {
  return StyleSheet.create({
    centerBtn: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 6,
    },
    centerBtnActive: {
      backgroundColor: colors.primaryLight,
      shadowOpacity: 0.5,
    },
  });
}

export default function TabLayout() {
  const { isTrainer } = useAuthStore();
  const { t } = useLanguageStore();
  const colors = useAppColors();
  const styles = useMemo(() => createTabStyles(colors), [colors]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inactive,
        tabBarStyle: {
          backgroundColor: colors.backgroundLight,
          borderTopColor: colors.border,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('nav.home'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="progress"
        options={{
          title: t('nav.progress'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => <BarChart size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="workouts"
        options={{
          title: '',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View style={[styles.centerBtn, focused && styles.centerBtnActive]}>
              <Dumbbell size={28} color="#fff" />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />

      <Tabs.Screen
        name="messages"
        options={{
          title: t('nav.messages'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: isTrainer ? t('nav.clients') : t('nav.profile'),
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
