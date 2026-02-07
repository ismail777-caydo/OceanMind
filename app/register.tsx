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
} from "react-native";
import { useRouter } from "expo-router";

export default function Register() {
  const router = useRouter();

  const [showPass, setShowPass] = useState(false);
  const [pressed, setPressed] = useState(false);

  // ✅ States
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  // ✅ Validation
  const validateRegister = () => {
    const e: Record<string, string> = {};
    const emailTrim = email.trim();

    if (!fullName.trim()) e.fullName = "دخل الاسم الكامل";

    if (!phone.trim()) e.phone = "دخل رقم الهاتف";
    else if (phone.length < 9) e.phone = "رقم الهاتف قصير";
    else if (!/^[0-9]+$/.test(phone)) e.phone = "التليفون غير أرقام";

    if (!city.trim()) e.city = "دخل المدينة/الميناء";

    if (!emailTrim) e.email = "دخل الإيميل";
    else if (!/^\S+@\S+\.\S+$/.test(emailTrim)) e.email = "الإيميل ماشي صحيح";

    if (!password) e.password = "دخل كلمة السر";
    else if (password.length < 6) e.password = "password خاصو يكون 6+";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <ImageBackground
      source={require("../src/assets/background.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoBlock}>
          <Image
            source={require("../src/assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Créer un compte</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Nom complet */}
          <Text style={styles.label}>Nom complet</Text>
          <TextInput
            value={fullName}
            onChangeText={(t) => {
              setFullName(t);
              setErrors((prev) => ({ ...prev, fullName: undefined }));
            }}
            placeholder="Votre nom complet"
            placeholderTextColor="rgba(255,255,255,0.6)"
            style={[styles.input, errors.fullName && styles.inputError]}
          />
          {errors.fullName ? (
            <Text style={styles.errorText}>{errors.fullName}</Text>
          ) : null}

          {/* Téléphone */}
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
                  setErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                placeholder="6 XX XX XX XX"
                placeholderTextColor="rgba(255,255,255,0.6)"
                style={[styles.input, errors.phone && styles.inputError]}
                keyboardType="phone-pad"
              />
              {errors.phone ? (
                <Text style={styles.errorText}>{errors.phone}</Text>
              ) : null}
            </View>
          </View>

          {/* Ville */}
          <Text style={[styles.label, { marginTop: 12 }]}>Port / Ville</Text>
          <TextInput
            value={city}
            onChangeText={(t) => {
              setCity(t);
              setErrors((prev) => ({ ...prev, city: undefined }));
            }}
            placeholder="Ex: Agadir, Casablanca, Essaouira..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            style={[styles.input, errors.city && styles.inputError]}
          />
          {errors.city ? (
            <Text style={styles.errorText}>{errors.city}</Text>
          ) : null}

          {/* Email */}
          <Text style={[styles.label, { marginTop: 12 }]}>E-mail</Text>
          <TextInput
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            placeholder="votre.email@exemple.com"
            placeholderTextColor="rgba(255,255,255,0.6)"
            style={[styles.input, errors.email && styles.inputError]}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email ? (
            <Text style={styles.errorText}>{errors.email}</Text>
          ) : null}

          {/* Password */}
          <Text style={[styles.label, { marginTop: 12 }]}>Mot de passe</Text>
          <View style={styles.passRow}>
            <View style={{ flex: 1 }}>
              <TextInput
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="********"
                placeholderTextColor="rgba(255,255,255,0.6)"
                style={[
                  styles.input,
                  { marginBottom: 0 },
                  errors.password && styles.inputError,
                ]}
                secureTextEntry={!showPass}
              />
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}
            </View>

            <Pressable
              onPress={() => setShowPass((v) => !v)}
              style={styles.eyeBtn}
            >
              <Text style={styles.eyeText}>{showPass ? "🙈" : "👁️"}</Text>
            </Pressable>
          </View>

          {/* Button */}
          <Pressable
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            onPress={async () => {
              if (!validateRegister()) return;
              router.replace("/(tabs)");
            }}
            style={[
              styles.btn,
              pressed && {
                backgroundColor: "#16a34a",
                transform: [{ scale: 1.03 }],
              },
            ]}
          >
            <Text style={styles.btnText}>S'inscrire</Text>
          </Pressable>

          {/* Link back */}
          <Pressable onPress={() => router.replace("/")} style={styles.linkWrap}>
            <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
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

  // ✅ Error styles
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
  eyeText: { fontSize: 18 },

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

  linkWrap: { marginTop: 12, alignItems: "center" },
  linkText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    textDecorationLine: "underline",
  },
});
