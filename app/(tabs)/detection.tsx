import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

type Step = "select" | "loading" | "result";

export default function Detection() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("select");
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // ✅ زر رجوع ذكي
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home");
    }
  };

  const pickImage = async (fromCamera: boolean) => {
    try {
      let result;

      if (fromCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert("Permission", "خصنا permission ديال الكاميرا.");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          quality: 0.8,
          allowsEditing: true,
        });
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          Alert.alert("Permission", "خصنا permission ديال الصور.");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
          allowsEditing: true,
        });
      }

      if (!result.canceled) {
        setPhotoUri(result.assets[0].uri);
        setStep("loading");
        setTimeout(() => setStep("result"), 2500);
      }
    } catch (e) {
      Alert.alert("Erreur", "وقع شي مشكل فاختيار الصورة.");
    }
  };

  return (
    <ImageBackground
      source={require("../../src/assets/background.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      {/* TOP BAR */}
      <View style={styles.topBar}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={18} color="#fff" />
          <Text style={styles.backText}>Retour</Text>
        </Pressable>
      </View>

      {/* SELECT */}
      {step === "select" && (
        <View style={styles.center}>
          <Image
            source={require("../../src/assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Détection des Poissons IA</Text>

          <Text style={styles.desc}>
            Analyse photo du poisson pour déterminer l'espèce, la taille et la
            légalité de la pêche.
          </Text>

          <View style={styles.card}>
            <Pressable style={styles.btnBlue} onPress={() => pickImage(true)}>
              <Ionicons name="camera-outline" size={18} color="#fff" />
              <Text style={styles.btnText}>Prendre une photo</Text>
            </Pressable>

            <Pressable style={styles.btnGreen} onPress={() => pickImage(false)}>
              <Ionicons name="images-outline" size={18} color="#fff" />
              <Text style={styles.btnText}>Importer une photo</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* LOADING */}
      {step === "loading" && (
        <View style={styles.center}>
          <Image
            source={require("../../src/assets/logo.png")}
            style={styles.logoSmall}
            resizeMode="contain"
          />

          <Text style={styles.title}>Analyse en cours...</Text>

          <ActivityIndicator
            size="large"
            color="#2dd4bf"
            style={{ marginVertical: 20 }}
          />

          <Text style={styles.tip}>
            Veuillez patienter pendant que l'intelligence artificielle analyse
            le poisson.
          </Text>
        </View>
      )}

      {/* RESULT */}
      {step === "result" && (
        <View style={styles.resultWrap}>
          <Text style={styles.resultHeader}>Résultat de l'analyse</Text>

          <Image
            source={
              photoUri ? { uri: photoUri } : require("../../src/assets/logo.png")
            }
            style={styles.resultImage}
            resizeMode="cover"
          />

          <Text style={styles.fishName}>Sardine commune</Text>

          <View style={styles.row}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Taille estimée</Text>
              <Text style={styles.infoValue}>32 cm</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Poids estimé</Text>
              <Text style={styles.infoValue}>280 g</Text>
            </View>
          </View>

          <View style={styles.legalBox}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.legalText}>LÉGAL</Text>
          </View>

          <Text style={styles.ruleText}>
            Taille minimale respectée selon la réglementation locale (20 cm).
          </Text>

          <Pressable
            style={styles.btnGreen}
            onPress={() =>
              router.push(
                "/add-capture?from=detection&species=Sardine&weightKg=0.28&zone=Larache"
              )
            }
          >
            <Text style={styles.btnText}>Ajouter au journal</Text>
          </Pressable>

          <Pressable
            style={styles.btnGray}
            onPress={() => {
              setPhotoUri(null);
              setStep("select");
            }}
          >
            <Text style={styles.btnText}>Nouvelle analyse</Text>
          </Pressable>
        </View>
      )}
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
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  backText: { color: "#fff", fontWeight: "800", fontSize: 12 },

  center: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 18,
    alignItems: "center",
  },

  logo: { width: 170, height: 170, marginBottom: 6 },
  logoSmall: { width: 160, height: 160, marginBottom: 6 },

  title: { color: "#fff", fontSize: 20, fontWeight: "900", textAlign: "center" },

  desc: {
    marginTop: 10,
    color: "rgba(255,255,255,0.82)",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
    maxWidth: 330,
  },

  card: {
    marginTop: 18,
    width: "100%",
    borderRadius: 20,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    gap: 12,
  },

  btnBlue: {
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(59,130,246,0.85)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  btnGreen: {
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(16,185,129,0.85)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  btnGray: {
    marginTop: 10,
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(148,163,184,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { color: "#fff", fontWeight: "900", fontSize: 13 },

  tip: {
    marginTop: 12,
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },

  resultWrap: { flex: 1, paddingHorizontal: 18, paddingTop: 14 },
  resultHeader: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 12,
  },
  resultImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  fishName: {
    marginTop: 12,
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },

  row: { flexDirection: "row", gap: 12, marginTop: 12 },
  infoBox: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  infoLabel: {
    color: "rgba(255,255,255,0.75)",
    fontWeight: "800",
    fontSize: 11,
  },
  infoValue: { marginTop: 6, color: "#fff", fontWeight: "900", fontSize: 13 },

  legalBox: {
    marginTop: 12,
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(34,197,94,0.85)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  legalText: { color: "#fff", fontWeight: "900" },

  ruleText: {
    marginTop: 10,
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 16,
  },
});
