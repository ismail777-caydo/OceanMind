import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  Image,
  ImageBackground,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../../src/lib/supabaseClient";

const PRODUCT_CATEGORIES = [
  "Filets",
  "Hameçons",
  "Appâts",
  "Sécurité",
  "Occasion",
  "Autres",
];

const MAX_IMAGES = 6;

export default function AddProduct() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState<"new" | "used">("used");
  const [category, setCategory] = useState("Filets");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/store");
  };

  useEffect(() => {
    loadProfileDefaults();
  }, []);

  const loadProfileDefaults = async () => {
    try {
      setProfileLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name, phone, city")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.log("profile load error:", error);
        return;
      }

      if (profile) {
        setSellerName(profile.full_name || "");
        setPhone(profile.phone || "");
        setWhatsapp(profile.phone || "");
        setCity(profile.city || "");
      }
    } catch (e) {
      console.log("loadProfileDefaults error:", e);
    } finally {
      setProfileLoading(false);
    }
  };

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission refusée", "Autorise l'accès aux photos.");
      return;
    }

    const remaining = MAX_IMAGES - selectedImages.length;
    if (remaining <= 0) {
      Alert.alert("Limite atteinte", "Tu peux ajouter jusqu'à 6 images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"] as any,
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri);
      const merged = [...selectedImages, ...uris].slice(0, MAX_IMAGES);
      setSelectedImages(merged);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImageToSupabase = async (uri: string, userId: string) => {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const fileExt = uri.split(".").pop()?.toLowerCase() || "jpg";
    const safeExt = fileExt === "jpg" ? "jpeg" : fileExt;
    const fileName = `${userId}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, decode(base64), {
        contentType: `image/${safeExt}`,
        upsert: true,
      });

    if (uploadError) {
      console.log("upload error:", uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleAddProduct = async () => {
    if (
      !title ||
      !description ||
      !price ||
      !category ||
      !city ||
      !phone ||
      !whatsapp ||
      !sellerName
    ) {
      Alert.alert("Erreur", "Merci de remplir tous les champs obligatoires.");
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("Erreur", "Utilisateur non connecté.");
        return;
      }

      let uploadedUrls: string[] = [];

      if (selectedImages.length > 0) {
        uploadedUrls = await Promise.all(
          selectedImages.map((uri) => uploadImageToSupabase(uri, user.id))
        );
      } else if (imageUrl.trim()) {
        uploadedUrls = [imageUrl.trim()];
      }

      const coverImage = uploadedUrls[0] || null;

      const { data: insertedProduct, error: insertError } = await supabase
        .from("products")
        .insert({
          user_id: user.id,
          title,
          description,
          price: Number(price),
          condition,
          category,
          city,
          phone,
          whatsapp,
          has_whatsapp: true,
          seller_name: sellerName,
          image_url: coverImage,
        })
        .select("id")
        .single();

      if (insertError || !insertedProduct) {
        console.log("insert error:", insertError);
        Alert.alert("Erreur", insertError?.message || "Insertion impossible.");
        return;
      }

      if (uploadedUrls.length > 0) {
        const imagesPayload = uploadedUrls.map((url, index) => ({
          product_id: insertedProduct.id,
          image_url: url,
          position: index,
        }));

        const { error: imagesError } = await supabase
          .from("product_images")
          .insert(imagesPayload);

        if (imagesError) {
          console.log("product_images error:", imagesError);
          Alert.alert(
            "Attention",
            "Produit ajouté, mais les images secondaires n'ont pas été enregistrées."
          );
        }
      }

      Alert.alert("Succès", "Produit ajouté avec succès !");
      router.replace("/(tabs)/store");
    } catch (e: any) {
      console.log("global error:", e);
      Alert.alert("Erreur", e?.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
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

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require("../../src/assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Ajouter un produit</Text>
        <Text style={styles.subtitle}>
          Publie ton matériel de pêche ou une annonce utile pour la communauté.
        </Text>

        <View style={styles.card}>
          {profileLoading ? (
            <View style={styles.infoBanner}>
              <Ionicons name="person-circle-outline" size={18} color="#fff" />
              <Text style={styles.infoBannerText}>
                Chargement des informations du profil...
              </Text>
            </View>
          ) : (
            <View style={styles.infoBannerSuccess}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
              <Text style={styles.infoBannerText}>
                Les infos vendeur ont été pré-remplies depuis ton profil.
              </Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Titre</Text>
            <TextInput
              style={styles.input}
              placeholder="Titre du produit"
              placeholderTextColor="#94a3b8"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Description"
              placeholderTextColor="#94a3b8"
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prix</Text>
            <TextInput
              style={styles.input}
              placeholder="Prix"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>

          <Text style={styles.label}>Condition</Text>
          <View style={styles.row}>
            <Pressable
              style={[styles.choiceBtn, condition === "new" && styles.choiceActive]}
              onPress={() => setCondition("new")}
            >
              <Text style={styles.choiceText}>New</Text>
            </Pressable>

            <Pressable
              style={[styles.choiceBtn, condition === "used" && styles.choiceActive]}
              onPress={() => setCondition("used")}
            >
              <Text style={styles.choiceText}>Used</Text>
            </Pressable>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Catégorie</Text>
            <View style={styles.categoryGrid}>
              {PRODUCT_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  style={[
                    styles.categoryOption,
                    category === cat && styles.categoryOptionActive,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={styles.categoryOptionText}>{cat}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ville</Text>
            <TextInput
              style={styles.input}
              placeholder="Ville"
              placeholderTextColor="#94a3b8"
              value={city}
              onChangeText={setCity}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Téléphone</Text>
            <TextInput
              style={styles.input}
              placeholder="Téléphone"
              placeholderTextColor="#94a3b8"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>WhatsApp</Text>
            <TextInput
              style={styles.input}
              placeholder="WhatsApp"
              placeholderTextColor="#94a3b8"
              value={whatsapp}
              onChangeText={setWhatsapp}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom du vendeur</Text>
            <TextInput
              style={styles.input}
              placeholder="Nom du vendeur"
              placeholderTextColor="#94a3b8"
              value={sellerName}
              onChangeText={setSellerName}
            />
          </View>

          <Pressable style={styles.imagePickBtn} onPress={pickImages}>
            <MaterialCommunityIcons name="image-multiple" size={18} color="#fff" />
            <Text style={styles.imagePickText}>
              {selectedImages.length > 0
                ? `Ajouter / changer les images (${selectedImages.length}/${MAX_IMAGES})`
                : "Choisir de 1 à 6 images"}
            </Text>
          </Pressable>

          {selectedImages.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.previewRow}
            >
              {selectedImages.map((uri, index) => (
                <View key={`${uri}-${index}`} style={styles.previewWrap}>
                  <Image source={{ uri }} style={styles.previewImage} />
                  <Pressable
                    style={styles.removeBtn}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close" size={14} color="#fff" />
                  </Pressable>
                  {index === 0 && (
                    <View style={styles.coverBadge}>
                      <Text style={styles.coverBadgeText}>Cover</Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Image URL (optionnel si aucune image locale)</Text>
            <TextInput
              style={styles.input}
              placeholder="https://..."
              placeholderTextColor="#94a3b8"
              value={imageUrl}
              onChangeText={setImageUrl}
            />
          </View>

          <Pressable
            style={[styles.saveBtn, loading && { opacity: 0.7 }]}
            onPress={handleAddProduct}
            disabled={loading}
          >
            <Text style={styles.saveText}>
              {loading ? "Ajout..." : "Ajouter le produit"}
            </Text>
          </Pressable>
        </View>

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
  container: { paddingHorizontal: 18, paddingTop: 12 },
  logo: { width: 150, height: 150, alignSelf: "center" },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 10,
  },
  subtitle: {
    color: "rgba(255,255,255,0.78)",
    textAlign: "center",
    fontWeight: "700",
    marginTop: 8,
    lineHeight: 20,
    marginBottom: 14,
  },
  card: {
    marginTop: 8,
    borderRadius: 22,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  infoBanner: {
    marginBottom: 12,
    borderRadius: 14,
    padding: 12,
    backgroundColor: "rgba(59,130,246,0.35)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoBannerSuccess: {
    marginBottom: 12,
    borderRadius: 14,
    padding: 12,
    backgroundColor: "rgba(34,197,94,0.35)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoBannerText: { color: "#fff", fontWeight: "800", flex: 1 },
  inputGroup: { marginBottom: 12 },
  label: {
    color: "#fff",
    fontWeight: "800",
    marginBottom: 8,
    fontSize: 13,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#0f172a",
    fontWeight: "700",
  },
  textarea: { minHeight: 100, textAlignVertical: "top" },
  row: { flexDirection: "row", gap: 10, marginBottom: 14 },
  choiceBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.10)",
    padding: 12,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  choiceActive: { backgroundColor: "rgba(34,197,94,0.88)" },
  choiceText: { color: "#fff", fontWeight: "900" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryOption: {
    backgroundColor: "rgba(255,255,255,0.10)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  categoryOptionActive: { backgroundColor: "rgba(56, 189, 248, 0.95)" },
  categoryOptionText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  imagePickBtn: {
    backgroundColor: "rgba(56, 189, 248, 0.95)",
    padding: 13,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  imagePickText: { color: "#fff", textAlign: "center", fontWeight: "900" },
  previewRow: { paddingBottom: 8, gap: 10 },
  previewWrap: { position: "relative", marginRight: 10 },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
  },
  removeBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: "rgba(239,68,68,0.95)",
    alignItems: "center",
    justifyContent: "center",
  },
  coverBadge: {
    position: "absolute",
    left: 6,
    bottom: 6,
    backgroundColor: "rgba(34,197,94,0.95)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  coverBadgeText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 10,
  },
  saveBtn: {
    backgroundColor: "#22c55e",
    padding: 14,
    borderRadius: 16,
    marginTop: 6,
  },
  saveText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 16,
  },
});