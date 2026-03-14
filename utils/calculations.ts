import { GLASS_SIZES_ML, LEVEL_RATIOS } from '@/constants/drinks';
import { CalculatorState } from '@/types/calculator';

export interface CalculationResult {
  liquorMl: number;
  sodaMl: number;
}

export function calculateResults(state: CalculatorState): CalculationResult {
  // TODO: implement calculation logic
  // Hint for 'same' mode:
  //   glassSize = GLASS_SIZES_ML[state.glassType]
  //   ratio = LEVEL_RATIOS['moderate']  (use a default level for same mode)
  //   liquorMl = state.peopleCount * glassSize * ratio.liquor
  //   sodaMl   = state.peopleCount * glassSize * ratio.soda
  //
  // Hint for 'personalized' mode:
  //   sum over state.people:
  //     liquorMl += glassSize * LEVEL_RATIOS[person.level].liquor
  //     sodaMl   += glassSize * LEVEL_RATIOS[person.level].soda

  return { liquorMl: 0, sodaMl: 0 };
}
