import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import CountPicker from "@/components/countPicker";
import { PISCO_BOTTLE_SIZES, SODA_BOTTLE_SIZES } from "@/constants/drinks";
import { PromoEntry } from "@/types/calculator";

interface Props {
  entries: PromoEntry[];
  onPiscoSizeChange: (id: string, sizeMl: number) => void;
  onBebidaSizeChange: (id: string, sizeMl: number) => void;
  onCountChange: (id: string, count: number) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}

function formatSize(ml: number): string {
  return ml >= 1000 ? `${ml / 1000}L` : `${ml}ml`;
}

const SizeSelector = ({
  label,
  sizes,
  selectedSize,
  onSizeChange,
}: {
  label: string;
  sizes: readonly number[];
  selectedSize: number;
  onSizeChange: (size: number) => void;
}) => (
  <View style={styles.sizeSection}>
    <Text style={styles.sizeLabel}>{label}</Text>
    <View style={styles.pillRow}>
      {sizes.map((size) => (
        <TouchableOpacity
          key={size}
          style={[styles.pill, selectedSize === size && styles.pillActive]}
          onPress={() => onSizeChange(size)}
          activeOpacity={0.7}
        >
          <Text style={[styles.pillText, selectedSize === size && styles.pillTextActive]}>
            {formatSize(size)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export default function PromoInput({
  entries,
  onPiscoSizeChange,
  onBebidaSizeChange,
  onCountChange,
  onAdd,
  onRemove,
}: Props) {
  return (
    <View style={styles.container}>
      {entries.map((entry) => (
        <View key={entry.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Promo </Text>
            {entries.length > 1 && (
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => onRemove(entry.id)}
              >
                <Text style={styles.removeBtnText}>×</Text>
              </TouchableOpacity>
            )}
          </View>

          <SizeSelector
            label="Pisco"
            sizes={PISCO_BOTTLE_SIZES}
            selectedSize={entry.piscoSizeMl}
            onSizeChange={(size) => onPiscoSizeChange(entry.id, size)}
          />

          <SizeSelector
            label="Bebida"
            sizes={SODA_BOTTLE_SIZES}
            selectedSize={entry.bebidaSizeMl}
            onSizeChange={(size) => onBebidaSizeChange(entry.id, size)}
          />

          {/* Quantity */}
          <View style={styles.countSection}>
            <Text style={styles.sizeLabel}>Cantidad</Text>
            <CountPicker
              value={entry.count}
              onChange={(count) => onCountChange(entry.id, count)}
            />
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={styles.addBtn}
        onPress={onAdd}
        activeOpacity={0.7}
      >
        <Text style={styles.addBtnText}>+ Añadir otra promo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  card: {
    backgroundColor: "#f7f7f7",
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  removeBtnText: {
    fontSize: 18,
    color: "#666",
    lineHeight: 20,
  },
  sizeSection: {
    gap: 6,
  },
  sizeLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  pillRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  pillActive: {
    borderColor: "#F5A623",
    backgroundColor: "#F5A623",
  },
  pillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  pillTextActive: {
    color: "#fff",
  },
  countSection: {
    alignItems: "center",
    gap: 6,
  },
  addBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: "#F5A623",
    borderRadius: 14,
    borderStyle: "dashed",
    alignItems: "center",
  },
  addBtnText: {
    fontSize: 15,
    color: "#F5A623",
    fontWeight: "600",
  },
});