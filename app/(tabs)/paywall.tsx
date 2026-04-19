import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Image,
  ImageBackground,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSubscriptionStore } from "../../src/store/subscriptionStore";
import { supabase } from "../../src/lib/supabaseClient";
import { activatePremium } from "../../src/services/premium";
import {
  getCurrentOffering,
  purchasePackage,
  restoreRevenueCatPurchases,
  hasPremiumAccess,
} from "../../src/services/revenuecat";

export default function PaywallScreen() {
  const setSubscription = useSubscriptionStore((state) => state.setSubscription);

  const [pkg, setPkg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    const loadOffering = async () => {
      try {
        const offering = await getCurrentOffering();

        const monthlyPackage =
          offering?.monthly ??
          offering?.availablePackages?.find((p: any) => p.identifier === "$rc_monthly") ??
          offering?.availablePackages?.[0] ??
          null;

        setPkg(monthlyPackage);
      } catch (e) {
        console.log("load offering error:", e);
      } finally {
        setLoading(false);
      }
    };

    loadOffering();
  }, []);

  const handleSubscribe = async () => {
    if (!pkg) {
      Alert.alert("Unavailable", "No subscription package found.");
      return;
    }

    try {
      setBuying(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("Error", "User not found.");
        return;
      }

      const customerInfo = await purchasePackage(pkg);

      if (hasPremiumAccess(customerInfo)) {
        await activatePremium(user.id);

        setSubscription({
          isPremium: true,
          planType: "monthly",
          status: "active",
          expiresAt: null,
        });

        Alert.alert("Success", "Premium activated successfully.", [
          {
            text: "OK",
            onPress: () => router.replace("/home" as any),
          },
        ]);
      } else {
        Alert.alert("Purchase incomplete", "Premium access was not activated.");
      }
    } catch (e: any) {
      console.log("purchase subscribe error:", e);

      if (!e?.userCancelled) {
        Alert.alert("Error", e?.message || "Purchase failed.");
      }
    } finally {
      setBuying(false);
    }
  };

  const handleRestore = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("Error", "User not found.");
        return;
      }

      const customerInfo = await restoreRevenueCatPurchases();

      if (hasPremiumAccess(customerInfo)) {
        await activatePremium(user.id);

        setSubscription({
          isPremium: true,
          planType: "monthly",
          status: "active",
          expiresAt: null,
        });

        Alert.alert("Restored", "Your premium access has been restored.", [
          {
            text: "OK",
            onPress: () => router.replace("/home" as any),
          },
        ]);
      } else {
        Alert.alert("No subscription", "No active premium subscription found.");
      }
    } catch (e: any) {
      console.log("restore purchase error:", e);
      Alert.alert("Error", e?.message || "Could not restore purchases.");
    }
  };

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

          <Pressable
            onPress={handleSubscribe}
            disabled={loading || buying || !pkg}
            style={[
              styles.subscribeBtn,
              (loading || buying || !pkg) && { opacity: 0.65 },
            ]}
          >
            {buying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="lock-closed-outline" size={18} color="#fff" />
                <Text style={styles.subscribeText}>
                  {loading ? "Loading..." : "Subscribe Now"}
                </Text>
              </>
            )}
          </Pressable>
        </View>

        <View style={styles.bottomActions}>
          <Pressable onPress={handleRestore} style={styles.secondaryBtn}>
            <Ionicons name="refresh-outline" size={16} color="#fff" />
            <Text style={styles.secondaryText}>Restore Purchase</Text>
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
  bottomActions: {
    marginTop: 16,
    gap: 10,
  },
  secondaryBtn: {
    height: 46,
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
    fontSize: 13,
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