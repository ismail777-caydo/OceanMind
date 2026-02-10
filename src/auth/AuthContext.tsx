// src/auth/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ API services
import { apiLogin, apiRegister } from "../services/auth";

type AuthContextType = {
  ready: boolean;
  logged: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    name: string;
    phone: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const KEY = "OCEANMIND_TOKEN";
const USER_KEY = "OM_USER";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [logged, setLogged] = useState(false);

  // ✅ Check token on app start
  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem(KEY);
      setLogged(!!token);
      setReady(true);
    })();
  }, []);

  // ✅ LOGIN via API
  const login = async (email: string, password: string) => {
    const data = await apiLogin({ email, password });
    if (!data.ok) throw new Error(data.message);

    await AsyncStorage.setItem(KEY, data.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setLogged(true);
  };

  // ✅ REGISTER via API
  const register = async (payload: {
    name: string;
    phone: string;
    email: string;
    password: string;
  }) => {
    const data = await apiRegister(payload);
    if (!data.ok) throw new Error(data.message);

    await AsyncStorage.setItem(KEY, data.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setLogged(true);
  };

  // ✅ LOGOUT
  const logout = async () => {
    console.log("LOGOUT CALLED");
    await AsyncStorage.removeItem(KEY);
    await AsyncStorage.removeItem(USER_KEY);
    setLogged(false);
  };

  return (
    <AuthContext.Provider
      value={{ ready, logged, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
