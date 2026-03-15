import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

import { LEVEL_LABELS, LEVEL_RATIOS } from "@/constants/drinks";
import { DrinkLevel } from "@/types/calculator";

const LEVELS: DrinkLevel[] = ["algo piola", "normal", "'algo piola'"];

interface Props {
  value: DrinkLevel;
  onChange: (level: DrinkLevel) => void;
  /** 'row' (default): ratio text to the right of select. 'column': ratio below select. */
  layout?: "row" | "column";
  style?: ViewStyle;
}

export default function LevelPicker({ value, onChange, layout = "row", style }: Props) {
  const [open, setOpen] = useState(false);
  const liquorPct = Math.round(LEVEL_RATIOS[value].liquor * 100);

  const select =
    layout === "column" ? (
      <TouchableOpacity style={[styles.select, styles.selectCentered]} onPress={() => setOpen(true)}>
        <Text style={styles.selectText}>{LEVEL_LABELS[value]}</Text>
        <Text style={[styles.chevron, styles.chevronRight]}>▾</Text>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity style={styles.select} onPress={() => setOpen(true)}>
        <Text style={styles.selectText}>{LEVEL_LABELS[value]}</Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>
    );

  return (
    <>
      {layout === "row" ? (
        <View style={[styles.rowContainer, style]}>
          {select}
          <Text style={styles.ratio}>{liquorPct}% pisco</Text>
        </View>
      ) : (
        <View style={[styles.colContainer, style]}>
          {select}
          <Text style={styles.ratioBelow}>{liquorPct}% pisco</Text>
        </View>
      )}

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.dropdown}>
            {LEVELS.map(level => (
              <TouchableOpacity
                key={level}
                style={[styles.option, value === level && styles.optionActive]}
                onPress={() => { onChange(level); setOpen(false); }}
              >
                <Text style={[styles.optionText, value === level && styles.optionTextActive]}>
                  {LEVEL_LABELS[level]}
                </Text>
                <Text style={[styles.optionRatio, value === level && styles.optionRatioActive]}>
                  {Math.round(LEVEL_RATIOS[level].liquor * 100)}% pisco
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  colContainer: {
    alignItems: "stretch",
    gap: 4,
  },
  select: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fafafa",
    flex: 1,
  },
  selectText: {
    fontSize: 14,
    color: "#333",
  },
  selectCentered: {
    justifyContent: "center",
  },
  chevronRight: {
    position: "absolute",
    right: 12,
  },
  chevron: {
    fontSize: 16,
    color: "#888",
  },
  ratio: {
    fontSize: 13,
    color: "#333",
    opacity: 0.35,
  },
  ratioBelow: {
    fontSize: 12,
    color: "#333",
    opacity: 0.35,
    textAlign: "center",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 14,
    width: 240,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  optionActive: {
    backgroundColor: "#F5A623",
  },
  optionText: {
    fontSize: 15,
    color: "#333",
  },
  optionTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  optionRatio: {
    fontSize: 12,
    color: "#999",
  },
  optionRatioActive: {
    color: "rgba(255,255,255,0.75)",
  },
});
