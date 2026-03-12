import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CreditsContextType {
  balance: number;
  loading: boolean;
  isAdmin: boolean;
  refetch: () => Promise<void>;
}

const CreditsContext = createContext<CreditsContextType>({
  balance: 0,
  loading: true,
  isAdmin: false,
  refetch: async () => {},
});

export const useCredits = () => useContext(CreditsContext);

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchCredits = useCallback(async () => {
    if (!user) {
      setBalance(0);
      setLoading(false);
      return;
    }

    const [creditsRes, roleRes] = await Promise.all([
      supabase
        .from("user_credits")
        .select("balance_credits")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle(),
    ]);

    if (creditsRes.data) {
      setBalance(Number(creditsRes.data.balance_credits));
    } else {
      // Create record if not exists (for users created before trigger)
      await supabase.from("user_credits").insert({ user_id: user.id, balance_credits: 0 });
      setBalance(0);
    }

    setIsAdmin(!!roleRes.data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  // Realtime subscription for balance updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("user-credits-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "user_credits",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new === "object" && "balance_credits" in payload.new) {
            setBalance(Number((payload.new as any).balance_credits));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <CreditsContext.Provider value={{ balance, loading, isAdmin, refetch: fetchCredits }}>
      {children}
    </CreditsContext.Provider>
  );
}
