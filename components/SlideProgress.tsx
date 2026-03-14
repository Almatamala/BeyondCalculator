import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  total: number;
  current: number;
}

export default function SlideProgress({ total, current }: Props) {
  // TODO: style dots — filled for completed/current, outlined for upcoming
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i === current && styles.dotActive]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
  },
  dotActive: {
    backgroundColor: '#000',
  },
});
