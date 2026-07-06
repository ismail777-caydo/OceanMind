import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTrial } from "../hooks/useTrial";
import { usePremiumAccess } from "../hooks/usePremiumAccess";

export default function TrialCard() {
  const {
  remainingDays,
  expired,
  loading,
  inTrial,
} = useTrial();

const { hasPremium } = usePremiumAccess();
  console.log({
  remainingDays,
  expired,
  loading,
  hasPremium,
});

  if (loading) {
  return null;
}

if (hasPremium && !inTrial) {
  return null;
}

  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <Ionicons
          name={expired ? "lock-closed" : "gift"}
          size={24}
          color="#fff"
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.title}>
          {expired ? "Free Trial Expired" : "Free Trial"}
        </Text>

        <Text style={styles.desc}>
          {expired
            ? "Your free trial has ended. Upgrade to continue using premium features."
            : `You have ${remainingDays} day${
                remainingDays !== 1 ? "s" : ""
              } remaining.`}
        </Text>
      </View>

      <Pressable
        style={styles.button}
        onPress={() => router.push("/(tabs)/paywall" as any)}
      >
        <Text style={styles.buttonText}>Upgrade</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    marginBottom: 18,
    borderRadius: 18,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#16a34a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },

  desc: {
    marginTop: 4,
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    lineHeight: 18,
  },

  button: {
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginLeft: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "900",
  },
});