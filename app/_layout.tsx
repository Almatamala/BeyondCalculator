import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import { useState } from "react";
import "react-native-reanimated";
import "../global.css";

import DisclaimerGate from "@/components/DisclaimerGate";
import { CalculatorProvider } from "@/context/CalculatorContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

const DISCLAIMER_KEY = "disclaimerAccepted";

function readAccepted(): boolean {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return localStorage.getItem(DISCLAIMER_KEY) === "true";
  }
  return false;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [accepted, setAccepted] = useState(readAccepted);

  const handleAccept = () => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      localStorage.setItem(DISCLAIMER_KEY, "true");
    }
    setAccepted(true);
  };

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <CalculatorProvider>
        <Slot />
        <StatusBar style="auto" />
        {!accepted && <DisclaimerGate onAccept={handleAccept} />}
      </CalculatorProvider>
    </ThemeProvider>
  );
}