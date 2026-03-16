import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Unit {
  singular: string;
  plural: string;
}

interface Props {
  label: string;
  valueMl: number;
  bottleSizes: number[];
  selectedBottleMl: number;
  onBottleSizeChange: (ml: number) => void;
  unit?: Unit;
  hideVolume?: boolean;
  totalLabel?: string;
}

function formatSize(ml: number): string {
  return ml >= 1000 ? `${ml / 1000} L` : `${ml} ml`;
}

function formatVolume(ml: number): string {
  const liters = Math.floor(ml / 1000);
  const remainder = ml % 1000;
  if (liters === 0) return `${ml} mL`;
  if (remainder === 0) return `${liters} L`;
  return `${liters} L ${remainder} mL`;
}

const DEFAULT_UNIT: Unit = { singular: 'botella', plural: 'botellas' };

export default function ResultCard({
  label,
  valueMl,
  bottleSizes,
  selectedBottleMl,
  onBottleSizeChange,
  unit = DEFAULT_UNIT,
  hideVolume = false,
  totalLabel,
}: Props) {
  const rounded = Math.round(valueMl);
  const rawRatio = rounded / selectedBottleMl;
  const fractional = rawRatio - Math.floor(rawRatio);
  // If we'd only use ≤10% of the last bottle, round down to avoid recommending an extra one
  const smartRoundDown = fractional > 0 && fractional <= 0.10;
  const count = Math.max(1, smartRoundDown ? Math.floor(rawRatio) : Math.ceil(rawRatio));
  const diffMl = count * selectedBottleMl - rounded; // positive = surplus, negative = shortage
  const diffPct = Math.round(Math.abs(diffMl / selectedBottleMl) * 100);
  const unitLabel = count === 1 ? unit.singular : unit.plural;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {!hideVolume && (
          <Text style={styles.total}>{totalLabel ?? formatVolume(rounded)}</Text>
        )}
      </View>

      <View style={styles.divider} />

      {/* size picker — hidden when there's only one option */}
      {bottleSizes.length > 1 && (
        <View style={styles.bottleSection}>
          <Text style={styles.sectionLabel}>Tamaño</Text>
          <View style={styles.pills}>
            {bottleSizes.map(size => (
              <TouchableOpacity
                key={size}
                style={[styles.pill, size === selectedBottleMl && styles.pillActive]}
                onPress={() => onBottleSizeChange(size)}
              >
                <Text style={[styles.pillText, size === selectedBottleMl && styles.pillTextActive]}>
                  {formatSize(size)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.result}>
        <Text style={styles.count}>{count} {unitLabel}</Text>
        {bottleSizes.length === 1 && !hideVolume && (
          <Text style={styles.sizeHint}>{formatSize(selectedBottleMl)} por {unit.singular}</Text>
        )}
        {diffMl > 0 ? (
          <Text style={styles.leftover}>Te sobra ~{diffPct}% de una {unit.singular}</Text>
        ) : diffMl < 0 ? (
          <Text style={styles.shortage}>Te falta ~{diffPct}% de una {unit.singular}</Text>
        ) : (
          <View style={styles.leftoverNoneRow}>
            <Text style={styles.leftoverNone}>Sin sobras</Text>
            <MaterialCommunityIcons name="bullseye-arrow" size={14} color="#4CAF50" />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 18,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  total: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  bottleSection: {
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 4,
    gap: 6,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pills: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  pill: {
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#fafafa',
  },
  pillActive: {
    borderColor: '#F5A623',
    backgroundColor: '#fff8ee',
  },
  pillText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  pillTextActive: {
    color: '#F5A623',
    fontWeight: '700',
  },
  result: {
    paddingHorizontal: 14,
    paddingBottom: 8,
    paddingTop: 4,
    gap: 2,
  },
  count: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
  },
  sizeHint: {
    fontSize: 12,
    color: '#bbb',
  },
  leftover: {
    fontSize: 12,
    color: '#999',
  },
  shortage: {
    fontSize: 12,
    color: '#F5A623',
    fontWeight: '500',
  },
  leftoverNoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  leftoverNone: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
});
