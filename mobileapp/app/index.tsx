import { useEffect } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { Redirect, type Href } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { useAppColors } from '@/hooks/use-app-colors';
import { useAuthHydration } from '@/hooks/use-auth-hydration';
import { appReplace } from '@/utils/navigation';

export default function Index() {
  const colors = useAppColors();
  const hydrated = useAuthHydration();
  const { isAuthenticated } = useAuthStore();
  const href = (isAuthenticated ? '/(tabs)' : '/login') as Href;

  useEffect(() => {
    if (!hydrated) return;
    if (Platform.OS === 'web') {
      appReplace(href);
    }
  }, [href, hydrated]);

  if (!hydrated || Platform.OS === 'web') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return <Redirect href={href} />;
}
