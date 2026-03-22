import { GLASS_CONFIG, ICE_BAG_ML, LEVEL_RATIOS, SODA_BOTTLE_SIZES } from "@/constants/drinks";
import { CalculatorState, GlassType, ReverseState } from "@/types/calculator";

// Glass is never filled to the brim
const FILL_RATIO = 0.9;

// ---------------------------------------------------------------------------
// Vaso Vidrio: frustum, r_bottom=2cm, r_top=3cm, height=11cm → ~218ml
// Ice: 2 cubes × 30ml = 60ml. Cube edge ≈ 3.107cm; max diameter 6cm < 6.21cm
// needed for two side-by-side, so both stack vertically.
// ---------------------------------------------------------------------------
const VASO_VIDRIO_R_BOTTOM   = 2;
const VASO_VIDRIO_R_TOP      = 3;
const VASO_VIDRIO_HEIGHT     = 11;
const VASO_VIDRIO_ICE_ML     = 60;
const VASO_VIDRIO_CUBE_EDGE  = Math.cbrt(30); // ≈ 3.107cm
const VASO_VIDRIO_H_ICE      = (2 * VASO_VIDRIO_CUBE_EDGE) / VASO_VIDRIO_HEIGHT; // ≈ 0.565

/** Height fraction → volume fraction for vaso vidrio (frustum). */
function vasoVidrioVf(p: number): number {
  const rB = VASO_VIDRIO_R_BOTTOM, rT = VASO_VIDRIO_R_TOP;
  const rH = rB + (rT - rB) * p;
  return (p * (rB * rB + rB * rH + rH * rH)) / (rB * rB + rB * rT + rT * rT);
}

/** Ice volume below height fraction p for vaso vidrio (2 cubes stacked). */
function vasoVidrioIceBelow(p: number): number {
  if (p <= 0)                  return 0;
  if (p >= VASO_VIDRIO_H_ICE)  return VASO_VIDRIO_ICE_ML;
  return VASO_VIDRIO_ICE_ML * (p / VASO_VIDRIO_H_ICE);
}

// ---------------------------------------------------------------------------
// Vaso Rojo: frustum, r_bottom=2.5cm, r_top=4.5cm, height=11.5cm → ~454ml
// Ice: 3 cubes × 30ml = 90ml. 1 cube at bottom, 2 side-by-side above it.
// ---------------------------------------------------------------------------
const VASO_ROJO_R_BOTTOM  = 2.5;
const VASO_ROJO_R_TOP     = 4.5;
const VASO_ROJO_HEIGHT    = 11.5;
const VASO_ROJO_ICE_ML    = 90;
const VASO_ROJO_CUBE_EDGE = Math.cbrt(30); // ≈ 3.107cm
const VASO_ROJO_H1        = VASO_ROJO_CUBE_EDGE / VASO_ROJO_HEIGHT;       // ≈ 0.270 (end of zone 1)
const VASO_ROJO_H_ICE     = (2 * VASO_ROJO_CUBE_EDGE) / VASO_ROJO_HEIGHT; // ≈ 0.540 (top of ice)

/** Height fraction → volume fraction for vaso rojo (frustum). */
function vasoRojoVf(p: number): number {
  const rB = VASO_ROJO_R_BOTTOM, rT = VASO_ROJO_R_TOP;
  const rH = rB + (rT - rB) * p;
  return (p * (rB * rB + rB * rH + rH * rH)) / (rB * rB + rB * rT + rT * rT);
}

/** Ice volume below height fraction p for vaso rojo (1 cube bottom + 2 above). */
function vasoRojoIceBelow(p: number): number {
  if (p <= 0)               return 0;
  if (p >= VASO_ROJO_H_ICE) return VASO_ROJO_ICE_ML;
  if (p <= VASO_ROJO_H1)    return 30 * (p / VASO_ROJO_H1);
  return 30 + 60 * ((p - VASO_ROJO_H1) / (VASO_ROJO_H_ICE - VASO_ROJO_H1));
}

/** Ice displaced per drink, varies by glass type. */
export function icePerDrink(glassType: GlassType): number {
  return glassType === "vaso_rojo" ? VASO_ROJO_ICE_ML : VASO_VIDRIO_ICE_ML;
}

/**
 * Returns pisco and bebida ml per drink.
 *
 * ratio.liquor is treated as the height fraction at which the pisco level sits.
 * The frustum geometry converts that height fraction to the actual liquid volume
 * below it (minus the ice occupying that same space), giving piscoMl.
 * Bebida fills the remaining usable space above the pisco line.
 *
 *   piscoMl  = clamp(0, maxPisco,  vf(p) × glassMl − iceBelow(p))
 *   bebidaMl = glassMl × 0.9 − piscoMl − iceTotalMl
 */
export function drinkVolumes(
  glassType: GlassType,
  glassMl: number,
  ratio: { liquor: number; soda: number }
): { piscoMl: number; bebidaMl: number } {
  const p = Math.max(0, Math.min(1, ratio.liquor));

  const vf:         number = glassType === "vaso_rojo" ? vasoRojoVf(p)        : vasoVidrioVf(p);
  const iceBelow:   number = glassType === "vaso_rojo" ? vasoRojoIceBelow(p)  : vasoVidrioIceBelow(p);
  const iceTotalMl: number = icePerDrink(glassType);

  const maxPisco = glassMl * FILL_RATIO - iceTotalMl;
  const piscoMl  = Math.max(0, Math.min(maxPisco, vf * glassMl - iceBelow));
  const bebidaMl = Math.max(0, glassMl * FILL_RATIO - piscoMl - iceTotalMl);
  return { piscoMl, bebidaMl };
}

export interface CalculationResult {
  liquorMl: number;
  bebidaMl: number;
  iceMl: number;
}

export function calculateResults(state: CalculatorState): CalculationResult {
  if (!state.glassType) return { liquorMl: 0, bebidaMl: 0, iceMl: 0 };

  const glassMl = GLASS_CONFIG[state.glassType].ml;

  if (state.mode === "personalized") {
    return state.people.reduce(
      (acc, person) => {
        const ratio = LEVEL_RATIOS[person.level];
        const drinks = person.drinksPerPerson;
        const { piscoMl, bebidaMl } = drinkVolumes(state.glassType!, glassMl, ratio);
        return {
          liquorMl: acc.liquorMl + drinks * piscoMl,
          bebidaMl: acc.bebidaMl + drinks * bebidaMl,
          iceMl:    acc.iceMl    + drinks * icePerDrink(state.glassType!),
        };
      },
      { liquorMl: 0, bebidaMl: 0, iceMl: 0 }
    );
  }

  // same mode
  const ratio = LEVEL_RATIOS[state.level];
  const totalDrinks = state.peopleCount * state.drinksPerPerson;
  const { piscoMl, bebidaMl } = drinkVolumes(state.glassType, glassMl, ratio);
  return {
    liquorMl: totalDrinks * piscoMl,
    bebidaMl: totalDrinks * bebidaMl,
    iceMl:    totalDrinks * icePerDrink(state.glassType),
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
  const ratio = LEVEL_RATIOS[reverse.level];
  const { piscoMl: piscoPerDrink, bebidaMl: bebidaPerDrink } = drinkVolumes(reverse.glassType, glassMl, ratio);

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

  const drinksFromPisco = piscoPerDrink > 0 ? totalPiscoMl / piscoPerDrink : Infinity;
  const drinksFromBebida = bebidaPerDrink > 0 ? totalBebidaMl / bebidaPerDrink : Infinity;

  const icePerDrinkMl = icePerDrink(reverse.glassType);
  let drinksFromIce = Infinity;
  if (reverse.iceInputMode === "manual") {
    const totalIceMl = reverse.iceKg * ICE_BAG_ML;
    drinksFromIce = totalIceMl / icePerDrinkMl;
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
      const shortfall = maxFromPisco * icePerDrinkMl - reverse.iceKg * ICE_BAG_ML;
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
        ? ((reverse.iceKg + iceAddBags) * ICE_BAG_ML) / icePerDrinkMl
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
