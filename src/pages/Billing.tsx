import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCredits } from "@/contexts/CreditsContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CREDIT_PACKS, formatRemainingTime } from "@/lib/credits";
import { CreditCard, Clock, CheckCircle, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

const Billing = () => {
  const { balance } = useCredits();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState<string | null>(null);

  const handleRequestPack = async (pack: typeof CREDIT_PACKS[number]) => {
    if (!user) return;
    setSubmitting(pack.name);
    const { error } = await supabase.from("credit_purchase_requests").insert({
      user_id: user.id,
      pack_name: pack.name,
      base_credits: pack.baseCredits,
      bonus_credits: pack.bonusCredits,
      total_credits: pack.totalCredits,
    });

    if (error) {
      toast.error("Failed to submit request");
    } else {
      toast.success("Credit purchase request submitted! Your admin will process it shortly.");
    }
    setSubmitting(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your calling credits</p>
      </div>

      {/* Current Balance */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Current Balance</p>
            <p className="font-display text-3xl font-bold text-foreground">{balance.toFixed(2)} <span className="text-lg text-muted-foreground">credits</span></p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Estimated remaining call time: <span className="font-medium text-foreground">{formatRemainingTime(balance)}</span></span>
        </div>
      </div>

      {/* Credit Packs */}
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground">Credit Packs</h2>
        <p className="mt-1 text-sm text-muted-foreground">Select a pack to request credits. Admin will process your payment and add credits to your account.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {CREDIT_PACKS.map((pack) => (
          <div
            key={pack.name}
            className={`relative rounded-xl border p-6 shadow-card transition-shadow hover:shadow-elevated ${
              pack.popular ? "border-primary ring-1 ring-primary/20" : "bg-card"
            }`}
          >
            {pack.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                Most Popular
              </div>
            )}
            <div className="text-center">
              <p className="font-display text-2xl font-bold text-foreground">{pack.baseCredits.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">credits</p>
              {"bonusLabel" in pack && pack.bonusLabel && (
                <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                  <Sparkles className="h-3 w-3" /> {pack.bonusLabel}
                </div>
              )}
              <p className="mt-3 text-sm text-muted-foreground">
                Total: <span className="font-semibold text-foreground">{pack.totalCredits.toLocaleString()}</span> credits
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                ≈ {formatRemainingTime(pack.totalCredits)} of calling
              </p>
            </div>
            <Button
              className="mt-4 w-full bg-gradient-primary"
              onClick={() => handleRequestPack(pack)}
              disabled={submitting === pack.name}
            >
              {submitting === pack.name ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Request Credits
            </Button>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h3 className="font-display text-sm font-semibold text-foreground">How Credits Work</h3>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            1 credit = 2.5 minutes of AI calling
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            Credits are deducted after each completed call based on actual duration
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            Failed or unanswered calls are not charged
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            Select a pack above and your admin will process your request
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Billing;
