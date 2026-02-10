const BASE_URL = "http://192.168.11.114:8000"; // نفس IP ديالك

export async function apiRegister(payload: {
  name: string;
  phone: string;
  email: string;
  password: string;
}) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function apiLogin(payload: { email: string; password: string }) {
  const url = `${BASE_URL}/auth/login`;
  console.log("LOGIN URL =>", url);
  console.log("LOGIN PAYLOAD =>", payload);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log("LOGIN STATUS =>", res.status);
  console.log("LOGIN RAW =>", text);

  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, message: "Invalid JSON from server", raw: text };
  }
}
