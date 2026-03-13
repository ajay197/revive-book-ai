import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/contexts/CreditsContext";
import {
  Loader2, Plus, Search, History, Trash2, Users, CreditCard, Phone,
  Shield, Mail, Calendar, Clock, ChevronDown, ChevronUp, UserCog, Save, X,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface EnrichedUser {
  id: string;
  email: string;
  display_name: string | null;
  company: string | null;
  avatar_url: string | null;
  balance_credits: number;
  roles: string[];
  phone_numbers: { phone_number: string; phone_number_id?: string; status: string; purchased_at: string; expires_at: string; credits_deducted?: number }[];
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
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
  const [users, setUsers] = useState<EnrichedUser[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  // Adjust dialog
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<EnrichedUser | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<EnrichedUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Transactions dialog
  const [txOpen, setTxOpen] = useState(false);
  const [userTxs, setUserTxs] = useState<Transaction[]>([]);
  const [txUserName, setTxUserName] = useState("");

  // User detail editor
  const [detailUserId, setDetailUserId] = useState<string>("");
  const [editName, setEditName] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [editIsModerator, setEditIsModerator] = useState(false);
  const [saving, setSaving] = useState(false);

  const detailUser = users.find((u) => u.id === detailUserId) || null;

  // Sync form fields when detailUser changes
  useEffect(() => {
    if (detailUser) {
      setEditName(detailUser.display_name || "");
      setEditCompany(detailUser.company || "");
      setEditEmail(detailUser.email);
      setEditIsAdmin(detailUser.roles.includes("admin"));
      setEditIsModerator(detailUser.roles.includes("moderator"));
    }
  }, [detailUserId, detailUser?.display_name, detailUser?.company, detailUser?.email, detailUser?.roles?.join(",")]);

  const fetchData = async () => {
    setLoading(true);

    const [usersRes, txsRes, requestsRes] = await Promise.all([
      supabase.functions.invoke("admin-users", { body: { action: "list" } }),
      supabase
        .from("credit_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("credit_purchase_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    if (usersRes.data?.users) {
      setUsers(usersRes.data.users);
    }
    setTransactions((txsRes.data || []) as Transaction[]);
    setPurchaseRequests((requestsRes.data || []) as PurchaseRequest[]);
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
      p_user_id: selectedUser.id,
      p_amount: parseFloat(adjustAmount),
      p_reason: adjustReason,
    });

    if (error) {
      toast.error("Failed to adjust credits: " + error.message);
    } else {
      toast.success(`Credits adjusted. New balance: ${(data as any)?.new_balance}`);
      setAdjustOpen(false);
      setAdjustAmount("");
      setAdjustReason("");
      fetchData();
    }
    setAdjusting(false);
  };

  const handleApproveRequest = async (request: PurchaseRequest) => {
    if (!user) return;
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

  const handleDeleteUser = async () => {
    if (!deleteUser) return;
    setDeleting(true);

    const { data, error } = await supabase.functions.invoke("admin-users", {
      body: { action: "delete", userId: deleteUser.id },
    });

    if (error || data?.error) {
      toast.error("Failed to delete user: " + (data?.error || error?.message));
    } else {
      toast.success(`User ${deleteUser.email} deleted.`);
      if (detailUserId === deleteUser.id) setDetailUserId("");
      fetchData();
    }
    setDeleting(false);
    setDeleteOpen(false);
    setDeleteUser(null);
  };

  const viewUserTransactions = async (userId: string, name: string) => {
    setTxUserName(name);
    const { data } = await supabase
      .from("credit_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);
    setUserTxs((data || []) as Transaction[]);
    setTxOpen(true);
  };

  const handleSaveUserDetails = async () => {
    if (!detailUser) return;
    setSaving(true);

    try {
      // Update profile
      const profileChanged =
        editName !== (detailUser.display_name || "") ||
        editCompany !== (detailUser.company || "");

      if (profileChanged) {
        const { data, error } = await supabase.functions.invoke("admin-users", {
          body: {
            action: "update_profile",
            userId: detailUser.id,
            display_name: editName,
            company: editCompany,
          },
        });
        if (error || data?.error) throw new Error(data?.error || error?.message);
      }

      // Update email
      if (editEmail !== detailUser.email) {
        const { data, error } = await supabase.functions.invoke("admin-users", {
          body: {
            action: "update_email",
            userId: detailUser.id,
            email: editEmail,
          },
        });
        if (error || data?.error) throw new Error(data?.error || error?.message);
      }

      // Update admin role
      const wasAdmin = detailUser.roles.includes("admin");
      if (editIsAdmin !== wasAdmin) {
        const { data, error } = await supabase.functions.invoke("admin-users", {
          body: {
            action: "update_role",
            userId: detailUser.id,
            role: "admin",
            remove: !editIsAdmin,
          },
        });
        if (error || data?.error) throw new Error(data?.error || error?.message);
      }

      // Update moderator role
      const wasMod = detailUser.roles.includes("moderator");
      if (editIsModerator !== wasMod) {
        const { data, error } = await supabase.functions.invoke("admin-users", {
          body: {
            action: "update_role",
            userId: detailUser.id,
            role: "moderator",
            remove: !editIsModerator,
          },
        });
        if (error || data?.error) throw new Error(data?.error || error?.message);
      }

      toast.success("User details updated successfully");
      fetchData();
    } catch (err: any) {
      toast.error("Failed to save: " + err.message);
    }
    setSaving(false);
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
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.company?.toLowerCase().includes(search.toLowerCase()) ||
      u.id.includes(search)
  );

  const totalCreditsInSystem = users.reduce((sum, u) => sum + u.balance_credits, 0);
  const activeUsers = users.filter((u) => u.last_sign_in_at).length;
  const pendingRequests = purchaseRequests.filter((r) => r.request_status === "pending").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Admin Panel</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage all accounts, credits, and requests</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Users</p>
              <p className="mt-2 font-display text-2xl font-bold text-foreground">{users.length}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Active Users</p>
              <p className="mt-2 font-display text-2xl font-bold text-foreground">{activeUsers}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Credits in System</p>
              <p className="mt-2 font-display text-2xl font-bold text-foreground">{totalCreditsInSystem.toFixed(2)}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Pending Requests</p>
              <p className="mt-2 font-display text-2xl font-bold text-foreground">{pendingRequests}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
              <Shield className="h-4 w-4 text-destructive" />
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="user-details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="user-details">
            <UserCog className="mr-1.5 h-3.5 w-3.5" /> User Details
          </TabsTrigger>
          <TabsTrigger value="accounts">
            <Users className="mr-1.5 h-3.5 w-3.5" /> Accounts ({users.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            <CreditCard className="mr-1.5 h-3.5 w-3.5" /> Requests ({pendingRequests})
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <History className="mr-1.5 h-3.5 w-3.5" /> Transactions
          </TabsTrigger>
        </TabsList>

        {/* User Details Tab */}
        <TabsContent value="user-details">
          <div className="rounded-xl border bg-card shadow-card">
            <div className="border-b px-5 py-4">
              <h3 className="font-display text-sm font-semibold text-foreground">Select a User to View & Edit</h3>
              <div className="mt-3">
                <Select value={detailUserId} onValueChange={setDetailUserId}>
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue placeholder="Choose a user…" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.display_name || u.email} — {u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {detailUser ? (
              <div className="p-5 space-y-6">
                {/* Read-only info */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-[10px] font-medium uppercase text-muted-foreground">User ID</p>
                    <p className="mt-1 text-xs font-mono text-foreground break-all">{detailUser.id}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-[10px] font-medium uppercase text-muted-foreground">Signed Up</p>
                    <p className="mt-1 text-xs text-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(detailUser.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-[10px] font-medium uppercase text-muted-foreground">Last Sign In</p>
                    <p className="mt-1 text-xs text-foreground">
                      {detailUser.last_sign_in_at
                        ? new Date(detailUser.last_sign_in_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                        : "Never"}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-[10px] font-medium uppercase text-muted-foreground">Email Verified</p>
                    <p className="mt-1 text-xs text-foreground">{detailUser.email_confirmed_at ? "✅ Yes" : "❌ No"}</p>
                  </div>
                </div>

                {/* Balance */}
                <div className="flex items-center gap-4 rounded-lg border bg-primary/5 p-4">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground">Credit Balance</p>
                    <p className="font-display text-2xl font-bold text-foreground">{detailUser.balance_credits.toFixed(2)}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setSelectedUser(detailUser); setAdjustOpen(true); }}
                  >
                    <Plus className="mr-1 h-3 w-3" /> Adjust Credits
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => viewUserTransactions(detailUser.id, detailUser.display_name || detailUser.email)}
                  >
                    <History className="mr-1 h-3 w-3" /> Transactions
                  </Button>
                </div>

                <Separator />

                {/* Editable fields */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground">Edit User Details</h4>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-name" className="text-xs">Display Name</Label>
                      <Input
                        id="edit-name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Full name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-email" className="text-xs">Email Address</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="user@email.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-company" className="text-xs">Company</Label>
                      <Input
                        id="edit-company"
                        value={editCompany}
                        onChange={(e) => setEditCompany(e.target.value)}
                        placeholder="Company name"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Roles */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">Roles</h4>
                    <div className="flex flex-wrap gap-6">
                      <div className="flex items-center gap-2">
                        <Switch
                          id="role-admin"
                          checked={editIsAdmin}
                          onCheckedChange={setEditIsAdmin}
                        />
                        <Label htmlFor="role-admin" className="text-sm">Admin</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="role-moderator"
                          checked={editIsModerator}
                          onCheckedChange={setEditIsModerator}
                        />
                        <Label htmlFor="role-moderator" className="text-sm">Moderator</Label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Phone Numbers */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-foreground">Phone Numbers</h4>
                      {detailUser.phone_numbers.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {detailUser.phone_numbers.filter(p => p.status === "active").length} active / {detailUser.phone_numbers.length} total
                        </span>
                      )}
                    </div>
                    {detailUser.phone_numbers.length > 0 ? (
                      <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-muted/30">
                              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Phone Number</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Status</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Purchased</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Expires</th>
                              <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Credits</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detailUser.phone_numbers.map((p, i) => (
                              <tr key={i} className="border-b last:border-0 hover:bg-muted/20">
                                <td className="px-3 py-2.5">
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="font-medium text-foreground">{p.phone_number}</span>
                                  </div>
                                </td>
                                <td className="px-3 py-2.5">
                                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                    p.status === "active"
                                      ? "bg-success/10 text-success"
                                      : p.status === "expired"
                                      ? "bg-destructive/10 text-destructive"
                                      : "bg-muted text-muted-foreground"
                                  }`}>
                                    {p.status}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5 text-xs text-muted-foreground">
                                  {new Date(p.purchased_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </td>
                                <td className="px-3 py-2.5 text-xs text-muted-foreground">
                                  {new Date(p.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </td>
                                <td className="px-3 py-2.5 text-right text-xs font-medium text-foreground">
                                  {(p.credits_deducted ?? 2).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-muted/20">
                              <td colSpan={4} className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">
                                Total Monthly Cost
                              </td>
                              <td className="px-3 py-2 text-right text-xs font-semibold text-foreground">
                                {detailUser.phone_numbers
                                  .filter(p => p.status === "active")
                                  .reduce((sum, p) => sum + (p.credits_deducted ?? 2), 0)
                                  .toFixed(2)} credits/mo
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No phone numbers purchased</p>
                    )}
                  </div>

                  {/* Save */}
                  <div className="flex gap-3 pt-2">
                    <Button className="bg-gradient-primary" onClick={handleSaveUserDetails} disabled={saving}>
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Changes
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => { setDeleteUser(detailUser); setDeleteOpen(true); }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete User
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-5 py-16 text-center">
                <UserCog className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <p className="mt-3 text-sm text-muted-foreground">Select a user from the dropdown above to view and edit their details.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts">
          <div className="rounded-xl border bg-card shadow-card">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h3 className="font-display text-sm font-semibold text-foreground">All Users</h3>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email, name, company…"
                  className="h-8 w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="divide-y">
              {filteredUsers.map((u) => {
                const isExpanded = expandedUser === u.id;
                return (
                  <div key={u.id}>
                    <div className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
                      {/* Avatar */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted font-display text-sm font-semibold text-muted-foreground">
                        {(u.display_name || u.email || "U").charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium text-foreground">{u.display_name || "—"}</p>
                          {u.roles.map((r) => (
                            <span
                              key={r}
                              className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" /> {u.email}
                          </span>
                          {u.company && (
                            <span className="text-xs text-muted-foreground">• {u.company}</span>
                          )}
                        </div>
                      </div>

                      {/* Balance */}
                      <div className="text-right shrink-0">
                        <p className="font-display text-lg font-bold text-foreground">{u.balance_credits.toFixed(2)}</p>
                        <p className="text-[10px] text-muted-foreground">credits</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Adjust credits"
                          onClick={() => { setSelectedUser(u); setAdjustOpen(true); }}
                        >
                          <Plus className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="View transactions"
                          onClick={() => viewUserTransactions(u.id, u.display_name || u.email)}
                        >
                          <History className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Delete user"
                          onClick={() => { setDeleteUser(u); setDeleteOpen(true); }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setExpandedUser(isExpanded ? null : u.id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t bg-muted/10 px-5 py-4 pl-[4.5rem]">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <div>
                            <p className="text-[10px] font-medium uppercase text-muted-foreground">User ID</p>
                            <p className="mt-0.5 text-xs font-mono text-foreground">{u.id}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-medium uppercase text-muted-foreground">Signed Up</p>
                            <p className="mt-0.5 text-xs text-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(u.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-medium uppercase text-muted-foreground">Last Sign In</p>
                            <p className="mt-0.5 text-xs text-foreground">
                              {u.last_sign_in_at
                                ? new Date(u.last_sign_in_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                                : "Never"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-medium uppercase text-muted-foreground">Email Verified</p>
                            <p className="mt-0.5 text-xs text-foreground">
                              {u.email_confirmed_at ? "✅ Yes" : "❌ No"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-medium uppercase text-muted-foreground">Roles</p>
                            <p className="mt-0.5 text-xs text-foreground">
                              {u.roles.length > 0 ? u.roles.join(", ") : "user (default)"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-medium uppercase text-muted-foreground">Phone Numbers</p>
                            {u.phone_numbers.length > 0 ? (
                              <div className="mt-0.5 space-y-1">
                                {u.phone_numbers.map((p, i) => (
                                  <p key={i} className="text-xs text-foreground flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {p.phone_number}
                                    <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                                      p.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                                    }`}>
                                      {p.status}
                                    </span>
                                  </p>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-0.5 text-xs text-muted-foreground">None</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredUsers.length === 0 && (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No users found matching your search.
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Purchase Requests Tab */}
        <TabsContent value="requests">
          <div className="rounded-xl border bg-card shadow-card">
            <div className="border-b px-5 py-4">
              <h3 className="font-display text-sm font-semibold text-foreground">Credit Purchase Requests</h3>
            </div>
            {purchaseRequests.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">No purchase requests yet.</div>
            ) : (
              <div className="divide-y">
                {purchaseRequests.map((r) => {
                  const reqUser = users.find((u) => u.id === r.user_id);
                  const isPending = r.request_status === "pending";
                  return (
                    <div key={r.id} className="flex items-center justify-between px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {reqUser?.display_name || reqUser?.email || r.user_id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {r.pack_name} — {r.total_credits} credits
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(r.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          r.request_status === "approved"
                            ? "bg-success/10 text-success"
                            : r.request_status === "rejected"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-warning/10 text-warning"
                        }`}>
                          {r.request_status}
                        </span>
                        {isPending && (
                          <Button size="sm" className="bg-gradient-primary" onClick={() => handleApproveRequest(r)}>
                            Approve & Add Credits
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
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
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Source</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">Amount</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">Before</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">After</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const txUser = users.find((u) => u.id === tx.user_id);
                    return (
                      <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="px-5 py-3 text-xs text-muted-foreground">
                          {new Date(tx.created_at).toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-sm text-muted-foreground">
                          {txUser?.display_name || txUser?.email || tx.user_id.slice(0, 8)}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            tx.type === "debit" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">{tx.source}</td>
                        <td className="px-5 py-3 text-right text-muted-foreground">{tx.amount.toFixed(2)}</td>
                        <td className="px-5 py-3 text-right text-muted-foreground">{tx.balance_before.toFixed(2)}</td>
                        <td className="px-5 py-3 text-right font-medium text-foreground">{tx.balance_after.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Adjust Credits Dialog */}
      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Credits</DialogTitle>
            <DialogDescription>
              {selectedUser?.display_name || selectedUser?.email || "User"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Current balance: <span className="font-semibold text-foreground">{selectedUser?.balance_credits.toFixed(2)}</span> credits
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
            {adjustAmount && (
              <p className="text-xs text-muted-foreground">
                New balance will be:{" "}
                <span className="font-semibold text-foreground">
                  {Math.max(0, (selectedUser?.balance_credits || 0) + parseFloat(adjustAmount || "0")).toFixed(2)}
                </span> credits
              </p>
            )}
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

      {/* Delete User Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <span className="font-semibold text-foreground">{deleteUser?.email}</span>?
              This will remove all their data including credits, transactions, and profiles. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Transactions Dialog */}
      <Dialog open={txOpen} onOpenChange={setTxOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction History — {txUserName}</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {userTxs.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No transactions found.</p>
            ) : (
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
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCredits;
