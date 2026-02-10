import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.11.114:8000"; // ✅ بدل IP ديال PC

const SPECIES = ["Sardine", "Maquereau", "Dorade", "Anchois", "Thon"];
const TOKEN_KEY = "OCEANMIND_TOKEN";

export default function AddCapture() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [species, setSpecies] = useState((params.species as string) ?? "");
  const [showSpeciesList, setShowSpeciesList] = useState(false);

  const [qty, setQty] = useState((params.weightKg as string) ?? "");
  const [sizeCm, setSizeCm] = useState("");
  const [zone, setZone] = useState((params.zone as string) ?? "Larache, Zone Nord");

  const [dateStr] = useState("2026-02-09"); // ✅ دابا ثابت (من بعد نزيدو date picker)
  const [timeStr] = useState("11:39 PM");   // ✅ ثابت (من بعد نزيدو time picker)

  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const canSave = useMemo(
    () => species.trim().length > 0 && qty.trim().length > 0,
    [species, qty]
  );

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission", "خصنا permission ديال الصور.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });
    if (!res.canceled) setPhotoUri(res.assets[0].uri);
  };

const save = async () => {
  if (!canSave) {
    Alert.alert("Erreur", "عمر Espèce و Quantité.");
    return;
  }

  const parts = zone.split(",");
  const city = (parts[0] ?? "Larache").trim();
  const zoneName = (parts[1] ?? "Zone Nord").trim();

  const body = {
    city,
    zone: zoneName,
    dateISO: dateStr,
    timeStr: timeStr,
    species: species.trim(),
    weightKg: qty.trim(),
    sizeCm: sizeCm ? sizeCm.trim() : null,
    photoUri: photoUri ?? null,
    legal: true,
  };

  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);

    // ✅ LOGS قبل fetch
    console.log("ADD URL =>", `${BASE_URL}/logbook/add`);
    console.log("ADD BODY =>", body);
    console.log("ADD TOKEN =>", token ? "YES" : "NO");

    const res = await fetch(`${BASE_URL}/logbook/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    let data: any = null;
    try {
      data = await res.json();
    } catch (err) {
      data = { ok: false, message: "Response is not JSON" };
    }

    // ✅ LOGS بعد fetch
    console.log("ADD STATUS =>", res.status);
    console.log("ADD RAW =>", data);

    if (!res.ok || !data?.ok) {
      Alert.alert("Erreur", data?.message || `Save failed (${res.status})`);
      return;
    }

    router.replace("/(tabs)/logbook");
  } catch (e: any) {
    console.log("ADD ERROR =>", e?.message || e);
    Alert.alert("Erreur", "ماقدّرتش نرسل entry للسيرفر.");
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

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: "center" }}>
          <Image source={require("../../src/assets/logo.png")} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Ajouter une entrée</Text>
        </View>

        <View style={styles.card}>
          {/* Espèce */}
          <Text style={styles.label}>
            <MaterialCommunityIcons name="fish" size={14} color="#2dd4bf" /> Espèce{" "}
            <Text style={{ color: "#fca5a5" }}>*</Text>
          </Text>

          <Pressable style={styles.select} onPress={() => setShowSpeciesList((v) => !v)}>
            <Text style={styles.selectText}>{species ? species : "Sélectionner une espèce"}</Text>
            <Ionicons name="chevron-down" size={16} color="rgba(255,255,255,0.85)" />
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

          {/* Quantité */}
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

          {/* Taille */}
          <Text style={[styles.label, { marginTop: 12 }]}>
            <MaterialCommunityIcons name="ruler" size={14} color="#c084fc" /> Taille (cm){" "}
            <Text style={styles.optional}>(optional)</Text>
          </Text>
          <TextInput
            value={sizeCm}
            onChangeText={setSizeCm}
            placeholder="0"
            placeholderTextColor="rgba(255,255,255,0.55)"
            keyboardType="numeric"
            style={styles.input}
          />

          {/* Zone */}
          <Text style={[styles.label, { marginTop: 12 }]}>
            <Ionicons name="location-outline" size={14} color="#34d399" /> Zone de pêche
          </Text>
          <View style={styles.select}>
            <Text style={styles.selectText}>{zone}</Text>
            <Ionicons name="pin" size={16} color="#2dd4bf" />
          </View>

          {/* Date + Heure */}
          <View style={styles.twoCols}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>
                <Ionicons name="calendar-outline" size={14} color="#fbbf24" /> Date
              </Text>
              <View style={styles.select}>
                <Text style={styles.selectText}>{dateStr}</Text>
                <Ionicons name="calendar" size={16} color="rgba(255,255,255,0.85)" />
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>
                <Ionicons name="time-outline" size={14} color="#60a5fa" /> Heure
              </Text>
              <View style={styles.select}>
                <Text style={styles.selectText}>{timeStr}</Text>
                <Ionicons name="time" size={16} color="rgba(255,255,255,0.85)" />
              </View>
            </View>
          </View>

          {/* Photo */}
          <Text style={[styles.label, { marginTop: 12 }]}>
            <Ionicons name="image-outline" size={14} color="#fbbf24" /> Photo{" "}
            <Text style={styles.optional}>(optional)</Text>
          </Text>
          <Pressable onPress={pickPhoto} style={styles.photoBtn}>
            <Ionicons name="add-circle-outline" size={18} color="#2dd4bf" />
            <Text style={styles.photoText}>Ajouter une photo</Text>
          </Pressable>

          {photoUri ? <Image source={{ uri: photoUri }} style={styles.preview} /> : null}
        </View>

        <Pressable
          onPress={save}
          style={({ pressed }) => [
            styles.saveBtn,
            !canSave && { opacity: 0.6 },
            pressed && { transform: [{ scale: 0.99 }] },
          ]}
        >
          <Text style={styles.saveText}>Enregistrer</Text>
        </Pressable>

        <View style={{ height: 24 }} />
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(10, 25, 45, 0.35)" },

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

  label: { color: "rgba(255,255,255,0.9)", fontWeight: "900", fontSize: 12, marginBottom: 8 },
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
