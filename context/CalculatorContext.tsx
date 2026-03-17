import React, { createContext, useContext, useState } from "react";

import {
  BebidaInputMode,
  BottleEntry,
  CalculatorState,
  DrinkLevel,
  GlassType,
  IceInputMode,
  Mode,
  Person,
  ReverseState,
  UseCase,
} from "@/types/calculator";

interface CalculatorContextValue {
  state: CalculatorState;
  setUseCase: (useCase: UseCase) => void;
  setMode: (mode: Mode) => void;
  setPeopleCount: (count: number) => void;
  addPerson: () => void;
  removePerson: (id: string) => void;
  setPersonName: (id: string, name: string) => void;
  setPersonLevel: (id: string, level: DrinkLevel) => void;
  setPersonDrinks: (id: string, count: number) => void;
  setDrinksPerPerson: (count: number) => void;
  setLevel: (level: DrinkLevel) => void;
  setGlassType: (glass: GlassType) => void;
  setPiscoEntryCount: (id: string, count: number) => void;
  setPiscoEntrySize: (id: string, sizeMl: number) => void;
  addPiscoEntry: () => void;
  removePiscoEntry: (id: string) => void;
  setBebidaInputMode: (mode: BebidaInputMode) => void;
  setBebidaEntryCount: (id: string, count: number) => void;
  setBebidaEntrySize: (id: string, sizeMl: number) => void;
  addBebidaEntry: (sizeMl: number) => void;
  removeBebidaEntry: (id: string) => void;
  setBebidaDirectMl: (ml: number) => void;
  setIceInputMode: (mode: IceInputMode) => void;
  setIceKg: (kg: number) => void;
  setReverseLevel: (level: DrinkLevel) => void;
  setReversePeopleCount: (count: number) => void;
  setReverseGlassType: (glass: GlassType) => void;
  reset: () => void;
}

const initialReverse: ReverseState = {
  piscoEntries: [{ id: "1", sizeMl: 1000, count: 1 }],
  bebidaInputMode: "bottles",
  bebidaEntries: [{ id: "1", sizeMl: 3000, count: 1 }],
  bebidaDirectMl: 0,
  iceInputMode: "manual",
  iceKg: 1,
  level: "normal",
  peopleCount: 1,
  glassType: null,
};

const initialState: CalculatorState = {
  useCase: null,
  mode: null,
  peopleCount: 1,
  drinksPerPerson: 3,
  level: "normal",
  people: [],
  glassType: null,
  reverse: { ...initialReverse },
};

const CalculatorContext = createContext<CalculatorContextValue | null>(null);

export function CalculatorProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CalculatorState>(initialState);

  const setUseCase = (useCase: UseCase) =>
    setState(s => ({ ...s, useCase }));

  const setMode = (mode: Mode) =>
    setState(s => {
      if (mode === "personalized" && s.people.length === 0) {
        const firstPerson: Person = {
          id: String(Date.now()),
          name: "Weon/a 1",
          level: "normal",
          drinksPerPerson: 3,
        };
        return { ...s, mode, people: [firstPerson] };
      }
      return { ...s, mode };
    });

  const setPeopleCount = (peopleCount: number) =>
    setState(s => ({ ...s, peopleCount }));

  const addPerson = () =>
    setState(s => {
      const n = s.people.length + 1;
      const newPerson: Person = {
        id: String(Date.now()),
        name: `Weon/a ${n}`,
        level: "normal",
        drinksPerPerson: 3,
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

  const setPersonDrinks = (id: string, count: number) =>
    setState(s => ({
      ...s,
      people: s.people.map(p => (p.id === id ? { ...p, drinksPerPerson: count } : p)),
    }));

  const setDrinksPerPerson = (count: number) =>
    setState(s => ({ ...s, drinksPerPerson: count }));

  const setLevel = (level: DrinkLevel) =>
    setState(s => ({ ...s, level }));

  const setGlassType = (glassType: GlassType) =>
    setState(s => ({ ...s, glassType }));

  // --- Reverse: Pisco entries ---
  const updateReverse = (fn: (r: ReverseState) => ReverseState) =>
    setState(s => ({ ...s, reverse: fn(s.reverse) }));

  const setPiscoEntryCount = (id: string, count: number) =>
    updateReverse(r => ({
      ...r,
      piscoEntries: r.piscoEntries.map(e => (e.id === id ? { ...e, count } : e)),
    }));

  const setPiscoEntrySize = (id: string, sizeMl: number) =>
    updateReverse(r => ({
      ...r,
      piscoEntries: r.piscoEntries.map(e => (e.id === id ? { ...e, sizeMl } : e)),
    }));

  const addPiscoEntry = () =>
    updateReverse(r => {
      const usedSizes = r.piscoEntries.map(e => e.sizeMl);
      const otherSize = usedSizes.includes(1000) ? 750 : 1000;
      return {
        ...r,
        piscoEntries: [...r.piscoEntries, { id: String(Date.now()), sizeMl: otherSize, count: 1 }],
      };
    });

  const removePiscoEntry = (id: string) =>
    updateReverse(r => ({
      ...r,
      piscoEntries: r.piscoEntries.filter(e => e.id !== id),
    }));

  // --- Reverse: Bebida entries ---
  const setBebidaInputMode = (mode: BebidaInputMode) =>
    updateReverse(r => ({ ...r, bebidaInputMode: mode }));

  const setBebidaEntryCount = (id: string, count: number) =>
    updateReverse(r => ({
      ...r,
      bebidaEntries: r.bebidaEntries.map(e => (e.id === id ? { ...e, count } : e)),
    }));

  const setBebidaEntrySize = (id: string, sizeMl: number) =>
    updateReverse(r => ({
      ...r,
      bebidaEntries: r.bebidaEntries.map(e => (e.id === id ? { ...e, sizeMl } : e)),
    }));

  const addBebidaEntry = (sizeMl: number) =>
    updateReverse(r => ({
      ...r,
      bebidaEntries: [...r.bebidaEntries, { id: String(Date.now()), sizeMl, count: 1 }],
    }));

  const removeBebidaEntry = (id: string) =>
    updateReverse(r => ({
      ...r,
      bebidaEntries: r.bebidaEntries.filter(e => e.id !== id),
    }));

  const setBebidaDirectMl = (ml: number) =>
    updateReverse(r => ({ ...r, bebidaDirectMl: ml }));

  // --- Reverse: Ice ---
  const setIceInputMode = (mode: IceInputMode) =>
    updateReverse(r => ({ ...r, iceInputMode: mode }));

  const setIceKg = (kg: number) =>
    updateReverse(r => ({ ...r, iceKg: kg }));

  // --- Reverse: Level, People, Glass ---
  const setReverseLevel = (level: DrinkLevel) =>
    updateReverse(r => ({ ...r, level }));

  const setReversePeopleCount = (count: number) =>
    updateReverse(r => ({ ...r, peopleCount: count }));

  const setReverseGlassType = (glass: GlassType) =>
    updateReverse(r => ({ ...r, glassType: glass }));

  const reset = () => setState({ ...initialState, reverse: { ...initialReverse } });

  return (
    <CalculatorContext.Provider
      value={{
        state,
        setUseCase,
        setMode,
        setPeopleCount,
        addPerson,
        removePerson,
        setPersonName,
        setPersonLevel,
        setPersonDrinks,
        setDrinksPerPerson,
        setLevel,
        setGlassType,
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
