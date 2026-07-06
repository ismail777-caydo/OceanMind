import { create } from "zustand";

type SubscriptionState = {
  hasPremium: boolean;
  hasTrial: boolean;
  canAccessPremium: boolean;

  planType: string | null;
  status: string | null;
  expiresAt: string | null;

  loading: boolean;

  setSubscription: (data: {
    hasPremium: boolean;
    hasTrial: boolean;
    canAccessPremium: boolean;

    planType?: string | null;
    status?: string | null;
    expiresAt?: string | null;
  }) => void;

  setLoading: (loading: boolean) => void;
  resetSubscription: () => void;
};

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  hasPremium: false,
  hasTrial: false,
  canAccessPremium: false,

  planType: null,
  status: null,
  expiresAt: null,

  loading: false,

  setSubscription: (data) =>
    set({
      hasPremium: data.hasPremium,
      hasTrial: data.hasTrial,
      canAccessPremium: data.canAccessPremium,

      planType: data.planType ?? null,
      status: data.status ?? null,
      expiresAt: data.expiresAt ?? null,
    }),

  setLoading: (loading) => set({ loading }),

  resetSubscription: () =>
    set({
      hasPremium: false,
      hasTrial: false,
      canAccessPremium: false,

      planType: null,
      status: null,
      expiresAt: null,

      loading: false,
    }),
}));