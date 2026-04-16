import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CityOption } from "../constants/cities";

type Props = {
  cities: CityOption[];
  selectedCity: CityOption;
  onSelect: (city: CityOption) => void;
  title?: string;
};

export default function CityPicker({
  cities,
  selectedCity,
  onSelect,
  title = "Choisir une ville",
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* زر واحد فقط */}
      <Pressable style={styles.trigger} onPress={() => setOpen(true)}>
        <View style={styles.triggerLeft}>
          <Ionicons name="location-outline" size={16} color="#2dd4bf" />
          <Text style={styles.triggerText}>{selectedCity.label}, Maroc</Text>
        </View>
        <Ionicons name="chevron-down" size={18} color="rgba(255,255,255,0.9)" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{title}</Text>
              <Pressable onPress={() => setOpen(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={18} color="#fff" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {cities.map((city) => {
                const active = city.label === selectedCity.label;

                return (
                  <Pressable
                    key={city.label}
                    onPress={() => {
                      onSelect(city);
                      setOpen(false);
                    }}
                    style={[styles.cityItem, active && styles.cityItemActive]}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <Ionicons
                        name={active ? "location" : "location-outline"}
                        size={16}
                        color={active ? "#2dd4bf" : "rgba(255,255,255,0.85)"}
                      />
                      <Text style={styles.cityText}>{city.label}</Text>
                    </View>

                    {active ? (
                      <Ionicons name="checkmark-circle" size={18} color="#2dd4bf" />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    marginTop: 14,
    height: 44,
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  triggerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  triggerText: {
    color: "rgba(255,255,255,0.9)",
    fontWeight: "800",
    fontSize: 12,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  sheet: {
    maxHeight: "70%",
    borderRadius: 22,
    padding: 14,
    backgroundColor: "rgba(15, 35, 60, 0.98)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sheetTitle: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  cityItem: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cityItemActive: {
    backgroundColor: "rgba(45,212,191,0.12)",
    borderColor: "rgba(45,212,191,0.35)",
  },
  cityText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
  },
});