import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { LEVEL_RATIOS } from "@/constants/drinks";
import { DrinkLevel } from "@/types/calculator";
import {
  ReverseCalculationResult,
  ReverseSuggestion,
} from "@/utils/calculations";

interface Props {
  result: ReverseCalculationResult;
  level: DrinkLevel;
  peopleCount: number;
  onReset: () => void;
}

const LEFTOVER_MESSAGES = [
  "se lo pelean a combos",
  "va pa'l que lo pille primero",
  "se los pelean entre todos",
  "se los sortean",
  "pal más vio",
  "quedan pa'l after",
  "se los manda el mas weon al seco",
];

function buildSuggestionLabel(s: ReverseSuggestion): string {
  const parts: string[] = [];
  if (s.bebidaAddMl > 0) {
    const size =
      s.bebidaAddMl >= 1000 ? `${s.bebidaAddMl / 1000}L` : `${s.bebidaAddMl}mL`;
    parts.push(`1 bebida de ${size}`);
  }
  if (s.iceAddBags > 0) {
    parts.push(
      s.iceAddBags === 1
        ? "1 bolsa de hielo"
        : `${s.iceAddBags} bolsas de hielo`,
    );
  }
  if (parts.length === 1) return parts[0];
  return `${parts[0]} y ${parts[1]}`;
}

function getLeftoverMsg(n: number): string {
  const idx = Math.floor(Math.random() * LEFTOVER_MESSAGES.length);
  const base = LEFTOVER_MESSAGES[idx];
  if (n === 1) return `El que sobra ${base}`;
  return `Los ${n} que sobran ${base}`;
}

export default function ReverseResultCard({
  result,
  level,
  peopleCount,
  onReset,
}: Props) {
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
            {result.drinksPerPerson}{" "}
            {result.drinksPerPerson === 1 ? "vaso" : "vasos"} cada uno
          </Text>
          {result.leftoverDrinks > 0 && (
            <Text style={styles.leftoverText}>
              {getLeftoverMsg(result.leftoverDrinks)}
            </Text>
          )}
        </View>
      )}

      {result.suggestion && (
        <View style={styles.suggestionCard}>
          <View style={styles.suggestionIconWrap}>
            <MaterialCommunityIcons
              name="information-outline"
              size={22}
              color="#2d7d2d"
            />
          </View>
          <View style={styles.suggestionTextWrap}>
            <Text style={styles.suggestionText}>
              {(() => {
                const diff =
                  result.suggestion.newTotalDrinks - result.totalDrinks;
                return (
                  <>
                    Con{" "}
                    <Text style={styles.suggestionBold}>
                      {buildSuggestionLabel(result.suggestion)} extra
                    </Text>{" "}
                    les alcanzaría para{" "}
                    <Text style={styles.suggestionBold}>
                      {diff} {diff === 1 ? "vaso" : "vasos"}
                    </Text>{" "}
                    más
                    {diff > 3 ? ". No sean cagaos." : ""}
                  </>
                );
              })()}
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.resetBtn}
        onPress={onReset}
        activeOpacity={0.8}
      >
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
  suggestionCard: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: "#f0f9f0",
    borderWidth: 1,
    borderColor: "#86c986",
    borderRadius: 12,
    overflow: "hidden",
    width: "100%",
  },
  suggestionIconWrap: {
    backgroundColor: "#d4edda",
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  suggestionTextWrap: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: "center",
  },
  suggestionText: {
    fontSize: 14,
    color: "#2d7d2d",
    fontWeight: "500",
  },
  suggestionBold: {
    fontWeight: "800",
    fontSize: 16,
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
