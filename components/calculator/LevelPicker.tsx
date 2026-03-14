import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { LEVEL_LABELS } from '@/constants/drinks';
import { DrinkLevel } from '@/types/calculator';

const LEVELS: DrinkLevel[] = ['light', 'moderate', 'heavy'];

interface Props {
  value: DrinkLevel;
  onChange: (level: DrinkLevel) => void;
}

export default function LevelPicker({ value, onChange }: Props) {
  // TODO: style as a segmented control with branded colors
  return (
    <View style={styles.row}>
      {LEVELS.map(level => (
        <TouchableOpacity
          key={level}
          style={[styles.option, value === level && styles.optionActive]}
          onPress={() => onChange(level)}
        >
          <Text style={[styles.label, value === level && styles.labelActive]}>
            {LEVEL_LABELS[level]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
  },
  optionActive: {
    borderColor: '#000',
    backgroundColor: '#000',
  },
  label: {
    fontSize: 13,
    color: '#333',
  },
  labelActive: {
    color: '#fff',
  },
});
