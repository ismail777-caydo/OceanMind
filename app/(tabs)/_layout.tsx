import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="home" // 👈 الجديد: يبدا بـ home
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: "#38bdf8",
        tabBarInactiveTintColor: "rgba(255,255,255,0.55)",

        tabBarStyle: {
          backgroundColor: "rgba(15, 35, 60, 0.94)",
          borderTopColor: "rgba(255,255,255,0.14)",
          borderTopWidth: 1,
          height: 78,
          paddingTop: 8,
          paddingBottom: 14,
        },

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
        },
      }}
    >
      {/* ✅ TABS اللي باغين يبانوا */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="carte"
        options={{
          title: "Carte",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "map" : "map-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="journal"
        options={{
          title: "Journal",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "book" : "book-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profil"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* ❌ Screens داخل (tabs) ولكن ماشي Tabs (نخبيوهم) */}
      <Tabs.Screen name="detection" options={{ href: null }} />
      <Tabs.Screen name="zones" options={{ href: null }} />
      <Tabs.Screen name="meteo" options={{ href: null }} />
      <Tabs.Screen name="tides" options={{ href: null }} />
      <Tabs.Screen name="logbook" options={{ href: null }} />
      <Tabs.Screen name="community" options={{ href: null }} />
      <Tabs.Screen name="reglementation" options={{ href: null }} />
      <Tabs.Screen name="add-capture" options={{ href: null }} />
    </Tabs>
  );
}
