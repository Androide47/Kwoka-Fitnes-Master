import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '@/store/auth-store';
import { useAppColors } from '@/hooks/use-app-colors';
import { appReplace } from '@/utils/navigation';

export default function Index() {
  const colors = useAppColors();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    appReplace(isAuthenticated ? '/(tabs)' : '/login');
  }, [isAuthenticated]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}
