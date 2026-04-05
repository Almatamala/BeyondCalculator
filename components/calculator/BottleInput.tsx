import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import CountPicker from "@/components/countPicker";
import { BottleEntry } from "@/types/calculator";

interface Props {
  entries: BottleEntry[];
  availableSizes: number[];
  onEntryCountChange: (id: string, count: number) => void;
  onEntrySizeChange: (id: string, sizeMl: number) => void;
  onRemove: (id: string) => void;
  allowEmpty?: boolean;
  emptyMessage?: string;
  showPercentage?: boolean;
  onPercentagePress?: (id: string) => void;
  /** When true, no CountPicker is shown (each card = 1 physical bottle) */
  singleBottleMode?: boolean;
  // kept for backward compat with callers, not used in rendering:
  onAdd?: () => void;
  maxEntries?: number;
  addLabel?: string;
  locked?: boolean;
  emptyAddLabel?: string;
}

function formatSize(ml: number): string {
  return ml >= 1000 ? `${ml / 1000}L` : `${ml}ml`;
}

export default function BottleInput({
  entries,
  availableSizes,
  onEntryCountChange,
  onEntrySizeChange,
  onRemove,
  allowEmpty,
  emptyMessage,
  showPercentage,
  onPercentagePress,
  singleBottleMode,
}: Props) {
  return (
    <View style={styles.container}>
      {entries.length === 0 && emptyMessage ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      ) : (
        entries.map((entry) => {
          const pct = entry.percentageFull ?? 100;
          const showRemove = entries.length > 1 || !!allowEmpty;
          return (
            <View key={entry.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.pillRow}>
                  {availableSizes.map((size) => (
                    <TouchableOpacity
                      key={size}
                      style={[
                        styles.pill,
                        entry.sizeMl === size && styles.pillActive,
                      ]}
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
                <View style={styles.cardActions}>
                  {showPercentage && (
                    <TouchableOpacity
                      style={[
                        styles.percentagePill,
                        pct < 100 && styles.percentagePillActive,
                      ]}
                      onPress={() => onPercentagePress?.(entry.id)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.percentagePillText,
                          pct < 100 && styles.percentagePillTextActive,
                        ]}
                      >
                        {pct}%
                      </Text>
                      <Text
                        style={[
                          styles.percentageChevron,
                          pct < 100 && styles.percentagePillTextActive,
                        ]}
                      >
                        ▾
                      </Text>
                    </TouchableOpacity>
                  )}
                  {showRemove && (
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => onRemove(entry.id)}
                    >
                      <Text style={styles.removeBtnText}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              {!singleBottleMode && (
                <CountPicker
                  value={entry.count}
                  onChange={(count) => onEntryCountChange(entry.id, count)}
                />
              )}
            </View>
          );
        })
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
    gap: 8,
  },
  pillRow: {
    flexDirection: "row",
    gap: 8,
    flex: 1,
    flexWrap: "wrap",
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
  emptyCard: {
    backgroundColor: "#f0f0f0",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
  percentagePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  percentagePillActive: {
    borderColor: "#F5A623",
    backgroundColor: "#FFF3E0",
  },
  percentagePillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
  },
  percentagePillTextActive: {
    color: "#F5A623",
  },
  percentageChevron: {
    fontSize: 10,
    color: "#aaa",
  },
});
