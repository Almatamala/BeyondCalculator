import { GLASS_CONFIG, ICE_BAG_ML, LEVEL_RATIOS } from "@/constants/drinks";
import { CalculatorState, ReverseState } from "@/types/calculator";

// Glass is never filled to the brim
const FILL_RATIO = 0.9;

// Ice per drink — used both for glass displacement and purchase calculation
const ICE_ML_PER_DRINK = 120;

/** Volume actually available for liquid after fill ratio and ice displacement */
export function usableVolume(glassMl: number): number {
  const filled = glassMl * FILL_RATIO;
  return Math.max(0, filled - ICE_ML_PER_DRINK);
}

export interface CalculationResult {
  liquorMl: number;
  bebidaMl: number;
  iceMl: number;
}

export function calculateResults(state: CalculatorState): CalculationResult {
  if (!state.glassType) return { liquorMl: 0, bebidaMl: 0, iceMl: 0 };

  const glassMl = GLASS_CONFIG[state.glassType].ml;
  const volPerDrink = usableVolume(glassMl);

  if (state.mode === "personalized") {
    return state.people.reduce(
      (acc, person) => {
        const ratio = LEVEL_RATIOS[person.level];
        const drinks = person.drinksPerPerson;
        return {
          liquorMl: acc.liquorMl + drinks * volPerDrink * ratio.liquor,
          bebidaMl: acc.bebidaMl + drinks * volPerDrink * ratio.soda,
          iceMl:    acc.iceMl    + drinks * ICE_ML_PER_DRINK,
        };
      },
      { liquorMl: 0, bebidaMl: 0, iceMl: 0 }
    );
  }

  // same mode
  const ratio = LEVEL_RATIOS[state.level];
  const totalDrinks = state.peopleCount * state.drinksPerPerson;
  return {
    liquorMl: totalDrinks * volPerDrink * ratio.liquor,
    bebidaMl: totalDrinks * volPerDrink * ratio.soda,
    iceMl:    totalDrinks * ICE_ML_PER_DRINK,
  };
}

export interface ReverseCalculationResult {
  totalDrinks: number;
  drinksPerPerson: number;
  leftoverDrinks: number;
  limitingFactor: "pisco" | "bebida" | "hielo";
}

export function calculateReverseResults(reverse: ReverseState): ReverseCalculationResult {
  const empty: ReverseCalculationResult = { totalDrinks: 0, drinksPerPerson: 0, leftoverDrinks: 0, limitingFactor: "pisco" };
  if (!reverse.glassType) return empty;

  const glassMl = GLASS_CONFIG[reverse.glassType].ml;
  const vol = usableVolume(glassMl);
  const ratio = LEVEL_RATIOS[reverse.level];

  const totalPiscoMl = reverse.piscoEntries.reduce((sum, e) => sum + e.sizeMl * e.count, 0);

  const totalBebidaMl = reverse.bebidaInputMode === "bottles"
    ? reverse.bebidaEntries.reduce((sum, e) => sum + e.sizeMl * e.count, 0)
    : reverse.bebidaDirectMl;

  const piscoPerDrink = vol * ratio.liquor;
  const bebidaPerDrink = vol * ratio.soda;

  const drinksFromPisco = piscoPerDrink > 0 ? totalPiscoMl / piscoPerDrink : Infinity;
  const drinksFromBebida = bebidaPerDrink > 0 ? totalBebidaMl / bebidaPerDrink : Infinity;

  let drinksFromIce = Infinity;
  if (reverse.iceInputMode === "manual") {
    const totalIceMl = reverse.iceKg * ICE_BAG_ML;
    drinksFromIce = ICE_ML_PER_DRINK > 0 ? totalIceMl / ICE_ML_PER_DRINK : Infinity;
  }

  const minDrinks = Math.min(drinksFromPisco, drinksFromBebida, drinksFromIce);
  const totalDrinks = Math.floor(minDrinks === Infinity ? 0 : minDrinks);

  let limitingFactor: "pisco" | "bebida" | "hielo" = "pisco";
  if (minDrinks === drinksFromBebida) limitingFactor = "bebida";
  else if (minDrinks === drinksFromIce) limitingFactor = "hielo";

  const drinksPerPerson = Math.floor(totalDrinks / reverse.peopleCount);
  const leftoverDrinks = totalDrinks % reverse.peopleCount;

  return { totalDrinks, drinksPerPerson, leftoverDrinks, limitingFactor };
}
