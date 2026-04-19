import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/auth/AuthContext";
import { supabase } from "../../src/lib/supabaseClient";
import * as ImagePicker from "expo-image-picker";

type ProfileForm = {
  full_name: string;
  phone: string;
  city: string;
  avatar_url: string;
};

function getInitials(name?: string) {
  if (!name?.trim()) return "U";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("212")) return digits;
  if (digits.startsWith("0")) return `212${digits.slice(1)}`;
  return `212${digits}`;
}

function prettyPhone(input: string) {
  const digits = normalizePhone(input);
  if (!digits) return "—";
  return `+${digits}`;
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "sentences",
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldTopLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.38)"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={styles.input}
      />
    </View>
  );
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, ready, logged } = useAuth();

  const [form, setForm] = useState<ProfileForm>({
    full_name: "",
    phone: "",
    city: "",
    avatar_url: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!ready) return;

    if (!logged || !user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, city, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.log("edit profile fetch error:", error.message);
        Alert.alert("Erreur", "Impossible de charger le profil.");
        return;
      }

      setForm({
        full_name: data?.full_name || "",
        phone: data?.phone || "",
        city: data?.city || "",
        avatar_url: data?.avatar_url || "",
      });
    } catch (e: any) {
      console.log("edit profile fetch global error:", e);
      Alert.alert("Erreur", e?.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }, [ready, logged, user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!ready) return;
    if (!logged || !user) {
      router.replace("/");
    }
  }, [ready, logged, user, router]);

  const setField = (key: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const pickAndUploadAvatar = async () => {
    if (!user?.id) {
      Alert.alert("Erreur", "Utilisateur non connecté.");
      return;
    }

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission refusée",
          "Autorise l'accès à la galerie pour choisir une photo."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"] as any,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const imageUri = asset.uri;

      setUploadingImage(true);

      const response = await fetch(imageUri);
      const blob = await response.blob();

      const extension =
        asset.fileName?.split(".").pop()?.toLowerCase() ||
        imageUri.split(".").pop()?.toLowerCase() ||
        "jpg";

      const filePath = `${user.id}/avatar-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, blob, {
          contentType: asset.mimeType || `image/${extension}`,
          upsert: true,
        });

      if (uploadError) {
        console.log("upload avatar error:", uploadError.message);
        Alert.alert("Erreur", "Impossible de téléverser la photo.");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      setForm((prev) => ({
        ...prev,
        avatar_url: publicUrl,
      }));

      Alert.alert("Succès", "Photo de profil mise à jour.");
    } catch (e: any) {
      console.log("pickAndUploadAvatar error:", e);
      Alert.alert("Erreur", e?.message || "Une erreur est survenue.");
    } finally {
      setUploadingImage(false);
    }
  };

  const initials = useMemo(() => getInitials(form.full_name), [form.full_name]);

  const validate = () => {
    if (!form.full_name.trim()) {
      Alert.alert("Champ requis", "Le nom complet est obligatoire.");
      return false;
    }

    const normalizedPhone = normalizePhone(form.phone);
    if (form.phone.trim() && normalizedPhone.length < 12) {
      Alert.alert("Téléphone invalide", "Entrez un numéro marocain valide.");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!user?.id) {
      Alert.alert("Erreur", "Utilisateur non connecté.");
      router.replace("/");
      return;
    }

    if (!validate()) return;

    try {
      setSaving(true);

      const payload = {
        id: user.id,
        full_name: form.full_name.trim(),
        phone: normalizePhone(form.phone),
        city: form.city.trim(),
        avatar_url: form.avatar_url.trim(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(payload);

      if (error) {
        console.log("edit profile save error:", error.message);
        Alert.alert("Erreur", "Impossible d'enregistrer les modifications.");
        return;
      }

      Alert.alert("Succès", "Profil mis à jour avec succès.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (e: any) {
      console.log("edit profile save global error:", e);
      Alert.alert("Erreur", e?.message || "Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  };

  if (!ready || loading) {
    return (
      <ImageBackground
        source={require("../../src/assets/background.png")}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <SafeAreaView style={styles.centered}>
          <ActivityIndicator size="large" color="#2dd4bf" />
          <Text style={styles.loadingText}>Chargement...</Text>
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
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={18} color="#fff" />
            <Text style={styles.backText}>Retour</Text>
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
        >
          <View style={styles.header}>
            <Image
              source={require("../../src/assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.screenTitle}>Modifier le profil</Text>
            <Text style={styles.screenSubtitle}>
              Mettez à jour vos informations personnelles
            </Text>

            <Pressable onPress={pickAndUploadAvatar} style={styles.avatar}>
              {form.avatar_url.trim() ? (
                <Image
                  source={{ uri: form.avatar_url.trim() }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}

              <View style={styles.cameraBadge}>
                {uploadingImage ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="camera-outline" size={16} color="#fff" />
                )}
              </View>
            </Pressable>

            <Text style={styles.previewName}>
              {form.full_name.trim() || "Utilisateur"}
            </Text>
            <Text style={styles.previewMeta}>
              {form.city.trim() || "Ville non renseignée"}
            </Text>
            <Text style={styles.previewMeta}>{prettyPhone(form.phone)}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="create-outline" size={18} color="#2dd4bf" />
              <Text style={styles.cardTitle}>Informations du profil</Text>
            </View>

            <FormField
              label="Nom complet"
              value={form.full_name}
              onChangeText={(v) => setField("full_name", v)}
              placeholder="Entrez votre nom complet"
              autoCapitalize="words"
            />

            <FormField
              label="Numéro de téléphone"
              value={form.phone}
              onChangeText={(v) => setField("phone", v)}
              placeholder="Ex: 0654312589"
              keyboardType="phone-pad"
              autoCapitalize="none"
            />

            <FormField
              label="Ville"
              value={form.city}
              onChangeText={(v) => setField("city", v)}
              placeholder="Ex: Larache"
              autoCapitalize="words"
            />
          </View>

          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={({ pressed }) => [
              styles.saveBtn,
              (pressed || saving) && {
                opacity: 0.9,
                transform: [{ scale: 0.99 }],
              },
            ]}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="save-outline" size={18} color="#fff" />
                <Text style={styles.saveText}>
                  Enregistrer les modifications
                </Text>
              </>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.cancelBtn,
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text style={styles.cancelText}>Annuler</Text>
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
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
    marginTop: 12,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 6,
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
  backText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 8,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  screenTitle: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 24,
  },
  screenSubtitle: {
    marginTop: 6,
    color: "rgba(255,255,255,0.72)",
    fontWeight: "600",
    fontSize: 13,
    textAlign: "center",
  },
  avatar: {
    marginTop: 18,
    width: 92,
    height: 92,
    borderRadius: 30,
    backgroundColor: "rgba(0, 255, 255, 0.16)",
    borderWidth: 2,
    borderColor: "rgba(45,212,191,0.68)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 30,
  },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(45,212,191,0.95)",
    borderWidth: 2,
    borderColor: "rgba(7, 20, 40, 0.85)",
  },
  previewName: {
    marginTop: 14,
    color: "#fff",
    fontWeight: "900",
    fontSize: 20,
  },
  previewMeta: {
    marginTop: 8,
    color: "rgba(255,255,255,0.80)",
    fontWeight: "700",
    fontSize: 13,
  },
  card: {
    marginTop: 18,
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
  fieldWrap: {
    marginTop: 10,
  },
  fieldTopLabel: {
    marginBottom: 8,
    color: "rgba(255,255,255,0.72)",
    fontWeight: "700",
    fontSize: 12,
  },
  input: {
    minHeight: 54,
    borderRadius: 16,
    paddingHorizontal: 14,
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    backgroundColor: "rgba(0,0,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  saveBtn: {
    marginTop: 20,
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: "rgba(45,212,191,0.30)",
    borderWidth: 1,
    borderColor: "rgba(45,212,191,0.42)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  saveText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 15,
  },
  cancelBtn: {
    marginTop: 12,
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },
});