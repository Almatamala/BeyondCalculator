import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { GLASS_LABELS } from '@/constants/drinks';
import { GlassType } from '@/types/calculator';

const GLASSES: GlassType[] = ['highball', 'rocks', 'shot', 'pint'];

interface Props {
  value: GlassType | null;
  onChange: (glass: GlassType) => void;
}

export default function GlassSelector({ value, onChange }: Props) {
  // TODO: style as visual cards, add glass icons/illustrations
  return (
    <View style={styles.grid}>
      {GLASSES.map(glass => (
        <TouchableOpacity
          key={glass}
          style={[styles.card, value === glass && styles.cardActive]}
          onPress={() => onChange(glass)}
        >
          <Text style={[styles.label, value === glass && styles.labelActive]}>
            {GLASS_LABELS[glass]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 12,
  },
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    alignItems: 'center',
  },
  cardActive: {
    borderColor: '#000',
    backgroundColor: '#000',
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  labelActive: {
    color: '#fff',
  },
});
