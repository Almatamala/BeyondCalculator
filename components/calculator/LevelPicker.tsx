import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { LEVEL_LABELS } from "@/constants/drinks";
import { DrinkLevel } from "@/types/calculator";

const LEVELS: DrinkLevel[] = ["algo piola", "normal", "'algo piola'"];

interface Props {
  value: DrinkLevel;
  onChange: (level: DrinkLevel) => void;
}

export default function LevelPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity style={styles.select} onPress={() => setOpen(true)}>
        <Text style={styles.selectText}>{LEVEL_LABELS[value]}</Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>

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
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
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
  },
  selectText: {
    fontSize: 14,
    color: "#333",
  },
  chevron: {
    fontSize: 16,
    color: "#888",
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
    width: 220,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  option: {
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
});
