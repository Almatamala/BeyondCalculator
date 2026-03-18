import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ReverseInputMode } from "@/types/calculator";

interface Props {
  value: ReverseInputMode | null;
  onSelect: (mode: ReverseInputMode) => void;
}

export default function ReverseInputModeSelector({ value, onSelect }: Props) {
  const isPromos = value === "promos";
  const isSeparate = value === "separate";

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.card,
          isPromos ? styles.cardActive : styles.cardDefault,
        ]}
        onPress={() => onSelect("promos")}
        activeOpacity={0.85}
      >
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons
            name="package-variant"
            size={28}
            color={isPromos ? "#fff" : "#F5A623"}
          />
        </View>
        <View style={styles.textGroup}>
          <Text
            style={[
              styles.title,
              isPromos ? styles.titleLight : styles.titleDark,
            ]}
          >
            Ingresar Promos
          </Text>
          <Text
            style={[
              styles.subtitle,
              isPromos ? styles.subtitleLight : styles.subtitleDark,
            ]}
          >
            Pisco + bebida juntos en promo
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.card,
          isSeparate ? styles.cardActive : styles.cardDefault,
        ]}
        onPress={() => onSelect("separate")}
        activeOpacity={0.85}
      >
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons
            name="bottle-wine"
            size={28}
            color={isSeparate ? "#fff" : "#F5A623"}
          />
        </View>
        <View style={styles.textGroup}>
          <Text
            style={[
              styles.title,
              isSeparate ? styles.titleLight : styles.titleDark,
            ]}
          >
            Ingresar Pisco y bebida por separado
          </Text>
          <Text
            style={[
              styles.subtitle,
              isSeparate ? styles.subtitleLight : styles.subtitleDark,
            ]}
          >
            Botellas sueltas de cada uno
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
  iconWrap: {
    width: 36,
    alignItems: "center",
  },
  textGroup: {
    flex: 1,
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
