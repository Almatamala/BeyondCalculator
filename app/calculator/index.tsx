import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  BackHandler,
  Modal,
  PanResponder,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import BebidaSizeModal from "@/components/calculator/BebidaSizeModal";
import BottleInput from "@/components/calculator/BottleInput";
import GlassSelector from "@/components/calculator/GlassSelector";
import LevelPicker from "@/components/calculator/LevelPicker";
import ModeSelector from "@/components/calculator/ModeSelector";
import PersonList from "@/components/calculator/PersonList";
import ResultCard from "@/components/calculator/ResultCard";
import ReverseResultCard from "@/components/calculator/ReverseResultCard";
import UseCaseSelector from "@/components/calculator/UseCaseSelector";
import CountPicker from "@/components/countPicker";
import StepContainer, {
  Step,
  StepContainerRef,
} from "@/components/StepContainer";
import {
  GLASS_CONFIG,
  LEVEL_RATIOS,
  PISCO_BOTTLE_SIZES,
  SODA_BOTTLE_SIZES,
} from "@/constants/drinks";
import { useCalculator } from "@/context/CalculatorContext";
import { GlassType, Mode, UseCase } from "@/types/calculator";
import {
  calculateResults,
  calculateReverseResults,
  usableVolume,
} from "@/utils/calculations";

export default function CalculatorScreen() {
  const {
    state,
    setUseCase,
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
    // reverse actions
    setPiscoEntryCount,
    setPiscoEntrySize,
    addPiscoEntry,
    removePiscoEntry,
    setBebidaInputMode,
    setBebidaEntryCount,
    setBebidaEntrySize,
    addBebidaEntry,
    removeBebidaEntry,
    setBebidaDirectMl,
    setIceInputMode,
    setIceKg,
    setReverseLevel,
    setReversePeopleCount,
    setReverseGlassType,
    reset,
  } = useCalculator();

  const containerRef = useRef<StepContainerRef>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [infoModalVisible, setInfoModalVisible] = useState(false);

  const [piscoBottleMl, setPiscoBottleMl] = useState(1000);
  const [sodaBottleMl, setSodaBottleMl] = useState(3000);

  const [bebidaModalVisible, setBebidaModalVisible] = useState(false);
  const [directUnit, setDirectUnit] = useState<"mL" | "L">("L");
  const [directInputValue, setDirectInputValue] = useState("");

  const results = calculateResults(state);
  const reverseResults = calculateReverseResults(state.reverse);

  const totalDrinks =
    state.mode === "personalized"
      ? state.people.reduce((sum, p) => sum + p.drinksPerPerson, 0)
      : state.peopleCount * state.drinksPerPerson;

  const normalPiscoMlPerDrink = state.glassType
    ? usableVolume(GLASS_CONFIG[state.glassType].ml) *
      LEVEL_RATIOS["normal"].liquor
    : 0;

  /* ── Shortage notification (forward only) ── */

  function shortfallInfo(
    valueMl: number,
    bottleMl: number,
    mlPerDrink: number,
  ) {
    if (valueMl <= 0 || mlPerDrink <= 0) return { isShort: false, n: 0 };
    const rounded = Math.round(valueMl);
    const rawRatio = rounded / bottleMl;
    const frac = rawRatio - Math.floor(rawRatio);
    if (frac <= 0 || frac > 0.25) return { isShort: false, n: 0 };
    const shortfallMl = rounded - Math.floor(rawRatio) * bottleMl;
    return { isShort: true, n: Math.ceil(shortfallMl / mlPerDrink) };
  }

  const bebidaMlPerDrink = totalDrinks > 0 ? results.bebidaMl / totalDrinks : 0;
  const piscoShort = shortfallInfo(
    results.liquorMl,
    piscoBottleMl,
    normalPiscoMlPerDrink,
  );
  const bebidaShort = shortfallInfo(
    results.bebidaMl,
    sodaBottleMl,
    bebidaMlPerDrink,
  );
  const iceShort = shortfallInfo(results.iceMl, 1090, 120);

  function buildShortageMsg(
    pisco: boolean,
    bebida: boolean,
    ice: boolean,
    _n: number,
  ): string {
    const items = ([pisco && "pisco", bebida && "bebida", ice && "hielo"] as (string | false)[]).filter(Boolean) as string[];
    if (items.length === 0) return "";
    const list =
      items.length === 1
        ? items[0]
        : items.slice(0, -1).join(", ") + " y " + items[items.length - 1];
    return `Les va a faltar un poco de ${list}. Ahi ven ustedes si compran mas.`;
  }

  const anyShort =
    piscoShort.isShort || bebidaShort.isShort || iceShort.isShort;
  const maxN = Math.max(piscoShort.n, bebidaShort.n, iceShort.n);
  const shortageMsg = anyShort
    ? buildShortageMsg(
        piscoShort.isShort,
        bebidaShort.isShort,
        iceShort.isShort,
        maxN,
      )
    : "";

  // The forward result step index depends on useCase
  const forwardResultStep = state.useCase === "forward" ? 4 : -1;

  /* ── Navigation ── */

  const goForward = () => {
    setDirection("forward");
    setCurrentStep((s) => s + 1);
  };

  const goBack = useCallback(() => {
    if (currentStep === 0) return;

    // Step 1 → Step 0: always warn if data entered, then reset
    if (currentStep === 1) {
      if (state.useCase === "forward") {
        const hasDataEntered = () => {
          if (state.mode === "personalized") return state.people.length > 0;
          return (
            state.peopleCount !== 1 ||
            state.drinksPerPerson !== 3 ||
            state.level !== "normal"
          );
        };
        if (hasDataEntered()) {
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
      }
      // For reverse or forward with no data, just go back
      reset();
      setDirection("backward");
      setCurrentStep(0);
      return;
    }

    setDirection("backward");
    setCurrentStep((s) => s - 1);
  }, [
    currentStep,
    state.useCase,
    state.mode,
    state.people,
    state.peopleCount,
    state.drinksPerPerson,
    state.level,
    reset,
  ]);

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
    setDirectUnit("L");
    setDirectInputValue("");
    setDirection("backward");
    setCurrentStep(0);
  };

  const [copied, setCopied] = useState(false);

  const notifOpacity = useRef(new Animated.Value(0)).current;
  const notifTranslateX = useRef(new Animated.Value(0)).current;
  const notifTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notifTranslateY = notifOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [-16, 0],
  });
  const [notifVisible, setNotifVisible] = useState(false);
  const [displayMsg, setDisplayMsg] = useState("");

  const dismiss = useCallback(() => {
    if (notifTimeout.current) clearTimeout(notifTimeout.current);
    Animated.parallel([
      Animated.timing(notifOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(notifTranslateX, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
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
            Animated.timing(notifTranslateX, {
              toValue: gs.dx > 0 ? 500 : -500,
              duration: 220,
              useNativeDriver: true,
            }),
            Animated.timing(notifOpacity, {
              toValue: 0,
              duration: 220,
              useNativeDriver: true,
            }),
          ]).start(() => {
            notifTranslateX.setValue(0);
            setNotifVisible(false);
          });
        } else {
          Animated.spring(notifTranslateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  useEffect(() => {
    if (currentStep !== forwardResultStep || !anyShort) {
      dismiss();
      return;
    }
    if (shortageMsg) setDisplayMsg(shortageMsg);
    if (notifTimeout.current) clearTimeout(notifTimeout.current);
    notifTranslateX.setValue(0);
    notifOpacity.setValue(0);
    setNotifVisible(true);
    Animated.timing(notifOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    notifTimeout.current = setTimeout(dismiss, 5000);
    return () => {
      if (notifTimeout.current) clearTimeout(notifTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, anyShort, shortageMsg, forwardResultStep]);

  const handleCopy = async () => {
    const smartCount = (ml: number, bottleMl: number) => {
      const raw = Math.round(ml) / bottleMl;
      const frac = raw - Math.floor(raw);
      return Math.max(
        1,
        frac > 0 && frac <= 0.25 ? Math.floor(raw) : Math.ceil(raw),
      );
    };
    const piscoCount = smartCount(results.liquorMl, piscoBottleMl);
    const sodaCount = smartCount(results.bebidaMl, sodaBottleMl);
    const iceKg = Math.ceil(results.iceMl / 1090);

    const piscoSize =
      piscoBottleMl >= 1000 ? `${piscoBottleMl / 1000}L` : `${piscoBottleMl}mL`;
    const sodaSize =
      sodaBottleMl >= 1000 ? `${sodaBottleMl / 1000}L` : `${sodaBottleMl}mL`;

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
    setCopied(false);
    setTimeout(() => setCopied(false), 2000);
  };

  const FormulaModal = () => (
    <Modal
      transparent
      visible={infoModalVisible}
      animationType="fade"
      onRequestClose={() => setInfoModalVisible(false)}
    >
      <TouchableOpacity
        style={styles.modalBackdrop}
        activeOpacity={1}
        onPress={() => setInfoModalVisible(false)}
      >
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>¿Cómo se calcula?</Text>

          {/* Step 1 */}
          <View style={styles.stepContainer}>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepText}>
                Se calcula el <Text style={{ fontWeight: "bold" }}>volumen útil</Text> del vaso, que es el 90% de su capacidad, menos el hielo:
              </Text>
              <View style={styles.formulaBox}>
                <Text style={styles.formulaText}>
                 Volumen útil = (Volumen del vaso × 0.9) - 120ml
                </Text>
              </View>
            </View>
          </View>

          {/* Step 2 */}
          <View style={styles.stepContainer}>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepText}>
                Este volumen se divide entre pisco y bebida según la <Text style={{ fontWeight: "bold" }}>proporción</Text>, 
                y se multiplica por la <Text style={{ fontWeight: "bold" }}>cantidad de tragos</Text> para obtener el total:
              </Text>
              <View style={styles.formulaBox}>
                <Text style={styles.formulaText}>Total pisco  = Volumen útil × Proporción pisco × N° tragos</Text>
                <Text style={styles.formulaText}>Total bebida = Volumen útil × Proporción bebida × N° tragos</Text>
              </View>
            </View>
          </View>

        </View>
      </TouchableOpacity>
    </Modal>
  );

  /* ── Auto-advance handlers ── */

  const handleUseCaseSelect = (uc: UseCase) => {
    setUseCase(uc);
    setTimeout(goForward, 100);
  };

  const handleModeSelect = (mode: Mode) => {
    setMode(mode);
    setTimeout(goForward, 100);
  };

  const handleGlassSelect = (glass: GlassType) => {
    setGlassType(glass);
    setTimeout(goForward, 100);
  };

  const handleReverseGlassSelect = (glass: GlassType) => {
    setReverseGlassType(glass);
    setTimeout(goForward, 100);
  };

  const handleAddPerson = () => {
    addPerson();
    setTimeout(() => containerRef.current?.scrollContentToEnd(), 50);
  };

  /* ── Bebida modal helpers ── */
  const usedBebidaSizes = state.reverse.bebidaEntries.map((e) => e.sizeMl);
  const availableBebidaSizes = SODA_BOTTLE_SIZES.filter(
    (s) => !usedBebidaSizes.includes(s),
  );

  const handleBebidaAdd = () => {
    if (availableBebidaSizes.length === 1) {
      addBebidaEntry(availableBebidaSizes[0]);
    } else {
      setBebidaModalVisible(true);
    }
  };

  const handleBebidaSizeSelect = (sizeMl: number) => {
    addBebidaEntry(sizeMl);
    setBebidaModalVisible(false);
  };

  /* ── Direct bebida input ── */
  const handleDirectInputChange = (text: string) => {
    setDirectInputValue(text);
    const num = parseFloat(text);
    if (!isNaN(num) && num >= 0) {
      setBebidaDirectMl(directUnit === "L" ? num * 1000 : num);
    } else if (text === "") {
      setBebidaDirectMl(0);
    }
  };

  const handleDirectUnitToggle = (unit: "mL" | "L") => {
    setDirectUnit(unit);
    const num = parseFloat(directInputValue);
    if (!isNaN(num) && num >= 0) {
      setBebidaDirectMl(unit === "L" ? num * 1000 : num);
    }
  };

  /* ── Steps ── */

  // Step 0: Use-case selector (shared)
  const step0: Step = {
    question: "¿Qué necesitas calcular?",
    content: (
      <UseCaseSelector value={state.useCase} onSelect={handleUseCaseSelect} />
    ),
    scrollable: false,
  };

  // Forward steps (same as before, indices 1-4)
  const forwardSteps: Step[] = [
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
            <TouchableOpacity
              style={styles.copyBtn}
              onPress={handleCopy}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={copied ? "check" : "clipboard-text-outline"}
                size={18}
                color={copied ? "#4CAF50" : "#666"}
              />
              <Text
                style={[styles.copyBtnText, copied && styles.copyBtnTextDone]}
              >
                {copied ? "Copiado" : "Copiar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ),
    },
  ];

  // Reverse steps (indices 1-6)
  const rev = state.reverse;
  const piscoLocked = rev.piscoEntries.length > 1;
  const bebidaBottleLocked = rev.bebidaEntries.length > 1;

  const reverseSteps: Step[] = [
    // R1 — Pisco
    {
      question: "Ingresa el Pisco que tienen o planean comprar",
      content: (
        <BottleInput
          entries={rev.piscoEntries}
          availableSizes={PISCO_BOTTLE_SIZES}
          onEntryCountChange={setPiscoEntryCount}
          onEntrySizeChange={setPiscoEntrySize}
          onAdd={addPiscoEntry}
          onRemove={removePiscoEntry}
          maxEntries={2}
          addLabel="+ Añadir botellas de otro tamaño"
          locked={piscoLocked}
        />
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
    // R2 — Bebida
    {
      question: "¿Y la bebida?",
      content: (
        <View style={styles.slideContent}>
          {/* Mode selector */}
          <View style={styles.modeToggleRow}>
            <TouchableOpacity
              style={[
                styles.modeToggle,
                rev.bebidaInputMode === "bottles" && styles.modeToggleActive,
              ]}
              onPress={() => setBebidaInputMode("bottles")}
            >
              <Text
                style={[
                  styles.modeToggleText,
                  rev.bebidaInputMode === "bottles" &&
                    styles.modeToggleTextActive,
                ]}
              >
                Por botellas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeToggle,
                rev.bebidaInputMode === "direct" && styles.modeToggleActive,
              ]}
              onPress={() => setBebidaInputMode("direct")}
            >
              <Text
                style={[
                  styles.modeToggleText,
                  rev.bebidaInputMode === "direct" &&
                    styles.modeToggleTextActive,
                ]}
              >
                Directo en litros
              </Text>
            </TouchableOpacity>
          </View>

          {rev.bebidaInputMode === "bottles" ? (
            <>
              <BottleInput
                entries={rev.bebidaEntries}
                availableSizes={SODA_BOTTLE_SIZES}
                onEntryCountChange={setBebidaEntryCount}
                onEntrySizeChange={setBebidaEntrySize}
                onAdd={handleBebidaAdd}
                onRemove={removeBebidaEntry}
                maxEntries={4}
                addLabel="+ Añadir botellas de otro tamaño"
                locked={bebidaBottleLocked}
              />
              <BebidaSizeModal
                visible={bebidaModalVisible}
                availableSizes={availableBebidaSizes}
                onSelect={handleBebidaSizeSelect}
                onClose={() => setBebidaModalVisible(false)}
              />
            </>
          ) : (
            <View style={styles.directInputContainer}>
              <TextInput
                style={styles.directInput}
                value={directInputValue}
                onChangeText={handleDirectInputChange}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#ccc"
              />
              <View style={styles.unitToggleRow}>
                <TouchableOpacity
                  style={[
                    styles.unitToggle,
                    directUnit === "mL" && styles.unitToggleActive,
                  ]}
                  onPress={() => handleDirectUnitToggle("mL")}
                >
                  <Text
                    style={[
                      styles.unitToggleText,
                      directUnit === "mL" && styles.unitToggleTextActive,
                    ]}
                  >
                    mL
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.unitToggle,
                    directUnit === "L" && styles.unitToggleActive,
                  ]}
                  onPress={() => handleDirectUnitToggle("L")}
                >
                  <Text
                    style={[
                      styles.unitToggleText,
                      directUnit === "L" && styles.unitToggleTextActive,
                    ]}
                  >
                    L
                  </Text>
                </TouchableOpacity>
              </View>
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
    // R3 — Hielo
    {
      question: "¿Y el hielo?",
      content: (
        <View style={styles.slideContent}>
          <View style={styles.modeToggleRow}>
            <TouchableOpacity
              style={[
                styles.modeToggle,
                rev.iceInputMode === "manual" && styles.modeToggleActive,
              ]}
              onPress={() => setIceInputMode("manual")}
            >
              <Text
                style={[
                  styles.modeToggleText,
                  rev.iceInputMode === "manual" && styles.modeToggleTextActive,
                ]}
              >
                Por bolsas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeToggle,
                rev.iceInputMode === "auto" && styles.modeToggleActive,
              ]}
              onPress={() => setIceInputMode("auto")}
            >
              <Text
                style={[
                  styles.modeToggleText,
                  rev.iceInputMode === "auto" && styles.modeToggleTextActive,
                ]}
              >
                Que alcance nomás
              </Text>
            </TouchableOpacity>
          </View>

          {rev.iceInputMode === "manual" && (
            <View style={styles.sameMode}>
              <View style={styles.counterGroup}>
                <Text style={styles.counterLabel}>Bolsas de 1 kg</Text>
                <CountPicker value={rev.iceKg} onChange={setIceKg} />
              </View>
            </View>
          )}

          {rev.iceInputMode === "auto" && (
            <Text style={[styles.hint, { marginTop: 8 }]}>
              El resultado asumirá que tienes todo el hielo que necesitas
            </Text>
          )}
        </View>
      ),
      scrollable: false,
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
    // R4 — Nivel + Personas
    {
      question: "¿Cómo se piensan hacer las piscolas?",
      content: (
        <View style={styles.sameMode}>
          <View style={styles.counterGroup}>
            <Text style={styles.counterLabel}>¿Cómo van a tomar?</Text>
            <LevelPicker
              value={rev.level}
              onChange={setReverseLevel}
              centered
              style={{ width: 150, height: 60 }}
            />
          </View>
          <View style={styles.counterGroup}>
            <Text style={styles.counterLabel}>¿Cuántos weones son?</Text>
            <CountPicker
              value={rev.peopleCount}
              onChange={setReversePeopleCount}
            />
          </View>
        </View>
      ),
      scrollable: false,
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
    // R5 — Vaso
    {
      question: "¿Qué vaso están usando?",
      content: (
        <GlassSelector
          value={rev.glassType}
          onChange={handleReverseGlassSelect}
        />
      ),
      scrollable: false,
    },
    // R6 — Resultado
    {
      question: "Esto es lo que les sale",
      fitContent: true,
      contentStyle: { gap: 8, padding: 12 },
      content: (
        <ReverseResultCard
          result={reverseResults}
          level={rev.level}
          peopleCount={rev.peopleCount}
          onReset={handleReset}
        />
      ),
    },
  ];

  const steps: Step[] = [
    step0,
    ...(state.useCase === "reverse" ? reverseSteps : forwardSteps),
  ];

  return (
    <View style={{ flex: 1 }}>
      <FormulaModal />
        <StepContainer
          ref={containerRef}
          steps={steps}
          currentStep={currentStep}
          direction={direction}
          onBack={goBack}
          onInfo={() => setInfoModalVisible(true)}
        />
      <Animated.View
        pointerEvents={notifVisible ? "box-only" : "none"}
        style={[
          styles.notification,
          {
            opacity: notifOpacity,
            transform: [
              { translateY: notifTranslateY },
              { translateX: notifTranslateX },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={16}
          color="#F5A623"
        />
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "100%",
    maxWidth: 360,
    padding: 24,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
  },
  modalBody: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
    textAlign: "left",
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  stepText: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
  },
  formulaBox: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  formulaText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  // Reverse-specific styles
  modeToggleRow: {
    flexDirection: "row",
    gap: 8,
  },
  modeToggle: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#ddd",
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  modeToggleActive: {
    borderColor: "#F5A623",
    backgroundColor: "#F5A623",
  },
  modeToggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  modeToggleTextActive: {
    color: "#fff",
  },
  directInputContainer: {
    alignItems: "center",
    gap: 12,
  },
  directInput: {
    fontSize: 32,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#F5A623",
    paddingVertical: 8,
    minWidth: 120,
  },
  unitToggleRow: {
    flexDirection: "row",
    gap: 8,
  },
  unitToggle: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#ddd",
    backgroundColor: "#fafafa",
  },
  unitToggleActive: {
    borderColor: "#F5A623",
    backgroundColor: "#F5A623",
  },
  unitToggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  unitToggleTextActive: {
    color: "#fff",
  },
});