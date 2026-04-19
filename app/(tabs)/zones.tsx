import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import PremiumGate from "../../src/components/PremiumGate";
type Zone = {
  id: string;
  type: "recommended" | "forbidden";
  lat: number;
  lon: number;
  radius: number;
  title: string;
  bestTime: string;
  species: string;
  depth: string;
  distanceKm: number;
  ui: { xPct: number; yPct: number; size: number; border: number };
};

function toKm(m: number) {
  return Math.round((m / 1000) * 10) / 10;
}

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

const LARACHE_CENTER = { lat: 35.193, lon: -6.156 };

function laracheZones(userLat: number, userLon: number): Zone[] {
  const base = [
    {
      id: "1",
      type: "recommended" as const,
      lat: 35.2005,
      lon: -6.1505,
      title: "Zone principale recommandée",
      bestTime: "06h30 – 10h00",
      species: "Sardines / Maquereaux",
      depth: "Profondeur moyenne : 18–28 m",
      ui: { xPct: 0.45, yPct: 0.1, size: 70, border: 10 },
    },
    {
      id: "2",
      type: "recommended" as const,
      lat: 35.1888,
      lon: -6.1418,
      title: "Zone recommandée",
      bestTime: "07h00 – 11h00",
      species: "Anchois / Maquereaux",
      depth: "Profondeur moyenne : 20–32 m",
      ui: { xPct: 0.3, yPct: 0.4, size: 118, border: 10 },
    },
    {
      id: "3",
      type: "forbidden" as const,
      lat: 35.1908,
      lon: -6.1528,
      title: "Zone interdite",
      bestTime: "—",
      species: "—",
      depth: "Zone sensible",
      ui: { xPct: 0.55, yPct: 0.28, size: 76, border: 10 },
    },
  ];

  return base.map((z) => {
    const distM = distanceMeters(userLat, userLon, z.lat, z.lon);
    return {
      ...z,
      radius: z.type === "recommended" ? 1200 : 900,
      distanceKm: toKm(distM),
    };
  });
}

export default function Zones() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [place, setPlace] = useState("Localisation...");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [mapSize, setMapSize] = useState({ w: 0, h: 0 });
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1200,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulse]);

  const recommendedZone = useMemo(() => {
    const rec = zones.filter((z) => z.type === "recommended");
    rec.sort((a, b) => a.distanceKm - b.distanceKm);
    return rec[0] ?? null;
  }, [zones]);

  const loadLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setPlace("Permission GPS refusée");
        setZones(laracheZones(LARACHE_CENTER.lat, LARACHE_CENTER.lon));
        setLoading(false);
        return;
      }

      const pos = (await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 8000)),
      ])) as any;

      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      setCoords({ lat, lon });
      setPlace("Position détectée");
      setZones(laracheZones(lat, lon));
    } catch (e) {
      console.log("zones location error:", e);
      setPlace("Larache");
      setZones(laracheZones(LARACHE_CENTER.lat, LARACHE_CENTER.lon));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocation();
  }, []);

  return (
    <PremiumGate featureName="Smart Maps">
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

          <Pressable onPress={() => setShowGrid((v) => !v)} style={styles.gridBtn}>
            <Ionicons name="grid-outline" size={16} color="#fff" />
            <Text style={styles.gridBtnText}>{showGrid ? "Grille ON" : "Grille OFF"}</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={require("../../src/assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Carte des zones de pêche</Text>

          <View style={styles.locationPill}>
            <View style={styles.locationLeft}>
              <Ionicons name="location-outline" size={16} color="#2dd4bf" />
              <Text style={styles.locationText}>{place}</Text>
            </View>

            <Ionicons
              name="funnel-outline"
              size={16}
              color="rgba(255,255,255,0.8)"
            />
          </View>

          <View style={styles.mapBox}>
            <ImageBackground
              source={require("../../src/assets/larache_map.png")}
              style={styles.mapBg}
              resizeMode="cover"
              onLoadEnd={() => setMapReady(true)}
              onLayout={(e) => {
                const { width, height } = e.nativeEvent.layout;
                setMapSize({ w: width, h: height });
              }}
            >
              <View style={styles.mapOverlay} />

              {showGrid && (
                <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                  {Array.from({ length: 9 }).map((_, i) => {
                    const p = ((i + 1) / 10) * 100;
                    return (
                      <React.Fragment key={i}>
                        <View style={[styles.gridLineH, { top: `${p}%` }]} />
                        <View style={[styles.gridLineV, { left: `${p}%` }]} />
                      </React.Fragment>
                    );
                  })}
                </View>
              )}

              {loading || !mapReady || mapSize.w === 0 ? (
                <View style={styles.loadingCenter}>
                  <ActivityIndicator size="large" color="#2dd4bf" />
                  <Text style={styles.loadingText}>Chargement...</Text>
                </View>
              ) : (
                <>
                  {zones.map((z) => {
                    const isRec = z.type === "recommended";
                    const borderColor = isRec
                      ? "rgba(34,197,94,0.80)"
                      : "rgba(239,68,68,0.78)";
                    const fill = isRec
                      ? "rgba(34,197,94,0.14)"
                      : "rgba(239,68,68,0.12)";
                    const leftPx = z.ui.xPct * mapSize.w;
                    const topPx = z.ui.yPct * mapSize.h;

                    return (
                      <View
                        key={z.id}
                        pointerEvents="none"
                        style={{
                          position: "absolute",
                          left: leftPx,
                          top: topPx,
                          transform: [
                            { translateX: -z.ui.size / 2 },
                            { translateY: -z.ui.size / 2 },
                          ],
                        }}
                      >
                        <Animated.View
                          style={{
                            position: "absolute",
                            width: z.ui.size,
                            height: z.ui.size,
                            borderRadius: 999,
                            borderWidth: 2,
                            borderColor,
                            opacity: pulse.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.55, 0],
                            }),
                            transform: [
                              {
                                scale: pulse.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [1, 1.35],
                                }),
                              },
                            ],
                          }}
                        />

                        <View
                          style={{
                            width: z.ui.size,
                            height: z.ui.size,
                            borderRadius: 999,
                            borderWidth: z.ui.border,
                            borderColor,
                            backgroundColor: fill,
                          }}
                        />
                      </View>
                    );
                  })}
                </>
              )}
            </ImageBackground>
          </View>

          <View style={styles.infoCardBelow}>
            <View style={styles.infoTitleRow}>
              <View style={styles.dot} />
              <Text style={styles.infoTitle}>
                {recommendedZone ? recommendedZone.title : "Zone recommandée"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="location" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.infoText}>Larache (démo)</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="time" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.infoText}>
                Meilleur moment : {recommendedZone ? recommendedZone.bestTime : "—"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons
                name="fish-outline"
                size={14}
                color="rgba(255,255,255,0.8)"
              />
              <Text style={styles.infoText}>
                {recommendedZone ? recommendedZone.species : "—"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons
                name="water-outline"
                size={14}
                color="rgba(255,255,255,0.8)"
              />
              <Text style={styles.infoText}>
                {recommendedZone ? recommendedZone.depth : "—"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons
                name="navigate"
                size={14}
                color="rgba(255,255,255,0.8)"
              />
              <Text style={styles.infoText}>
                Distance : {recommendedZone ? recommendedZone.distanceKm : "—"} km
              </Text>
            </View>
          </View>

          <View style={styles.bottomRow}>
            <Pressable
              style={styles.filterBtn}
              onPress={() =>
                Alert.alert("Filtres", "Fonctionnalité bientôt disponible.")
              }
            >
              <Ionicons name="funnel-outline" size={16} color="#fff" />
              <Text style={styles.bottomBtnText}>Filtres</Text>
            </Pressable>

            <Pressable style={styles.locBtn} onPress={loadLocation}>
              <Ionicons name="locate-outline" size={16} color="#fff" />
              <Text style={styles.bottomBtnText}>Localiser ma position</Text>
            </Pressable>
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: "rgba(34,197,94,0.9)" },
                ]}
              />
              <Text style={styles.legendText}>Zone recommandée</Text>
            </View>

            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: "rgba(239,68,68,0.9)" },
                ]}
              />
              <Text style={styles.legendText}>Zone interdite</Text>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </PremiumGate>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 25, 45, 0.35)",
  },
  topBar: {
    paddingTop: 52,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
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
  gridBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  gridBtnText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  content: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 24,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 8,
  },
  logo: { width: 150, height: 150, alignSelf: "center" },
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
  locationLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationText: {
    color: "rgba(255,255,255,0.9)",
    fontWeight: "800",
    fontSize: 12,
  },
  mapBox: {
    marginTop: 14,
    height: 260,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    overflow: "hidden",
  },
  mapBg: { flex: 1 },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6, 20, 40, 0.18)",
  },
  loadingCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "800",
  },
  gridLineH: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  gridLineV: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  infoCardBelow: {
    marginTop: 12,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  infoTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 99,
    backgroundColor: "rgba(34,197,94,0.95)",
  },
  infoTitle: {
    color: "#fff",
    fontWeight: "900",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  infoText: {
    color: "rgba(255,255,255,0.85)",
    fontWeight: "700",
    fontSize: 11,
  },
  bottomRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
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
  bottomBtnText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 12,
  },
  legend: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
    marginTop: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 99,
  },
  legendText: {
    color: "rgba(255,255,255,0.75)",
    fontWeight: "700",
    fontSize: 11,
  },
});