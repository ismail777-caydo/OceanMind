import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  ImageBackground,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
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

export default function EditProduct() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const productId = String(params.id || "");

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
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/store");
  };

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (error) {
      console.log("fetch product error:", error);
      Alert.alert("Erreur", error.message);
      return;
    }

    if (data) {
      setTitle(data.title || "");
      setDescription(data.description || "");
      setPrice(String(data.price ?? ""));
      setCondition((data.condition as "new" | "used") || "used");
      setCategory(data.category || "");
      setCity(data.city || "");
      setPhone(data.phone || "");
      setWhatsapp(data.whatsapp || "");
      setSellerName(data.seller_name || "");
      setImageUrl(data.image_url || "");
    }
  };

  const handleUpdate = async () => {
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

      const { error } = await supabase
        .from("products")
        .update({
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
          image_url: imageUrl || null,
        })
        .eq("id", productId);

      if (error) {
        console.log("update error:", error);
        Alert.alert("Erreur", error.message);
        return;
      }

      Alert.alert("Succès", "Produit modifié avec succès !");
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

        <Text style={styles.title}>Modifier le produit</Text>
        <Text style={styles.subtitle}>
          Mets à jour ton annonce pour la garder claire et utile.
        </Text>

        <View style={styles.card}>
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
              style={[
                styles.choiceBtn,
                condition === "new" && styles.choiceActive,
              ]}
              onPress={() => setCondition("new")}
            >
              <Text style={styles.choiceText}>New</Text>
            </Pressable>

            <Pressable
              style={[
                styles.choiceBtn,
                condition === "used" && styles.choiceActive,
              ]}
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Image URL (optionnel)</Text>
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
            onPress={handleUpdate}
            disabled={loading}
          >
            <MaterialCommunityIcons
              name="content-save-outline"
              size={18}
              color="#fff"
            />
            <Text style={styles.saveText}>
              {loading ? "Modification..." : "Enregistrer les modifications"}
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

  topBar: {
    paddingTop: 52,
    paddingHorizontal: 16,
  },

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

  backText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
  },

  container: {
    paddingHorizontal: 18,
    paddingTop: 12,
  },

  logo: {
    width: 150,
    height: 150,
    alignSelf: "center",
  },

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

  inputGroup: {
    marginBottom: 12,
  },

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

  textarea: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },

  choiceBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.10)",
    padding: 12,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  choiceActive: {
    backgroundColor: "rgba(34,197,94,0.88)",
  },

  choiceText: {
    color: "#fff",
    fontWeight: "900",
  },

  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  categoryOption: {
    backgroundColor: "rgba(255,255,255,0.10)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  categoryOptionActive: {
    backgroundColor: "rgba(56, 189, 248, 0.95)",
  },

  categoryOptionText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
  },

  saveBtn: {
    backgroundColor: "#f59e0b",
    padding: 14,
    borderRadius: 16,
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  saveText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 16,
  },
});