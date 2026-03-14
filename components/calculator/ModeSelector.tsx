import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

import { Mode } from '@/types/calculator';

interface Props {
  onSelect: (mode: Mode) => void;
}

export default function ModeSelector({ onSelect }: Props) {
  // TODO: style as two large branded buttons
  return (
    <View style={styles.container}>
      <Button title="Everyone drinks the same" onPress={() => onSelect('same')} />
      <Button title="Personalized" onPress={() => onSelect('personalized')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
});
