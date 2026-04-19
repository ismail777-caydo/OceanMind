import { supabase } from "../lib/supabaseClient";
import { useSubscriptionStore } from "../store/subscriptionStore";

export async function loadUserSubscription(userId: string) {
  const { setSubscription, setLoading } = useSubscriptionStore.getState();

  try {
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("is_premium, plan_type, subscription_status, subscription_expires_at")
      .eq("id", userId)
      .single();

    if (error) throw error;

    const isPremium =
      !!data?.is_premium &&
      data?.subscription_status === "active" &&
      (!data?.subscription_expires_at ||
        new Date(data.subscription_expires_at).getTime() > Date.now());

    setSubscription({
      isPremium,
      planType: data?.plan_type ?? null,
      status: data?.subscription_status ?? null,
      expiresAt: data?.subscription_expires_at ?? null,
    });

    return isPremium;
  } catch (err) {
    console.error("loadUserSubscription error:", err);
    setSubscription({
      isPremium: false,
      planType: null,
      status: null,
      expiresAt: null,
    });
    return false;
  } finally {
    setLoading(false);
  }
}