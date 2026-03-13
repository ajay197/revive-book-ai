import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const STATUS_OPTIONS = ["New", "Queued", "Called", "Answered", "No Answer", "Voicemail", "Booked", "Unsuccessful", "Do Not Call"];

interface AddLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingPhones: string[];
}

export function AddLeadDialog({ open, onOpenChange, existingPhones }: AddLeadDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    city: "",
    state: "",
    source: "",
    status: "New",
    tags: "",
    notes: "",
  });

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const reset = () => {
    setForm({ name: "", email: "", phone: "", company: "", city: "", state: "", source: "", status: "New", tags: "", notes: "" });
  };

  const handleSave = async () => {
    if (!user) return;
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error("Name, Email, and Phone are required");
      return;
    }

    // Clean phone number
    let phone = form.phone.replace(/[^0-9+]/g, "");
    if (/^\d{10}$/.test(phone)) phone = "+1" + phone;
    if (!phone.startsWith("+")) phone = "+" + phone;

    if (existingPhones.includes(phone)) {
      toast.error("A lead with this phone number already exists");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("leads").insert({
      user_id: user.id,
      name: form.name.trim(),
      email: form.email.trim(),
      phone,
      company: form.company.trim() || null,
      city: form.city.trim() || null,
      state: form.state.trim() || null,
      source: form.source.trim() || "Manual Entry",
      status: form.status,
      tags: form.tags.trim() ? form.tags.split(",").map((t) => t.trim()) : null,
      notes: form.notes.trim() || null,
    });
    setSaving(false);

    if (error) {
      toast.error("Failed to add lead: " + error.message);
    } else {
      toast.success("Lead added successfully");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Lead Manually</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="add-name">Name *</Label>
              <Input id="add-name" placeholder="Full name" value={form.name} onChange={(e) => update("name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-email">Email *</Label>
              <Input id="add-email" type="email" placeholder="email@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="add-phone">Phone *</Label>
              <Input id="add-phone" placeholder="+1 (555) 000-0000" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-company">Company</Label>
              <Input id="add-company" placeholder="Company name" value={form.company} onChange={(e) => update("company", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="add-city">City</Label>
              <Input id="add-city" placeholder="City" value={form.city} onChange={(e) => update("city", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-state">State</Label>
              <Input id="add-state" placeholder="State" value={form.state} onChange={(e) => update("state", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="add-source">Source</Label>
              <Input id="add-source" placeholder="e.g. Referral, Website" value={form.source} onChange={(e) => update("source", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-status">Status</Label>
              <Select value={form.status} onValueChange={(v) => update("status", v)}>
                <SelectTrigger id="add-status">
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
          <div className="space-y-1.5">
            <Label htmlFor="add-tags">Tags</Label>
            <Input id="add-tags" placeholder="Comma-separated tags" value={form.tags} onChange={(e) => update("tags", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="add-notes">Notes</Label>
            <Textarea id="add-notes" placeholder="Any additional notes..." value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={3} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>Cancel</Button>
          <Button className="bg-gradient-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Add Lead"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
