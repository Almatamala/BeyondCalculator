import React from 'react';
import { StyleSheet, View } from 'react-native';

interface Props {
  total: number;
  current: number;
}

export default function SlideProgress({ total, current }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === current && styles.dotActive,
            i < current && styles.dotDone,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  dotDone: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  dotActive: {
    width: 24,           // active dot stretches into a pill
    backgroundColor: '#F5A623',   // warm amber from the image palette
  },
});
