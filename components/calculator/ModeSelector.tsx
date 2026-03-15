import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Mode } from "@/types/calculator";

interface Props {
  onSelect: (mode: Mode) => void;
}

export default function ModeSelector({ onSelect }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.card, styles.cardSolid]}
        onPress={() => onSelect("same")}
        activeOpacity={0.85}
      >
        <Text style={styles.emoji}>🍻</Text>
        <View style={styles.textGroup}>
          <Text style={[styles.title, styles.titleLight]}>Todos lo mismo</Text>
          <Text style={[styles.subtitle, styles.subtitleLight]}>
            Misma cantidad para todos
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, styles.cardOutlined]}
        onPress={() => onSelect("personalized")}
        activeOpacity={0.85}
      >
        <Text style={styles.emoji}>🙋</Text>
        <View style={styles.textGroup}>
          <Text style={[styles.title, styles.titleDark]}>Personalizado</Text>
          <Text style={[styles.subtitle, styles.subtitleDark]}>
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
  },
  cardSolid: {
    backgroundColor: "#F5A623",
  },
  cardOutlined: {
    borderWidth: 2,
    borderColor: "#F5A623",
    backgroundColor: "#fff8ee",
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
