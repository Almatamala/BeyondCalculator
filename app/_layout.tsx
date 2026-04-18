import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router"; // <- cambiar Slot por Stack
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import "react-native-reanimated";
import "../global.css";

import DisclaimerGate from "@/components/DisclaimerGate";
import { CalculatorProvider } from "@/context/CalculatorContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [accepted, setAccepted] = useState(false);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <CalculatorProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { flex: 1 }  }} />
        <StatusBar style="auto" />
        {!accepted && <DisclaimerGate onAccept={() => setAccepted(true)} />}
      </CalculatorProvider>
    </ThemeProvider>
  );
}