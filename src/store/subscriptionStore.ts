import { create } from "zustand";

type SubscriptionState = {
  isPremium: boolean;
  planType: string | null;
  status: string | null;
  expiresAt: string | null;
  loading: boolean;

  setSubscription: (data: {
    isPremium: boolean;
    planType?: string | null;
    status?: string | null;
    expiresAt?: string | null;
  }) => void;

  setLoading: (loading: boolean) => void;
  resetSubscription: () => void;
};

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  isPremium: false,
  planType: null,
  status: null,
  expiresAt: null,
  loading: false,

  setSubscription: (data) =>
    set({
      isPremium: data.isPremium,
      planType: data.planType ?? null,
      status: data.status ?? null,
      expiresAt: data.expiresAt ?? null,
    }),

  setLoading: (loading) => set({ loading }),

  resetSubscription: () =>
    set({
      isPremium: false,
      planType: null,
      status: null,
      expiresAt: null,
      loading: false,
    }),
}));