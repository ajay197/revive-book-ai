import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Loader2, Search, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

interface AddLeadsToCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: { id: string; name: string } | null;
  onUpdated?: () => void;
}

export function AddLeadsToCampaignDialog({
  open,
  onOpenChange,
  campaign,
  onUpdated,
}: AddLeadsToCampaignDialogProps) {
  const { user } = useAuth();
  const [selected, setSelected] = useState<Set<string> | null>(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads-for-campaign", user?.id, campaign?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Tables<"leads">[];
    },
    enabled: !!user && open,
  });

  // Initialize selected with already-assigned leads
  const assignedIds = new Set(
    leads
      .filter((l) => l.campaign === campaign?.name || l.campaign === campaign?.id)
      .map((l) => l.id)
  );

  // Lazy-init selected from assigned leads
  if (selected === null && leads.length > 0) {
    setSelected(new Set(assignedIds));
  }

  const sel = selected ?? new Set<string>();

  const filtered = leads.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.phone.includes(q) ||
      (l.company || "").toLowerCase().includes(q)
    );
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev ?? []);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (sel.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((l) => l.id)));
    }
  };

  const handleAssign = async () => {
    if (!campaign) return;
    setSaving(true);

    const toAssign = Array.from(sel).filter((id) => !assignedIds.has(id));
    const toUnassign = Array.from(assignedIds).filter((id) => !sel.has(id));

    // Assign new leads
    if (toAssign.length > 0) {
      const { error } = await supabase
        .from("leads")
        .update({ campaign: campaign.name })
        .in("id", toAssign);
      if (error) {
        toast.error("Failed to assign leads");
        setSaving(false);
        return;
      }
    }

    // Unassign removed leads
    if (toUnassign.length > 0) {
      const { error } = await supabase
        .from("leads")
        .update({ campaign: null })
        .in("id", toUnassign);
      if (error) {
        toast.error("Failed to unassign leads");
        setSaving(false);
        return;
      }
    }

    // Update lead_count
    await supabase
      .from("campaigns")
      .update({ lead_count: sel.size })
      .eq("id", campaign.id);

    const added = toAssign.length;
    const removed = toUnassign.length;
    const parts: string[] = [];
    if (added > 0) parts.push(`${added} added`);
    if (removed > 0) parts.push(`${removed} removed`);
    toast.success(`Leads updated: ${parts.join(", ")}`);
    onOpenChange(false);
    onUpdated?.();
  };

  const handleClose = (val: boolean) => {
    if (!val) {
    setSelected(null);
    setSearch("");
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Add Leads to {campaign?.name}
          </DialogTitle>
          <DialogDescription>
            Select leads to assign to this campaign.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex-1 overflow-y-auto border rounded-lg min-h-0 max-h-[40vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-sm text-muted-foreground">
              {leads.length === 0
                ? "No leads found."
                : "No leads match your search."}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                <tr className="border-b">
                  <th className="px-3 py-2 text-left w-10">
                    <Checkbox
                      checked={sel.size === filtered.length && filtered.length > 0}
                      onCheckedChange={toggleAll}
                    />
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Name</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Phone</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Company</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b last:border-0 hover:bg-muted/30 cursor-pointer"
                    onClick={() => toggleSelect(lead.id)}
                  >
                    <td className="px-3 py-2">
                      <Checkbox
                        checked={sel.has(lead.id)}
                        onCheckedChange={() => toggleSelect(lead.id)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <p className="font-medium text-foreground">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.email}</p>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{lead.phone}</td>
                    <td className="px-3 py-2 text-muted-foreground">{lead.company || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-muted-foreground">
              {sel.size} lead{sel.size !== 1 ? "s" : ""} selected
            </p>
            <Button
              onClick={handleAssign}
              disabled={saving}
              className="bg-gradient-primary"
            >
              {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
