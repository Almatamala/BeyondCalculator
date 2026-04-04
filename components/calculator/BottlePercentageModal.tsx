import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface PercentageOption {
  label: string;
  desc: string;
  value: number;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  color: string;
}

const OPTIONS: PercentageOption[] = [
  { label: "Llena", desc: "Sin abrir", value: 100, icon: "bottle-wine", color: "#4CAF50" },
  { label: "Casi llena", desc: "Le sacaron un poco", value: 75, icon: "glass-wine", color: "#F5A623" },
  { label: "La mitad", desc: "Justo por la mitad", value: 50, icon: "circle-half-full", color: "#FF9800" },
  { label: "Un cuarto", desc: "Queda poco", value: 25, icon: "cup-outline", color: "#E53935" },
];

interface Props {
  visible: boolean;
  currentPercentage: number;
  /** When true, shows two action buttons instead of confirming on tap */
  showSplit?: boolean;
  onSelectAll: (percentage: number) => void;
  onSelectOne?: (percentage: number) => void;
  onClose: () => void;
}

export default function BottlePercentageModal({
  visible,
  currentPercentage,
  showSplit,
  onSelectAll,
  onSelectOne,
  onClose,
}: Props) {
  const [editingCustom, setEditingCustom] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [pendingPct, setPendingPct] = useState(currentPercentage);

  useEffect(() => {
    if (visible) setPendingPct(currentPercentage);
  }, [visible, currentPercentage]);

  const handleOptionPress = (value: number) => {
    setEditingCustom(false);
    if (showSplit) {
      setPendingPct(value);
    } else {
      onSelectAll(value);
    }
  };

  const handleCustomChange = (text: string) => {
    setCustomValue(text);
  };

  const handleCustomSubmit = () => {
    const num = parseInt(customValue) || 0;
    const clamped = Math.max(1, Math.min(100, num));
    setEditingCustom(false);
    setCustomValue("");
    if (showSplit) {
      setPendingPct(clamped);
    } else {
      onSelectAll(clamped);
    }
  };

  const handleClose = () => {
    setEditingCustom(false);
    setCustomValue("");
    onClose();
  };

  const activePct = showSplit ? pendingPct : currentPercentage;
  const isCustom = !OPTIONS.some((o) => o.value === activePct);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleClose}
      >
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Cuanto le queda a esta wea?</Text>
          {OPTIONS.map((opt) => {
            const active = !editingCustom && activePct === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.option, active && styles.optionActive]}
                activeOpacity={0.7}
                onPress={() => handleOptionPress(opt.value)}
              >
                <View style={styles.optionIconWrap}>
                  <MaterialCommunityIcons
                    name={opt.icon}
                    size={28}
                    color={active ? "#fff" : opt.color}
                  />
                </View>
                <View style={styles.optionText}>
                  <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
                    {opt.label}
                  </Text>
                  <Text style={[styles.optionDesc, active && styles.optionDescActive]}>
                    {opt.desc}
                  </Text>
                </View>
                <Text style={[styles.optionRatio, active && styles.optionRatioActive]}>
                  {opt.value}%
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Personalizado */}
          <TouchableOpacity
            style={[styles.option, (editingCustom || isCustom) && styles.optionActive]}
            activeOpacity={0.7}
            onPress={() => {
              setCustomValue(isCustom ? String(activePct) : "");
              setEditingCustom(true);
            }}
          >
            <View style={styles.optionIconWrap}>
              <MaterialCommunityIcons
                name="tune"
                size={28}
                color={editingCustom || isCustom ? "#fff" : "#9C27B0"}
              />
            </View>
            <View style={styles.optionText}>
              <Text
                style={[
                  styles.optionLabel,
                  (editingCustom || isCustom) && styles.optionLabelActive,
                ]}
              >
                Personalizado
              </Text>
              <Text
                style={[
                  styles.optionDesc,
                  (editingCustom || isCustom) && styles.optionDescActive,
                ]}
              >
                Escribe el porcentaje
              </Text>
            </View>
            {editingCustom ? (
              <View style={styles.customInputRow}>
                <TextInput
                  style={[
                    styles.optionRatio,
                    styles.customInput,
                    styles.optionRatioActive,
                  ]}
                  value={customValue}
                  onChangeText={handleCustomChange}
                  keyboardType="numeric"
                  maxLength={3}
                  selectTextOnFocus
                  returnKeyType="done"
                  onSubmitEditing={handleCustomSubmit}
                  autoFocus
                />
                <Text style={[styles.optionRatio, styles.optionRatioActive]}>%</Text>
              </View>
            ) : (
              <Text
                style={[
                  styles.optionRatio,
                  isCustom && styles.optionRatioActive,
                ]}
              >
                {isCustom ? `${activePct}%` : "—"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Split action buttons */}
          {showSplit && (
            <View style={styles.splitButtons}>
              <TouchableOpacity
                style={styles.splitBtn}
                activeOpacity={0.8}
                onPress={() => onSelectAll(pendingPct)}
              >
                <Text style={styles.splitBtnText}>Aplicar a todas</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.splitBtn, styles.splitBtnPrimary]}
                activeOpacity={0.8}
                onPress={() => onSelectOne?.(pendingPct)}
              >
                <Text style={[styles.splitBtnText, styles.splitBtnTextPrimary]}>Aplicar a 1 botella</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  customInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  customInput: {
    minWidth: 40,
    textAlign: "center",
    padding: 0,
    margin: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  splitButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  splitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#F5A623",
  },
  splitBtnPrimary: {
    backgroundColor: "#F5A623",
  },
  splitBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F5A623",
  },
  splitBtnTextPrimary: {
    color: "#fff",
  },
});
