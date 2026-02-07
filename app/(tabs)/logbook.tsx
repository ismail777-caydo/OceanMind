import React, { useCallback, useMemo, useState } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

type Entry = {
  id: string;
  dateTitle: string;
  time: string;
  species: string;
  weightKg: string;
  city: string;
  zone: string;
  legal: boolean;
};

const STORAGE_KEY = "oceanmind_logbook_entries_v1";

const FAKE_ENTRIES: Entry[] = [
  {
    id: "1",
    dateTitle: "2 Février 2026",
    time: "07:30",
    species: "Sardines",
    weightKg: "12.5",
    city: "Larache",
    zone: "Zone Nord",
    legal: true,
  },
  {
    id: "2",
    dateTitle: "1 Février 2026",
    time: "06:15",
    species: "Maquereaux",
    weightKg: "8.3",
    city: "Larache",
    zone: "Zone Est",
    legal: true,
  },
  {
    id: "3",
    dateTitle: "31 Janvier 2026",
    time: "14:45",
    species: "Dorades",
    weightKg: "5.2",
    city: "Larache",
    zone: "Zone Sud",
    legal: true,
  },
];

function Chip({ label, icon, active, onPress }: any) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        active && {
          backgroundColor: "rgba(255,255,255,0.16)",
          borderColor: "rgba(255,255,255,0.22)",
        },
      ]}
    >
      <MaterialCommunityIcons name={icon} size={16} color="rgba(255,255,255,0.85)" />
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}

function EntryCard({ e }: { e: Entry }) {
  return (
    <View style={styles.entryCard}>
      <View style={styles.entryTopRow}>
        <View>
          <Text style={styles.entryDate}>{e.dateTitle}</Text>
          <Text style={styles.entryTime}>{e.time}</Text>
        </View>

        <View style={styles.legalBadge}>
          <Ionicons name="checkmark-circle" size={16} color="#fff" />
          <Text style={styles.legalText}>{e.legal ? "Légal" : "Interdit"}</Text>
        </View>
      </View>

      <View style={styles.line} />

      <View style={styles.rowInfo}>
        <MaterialCommunityIcons name="fish" size={16} color="rgba(255,255,255,0.85)" />
        <Text style={styles.infoText}>
          {e.species} ({e.weightKg} kg)
        </Text>
      </View>

      <View style={styles.rowInfo}>
        <Ionicons name="location-outline" size={16} color="rgba(255,255,255,0.85)" />
        <Text style={styles.infoText}>
          {e.city}, {e.zone}
        </Text>
      </View>
    </View>
  );
}

export default function Logbook() {
  const router = useRouter();
  const [filter, setFilter] = useState<"Date" | "Espèce" | "Zone">("Date");
  const [entries, setEntries] = useState<Entry[]>([]);

  const loadEntries = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(FAKE_ENTRIES));
        setEntries(FAKE_ENTRIES);
        return;
      }
      const parsed = JSON.parse(raw) as Entry[];
      setEntries(Array.isArray(parsed) ? parsed : FAKE_ENTRIES);
    } catch (e) {
      setEntries(FAKE_ENTRIES);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  // دابا filters غير UI (من بعد نطبّقهم)
  const shown = useMemo(() => entries, [entries, filter]);

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
          
          <Text style={styles.title}>Journal de Bord Numérique</Text>
        </View>

        <View style={styles.chipsRow}>
          <Chip label="Date" icon="calendar-blank-outline" active={filter === "Date"} onPress={() => setFilter("Date")} />
          <Chip label="Espèce" icon="fish" active={filter === "Espèce"} onPress={() => setFilter("Espèce")} />
          <Chip label="Zone" icon="map-marker-radius-outline" active={filter === "Zone"} onPress={() => setFilter("Zone")} />
        </View>

        <View style={{ marginTop: 14, gap: 12 }}>
          {shown.map((e) => (
            <EntryCard key={e.id} e={e} />
          ))}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* زر + كيمشي لنفس صفحة add */}
      <Pressable
        onPress={() => router.push("/(tabs)/add-capture?from=logbook")}
        style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.98 }] }]}
      >
        <Ionicons name="add" size={26} color="#fff" />
      </Pressable>
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

  container: { paddingHorizontal: 18, paddingTop: 10 },

  logo: { width: 140, height: 140, marginBottom: 6 },
  
  title: { color: "#fff", fontSize: 16, fontWeight: "900", marginTop: 8 },

  chipsRow: { marginTop: 14, flexDirection: "row", gap: 10, justifyContent: "center" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  chipText: { color: "rgba(255,255,255,0.9)", fontWeight: "800", fontSize: 12 },

  entryCard: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  entryTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  entryDate: { color: "#fff", fontWeight: "900", fontSize: 13 },
  entryTime: { marginTop: 6, color: "rgba(255,255,255,0.75)", fontWeight: "800", fontSize: 11 },

  legalBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 12,
    backgroundColor: "rgba(34,197,94,0.85)",
  },
  legalText: { color: "#fff", fontWeight: "900", fontSize: 12 },

  line: { marginTop: 10, marginBottom: 10, height: 1, backgroundColor: "rgba(255,255,255,0.12)" },

  rowInfo: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  infoText: { color: "rgba(255,255,255,0.85)", fontWeight: "800", fontSize: 12 },

  fab: {
    position: "absolute",
    right: 18,
    bottom: 18,
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "rgba(45, 212, 191, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
});
