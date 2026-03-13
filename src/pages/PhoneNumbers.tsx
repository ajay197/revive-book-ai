import { useState, useEffect, useRef } from "react";
import { Phone, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/contexts/CreditsContext";
import { toast } from "sonner";

interface RetellPhone {
  phone_number: string;
  phone_number_id: string;
  nickname?: string;
  phone_number_pretty?: string;
  area_code?: number;
  inbound_agent_id?: string;
  outbound_agent_id?: string;
}

interface PurchasedNumber {
  phone_number_id: string;
  phone_number: string;
  purchased_at: string;
  expires_at: string;
  status: string;
  credits_deducted: number;
}

const CREDIT_COST = 2;

const PhoneNumbers = () => {
  const { user } = useAuth();
  const { balance, refetch } = useCredits();
  const [phones, setPhones] = useState<RetellPhone[]>([]);
  const [purchased, setPurchased] = useState<PurchasedNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoProcessing, setAutoProcessing] = useState(false);
  const processedRef = useRef(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const apiKey = localStorage.getItem("retell_api_key");

    const [phonesRes, purchasedRes] = await Promise.all([
      apiKey
        ? supabase.functions.invoke("retell-agents", {
            body: { apiKey, mode: "phone-numbers" },
          })
        : Promise.resolve({ data: null, error: "No API key" }),
      supabase
        .from("phone_number_purchases")
        .select("phone_number_id, phone_number, purchased_at, expires_at, status, credits_deducted")
        .eq("user_id", user.id),
    ]);

    const fetchedPhones: RetellPhone[] =
      phonesRes.data?.phoneNumbers && Array.isArray(phonesRes.data.phoneNumbers)
        ? phonesRes.data.phoneNumbers
        : [];

    const fetchedPurchased: PurchasedNumber[] = (purchasedRes.data || []) as PurchasedNumber[];

    setPhones(fetchedPhones);
    setPurchased(fetchedPurchased);
    setLoading(false);

    // Auto-purchase any new phone numbers not yet in DB
    if (fetchedPhones.length > 0 && !processedRef.current) {
      processedRef.current = true;
      await autoPurchaseNewNumbers(fetchedPhones, fetchedPurchased);
    }
  };

  const autoPurchaseNewNumbers = async (
    retellPhones: RetellPhone[],
    alreadyPurchased: PurchasedNumber[]
  ) => {
    if (!user) return;

    const purchasedIds = new Set(
      alreadyPurchased
        .filter((p) => p.status === "active")
        .map((p) => p.phone_number_id)
    );

    const newPhones = retellPhones.filter((p) => !purchasedIds.has(p.phone_number_id));
    if (newPhones.length === 0) return;

    const totalCost = newPhones.length * CREDIT_COST;
    if (balance < totalCost) {
      toast.error(
        `Insufficient credits to register ${newPhones.length} new phone number(s). Need ${totalCost} credits, you have ${balance.toFixed(2)}.`
      );
      return;
    }

    setAutoProcessing(true);

    for (const phone of newPhones) {
      // Deduct credits
      const { data: deductResult, error: deductError } = await supabase.rpc(
        "admin_adjust_credits",
        {
          p_admin_id: user.id,
          p_user_id: user.id,
          p_amount: -CREDIT_COST,
          p_reason: `Phone number purchase: ${phone.phone_number}`,
        }
      );

      if (deductError || (deductResult as any)?.status === "unauthorized") {
        // Fallback for non-admin users
        const { error: fnError } = await supabase.functions.invoke("deduct-credits", {
          body: {
            userId: user.id,
            callId: `phone-purchase-${phone.phone_number_id}-${Date.now()}`,
            durationSeconds: CREDIT_COST * 150,
            campaignId: null,
          },
        });

        if (fnError) {
          toast.error(`Failed to deduct credits for ${phone.phone_number}`);
          continue;
        }
      }

      // Record purchase
      const { error: insertError } = await supabase
        .from("phone_number_purchases")
        .insert({
          user_id: user.id,
          phone_number: phone.phone_number,
          phone_number_id: phone.phone_number_id,
          credits_deducted: CREDIT_COST,
        });

      if (insertError) {
        // Might be a duplicate — skip silently
        console.warn("Insert error (may be duplicate):", insertError.message);
      }
    }

    toast.success(
      `${newPhones.length} phone number(s) registered. ${newPhones.length * CREDIT_COST} credits deducted.`
    );

    // Refresh data
    await refetch();
    const { data: refreshed } = await supabase
      .from("phone_number_purchases")
      .select("phone_number_id, phone_number, purchased_at, expires_at, status, credits_deducted")
      .eq("user_id", user!.id);
    setPurchased((refreshed || []) as PurchasedNumber[]);

    setAutoProcessing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Phone Numbers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Phone numbers from Retell AI are automatically registered. Each number costs{" "}
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
            Cost per number: <span className="font-semibold text-foreground">2.00 credits/month</span>
          </div>
        </div>
      </div>

      {autoProcessing && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <p className="text-sm text-foreground">Registering new phone numbers and deducting credits…</p>
        </div>
      )}

      {phones.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center shadow-card">
          <Phone className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 font-display text-lg font-semibold text-foreground">No phone numbers found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Make sure your Retell AI API key is connected in Integrations and you have phone numbers in your Retell account.
          </p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{phones.length}</span> phone number(s) from Retell AI
              </span>
              <span className="text-sm text-muted-foreground">
                Monthly cost:{" "}
                <span className="font-semibold text-foreground">
                  {(purchased.filter((p) => p.status === "active").length * CREDIT_COST).toFixed(2)} credits
                </span>
              </span>
            </div>
          </div>

          {/* Phone number grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {phones.map((phone) => {
              const record = purchased.find(
                (p) => p.phone_number_id === phone.phone_number_id && p.status === "active"
              );

              return (
                <div
                  key={phone.phone_number_id}
                  className="rounded-xl border border-primary/30 bg-primary/5 p-5 shadow-card"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-display text-lg font-bold text-foreground">
                        {phone.phone_number_pretty || phone.phone_number}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{phone.phone_number}</p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                  </div>

                  {phone.outbound_agent_id && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Outbound Agent:{" "}
                      <span className="font-medium text-foreground">
                        {phone.outbound_agent_id.slice(0, 12)}…
                      </span>
                    </p>
                  )}
                  {phone.inbound_agent_id && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Inbound Agent:{" "}
                      <span className="font-medium text-foreground">
                        {phone.inbound_agent_id.slice(0, 12)}…
                      </span>
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                      <CheckCircle className="h-3.5 w-3.5" /> Active — 2 credits/mo
                    </div>
                    {record && (
                      <p className="text-[10px] text-muted-foreground">
                        Expires: {new Date(record.expires_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default PhoneNumbers;
