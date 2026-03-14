import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

import { DrinkLevel, Person } from '@/types/calculator';
import LevelPicker from './LevelPicker';

interface Props {
  people: Person[];
  onAdd: () => void;
  onLevelChange: (id: string, level: DrinkLevel) => void;
}

export default function PersonList({ people, onAdd, onLevelChange }: Props) {
  // TODO: style rows, add remove-person button per row
  return (
    <View style={styles.container}>
      {people.map((person, index) => (
        <View key={person.id} style={styles.row}>
          <Text style={styles.label}>Person {index + 1}</Text>
          <LevelPicker
            value={person.level}
            onChange={level => onLevelChange(person.id, level)}
          />
        </View>
      ))}
      <Button title="+ Add person" onPress={onAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  row: {
    gap: 8,
  },
  label: {
    fontWeight: '600',
  },
});
