import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TIMEZONES = [
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Anchorage", "Pacific/Honolulu", "America/Phoenix", "America/Toronto",
  "America/Vancouver", "Europe/London", "Europe/Paris", "Europe/Berlin",
  "Asia/Dubai", "Asia/Kolkata", "Asia/Singapore", "Asia/Tokyo", "Australia/Sydney",
];

interface CampaignSettings {
  id: string;
  type: string;
  window_start: string | null;
  window_end: string | null;
  timezone: string | null;
  max_retries: number | null;
  retry_delay: number | null;
  call_interval_minutes: number | null;
}

interface EditCampaignSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: CampaignSettings;
  onSaved: (updated: Partial<CampaignSettings>) => void;
}

export function EditCampaignSettingsDialog({
  open,
  onOpenChange,
  campaign,
  onSaved,
}: EditCampaignSettingsDialogProps) {
  const [windowStart, setWindowStart] = useState("09:00");
  const [windowEnd, setWindowEnd] = useState("17:00");
  const [timezone, setTimezone] = useState("America/New_York");
  const [maxRetries, setMaxRetries] = useState("3");
  const [retryDelay, setRetryDelay] = useState("24");
  const [callInterval, setCallInterval] = useState("5");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && campaign) {
      setWindowStart(campaign.window_start || "09:00");
      setWindowEnd(campaign.window_end || "17:00");
      setTimezone(campaign.timezone || "America/New_York");
      setMaxRetries(String(campaign.max_retries ?? 3));
      setRetryDelay(String(campaign.retry_delay ?? 24));
      setCallInterval(String(campaign.call_interval_minutes ?? 5));
    }
  }, [open, campaign]);

  const handleSave = async () => {
    setSaving(true);
    const updates: Record<string, any> = {
      window_start: windowStart,
      window_end: windowEnd,
      timezone,
      max_retries: parseInt(maxRetries) || 0,
      retry_delay: parseInt(retryDelay) || 24,
    };

    if (campaign.type === "Old Lead Reactivation") {
      updates.call_interval_minutes = parseInt(callInterval) || 0;
    }

    const { error } = await supabase
      .from("campaigns")
      .update(updates)
      .eq("id", campaign.id);

    if (error) {
      toast.error("Failed to save settings");
    } else {
      toast.success("Campaign settings updated");
      onSaved(updates);
      onOpenChange(false);
    }
    setSaving(false);
  };

  const isReactivation = campaign.type === "Old Lead Reactivation";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Campaign Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-win-start" className="text-sm font-medium">Calling Start Time</Label>
              <Input id="edit-win-start" type="time" value={windowStart} onChange={(e) => setWindowStart(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-win-end" className="text-sm font-medium">Calling End Time</Label>
              <Input id="edit-win-end" type="time" value={windowEnd} onChange={(e) => setWindowEnd(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-timezone" className="text-sm font-medium">Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger id="edit-timezone"><SelectValue placeholder="Select timezone" /></SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>{tz.replace(/_/g, " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-max-retries" className="text-sm font-medium">Max Retries</Label>
              <Input id="edit-max-retries" type="number" min="0" max="10" value={maxRetries} onChange={(e) => setMaxRetries(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-retry-delay" className="text-sm font-medium">Retry Delay (hours)</Label>
              <Input id="edit-retry-delay" type="number" min="1" max="168" value={retryDelay} onChange={(e) => setRetryDelay(e.target.value)} />
            </div>
          </div>

          {isReactivation && (
            <div className="space-y-2">
              <Label htmlFor="edit-call-interval" className="text-sm font-medium">Next Call After (minutes)</Label>
              <Input id="edit-call-interval" type="number" min="0" max="120" value={callInterval} onChange={(e) => setCallInterval(e.target.value)} />
              <p className="text-xs text-muted-foreground">
                Time to wait between each call. If a call is still ongoing when the timer expires, the next call starts immediately after it ends.
              </p>
            </div>
          )}

          <div className="rounded-lg bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
            <Clock className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
            Calls run {windowStart} – {windowEnd} daily ({timezone.replace(/_/g, " ")}). Up to {maxRetries} retries with {retryDelay}h delay.
            {isReactivation && ` Next call after ${callInterval} min.`}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-gradient-primary">
            {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
