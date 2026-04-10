import { useMemo } from 'react';
import { createGlobalStyles, createTypography } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';

export function useGlobalStyles() {
  const colors = useAppColors();
  return useMemo(() => createGlobalStyles(colors), [colors]);
}

export function useTypography() {
  const colors = useAppColors();
  return useMemo(() => createTypography(colors), [colors]);
}
