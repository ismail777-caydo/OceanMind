import { useSubscriptionStore } from "../store/subscriptionStore";

export function usePremiumAccess() {
  const { isPremium, loading, planType, status, expiresAt } = useSubscriptionStore();

  return {
    isPremium,
    loading,
    planType,
    status,
    expiresAt,
  };
}