import {
  calculateResults,
  calculateReverseResults,
  drinkVolumes,
  icePerDrink,
} from "@/utils/calculations";
import { GLASS_CONFIG, LEVEL_RATIOS } from "@/constants/drinks";
import { CalculatorState, ReverseState } from "@/types/calculator";

// ─── Constants ───────────────────────────────────────────────────────────────
const ICE_BAG_ML = 1090;

const ROJO_ML   = GLASS_CONFIG.vaso_rojo.ml;   // 454
const VIDRIO_ML = GLASS_CONFIG.vaso_vidrio.ml; // 218

const ROJO_ICE   = icePerDrink("vaso_rojo");   // 90
const VIDRIO_ICE = icePerDrink("vaso_vidrio"); // 60

// Per-drink volumes derived from the model — keeps test expectations in sync
// with the implementation automatically.
const rojoNormal       = drinkVolumes("vaso_rojo",   ROJO_ML,   LEVEL_RATIOS["normal"]);
const rojoAlgoPiola    = drinkVolumes("vaso_rojo",   ROJO_ML,   LEVEL_RATIOS["algo piola"]);
const rojoAlgoPiola2   = drinkVolumes("vaso_rojo",   ROJO_ML,   LEVEL_RATIOS["'algo piola'"]);
const rojoDesquiciado  = drinkVolumes("vaso_rojo",   ROJO_ML,   LEVEL_RATIOS["desquiciado"]);
const rojoPersonalizado = drinkVolumes("vaso_rojo",  ROJO_ML,   LEVEL_RATIOS["personalizado"]);
const vidrioNormal     = drinkVolumes("vaso_vidrio", VIDRIO_ML, LEVEL_RATIOS["normal"]);
const vidrioAlgoPiola  = drinkVolumes("vaso_vidrio", VIDRIO_ML, LEVEL_RATIOS["algo piola"]);

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

// ─── drinkVolumes ─────────────────────────────────────────────────────────────

describe("drinkVolumes", () => {
  test("rojo always gives more pisco per drink than vidrio at every level", () => {
    for (const key of Object.keys(LEVEL_RATIOS) as Array<keyof typeof LEVEL_RATIOS>) {
      const rojo   = drinkVolumes("vaso_rojo",   ROJO_ML,   LEVEL_RATIOS[key]);
      const vidrio = drinkVolumes("vaso_vidrio", VIDRIO_ML, LEVEL_RATIOS[key]);
      expect(rojo.piscoMl).toBeGreaterThan(vidrio.piscoMl);
    }
  });

  test("piscoMl + bebidaMl fills the usable space exactly", () => {
    const { piscoMl, bebidaMl } = rojoNormal;
    const usable = ROJO_ML * 0.9 - ROJO_ICE;
    expect(piscoMl + bebidaMl).toBeCloseTo(usable, 5);
  });

  test("vidrio usable space fills exactly too", () => {
    const { piscoMl, bebidaMl } = vidrioNormal;
    const usable = VIDRIO_ML * 0.9 - VIDRIO_ICE;
    expect(piscoMl + bebidaMl).toBeCloseTo(usable, 5);
  });

  test("personalizado level produces no bebida", () => {
    expect(rojoPersonalizado.bebidaMl).toBeCloseTo(0, 5);
    expect(rojoPersonalizado.piscoMl).toBeGreaterThan(0);
  });

  test("higher level means more pisco and less bebida per drink", () => {
    expect(rojoDesquiciado.piscoMl).toBeGreaterThan(rojoNormal.piscoMl);
    expect(rojoDesquiciado.bebidaMl).toBeLessThan(rojoNormal.bebidaMl);
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
    expect(result.liquorMl).toBeCloseTo(totalDrinks * rojoNormal.piscoMl, 5);
    expect(result.bebidaMl).toBeCloseTo(totalDrinks * rojoNormal.bebidaMl, 5);
    expect(result.iceMl).toBeCloseTo(totalDrinks * ROJO_ICE, 5);
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
    expect(result.liquorMl).toBeCloseTo(totalDrinks * vidrioAlgoPiola.piscoMl, 5);
    expect(result.bebidaMl).toBeCloseTo(totalDrinks * vidrioAlgoPiola.bebidaMl, 5);
    expect(result.iceMl).toBeCloseTo(totalDrinks * VIDRIO_ICE, 5);
  });

  test("2 people × 3 drinks, desquiciado, vaso_rojo", () => {
    const totalDrinks = 6;
    const result = calculateResults(
      baseSameState({ peopleCount: 2, drinksPerPerson: 3, level: "desquiciado" }),
    );
    expect(result.liquorMl).toBeCloseTo(totalDrinks * rojoDesquiciado.piscoMl, 5);
    expect(result.bebidaMl).toBeCloseTo(totalDrinks * rojoDesquiciado.bebidaMl, 5);
    expect(result.iceMl).toBeCloseTo(totalDrinks * ROJO_ICE, 5);
  });

  test("personalizado level: all liquor, no soda", () => {
    const totalDrinks = 2;
    const result = calculateResults(
      baseSameState({ peopleCount: 1, drinksPerPerson: 2, level: "personalizado" }),
    );
    expect(result.liquorMl).toBeCloseTo(totalDrinks * rojoPersonalizado.piscoMl, 5);
    expect(result.bebidaMl).toBeCloseTo(0, 5);
    expect(result.iceMl).toBeCloseTo(totalDrinks * ROJO_ICE, 5);
  });

  test("'algo piola' level (0.5 / 0.5)", () => {
    const totalDrinks = 4;
    const result = calculateResults(
      baseSameState({ peopleCount: 2, drinksPerPerson: 2, level: "'algo piola'" }),
    );
    expect(result.liquorMl).toBeCloseTo(totalDrinks * rojoAlgoPiola2.piscoMl, 5);
    expect(result.bebidaMl).toBeCloseTo(totalDrinks * rojoAlgoPiola2.bebidaMl, 5);
  });

  test("1 person × 1 drink is the minimal unit", () => {
    const result = calculateResults(
      baseSameState({ peopleCount: 1, drinksPerPerson: 1, level: "normal" }),
    );
    expect(result.liquorMl).toBeCloseTo(rojoNormal.piscoMl, 5);
    expect(result.bebidaMl).toBeCloseTo(rojoNormal.bebidaMl, 5);
    expect(result.iceMl).toBe(ROJO_ICE);
  });

  test("scales linearly with drinks", () => {
    const base   = calculateResults(baseSameState({ peopleCount: 1, drinksPerPerson: 1 }));
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
    expect(result.liquorMl).toBeCloseTo(2 * rojoDesquiciado.piscoMl, 5);
    expect(result.bebidaMl).toBeCloseTo(2 * rojoDesquiciado.bebidaMl, 5);
    expect(result.iceMl).toBe(2 * ROJO_ICE);
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
      2 * rojoAlgoPiola.piscoMl +
      3 * rojoNormal.piscoMl +
      1 * rojoDesquiciado.piscoMl;
    const expectedBebida =
      2 * rojoAlgoPiola.bebidaMl +
      3 * rojoNormal.bebidaMl +
      1 * rojoDesquiciado.bebidaMl;
    const expectedIce = (2 + 3 + 1) * ROJO_ICE;

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
    expect(result.liquorMl).toBeCloseTo(3 * rojoPersonalizado.piscoMl, 5);
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
    const result = calculateReverseResults(rev);
    expect(result.totalDrinks).toBe(Math.floor(750 / rojoNormal.piscoMl));
    expect(result.limitingFactor).toBe("pisco");
    expect(result.drinksPerPerson).toBe(Math.floor(result.totalDrinks / 2));
    expect(result.leftoverDrinks).toBe(result.totalDrinks % 2);
  });

  test("bebida is the limiting factor", () => {
    // 2L pisco + 500ml bebida → bebida runs out first
    const rev = baseReverseState({
      piscoEntries: [{ id: "1", sizeMl: 2000, count: 1 }],
      bebidaEntries: [{ id: "2", sizeMl: 500, count: 1 }],
    });
    const result = calculateReverseResults(rev);
    expect(result.totalDrinks).toBe(Math.floor(500 / rojoNormal.bebidaMl));
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
      Math.floor((0.3 * ICE_BAG_ML) / ROJO_ICE),
    );
  });

  test("multiple bottle entries sum correctly", () => {
    // 750ml + 1L pisco, 1.5L + 2L bebida
    const rev = baseReverseState({
      piscoEntries: [
        { id: "1", sizeMl: 750,  count: 1 },
        { id: "2", sizeMl: 1000, count: 1 },
      ],
      bebidaEntries: [
        { id: "3", sizeMl: 1500, count: 1 },
        { id: "4", sizeMl: 2000, count: 1 },
      ],
    });
    const totalPisco = 1750;
    const totalBebida = 3500;
    const result = calculateReverseResults(rev);
    expect(result.totalDrinks).toBe(
      Math.floor(Math.min(totalPisco / rojoNormal.piscoMl, totalBebida / rojoNormal.bebidaMl)),
    );
  });

  test("count > 1 multiplies the bottle correctly", () => {
    const single = calculateReverseResults(
      baseReverseState({ piscoEntries: [{ id: "1", sizeMl: 1000, count: 1 }] }),
    );
    const double = calculateReverseResults(
      baseReverseState({ piscoEntries: [{ id: "1", sizeMl: 1000, count: 2 }] }),
    );
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
    const totalDrinks = Math.floor(1000 / rojoNormal.piscoMl);
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
    const result = calculateReverseResults(rev);
    expect(result.totalDrinks).toBe(
      Math.floor(Math.min(1000 / rojoNormal.piscoMl, 2000 / rojoNormal.bebidaMl)),
    );
  });

  test("auto ice mode never limits drinks", () => {
    const withAuto        = calculateReverseResults(baseReverseState({ iceInputMode: "auto" }));
    const withManualPlenty = calculateReverseResults(
      baseReverseState({ iceInputMode: "manual", iceKg: 999 }),
    );
    expect(withAuto.totalDrinks).toBe(withManualPlenty.totalDrinks);
  });

  test("vaso vidrio produces more drinks from the same pisco (smaller glass)", () => {
    const rojo   = calculateReverseResults(baseReverseState({ glassType: "vaso_rojo" }));
    const vidrio = calculateReverseResults(baseReverseState({ glassType: "vaso_vidrio" }));
    expect(vidrio.totalDrinks).toBeGreaterThan(rojo.totalDrinks);
  });

  test("desquiciado level needs more pisco per drink → fewer drinks from same bottle", () => {
    const normal = calculateReverseResults(
      baseReverseState({ level: "normal",      bebidaEntries: [{ id: "2", sizeMl: 3000, count: 1 }] }),
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
    const promoPisco  = 750 * 2;
    const promoBebida = 1500 * 2;
    const result = calculateReverseResults(rev);
    expect(result.totalDrinks).toBe(
      Math.floor(Math.min(promoPisco / rojoNormal.piscoMl, promoBebida / rojoNormal.bebidaMl)),
    );
  });

  test("promos add_more: promo ml + bottle entries both count", () => {
    const rev = baseReverseState({
      reverseInputMode: "promos",
      promoExtraMode: "add_more",
      promoEntries: [{ id: "p1", piscoSizeMl: 750, bebidaSizeMl: 1500, count: 1 }],
      piscoEntries:  [{ id: "b1", sizeMl: 1000, count: 1 }],
      bebidaEntries: [], // no extra bebida
    });
    const totalPisco  = 750 + 1000;
    const totalBebida = 1500;
    const result = calculateReverseResults(rev);
    expect(result.totalDrinks).toBe(
      Math.floor(Math.min(totalPisco / rojoNormal.piscoMl, totalBebida / rojoNormal.bebidaMl)),
    );
  });

  test("multiple promo entries sum correctly", () => {
    const rev = baseReverseState({
      reverseInputMode: "promos",
      promoExtraMode: "done",
      promoEntries: [
        { id: "p1", piscoSizeMl: 750,  bebidaSizeMl: 1500, count: 1 },
        { id: "p2", piscoSizeMl: 1000, bebidaSizeMl: 3000, count: 2 },
      ],
    });
    const totalPisco  = 750 + 1000 * 2;
    const totalBebida = 1500 + 3000 * 2;
    const result = calculateReverseResults(rev);
    expect(result.totalDrinks).toBe(
      Math.floor(Math.min(totalPisco / rojoNormal.piscoMl, totalBebida / rojoNormal.bebidaMl)),
    );
  });
});

// ─── calculateReverseResults — suggestion logic ───────────────────────────────

describe("calculateReverseResults — suggestion logic", () => {
  test("no suggestion when pisco is already fully utilised", () => {
    // 750ml pisco + 2L bebida: pisco limits, no extra bebida can help
    const result = calculateReverseResults(
      baseReverseState({
        piscoEntries:  [{ id: "1", sizeMl: 750,  count: 1 }],
        bebidaEntries: [{ id: "2", sizeMl: 2000, count: 1 }],
      }),
    );
    expect(result.suggestion).toBeNull();
  });

  test("suggests bebida bottle when bebida is the bottleneck", () => {
    // 2L pisco + 500ml bebida: bebida limits, more bebida unlocks pisco capacity
    const result = calculateReverseResults(
      baseReverseState({
        piscoEntries:  [{ id: "1", sizeMl: 2000, count: 1 }],
        bebidaEntries: [{ id: "2", sizeMl: 500,  count: 1 }],
        peopleCount: 2,
      }),
    );
    expect(result.suggestion).not.toBeNull();
    expect(result.suggestion!.bebidaAddMl).toBeGreaterThan(0);
    expect(result.suggestion!.newTotalDrinks).toBeGreaterThan(result.totalDrinks);
  });

  test("suggests ice when ice is the bottleneck (manual ice mode)", () => {
    // plenty of pisco + bebida, but barely any ice
    const result = calculateReverseResults(
      baseReverseState({
        piscoEntries:  [{ id: "1", sizeMl: 1000, count: 2 }],
        bebidaEntries: [{ id: "2", sizeMl: 3000, count: 1 }],
        iceInputMode: "manual",
        iceKg: 0.3,
      }),
    );
    expect(result.suggestion).not.toBeNull();
    expect(result.suggestion!.iceAddBags).toBeGreaterThan(0);
    expect(result.suggestion!.newTotalDrinks).toBeGreaterThan(result.totalDrinks);
  });

  test("newTotalDrinks and newDrinksPerPerson are consistent", () => {
    const result = calculateReverseResults(
      baseReverseState({
        piscoEntries:  [{ id: "1", sizeMl: 2000, count: 1 }],
        bebidaEntries: [{ id: "2", sizeMl: 500,  count: 1 }],
        peopleCount: 3,
      }),
    );
    const s = result.suggestion!;
    expect(s.newDrinksPerPerson).toBe(Math.floor(s.newTotalDrinks / 3));
    expect(s.newLeftoverDrinks).toBe(s.newTotalDrinks % 3);
  });

  test("pisco limits → limitingFactor is pisco", () => {
    const result = calculateReverseResults(
      baseReverseState({
        piscoEntries:  [{ id: "1", sizeMl: 500,  count: 1 }],
        bebidaEntries: [{ id: "2", sizeMl: 3000, count: 1 }],
      }),
    );
    expect(result.limitingFactor).toBe("pisco");
  });

  test("bebida limits → limitingFactor is bebida", () => {
    const result = calculateReverseResults(
      baseReverseState({
        piscoEntries:  [{ id: "1", sizeMl: 3000, count: 1 }],
        bebidaEntries: [{ id: "2", sizeMl: 500,  count: 1 }],
      }),
    );
    expect(result.limitingFactor).toBe("bebida");
  });
});
