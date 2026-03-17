import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface Props {
  visible: boolean;
  availableSizes: number[];
  onSelect: (sizeMl: number) => void;
  onClose: () => void;
}

function formatSize(ml: number): string {
  return ml >= 1000 ? `${ml / 1000}L` : `${ml}ml`;
}

export default function BebidaSizeModal({
  visible,
  availableSizes,
  onSelect,
  onClose,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <Text style={styles.title}>Elige el tamaño</Text>
              {availableSizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={styles.option}
                  onPress={() => onSelect(size)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionText}>{formatSize(size)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  sheet: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "80%",
    maxWidth: 320,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#f7f7f7",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F5A623",
  },
});
