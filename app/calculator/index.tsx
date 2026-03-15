import { useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import GlassSelector from "@/components/calculator/GlassSelector";
import LevelPicker from "@/components/calculator/LevelPicker";
import ModeSelector from "@/components/calculator/ModeSelector";
import PersonList from "@/components/calculator/PersonList";
import ResultCard from "@/components/calculator/ResultCard";
import CountPicker from "@/components/countPicker";
import StepContainer, { Step, StepContainerRef } from "@/components/StepContainer";
import { useCalculator } from "@/context/CalculatorContext";
import { GlassType, Mode } from "@/types/calculator";
import { calculateResults } from "@/utils/calculations";

export default function CalculatorScreen() {
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

  const containerRef = useRef<StepContainerRef>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");

  const PISCO_BOTTLE_SIZES = [750, 1000];
  const SODA_BOTTLE_SIZES = [1000, 1500, 2000, 3000];

  const [piscoBottleMl, setPiscoBottleMl] = useState(1000);
  const [sodaBottleMl, setSodaBottleMl] = useState(3000);

  const results = calculateResults(state);

  /* ── Navigation ── */

  const hasDataEntered = () => {
    if (state.mode === "personalized") {
      return state.people.length > 0;
    }
    return (
      state.peopleCount !== 1 ||
      state.drinksPerPerson !== 3 ||
      state.level !== "normal"
    );
  };

  const goForward = () => {
    setDirection("forward");
    setCurrentStep((s) => s + 1);
  };

  const goBack = () => {
    if (currentStep === 1 && hasDataEntered()) {
      Alert.alert(
        "¿Estás seguro?",
        "Se perderán los datos ingresados en este paso.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Sí, volver",
            style: "destructive",
            onPress: () => {
              reset();
              setDirection("backward");
              setCurrentStep(0);
            },
          },
        ],
      );
      return;
    }
    setDirection("backward");
    setCurrentStep((s) => s - 1);
  };

  const handleReset = () => {
    reset();
    setPiscoBottleMl(1000);
    setSodaBottleMl(3000);
    setDirection("backward");
    setCurrentStep(0);
  };

  /* ── Auto-advance handlers (feedback visual → slide) ── */

  const handleModeSelect = (mode: Mode) => {
    setMode(mode);
    setTimeout(goForward, 200);
  };

  const handleGlassSelect = (glass: GlassType) => {
    setGlassType(glass);
    setTimeout(goForward, 200);
  };

  const handleAddPerson = () => {
    addPerson();
    setTimeout(() => containerRef.current?.scrollContentToEnd(), 50);
  };

  /* ── Steps ── */

  const steps: Step[] = [
    {
      question: "¿Tomarán todos lo mismo?",
      content: <ModeSelector value={state.mode} onSelect={handleModeSelect} />,
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
                <Text style={styles.counterLabel}>
                  ¿Cuántos vasos tomará cada weon/a?
                </Text>
                <CountPicker
                  value={state.drinksPerPerson}
                  onChange={setDrinksPerPerson}
                />
              </View>
              <View style={styles.counterGroup}>
                <Text style={styles.counterLabel}>¿Cómo van a tomar?</Text>
                <LevelPicker
                  value={state.level}
                  onChange={setLevel}
                  layout="column"
                  style={{ width: 200 }}
                />
              </View>
              <Text style={styles.hint}>
                Toca el número para escribir directamente
              </Text>
            </View>
          )}
        </View>
      ),
      bottomContent: (
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={goForward}
          activeOpacity={0.8}
        >
          <Text style={styles.confirmBtnText}>Confirmar →</Text>
        </TouchableOpacity>
      ),
    },
    {
      question: "¿Qué vaso están usando?",
      content: <GlassSelector value={state.glassType} onChange={handleGlassSelect} />,
      scrollable: false,
    },
    {
      question: "Esto es lo que necesitan",
      expandCard: true,
      contentStyle: { gap: 10 },
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
            unit={{ singular: "bolsa de 1 kg", plural: "bolsas de 1 kg" }}
            hideVolume
          />
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.resetBtnText}>Empezar de nuevo</Text>
          </TouchableOpacity>
        </View>
      ),
    },
  ];

  return (
    <StepContainer
      ref={containerRef}
      steps={steps}
      currentStep={currentStep}
      direction={direction}
      onBack={goBack}
    />
  );
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
  confirmBtn: {
    backgroundColor: "#F5A623",
    borderRadius: 14,
    paddingVertical: 14,
    marginHorizontal: 24,
    marginBottom: 8,
    alignItems: "center",
  },
  confirmBtnText: {
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
