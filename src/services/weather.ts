// src/services/weather.ts
const AI_BASE = process.env.EXPO_PUBLIC_AI_BASE_URL;

if (!AI_BASE) {
  console.warn("EXPO_PUBLIC_AI_BASE_URL is missing in .env");
}

export type MarineWeatherResponse = {
  location: { lat: number; lon: number };
  current?: {
    temp?: number;
    weather_code?: number;
    desc?: string;
    icon?: string;
  };
  marine?: {
    wind_kmh?: number;
    dir?: number;
    waves_m?: number;
    water_c?: number;
  };
  daily_7?: Array<{
    date: string;
    min: number;
    max: number;
    weather_code: number;
    desc: string;
    icon: string;
  }>;
};

export async function getMarineWeather(lat: number, lon: number) {
  const url = `${AI_BASE}/weather/marine?lat=${lat}&lon=${lon}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather error: ${res.status}`);
  return (await res.json()) as MarineWeatherResponse;
}