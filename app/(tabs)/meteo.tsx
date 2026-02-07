import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

function SmallStat({ icon, label, value }: any) {
  return (
    <View style={styles.smallStat}>
      <MaterialCommunityIcons name={icon} size={18} color="rgba(255,255,255,0.9)" />
      <Text style={styles.smallLabel}>{label}</Text>
      <Text style={styles.smallValue}>{value}</Text>
    </View>
  );
}

export default function Meteo() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("../../src/assets/background.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={18} color="#fff" />
          <Text style={styles.backText}>Retour</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Logo */}
        <Image source={require("../../src/assets/logo.png")} style={styles.logo} resizeMode="contain" />
        
        <Text style={styles.title}>Météo Marine IA</Text>

        {/* Location pill */}
        <View style={styles.locationPill}>
          <Ionicons name="location-outline" size={16} color="#2dd4bf" />
          <Text style={styles.locationText}>Larache, Maroc</Text>
        </View>

        {/* CONDITIONS ACTUELLES */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <MaterialCommunityIcons name="weather-partly-cloudy" size={18} color="#facc15" />
              <Text style={styles.cardTitle}>Conditions actuelles</Text>
            </View>

            <View style={styles.badgeSafe}>
              <Text style={styles.badgeText}>Sûr</Text>
            </View>
          </View>

          <View style={styles.currentRow}>
            <View>
              <Text style={styles.temp}>22°C</Text>
              <Text style={styles.subText}>Nuageux</Text>
            </View>

            <View style={styles.bigIconBox}>
              <MaterialCommunityIcons name="weather-cloudy" size={24} color="#fff" />
            </View>
          </View>

          <View style={styles.statRow}>
            <SmallStat icon="weather-windy" label="Vent" value="15 km/h\n↘ NE" />
            <SmallStat icon="waves" label="Vagues" value="1.2 m\nCalme" />
            <SmallStat icon="thermometer-water" label="Eau" value="18°C\nNormale" />
          </View>
        </View>

        {/* PRÉVISIONS IA */}
        <View style={[styles.card, styles.cardBlue]}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <MaterialCommunityIcons name="robot-outline" size={18} color="#fff" />
              <Text style={styles.cardTitle}>Prévisions IA</Text>
            </View>
          </View>

          <Text style={styles.strongText}>Conditions favorables pour la pêche</Text>

          <View style={styles.pillRow}>
            <View style={styles.pill}>
              <Text style={styles.pillLabel}>Fenêtre recommandée</Text>
              <Text style={styles.pillValue}>06h00 – 10h30</Text>
            </View>

            <View style={[styles.pill, styles.pillRisk]}>
              <Text style={styles.pillLabel}>Niveau de risque</Text>
              <View style={styles.riskChip}>
                <Text style={styles.riskText}>Faible</Text>
              </View>
            </View>
          </View>
        </View>

        {/* DÉTAILS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Détails</Text>

          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="navigation-variant-outline" size={18} color="#2dd4bf" />
              <Text style={styles.detailLabel}>Direction</Text>
              <Text style={styles.detailValue}>Nord-Est</Text>
            </View>

            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="eye-outline" size={18} color="#93c5fd" />
              <Text style={styles.detailLabel}>Visibilité</Text>
              <Text style={styles.detailValue}>10 km</Text>
            </View>

            <View style={[styles.detailItem, { width: "100%" }]}>
              <MaterialCommunityIcons name="gauge" size={18} color="#c084fc" />
              <Text style={styles.detailLabel}>Pression atmosphérique</Text>
              <Text style={styles.detailValue}>1013 hPa</Text>
            </View>
          </View>
        </View>

        {/* ATTENTION */}
        <View style={styles.alertCard}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Ionicons name="warning-outline" size={18} color="#f59e0b" />
            <Text style={styles.alertTitle}>Attention</Text>
          </View>
          <Text style={styles.alertText}>
            Conditions dangereuses prévues cet après-midi (vent fort à partir de 14h00).
          </Text>
        </View>

        <View style={{ height: 22 }} />
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 25, 45, 0.35)",
  },

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

  container: { paddingHorizontal: 18, paddingTop: 12 },

  logo: { width: 150, height: 150, alignSelf: "center" },

  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 10,
  },

  locationPill: {
    marginTop: 14,
    height: 40,
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  locationText: { color: "rgba(255,255,255,0.9)", fontWeight: "800", fontSize: 12 },

  card: {
    marginTop: 14,
    borderRadius: 20,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  cardBlue: {
    backgroundColor: "rgba(29, 78, 216, 0.25)",
    borderColor: "rgba(147, 197, 253, 0.25)",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: { color: "#fff", fontWeight: "900", fontSize: 14 },

  badgeSafe: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(34,197,94,0.75)",
  },
  badgeText: { color: "#fff", fontWeight: "900", fontSize: 12 },

  currentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  temp: { color: "#fff", fontSize: 28, fontWeight: "900" },
  subText: { marginTop: 4, color: "rgba(255,255,255,0.8)", fontWeight: "700" },

  bigIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  statRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  smallStat: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: "rgba(0,0,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  smallLabel: { marginTop: 6, color: "rgba(255,255,255,0.7)", fontWeight: "800", fontSize: 11 },
  smallValue: { marginTop: 4, color: "#fff", fontWeight: "900", fontSize: 12, lineHeight: 16 },

  strongText: { color: "#fff", fontWeight: "900", marginBottom: 10 },

  pillRow: { flexDirection: "row", gap: 10 },
  pill: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  pillRisk: { alignItems: "flex-start" },
  pillLabel: { color: "rgba(255,255,255,0.7)", fontWeight: "800", fontSize: 11 },
  pillValue: { marginTop: 8, color: "#fff", fontWeight: "900", fontSize: 12 },

  riskChip: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(34,197,94,0.75)",
  },
  riskText: { color: "#fff", fontWeight: "900", fontSize: 12 },

  detailGrid: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 10 },
  detailItem: {
    width: "48%",
    borderRadius: 16,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  detailLabel: { marginTop: 6, color: "rgba(255,255,255,0.7)", fontWeight: "800", fontSize: 11 },
  detailValue: { marginTop: 6, color: "#fff", fontWeight: "900", fontSize: 12 },

  alertCard: {
    marginTop: 14,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(245, 158, 11, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.22)",
  },
  alertTitle: { color: "#fff", fontWeight: "900" },
  alertText: { color: "rgba(255,255,255,0.78)", fontWeight: "700", lineHeight: 16 },
});
