import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { useAppColors } from '@/hooks/use-app-colors';

export default function Index() {
  const router = useRouter();
  const colors = useAppColors();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Prefer replace over <Redirect> so GitHub Pages + experiments.baseUrl
    // resolve routes correctly on static web export.
    router.replace(isAuthenticated ? '/(tabs)' : '/login');
  }, [isAuthenticated, router]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}
