import { useEffect } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAppColors } from '@/hooks/use-app-colors';
import { appReplace } from '@/utils/navigation';

/** Stack entry kept for deep links; main calendar lives in the center tab. */
export default function CalendarIndexRedirect() {
  const colors = useAppColors();

  useEffect(() => {
    if (Platform.OS === 'web') {
      appReplace('/(tabs)/calendar');
    }
  }, []);

  if (Platform.OS === 'web') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return <Redirect href="/(tabs)/calendar" />;
}
