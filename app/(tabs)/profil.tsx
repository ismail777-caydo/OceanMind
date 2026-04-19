import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  Switch,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../src/auth/AuthContext";
import { supabase } from "../../src/lib/supabaseClient";

type ProfileType = {
  full_name: string | null;
  phone: string | null;
  city?: string | null;
  avatar_url?: string | null;
  preferred_language?: "Français" | null;
  voice_mode?: boolean | null;
  meteo_notifications?: boolean | null;
};

function formatPhone(phone?: string | null) {
  if (!phone) return "—";
  const cleaned = phone.replace(/\s+/g, "").replace(/^\+/, "");
  if (cleaned.startsWith("212")) return `+${cleaned}`;
  if (cleaned.startsWith("0")) return `+212 ${cleaned.slice(1)}`;
  return `+212 ${cleaned}`;
}

function getInitials(name?: string | null) {
  if (!name) return "U";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function SectionTitle({
  icon,
  title,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
}) {
  return (
    <View style={styles.cardTitleRow}>
      <Ionicons name={icon} size={18} color="#2dd4bf" />
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.fieldBox}>
      <Text style={styles.smallTopLabel}>{label}</Text>
      <Text style={styles.smallValue}>{value}</Text>
    </View>
  );
}

function StatBox({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.statBox}>
      <Ionicons name={icon} size={18} color="#2dd4bf" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function RowNav({
  icon,
  label,
  onPress,
  danger = false,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.navRow}>
      <View style={styles.fieldLeft}>
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color={danger ? "#fca5a5" : "rgba(255,255,255,0.85)"}
        />
        <Text style={[styles.fieldLabel, danger && { color: "#fecaca" }]}>
          {label}
        </Text>
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
  const { logout, user, ready, logged } = useAuth();

  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lang] = useState<"Français">("Français");
  const [voiceMode, setVoiceMode] = useState(true);
  const [meteoNotif, setMeteoNotif] = useState(true);
  const [productCount, setProductCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);

  const fetchProfile = useCallback(async () => {
    if (!ready) return;

    if (!logged || !user?.id) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [
        { data: profileData, error: profileError },
        { count: productsCount },
        { count: favCount },
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select(
            "full_name, phone, city, avatar_url, preferred_language, voice_mode, meteo_notifications"
          )
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("favorite_products")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);

      if (profileError) {
        console.log("profiles fetch error:", profileError.message);
        setProfile(null);
      } else {
        setProfile(profileData || null);
        setVoiceMode(profileData?.voice_mode ?? true);
        setMeteoNotif(profileData?.meteo_notifications ?? true);

        // Forcer la langue en français
        await savePreference({ preferred_language: "Français" });
      }

      setProductCount(productsCount || 0);
      setFavoriteCount(favCount || 0);
    } catch (e: any) {
      console.log("fetchProfile error:", e);
      Alert.alert("Erreur", e?.message || "Impossible de charger le profil.");
    } finally {
      setLoading(false);
    }
  }, [ready, logged, user?.id]);

  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  }, [fetchProfile]);

  const savePreference = async (updates: Partial<ProfileType>) => {
    if (!user?.id) return;

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      ...updates,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.log("save preference error:", error.message);
      Alert.alert("Erreur", "Impossible d'enregistrer la préférence.");
    }
  };

  const toggleVoice = async (value: boolean) => {
    setVoiceMode(value);
    await savePreference({ voice_mode: value });
  };

  const toggleMeteo = async (value: boolean) => {
    setMeteoNotif(value);
    await savePreference({ meteo_notifications: value });
  };

  const goHome = () => router.replace("/home");

  const handleLogout = async () => {
    Alert.alert("Déconnexion", "Voulez-vous vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Se déconnecter",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/");
          } catch (e) {
            Alert.alert("Erreur", "Déconnexion impossible.");
          }
        },
      },
    ]);
  };

  const displayName = useMemo(
    () => profile?.full_name?.trim() || "Utilisateur",
    [profile?.full_name]
  );

  const displayEmail = user?.email || "—";
  const displayPhone = formatPhone(profile?.phone);
  const displayCity = profile?.city?.trim() || "Non renseignée";
  const initials = getInitials(displayName);

  if (!ready || loading) {
    return (
      <ImageBackground
        source={require("../../src/assets/background.png")}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <SafeAreaView style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#2dd4bf" />
          <Text style={styles.loaderText}>Chargement du profil...</Text>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  if (!logged || !user) {
    return (
      <ImageBackground
        source={require("../../src/assets/background.png")}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <SafeAreaView style={styles.loaderWrap}>
          <Text style={styles.loaderText}>Vous devez vous connecter.</Text>
          <Pressable style={styles.loginBtn} onPress={() => router.replace("/")}>
            <Text style={styles.loginBtnText}>Aller à la connexion</Text>
          </Pressable>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("../../src/assets/background.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay} pointerEvents="none" />

      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <Pressable onPress={goHome} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={18} color="#fff" />
            <Text style={styles.backText}>Retour</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/edit")}
            style={styles.editBtn}
          >
            <Ionicons name="create-outline" size={16} color="#fff" />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.header}>
            <Image
              source={require("../../src/assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <View style={styles.avatar}>
              {profile?.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </View>

            <Text style={styles.name}>{displayName}</Text>

            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={14}
                color="rgba(255,255,255,0.8)"
              />
              <Text style={styles.city}>{displayCity}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatBox
              icon="cube-outline"
              label="Mes produits"
              value={productCount}
            />
            <StatBox
              icon="heart-outline"
              label="Favoris"
              value={favoriteCount}
            />
          </View>

          <View style={styles.card}>
            <SectionTitle
              icon="information-circle-outline"
              title="Informations personnelles"
            />
            <InfoBox label="Nom complet" value={displayName} />
            <InfoBox label="Numéro de téléphone" value={displayPhone} />
            <InfoBox label="Adresse e-mail" value={displayEmail} />
          </View>

          

          <View style={styles.card}>
            <SectionTitle icon="briefcase-outline" title="Activité" />
            <RowNav
              icon="storefront-outline"
              label="Voir mes produits"
              onPress={() => router.push("/store")}
            />
            <RowNav
              icon="heart-outline"
              label="Voir mes favoris"
              onPress={() => router.push("/store")}
            />
          </View>

          <View style={styles.card}>
            <SectionTitle icon="shield-checkmark-outline" title="Sécurité" />
            <RowNav
              icon="lock-outline"
              label="Changer le mot de passe"
              onPress={() =>
                Alert.alert(
                  "Bientôt disponible",
                  "La fonctionnalité de changement du mot de passe sera bientôt connectée au backend."
                )
              }
            />
          </View>

          <View style={styles.card}>
            <SectionTitle icon="help-circle-outline" title="Support" />
            <RowNav
              icon="lifebuoy"
              label="Aide et support"
              onPress={() =>
                Alert.alert(
                  "Support",
                  "Ajoutez ici la navigation vers la FAQ, WhatsApp support ou un écran d'aide."
                )
              }
            />
          </View>

          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutBtn,
              pressed && styles.logoutBtnPressed,
            ]}
          >
            <Ionicons name="log-out-outline" size={18} color="#fff" />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </Pressable>

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(7, 20, 40, 0.38)",
  },
  safe: {
    flex: 1,
  },
  loaderWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24,
  },
  loaderText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    textAlign: "center",
  },
  loginBtn: {
    marginTop: 8,
    backgroundColor: "rgba(56, 189, 248, 0.95)",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  loginBtnText: {
    color: "#fff",
    fontWeight: "900",
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  editBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  backText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 6,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 8,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 28,
    backgroundColor: "rgba(0, 255, 255, 0.16)",
    borderWidth: 2,
    borderColor: "rgba(45,212,191,0.68)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#2dd4bf",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 28,
  },
  name: {
    marginTop: 14,
    color: "#fff",
    fontWeight: "900",
    fontSize: 22,
  },
  locationRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  city: {
    color: "rgba(255,255,255,0.80)",
    fontWeight: "700",
    fontSize: 13,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  statBox: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.11)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  statValue: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 22,
    marginTop: 8,
  },
  statLabel: {
    color: "rgba(255,255,255,0.76)",
    fontWeight: "700",
    fontSize: 12,
    marginTop: 4,
  },
  card: {
    marginTop: 16,
    borderRadius: 22,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.11)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 18,
  },
  fieldBox: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: "rgba(0,0,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    marginTop: 10,
  },
  smallTopLabel: {
    color: "rgba(255,255,255,0.65)",
    fontWeight: "700",
    fontSize: 12,
  },
  smallValue: {
    marginTop: 8,
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
  prefRow: {
    minHeight: 58,
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: "rgba(0,0,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  navRow: {
    minHeight: 58,
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: "rgba(0,0,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  fieldLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 1,
  },
  fieldLabel: {
    color: "rgba(255,255,255,0.90)",
    fontWeight: "800",
    fontSize: 14,
  },
  fieldValue: {
    color: "rgba(255,255,255,0.90)",
    fontWeight: "800",
    fontSize: 14,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoutBtn: {
    marginTop: 18,
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: "rgba(239, 68, 68, 0.22)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.34)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  logoutBtnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  logoutText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 15,
  },
});