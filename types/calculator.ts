export type Mode = 'same' | 'personalized';

export type DrinkLevel = 'light' | 'moderate' | 'heavy';

export type GlassType = 'highball' | 'rocks' | 'shot' | 'pint';

export interface Person {
  id: string;
  level: DrinkLevel;
}

export interface CalculatorState {
  mode: Mode | null;
  peopleCount: number;   // used in 'same' mode
  people: Person[];      // used in 'personalized' mode
  glassType: GlassType | null;
}
