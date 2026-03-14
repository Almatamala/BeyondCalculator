import { GLASS_CONFIG, LEVEL_RATIOS } from "@/constants/drinks";
import { CalculatorState } from "@/types/calculator";

export interface CalculationResult {
  liquorMl: number;
  sodaMl: number;
}

export function calculateResults(state: CalculatorState): CalculationResult {
  if (!state.glassType) return { liquorMl: 0, sodaMl: 0 };

  const glassMl = GLASS_CONFIG[state.glassType].ml;

  if (state.mode === "personalized") {
    return state.people.reduce(
      (acc, person) => {
        const ratio = LEVEL_RATIOS[person.level];
        return {
          liquorMl: acc.liquorMl + glassMl * ratio.liquor,
          sodaMl:   acc.sodaMl   + glassMl * ratio.soda,
        };
      },
      { liquorMl: 0, sodaMl: 0 }
    );
  }

  // 'same' mode — use 'normal' as default level
  const ratio = LEVEL_RATIOS["normal"];
  return {
    liquorMl: state.peopleCount * glassMl * ratio.liquor,
    sodaMl:   state.peopleCount * glassMl * ratio.soda,
  };
}
