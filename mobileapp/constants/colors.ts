import { darkColors as darkPalette } from './color-palettes';

export type { AppColors } from './color-palettes';
export { darkColors, lightColors } from './color-palettes';

/** @deprecated Use useAppColors() in components */
export const colors = darkPalette;
