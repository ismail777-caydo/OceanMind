// src/services/ai.ts
const BASE_URL = "http://192.168.11.114:8000"; // ⚠️ بدل IP ديالك هنا

export type DetectResult = {
  species: string;
  sizeCm: number;
  weightG: number;
  legal: boolean;
  rule: string;
  confidence: number;
};

export async function detectFish(photoUri: string): Promise<DetectResult> {
  const form = new FormData();

  form.append("file", {
    uri: photoUri,
    name: "fish.jpg",
    type: "image/jpeg",
  } as any);

  const res = await fetch(`${BASE_URL}/ai/detect`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || "AI detect failed");
  }

  return res.json();
}
