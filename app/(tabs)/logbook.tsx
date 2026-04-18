import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "../../src/lib/supabaseClient";
import { useAuth } from "../../src/auth/AuthContext";

type FilterType = "Date" | "Espèce" | "Zone";

type CaptureEntry = {
  id: string;
  species: string;
  weight_kg: number | null;
  size_cm?: number | null;
  city?: string | null;
  zone?: string | null;
  captured_at?: string | null;
  photo_url?: string | null;
  ai_legal?: boolean | null;
};

type ChipProps = {
  label: FilterType;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  active: boolean;
  onPress: () => void;
};

type EntryCardProps = {
  e: CaptureEntry;
};

function Chip({ label, icon, active, onPress }: ChipProps) {
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
      <MaterialCommunityIcons
        name={icon}
        size={16}
        color="rgba(255,255,255,0.85)"
      />
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR");
}

function formatTime(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function EntryCard({ e }: EntryCardProps) {
  const legal = e.ai_legal;

  let badgeLabel = "À vérifier";
  let badgeColor = "rgba(245,158,11,0.85)";
  let badgeIcon: keyof typeof Ionicons.glyphMap = "alert-circle";

  if (legal === true) {
    badgeLabel = "Légal";
    badgeColor = "rgba(34,197,94,0.85)";
    badgeIcon = "checkmark-circle";
  } else if (legal === false) {
    badgeLabel = "Interdit";
    badgeColor = "rgba(239,68,68,0.85)";
    badgeIcon = "close-circle";
  }

  return (
    <View style={styles.entryCard}>
      <View style={styles.entryTopRow}>
        <View>
          <Text style={styles.entryDate}>{formatDate(e.captured_at)}</Text>
          <Text style={styles.entryTime}>{formatTime(e.captured_at)}</Text>
        </View>

        <View style={[styles.legalBadge, { backgroundColor: badgeColor }]}>
          <Ionicons name={badgeIcon} size={16} color="#fff" />
          <Text style={styles.legalText}>{badgeLabel}</Text>
        </View>
      </View>

      {e.photo_url ? (
        <Image source={{ uri: e.photo_url }} style={styles.photo} />
      ) : null}

      <View style={styles.line} />

      <View style={styles.rowInfo}>
        <MaterialCommunityIcons
          name="fish"
          size={16}
          color="rgba(255,255,255,0.85)"
        />
        <Text style={styles.infoText}>
          {e.species || "—"} ({e.weight_kg != null ? `${e.weight_kg} kg` : "—"})
        </Text>
      </View>

      <View style={styles.rowInfo}>
        <Ionicons
          name="location-outline"
          size={16}
          color="rgba(255,255,255,0.85)"
        />
        <Text style={styles.infoText}>
          {e.city || "Ville non précisée"}, {e.zone || "Zone non précisée"}
        </Text>
      </View>

      {e.size_cm != null ? (
        <View style={styles.rowInfo}>
          <MaterialCommunityIcons
            name="ruler"
            size={16}
            color="rgba(255,255,255,0.85)"
          />
          <Text style={styles.infoText}>{e.size_cm} cm</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function Logbook() {
  const router = useRouter();
  const { user } = useAuth();

  const [filter, setFilter] = useState<FilterType>("Date");
  const [entries, setEntries] = useState<CaptureEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const loadEntries = useCallback(async () => {
    if (!user?.id) {
      setEntries([]);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("captures")
        .select(
          "id, species, weight_kg, size_cm, city, zone, captured_at, photo_url, ai_legal"
        )
        .eq("user_id", user.id)
        .order("captured_at", { ascending: false });

      if (error) {
        console.log("captures list error:", error);
        setEntries([]);
        return;
      }

      setEntries(Array.isArray(data) ? (data as CaptureEntry[]) : []);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  const filtered = useMemo(() => {
    const arr = [...entries];

    if (filter === "Espèce") {
      arr.sort((a, b) => String(a.species || "").localeCompare(String(b.species || "")));
    } else if (filter === "Zone") {
      arr.sort((a, b) => String(a.zone || "").localeCompare(String(b.zone || "")));
    }

    return arr;
  }, [entries, filter]);

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

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: "center" }}>
          <Image
            source={require("../../src/assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Journal de bord numérique</Text>
        </View>

        <View style={styles.chipsRow}>
          <Chip
            label="Date"
            icon="calendar-blank-outline"
            active={filter === "Date"}
            onPress={() => setFilter("Date")}
          />
          <Chip
            label="Espèce"
            icon="fish"
            active={filter === "Espèce"}
            onPress={() => setFilter("Espèce")}
          />
          <Chip
            label="Zone"
            icon="map-marker-radius-outline"
            active={filter === "Zone"}
            onPress={() => setFilter("Zone")}
          />
        </View>

        <View style={styles.entriesWrap}>
          {loading ? (
            <View style={styles.emptyBox}>
              <ActivityIndicator size="small" color="#2dd4bf" />
              <Text style={styles.emptyText}>Chargement...</Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                Aucune entrée enregistrée pour le moment.
              </Text>
            </View>
          ) : (
            filtered.map((e) => <EntryCard key={e.id} e={e} />)
          )}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      <Pressable
        onPress={() => router.push("/(tabs)/add-capture?from=logbook")}
        style={({ pressed }) => [
          styles.fab,
          pressed && { transform: [{ scale: 0.98 }] },
        ]}
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
  chipsRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
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
  chipText: {
    color: "rgba(255,255,255,0.9)",
    fontWeight: "800",
    fontSize: 12,
  },
  entriesWrap: {
    marginTop: 14,
    gap: 12,
  },
  entryCard: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  entryTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  entryDate: { color: "#fff", fontWeight: "900", fontSize: 13 },
  entryTime: {
    marginTop: 6,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "800",
    fontSize: 11,
  },
  legalBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 12,
  },
  legalText: { color: "#fff", fontWeight: "900", fontSize: 12 },
  photo: { marginTop: 12, width: "100%", height: 160, borderRadius: 14 },
  line: {
    marginTop: 10,
    marginBottom: 10,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  rowInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  infoText: {
    color: "rgba(255,255,255,0.85)",
    fontWeight: "800",
    fontSize: 12,
  },
  emptyBox: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  emptyText: {
    color: "rgba(255,255,255,0.8)",
    fontWeight: "800",
    textAlign: "center",
  },
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