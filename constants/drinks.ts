import { DrinkLevel, GlassType } from '@/types/calculator';

export const GLASS_SIZES_ML: Record<GlassType, number> = {
  highball: 350,
  rocks: 250,
  shot: 60,
  pint: 500,
};

export const LEVEL_RATIOS: Record<DrinkLevel, { liquor: number; soda: number }> = {
  light:    { liquor: 0.2, soda: 0.8 },
  moderate: { liquor: 0.3, soda: 0.7 },
  heavy:    { liquor: 0.4, soda: 0.6 },
};

export const LEVEL_LABELS: Record<DrinkLevel, string> = {
  light:    'Light',
  moderate: 'Moderate',
  heavy:    'Heavy',
};

export const GLASS_LABELS: Record<GlassType, string> = {
  highball: 'Highball (350ml)',
  rocks:    'Rocks (250ml)',
  shot:     'Shot (60ml)',
  pint:     'Pint (500ml)',
};
