// app/(tabs)/detection.tsx
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

// ✅ AI service
import { detectFish, DetectResult } from "../../src/services/ai";

type Step = "select" | "loading" | "result";

export default function Detection() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("select");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [result, setResult] = useState<DetectResult | null>(null);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/home");
  };

  const pickImage = async (fromCamera: boolean) => {
    try {
      let pickRes: ImagePicker.ImagePickerResult;

      if (fromCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert("Permission", "خصنا permission ديال الكاميرا.");
          return;
        }
        pickRes = await ImagePicker.launchCameraAsync({
          quality: 0.8,
          allowsEditing: true,
        });
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          Alert.alert("Permission", "خصنا permission ديال الصور.");
          return;
        }
        pickRes = await ImagePicker.launchImageLibraryAsync({
          // ✅ خليها هكا دابا (راه warning غير ديال deprecation)
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
          allowsEditing: true,
        });
      }

      if (!pickRes.canceled) {
        const uri = pickRes.assets[0].uri;
        setPhotoUri(uri);
        setStep("loading");

        try {
          const data = await detectFish(uri);
          console.log("AI RESULT =>", data); // ✅ باش تشوف keys ديال confidence
          setResult(data);
          setStep("result");
        } catch (e) {
          Alert.alert("Erreur", "وقع مشكل فـ AI، جرّب مرة أخرى.");
          setStep("select");
        }
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

      <View style={styles.topBar}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={18} color="#fff" />
          <Text style={styles.backText}>Retour</Text>
        </Pressable>
      </View>

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
            légalité.
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
            Veuillez patienter pendant que l'IA analyse le poisson.
          </Text>
        </View>
      )}

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

          <Text style={styles.fishName}>{result?.common_name ?? result?.species ?? "—"}</Text>

          <View style={styles.row}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Taille estimée</Text>
              <Text style={styles.infoValue}>
                {result?.sizeCm != null ? `${result.sizeCm} cm` : "—"}
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Poids estimé</Text>
              <Text style={styles.infoValue}>
                {result?.weightG != null ? `${result.weightG} g` : "—"}
              </Text>
            </View>
          </View>

          {/* ✅ FIX: legal badge true/false/null => LÉGAL/ILLÉGAL/À vérifier */}
          {(() => {
            const legal = result?.legal;

            let label = "À vérifier";
            let bgColor = "rgba(217,164,0,0.85)"; // أصفر

            if (legal === true) {
              label = "LÉGAL";
              bgColor = "rgba(34,197,94,0.85)"; // أخضر
            } else if (legal === false) {
              label = "ILLÉGAL";
              bgColor = "rgba(239,68,68,0.85)"; // أحمر
            }

            return (
              <View style={[styles.legalBox, { backgroundColor: bgColor }]}>
                <Ionicons
                  name={
                    legal === true
                      ? "checkmark-circle"
                      : legal === false
                      ? "close-circle"
                      : "alert-circle"
                  }
                  size={20}
                  color="#fff"
                />
                <Text style={styles.legalText}>{label}</Text>
              </View>
            );
          })()}

          <Text style={styles.ruleText}>{result?.rule ?? ""}</Text>

          {/* ✅ PASS DATA TO add-capture SAFELY */}
          <Pressable
            style={styles.btnGreen}
            onPress={() => {
              if (!result) return;

              const weightKg =
                result.weightG != null
                  ? (result.weightG / 1000).toFixed(2)
                  : "0";

              const conf =
                (result as any).confidence ??
                (result as any).ai_confidence ??
                (result as any).score ??
                "";

              const aiLegalParam =
                result.legal === true
                  ? "true"
                  : result.legal === false
                  ? "false"
                  : "";

              const q =
                `from=detection` +
                `&species=${encodeURIComponent(result.common_name ?? result.species ?? "")}` +
                `&weightKg=${encodeURIComponent(weightKg)}` +
                `&sizeCm=${encodeURIComponent(String(result.sizeCm ?? ""))}` +
                `&zone=${encodeURIComponent("Larache, Zone Nord")}` +
                // ✅ FIX: ما تبقاش !!result.legal (كتحوّل null => false)
                `&aiLegal=${encodeURIComponent(aiLegalParam)}` +
                `&aiRule=${encodeURIComponent(result.rule ?? "")}` +
                `&aiConfidence=${encodeURIComponent(String(conf))}` +
                `&photoUri=${encodeURIComponent(photoUri ?? "")}`;

              router.push(`/(tabs)/add-capture?${q}`);
            }}
          >
            <Text style={styles.btnText}>Ajouter au journal</Text>
          </Pressable>

          <Pressable
            style={styles.btnGray}
            onPress={() => {
              setPhotoUri(null);
              setResult(null);
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

export const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 25, 45, 0.35)",
  },

  topBar: { paddingTop: 52, paddingHorizontal: 16 },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    width: "auto",
    maxWidth: "80%",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 800,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    flexGrow: 0,
    flexShrink: 0,
    gap: 6,
  },
  backText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
    includeFontPadding: false,
  },

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
  infoLabel: { color: "rgba(255,255,255,0.75)", fontWeight: "800", fontSize: 11 },
  infoValue: { marginTop: 6, color: "#fff", fontWeight: "900", fontSize: 13 },

  legalBox: {
    marginTop: 12,
    height: 46,
    borderRadius: 14,
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