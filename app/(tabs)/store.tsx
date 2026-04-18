import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  Linking,
  Alert,
  TextInput,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../../src/lib/supabaseClient";
import { useAuth } from "../../src/auth/AuthContext";

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
  condition?: "new" | "used";
};

const CATEGORIES = [
  "Tous",
  "Filets",
  "Hameçons",
  "Appâts",
  "Sécurité",
  "Occasion",
  "Autres",
];

export default function Store() {
  const router = useRouter();
  const { user, logged, ready } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "mine" | "favorites">("all");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [loading, setLoading] = useState(true);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/home");
  };

  const fetchAll = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.log("fetch products error:", error);
        Alert.alert("Erreur", error.message);
        return;
      }

      setProducts(data || []);

      if (user?.id) {
        const { data: mine, error: mineError } = await supabase
          .from("products")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (mineError) {
          console.log("fetch my products error:", mineError);
        }

        setMyProducts(mine || []);

        const { data: favs, error: favsError } = await supabase
          .from("favorite_products")
          .select("product_id")
          .eq("user_id", user.id);

        if (favsError) {
          console.log("fetch favorites error:", favsError);
        }

        setFavoriteIds((favs || []).map((x: any) => x.product_id));
      } else {
        setMyProducts([]);
        setFavoriteIds([]);
      }
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!ready) return;
      fetchAll();
    }, [ready, user?.id])
  );

  const openWhatsApp = async (phone: string) => {
    try {
      const cleaned = phone.replace(/\D/g, "");

      if (!cleaned) {
        Alert.alert("Erreur", "Numéro WhatsApp invalide.");
        return;
      }

      const url = `https://wa.me/${cleaned}`;
      const supported = await Linking.canOpenURL(url);

      if (!supported) {
        Alert.alert("Erreur", "Impossible d'ouvrir WhatsApp.");
        return;
      }

      await Linking.openURL(url);
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible d'ouvrir WhatsApp.");
    }
  };

  const confirmDelete = (id: string, ownerId: string) => {
    if (!user || user.id !== ownerId) {
      Alert.alert("Accès refusé", "Tu ne peux supprimer que ton propre produit.");
      return;
    }

    Alert.alert("Supprimer", "Tu veux supprimer ce produit ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => handleDelete(id, ownerId),
      },
    ]);
  };

  const handleDelete = async (id: string, ownerId: string) => {
    if (!user || user.id !== ownerId) {
      Alert.alert("Accès refusé", "Tu ne peux supprimer que ton propre produit.");
      return;
    }

    try {
      const { error: imagesDeleteError } = await supabase
        .from("product_images")
        .delete()
        .eq("product_id", id);

      if (imagesDeleteError) {
        console.log("delete product_images error:", imagesDeleteError);
      }

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        Alert.alert("Erreur", error.message);
        return;
      }

      Alert.alert("Succès", "Produit supprimé.");
      fetchAll();
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Une erreur est survenue.");
    }
  };

  const toggleFavorite = async (productId: string) => {
    if (!logged || !user) {
      Alert.alert("Erreur", "Tu dois te connecter pour gérer les favoris.");
      return;
    }

    const isFav = favoriteIds.includes(productId);

    try {
      if (isFav) {
        const { error } = await supabase
          .from("favorite_products")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);

        if (error) {
          Alert.alert("Erreur", error.message);
          return;
        }

        setFavoriteIds((prev) => prev.filter((id) => id !== productId));
      } else {
        const { error } = await supabase.from("favorite_products").insert({
          user_id: user.id,
          product_id: productId,
        });

        if (error) {
          Alert.alert("Erreur", error.message);
          return;
        }

        setFavoriteIds((prev) => [...prev, productId]);
      }
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Une erreur est survenue.");
    }
  };

  const favoriteProducts = useMemo(
    () => products.filter((p) => favoriteIds.includes(p.id)),
    [products, favoriteIds]
  );

  const baseData =
    activeTab === "all"
      ? products
      : activeTab === "mine"
      ? myProducts
      : favoriteProducts;

  const filteredData = useMemo(() => {
    return baseData.filter((item) => {
      const matchesCategory =
        selectedCategory === "Tous" ||
        (item.category || "").toLowerCase() === selectedCategory.toLowerCase();

      const q = search.trim().toLowerCase();

      const matchesSearch =
        q.length === 0 ||
        (item.title || "").toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q) ||
        (item.category || "").toLowerCase().includes(q) ||
        (item.city || "").toLowerCase().includes(q) ||
        (item.seller_name || "").toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [baseData, search, selectedCategory]);

  const renderItem = ({ item }: { item: Product }) => {
    const isMine = !!user && user.id === item.user_id;
    const isFav = favoriteIds.includes(item.id);

    return (
      <Pressable
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/(tabs)/product-details",
            params: { id: item.id },
          })
        }
      >
        <Pressable
          style={styles.favoriteBtn}
          onPress={() => toggleFavorite(item.id)}
        >
          <Ionicons
            name={isFav ? "heart" : "heart-outline"}
            size={20}
            color={isFav ? "#ef4444" : "#fff"}
          />
        </Pressable>

        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} />
        ) : (
          <View style={styles.noImage}>
            <Ionicons name="image-outline" size={28} color="#94a3b8" />
            <Text style={styles.noImageText}>Pas d'image</Text>
          </View>
        )}

        <View style={styles.cardTop}>
          <Text style={styles.name}>{item.title}</Text>
          <Text style={styles.price}>{item.price} DH</Text>
        </View>

        <Text style={styles.desc}>{item.description}</Text>

        <View style={styles.metaRow}>
          {!!item.category && (
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>{item.category}</Text>
            </View>
          )}

          {!!item.city && (
            <View style={styles.metaBadgeAlt}>
              <Text style={styles.metaBadgeText}>{item.city}</Text>
            </View>
          )}

          {!!item.condition && (
            <View
              style={[
                styles.conditionBadge,
                item.condition === "new" ? styles.conditionNew : styles.conditionUsed,
              ]}
            >
              <Text style={styles.metaBadgeText}>
                {item.condition === "new" ? "New" : "Used"}
              </Text>
            </View>
          )}

          {isMine && (
            <View style={styles.mineBadge}>
              <Text style={styles.mineBadgeText}>Mon produit</Text>
            </View>
          )}
        </View>

        <Text style={styles.seller}>👤 {item.seller_name}</Text>

        <Pressable
          style={styles.whatsappBtn}
          onPress={() => openWhatsApp(item.whatsapp)}
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
                  params: { id: item.id },
                })
              }
            >
              <Text style={styles.editText}>Modifier</Text>
            </Pressable>

            <Pressable
              style={styles.deleteBtn}
              onPress={() => confirmDelete(item.id, item.user_id)}
            >
              <Text style={styles.deleteText}>Supprimer</Text>
            </Pressable>
          </View>
        )}
      </Pressable>
    );
  };

  if (!ready) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

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

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.container}>
            <Image
              source={require("../../src/assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.title}>Ocean Mind Store</Text>
            <Text style={styles.subtitle}>
              Équipements de pêche, matériel utile et annonces de la communauté.
            </Text>

            <Pressable
              style={styles.addBtn}
              onPress={() => router.push("/(tabs)/add-product")}
            >
              <Ionicons name="add-circle-outline" size={18} color="#fff" />
              <Text style={styles.addBtnText}>Ajouter un produit</Text>
            </Pressable>

            <View style={styles.tabsRow}>
              <Pressable
                style={[styles.tabBtn, activeTab === "all" && styles.tabBtnActive]}
                onPress={() => setActiveTab("all")}
              >
                <Text style={styles.tabText}>Tous</Text>
              </Pressable>

              <Pressable
                style={[styles.tabBtn, activeTab === "mine" && styles.tabBtnActive]}
                onPress={() => {
                  if (!logged) {
                    Alert.alert("Erreur", "Tu dois te connecter.");
                    return;
                  }
                  setActiveTab("mine");
                }}
              >
                <Text style={styles.tabText}>Mes produits</Text>
              </Pressable>

              <Pressable
                style={[styles.tabBtn, activeTab === "favorites" && styles.tabBtnActive]}
                onPress={() => {
                  if (!logged) {
                    Alert.alert("Erreur", "Tu dois te connecter.");
                    return;
                  }
                  setActiveTab("favorites");
                }}
              >
                <Text style={styles.tabText}>Favoris</Text>
              </Pressable>
            </View>

            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={18} color="#94a3b8" />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un produit..."
                placeholderTextColor="#94a3b8"
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesRow}
            >
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  style={[
                    styles.categoryChip,
                    selectedCategory === cat && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={styles.categoryChipText}>{cat}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {loading && (
              <View style={styles.inlineLoader}>
                <ActivityIndicator size="small" color="#38bdf8" />
                <Text style={styles.inlineLoaderText}>Chargement des produits...</Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyBox}>
              <MaterialCommunityIcons
                name="basket-outline"
                size={34}
                color="rgba(255,255,255,0.72)"
              />
              <Text style={styles.emptyTitle}>Aucun produit trouvé</Text>
              <Text style={styles.emptySub}>
                Essaie une autre recherche ou ajoute un nouveau produit.
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0b1220",
  },
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
  addBtn: {
    backgroundColor: "rgba(56, 189, 248, 0.95)",
    paddingVertical: 13,
    borderRadius: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addBtnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 15,
  },
  tabsRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  tabBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.10)",
    paddingVertical: 11,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  tabBtnActive: { backgroundColor: "rgba(34,197,94,0.88)" },
  tabText: { color: "#fff", fontWeight: "900", fontSize: 12 },
  searchBox: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: "#0f172a",
    fontWeight: "700",
  },
  categoriesRow: { paddingBottom: 14, gap: 8 },
  categoryChip: {
    backgroundColor: "rgba(255,255,255,0.10)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  categoryChipActive: { backgroundColor: "rgba(245, 158, 11, 0.92)" },
  categoryChipText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  inlineLoader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  inlineLoaderText: {
    color: "#fff",
    fontWeight: "700",
  },
  listContent: { paddingBottom: 30, paddingHorizontal: 18 },
  card: {
    marginTop: 4,
    borderRadius: 22,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    marginBottom: 14,
    position: "relative",
  },
  favoriteBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 2,
    backgroundColor: "rgba(15,23,42,0.55)",
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  image: { width: "100%", height: 180, borderRadius: 16, marginBottom: 12 },
  noImage: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  noImageText: { color: "#475569", fontWeight: "800" },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 6,
  },
  name: { flex: 1, fontWeight: "900", fontSize: 18, color: "#fff" },
  desc: {
    color: "rgba(255,255,255,0.78)",
    marginBottom: 8,
    lineHeight: 18,
    fontWeight: "700",
  },
  price: { color: "#4ade80", fontWeight: "900", fontSize: 16 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
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
  conditionNew: { backgroundColor: "rgba(34,197,94,0.22)" },
  conditionUsed: { backgroundColor: "rgba(245,158,11,0.22)" },
  metaBadgeText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  mineBadge: {
    backgroundColor: "rgba(56, 189, 248, 0.95)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  mineBadgeText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 12,
  },
  seller: {
    fontSize: 13,
    color: "rgba(255,255,255,0.82)",
    marginBottom: 12,
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
  whatsappText: { color: "#fff", textAlign: "center", fontWeight: "900" },
  ownerActions: { gap: 8 },
  editBtn: { backgroundColor: "#f59e0b", padding: 12, borderRadius: 16 },
  editText: { color: "#fff", textAlign: "center", fontWeight: "900" },
  deleteBtn: { backgroundColor: "#ef4444", padding: 12, borderRadius: 16 },
  deleteText: { color: "#fff", textAlign: "center", fontWeight: "900" },
  emptyBox: {
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
  },
  emptyTitle: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
    marginTop: 10,
    marginBottom: 6,
  },
  emptySub: {
    color: "rgba(255,255,255,0.72)",
    textAlign: "center",
    lineHeight: 18,
    fontWeight: "700",
  },
});