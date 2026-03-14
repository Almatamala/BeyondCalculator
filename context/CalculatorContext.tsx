import React, { createContext, useContext, useState } from "react";

import { CalculatorState, DrinkLevel, GlassType, Mode, Person } from "@/types/calculator";

interface CalculatorContextValue {
  state: CalculatorState;
  setMode: (mode: Mode) => void;
  setPeopleCount: (count: number) => void;
  addPerson: () => void;
  removePerson: (id: string) => void;
  setPersonName: (id: string, name: string) => void;
  setPersonLevel: (id: string, level: DrinkLevel) => void;
  setGlassType: (glass: GlassType) => void;
  reset: () => void;
}

const initialState: CalculatorState = {
  mode: null,
  peopleCount: 1,
  people: [],
  glassType: null,
};

const CalculatorContext = createContext<CalculatorContextValue | null>(null);

export function CalculatorProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CalculatorState>(initialState);

  const setMode = (mode: Mode) =>
    setState(s => ({ ...s, mode }));

  const setPeopleCount = (peopleCount: number) =>
    setState(s => ({ ...s, peopleCount }));

  const addPerson = () =>
    setState(s => {
      const n = s.people.length + 1;
      const newPerson: Person = {
        id: String(Date.now()),
        name: `Weon/a ${n}`,
        level: "normal",
      };
      return { ...s, people: [...s.people, newPerson] };
    });

  const removePerson = (id: string) =>
    setState(s => ({ ...s, people: s.people.filter(p => p.id !== id) }));

  const setPersonName = (id: string, name: string) =>
    setState(s => ({
      ...s,
      people: s.people.map(p => (p.id === id ? { ...p, name } : p)),
    }));

  const setPersonLevel = (id: string, level: DrinkLevel) =>
    setState(s => ({
      ...s,
      people: s.people.map(p => (p.id === id ? { ...p, level } : p)),
    }));

  const setGlassType = (glassType: GlassType) =>
    setState(s => ({ ...s, glassType }));

  const reset = () => setState(initialState);

  return (
    <CalculatorContext.Provider
      value={{
        state,
        setMode,
        setPeopleCount,
        addPerson,
        removePerson,
        setPersonName,
        setPersonLevel,
        setGlassType,
        reset,
      }}
    >
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculator() {
  const ctx = useContext(CalculatorContext);
  if (!ctx) throw new Error("useCalculator must be used inside <CalculatorProvider>");
  return ctx;
}
