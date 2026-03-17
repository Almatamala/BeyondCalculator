import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle
} from "react-native";

import { LEVEL_LABELS, LEVEL_RATIOS } from "@/constants/drinks";
import { DrinkLevel } from "@/types/calculator";

const LEVELS: DrinkLevel[] = ["algo piola", "normal", "'algo piola'", "desquiciado", "personalizado"];

const LEVEL_ICON: Record<DrinkLevel, { name: React.ComponentProps<typeof MaterialCommunityIcons>["name"]; color: string }> = {
  "algo piola": { name: "leaf", color: "#4CAF50" },
  normal: { name: "glass-cocktail", color: "#F5A623" },
  "'algo piola'": { name: "fire", color: "#E53935" },
  desquiciado: { name: "skull-outline", color: "#282828" },
  personalizado: { name: "tune", color: "#9C27B0" },
};

const LEVEL_DESC: Record<DrinkLevel, string> = {
  "algo piola": "Mañana entro a las 8",
  normal: "La de siempre",
  "'algo piola'": "Pa' valientes",
  desquiciado: "Objetivo : apagar tele",
  personalizado: "hace voh la wea",
};

interface Props {
  value: DrinkLevel;
  onChange: (level: DrinkLevel) => void;
  centered?: boolean;
  style?: ViewStyle;
}

export default function LevelPicker({
  value,
  onChange,
  centered = false,
  style,
}: Props) {
  const [open, setOpen] = useState(false);
  const [customPercentage, setCustomPercentage] = useState(100);
  const [editingPersonalizado, setEditingPersonalizado] = useState(false);
  const liquorPct = value === "personalizado" ? customPercentage : Math.round(LEVEL_RATIOS[value].liquor * 100);

  const handlePersonalizadoPercentageChange = (text: string) => {
    const percentage = parseInt(text) || 0;
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    setCustomPercentage(clampedPercentage);
    
    // Actualizar LEVEL_RATIOS con el nuevo porcentaje
    LEVEL_RATIOS["personalizado"] = {
      liquor: clampedPercentage / 100,
      soda: (100 - clampedPercentage) / 100
    };
  };

  const handlePersonalizadoSubmit = () => {
    setEditingPersonalizado(false);
    setOpen(false);
  };

  const select = (
    <TouchableOpacity
      style={[styles.select, centered && styles.selectCentered]}
      onPress={() => setOpen(true)}
    >
      <MaterialCommunityIcons name={LEVEL_ICON[value].name} size={16} color={LEVEL_ICON[value].color} />
      <Text style={styles.selectText}>{LEVEL_LABELS[value]}</Text>
      <Text style={[styles.chevron, centered && styles.chevronRight]}>▾</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <View style={[styles.colContainer, style]}>
        {select}
        <Text style={styles.ratioBelow}>{liquorPct}% pisco por vaso</Text>
      </View>

      <Modal
        transparent
        visible={open}
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>% de pisco por vaso</Text>
            {LEVELS.map((level) => {
              const active = value === level;
              return (
                <TouchableOpacity
                  key={level}
                  style={[styles.option, active && styles.optionActive]}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (level === "personalizado") {
                      onChange("personalizado");
                      setEditingPersonalizado(true);
                    } else {
                      onChange(level);
                      setOpen(false);
                    }
                  }}
                >
                  <View style={styles.optionIconWrap}>
                    <MaterialCommunityIcons
                      name={LEVEL_ICON[level].name}
                      size={28}
                      color={active ? "#fff" : LEVEL_ICON[level].color}
                    />
                  </View>
                  <View style={styles.optionText}>
                    <Text
                      style={[
                        styles.optionLabel,
                        active && styles.optionLabelActive,
                      ]}
                    >
                      {LEVEL_LABELS[level]}
                    </Text>
                    <Text
                      style={[
                        styles.optionDesc,
                        active && styles.optionDescActive,
                      ]}
                    >
                      {LEVEL_DESC[level]}
                    </Text>
                  </View>
                  {level === "personalizado" && editingPersonalizado ? (
                    <View style={styles.optionRatioContainer}>
                      <TextInput
                        style={[
                          styles.optionRatio,
                          styles.optionRatioInput,
                          active && styles.optionRatioActive,
                        ]}
                        value={customPercentage.toString()}
                        onChangeText={handlePersonalizadoPercentageChange}
                        keyboardType="numeric"
                        maxLength={3}
                        selectTextOnFocus
                        returnKeyType="done"
                        onSubmitEditing={handlePersonalizadoSubmit}
                        autoFocus
                      />
                      <Text style={[styles.optionRatio, active && styles.optionRatioActive]}>%</Text>
                    </View>
                  ) : (
                    <Text
                      style={[
                        styles.optionRatio,
                        active && styles.optionRatioActive,
                      ]}
                    >
                      {level === "personalizado" ? customPercentage : Math.round(LEVEL_RATIOS[level].liquor * 100)}%
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  colContainer: {
    alignItems: "stretch",
    gap: 4,
  },
  select: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fafafa",
    flex: 1,
  },
  selectCentered: {
    justifyContent: "center",
  },
  selectText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  chevronRight: {
    position: "absolute",
    right: 12,
  },
  chevron: {
    fontSize: 16,
    color: "#888",
  },
  ratioBelow: {
    fontSize: 12,
    color: "#333",
    opacity: 0.35,
    textAlign: "center",
  },

  // Modal
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  sheet: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "100%",
    maxWidth: 360,
    paddingTop: 24,
    paddingBottom: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
    gap: 8,
  },
  sheetTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#aaa",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 14,
  },
  optionActive: {
    backgroundColor: "#F5A623",
  },
  optionIconWrap: {
    width: 36,
    alignItems: "center",
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  optionLabelActive: {
    color: "#fff",
  },
  optionDesc: {
    fontSize: 12,
    color: "#999",
  },
  optionDescActive: {
    color: "rgba(255,255,255,0.8)",
  },
  optionRatio: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
  },
  optionRatioActive: {
    color: "rgba(255,255,255,0.85)",
  },
  optionRatioContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionRatioInput: {
    minWidth: 40,
    textAlign: "center",
    padding: 0,
    margin: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
  },
});