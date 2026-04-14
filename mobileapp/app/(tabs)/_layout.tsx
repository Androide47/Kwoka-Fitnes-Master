import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Tabs } from 'expo-router';
import { Home, BarChart, MessageCircle, User } from 'lucide-react-native';
import { useAppColors } from '@/hooks/use-app-colors';
import type { AppColors } from '@/constants/color-palettes';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';

const WORKOUTS_TAB_LOGO = require('@/assets/images/KowkaLogo_#g20174-8_mediumSizeWhiteBackground.png');

function createTabStyles(colors: AppColors) {
  return StyleSheet.create({
    centerBtn: {
      width: 68,
      height: 68,
      borderRadius: 34,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
      backgroundColor: colors.backgroundLight,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
    centerBtnActive: {
      opacity: 0.92,
      borderColor: colors.primary,
    },
    centerBtnImage: {
      width: 62,
      height: 62,
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
        // Fully opaque so iOS never composites native black between tab bar and scene on overscroll.
        sceneStyle: {
          backgroundColor: colors.background,
        },
        tabBarStyle: {
          backgroundColor: colors.backgroundLight,
          borderTopColor: colors.border,
          height: 90,
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
              <Image
                source={WORKOUTS_TAB_LOGO}
                style={styles.centerBtnImage}
                contentFit="contain"
                accessibilityLabel={t('nav.workouts')}
              />
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
