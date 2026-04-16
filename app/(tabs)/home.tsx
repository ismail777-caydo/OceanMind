import React, { useEffect, useMemo, useRef } from "react";
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
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const POS_KEY = "store_fab_position_v1";
const FAB_SIZE = 70; // نفس size ديالك
const FAB_MARGIN = 16; // نفس right: 16
const TABBAR_SAFE = 90; // باش ما يهبطش بزاف فوق tab bar

function Card({ title, desc, icon, bg, onPress }: any) {
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
  const { width, height } = Dimensions.get("window");

  // ✅ default position (يمين/لتحت)
  const defaultX = width - FAB_MARGIN - FAB_SIZE;
  const defaultY = height - 110 - FAB_SIZE; // كان عندك bottom: 110

  const pan = useRef(new Animated.ValueXY({ x: defaultX, y: defaultY })).current;

  // باش نعرفو منين بدا drag
  const start = useRef({ x: defaultX, y: defaultY });

  // ✅ حمّل position من storage
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(POS_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw);
        if (typeof saved?.x === "number" && typeof saved?.y === "number") {
          pan.setValue({ x: saved.x, y: saved.y });
          start.current = { x: saved.x, y: saved.y };
        }
      } catch {}
    })();
  }, [pan]);

  // ✅ constraints باش ما يخرجش برا الشاشة
  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

  const DRAG_THRESHOLD = 6; // ✅ إلا كانت الحركة أقل من 6px = tap ماشي drag
  const isDraggingRef = useRef(false);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // ✅ ما نبدأوش panResponder مباشرة فـ start
        onStartShouldSetPanResponder: () => false,

        // ✅ غير إلا تحرك شوية
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) > DRAG_THRESHOLD || Math.abs(g.dy) > DRAG_THRESHOLD,

        onPanResponderGrant: () => {
          isDraggingRef.current = true;
          start.current = { x: (pan.x as any)._value, y: (pan.y as any)._value };
        },

        onPanResponderMove: (_, g) => {
          const nextX = start.current.x + g.dx;
          const nextY = start.current.y + g.dy;

          const x = clamp(nextX, 8, width - FAB_SIZE - 8);
          const y = clamp(nextY, 8, height - FAB_SIZE - TABBAR_SAFE);

          pan.setValue({ x, y });
        },

        onPanResponderRelease: async () => {
          // ✅ فآخر drag كنحفظو
          try {
            const x = (pan.x as any)._value;
            const y = (pan.y as any)._value;
            await AsyncStorage.setItem(POS_KEY, JSON.stringify({ x, y }));
          } catch {}

          // ✅ نخليها ترجع false بعد لحظة صغيرة
          setTimeout(() => {
            isDraggingRef.current = false;
          }, 50);
        },
      }),
    [width, height, pan]
  );
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
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.welcome}>Bienvenue Ismail 🙂</Text>
              <View style={styles.locRow}>
                <Ionicons
                  name="location-sharp"
                  size={14}
                  color="rgba(255,255,255,0.75)"
                />
                <Text style={styles.location}>Larache</Text>
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
              title={"Mon Profil"}
              desc="Gérez vos informations"
              icon="account-circle-outline"
              bg="rgba(148,163,184,0.35)"
              onPress={() => router.push("/(tabs)/profil")}
            />
          </View>
        </ScrollView>

        {/* ✅ DRAGGABLE FLOATING STORE BUTTON (كيحفظ position) */}
        <Animated.View
          style={[styles.storeFabWrap, { transform: pan.getTranslateTransform() }]}
          {...panResponder.panHandlers}
        >
          <Pressable
            onPress={() => {
    // ✅ إلا كان drag راه ماشي tap
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

  /* ✅ wrapper ديال draggable button */
  storeFabWrap: {
    position: "absolute",
    left: 0,
    top: 0,
    // المكان الحقيقي كيتحدد بالـ transform ديال pan
  },

  /* ✅ Floating Circular Store Button */
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