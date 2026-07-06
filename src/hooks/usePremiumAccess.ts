import { useSubscriptionStore } from "../store/subscriptionStore";

export function usePremiumAccess() {
  const {
    hasPremium,
    hasTrial,
    canAccessPremium,
    loading,
    planType,
    status,
    expiresAt,
  } = useSubscriptionStore();

  return {
    hasPremium,
    hasTrial,
    canAccessPremium,
    loading,
    planType,
    status,
    expiresAt,
  };
}