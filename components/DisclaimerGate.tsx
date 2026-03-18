import { Image } from "expo-image";
import React, { useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  onAccept: () => void;
}

export default function DisclaimerGate({ onAccept }: Props) {
  const [denied, setDenied] = useState(false);
  const translateY = useRef(new Animated.Value(0)).current;

  const handleAccept = () => {
    Animated.timing(translateY, {
      toValue: -900,
      duration: 420,
      useNativeDriver: true,
    }).start(onAccept);
  };

  const handleDeny = () => setDenied(true);

  return (
    <Animated.View style={[styles.overlay, { transform: [{ translateY }] }]} pointerEvents="auto">
      {denied ? (
        <View style={styles.deniedContainer}>
          <Text style={styles.deniedEmoji}>🚫</Text>
          <Text style={styles.deniedTitle}>Acceso restringido</Text>
          <Text style={styles.deniedText}>
            Esta aplicación es exclusiva para mayores de 18 años.
          </Text>
          <TouchableOpacity
            style={styles.btnBack}
            onPress={() => setDenied(false)}
            activeOpacity={0.8}
          >
            <Text style={styles.btnBackText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.legalFooter}>
            El consumo excesivo de alcohol es dañino para la salud.{"\n"}
            Beber con moderación.
          </Text>
        </View>
      ) : (
        <View style={styles.container}>
          <View style={styles.top}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.logo}
              contentFit="contain"
            />
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>+18</Text>
              </View>
            </View>
            <Text style={styles.title}>Contenido para adultos</Text>
            <Text style={styles.subtitle}>
              Esta aplicación está diseñada para el consumo responsable de
              bebidas alcohólicas. Su uso está{" "}
              <Text style={{ fontWeight: "700" }}>
                estrictamente reservado a mayores de 18 años.
              </Text>
            </Text>
          </View>

          <View style={styles.middle}>
            <Text style={styles.question}>¿Eres mayor de 18 años?</Text>
            <TouchableOpacity
              style={styles.btnAccept}
              onPress={handleAccept}
              activeOpacity={0.85}
            >
              <Text style={styles.btnAcceptText}>Sí, tengo 18 años o más</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnDeny}
              onPress={handleDeny}
              activeOpacity={0.85}
            >
              <Text style={styles.btnDenyText}>No, soy menor de edad</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              El abuso del alcohol es perjudicial para la salud.
            </Text>
            <Text style={styles.footerText}>
              Prohibida la venta de alcohol a menores de 18 años.
            </Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#fff",
    zIndex: 9999,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 72,
    paddingBottom: 40,
    justifyContent: "space-between",
  },
  top: {
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  badgeRow: {
    flexDirection: "row",
  },
  badge: {
    backgroundColor: "#F5A623",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1a1a1a",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
  },
  middle: {
    gap: 12,
    alignItems: "center",
  },
  question: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  btnAccept: {
    width: "100%",
    backgroundColor: "#F5A623",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: "#F5A623",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnAcceptText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  btnDeny: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnDenyText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#888",
  },
  footer: {
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 11,
    color: "#aaa",
    textAlign: "center",
  },
  // Denied state
  deniedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  deniedEmoji: {
    fontSize: 56,
  },
  deniedTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1a1a1a",
    textAlign: "center",
  },
  deniedText: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
  },
  btnBack: {
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  btnBackText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#888",
  },
  legalFooter: {
    fontSize: 12,
    color: "#aaa",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 24,
  },
});
