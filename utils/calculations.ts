import { GLASS_CONFIG, ICE_BAG_ML, LEVEL_RATIOS, SODA_BOTTLE_SIZES } from "@/constants/drinks";
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

export interface ReverseSuggestion {
  bebidaAddMl: number;   // 0 = no bebida suggestion
  iceAddBags: number;    // 0 = no ice suggestion
  newTotalDrinks: number;
  newDrinksPerPerson: number;
  newLeftoverDrinks: number;
}

export interface ReverseCalculationResult {
  totalDrinks: number;
  drinksPerPerson: number;
  leftoverDrinks: number;
  limitingFactor: "pisco" | "bebida" | "hielo";
  suggestion: ReverseSuggestion | null;
}

export function calculateReverseResults(reverse: ReverseState): ReverseCalculationResult {
  const empty: ReverseCalculationResult = { totalDrinks: 0, drinksPerPerson: 0, leftoverDrinks: 0, limitingFactor: "pisco", suggestion: null };
  if (!reverse.glassType) return empty;

  const glassMl = GLASS_CONFIG[reverse.glassType].ml;
  const vol = usableVolume(glassMl);
  const ratio = LEVEL_RATIOS[reverse.level];

  // Sum promo contributions
  const promoPiscoMl = reverse.promoEntries.reduce((sum, e) => sum + e.piscoSizeMl * e.count, 0);
  const promoBebidaMl = reverse.promoEntries.reduce((sum, e) => sum + e.bebidaSizeMl * e.count, 0);

  // When using promos with "done", only promo mL count (no bottle entries)
  // When using promos with "add_more", promo mL + bottle entries
  // When using "separate", no promo mL, only bottle entries
  const usePromos = reverse.reverseInputMode === "promos";
  const useBottles = !usePromos || reverse.promoExtraMode === "add_more";

  const bottlePiscoMl = useBottles ? reverse.piscoEntries.reduce((sum, e) => sum + e.sizeMl * e.count * ((e.percentageFull ?? 100) / 100), 0) : 0;
  const bottleBebidaMl = useBottles
    ? (reverse.bebidaInputMode === "bottles"
        ? reverse.bebidaEntries.reduce((sum, e) => sum + e.sizeMl * e.count * ((e.percentageFull ?? 100) / 100), 0)
        : reverse.bebidaDirectMl)
    : 0;

  const totalPiscoMl = (usePromos ? promoPiscoMl : 0) + bottlePiscoMl;
  const totalBebidaMl = (usePromos ? promoBebidaMl : 0) + bottleBebidaMl;

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

  // Suggestion: what to buy to better use the pisco capacity
  const maxFromPisco = piscoPerDrink > 0 ? Math.floor(totalPiscoMl / piscoPerDrink) : 0;
  let bebidaAddMl = 0;
  let iceAddBags = 0;

  if (maxFromPisco > totalDrinks) {
    if (bebidaPerDrink > 0) {
      const shortfall = maxFromPisco * bebidaPerDrink - totalBebidaMl;
      if (shortfall > 0) {
        const floorBottle = Math.max(0, ...SODA_BOTTLE_SIZES.filter((s) => s <= shortfall));
        const ceilCandidates = SODA_BOTTLE_SIZES.filter((s) => s >= shortfall);
        const ceilBottle = ceilCandidates.length > 0 ? Math.min(...ceilCandidates) : Math.max(...SODA_BOTTLE_SIZES);
        if (floorBottle === 0) {
          // shortfall is smaller than the smallest bottle — only suggest if shortfall ≥ 25% of that bottle
          if (shortfall >= 0.25 * ceilBottle) bebidaAddMl = ceilBottle;
        } else {
          const uncovered = shortfall - floorBottle;
          bebidaAddMl = uncovered >= 0.25 * floorBottle ? ceilBottle : floorBottle;
        }
      }
    }
    if (reverse.iceInputMode === "manual") {
      const shortfall = maxFromPisco * ICE_ML_PER_DRINK - reverse.iceKg * ICE_BAG_ML;
      if (shortfall > 0) {
        const remainder = shortfall % ICE_BAG_ML;
        iceAddBags = remainder >= 0.25 * ICE_BAG_ML
          ? Math.ceil(shortfall / ICE_BAG_ML)
          : Math.floor(shortfall / ICE_BAG_ML);
      }
    }
  }

  let suggestion: ReverseSuggestion | null = null;
  if (bebidaAddMl > 0 || iceAddBags > 0) {
    const newBebidaMl = totalBebidaMl + bebidaAddMl;
    const newDrinksFromBebida = bebidaPerDrink > 0 ? newBebidaMl / bebidaPerDrink : Infinity;
    const newDrinksFromIce =
      reverse.iceInputMode === "manual"
        ? ((reverse.iceKg + iceAddBags) * ICE_BAG_ML) / ICE_ML_PER_DRINK
        : Infinity;
    const newTotal = Math.floor(Math.min(drinksFromPisco, newDrinksFromBebida, newDrinksFromIce));
    if (newTotal > totalDrinks) {
      suggestion = {
        bebidaAddMl,
        iceAddBags,
        newTotalDrinks: newTotal,
        newDrinksPerPerson: Math.floor(newTotal / reverse.peopleCount),
        newLeftoverDrinks: newTotal % reverse.peopleCount,
      };
    }
  }

  return { totalDrinks, drinksPerPerson, leftoverDrinks, limitingFactor, suggestion };
}
