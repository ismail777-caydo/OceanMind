import { supabase } from "../lib/supabaseClient";
import { useSubscriptionStore } from "../store/subscriptionStore";

export async function loadUserSubscription(userId: string) {
  const { setSubscription, setLoading } = useSubscriptionStore.getState();

  try {
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "is_premium, trial_ends_at, plan_type, subscription_status, subscription_expires_at"
      )
      .eq("id", userId)
      .single();

    if (error) throw error;

    const now = new Date();

    const hasTrial =
      !!data?.trial_ends_at &&
      new Date(data.trial_ends_at).getTime() > now.getTime();

    const hasPremium = !!data?.is_premium;

    const canAccessPremium = hasPremium || hasTrial;

    setSubscription({
      hasPremium,
      hasTrial,
      canAccessPremium,

      planType: data?.plan_type ?? null,
      status: data?.subscription_status ?? null,

      expiresAt: hasPremium
        ? data?.subscription_expires_at
        : data?.trial_ends_at ?? null,
    });

    return canAccessPremium;
  } catch (err) {
    console.error("loadUserSubscription error:", err);

    setSubscription({
      hasPremium: false,
      hasTrial: false,
      canAccessPremium: false,
      planType: null,
      status: null,
      expiresAt: null,
    });

    return false;
  } finally {
    setLoading(false);
  }
}