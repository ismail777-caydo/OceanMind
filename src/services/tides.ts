const AI_BASE = process.env.EXPO_PUBLIC_AI_BASE_URL;

if (!AI_BASE) {
  console.warn("EXPO_PUBLIC_AI_BASE_URL is missing in .env");
}

export type TidesWavesResponse = {
  location: { lat: number; lon: number };
  current?: {
    wave_height_m?: number;
    wave_direction_deg?: number;
    wave_direction_text?: string;
    wave_period_s?: number;
    sea_level_height_msl?: number;
    sea_state?: string;
    risk?: string;
  };
  tides_today?: {
    high_tide?: {
      time?: string;
      height_m?: number;
    } | null;
    low_tide?: {
      time?: string;
      height_m?: number;
    } | null;
    chart_levels?: number[];
  };
  daily_7?: Array<{
    date: string;
    wave_height_max_m?: number;
    wave_direction_deg?: number;
    wave_direction_text?: string;
    wave_period_s?: number;
    sea_state?: string;
    risk?: string;
  }>;
  ai_recommendation?: {
    recommended_window?: string;
    safety?: string;
  };
  warning?: string;
};

export async function getTidesAndWaves(lat: number, lon: number) {
  if (!AI_BASE) {
    throw new Error("AI_BASE is not configured");
  }

  const url = `${AI_BASE}/marine/tides-waves?lat=${lat}&lon=${lon}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Tides/Waves error: ${res.status}`);
  }

  return (await res.json()) as TidesWavesResponse;
}