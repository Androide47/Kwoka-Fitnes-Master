import { useEffect } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { Redirect, type Href } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { useAppColors } from '@/hooks/use-app-colors';
import { appReplace } from '@/utils/navigation';

export default function Index() {
  const colors = useAppColors();
  const { isAuthenticated } = useAuthStore();
  const href = (isAuthenticated ? '/(tabs)' : '/login') as Href;

  // GitHub Pages + baseUrl: hard navigation is more reliable than Expo Router.
  useEffect(() => {
    if (Platform.OS === 'web') {
      appReplace(href);
    }
  }, [href]);

  if (Platform.OS === 'web') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  // Native: <Redirect> waits for Root Layout; router.replace in useEffect does not.
  return <Redirect href={href} />;
}
