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
            <Text style={styles.cardTitle}>Promo</Text>
            {entries.length > 1 && (
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => onRemove(entry.id)}
              >
                <Text style={styles.removeBtnText}>×</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Pisco size */}
          <View style={styles.sizeSection}>
            <Text style={styles.sizeLabel}>Pisco</Text>
            <View style={styles.pillRow}>
              {PISCO_BOTTLE_SIZES.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.pill,
                    entry.piscoSizeMl === size && styles.pillActive,
                  ]}
                  onPress={() => onPiscoSizeChange(entry.id, size)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.pillText,
                      entry.piscoSizeMl === size && styles.pillTextActive,
                    ]}
                  >
                    {formatSize(size)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bebida size */}
          <View style={styles.sizeSection}>
            <Text style={styles.sizeLabel}>Bebida</Text>
            <View style={styles.pillRow}>
              {SODA_BOTTLE_SIZES.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.pill,
                    entry.bebidaSizeMl === size && styles.pillActive,
                  ]}
                  onPress={() => onBebidaSizeChange(entry.id, size)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.pillText,
                      entry.bebidaSizeMl === size && styles.pillTextActive,
                    ]}
                  >
                    {formatSize(size)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

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

      <TouchableOpacity style={styles.addBtn} onPress={onAdd} activeOpacity={0.7}>
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
