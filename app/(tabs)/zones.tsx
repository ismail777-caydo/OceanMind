import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";

type Zone = {
  id: string;
  type: "recommended" | "forbidden";
  lat: number;
  lon: number;
  radius: number; // meters (concept)
  title: string;
  city: string;
  bestTime: string;
  species: string;
  depth: string;
  distanceKm: number;
};

function toKm(m: number) {
  return Math.round((m / 1000) * 10) / 10;
}

// distance (Haversine)
function distanceMeters(aLat: number, aLon: number, bLat: number, bLon: number) {
  const R = 6371000;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const lat1 = (aLat * Math.PI) / 180;
  const lat2 = (bLat * Math.PI) / 180;

  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}

// generate demo zones near user
function generateZones(userLat: number, userLon: number): Zone[] {
  const candidates = [
    { dLat: 0.01, dLon: 0.015, type: "recommended" as const },
    { dLat: -0.008, dLon: 0.012, type: "recommended" as const },
    { dLat: 0.006, dLon: -0.018, type: "forbidden" as const },
  ];

  return candidates.map((c, i) => {
    const lat = userLat + c.dLat;
    const lon = userLon + c.dLon;
    const distM = distanceMeters(userLat, userLon, lat, lon);

    return {
      id: String(i + 1),
      type: c.type,
      lat,
      lon,
      radius: c.type === "recommended" ? 1200 : 900,
      title: c.type === "recommended" ? "Zone principale recommandée" : "Zone interdite",
      city: "—",
      bestTime: "6h30 – 10h00",
      species: "Sardines / Maquereaux",
      depth: "Profondeur moyenne : 25 m",
      distanceKm: toKm(distM),
    };
  });
}

export default function Zones() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [place, setPlace] = useState("Localisation…");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);

  const recommendedZone = useMemo(() => {
    const rec = zones.filter((z) => z.type === "recommended");
    rec.sort((a, b) => a.distanceKm - b.distanceKm);
    return rec[0] ?? null;
  }, [zones]);

  // ✅ Step 3: loadLocation ما كتعلقش
  const loadLocation = async () => {
    setLoading(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setPlace("Permission GPS refusée");
        setLoading(false);
        return;
      }

      // timeout باش ما يبقاش كيتسنى
      const pos = (await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), 8000)
        ),
      ])) as any;

      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      setCoords({ lat, lon });

      // ✅ Step 2: بدون reverseGeocode (معلّق)
      // const rev = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
      // const first = rev?.[0];
      // const label = first
      //   ? `${first.city ?? first.subregion ?? first.region ?? "—"}, ${first.country ?? ""}`.trim()
      //   : "Position détectée";
      // setPlace(label);

      setPlace("Position détectée");

      const z = generateZones(lat, lon).map((zz) => ({ ...zz, city: "Position détectée" }));
      setZones(z);
    } catch (e) {
      setPlace("GPS غير متاح دابا");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      <View style={styles.content}>
        

        <Text style={styles.appName}>Ocean Mind</Text>
        <Text style={styles.title}>Carte des Zones de Pêche</Text>

        {/* Location pill */}
        <View style={styles.locationPill}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="location-outline" size={16} color="#2dd4bf" />
            <Text style={styles.locationText}>{place}</Text>
          </View>
          <Ionicons name="funnel-outline" size={16} color="rgba(255,255,255,0.8)" />
        </View>

        {/* Map mock */}
        <View style={styles.mapBox}>
          {loading ? (
            <View style={{ alignItems: "center" }}>
              <ActivityIndicator size="large" color="#2dd4bf" />
              <Text style={{ marginTop: 10, color: "rgba(255,255,255,0.8)", fontWeight: "700" }}>
                Récupération GPS…
              </Text>
            </View>
          ) : (
            <>
              {/* circles (fake zones) */}
              <View style={[styles.circle, { top: 110, left: 70, borderColor: "rgba(34,197,94,0.8)" }]} />
              <View style={[styles.circle2, { top: 150, left: 170, borderColor: "rgba(34,197,94,0.75)" }]} />
              <View style={[styles.circle3, { top: 165, left: 205, borderColor: "rgba(239,68,68,0.75)" }]} />
            </>
          )}

          {/* Info card */}
          <View style={styles.infoCard}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <View style={styles.dot} />
              <Text style={styles.infoTitle}>
                {recommendedZone ? recommendedZone.title : "Zone recommandée"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="location" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.infoText}>{place}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="time" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.infoText}>Meilleur moment : 6h30 – 10h00</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="fish-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.infoText}>Sardines / Maquereaux</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="water-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.infoText}>Profondeur moyenne : 25 m</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="navigate" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.infoText}>
                Distance : {recommendedZone ? recommendedZone.distanceKm : "—"} km
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom actions */}
        <View style={styles.bottomRow}>
          <Pressable style={styles.filterBtn} onPress={() => alert("Filtres (UI) فقط")}>
            <Ionicons name="funnel-outline" size={16} color="#fff" />
            <Text style={styles.bottomBtnText}>Filtres</Text>
          </Pressable>

          <Pressable style={styles.locBtn} onPress={loadLocation}>
            <Ionicons name="locate-outline" size={16} color="#fff" />
            <Text style={styles.bottomBtnText}>Localiser ma position</Text>
          </Pressable>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "rgba(34,197,94,0.9)" }]} />
            <Text style={styles.legendText}>Zone recommandée</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "rgba(239,68,68,0.9)" }]} />
            <Text style={styles.legendText}>Zone interdite</Text>
          </View>
        </View>
      </View>
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

  content: { flex: 1, paddingHorizontal: 18, paddingTop: 8 },

  appName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 6,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 8,
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
    justifyContent: "space-between",
  },
  locationText: { color: "rgba(255,255,255,0.9)", fontWeight: "800", fontSize: 12 },

  mapBox: {
    marginTop: 14,
    flex: 1,
    borderRadius: 18,
    backgroundColor: "rgba(10, 55, 120, 0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    padding: 12,
    overflow: "hidden",
    justifyContent: "center",
  },

  circle: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 999,
    borderWidth: 10,
    backgroundColor: "rgba(34,197,94,0.18)",
  },
  circle2: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 999,
    borderWidth: 10,
    backgroundColor: "rgba(34,197,94,0.14)",
  },
  circle3: {
    position: "absolute",
    width: 55,
    height: 55,
    borderRadius: 999,
    borderWidth: 10,
    backgroundColor: "rgba(239,68,68,0.14)",
  },

  infoCard: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  dot: { width: 10, height: 10, borderRadius: 99, backgroundColor: "rgba(34,197,94,0.95)" },
  infoTitle: { color: "#fff", fontWeight: "900" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  infoText: { color: "rgba(255,255,255,0.85)", fontWeight: "700", fontSize: 11 },

  bottomRow: { flexDirection: "row", gap: 12, marginTop: 12 },
  filterBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(148,163,184,0.35)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  locBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(16,185,129,0.85)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  bottomBtnText: { color: "#fff", fontWeight: "900", fontSize: 12 },

  legend: { flexDirection: "row", gap: 16, justifyContent: "center", marginTop: 10 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 99 },
  legendText: { color: "rgba(255,255,255,0.75)", fontWeight: "700", fontSize: 11 },
});
