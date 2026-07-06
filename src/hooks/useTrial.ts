import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../auth/AuthContext";

export function useTrial() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [remainingDays, setRemainingDays] = useState(0);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    async function loadTrial() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("is_premium, trial_ends_at")
          .eq("id", user!.id)
          .single();

        if (error) throw error;

        // إذا المستخدم Premium ما نبينوش Trial
        if (data.is_premium) {
          setRemainingDays(0);
          setExpired(false);
          return;
        }

        if (!data.trial_ends_at) {
          setRemainingDays(0);
          setExpired(true);
          return;
        }

        const diff =
          new Date(data.trial_ends_at).getTime() - Date.now();

        const days = Math.ceil(
          diff / (1000 * 60 * 60 * 24)
        );

        setRemainingDays(Math.max(days, 0));
        setExpired(days <= 0);
      } catch (e) {
        console.log("Trial error:", e);
      } finally {
        setLoading(false);
      }
    }

    loadTrial();
  }, [user]);

 return {
  loading,
  remainingDays,
  expired,
  inTrial: remainingDays > 0 && !expired,
};
}