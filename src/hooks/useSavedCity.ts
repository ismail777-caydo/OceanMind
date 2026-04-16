import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CityOption, FISHING_CITIES } from "../constants/cities";

export function useSavedCity(storageKey: string) {
  const [selectedCity, setSelectedCity] = useState<CityOption>(FISHING_CITIES[0]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          const found = FISHING_CITIES.find((c) => c.label === parsed?.label);
          if (found) {
            setSelectedCity(found);
          }
        }
      } catch (e) {
        console.log("load city error", e);
      } finally {
        setReady(true);
      }
    })();
  }, [storageKey]);

  const saveCity = async (city: CityOption) => {
    setSelectedCity(city);
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(city));
    } catch (e) {
      console.log("save city error", e);
    }
  };

  return {
    selectedCity,
    setSelectedCity: saveCity,
    ready,
  };
}