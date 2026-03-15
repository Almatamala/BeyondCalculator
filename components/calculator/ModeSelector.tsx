import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Mode } from "@/types/calculator";

interface Props {
  value: Mode | null;
  onSelect: (mode: Mode) => void;
}

export default function ModeSelector({ value, onSelect }: Props) {
  const isSame = value === "same";
  const isPersonalized = value === "personalized";

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.card, isSame ? styles.cardActive : styles.cardDefault]}
        onPress={() => onSelect("same")}
        activeOpacity={0.85}
      >
        <Text style={styles.emoji}>🍻</Text>
        <View style={styles.textGroup}>
          <Text style={[styles.title, isSame ? styles.titleLight : styles.titleDark]}>
            Todos lo mismo
          </Text>
          <Text style={[styles.subtitle, isSame ? styles.subtitleLight : styles.subtitleDark]}>
            Misma cantidad para todos
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, isPersonalized ? styles.cardActive : styles.cardDefault]}
        onPress={() => onSelect("personalized")}
        activeOpacity={0.85}
      >
        <Text style={styles.emoji}>🙋</Text>
        <View style={styles.textGroup}>
          <Text style={[styles.title, isPersonalized ? styles.titleLight : styles.titleDark]}>
            Personalizado
          </Text>
          <Text style={[styles.subtitle, isPersonalized ? styles.subtitleLight : styles.subtitleDark]}>
            Cada weon/a elige lo suyo
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 18,
    gap: 16,
    borderWidth: 2,
  },
  cardDefault: {
    borderColor: "#e0e0e0",
    backgroundColor: "#fafafa",
  },
  cardActive: {
    borderColor: "#F5A623",
    backgroundColor: "#F5A623",
  },
  emoji: {
    fontSize: 28,
  },
  textGroup: {
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  titleLight: {
    color: "#fff",
  },
  titleDark: {
    color: "#333",
  },
  subtitle: {
    fontSize: 13,
  },
  subtitleLight: {
    color: "rgba(255,255,255,0.8)",
  },
  subtitleDark: {
    color: "#999",
  },
});
