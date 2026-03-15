import { useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";

import GlassSelector from "@/components/calculator/GlassSelector";
import LevelPicker from "@/components/calculator/LevelPicker";
import ModeSelector from "@/components/calculator/ModeSelector";
import PersonList from "@/components/calculator/PersonList";
import ResultCard from "@/components/calculator/ResultCard";
import CountPicker from "@/components/countPicker";
import SlideContainer, { Slide, SlideContainerRef } from "@/components/SlideContainer";
import { useCalculator } from "@/context/CalculatorContext";
import { GlassType, Mode } from "@/types/calculator";
import { calculateResults } from "@/utils/calculations";

export default function CalculatorScreen() {
  const pagerRef = useRef<SlideContainerRef>(null);
  const { height } = useWindowDimensions();

  const {
    state,
    setMode,
    addPerson,
    removePerson,
    setPersonName,
    setPersonLevel,
    setPersonDrinks,
    setPeopleCount,
    setDrinksPerPerson,
    setLevel,
    setGlassType,
    reset,
  } = useCalculator();

  const PISCO_BOTTLE_SIZES = [750, 1000];
  const SODA_BOTTLE_SIZES  = [1000, 1500, 2000, 3000];

  const [piscoBottleMl, setPiscoBottleMl] = useState(1000);
  const [sodaBottleMl,  setSodaBottleMl]  = useState(3000);

  const results = calculateResults(state);

  const handleModeSelect = (mode: Mode) => {
    setMode(mode);
    pagerRef.current?.scrollTo(1);
  };

  const handleAddPerson = () => {
    addPerson();
    setTimeout(() => pagerRef.current?.scrollCardToEnd(1), 50);
  };

  const handleGlassSelect = (glass: GlassType) => {
    setGlassType(glass);
    pagerRef.current?.scrollTo(3);
  };

  const slides: Slide[] = [
    {
      question: "¿Tomarán todos lo mismo?",
      content: <ModeSelector onSelect={handleModeSelect} />,
      scrollable: false,
    },
    {
      question: "¿Cuánto tomarán?",
      content: (
        <View style={styles.slideContent}>
          {state.mode === "personalized" ? (
            <PersonList
              people={state.people}
              onAdd={handleAddPerson}
              onRemove={removePerson}
              onNameChange={setPersonName}
              onLevelChange={setPersonLevel}
              onDrinksChange={setPersonDrinks}
            />
          ) : (
            <View style={styles.sameMode}>
              <View style={styles.counterGroup}>
                <Text style={styles.counterLabel}>¿Cuántos weones son?</Text>
                <CountPicker value={state.peopleCount} onChange={setPeopleCount} />
              </View>
              <View style={styles.counterGroup}>
                <Text style={styles.counterLabel}>¿Cuántos vasos tomará cada weon/a?</Text>
                <CountPicker value={state.drinksPerPerson} onChange={setDrinksPerPerson} />
              </View>
              <View style={styles.counterGroup}>
                <Text style={styles.counterLabel}>¿Cómo van a tomar?</Text>
                <LevelPicker value={state.level} onChange={setLevel} layout="column" style={{ width: 200 }} />
              </View>
              <Text style={styles.hint}>Toca el número para escribir directamente</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.listoBtn}
            onPress={() => pagerRef.current?.scrollTo(2)}
          >
            <Text style={styles.listoBtnText}>Listo →</Text>
          </TouchableOpacity>
        </View>
      ),
    },
    {
      question: "¿Qué vaso están usando?",
      content: <GlassSelector value={state.glassType} onChange={handleGlassSelect} />,
    },
    {
      question: "Esto es lo que necesitan",
      cardStyle: { maxHeight: height * 0.72 },
      contentStyle: { flexGrow: 0, gap: 10 },
      content: (
        <View style={styles.slideContent}>
          <ResultCard
            label="Pisco"
            valueMl={results.liquorMl}
            bottleSizes={PISCO_BOTTLE_SIZES}
            selectedBottleMl={piscoBottleMl}
            onBottleSizeChange={setPiscoBottleMl}
          />
          <ResultCard
            label="Bebida"
            valueMl={results.bebidaMl}
            bottleSizes={SODA_BOTTLE_SIZES}
            selectedBottleMl={sodaBottleMl}
            onBottleSizeChange={setSodaBottleMl}
          />
          <ResultCard
            label="Hielo"
            valueMl={results.iceMl}
            bottleSizes={[1090]}
            selectedBottleMl={1090}
            onBottleSizeChange={() => {}}
            unit={{ singular: 'bolsa de 1 kg', plural: 'bolsas de 1 kg' }}
            hideVolume
          />
          <TouchableOpacity style={styles.resetBtn} onPress={reset}>
            <Text style={styles.resetBtnText}>Empezar de nuevo</Text>
          </TouchableOpacity>
        </View>
      ),
    },
  ];

  return <SlideContainer ref={pagerRef} slides={slides} />;
}

const styles = StyleSheet.create({
  slideContent: {
    gap: 20,
  },
  sameMode: {
    gap: 24,
    alignItems: "center",
  },
  counterGroup: {
    gap: 8,
    alignItems: "center",
    width: "100%",
  },
  counterLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#374151",
    textAlign: "center",
  },
  hint: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
  },
  listoBtn: {
    backgroundColor: "#F5A623",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  listoBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  resetBtn: {
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
  resetBtnText: {
    fontSize: 15,
    color: "#666",
    fontWeight: "500",
  },
});
