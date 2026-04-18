import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../../src/lib/supabaseClient";
import { useAuth } from "../../src/auth/AuthContext";

const POS_KEY = "store_fab_position_v1";
const FAB_SIZE = 70;
const FAB_MARGIN = 16;
const TABBAR_SAFE = 90;

type CardProps = {
  title: string;
  desc: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  bg: string;
  onPress: () => void;
};

type ProfileData = {
  full_name?: string | null;
  city?: string | null;
};

function Card({ title, desc, icon, bg, onPress }: CardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
    >
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
  const { user, ready } = useAuth();

  const { width, height } = Dimensions.get("window");

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const defaultX = width - FAB_MARGIN - FAB_SIZE;
  const defaultY = height - 110 - FAB_SIZE;

  const pan = useRef(new Animated.ValueXY({ x: defaultX, y: defaultY })).current;
  const start = useRef({ x: defaultX, y: defaultY });

  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

  const DRAG_THRESHOLD = 6;
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const loadFabPosition = async () => {
      try {
        const raw = await AsyncStorage.getItem(POS_KEY);
        if (!raw) return;

        const saved = JSON.parse(raw);

        if (typeof saved?.x === "number" && typeof saved?.y === "number") {
          pan.setValue({ x: saved.x, y: saved.y });
          start.current = { x: saved.x, y: saved.y };
        }
      } catch (e) {
        console.log("Failed to load FAB position:", e);
      }
    };

    loadFabPosition();
  }, [pan]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!ready) return;

      if (!user?.id) {
        setProfile(null);
        setProfileLoading(false);
        return;
      }

      try {
        setProfileLoading(true);

        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, city")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.log("home profile fetch error:", error.message);
          setProfile(null);
          return;
        }

        setProfile(data || null);
      } catch (e) {
        console.log("home profile fetch global error:", e);
        setProfile(null);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [ready, user?.id]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) > DRAG_THRESHOLD || Math.abs(g.dy) > DRAG_THRESHOLD,
        onPanResponderGrant: () => {
          isDraggingRef.current = true;
          start.current = {
            x: (pan.x as any)._value,
            y: (pan.y as any)._value,
          };
        },
        onPanResponderMove: (_, g) => {
          const nextX = start.current.x + g.dx;
          const nextY = start.current.y + g.dy;

          const x = clamp(nextX, 8, width - FAB_SIZE - 8);
          const y = clamp(nextY, 8, height - FAB_SIZE - TABBAR_SAFE);

          pan.setValue({ x, y });
        },
        onPanResponderRelease: async () => {
          try {
            const x = (pan.x as any)._value;
            const y = (pan.y as any)._value;
            await AsyncStorage.setItem(POS_KEY, JSON.stringify({ x, y }));
          } catch (e) {
            console.log("Failed to save FAB position:", e);
          }

          setTimeout(() => {
            isDraggingRef.current = false;
          }, 50);
        },
      }),
    [width, height, pan]
  );

  const displayName = profile?.full_name?.trim() || user?.email?.split("@")[0] || "Utilisateur";
  const displayCity = profile?.city?.trim() || "Ville non renseignée";

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../../src/assets/background.png")}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.welcome}>Bienvenue {displayName} 🙂</Text>

              <View style={styles.locRow}>
                <Ionicons
                  name="location-sharp"
                  size={14}
                  color="rgba(255,255,255,0.75)"
                />
                <Text style={styles.location}>
                  {profileLoading ? "Chargement..." : displayCity}
                </Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.bellBtn,
                pressed && { transform: [{ scale: 0.96 }] },
              ]}
            >
              <Ionicons name="notifications-outline" size={18} color="#fff" />
            </Pressable>
          </View>

          {!ready ? (
            <View style={styles.loaderBox}>
              <ActivityIndicator size="large" color="#38bdf8" />
            </View>
          ) : (
            <View style={styles.grid}>
              <Card
                title={"Détection des poissons\nIA"}
                desc="Espèce, taille, légalité"
                icon="fish"
                bg="rgba(56,189,248,0.35)"
                onPress={() => router.push("/(tabs)/detection")}
              />

              <Card
                title={"Carte des zones de\npêche"}
                desc="Zones riches recommandées"
                icon="map-marker-radius"
                bg="rgba(34,197,94,0.35)"
                onPress={() => router.push("/(tabs)/zones")}
              />

              <Card
                title={"Météo marine IA"}
                desc="Prévisions en temps réel"
                icon="weather-partly-cloudy"
                bg="rgba(59,130,246,0.35)"
                onPress={() => router.push("/(tabs)/meteo")}
              />

              <Card
                title={"Marées & vagues"}
                desc="Horaires et intensité"
                icon="wave"
                bg="rgba(139,92,246,0.35)"
                onPress={() => router.push("/(tabs)/tides")}
              />

              <Card
                title={"Journal de bord\nnumérique"}
                desc="Historique des captures"
                icon="book-outline"
                bg="rgba(245,158,11,0.35)"
                onPress={() => router.push("/(tabs)/logbook")}
              />

              <Card
                title={"Communauté des\npêcheurs"}
                desc="Partage et conseils"
                icon="account-group-outline"
                bg="rgba(16,185,129,0.35)"
                onPress={() => router.push("/(tabs)/community")}
              />

              <Card
                title={"Mon profil"}
                desc="Gérez vos informations"
                icon="account-circle-outline"
                bg="rgba(148,163,184,0.35)"
                onPress={() => router.push("/(tabs)/profil")}
              />
            </View>
          )}
        </ScrollView>

        <Animated.View
          style={[styles.storeFabWrap, { transform: pan.getTranslateTransform() }]}
          {...panResponder.panHandlers}
        >
          <Pressable
            onPress={() => {
              if (isDraggingRef.current) return;
              router.push("/(tabs)/store");
            }}
            style={styles.storeFab}
          >
            <Ionicons name="cart-outline" size={22} color="#fff" />
          </Pressable>
        </Animated.View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
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
  loaderBox: {
    marginTop: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 16,
    columnGap: 12,
  },
  card: {
    width: "48%",
    minHeight: 145,
    borderRadius: 24,
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
  storeFabWrap: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  storeFab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(46, 105, 160, 0.95)",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.22)",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
});