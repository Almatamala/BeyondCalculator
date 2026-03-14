import GlassSelector from "@/components/calculator/GlassSelector";
import ModeSelector from "@/components/calculator/ModeSelector";
import PersonList from "@/components/calculator/PersonList";
import ResultCard from "@/components/calculator/ResultCard";
import CountPicker from "@/components/countPicker";
import SlideContainer, { Slide, SlideContainerRef } from "@/components/SlideContainer";
import { useCalculator } from "@/context/CalculatorContext";
import { Mode } from "@/types/calculator";
import { calculateResults } from "@/utils/calculations";
import { useRef } from "react";
import { Button, Text, View } from "react-native";

export default function CalculatorScreen() {
  const pagerRef = useRef<SlideContainerRef>(null);

  const {
    state,
    setMode,
    addPerson,
    removePerson,
    setPersonName,
    setPersonLevel,
    setPeopleCount,
    setDrinksPerPerson,
    setGlassType,
    reset,
  } = useCalculator();

  const results = calculateResults(state);

  const handleModeSelect = (mode: Mode) => {
    setMode(mode);
    pagerRef.current?.scrollTo(1);
  };

  const slides: Slide[] = [
    {
      question: "¿Tomarán todos lo mismo?",
      content: <ModeSelector onSelect={handleModeSelect} />,
    },
    {
      question: "¿Cuanto tomaran?",
      content:
        state.mode === "personalized" ? (
          <PersonList
            people={state.people}
            onAdd={addPerson}
            onRemove={removePerson}
            onNameChange={setPersonName}
            onLevelChange={setPersonLevel}
          />
        ) : (
          <View style={{ gap: 24, alignItems: 'center' }}>
            <View style={{ gap: 8, alignItems: 'center' }}>
              <Text style={{ fontSize: 15, fontWeight: '500', color: '#374151' }}>
                ¿Cuántos weones son?
              </Text>
              <CountPicker
                value={state.peopleCount}
                onChange={setPeopleCount}
              />
            </View>

            <View style={{ gap: 8, alignItems: 'center' }}>
              <Text style={{ fontSize: 15, fontWeight: '500', color: '#374151' }}>
                ¿Cuántos vasos tomara cada weon/a?
              </Text>
              <CountPicker
                value={state.drinksPerPerson}
                onChange={setDrinksPerPerson}
              />
            </View>

            <Text style={{ fontSize: 13, color: '#9CA3AF' }}>
              Toca el número para escribir directamente
            </Text>
          </View>
        ),
    },
    {
      question: "¿Qué vaso están usando?",
      content: <GlassSelector value={state.glassType} onChange={setGlassType} />,
    },
    {
      question: "Esto es lo que necesitan",
      content: (
        <View style={{ gap: 16 }}>
          <ResultCard label="Licor" valueMl={results.liquorMl} />
          <ResultCard label="Soda" valueMl={results.sodaMl} />
          <Button title="Empezar de nuevo" onPress={reset} />
        </View>
      ),
    },
  ];

  return <SlideContainer ref={pagerRef} slides={slides} />;
}
