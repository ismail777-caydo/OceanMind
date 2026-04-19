import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  ImageBackground,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { usePremiumAccess } from "../hooks/usePremiumAccess";

type Props = {
  children: React.ReactNode;
  featureName?: string;
};

export default function PremiumGate({
  children,
  featureName = "this feature",
}: Props) {
  const { isPremium, loading } = usePremiumAccess();

  if (loading) {
    return (
      <ImageBackground
        source={require("../assets/background.png")}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </ImageBackground>
    );
  }

  if (!isPremium) {
    return (
      <ImageBackground
        source={require("../assets/background.png")}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <View style={styles.center}>
          <Image
            source={require("../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.card}>
            <View style={styles.iconWrap}>
              <Ionicons name="lock-closed" size={28} color="#fff" />
            </View>

            <Text style={styles.title}>Premium Required</Text>

            <Text style={styles.desc}>
              {featureName} is available only for premium users.
            </Text>

            <Pressable
              onPress={() => router.push("/(tabs)/paywall" as any)}
              style={styles.upgradeBtn}
            >
              <Ionicons name="diamond-outline" size={18} color="#fff" />
              <Text style={styles.upgradeText}>Upgrade Now</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 25, 45, 0.45)",
  },
  center: {
    flex: 1,
    paddingHorizontal: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 10,
  },
  card: {
    width: "100%",
    borderRadius: 22,
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
  },
  iconWrap: {
    width: 62,
    height: 62,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59,130,246,0.85)",
    marginBottom: 14,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
  },
  desc: {
    marginTop: 10,
    color: "rgba(255,255,255,0.82)",
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    marginBottom: 20,
  },
  upgradeBtn: {
    height: 50,
    minWidth: 190,
    borderRadius: 16,
    backgroundColor: "rgba(16,185,129,0.88)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 18,
  },
  upgradeText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});