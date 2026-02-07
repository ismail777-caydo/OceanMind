import React from "react";
import { useRouter } from "expo-router";

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

function Card({ title, desc, icon, bg, onPress }: any) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.98 }] }]}>
      <View style={[styles.iconBox, { backgroundColor: bg }]}>
        <MaterialCommunityIcons name={icon} size={18} color="#fff" />
      </View>

      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDesc}>{desc}</Text>
    </Pressable>
  );
}

export default function Home() {
  const router = useRouter();
  return (
    <ImageBackground
      source={require("../../src/assets/background.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Bienvenue Utilisateur 🙂</Text>
            <View style={styles.locRow}>
              <Ionicons name="location-sharp" size={14} color="rgba(255,255,255,0.75)" />
              <Text style={styles.location}>Larache</Text>
            </View>
          </View>

          <Pressable style={({ pressed }) => [styles.bellBtn, pressed && { transform: [{ scale: 0.96 }] }]}>
            <Ionicons name="notifications-outline" size={18} color="#fff" />
          </Pressable>
        </View>

        {/* Grid */}
        <View style={styles.grid}>
          <Card
            title={"Détection des Poissons\nIA"}
            desc="Espèce, taille, légalité"
            icon="fish"
            bg="rgba(56,189,248,0.35)"
            onPress={() => router.push("/(tabs)/detection")}


          />
          <Card
            title={"Carte des Zones de\nPêche"}
            desc="Zones riches recommandées"
            icon="map-marker-radius"
            bg="rgba(34,197,94,0.35)"
            onPress={() => router.push("/(tabs)/zones")}

          />
          <Card
            title={"Météo Marine IA"}
            desc="Prévisions en temps réel"
            icon="weather-partly-cloudy"
            bg="rgba(59,130,246,0.35)"
            onPress={() => router.push("/(tabs)/meteo")}

          />
          <Card
            title={"Marées & Vagues"}
            desc="Horaires et intensité"
            icon="wave"
            bg="rgba(139,92,246,0.35)"
            onPress={() => router.push("/(tabs)/tides")}

          />
          <Card
            title={"Journal de Bord\nNumérique"}
            desc="Historique des captures"
            icon="book-outline"
            bg="rgba(245,158,11,0.35)"
            onPress={() => router.push("/(tabs)/logbook")}

          />
          <Card
            title={"Communauté des\nPêcheurs"}
            desc="Partage et conseils"
            icon="account-group-outline"
            bg="rgba(16,185,129,0.35)"
            onPress={() => router.push("/(tabs)/community")}


          />
          <Card
            title={"Réglementation Locale"}
            desc="Conformité et règles"
            icon="scale-balance"
            bg="rgba(217,70,239,0.35)"
            onPress={() => router.push("/(tabs)/reglementation")}
            
          />
          <Card
            title={"Mon Profil"}
            desc="Gérez vos informations"
            icon="account-circle-outline"
            bg="rgba(148,163,184,0.35)"
            onPress={() => router.push("/(tabs)/profil")}

          />
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },

  // overlay باش الخلفية تولي هادئة بحال الدزاين
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 25, 45, 0.35)",
  },

  container: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 28,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },

  welcome: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },

  locRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },

  location: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "700",
  },

  bellBtn: {
    height: 44,
    width: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },

  grid: {
   flexDirection: "row",
   flexWrap: "wrap",
   justifyContent: "space-between",
   rowGap: 16,     // المسافة عمودياً
   columnGap: 12,  // المسافة أفقياً
  },


  card: {
   width: "48%",
   minHeight: 145,          // كبرناها شوية
   borderRadius: 24,        // round أكثر
   paddingVertical: 16,
   paddingHorizontal: 16,
   backgroundColor: "rgba(255,255,255,0.12)",
   borderWidth: 1,
   borderColor: "rgba(255,255,255,0.18)",
  },

  iconBox: {
   height: 36,
   width: 36,
   borderRadius: 12,
   alignItems: "center",
   justifyContent: "center",
   marginBottom: 12,
  },


  cardTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 18,
  },

  cardDesc: {
    marginTop: 8,
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 15,
  },
});
