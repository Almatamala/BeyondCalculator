import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { LEVEL_RATIOS } from "@/constants/drinks";
import { DrinkLevel } from "@/types/calculator";
import { ReverseCalculationResult } from "@/utils/calculations";

interface Props {
  result: ReverseCalculationResult;
  level: DrinkLevel;
  peopleCount: number;
  onReset: () => void;
}

const LEFTOVER_MESSAGES = [
  "se lo pelea a combos",
  "va pa'l que lo pille primero",
  "se los pelean entre todos",
  "se los sortean",
  "los deja el más vio",
  "quedan pa'l after",
];

function getLeftoverMsg(n: number): string {
  const idx = Math.floor(Math.random() * LEFTOVER_MESSAGES.length);
  const base = LEFTOVER_MESSAGES[idx];
  if (n === 1) return `El que sobra ${base}`;
  return `Los ${n} que sobran ${base}`;
}

export default function ReverseResultCard({ result, level, peopleCount, onReset }: Props) {
  const ratio = LEVEL_RATIOS[level];
  const pct = `${Math.round(ratio.liquor * 100)}/${Math.round(ratio.soda * 100)}`;

  return (
    <View style={styles.container}>
      <View style={styles.mainResult}>
        <Text style={styles.bigNumber}>{result.totalDrinks}</Text>
        <Text style={styles.label}>
          {result.totalDrinks === 1 ? "vaso de piscola" : "vasos de piscola"}
        </Text>
        <View style={styles.ratioBadge}>
          <Text style={styles.ratioText}>{pct}</Text>
        </View>
      </View>

      {peopleCount > 1 && (
        <View style={styles.perPersonSection}>
          <Text style={styles.perPersonText}>
            {result.drinksPerPerson} {result.drinksPerPerson === 1 ? "vaso" : "vasos"} cada uno
          </Text>
          {result.leftoverDrinks > 0 && (
            <Text style={styles.leftoverText}>
              {getLeftoverMsg(result.leftoverDrinks)}
            </Text>
          )}
        </View>
      )}

      <TouchableOpacity style={styles.resetBtn} onPress={onReset} activeOpacity={0.8}>
        <Text style={styles.resetBtnText}>Empezar de nuevo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    alignItems: "center",
    paddingVertical: 8,
  },
  mainResult: {
    alignItems: "center",
    gap: 4,
  },
  bigNumber: {
    fontSize: 64,
    fontWeight: "800",
    color: "#F5A623",
    lineHeight: 72,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  ratioBadge: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#fff8ee",
    borderWidth: 1,
    borderColor: "#F5A623",
  },
  ratioText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F5A623",
  },
  perPersonSection: {
    alignItems: "center",
    gap: 4,
  },
  perPersonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
  },
  leftoverText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
  },
  resetBtn: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  resetBtnText: {
    fontSize: 15,
    color: "#666",
    fontWeight: "500",
  },
});
