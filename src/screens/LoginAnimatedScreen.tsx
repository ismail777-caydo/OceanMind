import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TextInput,
  Pressable,
  Animated,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../auth/AuthContext";

type LoginErrors = {
  email?: string;
  password?: string;
  general?: string;
};

export default function LoginAnimatedScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [opened, setOpened] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});

  const logoY = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(1)).current;
  const cardY = useRef(new Animated.Value(-60)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  const validateLogin = () => {
    const e: LoginErrors = {};
    const emailTrim = email.trim();

    if (!emailTrim) {
      e.email = "Veuillez saisir votre adresse e-mail.";
    } else if (!/^\S+@\S+\.\S+$/.test(emailTrim)) {
      e.email = "Adresse e-mail invalide.";
    }

    if (!password) {
      e.password = "Veuillez saisir votre mot de passe.";
    } else if (password.length < 6) {
      e.password = "Le mot de passe doit contenir au moins 6 caractères.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const trigger = () => {
    if (opened) return;
    setOpened(true);

    Animated.parallel([
      Animated.timing(logoY, {
        toValue: -1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 0.95,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(cardY, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 550,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    const t = setTimeout(() => trigger(), 4000);
    return () => clearTimeout(t);
  }, []);

  const logoTranslateY = logoY.interpolate({
    inputRange: [-1, 0],
    outputRange: [-40, 90],
  });

  const handleLogin = async () => {
    if (loading) return;
    if (!validateLogin()) return;

    try {
      setLoading(true);
      setErrors({});
      await login(email.trim(), password);
      router.replace("/(tabs)/home");
    } catch (e: any) {
      setErrors((prev) => ({
        ...prev,
        general: e?.message || "Connexion impossible. Veuillez réessayer.",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable style={{ flex: 1 }} onPress={trigger}>
      <ImageBackground
        source={require("../assets/background.png")}
        style={styles.bg}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.safe}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View
              style={[
                styles.logoBlock,
                {
                  transform: [{ translateY: logoTranslateY }, { scale: logoScale }],
                },
              ]}
            >
              <View style={styles.logoWrapper}>
                <Image
                  source={require("../assets/logo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            </Animated.View>

            <Animated.View
              pointerEvents={opened ? "auto" : "none"}
              style={[
                styles.card,
                { opacity: cardOpacity, transform: [{ translateY: cardY }] },
              ]}
            >
              <Text style={styles.cardTitle}>Connexion</Text>

              {!!errors.general && (
                <Text style={styles.errorText}>{errors.general}</Text>
              )}

              <Text style={styles.label}>E-mail</Text>
              <TextInput
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setErrors((p) => ({ ...p, email: undefined, general: undefined }));
                }}
                placeholder="votre.email@exemple.com"
                placeholderTextColor="rgba(255,255,255,0.65)"
                style={[styles.input, errors.email && styles.inputError]}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
              {!!errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

              <Text style={[styles.label, { marginTop: 12 }]}>Mot de passe</Text>
              <TextInput
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  setErrors((p) => ({
                    ...p,
                    password: undefined,
                    general: undefined,
                  }));
                }}
                placeholder="********"
                placeholderTextColor="rgba(255,255,255,0.65)"
                style={[styles.input, errors.password && styles.inputError]}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              {!!errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}

              <Pressable
                onPressIn={() => setPressed(true)}
                onPressOut={() => setPressed(false)}
                onPress={handleLogin}
                disabled={loading}
                style={[
                  styles.btn,
                  pressed && !loading && styles.btnPressed,
                  pressed && !loading && { transform: [{ scale: 1.06 }] },
                  loading && { opacity: 0.7 },
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[styles.btnText, pressed && { color: "#fff" }]}>
                    Se connecter
                  </Text>
                )}
              </Pressable>

              <Pressable
                style={styles.linkWrap}
                onPress={() => router.push("/register")}
                disabled={loading}
              >
                <Text style={styles.linkText}>Créer un compte</Text>
              </Pressable>
            </Animated.View>

            <View style={{ height: 30 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flexGrow: 1, paddingHorizontal: 20, justifyContent: "center" },
  logoBlock: { alignItems: "center", marginTop: 100 },
  logoWrapper: {
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 18,
  },
  logo: { width: 220, height: 220 },
  card: {
    marginTop: 22,
    borderRadius: 18,
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.9)",
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  inputError: {
    borderColor: "rgba(239,68,68,0.9)",
  },
  errorText: {
    marginTop: 6,
    marginBottom: 2,
    color: "rgba(239,68,68,0.95)",
    fontSize: 12,
    fontWeight: "700",
  },
  btn: {
    marginTop: 16,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.95)",
  },
  btnPressed: {
    backgroundColor: "#16a34a",
  },
  btnText: {
    color: "#083344",
    fontWeight: "800",
  },
  linkWrap: {
    marginTop: 10,
    alignItems: "center",
  },
  linkText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    textDecorationLine: "underline",
  },
});