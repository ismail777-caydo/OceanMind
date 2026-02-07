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
} from "react-native";
import { useRouter } from "expo-router";

// ✅ NEW: AsyncStorage helper
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginAnimatedScreen() {
  const router = useRouter();

  const [opened, setOpened] = useState(false);
  const [pressed, setPressed] = useState(false);

  // ✅ Inputs + Errors
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  // ✅ Validation
  const validateLogin = () => {
    const e = {};
    const emailTrim = email.trim();

    if (!emailTrim) e.email = "دخل الإيميل";
    else if (!/^\S+@\S+\.\S+$/.test(emailTrim)) e.email = "الإيميل ماشي صحيح";

    if (!password) e.password = "دخل كلمة السر";
    else if (password.length < 6) e.password = "password خاصو يكون 6+";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Anim values
  const logoY = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(1)).current;

  const cardY = useRef(new Animated.Value(-60)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

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

  // Auto after 4 seconds
  useEffect(() => {
    const t = setTimeout(() => trigger(), 4000);
    return () => clearTimeout(t);
  }, []);

  // Logo position (after animation)
  const logoTranslateY = logoY.interpolate({
    inputRange: [-1, 0],
    outputRange: [-40, 90],
  });

  // ✅ NEW: login handler (front فقط)
  const handleLogin = async () => {
    if (!validateLogin()) return;

    // نخزنو بلي راه دخل
    await AsyncStorage.setItem("oceanmind_isLoggedIn", "1");

    // نمشيو للـ tabs
    router.replace("/(tabs)");
  };

  return (
    <Pressable style={{ flex: 1 }} onPress={trigger}>
      <ImageBackground
        source={require("../assets/background.png")}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.safe}>
          {/* LOGO */}
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

          {/* LOGIN CARD */}
          <Animated.View
            pointerEvents={opened ? "auto" : "none"}
            style={[
              styles.card,
              {
                opacity: cardOpacity,
                transform: [{ translateY: cardY }],
              },
            ]}
          >
            <Text style={styles.cardTitle}>Connexion</Text>

            <Text style={styles.label}>E-mail</Text>

            {/* ✅ Email Input */}
            <TextInput
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="votre.email@exemple.com"
              placeholderTextColor="rgba(255,255,255,0.65)"
              style={[styles.input, errors.email && styles.inputError]}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}

            <Text style={[styles.label, { marginTop: 12 }]}>Mot de passe</Text>

            {/* ✅ Password Input */}
            <TextInput
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="********"
              placeholderTextColor="rgba(255,255,255,0.65)"
              style={[styles.input, errors.password && styles.inputError]}
              secureTextEntry
            />
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}

            {/* LOGIN BUTTON */}
            <Pressable
              onPressIn={() => setPressed(true)}
              onPressOut={() => setPressed(false)}
              onPress={handleLogin}
              style={[
                styles.btn,
                pressed && styles.btnPressed,
                pressed && { transform: [{ scale: 1.06 }] },
              ]}
            >
              <Text style={[styles.btnText, pressed && { color: "#ffffff" }]}>
                Se connecter
              </Text>
            </Pressable>

            <Pressable
              style={styles.linkWrap}
              onPress={() => router.push("/register")}
            >
              <Text style={styles.linkText}>Créer un compte</Text>
            </Pressable>
          </Animated.View>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },

  logoBlock: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
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
