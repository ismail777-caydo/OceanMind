import { Stack } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { AuthProvider, useAuth } from "../src/auth/AuthContext";

function RootStack() {
  const { ready, logged } = useAuth();

  // 👇 DEBUG
  console.log("LOGGED =", logged);
  console.log("AUTH STATE =>", { ready, logged });


  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {logged ? <Stack.Screen name="(tabs)" /> : <Stack.Screen name="index" />}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootStack />
    </AuthProvider>
  );
}
