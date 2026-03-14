import { useRef } from "react";
import { Button, Pressable, Text, TextInput, View } from "react-native";

import GlassSelector from "@/components/calculator/GlassSelector";
import ModeSelector from "@/components/calculator/ModeSelector";
import PersonList from "@/components/calculator/PersonList";
import ResultCard from "@/components/calculator/ResultCard";
import SlideContainer, { Slide, SlideContainerRef } from "@/components/SlideContainer";
import { useCalculator } from "@/context/CalculatorContext";
import { Mode } from "@/types/calculator";
import { calculateResults } from "@/utils/calculations";

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
      question: "¿Cuantas personas estan tomando?",
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
          <View style={{ gap: 12, alignItems: 'center' }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: '#D1D5DB',
                overflow: 'hidden',
                backgroundColor: '#F9FAFB',
              }}
            >
              <Pressable
                onPress={() => setPeopleCount(Math.max(1, state.peopleCount - 1))}
                style={({ pressed }) => ({
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                  backgroundColor: pressed ? '#E5E7EB' : 'transparent',
                })}
              >
                <Text style={{ fontSize: 35, fontWeight: '300', color: '#374151' }}> − </Text>
              </Pressable>

              <View style={{ width: 1, height: 28, backgroundColor: '#D1D5DB' }} />

              <TextInput
                value={String(state.peopleCount)}
                onChangeText={(text) => {
                  const num = parseInt(text, 10);
                  if (!isNaN(num) && num >= 1) setPeopleCount(num);
                  else if (text === '') setPeopleCount(1);
                }}
                keyboardType="number-pad"
                selectTextOnFocus
                style={{
                  minWidth: 64,
                  textAlign: 'center',
                  fontSize: 20,
                  fontWeight: '600',
                  color: '#111827',
                  paddingVertical: 14,
                  paddingHorizontal: 8,
                  backgroundColor: '#FFFFFF',
                }}
              />

              <View style={{ width: 1, height: 28, backgroundColor: '#D1D5DB' }} />

              <Pressable
                onPress={() => setPeopleCount(state.peopleCount + 1)}
                style={({ pressed }) => ({
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                  backgroundColor: pressed ? '#E5E7EB' : 'transparent',
                })}
              >
                <Text style={{ fontSize: 35, fontWeight: '300', color: '#374151' }}> + </Text>
              </Pressable>
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
