import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "oceanmind_isLoggedIn";

export async function setLoggedIn(value: boolean) {
  await AsyncStorage.setItem(KEY, value ? "1" : "0");
}

export async function isLoggedIn(): Promise<boolean> {
  const v = await AsyncStorage.getItem(KEY);
  return v === "1";
}

export async function logout() {
  await AsyncStorage.removeItem(KEY);
}
