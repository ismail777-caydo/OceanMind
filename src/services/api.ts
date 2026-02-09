// src/services/api.ts
const BASE_URL = "http://YOUR_SERVER_IP:8000"; // دابا نخليوها مؤقتاً

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || "Login failed");
  }

  return res.json(); // مثال: { token: "..." , user: {...} }
}
