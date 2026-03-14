import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Play, Pause, Loader2, AlertTriangle, MoreHorizontal, UserPlus, Trash2 } from "lucide-react";
import { CreateCampaignSheet } from "@/components/CreateCampaignSheet";
import { AddLeadsToCampaignDialog } from "@/components/AddLeadsToCampaignDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/contexts/CreditsContext";
import { BLOCK_CALLS_THRESHOLD } from "@/lib/credits";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Campaign {
  id: string;
  name: string;
  type: string;
  lead_count: number;
  agent_name: string | null;
  status: string;
  calls_completed: number;
  appointments_booked: number;
  cost: number;
  created_at: string;
}

const Campaigns = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [addLeadsCampaign, setAddLeadsCampaign] = useState<{ id: string; name: string } | null>(null);
  const [deleteCampaign, setDeleteCampaign] = useState<Campaign | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();
  const { balance } = useCredits();
  const navigate = useNavigate();
  const callsBlocked = balance <= BLOCK_CALLS_THRESHOLD;

  const fetchCampaigns = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) setCampaigns(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCampaigns();
  }, [user]);

  const handleStatusToggle = async (campaign: Campaign) => {
    if (campaign.status !== "Running" && callsBlocked) {
      toast.error("Insufficient credits. Please add more credits before starting campaigns.");
      navigate("/app/billing");
      return;
    }
    const newStatus = campaign.status === "Running" ? "Paused" : "Running";
    await supabase.from("campaigns").update({ status: newStatus }).eq("id", campaign.id);
    fetchCampaigns();

    // If activating campaign, persist Retell API key server-side and trigger first call
    if (newStatus === "Running" && user) {
      const apiKey = localStorage.getItem("retell_api_key");
      if (apiKey) {
        // Upsert API key to user_integrations for server-side use
        await supabase.from("user_integrations" as any).upsert(
          { user_id: user.id, provider: "retell", api_key: apiKey },
          { onConflict: "user_id,provider" }
        );
      }

      // Trigger the campaign caller
      toast.info(`Starting calls for "${campaign.name}"...`);
      const { data, error } = await supabase.functions.invoke("campaign-caller", {
        body: { campaignId: campaign.id, userId: user.id },
      });

      if (error) {
        toast.error("Failed to start calling: " + error.message);
      } else if (data?.error) {
        toast.error(data.error);
      } else if (data?.success) {
        toast.success(`Calling ${data.leadName} (${data.leadPhone})...`);
      } else if (data?.completed) {
        toast.info(data.message);
      }
      fetchCampaigns();
    }
  };

  const handleDelete = async () => {
    if (!deleteCampaign) return;
    setDeleting(true);
    // Also unassign leads from this campaign
    await supabase.from("leads").update({ campaign: null }).eq("campaign", deleteCampaign.name);
    const { error } = await supabase.from("campaigns").delete().eq("id", deleteCampaign.id);
    if (error) {
      toast.error("Failed to delete campaign");
    } else {
      toast.success(`Campaign "${deleteCampaign.name}" deleted`);
    }
    setDeleting(false);
    setDeleteCampaign(null);
    fetchCampaigns();
  };

  // A campaign can only be deleted if it has never been activated (only "Draft" status)
  const canDelete = (campaign: Campaign) => campaign.status === "Draft";

  return (
    <div className="space-y-6">
      {callsBlocked && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">Calls Blocked — Insufficient Credits</p>
            <p className="text-xs text-muted-foreground">You need more credits to start or resume campaigns.</p>
          </div>
          <Button size="sm" className="bg-gradient-primary" onClick={() => navigate("/app/billing")}>Add Credits</Button>
        </div>
      )}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Campaigns</h1>
          <p className="mt-1 text-sm text-muted-foreground">{campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}</p>
        </div>
        <Button className="bg-gradient-primary" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Campaign
        </Button>
      </div>

      <CreateCampaignSheet open={createOpen} onOpenChange={setCreateOpen} onCreated={fetchCampaigns} />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center shadow-card">
          <Plus className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 font-display text-lg font-semibold text-foreground">No campaigns yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first campaign to start calling leads.
          </p>
          <Button className="mt-4 bg-gradient-primary" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Campaign
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Campaign</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Type</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Leads</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Agent</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Calls</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Booked</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">Cost</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{c.type}</td>
                    <td className="px-5 py-3 text-muted-foreground">{c.lead_count.toLocaleString()}</td>
                    <td className="px-5 py-3 text-muted-foreground">{c.agent_name || "—"}</td>
                    <td className="px-5 py-3"><StatusBadge status={c.status as any} /></td>
                    <td className="px-5 py-3 text-muted-foreground">{c.calls_completed.toLocaleString()}</td>
                    <td className="px-5 py-3 text-muted-foreground">{c.appointments_booked}</td>
                    <td className="px-5 py-3 text-right text-muted-foreground">${Number(c.cost).toFixed(2)}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {c.status === "Running" && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleStatusToggle(c)}>
                            <Pause className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        )}
                        {(c.status === "Draft" || c.status === "Paused") && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleStatusToggle(c)}>
                            <Play className="h-3.5 w-3.5 text-primary" />
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setAddLeadsCampaign({ id: c.id, name: c.name })}>
                              <UserPlus className="mr-2 h-4 w-4" /> Add Leads
                            </DropdownMenuItem>
                            {canDelete(c) && (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteCampaign(c)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Campaign
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AddLeadsToCampaignDialog
        open={!!addLeadsCampaign}
        onOpenChange={(val) => !val && setAddLeadsCampaign(null)}
        campaign={addLeadsCampaign}
        onUpdated={fetchCampaigns}
      />

      <Dialog open={!!deleteCampaign} onOpenChange={(val) => !val && setDeleteCampaign(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "<span className="font-medium text-foreground">{deleteCampaign?.name}</span>"? This action cannot be undone. Leads assigned to this campaign will be unassigned.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteCampaign(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Campaigns;
