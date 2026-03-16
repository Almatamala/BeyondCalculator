import * as Clipboard from "expo-clipboard";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  BackHandler,
  PanResponder,
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
import { calculateResults, usableVolume } from "@/utils/calculations";
import { GLASS_CONFIG, LEVEL_RATIOS } from "@/constants/drinks";

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

  const totalDrinks =
    state.mode === 'personalized'
      ? state.people.reduce((sum, p) => sum + p.drinksPerPerson, 0)
      : state.peopleCount * state.drinksPerPerson;

  // For pisco affected-drinks count, always use "normal" level regardless of selection
  const normalPiscoMlPerDrink = state.glassType
    ? usableVolume(GLASS_CONFIG[state.glassType].ml) * LEVEL_RATIOS['normal'].liquor
    : 0;

  /* ── Shortage notification ── */

  function shortfallInfo(valueMl: number, bottleMl: number, mlPerDrink: number) {
    if (valueMl <= 0 || mlPerDrink <= 0) return { isShort: false, n: 0 };
    const rounded = Math.round(valueMl);
    const rawRatio = rounded / bottleMl;
    const frac = rawRatio - Math.floor(rawRatio);
    if (frac <= 0 || frac > 0.25) return { isShort: false, n: 0 };
    const shortfallMl = rounded - Math.floor(rawRatio) * bottleMl;
    return { isShort: true, n: Math.ceil(shortfallMl / mlPerDrink) };
  }

  const bebidaMlPerDrink = totalDrinks > 0 ? results.bebidaMl / totalDrinks : 0;
  const piscoShort = shortfallInfo(results.liquorMl, piscoBottleMl, normalPiscoMlPerDrink);
  const bebidaShort = shortfallInfo(results.bebidaMl, sodaBottleMl, bebidaMlPerDrink);
  const iceShort = shortfallInfo(results.iceMl, 1090, 120);

  function buildShortageMsg(pisco: boolean, bebida: boolean, ice: boolean, n: number): string {
    const ultimo = n === 1 ? 'El último trago' : `Los últimos ${n} tragos`;
    const puede = n === 1 ? 'puede' : 'pueden';
    if (pisco && bebida && ice) return `${ultimo} ${puede} quedar cortos en todo`;
    if (pisco && bebida)        return `${ultimo} ${puede} quedar con menos líquido`;
    if (pisco && ice)           return `${ultimo} ${puede} quedar más suave${n > 1 ? 's' : ''} y sin hielo`;
    if (bebida && ice)          return `${ultimo} ${puede} quedar más fuerte${n > 1 ? 's' : ''} y sin hielo`;
    if (pisco)  return `${ultimo} ${puede} quedar más suave${n > 1 ? 's' : ''}`;
    if (bebida) return `${ultimo} ${puede} quedar más fuerte${n > 1 ? 's' : ''}`;
    if (ice)    return `${n === 1 ? '1 trago puede' : `${n} tragos pueden`} quedar sin hielo`;
    return '';
  }

  const anyShort = piscoShort.isShort || bebidaShort.isShort || iceShort.isShort;
  const maxN = Math.max(piscoShort.n, bebidaShort.n, iceShort.n);
  const shortageMsg = anyShort
    ? buildShortageMsg(piscoShort.isShort, bebidaShort.isShort, iceShort.isShort, maxN)
    : '';

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

  const notifOpacity = useRef(new Animated.Value(0)).current;
  const notifTranslateX = useRef(new Animated.Value(0)).current;
  const notifTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notifTranslateY = notifOpacity.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] });
  const [notifVisible, setNotifVisible] = useState(false);
  const [displayMsg, setDisplayMsg] = useState('');

  const dismiss = useCallback(() => {
    if (notifTimeout.current) clearTimeout(notifTimeout.current);
    Animated.parallel([
      Animated.timing(notifOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(notifTranslateX, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setNotifVisible(false));
  }, [notifOpacity, notifTranslateX]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 8 && Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderMove: (_, gs) => notifTranslateX.setValue(gs.dx),
      onPanResponderRelease: (_, gs) => {
        if (Math.abs(gs.dx) > 80) {
          if (notifTimeout.current) clearTimeout(notifTimeout.current);
          Animated.parallel([
            Animated.timing(notifTranslateX, { toValue: gs.dx > 0 ? 500 : -500, duration: 220, useNativeDriver: true }),
            Animated.timing(notifOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
          ]).start(() => { notifTranslateX.setValue(0); setNotifVisible(false); });
        } else {
          Animated.spring(notifTranslateX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (currentStep !== 3 || !anyShort) {
      dismiss();
      return;
    }
    if (shortageMsg) setDisplayMsg(shortageMsg);
    if (notifTimeout.current) clearTimeout(notifTimeout.current);
    notifTranslateX.setValue(0);
    notifOpacity.setValue(0);
    setNotifVisible(true);
    Animated.timing(notifOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    notifTimeout.current = setTimeout(dismiss, 5000);
    return () => { if (notifTimeout.current) clearTimeout(notifTimeout.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, anyShort, shortageMsg]);

  const handleCopy = async () => {
    const smartCount = (ml: number, bottleMl: number) => {
      const raw = Math.round(ml) / bottleMl;
      const frac = raw - Math.floor(raw);
      return Math.max(1, frac > 0 && frac <= 0.25 ? Math.floor(raw) : Math.ceil(raw));
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
    <View style={{ flex: 1 }}>
      <StepContainer
        ref={containerRef}
        steps={steps}
        currentStep={currentStep}
        direction={direction}
        onBack={goBack}
      />
      <Animated.View
        pointerEvents={notifVisible ? "box-only" : "none"}
        style={[styles.notification, { opacity: notifOpacity, transform: [{ translateY: notifTranslateY }, { translateX: notifTranslateX }] }]}
        {...panResponder.panHandlers}
      >
        <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#F5A623" />
        <Text style={styles.notificationText}>{displayMsg}</Text>
      </Animated.View>
    </View>
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
  notification: {
    position: "absolute",
    top: 55,
    left: 16,
    right: 16,
    zIndex: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff8ee",
    borderWidth: 1,
    borderColor: "#F5A623",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  notificationText: {
    flex: 1,
    fontSize: 13,
    color: "#b36b00",
    fontWeight: "500",
  },
});
