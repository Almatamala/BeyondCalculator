import * as Clipboard from "expo-clipboard";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import GlassSelector from "@/components/calculator/GlassSelector";
import LevelPicker from "@/components/calculator/LevelPicker";
import ModeSelector from "@/components/calculator/ModeSelector";
import PersonList from "@/components/calculator/PersonList";
import ResultCard from "@/components/calculator/ResultCard";
import CountPicker from "@/components/countPicker";
import StepContainer, {
  Step,
  StepContainerRef,
} from "@/components/StepContainer";
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

  const goForward = () => {
    setDirection("forward");
    setCurrentStep((s) => s + 1);
  };

  const goBack = useCallback(() => {
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
  }, [currentStep, state.mode, state.people, state.peopleCount, state.drinksPerPerson, state.level, reset, setDirection, setCurrentStep]);

  useFocusEffect(
    useCallback(() => {
      const onBack = () => {
        if (currentStep > 0) {
          goBack();
          return true;
        }
        return false;
      };
      const sub = BackHandler.addEventListener("hardwareBackPress", onBack);
      return () => sub.remove();
    }, [currentStep, goBack]),
  );

  const handleReset = () => {
    reset();
    setPiscoBottleMl(1000);
    setSodaBottleMl(3000);
    setCopied(false);
    setDirection("backward");
    setCurrentStep(0);
  };

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const smartCount = (ml: number, bottleMl: number) => {
      const raw = Math.round(ml) / bottleMl;
      const frac = raw - Math.floor(raw);
      return Math.max(1, frac > 0 && frac <= 0.10 ? Math.floor(raw) : Math.ceil(raw));
    };
    const piscoCount = smartCount(results.liquorMl, piscoBottleMl);
    const sodaCount = smartCount(results.bebidaMl, sodaBottleMl);
    const iceKg = Math.ceil(results.iceMl / 1090);

    const piscoSize = piscoBottleMl >= 1000 ? `${piscoBottleMl / 1000}L` : `${piscoBottleMl}mL`;
    const sodaSize = sodaBottleMl >= 1000 ? `${sodaBottleMl / 1000}L` : `${sodaBottleMl}mL`;

    const piscoEmojis = "🍾".repeat(piscoCount);
    const sodaEmojis = "🥤".repeat(sodaCount);
    const iceEmojis = "🧊".repeat(iceKg);

    const piscoLabel = piscoCount === 1 ? "Pisco" : "Piscos";
    const sodaLabel = sodaCount === 1 ? "Bebida" : "Bebidas";

    const message = [
      `${piscoEmojis} ${piscoCount} ${piscoLabel} de ${piscoSize}`,
      `${sodaEmojis} ${sodaCount} ${sodaLabel} de ${sodaSize}`,
      `${iceEmojis} ${iceKg}kg de hielo`,
    ].join("\n");

    await Clipboard.setStringAsync(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Auto-advance handlers (feedback visual → slide) ── */

  const handleModeSelect = (mode: Mode) => {
    setMode(mode);
    setTimeout(goForward, 100);
  };

  const handleGlassSelect = (glass: GlassType) => {
    setGlassType(glass);
    setTimeout(goForward, 100);
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
                <CountPicker
                  value={state.peopleCount}
                  onChange={setPeopleCount}
                />
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
                  centered
                  style={{ width: 150, height: 60 }}
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
      content: (
        <GlassSelector value={state.glassType} onChange={handleGlassSelect} />
      ),
      scrollable: false,
    },
    {
      question: "Esto es lo que necesitan",
      fitContent: true,
      contentStyle: { gap: 8, padding: 12 },
      content: (
        <View style={[styles.slideContent, { gap: 10 }]}>
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
            totalLabel={`${(results.iceMl / 1090).toFixed(1)} kg`}
          />
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetBtnText}>Empezar de nuevo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopy} activeOpacity={0.8}>
              <MaterialCommunityIcons
                name={copied ? "check" : "clipboard-text-outline"}
                size={18}
                color={copied ? "#4CAF50" : "#666"}
              />
              <Text style={[styles.copyBtnText, copied && styles.copyBtnTextDone]}>
                {copied ? "Copiado" : "Copiar"}
              </Text>
            </TouchableOpacity>
          </View>
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
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  copyBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  copyBtnText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  copyBtnTextDone: {
    color: "#4CAF50",
  },
  resetBtn: {
    flex: 1,
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
