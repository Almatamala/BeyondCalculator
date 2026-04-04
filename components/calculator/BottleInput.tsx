import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import CountPicker from "@/components/countPicker";
import { BottleEntry } from "@/types/calculator";

/**
 * BottleInput operates in two modes:
 *
 * **Default (group mode):** Each card = a size group with a CountPicker.
 * Sizes lock when >1 card to prevent duplicates. Used in "separate" flow.
 *
 * **singleBottleMode:** Each card = one physical bottle (size + percentage full).
 * No CountPicker, no size locking, duplicate sizes allowed.
 * Used when adding loose bottles on top of promos (fromPromos/add_more),
 * where users declare individual bottles they already have, possibly partial.
 */
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
  allowEmpty?: boolean;
  emptyMessage?: string;
  emptyAddLabel?: string;
  showPercentage?: boolean;
  onPercentagePress?: (id: string) => void;
  /** Each card = 1 bottle (no CountPicker, no size locking, duplicates OK) */
  singleBottleMode?: boolean;
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
  allowEmpty,
  emptyMessage,
  emptyAddLabel,
  showPercentage,
  onPercentagePress,
  singleBottleMode,
}: Props) {
  const effectiveLocked = singleBottleMode ? false : locked;
  return (
    <View style={styles.container}>
      {entries.length === 0 && emptyMessage ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      ) : (
        entries.map((entry, index) => {
          const isLastEntry = index === entries.length - 1;
          const isCardLocked = effectiveLocked && !isLastEntry;

          const usedSizes = entries
            .filter((e) => e.id !== entry.id)
            .map((e) => e.sizeMl);

          const selectableSizes =
            isLastEntry && effectiveLocked
              ? availableSizes.filter((s) => !usedSizes.includes(s))
              : availableSizes;

          const pct = entry.percentageFull ?? 100;
          return (
            <View key={entry.id} style={styles.card}>
              <View style={styles.cardHeader}>
                {isCardLocked ? (
                  <View style={[styles.pill, styles.pillActive]}>
                    <Text style={styles.pillTextActive}>
                      {formatSize(entry.sizeMl)}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.pillRow}>
                    {selectableSizes.map((size) => (
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
                )}
                {(entries.length > 1 || allowEmpty) && (
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => onRemove(entry.id)}
                  >
                    <Text style={styles.removeBtnText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
              {!singleBottleMode && (
                <CountPicker
                  value={entry.count}
                  onChange={(count) => onEntryCountChange(entry.id, count)}
                />
              )}
              {showPercentage && (
                <TouchableOpacity
                  style={styles.percentageBtn}
                  onPress={() => onPercentagePress?.(entry.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.percentageBtnText}>
                    {pct === 100 ? "Botella llena" : `${pct}% llena`}
                  </Text>
                  <Text style={styles.percentageChevron}>▾</Text>
                </TouchableOpacity>
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
  percentageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  percentageBtnText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
  },
  percentageChevron: {
    fontSize: 12,
    color: "#888",
  },
});