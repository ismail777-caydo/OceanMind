import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { FISHING_CITIES } from "../../src/constants/cities";
import { getTidesAndWaves, TidesWavesResponse } from "../../src/services/tides";
import CityPicker from "../../src/components/CityPicker";
import { useSavedCity } from "../../src/hooks/useSavedCity";

function StatBox({ icon, label, value }: any) {
  return (
    <View style={styles.statBox}>
      <MaterialCommunityIcons name={icon} size={18} color="#60a5fa" />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function formatHour(ts?: string) {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function dayName(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { weekday: "short" });
}

export default function Tides() {
  const router = useRouter();

  const {
    selectedCity,
    setSelectedCity,
    ready,
  } = useSavedCity("oceanmind_selected_city");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<TidesWavesResponse | null>(null);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/home");
  };

  useEffect(() => {
    if (!ready) return;

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const res = await getTidesAndWaves(selectedCity.lat, selectedCity.lon);
        console.log("TIDES JSON =>", res);
        setData(res);
      } catch (e) {
        setErr("Marées & vagues غير متاحة دابا. تأكد السيرفر خدام و IP صحيح.");
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedCity, ready]);

  const current = data?.current ?? {};
  const tidesToday = data?.tides_today ?? {};
  const daily7 = data?.daily_7 ?? [];
  const ai = data?.ai_recommendation ?? {};

  const chartLevels = useMemo(() => {
    const levels = tidesToday?.chart_levels ?? [];
    if (!levels.length) return [0.25, 0.4, 0.55, 0.75, 0.9, 1.0, 0.85, 0.65, 0.45, 0.3, 0.2];

    const min = Math.min(...levels);
    const max = Math.max(...levels);
    const range = max - min || 1;

    return levels.slice(0, 11).map((v: number) => {
      const norm = (v - min) / range;
      return 0.2 + norm * 0.8;
    });
  }, [tidesToday]);

  const highTide = tidesToday?.high_tide;
  const lowTide = tidesToday?.low_tide;

  const currentWave = current?.wave_height_m;
  const currentDirection = current?.wave_direction_text ?? "—";
  const currentPeriod = current?.wave_period_s;
  const seaState = current?.sea_state ?? "—";
  const risk = current?.risk ?? "—";

  return (
    <ImageBackground
      source={require("../../src/assets/background.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <View style={styles.topBar}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={18} color="#fff" />
          <Text style={styles.backText}>Retour</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: "center" }}>
          <Image source={require("../../src/assets/logo.png")} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Marées & Vagues</Text>
        </View>

        <CityPicker
          cities={FISHING_CITIES}
          selectedCity={selectedCity}
          onSelect={setSelectedCity}
          title="Choisir une ville marées & vagues"
        />

        {loading ? (
          <View style={{ marginTop: 18, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#2dd4bf" />
            <Text style={{ marginTop: 10, color: "rgba(255,255,255,0.8)", fontWeight: "800" }}>
              Chargement marées & vagues…
            </Text>
          </View>
        ) : err ? (
          <View style={styles.alertCard}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Ionicons name="warning-outline" size={18} color="#f59e0b" />
              <Text style={styles.alertTitle}>Erreur</Text>
            </View>
            <Text style={styles.alertText}>{err}</Text>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <MaterialCommunityIcons name="waves" size={18} color="#93c5fd" />
                <Text style={styles.cardTitle}>Marées du jour</Text>
              </View>

              <View style={styles.twoBoxes}>
                <View style={styles.smallCard}>
                  <View style={styles.smallHead}>
                    <MaterialCommunityIcons name="arrow-up-bold" size={16} color="#60a5fa" />
                    <Text style={styles.smallHeadText}>Marée haute</Text>
                  </View>
                  <Text style={styles.bigTime}>{formatHour(highTide?.time)}</Text>
                  <Text style={styles.smallSub}>
                    {highTide?.height_m != null ? `${highTide.height_m.toFixed(2)} m` : "—"}
                  </Text>
                </View>

                <View style={[styles.smallCard, { backgroundColor: "rgba(34,197,94,0.14)" }]}>
                  <View style={styles.smallHead}>
                    <MaterialCommunityIcons name="arrow-down-bold" size={16} color="#34d399" />
                    <Text style={styles.smallHeadText}>Marée basse</Text>
                  </View>
                  <Text style={styles.bigTime}>{formatHour(lowTide?.time)}</Text>
                  <Text style={styles.smallSub}>
                    {lowTide?.height_m != null ? `${lowTide.height_m.toFixed(2)} m` : "—"}
                  </Text>
                </View>
              </View>

              <View style={styles.chartBox}>
                <Text style={styles.chartTitle}>Cycle de marée</Text>

                <View style={styles.chartBars}>
                  {chartLevels.map((h: number, idx: number) => (
                    <View key={idx} style={styles.barWrap}>
                      <View style={[styles.bar, { height: 70 * h }]} />
                    </View>
                  ))}
                </View>

                <View style={styles.chartTimes}>
                  <Text style={styles.timeTxt}>00h</Text>
                  <Text style={styles.timeTxt}>06h</Text>
                  <Text style={[styles.timeTxt, { color: "#34d399" }]}>12h</Text>
                  <Text style={styles.timeTxt}>18h</Text>
                  <Text style={styles.timeTxt}>24h</Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <MaterialCommunityIcons name="wave" size={18} color="#93c5fd" />
                <Text style={styles.cardTitle}>Vagues actuelles</Text>
              </View>

              <View style={styles.statsRow}>
                <StatBox
                  icon="arrow-up-down"
                  label="Hauteur"
                  value={currentWave != null ? `${currentWave} m` : "—"}
                />
                <StatBox
                  icon="compass-outline"
                  label="Direction"
                  value={currentDirection}
                />
                <StatBox
                  icon="clock-outline"
                  label="Période"
                  value={currentPeriod != null ? `${currentPeriod} s` : "—"}
                />
              </View>

              <View style={styles.stateBox}>
                <Text style={styles.stateLabel}>État de la mer</Text>
                <Text style={styles.stateValue}>{seaState}</Text>
              </View>
            </View>

            <View style={[styles.card, styles.cardBlue]}>
              <View style={styles.cardTitleRow}>
                <MaterialCommunityIcons name="robot-outline" size={18} color="#fff" />
                <Text style={styles.cardTitle}>Recommandation IA</Text>
              </View>

              <Text style={styles.iaText}>Moment idéal pour poser les filets</Text>

              <View style={styles.pillsRow}>
                <View style={styles.pill}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Ionicons name="time-outline" size={16} color="#2dd4bf" />
                    <Text style={styles.pillLabel}>Créneau conseillé</Text>
                  </View>
                  <Text style={styles.pillValue}>{ai?.recommended_window ?? "—"}</Text>
                </View>

                <View style={styles.pill}>
                  <Text style={styles.pillLabel}>Niveau de sécurité</Text>
                  <View style={styles.safeChip}>
                    <Text style={styles.safeText}>{ai?.safety ?? risk}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <MaterialCommunityIcons name="calendar-week" size={18} color="#93c5fd" />
                <Text style={styles.cardTitle}>Prévisions 7 jours</Text>
              </View>

              <View style={{ gap: 10 }}>
                {daily7.map((d, i) => (
                  <View key={`${d.date}-${i}`} style={styles.dayRow}>
                    <Text style={styles.dayName}>{dayName(d.date)}</Text>
                    <Text style={styles.dayDate}>{d.date}</Text>
                    <View style={{ flex: 1 }} />
                    <Text style={styles.dayValue}>
                      {d.wave_height_max_m != null ? `${d.wave_height_max_m} m` : "—"} / {d.wave_direction_text ?? "—"}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.alertCard}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Ionicons name="warning-outline" size={18} color="#f59e0b" />
                <Text style={styles.alertTitle}>Attention</Text>
              </View>
              <Text style={styles.alertText}>
                {data?.warning ?? "Prévisions marines disponibles."}
              </Text>
            </View>
          </>
        )}

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
  title: { color: "#fff", fontSize: 16, fontWeight: "900", marginTop: 8 },

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

  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  cardTitle: { color: "#fff", fontWeight: "900", fontSize: 14 },

  twoBoxes: { flexDirection: "row", gap: 10 },
  smallCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  smallHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  smallHeadText: { color: "rgba(255,255,255,0.8)", fontWeight: "800", fontSize: 12 },
  bigTime: { marginTop: 10, color: "#fff", fontWeight: "900", fontSize: 22 },
  smallSub: { marginTop: 6, color: "rgba(255,255,255,0.65)", fontWeight: "800", fontSize: 11 },

  chartBox: {
    marginTop: 12,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  chartTitle: { color: "rgba(255,255,255,0.8)", fontWeight: "900", marginBottom: 10 },

  chartBars: { flexDirection: "row", alignItems: "flex-end", gap: 6, height: 80 },
  barWrap: { flex: 1, justifyContent: "flex-end" },
  bar: {
    borderRadius: 8,
    backgroundColor: "rgba(147, 197, 253, 0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  chartTimes: { marginTop: 10, flexDirection: "row", justifyContent: "space-between" },
  timeTxt: { color: "rgba(255,255,255,0.65)", fontWeight: "800", fontSize: 11 },

  statsRow: { flexDirection: "row", gap: 10 },
  statBox: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: "rgba(0,0,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
  },
  statLabel: { marginTop: 6, color: "rgba(255,255,255,0.7)", fontWeight: "800", fontSize: 11 },
  statValue: { marginTop: 6, color: "#fff", fontWeight: "900", fontSize: 12 },

  stateBox: {
    marginTop: 12,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  stateLabel: { color: "rgba(255,255,255,0.65)", fontWeight: "800", fontSize: 11 },
  stateValue: { marginTop: 6, color: "#fff", fontWeight: "900", fontSize: 12 },

  iaText: { color: "rgba(255,255,255,0.85)", fontWeight: "900", marginBottom: 10 },

  pillsRow: { flexDirection: "row", gap: 10 },
  pill: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  pillLabel: { color: "rgba(255,255,255,0.7)", fontWeight: "800", fontSize: 11 },
  pillValue: { marginTop: 8, color: "#fff", fontWeight: "900", fontSize: 12 },

  safeChip: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(34,197,94,0.75)",
  },
  safeText: { color: "#fff", fontWeight: "900", fontSize: 12 },

  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(0,0,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  dayName: { color: "#fff", fontWeight: "900", width: 44, textTransform: "capitalize" },
  dayDate: { color: "rgba(255,255,255,0.72)", fontWeight: "800", fontSize: 11 },
  dayValue: { color: "#fff", fontWeight: "900", fontSize: 12 },

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