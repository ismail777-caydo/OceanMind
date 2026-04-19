import { supabase } from "../lib/supabaseClient";

export async function activatePremium(userId: string) {
  const { error } = await supabase
    .from("profiles")
    .update({
      is_premium: true,
      plan_type: "monthly",
      subscription_status: "active",
      subscription_expires_at: null,
    })
    .eq("id", userId);

  if (error) throw error;
}

export async function deactivatePremium(userId: string) {
  const { error } = await supabase
    .from("profiles")
    .update({
      is_premium: false,
      plan_type: null,
      subscription_status: null,
      subscription_expires_at: null,
    })
    .eq("id", userId);

  if (error) throw error;
}