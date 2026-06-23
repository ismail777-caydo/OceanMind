// src/auth/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabaseClient";

type User = {
  id: string;
  email: string;
};

type RegisterPayload = {
  name: string;
  phone: string;
  email: string;
  password: string;
  city: string;
};

type AuthContextType = {
  ready: boolean;
  logged: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "user";

function formatUser(u: any): User {
  return {
    id: u.id,
    email: u.email ?? "",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const logged = !!user;

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        // 1️⃣ FAST PATH: local storage first (NO await blocking Supabase)
        const cached = await AsyncStorage.getItem(STORAGE_KEY);

        if (cached && mounted) {
          setUser(JSON.parse(cached));
        }

        // 2️⃣ mark UI ready immediately (IMPORTANT FIX)
        if (mounted) setReady(true);

        // 3️⃣ Supabase check runs in background (NON-blocking UI)
        supabase.auth.getSession().then(async ({ data }) => {
          const sessionUser = data.session?.user;

          if (!mounted) return;

          if (sessionUser) {
            const formattedUser = formatUser(sessionUser);
            setUser(formattedUser);

            // async fire-and-forget (no blocking)
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(formattedUser));
          }
        });

      } catch {
        if (mounted) {
          setUser(null);
          setReady(true);
        }
      }
    };

    bootstrap();

    // auth listener stays but lightweight
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const sessionUser = session?.user;

        if (!mounted) return;

        if (sessionUser) {
          const formattedUser = formatUser(sessionUser);
          setUser(formattedUser);
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(formattedUser));
        } else {
          setUser(null);
          AsyncStorage.removeItem(STORAGE_KEY);
        }
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) throw new Error(error.message);

    const sessionUser = data.user;

    if (sessionUser) {
      const formattedUser = formatUser(sessionUser);
      setUser(formattedUser);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(formattedUser));
    }
  };

  const register = async (payload: RegisterPayload) => {
    const { name, phone, city, email, password } = payload;

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) throw new Error(error.message);

    const newUser = data.user;

    if (newUser) {
      const { error: profileErr } = await supabase.from("profiles").upsert({
        id: newUser.id,
        full_name: name,
        phone,
        city,
      });

      if (profileErr) throw new Error(profileErr.message);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();

    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      ready,
      logged,
      user,
      login,
      register,
      logout,
    }),
    [ready, logged, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}