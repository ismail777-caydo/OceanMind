import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
  Image,
  ImageBackground,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../src/lib/supabaseClient";

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string | null;
  whatsapp: string;
  seller_name: string;
  user_id: string;
  category?: string | null;
  city?: string | null;
  phone?: string | null;
  condition?: "new" | "used";
};

type ProductImage = {
  id: string;
  image_url: string;
  position: number;
};

export default function ProductDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const productId = String(params.id || "");

  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/store");
  };

  useEffect(() => {
    if (productId) fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      setCurrentUserId(user?.id ?? null);

      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (productError) {
        Alert.alert("Erreur", productError.message);
        return;
      }

      setProduct(productData);

      const { data: productImages, error: imagesError } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", productId)
        .order("position", { ascending: true });

      if (imagesError) {
        console.log("images fetch error:", imagesError);
      }

      const finalImages = productImages || [];
      setImages(finalImages);

      if (finalImages.length > 0) {
        setActiveImage(finalImages[0].image_url);
      } else {
        setActiveImage(productData.image_url || null);
      }
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    Linking.openURL(`https://wa.me/${cleaned}`);
  };

  const confirmDelete = () => {
    if (!product) return;

    Alert.alert("Supprimer", "Tu veux supprimer ce produit ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: handleDelete,
      },
    ]);
  };

  const handleDelete = async () => {
    if (!product) return;

    const { error } = await supabase.from("products").delete().eq("id", product.id);

    if (error) {
      Alert.alert("Erreur", error.message);
      return;
    }

    Alert.alert("Succès", "Produit supprimé.");
    router.replace("/(tabs)/store");
  };

  const isMine = currentUserId && product?.user_id === currentUserId;

  const galleryImages = useMemo(() => {
    if (images.length > 0) return images.map((img) => img.image_url);
    if (product?.image_url) return [product.image_url];
    return [];
  }, [images, product]);

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

        <Text style={styles.title}>Détails du produit</Text>

        {loading ? (
          <View style={styles.card}>
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : !product ? (
          <View style={styles.card}>
            <Text style={styles.loadingText}>Produit introuvable</Text>
          </View>
        ) : (
          <View style={styles.card}>
            {activeImage ? (
              <Image source={{ uri: activeImage }} style={styles.mainImage} />
            ) : (
              <View style={styles.noImage}>
                <Ionicons name="image-outline" size={30} color="#94a3b8" />
                <Text style={styles.noImageText}>Pas d'image</Text>
              </View>
            )}

            {galleryImages.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbRow}
              >
                {galleryImages.map((uri, index) => {
                  const isActive = activeImage === uri;
                  return (
                    <Pressable
                      key={`${uri}-${index}`}
                      onPress={() => setActiveImage(uri)}
                      style={[
                        styles.thumbWrap,
                        isActive && styles.thumbWrapActive,
                      ]}
                    >
                      <Image source={{ uri }} style={styles.thumbImage} />
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}

            <View style={styles.titleRow}>
              <Text style={styles.productTitle}>{product.title}</Text>
              <Text style={styles.price}>{product.price} DH</Text>
            </View>

            <Text style={styles.description}>{product.description}</Text>

            <View style={styles.metaWrap}>
              {!!product.category && (
                <View style={styles.metaBadge}>
                  <Text style={styles.metaBadgeText}>{product.category}</Text>
                </View>
              )}

              {!!product.city && (
                <View style={styles.metaBadgeAlt}>
                  <Text style={styles.metaBadgeText}>{product.city}</Text>
                </View>
              )}

              {!!product.condition && (
                <View
                  style={[
                    styles.conditionBadge,
                    product.condition === "new"
                      ? styles.conditionNew
                      : styles.conditionUsed,
                  ]}
                >
                  <Text style={styles.metaBadgeText}>
                    {product.condition === "new" ? "New" : "Used"}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>👤 Vendeur: {product.seller_name}</Text>
              {!!product.phone && (
                <Text style={styles.infoText}>📞 Téléphone: {product.phone}</Text>
              )}
              <Text style={styles.infoText}>💬 WhatsApp: {product.whatsapp}</Text>
            </View>

            <Pressable
              style={styles.whatsappBtn}
              onPress={() => openWhatsApp(product.whatsapp)}
            >
              <Ionicons name="logo-whatsapp" size={18} color="#fff" />
              <Text style={styles.whatsappText}>Contacter sur WhatsApp</Text>
            </Pressable>

            {isMine && (
              <View style={styles.ownerActions}>
                <Pressable
                  style={styles.editBtn}
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/edit-product",
                      params: { id: product.id },
                    })
                  }
                >
                  <Text style={styles.editText}>Modifier</Text>
                </Pressable>

                <Pressable style={styles.deleteBtn} onPress={confirmDelete}>
                  <Text style={styles.deleteText}>Supprimer</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

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
    marginBottom: 14,
  },

  card: {
    borderRadius: 22,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },

  loadingText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "800",
    paddingVertical: 20,
  },

  mainImage: {
    width: "100%",
    height: 240,
    borderRadius: 16,
    marginBottom: 12,
  },

  noImage: {
    width: "100%",
    height: 240,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  noImageText: {
    color: "#475569",
    fontWeight: "800",
  },

  thumbRow: {
    paddingBottom: 10,
    gap: 10,
  },

  thumbWrap: {
    width: 74,
    height: 74,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
    marginRight: 10,
  },

  thumbWrapActive: {
    borderColor: "#38bdf8",
  },

  thumbImage: {
    width: "100%",
    height: "100%",
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 8,
  },

  productTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
  },

  price: {
    color: "#4ade80",
    fontSize: 18,
    fontWeight: "900",
  },

  description: {
    color: "rgba(255,255,255,0.82)",
    lineHeight: 20,
    fontWeight: "700",
    marginBottom: 12,
  },

  metaWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },

  metaBadge: {
    backgroundColor: "rgba(255,255,255,0.16)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  metaBadgeAlt: {
    backgroundColor: "rgba(34,197,94,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  conditionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  conditionNew: {
    backgroundColor: "rgba(34,197,94,0.22)",
  },

  conditionUsed: {
    backgroundColor: "rgba(245,158,11,0.22)",
  },

  metaBadgeText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
  },

  infoBox: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    gap: 6,
  },

  infoText: {
    color: "#fff",
    fontWeight: "700",
  },

  whatsappBtn: {
    backgroundColor: "#25D366",
    padding: 13,
    borderRadius: 16,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  whatsappText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "900",
  },

  ownerActions: {
    gap: 8,
  },

  editBtn: {
    backgroundColor: "#f59e0b",
    padding: 12,
    borderRadius: 16,
  },

  editText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "900",
  },

  deleteBtn: {
    backgroundColor: "#ef4444",
    padding: 12,
    borderRadius: 16,
  },

  deleteText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "900",
  },
});