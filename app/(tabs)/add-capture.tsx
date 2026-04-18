import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../src/auth/AuthContext";
import { createCapture, uploadCapturePhoto } from "../../src/services/captures";

const SPECIES = ["Sardine", "Maquereau", "Dorade", "Anchois", "Thon"];

function formatDate(date: Date) {
  return date.toLocaleDateString("fr-FR");
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AddCapture() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();

  const aiLegalParam = params.aiLegal as string | undefined;
  const aiRuleParam = params.aiRule as string | undefined;
  const aiConfidenceParam = params.aiConfidence as string | undefined;
  const paramSizeCm = params.sizeCm as string | undefined;
  const paramPhotoUri = params.photoUri as string | undefined;

  const [species, setSpecies] = useState((params.species as string) ?? "");
  const [showSpeciesList, setShowSpeciesList] = useState(false);
  const [qty, setQty] = useState((params.weightKg as string) ?? "");
  const [sizeCm, setSizeCm] = useState(paramSizeCm ?? "");
  const [zone] = useState((params.zone as string) ?? "Zone non précisée");
  const [captureDate] = useState(new Date());
  const [photoUri, setPhotoUri] = useState<string | null>(
    paramPhotoUri ? String(paramPhotoUri) : null
  );
  const [saving, setSaving] = useState(false);

  const canSave = useMemo(() => {
    return species.trim().length > 0 && qty.trim().length > 0;
  }, [species, qty]);

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!perm.granted) {
      Alert.alert("Permission", "L'accès à la galerie est requis.");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!res.canceled) {
      setPhotoUri(res.assets[0].uri);
    }
  };

  const save = async () => {
    if (saving) return;

    if (!canSave) {
      Alert.alert("Erreur", "Veuillez renseigner l'espèce et la quantité.");
      return;
    }

    if (!user?.id) {
      Alert.alert("Erreur", "Vous devez être connecté.");
      return;
    }

    const weightKg = Number(qty);

    if (Number.isNaN(weightKg) || weightKg <= 0) {
      Alert.alert("Erreur", "Veuillez saisir une quantité valide.");
      return;
    }

    const sizeValue =
      sizeCm.trim() !== "" ? Number(sizeCm.replace(",", ".")) : null;

    if (sizeCm.trim() !== "" && (Number.isNaN(sizeValue) || sizeValue! <= 0)) {
      Alert.alert("Erreur", "Veuillez saisir une taille valide.");
      return;
    }

    const parts = zone.split(",");
    const city = (parts[0] ?? "Ville non précisée").trim();
    const zoneName = (parts[1] ?? zone).trim();
    const capturedAtISO = captureDate.toISOString();

    const ai_legal =
      aiLegalParam != null ? String(aiLegalParam) === "true" : null;

    const ai_rule = aiRuleParam ? String(aiRuleParam) : null;

    const ai_confidence =
      aiConfidenceParam && String(aiConfidenceParam).trim() !== ""
        ? Number(aiConfidenceParam)
        : null;

    try {
      setSaving(true);

      let photo_path: string | null = null;
      let photo_url: string | null = null;

      if (photoUri) {
        const uploaded = await uploadCapturePhoto(user.id, photoUri);
        photo_path = uploaded.filePath;
        photo_url = uploaded.publicUrl;
      }

      await createCapture({
        user_id: user.id,
        species: species.trim(),
        weight_kg: weightKg,
        size_cm: sizeValue,
        city,
        zone: zoneName,
        captured_at: capturedAtISO,
        photo_path,
        photo_url,
        ai_legal,
        ai_rule,
        ai_confidence,
      });

      Alert.alert("Succès", "Entrée enregistrée avec succès.");
      router.replace("/(tabs)/logbook");
    } catch (e: any) {
      Alert.alert(
        "Erreur",
        e?.message || "Impossible d'enregistrer cette entrée."
      );
    } finally {
      setSaving(false);
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
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: "center" }}>
          <Image
            source={require("../../src/assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Ajouter une entrée</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>
            <MaterialCommunityIcons name="fish" size={14} color="#2dd4bf" /> Espèce{" "}
            <Text style={{ color: "#fca5a5" }}>*</Text>
          </Text>

          <Pressable
            style={styles.select}
            onPress={() => setShowSpeciesList((v) => !v)}
          >
            <Text style={styles.selectText}>
              {species ? species : "Sélectionner une espèce"}
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color="rgba(255,255,255,0.85)"
            />
          </Pressable>

          {showSpeciesList ? (
            <View style={styles.dropdown}>
              {SPECIES.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => {
                    setSpecies(s);
                    setShowSpeciesList(false);
                  }}
                  style={styles.dropdownItem}
                >
                  <Text style={styles.dropdownText}>{s}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <Text style={[styles.label, { marginTop: 12 }]}>
            <MaterialCommunityIcons name="scale" size={14} color="#93c5fd" /> Quantité (kg){" "}
            <Text style={{ color: "#fca5a5" }}>*</Text>
          </Text>

          <TextInput
            value={qty}
            onChangeText={(t) => setQty(t.replace(",", "."))}
            placeholder="0.0"
            placeholderTextColor="rgba(255,255,255,0.55)"
            keyboardType="decimal-pad"
            style={styles.input}
          />

          <Text style={[styles.label, { marginTop: 12 }]}>
            <MaterialCommunityIcons name="ruler" size={14} color="#c084fc" /> Taille (cm){" "}
            <Text style={styles.optional}>(optionnel)</Text>
          </Text>

          <TextInput
            value={sizeCm}
            onChangeText={setSizeCm}
            placeholder="0"
            placeholderTextColor="rgba(255,255,255,0.55)"
            keyboardType="numeric"
            style={styles.input}
          />

          <Text style={[styles.label, { marginTop: 12 }]}>
            <Ionicons name="location-outline" size={14} color="#34d399" /> Zone de pêche
          </Text>

          <View style={styles.select}>
            <Text style={styles.selectText}>{zone}</Text>
            <Ionicons name="pin" size={16} color="#2dd4bf" />
          </View>

          <View style={styles.twoCols}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>
                <Ionicons name="calendar-outline" size={14} color="#fbbf24" /> Date
              </Text>
              <View style={styles.select}>
                <Text style={styles.selectText}>{formatDate(captureDate)}</Text>
                <Ionicons name="calendar" size={16} color="rgba(255,255,255,0.85)" />
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>
                <Ionicons name="time-outline" size={14} color="#60a5fa" /> Heure
              </Text>
              <View style={styles.select}>
                <Text style={styles.selectText}>{formatTime(captureDate)}</Text>
                <Ionicons name="time" size={16} color="rgba(255,255,255,0.85)" />
              </View>
            </View>
          </View>

          <Text style={[styles.label, { marginTop: 12 }]}>
            <Ionicons name="image-outline" size={14} color="#fbbf24" /> Photo{" "}
            <Text style={styles.optional}>(optionnel)</Text>
          </Text>

          <Pressable onPress={pickPhoto} style={styles.photoBtn}>
            <Ionicons name="add-circle-outline" size={18} color="#2dd4bf" />
            <Text style={styles.photoText}>Ajouter une photo</Text>
          </Pressable>

          {photoUri ? <Image source={{ uri: photoUri }} style={styles.preview} /> : null}
        </View>

        <Pressable
          onPress={save}
          disabled={!canSave || saving}
          style={({ pressed }) => [
            styles.saveBtn,
            (!canSave || saving) && { opacity: 0.6 },
            pressed && { transform: [{ scale: 0.99 }] },
          ]}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>Enregistrer</Text>
          )}
        </Pressable>

        <View style={{ height: 24 }} />
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
  logo: { width: 140, height: 140, marginBottom: 6 },
  title: { color: "#fff", fontSize: 16, fontWeight: "900", marginTop: 8 },
  card: {
    marginTop: 14,
    borderRadius: 22,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  label: {
    color: "rgba(255,255,255,0.9)",
    fontWeight: "900",
    fontSize: 12,
    marginBottom: 8,
  },
  optional: { color: "rgba(255,255,255,0.6)", fontWeight: "800" },
  input: {
    height: 42,
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    color: "#fff",
    fontWeight: "900",
  },
  select: {
    height: 42,
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: { color: "#fff", fontWeight: "900", fontSize: 12 },
  dropdown: {
    marginTop: 10,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "rgba(20,40,70,0.95)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.10)",
  },
  dropdownText: { color: "#fff", fontWeight: "900" },
  twoCols: { flexDirection: "row", gap: 12, marginTop: 12 },
  photoBtn: {
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  photoText: { color: "#fff", fontWeight: "900", fontSize: 12 },
  preview: { marginTop: 12, width: "100%", height: 170, borderRadius: 14 },
  saveBtn: {
    marginTop: 14,
    height: 50,
    borderRadius: 16,
    backgroundColor: "rgba(45, 212, 191, 0.95)",
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: { color: "#fff", fontWeight: "900", fontSize: 14 },
});