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

    const loadUser = async () => {
      try {
        // Supabase hiya source of truth
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn("getSession error:", error.message);
        }

        const sessionUser = data.session?.user;

        if (sessionUser) {
          const formattedUser = formatUser(sessionUser);

          if (mounted) {
            setUser(formattedUser);
          }

          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(formattedUser));
        } else {
          // fallback mn AsyncStorage
          const savedUser = await AsyncStorage.getItem(STORAGE_KEY);

          if (savedUser) {
            const parsedUser = JSON.parse(savedUser);

            if (mounted) {
              setUser(parsedUser);
            }
          } else {
            if (mounted) {
              setUser(null);
            }
          }
        }
      } catch (err) {
        console.warn("loadUser error:", err);

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setReady(true);
        }
      }
    };

    loadUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        const sessionUser = session?.user;

        if (sessionUser) {
          const formattedUser = formatUser(sessionUser);

          if (mounted) {
            setUser(formattedUser);
          }

          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(formattedUser));
        } else {
          if (mounted) {
            setUser(null);
          }

          await AsyncStorage.removeItem(STORAGE_KEY);
        }
      } catch (err) {
        console.warn("onAuthStateChange error:", err);
      }
    });

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

    if (error) {
      throw new Error(error.message);
    }

    const sessionUser = data.user;

    if (sessionUser) {
      const formattedUser = formatUser(sessionUser);
      setUser(formattedUser);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(formattedUser));
    }
  };

  const register = async (payload: RegisterPayload) => {
    const { name, phone, city, email, password } = payload;

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    const newUser = data.user;

    // Ila kan user raj3 men signUp, save profile
    if (newUser) {
      const { error: profileErr } = await supabase.from("profiles").upsert({
        id: newUser.id,
        full_name: name,
        phone,
        city,
      });

      if (profileErr) {
        throw new Error(profileErr.message);
      }
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

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

  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return ctx;
}