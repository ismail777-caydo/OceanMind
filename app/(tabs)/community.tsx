import React from "react";
import { View, Text, StyleSheet, Image, ImageBackground, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function Community() {
  const router = useRouter();

  // يرجّعك للـ Home ديال tabs (index.tsx)
  const goHome = () => router.replace("/(tabs)");

  return (
    <ImageBackground
      source={require("../../src/assets/background.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      {/* مهم باش overlay ما يقطعش اللمس */}
      <View style={styles.overlay} pointerEvents="none" />

      <View style={styles.topBar}>
        <Pressable onPress={goHome} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={18} color="#fff" />
          <Text style={styles.backText}>Accueil</Text>
        </Pressable>
      </View>

      <View style={styles.container}>
        <Image source={require("../../src/assets/logo.png")} style={styles.logo} resizeMode="contain" />
        <Text style={styles.appName}>Ocean Mind</Text>
        <Text style={styles.title}>Communauté des Pêcheurs</Text>

        <View style={styles.card}>
          <View style={styles.badge}>
            <MaterialCommunityIcons name="progress-wrench" size={18} color="#fff" />
            <Text style={styles.badgeText}>En développement</Text>
          </View>

          <Text style={styles.text}>
            Cette fonctionnalité est actuellement en cours de développement.
            Elle sera bientôt disponible avec des fonctionnalités avancées.
          </Text>

          <View style={styles.miniBox}>
            <Text style={styles.miniTitle}>Bientôt disponible :</Text>
            <Text style={styles.miniItem}>• Publications et échanges entre pêcheurs</Text>
            <Text style={styles.miniItem}>• Conseils et retours d’expérience</Text>
            <Text style={styles.miniItem}>• Partage de zones et bonnes pratiques</Text>
          </View>

          <Pressable onPress={goHome} style={styles.btn}>
            <Text style={styles.btnText}>Retour à l’accueil</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(10, 25, 45, 0.35)" },

  topBar: { paddingTop: 52, paddingHorizontal: 16 },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  backText: { color: "#fff", fontWeight: "800", fontSize: 12 },

  container: { flex: 1, paddingHorizontal: 18, alignItems: "center", paddingTop: 10 },

  logo: { width: 150, height: 150, marginBottom: 6 },
  appName: { color: "#fff", fontSize: 18, fontWeight: "900", marginTop: 4 },
  title: { color: "#fff", fontSize: 16, fontWeight: "900", marginTop: 8 },

  card: {
    marginTop: 16,
    width: "100%",
    borderRadius: 22,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },

  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 14,
    backgroundColor: "rgba(245, 158, 11, 0.75)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  badgeText: { color: "#fff", fontWeight: "900", fontSize: 12 },

  text: { marginTop: 12, color: "rgba(255,255,255,0.85)", fontWeight: "800", lineHeight: 18 },

  miniBox: {
    marginTop: 14,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  miniTitle: { color: "#fff", fontWeight: "900", marginBottom: 8 },
  miniItem: { color: "rgba(255,255,255,0.8)", fontWeight: "800", marginTop: 4 },

  btn: {
    marginTop: 16,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(45, 212, 191, 0.95)",
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { color: "#fff", fontWeight: "900", fontSize: 13 },
});
