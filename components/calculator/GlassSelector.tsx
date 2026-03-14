import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { GLASS_CONFIG } from "@/constants/drinks";
import { GlassType } from "@/types/calculator";

const GLASSES = Object.keys(GLASS_CONFIG) as GlassType[];

interface Props {
  value: GlassType | null;
  onChange: (glass: GlassType) => void;
}

export default function GlassSelector({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {GLASSES.map(glass => {
        const config = GLASS_CONFIG[glass];
        const active = value === glass;
        return (
          <TouchableOpacity
            key={glass}
            style={[styles.card, active && styles.cardActive]}
            onPress={() => onChange(glass)}
            activeOpacity={0.8}
          >
            <Image
              source={config.image}
              style={[styles.image, !active && styles.imageInactive]}
              resizeMode="contain"
            />
            <Text style={[styles.label, active && styles.labelActive]}>{config.label}</Text>
            <Text style={[styles.ml, active && styles.mlActive]}>{config.ml} ml</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 12,
  },
  card: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 18,
    gap: 8,
    backgroundColor: "#fafafa",
  },
  cardActive: {
    borderColor: "#F5A623",
    backgroundColor: "#fff8ee",
  },
  image: {
    width: 90,
    height: 110,
  },
  imageInactive: {
    opacity: 0.6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  labelActive: {
    color: "#F5A623",
  },
  ml: {
    fontSize: 12,
    color: "#aaa",
  },
  mlActive: {
    color: "#F5A623",
  },
});
