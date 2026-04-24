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

const DISCLAIMER_KEY = "disclaimerAccepted";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [accepted, setAccepted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      setAccepted(localStorage.getItem(DISCLAIMER_KEY) === "true");
    }
    setMounted(true);
  }, []);

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
        {mounted && !accepted && <DisclaimerGate onAccept={handleAccept} />} // 👈
      </CalculatorProvider>
    </ThemeProvider>
  );
}