import {
  calculateResults,
  calculateReverseResults,
  usableVolume,
} from "@/utils/calculations";
import { CalculatorState, ReverseState } from "@/types/calculator";

// ─── Constants (mirrors src) ─────────────────────────────────────────────────
const FILL_RATIO = 0.9;
const ICE_ML_PER_DRINK = 120;
const ICE_BAG_ML = 1090;

const VASO_ROJO_ML = 473;
const VASO_VIDRIO_ML = 350;

const VOL_ROJO = VASO_ROJO_ML * FILL_RATIO - ICE_ML_PER_DRINK;   // 305.7
const VOL_VIDRIO = VASO_VIDRIO_ML * FILL_RATIO - ICE_ML_PER_DRINK; // 195

// ─── Helpers ─────────────────────────────────────────────────────────────────

function baseSameState(overrides: Partial<CalculatorState> = {}): CalculatorState {
  return {
    useCase: "forward",
    mode: "same",
    peopleCount: 2,
    drinksPerPerson: 3,
    level: "normal",
    glassType: "vaso_rojo",
    people: [],
    reverse: baseReverseState(),
    ...overrides,
  };
}

function baseReverseState(overrides: Partial<ReverseState> = {}): ReverseState {
  return {
    reverseInputMode: "separate",
    promoEntries: [],
    promoExtraMode: null,
    piscoEntries: [{ id: "1", sizeMl: 1000, count: 1 }],
    bebidaInputMode: "bottles",
    bebidaEntries: [{ id: "2", sizeMl: 1500, count: 1 }],
    bebidaDirectMl: 0,
    iceInputMode: "auto",
    iceKg: 0,
    level: "normal",
    peopleCount: 2,
    glassType: "vaso_rojo",
    ...overrides,
  };
}

// ─── usableVolume ─────────────────────────────────────────────────────────────

describe("usableVolume", () => {
  test("vaso rojo (473 ml)", () => {
    expect(usableVolume(VASO_ROJO_ML)).toBeCloseTo(VOL_ROJO, 5);
  });

  test("vaso vidrio (350 ml)", () => {
    expect(usableVolume(VASO_VIDRIO_ML)).toBeCloseTo(VOL_VIDRIO, 5);
  });

  test("returns 0 when glass is too small for ice", () => {
    // filled = 100 * 0.9 = 90 < 120 → usable = 0
    expect(usableVolume(100)).toBe(0);
  });

  test("glass at the ice threshold returns 0", () => {
    // glassMl = 133 → filled = 119.7 < 120 → max(0, -0.3) = 0
    expect(usableVolume(Math.floor(ICE_ML_PER_DRINK / FILL_RATIO))).toBe(0);
  });
});

// ─── calculateResults — forward (same mode) ──────────────────────────────────

describe("calculateResults — same mode", () => {
  test("returns zeros when no glass is selected", () => {
    const result = calculateResults(baseSameState({ glassType: null }));
    expect(result).toEqual({ liquorMl: 0, bebidaMl: 0, iceMl: 0 });
  });

  test("basic: 4 people × 2 drinks, normal, vaso_rojo", () => {
    const totalDrinks = 8;
    const result = calculateResults(
      baseSameState({ peopleCount: 4, drinksPerPerson: 2, level: "normal" }),
    );
    expect(result.liquorMl).toBeCloseTo(totalDrinks * VOL_ROJO * 0.4, 5);
    expect(result.bebidaMl).toBeCloseTo(totalDrinks * VOL_ROJO * 0.6, 5);
    expect(result.iceMl).toBeCloseTo(totalDrinks * ICE_ML_PER_DRINK, 5);
  });

  test("3 people × 4 drinks, algo piola, vaso_vidrio", () => {
    const totalDrinks = 12;
    const result = calculateResults(
      baseSameState({
        peopleCount: 3,
        drinksPerPerson: 4,
        level: "algo piola",
        glassType: "vaso_vidrio",
      }),
    );
    expect(result.liquorMl).toBeCloseTo(totalDrinks * VOL_VIDRIO * 0.3, 5);
    expect(result.bebidaMl).toBeCloseTo(totalDrinks * VOL_VIDRIO * 0.7, 5);
    expect(result.iceMl).toBeCloseTo(totalDrinks * ICE_ML_PER_DRINK, 5);
  });

  test("2 people × 3 drinks, desquiciado, vaso_rojo", () => {
    const totalDrinks = 6;
    const result = calculateResults(
      baseSameState({ peopleCount: 2, drinksPerPerson: 3, level: "desquiciado" }),
    );
    expect(result.liquorMl).toBeCloseTo(totalDrinks * VOL_ROJO * 0.7, 5);
    expect(result.bebidaMl).toBeCloseTo(totalDrinks * VOL_ROJO * 0.3, 5);
    expect(result.iceMl).toBeCloseTo(totalDrinks * ICE_ML_PER_DRINK, 5);
  });

  test("personalizado level: all liquor, no soda", () => {
    const totalDrinks = 2;
    const result = calculateResults(
      baseSameState({ peopleCount: 1, drinksPerPerson: 2, level: "personalizado" }),
    );
    expect(result.liquorMl).toBeCloseTo(totalDrinks * VOL_ROJO * 1, 5);
    expect(result.bebidaMl).toBeCloseTo(0, 5);
    expect(result.iceMl).toBeCloseTo(totalDrinks * ICE_ML_PER_DRINK, 5);
  });

  test("'algo piola' level (0.5 / 0.5)", () => {
    const totalDrinks = 4;
    const result = calculateResults(
      baseSameState({ peopleCount: 2, drinksPerPerson: 2, level: "'algo piola'" }),
    );
    expect(result.liquorMl).toBeCloseTo(totalDrinks * VOL_ROJO * 0.5, 5);
    expect(result.bebidaMl).toBeCloseTo(totalDrinks * VOL_ROJO * 0.5, 5);
  });

  test("1 person × 1 drink is the minimal unit", () => {
    const result = calculateResults(
      baseSameState({ peopleCount: 1, drinksPerPerson: 1, level: "normal" }),
    );
    expect(result.liquorMl).toBeCloseTo(VOL_ROJO * 0.4, 5);
    expect(result.bebidaMl).toBeCloseTo(VOL_ROJO * 0.6, 5);
    expect(result.iceMl).toBe(ICE_ML_PER_DRINK);
  });

  test("scales linearly with drinks", () => {
    const base = calculateResults(baseSameState({ peopleCount: 1, drinksPerPerson: 1 }));
    const double = calculateResults(baseSameState({ peopleCount: 2, drinksPerPerson: 1 }));
    expect(double.liquorMl).toBeCloseTo(base.liquorMl * 2, 5);
    expect(double.bebidaMl).toBeCloseTo(base.bebidaMl * 2, 5);
    expect(double.iceMl).toBe(base.iceMl * 2);
  });
});

// ─── calculateResults — forward (personalized mode) ──────────────────────────

describe("calculateResults — personalized mode", () => {
  test("single person uses their own level", () => {
    const result = calculateResults({
      ...baseSameState(),
      mode: "personalized",
      glassType: "vaso_rojo",
      people: [{ id: "a", name: "Ana", level: "desquiciado", drinksPerPerson: 2 }],
    });
    expect(result.liquorMl).toBeCloseTo(2 * VOL_ROJO * 0.7, 5);
    expect(result.bebidaMl).toBeCloseTo(2 * VOL_ROJO * 0.3, 5);
    expect(result.iceMl).toBe(2 * ICE_ML_PER_DRINK);
  });

  test("three people with different levels sum correctly", () => {
    const result = calculateResults({
      ...baseSameState(),
      mode: "personalized",
      glassType: "vaso_rojo",
      people: [
        { id: "a", name: "Ana",    level: "algo piola",  drinksPerPerson: 2 },
        { id: "b", name: "Bruno",  level: "normal",      drinksPerPerson: 3 },
        { id: "c", name: "Camila", level: "desquiciado", drinksPerPerson: 1 },
      ],
    });
    const expectedLiquor =
      2 * VOL_ROJO * 0.3 +
      3 * VOL_ROJO * 0.4 +
      1 * VOL_ROJO * 0.7;
    const expectedBebida =
      2 * VOL_ROJO * 0.7 +
      3 * VOL_ROJO * 0.6 +
      1 * VOL_ROJO * 0.3;
    const expectedIce = (2 + 3 + 1) * ICE_ML_PER_DRINK;

    expect(result.liquorMl).toBeCloseTo(expectedLiquor, 5);
    expect(result.bebidaMl).toBeCloseTo(expectedBebida, 5);
    expect(result.iceMl).toBeCloseTo(expectedIce, 5);
  });

  test("empty people list returns zeros", () => {
    const result = calculateResults({
      ...baseSameState(),
      mode: "personalized",
      people: [],
    });
    expect(result).toEqual({ liquorMl: 0, bebidaMl: 0, iceMl: 0 });
  });

  test("personalizado level person contributes no soda", () => {
    const result = calculateResults({
      ...baseSameState(),
      mode: "personalized",
      glassType: "vaso_rojo",
      people: [
        { id: "a", name: "Solo pisco", level: "personalizado", drinksPerPerson: 3 },
      ],
    });
    expect(result.bebidaMl).toBeCloseTo(0, 5);
    expect(result.liquorMl).toBeCloseTo(3 * VOL_ROJO, 5);
  });
});

// ─── calculateReverseResults — separate mode ─────────────────────────────────

describe("calculateReverseResults — separate mode", () => {
  test("returns zeros when no glass is selected", () => {
    const result = calculateReverseResults(baseReverseState({ glassType: null }));
    expect(result.totalDrinks).toBe(0);
    expect(result.drinksPerPerson).toBe(0);
  });

  test("pisco is the limiting factor", () => {
    // 750ml pisco + 2L bebida → pisco runs out first
    const rev = baseReverseState({
      piscoEntries: [{ id: "1", sizeMl: 750, count: 1 }],
      bebidaEntries: [{ id: "2", sizeMl: 2000, count: 1 }],
      peopleCount: 2,
    });
    const piscoPerDrink = VOL_ROJO * 0.4;
    const result = calculateReverseResults(rev);
    expect(result.totalDrinks).toBe(Math.floor(750 / piscoPerDrink));
    expect(result.limitingFactor).toBe("pisco");
    expect(result.drinksPerPerson).toBe(Math.floor(result.totalDrinks / 2));
    expect(result.leftoverDrinks).toBe(result.totalDrinks % 2);
  });

  test("bebida is the limiting factor", () => {
    // 2L pisco + 1L bebida → bebida runs out first
    const rev = baseReverseState({
      piscoEntries: [{ id: "1", sizeMl: 2000, count: 1 }],
      bebidaEntries: [{ id: "2", sizeMl: 1000, count: 1 }],
    });
    const bebidaPerDrink = VOL_ROJO * 0.6;
    const result = calculateReverseResults(rev);
    expect(result.totalDrinks).toBe(Math.floor(1000 / bebidaPerDrink));
    expect(result.limitingFactor).toBe("bebida");
  });

  test("ice is the limiting factor (manual ice)", () => {
    // plenty of pisco + bebida but very little ice
    const rev = baseReverseState({
      piscoEntries: [{ id: "1", sizeMl: 1000, count: 2 }],
      bebidaEntries: [{ id: "2", sizeMl: 3000, count: 1 }],
      iceInputMode: "manual",
      iceKg: 0.3,
    });
    const result = calculateReverseResults(rev);
    expect(result.limitingFactor).toBe("hielo");
    expect(result.totalDrinks).toBe(
      Math.floor((0.3 * ICE_BAG_ML) / ICE_ML_PER_DRINK),
    );
  });

  test("multiple bottle entries sum correctly", () => {
    // 750ml + 1L pisco, 1.5L + 2L bebida
    const rev = baseReverseState({
      piscoEntries: [
        { id: "1", sizeMl: 750, count: 1 },
        { id: "2", sizeMl: 1000, count: 1 },
      ],
      bebidaEntries: [
        { id: "3", sizeMl: 1500, count: 1 },
        { id: "4", sizeMl: 2000, count: 1 },
      ],
    });
    const totalPisco = 1750;
    const totalBebida = 3500;
    const piscoPerDrink = VOL_ROJO * 0.4;
    const bebidaPerDrink = VOL_ROJO * 0.6;
    const result = calculateReverseResults(rev);
    expect(result.totalDrinks).toBe(
      Math.floor(Math.min(totalPisco / piscoPerDrink, totalBebida / bebidaPerDrink)),
    );
  });

  test("count > 1 multiplies the bottle correctly", () => {
    const single = calculateReverseResults(
      baseReverseState({ piscoEntries: [{ id: "1", sizeMl: 1000, count: 1 }] }),
    );
    const double = calculateReverseResults(
      baseReverseState({ piscoEntries: [{ id: "1", sizeMl: 1000, count: 2 }] }),
    );
    // More pisco means more drinks (up to bebida limit)
    expect(double.totalDrinks).toBeGreaterThanOrEqual(single.totalDrinks);
  });

  test("partial bottle (50% full) halves the available ml", () => {
    const full = calculateReverseResults(
      baseReverseState({
        piscoEntries: [{ id: "1", sizeMl: 1000, count: 1, percentageFull: 100 }],
        bebidaEntries: [{ id: "2", sizeMl: 3000, count: 1 }],
      }),
    );
    const half = calculateReverseResults(
      baseReverseState({
        piscoEntries: [{ id: "1", sizeMl: 1000, count: 1, percentageFull: 50 }],
        bebidaEntries: [{ id: "2", sizeMl: 3000, count: 1 }],
      }),
    );
    // Pisco is limiting in both → half should yield ~half the drinks
    expect(half.totalDrinks).toBe(Math.floor(full.totalDrinks / 2));
  });

  test("per-person split and leftover are correct", () => {
    // 1L pisco, 3L bebida, normal, vaso_rojo → 8 drinks, 3 people: 2 each + 2 leftover
    const piscoPerDrink = VOL_ROJO * 0.4; // ~122.28
    const totalDrinks = Math.floor(1000 / piscoPerDrink); // 8
    const rev = baseReverseState({
      piscoEntries: [{ id: "1", sizeMl: 1000, count: 1 }],
      bebidaEntries: [{ id: "2", sizeMl: 3000, count: 1 }],
      peopleCount: 3,
    });
    const result = calculateReverseResults(rev);
    expect(result.totalDrinks).toBe(totalDrinks);
    expect(result.drinksPerPerson).toBe(Math.floor(totalDrinks / 3));
    expect(result.leftoverDrinks).toBe(totalDrinks % 3);
  });

  test("bebida via direct ml input", () => {
    const rev = baseReverseState({
      piscoEntries: [{ id: "1", sizeMl: 1000, count: 1 }],
      bebidaInputMode: "direct",
      bebidaDirectMl: 2000,
      bebidaEntries: [],
    });
    const bebidaPerDrink = VOL_ROJO * 0.6;
    const piscoPerDrink = VOL_ROJO * 0.4;
    const result = calculateReverseResults(rev);
    expect(result.totalDrinks).toBe(
      Math.floor(Math.min(1000 / piscoPerDrink, 2000 / bebidaPerDrink)),
    );
  });

  test("auto ice mode never limits drinks", () => {
    const withAuto = calculateReverseResults(baseReverseState({ iceInputMode: "auto" }));
    const withManualPlenty = calculateReverseResults(
      baseReverseState({ iceInputMode: "manual", iceKg: 999 }),
    );
    expect(withAuto.totalDrinks).toBe(withManualPlenty.totalDrinks);
  });

  test("vaso vidrio produces more drinks from the same pisco (smaller glass)", () => {
    const rojo = calculateReverseResults(
      baseReverseState({ glassType: "vaso_rojo" }),
    );
    const vidrio = calculateReverseResults(
      baseReverseState({ glassType: "vaso_vidrio" }),
    );
    expect(vidrio.totalDrinks).toBeGreaterThan(rojo.totalDrinks);
  });

  test("desquiciado level needs more pisco per drink → fewer drinks from same bottle", () => {
    // desquiciado (0.7 liquor) vs normal (0.4) with same pisco and plenty of bebida
    const normal = calculateReverseResults(
      baseReverseState({ level: "normal", bebidaEntries: [{ id: "2", sizeMl: 3000, count: 1 }] }),
    );
    const loco = calculateReverseResults(
      baseReverseState({ level: "desquiciado", bebidaEntries: [{ id: "2", sizeMl: 3000, count: 1 }] }),
    );
    expect(loco.totalDrinks).toBeLessThan(normal.totalDrinks);
  });
});

// ─── calculateReverseResults — promos mode ───────────────────────────────────

describe("calculateReverseResults — promos mode", () => {
  test("promos done: only promo ml counts, bottle entries ignored", () => {
    const rev = baseReverseState({
      reverseInputMode: "promos",
      promoExtraMode: "done",
      promoEntries: [{ id: "p1", piscoSizeMl: 750, bebidaSizeMl: 1500, count: 2 }],
      piscoEntries: [{ id: "b1", sizeMl: 1000, count: 5 }], // should be ignored
    });
    const promoPisco = 750 * 2;
    const promoBebida = 1500 * 2;
    const piscoPerDrink = VOL_ROJO * 0.4;
    const bebidaPerDrink = VOL_ROJO * 0.6;
    const result = calculateReverseResults(rev);
    expect(result.totalDrinks).toBe(
      Math.floor(Math.min(promoPisco / piscoPerDrink, promoBebida / bebidaPerDrink)),
    );
  });

  test("promos add_more: promo ml + bottle entries both count", () => {
    const rev = baseReverseState({
      reverseInputMode: "promos",
      promoExtraMode: "add_more",
      promoEntries: [{ id: "p1", piscoSizeMl: 750, bebidaSizeMl: 1500, count: 1 }],
      piscoEntries: [{ id: "b1", sizeMl: 1000, count: 1 }],
      bebidaEntries: [], // no extra bebida
    });
    const totalPisco = 750 + 1000;
    const totalBebida = 1500;
    const piscoPerDrink = VOL_ROJO * 0.4;
    const bebidaPerDrink = VOL_ROJO * 0.6;
    const result = calculateReverseResults(rev);
    expect(result.totalDrinks).toBe(
      Math.floor(Math.min(totalPisco / piscoPerDrink, totalBebida / bebidaPerDrink)),
    );
  });

  test("multiple promo entries sum correctly", () => {
    const rev = baseReverseState({
      reverseInputMode: "promos",
      promoExtraMode: "done",
      promoEntries: [
        { id: "p1", piscoSizeMl: 750, bebidaSizeMl: 1500, count: 1 },
        { id: "p2", piscoSizeMl: 1000, bebidaSizeMl: 3000, count: 2 },
      ],
    });
    const totalPisco = 750 + 1000 * 2;
    const totalBebida = 1500 + 3000 * 2;
    const piscoPerDrink = VOL_ROJO * 0.4;
    const bebidaPerDrink = VOL_ROJO * 0.6;
    const result = calculateReverseResults(rev);
    expect(result.totalDrinks).toBe(
      Math.floor(Math.min(totalPisco / piscoPerDrink, totalBebida / bebidaPerDrink)),
    );
  });
});

// ─── calculateReverseResults — suggestion logic ───────────────────────────────

describe("calculateReverseResults — suggestion logic", () => {
  test("no suggestion when pisco is already fully utilised", () => {
    // 750ml pisco + 2L bebida: pisco limits, can't do more with more bebida
    const result = calculateReverseResults(
      baseReverseState({
        piscoEntries: [{ id: "1", sizeMl: 750, count: 1 }],
        bebidaEntries: [{ id: "2", sizeMl: 2000, count: 1 }],
      }),
    );
    expect(result.suggestion).toBeNull();
  });

  test("suggests bebida bottle when bebida is the bottleneck", () => {
    // 2L pisco + 1L bebida: bebida limits, shortfall > 1L bottle → suggest 1.5L
    const result = calculateReverseResults(
      baseReverseState({
        piscoEntries: [{ id: "1", sizeMl: 2000, count: 1 }],
        bebidaEntries: [{ id: "2", sizeMl: 1000, count: 1 }],
        peopleCount: 2,
      }),
    );
    expect(result.suggestion).not.toBeNull();
    expect(result.suggestion!.bebidaAddMl).toBeGreaterThan(0);
    expect(result.suggestion!.newTotalDrinks).toBeGreaterThan(result.totalDrinks);
  });

  test("suggested bebida rounds up when uncovered > 25% of floor bottle", () => {
    // 2L pisco, 1L bebida: shortfall ≈ 1934ml → floor=1500, uncovered=434 > 25% of 1500 (375) → round up to 2000
    const result = calculateReverseResults(
      baseReverseState({
        piscoEntries: [{ id: "1", sizeMl: 2000, count: 1 }],
        bebidaEntries: [{ id: "2", sizeMl: 1000, count: 1 }],
      }),
    );
    expect(result.suggestion!.bebidaAddMl).toBe(2000);
  });

  test("suggests ice bag when ice is the bottleneck, rounds up when remainder > 25% of bag", () => {
    // 2L pisco, 3L bebida, 0.3kg ice → ice limits
    // shortfall = 16*120 - 327 = 1593ml, remainder = 503ml > 25% of 1090 (272.5) → ceil → 2 bags
    const result = calculateReverseResults(
      baseReverseState({
        piscoEntries: [{ id: "1", sizeMl: 1000, count: 2 }],
        bebidaEntries: [{ id: "2", sizeMl: 3000, count: 1 }],
        iceInputMode: "manual",
        iceKg: 0.3,
      }),
    );
    expect(result.suggestion).not.toBeNull();
    expect(result.suggestion!.iceAddBags).toBe(2);
    expect(result.suggestion!.newTotalDrinks).toBeGreaterThan(result.totalDrinks);
  });

  test("newTotalDrinks and newDrinksPerPerson are consistent", () => {
    const result = calculateReverseResults(
      baseReverseState({
        piscoEntries: [{ id: "1", sizeMl: 2000, count: 1 }],
        bebidaEntries: [{ id: "2", sizeMl: 1000, count: 1 }],
        peopleCount: 3,
      }),
    );
    const s = result.suggestion!;
    expect(s.newDrinksPerPerson).toBe(Math.floor(s.newTotalDrinks / 3));
    expect(s.newLeftoverDrinks).toBe(s.newTotalDrinks % 3);
  });

  test("no suggestion when bebida shortfall is < 25% of smallest bottle", () => {
    // 750ml pisco, 1L bebida → shortfall ≈ 100ml < 25% of 1000ml (250ml) → no suggestion
    const result = calculateReverseResults(
      baseReverseState({
        piscoEntries: [{ id: "1", sizeMl: 750, count: 1 }],
        bebidaEntries: [{ id: "2", sizeMl: 1000, count: 1 }],
      }),
    );
    expect(result.suggestion).toBeNull();
  });

  test("tie between pisco and bebida: bebida is reported as limiting factor", () => {
    // normal level (0.4/0.6): 1000ml pisco : 1500ml bebida = 2:3 → exact floating-point tie
    const result = calculateReverseResults(
      baseReverseState({
        piscoEntries: [{ id: "1", sizeMl: 1000, count: 1 }],
        bebidaEntries: [{ id: "2", sizeMl: 1500, count: 1 }],
        level: "normal",
      }),
    );
    expect(result.limitingFactor).toBe("bebida");
    expect(result.suggestion).toBeNull(); // both fully utilised, nothing left to unlock
  });
});
