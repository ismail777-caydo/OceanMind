import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Image,
  ImageBackground,
  Linking,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type PlanType = "monthly" | "yearly";

const WHATSAPP_NUMBER = "212603425532";

const FEATURES = [
  "Fish detection access",
  "Smart fishing maps",
  "Advanced premium tools",
];

const openWhatsApp = async (plan: PlanType) => {
  const message =
    plan === "yearly"
      ? "Bonjour, je souhaite souscrire à l'abonnement annuel Ocean Mind (199 DH)."
      : "Bonjour, je souhaite souscrire à l'abonnement mensuel Ocean Mind (49 DH).";

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    message
  )}`;

  try {
    await Linking.openURL(url);
  } catch (error) {
    Alert.alert("Erreur", "Impossible d'ouvrir WhatsApp");
  }
};

export default function PaywallScreen() {
  const renderFeatures = () => (
    <View style={styles.featuresBox}>
      {FEATURES.map((item, index) => (
        <View key={index} style={styles.featureRow}>
          <Ionicons name="checkmark-circle" size={18} color="#2dd4bf" />
          <Text style={styles.featureText}>{item}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <ImageBackground
      source={require("../../src/assets/background.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      {/* TOP BAR */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={18} color="#fff" />
          <Text style={styles.backText}>Retour</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={require("../../src/assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Ocean Mind Premium</Text>
        <Text style={styles.subtitle}>
          Unlock fish detection, smart maps, and advanced tools.
        </Text>

        {/* ================= YEARLY ================= */}
        <View style={[styles.planCard, { marginBottom: 18 }]}>
          <View style={[styles.badge, { backgroundColor: "rgba(59,130,246,0.85)" }]}>
            <Ionicons name="star-outline" size={14} color="#fff" />
            <Text style={styles.badgeText}>BEST OFFER</Text>
          </View>

          <Text style={styles.planTitle}>Premium Yearly</Text>
          <Text style={styles.planDesc}>Save money - Full access for 1 year</Text>

          <View style={styles.priceBox}>
            <Text style={styles.price}>199 DH</Text>
            <Text style={styles.priceSub}>/ an</Text>
          </View>

          {renderFeatures()}

          <Pressable
            onPress={() => openWhatsApp("yearly")}
            style={[styles.subscribeBtn, { backgroundColor: "rgba(59,130,246,0.85)" }]}
          >
            <Ionicons name="logo-whatsapp" size={18} color="#fff" />
            <Text style={styles.subscribeText}>
              Acheter Premium Annuel
            </Text>
          </Pressable>
        </View>

        {/* ================= MONTHLY ================= */}
        <View style={styles.planCard}>
          <View style={styles.badge}>
            <Ionicons name="diamond-outline" size={14} color="#fff" />
            <Text style={styles.badgeText}>PREMIUM ACCESS</Text>
          </View>

          <Text style={styles.planTitle}>Premium Monthly</Text>
          <Text style={styles.planDesc}>Full access to premium features</Text>

          <View style={styles.priceBox}>
            <Text style={styles.price}>49 DH</Text>
            <Text style={styles.priceSub}>/ mois</Text>
          </View>

          {renderFeatures()}

          <Pressable
            onPress={() => openWhatsApp("monthly")}
            style={styles.subscribeBtn}
          >
            <Ionicons name="logo-whatsapp" size={18} color="#fff" />
            <Text style={styles.subscribeText}>
              Acheter Premium Mensuel
            </Text>
          </Pressable>
        </View>

        {/* BOTTOM */}
        <View style={styles.bottomActions}>
          <Pressable disabled style={[styles.secondaryBtn, { opacity: 0.55 }]}>
            <Ionicons name="refresh-outline" size={16} color="#fff" />
            <Text style={styles.secondaryText}>
              Restore Purchase bientôt disponible
            </Text>
          </Pressable>

          <Pressable onPress={() => router.back()} style={styles.ghostBtn}>
            <Text style={styles.ghostText}>Not now</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  bg: { flex: 1 },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 25, 45, 0.45)",
  },

  topBar: {
    paddingTop: 52,
    paddingHorizontal: 16,
  },

  backBtn: {
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

  backText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },

  logo: {
    width: 155,
    height: 155,
    alignSelf: "center",
  },

  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 10,
    color: "rgba(255,255,255,0.82)",
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 18,
  },

  planCard: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },

  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(16,185,129,0.85)",
    marginBottom: 14,
  },

  badgeText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 11,
  },

  planTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
  },

  planDesc: {
    marginTop: 6,
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    fontWeight: "700",
  },

  priceBox: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 18,
    marginBottom: 18,
  },

  price: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "900",
  },

  priceSub: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 6,
  },

  featuresBox: {
    gap: 12,
    marginBottom: 20,
  },

  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  featureText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },

  subscribeBtn: {
    height: 50,
    borderRadius: 16,
    backgroundColor: "rgba(16,185,129,0.88)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  subscribeText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
  },

  bottomActions: {
    marginTop: 16,
    gap: 10,
  },

  secondaryBtn: {
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: "rgba(59,130,246,0.22)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  secondaryText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
  },

  ghostBtn: {
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  ghostText: {
    color: "rgba(255,255,255,0.72)",
    fontWeight: "700",
    fontSize: 13,
  },
});