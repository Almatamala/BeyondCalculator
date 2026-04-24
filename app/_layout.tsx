import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import "react-native-reanimated";
import "../global.css";

import DisclaimerGate from "@/components/DisclaimerGate";
import { CalculatorProvider } from "@/context/CalculatorContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

const AGE_GATE_CONFIRMATION_KEY = "ageGateConfirmed";
const isWebPlatform = Platform.OS === "web";

function canUseBrowserStorage(): boolean {
  return isWebPlatform && typeof window !== "undefined";
}

function readAgeGateConfirmation(): boolean {
  if (canUseBrowserStorage()) {
    return localStorage.getItem(AGE_GATE_CONFIRMATION_KEY) === "true";
  }
  return false;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [hasConfirmedLegalAge, setHasConfirmedLegalAge] = useState(false);
  const [hasResolvedAgeGateState, setHasResolvedAgeGateState] = useState(
    () => !isWebPlatform,
  );

  useEffect(() => {
    if (!isWebPlatform) return;

    const storedConfirmation = readAgeGateConfirmation();
    setHasConfirmedLegalAge(storedConfirmation);
    setHasResolvedAgeGateState(true);
  }, []);

  const handleAgeConfirmation = () => {
    if (canUseBrowserStorage()) {
      localStorage.setItem(AGE_GATE_CONFIRMATION_KEY, "true");
    }

    setHasConfirmedLegalAge(true);
  };

  if (!hasResolvedAgeGateState) {
    return (
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <CalculatorProvider>
          <DisclaimerGate mode="checking" />
          <StatusBar style="auto" />
        </CalculatorProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <CalculatorProvider>
        <Slot />
        <StatusBar style="auto" />
        {!hasConfirmedLegalAge && (
          <DisclaimerGate onConfirmAge={handleAgeConfirmation} />
        )}
      </CalculatorProvider>
    </ThemeProvider>
  );
}
