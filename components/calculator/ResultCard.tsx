import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  label: string;
  valueMl: number;
}

export default function ResultCard({ label, valueMl }: Props) {
  // TODO: style as a branded output card
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{valueMl} ml</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 24,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
  },
});
