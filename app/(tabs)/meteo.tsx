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
import {
  getMarineWeather,
  MarineWeatherResponse,
} from "../../src/services/weather";
import { FISHING_CITIES } from "../../src/constants/cities";
import CityPicker from "../../src/components/CityPicker";
import { useSavedCity } from "../../src/hooks/useSavedCity";

type SmallStatProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
};

type ForecastDay = {
  date: string;
  day: string;
  max: number | null;
  min: number | null;
  desc?: string;
  icon?: string;
};

function SmallStat({ icon, label, value }: SmallStatProps) {
  return (
    <View style={styles.smallStat}>
      <MaterialCommunityIcons
        name={icon}
        size={18}
        color="rgba(255,255,255,0.9)"
      />
      <Text style={styles.smallLabel}>{label}</Text>
      <Text style={styles.smallValue}>{value}</Text>
    </View>
  );
}

function dayName(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { weekday: "short" });
}

export default function Meteo() {
  const router = useRouter();

  const { selectedCity, setSelectedCity, ready } = useSavedCity(
    "oceanmind_selected_city"
  );

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<MarineWeatherResponse | null>(null);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/home");
  };

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setErr(null);

      const res = await getMarineWeather(selectedCity.lat, selectedCity.lon);
      setData(res);
    } catch (e) {
      console.log("weather fetch error:", e);
      setErr(
        "La météo marine est momentanément indisponible. Veuillez réessayer plus tard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ready) return;
    fetchWeather();
  }, [selectedCity, ready]);

  const current = data?.current ?? {};
  const marine = data?.marine ?? {};
  const daily7 = Array.isArray(data?.daily_7) ? data.daily_7 : [];

  const days: ForecastDay[] = useMemo(() => {
    return daily7.slice(0, 7).map((d: any) => ({
      date: d.date,
      day: dayName(d.date),
      max: d.max ?? null,
      min: d.min ?? null,
      desc: d.desc,
      icon: d.icon,
    }));
  }, [daily7]);

  const temp = current?.temp ?? null;
  const descNow = current?.desc ?? "—";
  const iconNow = current?.icon ?? "weather-cloudy";

  const wind = marine?.wind_kmh ?? null;
  const windDir = marine?.dir ?? null;
  const wave = marine?.waves_m ?? null;
  const seaTemp = marine?.water_c ?? null;

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

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require("../../src/assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Météo marine</Text>

        <CityPicker
          cities={FISHING_CITIES}
          selectedCity={selectedCity}
          onSelect={setSelectedCity}
          title="Choisir une ville météo"
        />

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color="#2dd4bf" />
            <Text style={styles.loaderText}>Chargement de la météo...</Text>
          </View>
        ) : err ? (
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <Ionicons name="warning-outline" size={18} color="#f59e0b" />
              <Text style={styles.alertTitle}>Erreur</Text>
            </View>

            <Text style={styles.alertText}>{err}</Text>

            <Pressable style={styles.retryBtn} onPress={fetchWeather}>
              <Text style={styles.retryBtnText}>Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  <MaterialCommunityIcons
                    name="weather-partly-cloudy"
                    size={18}
                    color="#facc15"
                  />
                  <Text style={styles.cardTitle}>Conditions actuelles</Text>
                </View>
              </View>

              <View style={styles.currentRow}>
                <View>
                  <Text style={styles.temp}>
                    {temp != null ? `${Math.round(temp)}°C` : "—"}
                  </Text>
                  <Text style={styles.subText}>{descNow}</Text>
                </View>

                <View style={styles.bigIconBox}>
                  <MaterialCommunityIcons
                    name={iconNow as keyof typeof MaterialCommunityIcons.glyphMap}
                    size={24}
                    color="#fff"
                  />
                </View>
              </View>

              <View style={styles.statRow}>
                <SmallStat
                  icon="weather-windy"
                  label="Vent"
                  value={
                    wind != null
                      ? `${Math.round(wind)} km/h${windDir ? `\n${windDir}` : ""}`
                      : "—"
                  }
                />

                <SmallStat
                  icon="waves"
                  label="Vagues"
                  value={wave != null ? `${wave} m` : "—"}
                />

                <SmallStat
                  icon="thermometer-water"
                  label="Température eau"
                  value={seaTemp != null ? `${Math.round(seaTemp)}°C` : "—"}
                />
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Prévisions sur 7 jours</Text>

              <View style={styles.daysWrap}>
                {days.map((d) => (
                  <View key={d.date} style={styles.dayRow}>
                    <Text style={styles.dayName}>{d.day}</Text>
                    <Text style={styles.dayDate}>{d.date}</Text>
                    <View style={{ flex: 1 }} />
                    <Text style={styles.dayTemp}>
                      {d.min != null ? Math.round(d.min) : "—"}° /{" "}
                      {d.max != null ? Math.round(d.max) : "—"}°
                    </Text>
                  </View>
                ))}
              </View>
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
  loaderWrap: {
    marginTop: 18,
    alignItems: "center",
  },
  loaderText: {
    marginTop: 10,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "800",
  },
  card: {
    marginTop: 14,
    borderRadius: 20,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
  },
  currentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  temp: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
  },
  subText: {
    marginTop: 4,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "700",
  },
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
  statRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  smallStat: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: "rgba(0,0,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  smallLabel: {
    marginTop: 6,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "800",
    fontSize: 11,
  },
  smallValue: {
    marginTop: 4,
    color: "#fff",
    fontWeight: "900",
    fontSize: 12,
    lineHeight: 16,
  },
  daysWrap: {
    marginTop: 12,
    gap: 10,
  },
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
  dayName: {
    color: "#fff",
    fontWeight: "900",
    width: 46,
    textTransform: "capitalize",
  },
  dayDate: {
    color: "rgba(255,255,255,0.72)",
    fontWeight: "800",
    fontSize: 11,
  },
  dayTemp: {
    color: "#fff",
    fontWeight: "900",
  },
  alertCard: {
    marginTop: 14,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(245, 158, 11, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.22)",
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  alertTitle: {
    color: "#fff",
    fontWeight: "900",
  },
  alertText: {
    color: "rgba(255,255,255,0.78)",
    fontWeight: "700",
    lineHeight: 16,
  },
  retryBtn: {
    marginTop: 12,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(56,189,248,0.95)",
  },
  retryBtnText: {
    color: "#fff",
    fontWeight: "900",
  },
});