import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import CountPicker from "@/components/countPicker";
import { PISCO_BOTTLE_SIZES, SODA_BOTTLE_SIZES } from "@/constants/drinks";
import { BottleEntry, PromoEntry } from "@/types/calculator";
import BottleInput from "./BottleInput";

interface Props {
  promoEntries: PromoEntry[];
  piscoEntries: BottleEntry[];
  bebidaEntries: BottleEntry[];

  onPromoPiscoSizeChange: (id: string, sizeMl: number) => void;
  onPromoBebidaSizeChange: (id: string, sizeMl: number) => void;
  onPromoCountChange: (id: string, count: number) => void;
  onAddPromo: () => void;
  onRemovePromo: (id: string) => void;

  onPiscoEntryCountChange: (id: string, count: number) => void;
  onPiscoEntrySizeChange: (id: string, sizeMl: number) => void;
  onAddPisco: () => void;
  onRemovePisco: (id: string) => void;

  onBebidaEntryCountChange: (id: string, count: number) => void;
  onBebidaEntrySizeChange: (id: string, sizeMl: number) => void;
  onAddBebida: () => void;
  onRemoveBebida: (id: string) => void;

  piscoLocked: boolean;
  bebidaLocked: boolean;
  onPiscoPercentagePress?: (id: string) => void;
  onBebidaPercentagePress?: (id: string) => void;
}

function formatSize(ml: number): string {
  return ml >= 1000 ? `${ml / 1000}L` : `${ml}ml`;
}

const SizeSelector = ({
  label,
  sizes,
  selectedSize,
  onSizeChange,
  onRemove,
}: {
  label: string;
  sizes: readonly number[];
  selectedSize: number;
  onSizeChange: (size: number) => void;
  onRemove?: () => void;
}) => (
  <View style={styles.sizeSection}>
    <View style={{ flex: 1, gap: 6 }}>
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
    {onRemove && (
      <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
        <Text style={styles.removeBtnText}>×</Text>
      </TouchableOpacity>
    )}
  </View>
);

const DividerTitle = ({ label }: { label: string }) => (
  <View style={styles.dividerContainer}>
    <View style={styles.dividerLine} />
    <Text style={styles.dividerText}>{label}</Text>
    <View style={styles.dividerLine} />
  </View>
);

export default function PromoInput({
  promoEntries,
  piscoEntries,
  bebidaEntries,
  onPromoPiscoSizeChange,
  onPromoBebidaSizeChange,
  onPromoCountChange,
  onAddPromo,
  onRemovePromo,
  onPiscoEntryCountChange,
  onPiscoEntrySizeChange,
  onAddPisco,
  onRemovePisco,
  onBebidaEntryCountChange,
  onBebidaEntrySizeChange,
  onAddBebida,
  onRemoveBebida,
  piscoLocked,
  bebidaLocked,
  onPiscoPercentagePress,
  onBebidaPercentagePress,
}: Props) {
  const piscoMaxed = piscoEntries.length >= 5;
  const bebidaMaxed = bebidaEntries.length >= 5;
  const isEmpty =
    promoEntries.length === 0 &&
    piscoEntries.length === 0 &&
    bebidaEntries.length === 0;

  return (
    <View style={styles.container}>
      {isEmpty ? (
        <Text style={styles.emptyMessage}>
          como planeas tomar piscola sin pisco ni bebida sacowea
        </Text>
      ) : (
        <>
          {promoEntries.length > 0 && (
            <View style={styles.section}>
              <DividerTitle label="Promos" />
              {promoEntries.map((entry) => (
                <View key={entry.id} style={styles.card}>
                  <SizeSelector
                    label="Pisco"
                    sizes={PISCO_BOTTLE_SIZES}
                    selectedSize={entry.piscoSizeMl}
                    onSizeChange={(size) => onPromoPiscoSizeChange(entry.id, size)}
                    onRemove={() => onRemovePromo(entry.id)}
                  />

                  <SizeSelector
                    label="Bebida"
                    sizes={SODA_BOTTLE_SIZES}
                    selectedSize={entry.bebidaSizeMl}
                    onSizeChange={(size) => onPromoBebidaSizeChange(entry.id, size)}
                  />

                  <View style={styles.countSection}>
                    <Text style={styles.sizeLabel}>Cantidad</Text>
                    <CountPicker
                      value={entry.count}
                      onChange={(count) => onPromoCountChange(entry.id, count)}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}

          {piscoEntries.length > 0 && (
            <View style={styles.section}>
              <DividerTitle label="Piscos" />
              <BottleInput
                entries={piscoEntries}
                availableSizes={PISCO_BOTTLE_SIZES}
                onEntryCountChange={onPiscoEntryCountChange}
                onEntrySizeChange={onPiscoEntrySizeChange}
                onAdd={() => {}}
                onRemove={onRemovePisco}
                maxEntries={piscoEntries.length}
                addLabel=""
                locked={piscoLocked}
                allowEmpty={true}
                showPercentage={!!onPiscoPercentagePress}
                onPercentagePress={onPiscoPercentagePress}
              />
            </View>
          )}

          {bebidaEntries.length > 0 && (
            <View style={styles.section}>
              <DividerTitle label="Bebidas" />
              <BottleInput
                entries={bebidaEntries}
                availableSizes={SODA_BOTTLE_SIZES}
                onEntryCountChange={onBebidaEntryCountChange}
                onEntrySizeChange={onBebidaEntrySizeChange}
                onAdd={() => {}}
                onRemove={onRemoveBebida}
                maxEntries={bebidaEntries.length}
                addLabel=""
                locked={bebidaLocked}
                allowEmpty={true}
                showPercentage={!!onBebidaPercentagePress}
                onPercentagePress={onBebidaPercentagePress}
              />
            </View>
          )}
        </>
      )}
      <View style={styles.addButtonsRow}>
        <TouchableOpacity
          style={styles.addBtnSmall}
          onPress={onAddPromo}
          activeOpacity={0.7}
        >
          <Text style={styles.addBtnSmallText}>+ Promo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.addBtnSmall, piscoMaxed && styles.addBtnDisabled]}
          onPress={onAddPisco}
          activeOpacity={0.7}
          disabled={piscoMaxed}
        >
          <Text
            style={[
              styles.addBtnSmallText,
              piscoMaxed && styles.addBtnDisabledText,
            ]}
          >
            + Pisco
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.addBtnSmall, bebidaMaxed && styles.addBtnDisabled]}
          onPress={onAddBebida}
          activeOpacity={0.7}
          disabled={bebidaMaxed}
        >
          <Text
            style={[
              styles.addBtnSmallText,
              bebidaMaxed && styles.addBtnDisabledText,
            ]}
          >
            + Bebida
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  emptyMessage: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 24,
    fontStyle: "italic",
  },
  addButtonsRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  addBtnSmall: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: "#F5A623",
    borderRadius: 12,
    borderStyle: "dashed",
    alignItems: "center",
  },
  addBtnDisabled: {
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
  },
  addBtnSmallText: {
    fontSize: 14,
    color: "#F5A623",
    fontWeight: "600",
  },
  addBtnDisabledText: {
    color: "#999",
  },
  section: {
    gap: 12,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: "#eee",
  },
  dividerText: {
    color: "#666",
    fontWeight: "700",
    fontSize: 16,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
});

export { DividerTitle };

