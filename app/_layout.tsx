import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { AuthProvider, useAuth } from "../src/auth/AuthContext";
import { supabase } from "../src/lib/supabaseClient";
import { loadUserSubscription } from "../src/services/subscription";
import { useSubscriptionStore } from "../src/store/subscriptionStore";
import { initRevenueCat } from "../src/services/billing"; // 👈 تبدلات هنا

function RootNav() {
  const { logged, ready } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const resetSubscription = useSubscriptionStore((state) => state.resetSubscription);

  // 👇 NEW: startup init
  useEffect(() => {
    initRevenueCat();
  }, []);

  useEffect(() => {
    if (!ready) return;

    const inTabs = segments[0] === "(tabs)";

    if (!logged && inTabs) {
      resetSubscription();
      router.replace("/home" as any);
      return;
    }

    if (logged && !inTabs) {
      router.replace("/home" as any);
    }
  }, [logged, ready, segments, router, resetSubscription]);

  useEffect(() => {
    const syncPremium = async () => {
      if (!ready) return;

      if (!logged) {
        resetSubscription();
        return;
      }

      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          resetSubscription();
          return;
        }

        // ممكن تخليها أو تحيدها حسب كيفاش صايب billing ديالك
        await loadUserSubscription(user.id);
      } catch (e) {
        console.log("load subscription / revenuecat init error:", e);
        resetSubscription();
      }
    };

    syncPremium();
  }, [logged, ready, resetSubscription]);

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0b1220",
        }}
      >
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNav />
    </AuthProvider>
  );
}