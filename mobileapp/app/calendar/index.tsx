import { Redirect } from 'expo-router';

/** Stack entry kept for deep links; main calendar lives in the center tab. */
export default function CalendarIndexRedirect() {
  return <Redirect href="/(tabs)/calendar" />;
}
