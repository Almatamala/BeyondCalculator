export type Mode = "same" | "personalized";

export type DrinkLevel = "algo piola" | "normal" | "'algo piola'" | "desquiciado" | "personalizado";

export type GlassType = "vaso_rojo" | "vaso_vidrio";

export interface Person {
  id: string;
  name: string;
  level: DrinkLevel;
  drinksPerPerson: number;
}

export interface CalculatorState {
  mode: Mode | null;
  peopleCount: number;      // same mode
  drinksPerPerson: number;  // same mode
  level: DrinkLevel;        // same mode
  people: Person[];         // personalized mode
  glassType: GlassType | null;
}
