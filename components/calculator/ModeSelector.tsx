import React from "react";
import { Button, StyleSheet, View } from "react-native";

import { Mode } from "@/types/calculator";

interface Props {
  onSelect: (mode: Mode) => void;
}

export default function ModeSelector({ onSelect }: Props) {
  // TODO: style as two large branded buttons
  return (
    <View style={styles.container}>
      <Button title="Si" onPress={() => onSelect("same")} />
      <Button title="Personalizado" onPress={() => onSelect("personalized")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
});
