import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/auth/AuthContext";

type RegisterErrors = {
  fullName?: string;
  phone?: string;
  city?: string;
  email?: string;
  password?: string;
  general?: string;
};

export default function Register() {
  const router = useRouter();
  const { register } = useAuth();

  const [showPass, setShowPass] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<RegisterErrors>({});

  const validateRegister = () => {
    const e: RegisterErrors = {};
    const emailTrim = email.trim();

    if (!fullName.trim()) {
      e.fullName = "Veuillez saisir votre nom complet.";
    }

    if (!phone.trim()) {
      e.phone = "Veuillez saisir votre numéro de téléphone.";
    } else if (phone.trim().length < 9) {
      e.phone = "Le numéro de téléphone est trop court.";
    } else if (!/^[0-9]+$/.test(phone.trim())) {
      e.phone = "Le numéro de téléphone doit contenir uniquement des chiffres.";
    }

    if (!city.trim()) {
      e.city = "Veuillez saisir votre ville ou port.";
    }

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

  const handleRegister = async () => {
    if (loading) return;
    if (!validateRegister()) return;

    try {
      setLoading(true);
      setErrors({});

      await register({
        name: fullName.trim(),
        phone: phone.trim(),
        city: city.trim(),
        email: email.trim(),
        password,
      });

      router.replace("/home" as any);
    } catch (e: any) {
      setErrors((prev) => ({
        ...prev,
        general: e?.message || "Inscription impossible. Veuillez réessayer.",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../src/assets/background.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoBlock}>
            <Image
              source={require("../src/assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Créer un compte</Text>
          </View>

          <View style={styles.card}>
            {!!errors.general && (
              <Text style={styles.errorText}>{errors.general}</Text>
            )}

            <Text style={styles.label}>Nom complet</Text>
            <TextInput
              value={fullName}
              onChangeText={(t) => {
                setFullName(t);
                setErrors((prev) => ({
                  ...prev,
                  fullName: undefined,
                  general: undefined,
                }));
              }}
              placeholder="Votre nom complet"
              placeholderTextColor="rgba(255,255,255,0.6)"
              style={[styles.input, errors.fullName && styles.inputError]}
              autoCapitalize="words"
            />
            {!!errors.fullName && (
              <Text style={styles.errorText}>{errors.fullName}</Text>
            )}

            <Text style={[styles.label, { marginTop: 12 }]}>
              Numéro de téléphone
            </Text>
            <View style={styles.phoneRow}>
              <View style={styles.countryCode}>
                <Text style={styles.countryText}>+212</Text>
              </View>

              <View style={{ flex: 1 }}>
                <TextInput
                  value={phone}
                  onChangeText={(t) => {
                    const onlyDigits = t.replace(/[^0-9]/g, "");
                    setPhone(onlyDigits);
                    setErrors((prev) => ({
                      ...prev,
                      phone: undefined,
                      general: undefined,
                    }));
                  }}
                  placeholder="6XXXXXXXX"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  style={[styles.input, errors.phone && styles.inputError]}
                  keyboardType="phone-pad"
                />
                {!!errors.phone && (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                )}
              </View>
            </View>

            <Text style={[styles.label, { marginTop: 12 }]}>Port / Ville</Text>
            <TextInput
              value={city}
              onChangeText={(t) => {
                setCity(t);
                setErrors((prev) => ({
                  ...prev,
                  city: undefined,
                  general: undefined,
                }));
              }}
              placeholder="Ex: Agadir, Casablanca, Essaouira..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              style={[styles.input, errors.city && styles.inputError]}
              autoCapitalize="words"
            />
            {!!errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

            <Text style={[styles.label, { marginTop: 12 }]}>E-mail</Text>
            <TextInput
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setErrors((prev) => ({
                  ...prev,
                  email: undefined,
                  general: undefined,
                }));
              }}
              placeholder="votre.email@exemple.com"
              placeholderTextColor="rgba(255,255,255,0.6)"
              style={[styles.input, errors.email && styles.inputError]}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {!!errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <Text style={[styles.label, { marginTop: 12 }]}>Mot de passe</Text>
            <View style={styles.passRow}>
              <View style={{ flex: 1 }}>
                <TextInput
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    setErrors((prev) => ({
                      ...prev,
                      password: undefined,
                      general: undefined,
                    }));
                  }}
                  placeholder="********"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  style={[
                    styles.input,
                    { marginBottom: 0 },
                    errors.password && styles.inputError,
                  ]}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {!!errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              <Pressable
                onPress={() => setShowPass((v) => !v)}
                style={styles.eyeBtn}
                disabled={loading}
              >
                <Text style={styles.eyeText}>{showPass ? "🙈" : "👁️"}</Text>
              </Pressable>
            </View>

            <Pressable
              onPressIn={() => setPressed(true)}
              onPressOut={() => setPressed(false)}
              onPress={handleRegister}
              disabled={loading}
              style={[
                styles.btn,
                pressed &&
                  !loading && {
                    backgroundColor: "#16a34a",
                    transform: [{ scale: 1.03 }],
                  },
                loading && { opacity: 0.7 },
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>S'inscrire</Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => router.replace("/home" as any)}
              style={styles.linkWrap}
              disabled={loading}
            >
              <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 140,
  },
  logoBlock: {
    alignItems: "center",
    marginBottom: 18,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    marginTop: 6,
  },
  card: {
    borderRadius: 18,
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  label: {
    fontSize: 12,
    fontWeight: "800",
    color: "rgba(255,255,255,0.92)",
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
  phoneRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  countryCode: {
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  countryText: {
    color: "#fff",
    fontWeight: "800",
  },
  passRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  eyeBtn: {
    height: 44,
    width: 44,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  eyeText: {
    fontSize: 18,
  },
  btn: {
    marginTop: 16,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.95)",
  },
  btnText: {
    color: "#083344",
    fontWeight: "900",
  },
  linkWrap: {
    marginTop: 12,
    alignItems: "center",
  },
  linkText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    textDecorationLine: "underline",
  },
});