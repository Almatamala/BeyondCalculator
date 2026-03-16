import { GLASS_CONFIG, LEVEL_RATIOS } from "@/constants/drinks";
import { CalculatorState } from "@/types/calculator";

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
