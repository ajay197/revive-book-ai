import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

const STATUS_OPTIONS = ["New", "Queued", "Called", "Answered", "No Answer", "Voicemail", "Booked", "Unsuccessful", "Do Not Call"];

interface EditLeadDialogProps {
  lead: Tables<"leads"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditLeadDialog({ lead, open, onOpenChange }: EditLeadDialogProps) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Tables<"leads">>>({});

  const current = { ...lead, ...form };

  const handleSave = async () => {
    if (!lead) return;
    setSaving(true);
    const { error } = await supabase
      .from("leads")
      .update({
        name: current.name,
        email: current.email,
        phone: current.phone,
        company: current.company || null,
        city: current.city || null,
        state: current.state || null,
        source: current.source || null,
        campaign: current.campaign || null,
        status: current.status || "New",
        notes: current.notes || null,
      })
      .eq("id", lead.id);

    setSaving(false);
    if (error) {
      toast.error("Failed to update lead: " + error.message);
    } else {
      toast.success("Lead updated");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      onOpenChange(false);
      setForm({});
    }
  };

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setForm({}); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue={lead.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue={lead.email} onChange={(e) => set("email", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" defaultValue={lead.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" defaultValue={lead.company || ""} onChange={(e) => set("company", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" defaultValue={lead.city || ""} onChange={(e) => set("city", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" defaultValue={lead.state || ""} onChange={(e) => set("state", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input id="source" defaultValue={lead.source || ""} onChange={(e) => set("source", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select defaultValue={lead.status || "New"} onValueChange={(v) => set("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="campaign">Campaign</Label>
            <Input id="campaign" defaultValue={lead.campaign || ""} onChange={(e) => set("campaign", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" defaultValue={lead.notes || ""} onChange={(e) => set("notes", e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
