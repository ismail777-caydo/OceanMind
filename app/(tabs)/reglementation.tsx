import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  ScrollView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

type Rule = {
  id: string;
  species: string;
  status: "Autorisé" | "Interdit";
  minSizeCm: number;
  season: string; // "Toute l'année" | "Mars à Octobre" | "Interdite actuellement"
};

const ZONES = ["Larache – Atlantique", "Tanger – Atlantique", "Agadir – Atlantique"];

const FAKE_RULES: Rule[] = [
  { id: "sardine", species: "Sardine", status: "Autorisé", minSizeCm: 20, season: "Toute l'année" },
  { id: "maquereau", species: "Maquereau", status: "Autorisé", minSizeCm: 25, season: "Toute l'année" },
  { id: "dorade", species: "Dorade", status: "Autorisé", minSizeCm: 30, season: "Toute l'année" },
  { id: "thon", species: "Thon rouge", status: "Interdit", minSizeCm: 115, season: "Interdite actuellement" },
  { id: "merou", species: "Mérou brun", status: "Interdit", minSizeCm: 45, season: "Interdite actuellement" },
];

function RuleCard({ r }: { r: Rule }) {
  const isOk = r.status === "Autorisé";
  return (
    <View style={styles.ruleCard}>
      <View style={styles.ruleTop}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <MaterialCommunityIcons name="fish" size={18} color="#2dd4bf" />
          <Text style={styles.ruleTitle}>{r.species}</Text>
        </View>

        <View style={[styles.badge, isOk ? styles.badgeOk : styles.badgeNo]}>
          <Ionicons name={isOk ? "checkmark-circle" : "close-circle"} size={16} color="#fff" />
          <Text style={styles.badgeText}>{r.status}</Text>
        </View>
      </View>

      <View style={styles.ruleLine} />

      <View style={styles.rowInfo}>
        <MaterialCommunityIcons name="ruler" size={16} color="rgba(255,255,255,0.85)" />
        <Text style={styles.infoLabel}>Taille minimale</Text>
        <Text style={styles.infoValue}>{r.minSizeCm} cm</Text>
      </View>

      <View style={styles.rowInfo}>
        <Ionicons name="calendar-outline" size={16} color="rgba(255,255,255,0.85)" />
        <Text style={styles.infoLabel}>Saison</Text>
        <Text style={[styles.infoValue, !isOk && { color: "#fca5a5" }]}>{r.season}</Text>
      </View>
    </View>
  );
}

export default function Reglementation() {
  const router = useRouter();
  const [zone, setZone] = useState(ZONES[0]);
  const [openZones, setOpenZones] = useState(false);

  const rules = useMemo(() => {
    // front فقط: نفس البيانات لأي zone
    return FAKE_RULES;
  }, [zone]);

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
        <View style={{ alignItems: "center" }}>
          <Image source={require("../../src/assets/logo.png")} style={styles.logo} resizeMode="contain" />
          <Text style={styles.appName}>Ocean Mind</Text>
          <Text style={styles.title}>Réglementation Locale</Text>
        </View>

        {/* Zone dropdown */}
        <Pressable style={styles.zoneSelect} onPress={() => setOpenZones((v) => !v)}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons name="location-outline" size={16} color="#2dd4bf" />
            <Text style={styles.zoneText}>Zone : {zone}</Text>
          </View>
          <Ionicons name="chevron-down" size={16} color="rgba(255,255,255,0.85)" />
        </Pressable>

        {openZones ? (
          <View style={styles.dropdown}>
            {ZONES.map((z) => (
              <Pressable
                key={z}
                onPress={() => {
                  setZone(z);
                  setOpenZones(false);
                }}
                style={styles.dropdownItem}
              >
                <Text style={styles.dropdownText}>{z}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {/* Attention box (مثل الصورة الثانية) */}
        <View style={styles.alertBox}>
          <Ionicons name="warning-outline" size={18} color="#f59e0b" />
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>Attention</Text>
            <Text style={styles.alertText}>
              La pêche de certaines espèces est interdite durant cette période.
            </Text>
          </View>
        </View>

        {/* Rules list */}
        <View style={{ marginTop: 12, gap: 12 }}>
          {rules.map((r) => (
            <RuleCard key={r.id} r={r} />
          ))}
        </View>

        {/* Bottom button */}
        <Pressable
          onPress={() => alert("Détails officiels (UI فقط دابا)")}
          style={({ pressed }) => [styles.detailsBtn, pressed && { transform: [{ scale: 0.99 }] }]}
        >
          <Ionicons name="open-outline" size={18} color="#fff" />
          <Text style={styles.detailsText}>Consulter les détails officiels</Text>
        </Pressable>

        <View style={{ height: 22 }} />
      </ScrollView>
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

  container: { paddingHorizontal: 18, paddingTop: 10 },
  logo: { width: 150, height: 150, marginBottom: 6 },
  appName: { color: "#fff", fontSize: 18, fontWeight: "900", marginTop: 4 },
  title: { color: "#fff", fontSize: 16, fontWeight: "900", marginTop: 8 },

  zoneSelect: {
    marginTop: 14,
    height: 44,
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  zoneText: { color: "rgba(255,255,255,0.9)", fontWeight: "900", fontSize: 12 },

  dropdown: {
    marginTop: 10,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "rgba(20,40,70,0.95)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.10)",
  },
  dropdownText: { color: "#fff", fontWeight: "900" },

  alertBox: {
    marginTop: 12,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "rgba(245, 158, 11, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.22)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  alertTitle: { color: "#fff", fontWeight: "900", marginBottom: 2 },
  alertText: { color: "rgba(255,255,255,0.78)", fontWeight: "700", fontSize: 11, lineHeight: 15 },

  ruleCard: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  ruleTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  ruleTitle: { color: "#fff", fontWeight: "900", fontSize: 14 },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 12,
  },
  badgeOk: { backgroundColor: "rgba(34,197,94,0.85)" },
  badgeNo: { backgroundColor: "rgba(239,68,68,0.85)" },
  badgeText: { color: "#fff", fontWeight: "900", fontSize: 12 },

  ruleLine: { marginTop: 12, marginBottom: 10, height: 1, backgroundColor: "rgba(255,255,255,0.12)" },

  rowInfo: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  infoLabel: { flex: 1, color: "rgba(255,255,255,0.7)", fontWeight: "800", fontSize: 12 },
  infoValue: { color: "#fff", fontWeight: "900", fontSize: 12 },

  detailsBtn: {
    marginTop: 16,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(29, 78, 216, 0.65)",
    borderWidth: 1,
    borderColor: "rgba(147, 197, 253, 0.25)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  detailsText: { color: "#fff", fontWeight: "900", fontSize: 12 },
});
