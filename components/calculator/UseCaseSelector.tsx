import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { UseCase } from "@/types/calculator";

interface Props {
  value: UseCase | null;
  onSelect: (uc: UseCase) => void;
}

export default function UseCaseSelector({ value, onSelect }: Props) {
  const isReverse = value === "reverse";
  const isForward = value === "forward";

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.card,
          isReverse ? styles.cardActive : styles.cardDefault,
        ]}
        onPress={() => onSelect("reverse")}
        activeOpacity={0.85}
      >
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons
            name="glass-cocktail"
            size={28}
            color={isReverse ? "#fff" : "#F5A623"}
          />
        </View>
        <View style={styles.textGroup}>
          <Text
            style={[
              styles.title,
              isReverse ? styles.titleLight : styles.titleDark,
            ]}
          >
            ¿Cuántas piscolas nos saldrán?
          </Text>
          <Text
            style={[
              styles.subtitle,
              isReverse ? styles.subtitleLight : styles.subtitleDark,
            ]}
          >
            Yo ingreso lo que tengo y me dices qué sale
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.card,
          isForward ? styles.cardActive : styles.cardDefault,
        ]}
        onPress={() => onSelect("forward")}
        activeOpacity={0.85}
      >
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons
            name="cart"
            size={28}
            color={isForward ? "#fff" : "#F5A623"}
          />
        </View>
        <View style={styles.textGroup}>
          <Text
            style={[
              styles.title,
              isForward ? styles.titleLight : styles.titleDark,
            ]}
          >
            ¿Cuánto copete compramos?
          </Text>
          <Text
            style={[
              styles.subtitle,
              isForward ? styles.subtitleLight : styles.subtitleDark,
            ]}
          >
            Dime qué necesito
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
