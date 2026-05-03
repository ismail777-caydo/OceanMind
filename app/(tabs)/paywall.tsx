import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Image,
  ImageBackground,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function PaywallScreen() {
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
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require("../../src/assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Ocean Mind Premium</Text>
        <Text style={styles.subtitle}>
          Unlock fish detection, smart maps, and advanced tools.
        </Text>

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

          <View style={styles.featuresBox}>
            <View style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={18} color="#2dd4bf" />
              <Text style={styles.featureText}>Fish detection access</Text>
            </View>

            <View style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={18} color="#2dd4bf" />
              <Text style={styles.featureText}>Smart fishing maps</Text>
            </View>

            <View style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={18} color="#2dd4bf" />
              <Text style={styles.featureText}>Advanced premium tools</Text>
            </View>
          </View>

          <Pressable disabled={true} style={[styles.subscribeBtn, { opacity: 0.72 }]}>
            <Ionicons name="time-outline" size={18} color="#fff" />
            <Text style={styles.subscribeText}>Paiement bientôt disponible</Text>
          </Pressable>

          <Text style={styles.noticeText}>
            L’abonnement sera activé après validation sur Google Play.
          </Text>
        </View>

        <View style={styles.bottomActions}>
          <Pressable disabled={true} style={[styles.secondaryBtn, { opacity: 0.55 }]}>
            <Ionicons name="refresh-outline" size={16} color="#fff" />
            <Text style={styles.secondaryText}>Restore Purchase bientôt disponible</Text>
          </Pressable>

          <Pressable onPress={() => router.back()} style={styles.ghostBtn}>
            <Text style={styles.ghostText}>Not now</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

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
    alignSelf: "flex-start",
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
    paddingTop: 4,
    paddingBottom: 28,
  },

  logo: {
    width: 155,
    height: 155,
    alignSelf: "center",
    marginTop: 2,
    marginBottom: 2,
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
    lineHeight: 19,
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
    backgroundColor: "rgba(59,130,246,0.85)",
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
    marginBottom: 5,
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

  noticeText: {
    marginTop: 10,
    color: "rgba(255,255,255,0.72)",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 16,
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
    paddingHorizontal: 12,
  },

  secondaryText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
    textAlign: "center",
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