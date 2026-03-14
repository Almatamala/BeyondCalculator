export type Mode = "same" | "personalized";

export type DrinkLevel = "algo piola" | "normal" | "'algo piola'";

export type GlassType = "vaso_rojo" | "vaso_vidrio";

export interface Person {
  id: string;
  name: string;
  level: DrinkLevel;
}

export interface CalculatorState {
  mode: Mode | null;
  peopleCount: number; // used in 'same' mode
  people: Person[];    // used in 'personalized' mode
  glassType: GlassType | null;
}
