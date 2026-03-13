import { useState, useEffect } from "react";
import { Phone, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/contexts/CreditsContext";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
}

const CREDIT_COST = 2;

const PhoneNumbers = () => {
  const { user } = useAuth();
  const { balance, refetch } = useCredits();
  const [phones, setPhones] = useState<RetellPhone[]>([]);
  const [purchased, setPurchased] = useState<PurchasedNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmPhone, setConfirmPhone] = useState<RetellPhone | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
        .select("phone_number_id, phone_number, purchased_at, expires_at, status")
        .eq("user_id", user.id),
    ]);

    if (phonesRes.data?.phoneNumbers) {
      setPhones(Array.isArray(phonesRes.data.phoneNumbers) ? phonesRes.data.phoneNumbers : []);
    }

    if (purchasedRes.data) {
      setPurchased(purchasedRes.data);
    }

    setLoading(false);
  };

  const isPurchased = (phoneId: string) =>
    purchased.some((p) => p.phone_number_id === phoneId && p.status === "active");

  const handleConfirmPurchase = async () => {
    if (!confirmPhone || !user) return;

    if (balance < CREDIT_COST) {
      toast.error("Insufficient credits. You need at least 2 credits to purchase a phone number.");
      setConfirmPhone(null);
      return;
    }

    setSubmitting(true);

    // Deduct credits via admin_adjust (negative amount)
    const { data: deductResult, error: deductError } = await supabase.rpc("admin_adjust_credits", {
      p_admin_id: user.id,
      p_user_id: user.id,
      p_amount: -CREDIT_COST,
      p_reason: `Phone number purchase: ${confirmPhone.phone_number}`,
    });

    // If user is not admin, use direct insert approach
    if (deductError || (deductResult as any)?.status === "unauthorized") {
      // Direct update for non-admin users - use edge function
      const { error: fnError } = await supabase.functions.invoke("deduct-credits", {
        body: {
          userId: user.id,
          callId: `phone-purchase-${confirmPhone.phone_number_id}-${Date.now()}`,
          durationSeconds: CREDIT_COST * 150, // Convert credits back to equivalent seconds
          campaignId: null,
        },
      });

      if (fnError) {
        toast.error("Failed to deduct credits");
        setSubmitting(false);
        setConfirmPhone(null);
        return;
      }
    }

    // Record the purchase
    const { error: insertError } = await supabase.from("phone_number_purchases").insert({
      user_id: user.id,
      phone_number: confirmPhone.phone_number,
      phone_number_id: confirmPhone.phone_number_id,
      credits_deducted: CREDIT_COST,
    });

    if (insertError) {
      toast.error("Failed to record purchase: " + insertError.message);
    } else {
      toast.success(`Phone number ${confirmPhone.phone_number} purchased! 2 credits deducted.`);
      await Promise.all([refetch(), fetchData()]);
    }

    setSubmitting(false);
    setConfirmPhone(null);
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
          Select phone numbers from Retell AI. Each number costs <span className="font-semibold text-foreground">2 credits/month</span>.
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

      {phones.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center shadow-card">
          <Phone className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 font-display text-lg font-semibold text-foreground">No phone numbers found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Make sure your Retell AI API key is connected in Integrations and you have phone numbers in your Retell account.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {phones.map((phone) => {
            const alreadyPurchased = isPurchased(phone.phone_number_id);
            const purchaseRecord = purchased.find((p) => p.phone_number_id === phone.phone_number_id);

            return (
              <div
                key={phone.phone_number_id}
                className={`rounded-xl border p-5 shadow-card transition-shadow hover:shadow-elevated ${
                  alreadyPurchased ? "border-primary/30 bg-primary/5" : "bg-card"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display text-lg font-bold text-foreground">
                      {phone.phone_number_pretty || phone.phone_number}
                    </p>
                    {phone.nickname && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{phone.nickname}</p>
                    )}
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                </div>

                {phone.inbound_agent_id && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Inbound Agent: <span className="font-medium text-foreground">{phone.inbound_agent_id.slice(0, 8)}…</span>
                  </p>
                )}
                {phone.outbound_agent_id && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Outbound Agent: <span className="font-medium text-foreground">{phone.outbound_agent_id.slice(0, 8)}…</span>
                  </p>
                )}

                {alreadyPurchased ? (
                  <div className="mt-4">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                      <CheckCircle className="h-3.5 w-3.5" /> Active
                    </div>
                    {purchaseRecord && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Expires: {new Date(purchaseRecord.expires_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <Button
                    className="mt-4 w-full bg-gradient-primary"
                    size="sm"
                    onClick={() => setConfirmPhone(phone)}
                    disabled={balance < CREDIT_COST}
                  >
                    {balance < CREDIT_COST ? (
                      <>
                        <AlertTriangle className="mr-1.5 h-3.5 w-3.5" /> Insufficient Credits
                      </>
                    ) : (
                      <>
                        <Phone className="mr-1.5 h-3.5 w-3.5" /> Select — 2 Credits
                      </>
                    )}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmPhone} onOpenChange={(v) => !v && setConfirmPhone(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Phone Number Purchase</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  You are about to select <span className="font-semibold text-foreground">{confirmPhone?.phone_number_pretty || confirmPhone?.phone_number}</span>.
                </p>
                <p>
                  This will deduct <span className="font-semibold text-foreground">2.00 credits</span> from your balance for 30 days of usage.
                </p>
                <p className="text-xs">
                  Current balance: <span className="font-semibold text-foreground">{balance.toFixed(2)} credits</span> →{" "}
                  <span className="font-semibold text-foreground">{(balance - CREDIT_COST).toFixed(2)} credits</span>
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmPurchase}
              disabled={submitting}
              className="bg-gradient-primary"
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Confirm & Deduct 2 Credits
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PhoneNumbers;
