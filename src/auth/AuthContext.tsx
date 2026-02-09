// src/auth/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthContextType = {
  ready: boolean;
  logged: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const KEY = "OCEANMIND_FAKE_AUTH";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    (async () => {
      const v = await AsyncStorage.getItem(KEY);
      setLogged(v === "1");
      setReady(true);
    })();
  }, []);

  const login = async () => {
    await AsyncStorage.setItem(KEY, "1");
    setLogged(true);
  };

  const logout = async () => {
    console.log("LOGOUT CALLED"); // 👈 الجديد
    console.log("LOGOUT: removed key and setting logged=false");

    await AsyncStorage.removeItem(KEY);
    setLogged(false);
  };

  return (
    <AuthContext.Provider value={{ ready, logged, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
