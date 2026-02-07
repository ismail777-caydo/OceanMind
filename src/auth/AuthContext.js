import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext(null);

const KEY = "OCEANMIND_FAKE_AUTH";

export function AuthProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    (async () => {
      const v = await AsyncStorage.getItem(KEY);
      setIsLoggedIn(v === "1");
      setReady(true);
    })();
  }, []);

  const login = async () => {
    await AsyncStorage.setItem(KEY, "1");
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(KEY);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ ready, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
