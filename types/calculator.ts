export type Mode = "same" | "personalized";

export type DrinkLevel = "algo piola" | "normal" | "'algo piola'" | "desquiciado" | "personalizado";

export type GlassType = "vaso_rojo" | "vaso_vidrio";

export type UseCase = "reverse" | "forward";

export type BebidaInputMode = "bottles" | "direct";

export type IceInputMode = "manual" | "auto";

export type ReverseInputMode = "promos" | "separate";

export type PromoExtraMode = "done" | "add_more";

export interface PromoEntry {
  id: string;
  piscoSizeMl: number;
  bebidaSizeMl: number;
  count: number;
}

export interface Person {
  id: string;
  name: string;
  level: DrinkLevel;
  drinksPerPerson: number;
}

export interface BottleEntry {
  id: string;
  sizeMl: number;
  count: number;
  percentageFull?: number;
}

export interface ReverseState {
  reverseInputMode: ReverseInputMode | null;
  promoEntries: PromoEntry[];
  promoExtraMode: PromoExtraMode | null;
  piscoEntries: BottleEntry[];
  bebidaInputMode: BebidaInputMode;
  bebidaEntries: BottleEntry[];
  bebidaDirectMl: number;
  iceInputMode: IceInputMode;
  iceKg: number;
  level: DrinkLevel;
  peopleCount: number;
  glassType: GlassType | null;
}

export interface CalculatorState {
  useCase: UseCase | null;
  mode: Mode | null;
  peopleCount: number;      // same mode
  drinksPerPerson: number;  // same mode
  level: DrinkLevel;        // same mode
  people: Person[];         // personalized mode
  glassType: GlassType | null;
  reverse: ReverseState;
}
