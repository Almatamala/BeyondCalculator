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
  return ml % 1000 === 0 ? `${ml / 1000} L` : `${ml} ml`;
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
  const count = Math.ceil(valueMl / selectedBottleMl);
  const leftoverMl = count * selectedBottleMl - rounded;
  const leftoverPct = Math.round((leftoverMl / selectedBottleMl) * 100);
  const unitLabel = count === 1 ? unit.singular : unit.plural;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {!hideVolume && (
          <Text style={styles.total}>{totalLabel ?? `${rounded} ml`}</Text>
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
        {leftoverPct > 0 ? (
          <Text style={styles.leftover}>Te sobra ~{leftoverPct}% de una {unit.singular}</Text>
        ) : (
          <Text style={styles.leftoverNone}>Sin sobras 🎯</Text>
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
  leftoverNone: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
});
