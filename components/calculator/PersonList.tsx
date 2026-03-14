import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { DrinkLevel, Person } from "@/types/calculator";
import LevelPicker from "./LevelPicker";

const AVATAR = require("@/assets/images/blank_user.webp");

interface Props {
  people: Person[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onNameChange: (id: string, name: string) => void;
  onLevelChange: (id: string, level: DrinkLevel) => void;
}

export default function PersonList({
  people,
  onAdd,
  onRemove,
  onNameChange,
  onLevelChange,
}: Props) {
  return (
    <View style={styles.container}>
      {people.map(person => (
        <View key={person.id} style={styles.card}>
          {/* top row: avatar | name input | × */}
          <View style={styles.row}>
            <Image source={AVATAR} style={styles.avatar} />
            <TextInput
              style={styles.nameInput}
              value={person.name}
              onChangeText={text => onNameChange(person.id, text)}
              placeholder="Nombre"
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(person.id)}>
              <Text style={styles.removeBtnText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* level picker indented under the name */}
          <View style={styles.levelRow}>
            <LevelPicker
              value={person.level}
              onChange={level => onLevelChange(person.id, level)}
            />
          </View>
        </View>
      ))}

      {/* add person row */}
      <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
        <Image source={AVATAR} style={[styles.avatar, { opacity: 0.3 }]} />
        <Text style={styles.addBtnText}>+ Agregar persona</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  card: {
    backgroundColor: "#f7f7f7",
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
  },
  nameInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#222",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 4,
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
  levelRow: {
    paddingLeft: 50, // aligns with name input (avatar 40 + gap 10)
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: "#F5A623",
    borderRadius: 14,
    borderStyle: "dashed",
  },
  addBtnText: {
    fontSize: 15,
    color: "#F5A623",
    fontWeight: "600",
  },
});
