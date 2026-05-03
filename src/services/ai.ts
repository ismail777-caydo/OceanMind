import { Platform } from "react-native";
import Constants from "expo-constants";

export type DetectResult = {
  species?: string;
  common_name?: string;
  code?: string;
  sizeCm?: number;
  weightG?: number;
  legal?: boolean | null;
  rule?: string;
  confidence?: number;
  error?: string;
};

function getDevHost() {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ??
    (Constants as any).manifest?.hostUri;

  const host = typeof hostUri === "string" ? hostUri.split(":")[0] : null;
  return host;
}

function getApiBaseUrl() {
  const envUrl = process.env.EXPO_PUBLIC_AI_BASE_URL;

  if (envUrl && envUrl.startsWith("http")) {
    return envUrl;
  }

  if (Platform.OS === "web") {
    return "http://localhost:8000";
  }

  const host = getDevHost();
  if (host) {
    return `http://${host}:8000`;
  }

  console.warn("API base URL is not configured");
    return "https://ocean-mind-server-ai-production.up.railway.app";
}

const API_BASE_URL = getApiBaseUrl();

export async function detectFish(photoUri: string): Promise<DetectResult> {
  const url = `${API_BASE_URL}/ai/detect`;

  const form = new FormData();
  form.append("image", {
    uri: photoUri,
    name: "photo.jpg",
    type: "image/jpeg",
  } as any);

  try {
    const res = await fetch(url, {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return {
        species: "UNAVAILABLE",
        common_name: "Service indisponible",
        confidence: 0,
        legal: null,
        rule: "Le service AI n'est pas disponible pour le moment.",
        error: `HTTP ${res.status}: ${txt}`,
      };
    }

    const data = (await res.json()) as DetectResult;
    return data;
  } catch (error: any) {
    return {
      species: "UNAVAILABLE",
      common_name: "Service indisponible",
      confidence: 0,
      legal: null,
      rule: "Impossible de contacter le serveur AI. Réessayez plus tard.",
      error: error?.message ?? "Unknown network error",
    };
  }
}