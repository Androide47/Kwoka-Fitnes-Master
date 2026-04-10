import { useColorScheme } from 'react-native';
import { darkColors, lightColors, type AppColors } from '@/constants/color-palettes';
import { useThemeStore, type ThemeMode } from '@/store/theme-store';

export function useResolvedDarkMode(): boolean {
  const mode = useThemeStore((s) => s.mode);
  const systemScheme = useColorScheme();
  if (mode === 'system') {
    return systemScheme === 'dark' || systemScheme == null;
  }
  return mode === 'dark';
}

export function useAppColors(): AppColors {
  const isDark = useResolvedDarkMode();
  return isDark ? darkColors : lightColors;
}

export function useThemeMode(): ThemeMode {
  return useThemeStore((s) => s.mode);
}
