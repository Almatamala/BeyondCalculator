import { DrinkLevel, GlassType } from "@/types/calculator";

export const LEVEL_LABELS: Record<DrinkLevel, string> = {
  "algo piola":   "Algo piola",
  "normal":       "Normal",
  "'algo piola'": "''Algo piola''",
  "desquiciado":    "Desquiciado",
  "personalizado":  "Personalizado",
};

export let LEVEL_RATIOS: Record<DrinkLevel, { liquor: number; soda: number }> = {
  "algo piola":   { liquor: 0.3, soda: 0.7 },
  "normal":       { liquor: 0.4, soda: 0.6 },
  "'algo piola'": { liquor: 0.5, soda: 0.5 },
  "desquiciado":    { liquor: 0.7, soda: 0.3 },
  "personalizado":  { liquor: 1, soda: 0 },
};

// Single source of truth for glass types: label, volume, and image
export const GLASS_CONFIG: Record<GlassType, { label: string; ml: number; image: any }> = {
  vaso_rojo:   { label: "Vaso Rojo",   ml: 473, image: require("@/assets/images/vaso_rojo.webp") },
  vaso_vidrio: { label: "Vaso Vidrio", ml: 350, image: require("@/assets/images/vaso_vidrio.webp") },
};