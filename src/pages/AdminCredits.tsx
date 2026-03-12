import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/contexts/CreditsContext";
import { Loader2, Plus, Minus, Search, History } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface UserCredit {
  user_id: string;
  balance_credits: number;
  display_name: string | null;
  email: string;
}

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  source: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  metadata: any;
  created_at: string;
}

interface PurchaseRequest {
  id: string;
  user_id: string;
  pack_name: string;
  total_credits: number;
  payment_status: string;
  request_status: string;
  created_at: string;
}

const AdminCredits = () => {
  const { user } = useAuth();
  const { isAdmin } = useCredits();
  const [users, setUsers] = useState<UserCredit[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Adjust dialog
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserCredit | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  // Transactions dialog
  const [txOpen, setTxOpen] = useState(false);
  const [txUser, setTxUser] = useState<string | null>(null);
  const [userTxs, setUserTxs] = useState<Transaction[]>([]);

  const fetchData = async () => {
    setLoading(true);

    // Fetch all user credits with profile info
    const { data: credits } = await supabase
      .from("user_credits")
      .select("user_id, balance_credits")
      .order("balance_credits", { ascending: false });

    // Fetch profiles to get display names
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name");

    const profileMap = new Map((profiles || []).map((p) => [p.user_id, p.display_name]));

    const usersData: UserCredit[] = (credits || []).map((c) => ({
      user_id: c.user_id,
      balance_credits: Number(c.balance_credits),
      display_name: profileMap.get(c.user_id) || null,
      email: profileMap.get(c.user_id) || c.user_id,
    }));

    setUsers(usersData);

    // Fetch recent transactions
    const { data: txs } = await supabase
      .from("credit_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    setTransactions((txs || []) as Transaction[]);

    // Fetch purchase requests
    const { data: requests } = await supabase
      .from("credit_purchase_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    setPurchaseRequests((requests || []) as PurchaseRequest[]);

    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin]);

  const handleAdjust = async () => {
    if (!user || !selectedUser || !adjustAmount) return;
    setAdjusting(true);

    const { data, error } = await supabase.rpc("admin_adjust_credits", {
      p_admin_id: user.id,
      p_user_id: selectedUser.user_id,
      p_amount: parseFloat(adjustAmount),
      p_reason: adjustReason,
    });

    if (error) {
      toast.error("Failed to adjust credits: " + error.message);
    } else {
      toast.success(`Credits adjusted successfully. New balance: ${(data as any)?.new_balance}`);
      setAdjustOpen(false);
      setAdjustAmount("");
      setAdjustReason("");
      fetchData();
    }
    setAdjusting(false);
  };

  const handleApproveRequest = async (request: PurchaseRequest) => {
    if (!user) return;
    // Add credits and mark request as approved
    const { error: adjustError } = await supabase.rpc("admin_adjust_credits", {
      p_admin_id: user.id,
      p_user_id: request.user_id,
      p_amount: request.total_credits,
      p_reason: `Approved purchase: ${request.pack_name}`,
    });

    if (adjustError) {
      toast.error("Failed to add credits");
      return;
    }

    await supabase
      .from("credit_purchase_requests")
      .update({ payment_status: "paid", request_status: "approved" })
      .eq("id", request.id);

    toast.success("Purchase request approved and credits added.");
    fetchData();
  };

  const viewUserTransactions = async (userId: string) => {
    setTxUser(userId);
    const { data } = await supabase
      .from("credit_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);
    setUserTxs((data || []) as Transaction[]);
    setTxOpen(true);
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-muted-foreground">You don't have admin access.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.user_id.includes(search)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Admin — Credit Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage user credits, review requests, and view transaction history</p>
      </div>

      {/* Pending Purchase Requests */}
      {purchaseRequests.filter((r) => r.request_status === "pending").length > 0 && (
        <div className="rounded-xl border border-warning/30 bg-card p-5 shadow-card">
          <h3 className="font-display text-sm font-semibold text-foreground">Pending Purchase Requests</h3>
          <div className="mt-3 space-y-2">
            {purchaseRequests
              .filter((r) => r.request_status === "pending")
              .map((r) => {
                const userName = users.find((u) => u.user_id === r.user_id)?.display_name || r.user_id.slice(0, 8);
                return (
                  <div key={r.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{userName}</p>
                      <p className="text-xs text-muted-foreground">{r.pack_name} — {r.total_credits} credits</p>
                      <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
                    </div>
                    <Button size="sm" className="bg-gradient-primary" onClick={() => handleApproveRequest(r)}>
                      Approve & Add Credits
                    </Button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="rounded-xl border bg-card shadow-card">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="font-display text-sm font-semibold text-foreground">User Balances</h3>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users…"
              className="h-8 w-48"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">User</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">Balance</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.user_id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground">{u.display_name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{u.user_id.slice(0, 12)}…</p>
                  </td>
                  <td className="px-5 py-3 text-right font-display font-semibold text-foreground">
                    {u.balance_credits.toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title="Adjust credits"
                        onClick={() => { setSelectedUser(u); setAdjustOpen(true); }}
                      >
                        <Plus className="h-3.5 w-3.5 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title="View transactions"
                        onClick={() => viewUserTransactions(u.user_id)}
                      >
                        <History className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-xl border bg-card shadow-card">
        <div className="border-b px-5 py-4">
          <h3 className="font-display text-sm font-semibold text-foreground">Recent Transactions (All Users)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Time</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">User</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Type</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">Amount</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">Balance After</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 20).map((tx) => {
                const userName = users.find((u) => u.user_id === tx.user_id)?.display_name || tx.user_id.slice(0, 8);
                return (
                  <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleString()}</td>
                    <td className="px-5 py-3 text-muted-foreground">{userName}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        tx.type === "debit" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-muted-foreground">{tx.amount.toFixed(2)}</td>
                    <td className="px-5 py-3 text-right font-medium text-foreground">{tx.balance_after.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Dialog */}
      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Credits — {selectedUser?.display_name || "User"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Current balance: <span className="font-semibold text-foreground">{selectedUser?.balance_credits.toFixed(2)}</span>
            </p>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Amount (positive to add, negative to deduct)</label>
              <Input
                type="number"
                step="0.01"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                placeholder="e.g. 500 or -100"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Reason / Note</label>
              <Input
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="e.g. Payment received, correction"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustOpen(false)}>Cancel</Button>
            <Button className="bg-gradient-primary" onClick={handleAdjust} disabled={adjusting || !adjustAmount}>
              {adjusting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Transactions Dialog */}
      <Dialog open={txOpen} onOpenChange={setTxOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction History</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Time</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Type</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Source</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Amount</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Before</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">After</th>
                </tr>
              </thead>
              <tbody>
                {userTxs.map((tx) => (
                  <tr key={tx.id} className="border-b last:border-0">
                    <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        tx.type === "debit" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{tx.source}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{tx.amount.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{tx.balance_before.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right font-medium text-foreground">{tx.balance_after.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCredits;
