import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
}

interface SectionProps {
  icon: string;
  title: string;
  children: React.ReactNode;
}

function Section({ icon, title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name={icon as any} size={16} color="#2d7d2d" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export default function InfoModal({ visible, onClose }: Props) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <MaterialCommunityIcons
              name="information-outline"
              size={22}
              color="#2d7d2d"
            />
            <Text style={styles.title}>Piscola y matematicas</Text>
          </View>

          {/* 1. Llenado */}
          <Section icon="cup-outline" title="Llenado y hielo">
            <Text style={styles.pointText}>
              Se asume que los vasos se llenan al{" "}
              <Text style={styles.bold}>90% de su capacidad</Text> y siempre se
              usan{" "}
              <Text style={styles.bold}>2-3 cubos de hielo (~60-90 ml)</Text>.
            </Text>
          </Section>

          <View style={styles.divider} />

          {/* 2. Forma + acomodo + fórmula fusionados */}
          <Section icon="shape-outline" title="Cálculo del pisco">
            <Text style={styles.pointText}>
              Se calcula el porcentaje de pisco en relación a la{" "}
              <Text style={styles.bold}>forma del vaso </Text>
              se le descuentan los cubos de hielo y la bebida llena el resto:
            </Text>
            <View style={styles.formulaBox}>
              <Text style={styles.formulaText}>
                Pisco = % Pisco x Volumen total - Hielo
              </Text>

              <Text style={styles.formulaText}>
                Bebida = Volumen total x 0.9 - Pisco - Hielo
              </Text>
            </View>
          </Section>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  sheet: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "100%",
    maxWidth: 360,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2d7d2d",
  },
  section: {
    gap: 6,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2d7d2d",
  },
  pointText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 21,
  },
  bold: {
    fontWeight: "700",
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#e8e8e8",
  },
  formulaBox: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  formulaText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  formulaDivider: {
    height: 1,
    backgroundColor: "#cde0cd",
    marginVertical: 2,
  },
});
