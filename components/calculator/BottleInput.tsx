import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import CountPicker from "@/components/countPicker";
import { BottleEntry } from "@/types/calculator";

interface Props {
  entries: BottleEntry[];
  availableSizes: number[];
  onEntryCountChange: (id: string, count: number) => void;
  onEntrySizeChange: (id: string, sizeMl: number) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  maxEntries: number;
  addLabel: string;
  locked: boolean;
}

function formatSize(ml: number): string {
  return ml >= 1000 ? `${ml / 1000}L` : `${ml}ml`;
}

export default function BottleInput({
  entries,
  availableSizes,
  onEntryCountChange,
  onEntrySizeChange,
  onAdd,
  onRemove,
  maxEntries,
  addLabel,
  locked,
}: Props) {
  return (
    <View style={styles.container}>
      {entries.map((entry) => (
        <View key={entry.id} style={styles.card}>
          <View style={styles.cardHeader}>
            {locked ? (
              <View style={[styles.pill, styles.pillActive]}>
                <Text style={styles.pillTextActive}>{formatSize(entry.sizeMl)}</Text>
              </View>
            ) : (
              <View style={styles.pillRow}>
                {availableSizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[styles.pill, entry.sizeMl === size && styles.pillActive]}
                    onPress={() => onEntrySizeChange(entry.id, size)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        entry.sizeMl === size && styles.pillTextActive,
                      ]}
                    >
                      {formatSize(size)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {entries.length > 1 && (
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => onRemove(entry.id)}
              >
                <Text style={styles.removeBtnText}>×</Text>
              </TouchableOpacity>
            )}
          </View>
          <CountPicker
            value={entry.count}
            onChange={(count) => onEntryCountChange(entry.id, count)}
          />
        </View>
      ))}
      {entries.length < maxEntries && (
        <TouchableOpacity style={styles.addBtn} onPress={onAdd} activeOpacity={0.7}>
          <Text style={styles.addBtnText}>{addLabel}</Text>
        </TouchableOpacity>
      )}
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
    alignItems: "center",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  pillRow: {
    flexDirection: "row",
    gap: 8,
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
