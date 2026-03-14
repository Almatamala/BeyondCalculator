import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";

import { CalculatorProvider } from "@/context/CalculatorContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "calculator",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <CalculatorProvider>
        <Stack>
          <Stack.Screen name="calculator" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </CalculatorProvider>
    </ThemeProvider>
  );
}
