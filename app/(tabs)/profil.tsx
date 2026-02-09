import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// ✅ NEW: AuthContext
import { useAuth } from "../../src/auth/AuthContext";

function RowNav({ icon, label, onPress }: any) {
  return (
    <Pressable onPress={onPress} style={styles.navRow}>
      <View style={styles.fieldLeft}>
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color="rgba(255,255,255,0.85)"
        />
        <Text style={styles.fieldLabel}>{label}</Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={16}
        color="rgba(255,255,255,0.75)"
      />
    </Pressable>
  );
}

export default function Profil() {
  const router = useRouter();

  // ✅ Auth
  const { logout } = useAuth();

  const [lang, setLang] = useState<"Français" | "Arabe" | "Darija">("Français");
  const [voiceMode, setVoiceMode] = useState(true);
  const [meteoNotif, setMeteoNotif] = useState(true);

  const cycleLang = () => {
    setLang((p) =>
      p === "Français" ? "Arabe" : p === "Arabe" ? "Darija" : "Français"
    );
  };

  // ✅ رجوع مضمون لـ Accueil (بلا GO_BACK)
  const goHome = () => router.replace("/home");


  // ✅ Logout via AuthContext
  const handleLogout = async () => {
    await logout();
    router.replace("/"); // 👈 ديال login فـ root
  };

  return (
    <ImageBackground
      source={require("../../src/assets/background.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} pointerEvents="none" />

      <View style={styles.topBar}>
        <Pressable onPress={goHome} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={18} color="#fff" />
          <Text style={styles.backText}>Retour</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: "center" }}>
          <Image
            source={require("../../src/assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={34} color="#fff" />
          </View>

          <Text style={styles.name}>ismail fake</Text>
          <Text style={styles.city}>
            <Ionicons
              name="location-outline"
              size={14}
              color="rgba(255,255,255,0.75)"
            />{" "}
            Larache
          </Text>
        </View>

        {/* Informations personnelles */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#2dd4bf"
            />
            <Text style={styles.cardTitle}>Informations personnelles</Text>
          </View>

          <View style={styles.fieldBox}>
            <Text style={styles.smallTopLabel}>Nom complet</Text>
            <Text style={styles.smallValue}>ismail fake</Text>
          </View>

          <View style={styles.fieldBox}>
            <Text style={styles.smallTopLabel}>Numéro de téléphone</Text>
            <Text style={styles.smallValue}>+212 6XX XX XX XX</Text>
          </View>

          <View style={styles.fieldBox}>
            <Text style={styles.smallTopLabel}>Adresse e-mail</Text>
            <Text style={styles.smallValue}>ismail.fake@oceanmind.app</Text>
          </View>
        </View>

        {/* Préférences */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="options-outline" size={18} color="#2dd4bf" />
            <Text style={styles.cardTitle}>Préférences</Text>
          </View>

          <Pressable onPress={cycleLang} style={styles.prefRow}>
            <View style={styles.fieldLeft}>
              <Ionicons
                name="language-outline"
                size={18}
                color="rgba(255,255,255,0.85)"
              />
              <Text style={styles.fieldLabel}>Langue</Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={styles.fieldValue}>{lang}</Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color="rgba(255,255,255,0.75)"
              />
            </View>
          </Pressable>

          <View style={styles.prefRow}>
            <View style={styles.fieldLeft}>
              <Ionicons
                name="mic-outline"
                size={18}
                color="rgba(255,255,255,0.85)"
              />
              <Text style={styles.fieldLabel}>Mode voix</Text>
            </View>
            <Switch
              value={voiceMode}
              onValueChange={setVoiceMode}
              trackColor={{
                false: "rgba(255,255,255,0.18)",
                true: "rgba(45,212,191,0.65)",
              }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.prefRow}>
            <View style={styles.fieldLeft}>
              <Ionicons
                name="notifications-outline"
                size={18}
                color="rgba(255,255,255,0.85)"
              />
              <Text style={styles.fieldLabel}>Notifications météo</Text>
            </View>
            <Switch
              value={meteoNotif}
              onValueChange={setMeteoNotif}
              trackColor={{
                false: "rgba(255,255,255,0.18)",
                true: "rgba(45,212,191,0.65)",
              }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Sécurité */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color="#2dd4bf"
            />
            <Text style={styles.cardTitle}>Sécurité</Text>
          </View>
          <RowNav
            icon="lock-outline"
            label="Changer le mot de passe"
            onPress={() => alert("Changer mot de passe (UI فقط دابا)")}
          />
        </View>

        {/* Support */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="help-circle-outline" size={18} color="#2dd4bf" />
            <Text style={styles.cardTitle}>Support</Text>
          </View>
          <RowNav
            icon="lifebuoy"
            label="Aide & Support"
            onPress={() => alert("Support (UI فقط دابا)")}
          />
        </View>

        {/* ✅ LOGOUT */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutBtn,
            pressed && { transform: [{ scale: 0.99 }] },
          ]}
        >
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </Pressable>

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

  container: { paddingHorizontal: 18, paddingTop: 10 },

  logo: { width: 150, height: 150, marginBottom: 6 },

  avatar: {
    marginTop: 14,
    width: 74,
    height: 74,
    borderRadius: 24,
    backgroundColor: "rgba(0, 255, 255, 0.18)",
    borderWidth: 2,
    borderColor: "rgba(45,212,191,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },

  name: { marginTop: 12, color: "#fff", fontWeight: "900", fontSize: 18 },
  city: { marginTop: 6, color: "rgba(255,255,255,0.75)", fontWeight: "800" },

  card: {
    marginTop: 14,
    borderRadius: 20,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },

  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: { color: "#fff", fontWeight: "900", fontSize: 14 },

  fieldBox: {
    borderRadius: 14,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    marginTop: 10,
  },
  smallTopLabel: {
    color: "rgba(255,255,255,0.65)",
    fontWeight: "800",
    fontSize: 11,
  },
  smallValue: { marginTop: 6, color: "#fff", fontWeight: "900", fontSize: 12 },

  prefRow: {
    height: 46,
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: "rgba(0,0,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },

  fieldLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  fieldLabel: {
    color: "rgba(255,255,255,0.85)",
    fontWeight: "900",
    fontSize: 12,
  },
  fieldValue: {
    color: "rgba(255,255,255,0.85)",
    fontWeight: "900",
    fontSize: 12,
  },

  navRow: {
    height: 46,
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: "rgba(0,0,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },

  logoutBtn: {
    marginTop: 14,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(239, 68, 68, 0.25)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.35)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  logoutText: { color: "#fff", fontWeight: "900", fontSize: 12 },
});
