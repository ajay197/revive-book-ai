import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/contexts/CreditsContext";
import { Loader2 } from "lucide-react";
import { formatRemainingTime } from "@/lib/credits";

interface Transaction {
  id: string;
  type: string;
  source: string;
  call_id: string | null;
  amount: number;
  balance_before: number;
  balance_after: number;
  metadata: any;
  created_at: string;
}

const CreditHistory = () => {
  const { user } = useAuth();
  const { balance } = useCredits();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("credit_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200);
      setTransactions((data || []) as Transaction[]);
      setLoading(false);
    };
    fetch();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">Credit History</h1>
        <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted-foreground">
          Balance: <span className="font-semibold text-foreground">{balance.toFixed(2)} credits</span>
          {" · "}Remaining: <span className="font-semibold text-foreground">{formatRemainingTime(balance)}</span>
        </p>
      </div>

      <div className="rounded-xl border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Type</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Source</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">Amount</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">Before</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">After</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Details</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                    No transactions yet
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        tx.type === "debit" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
                      }`}>
                        {tx.type === "admin_adjustment" ? "credited" : tx.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{tx.source}</td>
                    <td className="px-5 py-3 text-right text-muted-foreground">
                      {tx.type === "debit" ? "-" : "+"}{tx.amount.toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-right text-muted-foreground">{tx.balance_before.toFixed(2)}</td>
                    <td className="px-5 py-3 text-right font-medium text-foreground">{tx.balance_after.toFixed(2)}</td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {tx.metadata?.reason || tx.metadata?.campaign_id || tx.call_id || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CreditHistory;
