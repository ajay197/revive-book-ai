import { useState, useEffect } from "react";
import { Phone, Loader2, CheckCircle, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/contexts/CreditsContext";

interface PurchasedNumber {
  phone_number_id: string;
  phone_number: string;
  purchased_at: string;
  expires_at: string;
  status: string;
  credits_deducted: number;
  campaign_name: string | null;
  agent_name: string | null;
}

const CREDIT_COST = 2;

const PhoneNumbers = () => {
  const { user } = useAuth();
  const { balance } = useCredits();
  const [purchased, setPurchased] = useState<PurchasedNumber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from("phone_number_purchases")
      .select("phone_number_id, phone_number, purchased_at, expires_at, status, credits_deducted, campaign_name, agent_name")
      .eq("user_id", user.id)
      .order("purchased_at", { ascending: false })
      .then(({ data }) => {
        setPurchased((data || []) as PurchasedNumber[]);
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeNumbers = purchased.filter((p) => p.status === "active");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Phone Numbers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Phone numbers are automatically registered when you create a campaign. Each number costs{" "}
          <span className="font-semibold text-foreground">2 credits/month</span>.
        </p>
      </div>

      {/* Balance info */}
      <div className="rounded-xl border bg-card p-4 shadow-card">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Your balance: <span className="font-semibold text-foreground">{balance.toFixed(2)} credits</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Monthly cost:{" "}
            <span className="font-semibold text-foreground">
              {(activeNumbers.length * CREDIT_COST).toFixed(2)} credits/mo
            </span>
          </div>
        </div>
      </div>

      {purchased.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center shadow-card">
          <Phone className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 font-display text-lg font-semibold text-foreground">No phone numbers yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a campaign with an AI agent to automatically register the agent's phone number.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {purchased.map((phone) => (
            <div
              key={phone.phone_number_id + phone.purchased_at}
              className="rounded-xl border border-primary/30 bg-primary/5 p-5 shadow-card"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-lg font-bold text-foreground">
                    {phone.phone_number}
                  </p>
                  {phone.agent_name && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Agent: <span className="font-medium text-foreground">{phone.agent_name}</span>
                    </p>
                  )}
                  {phone.campaign_name && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Campaign: <span className="font-medium text-foreground">{phone.campaign_name}</span>
                    </p>
                  )}
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                  <CheckCircle className="h-3.5 w-3.5" />
                  {phone.status === "active" ? "Active" : phone.status} — {phone.credits_deducted} credits/mo
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(phone.purchased_at).toLocaleDateString()}
                </div>
              </div>

              {phone.expires_at && (
                <p className="mt-1 text-right text-[10px] text-muted-foreground">
                  Renews: {new Date(phone.expires_at).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhoneNumbers;
