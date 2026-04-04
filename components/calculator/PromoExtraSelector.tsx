import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { PromoExtraMode } from "@/types/calculator";

interface Props {
  value: PromoExtraMode | null;
  onSelect: (mode: PromoExtraMode) => void;
}

export default function PromoExtraSelector({ value, onSelect }: Props) {
  const isDone = value === "done";
  const isAddMore = value === "add_more";

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.card,
          isDone ? styles.cardActive : styles.cardDefault,
        ]}
        onPress={() => onSelect("done")}
        activeOpacity={0.85}
      >
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons
            name="check-circle"
            size={28}
            color={isDone ? "#fff" : "#F5A623"}
          />
        </View>
        <View style={styles.textGroup}>
          <Text
            style={[
              styles.title,
              isDone ? styles.titleLight : styles.titleDark,
            ]}
          >
            No
          </Text>
          <Text
            style={[
              styles.subtitle,
              isDone ? styles.subtitleLight : styles.subtitleDark,
            ]}
          >
            Ya ingresamos todo
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.card,
          isAddMore ? styles.cardActive : styles.cardDefault,
        ]}
        onPress={() => onSelect("add_more")}
        activeOpacity={0.85}
      >
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons
            name="plus-circle"
            size={28}
            color={isAddMore ? "#fff" : "#F5A623"}
          />
        </View>
        <View style={styles.textGroup}>
          <Text
            style={[
              styles.title,
              isAddMore ? styles.titleLight : styles.titleDark,
            ]}
          >
            Añadir más botellas sueltas
          </Text>
          <Text
            style={[
              styles.subtitle,
              isAddMore ? styles.subtitleLight : styles.subtitleDark,
            ]}
          >
            Tenemos más pisco y/o bebida aparte
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
