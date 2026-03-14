import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar, Loader2, CheckCircle } from "lucide-react";

interface CalComConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: (eventTypes: { id: number; title: string }[]) => void;
}

export function CalComConnectDialog({ open, onOpenChange, onConnected }: CalComConnectDialogProps) {
  const [apiKey, setApiKey] = useState("");
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter your Cal.com API key");
      return;
    }
    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke("calcom-sync", {
        body: { action: "connect", apiKey: apiKey.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Cal.com connected successfully!");
      onConnected(data.event_types || []);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to connect Cal.com");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Connect Cal.com
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">API Key</label>
            <Input
              type="password"
              placeholder="Enter your Cal.com API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Get your API key from{" "}
              <a href="https://app.cal.com/settings/developer/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                cal.com
              </a>{" "}
              → Settings → Developer → API Keys
            </p>
          </div>

          <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
            <p className="text-xs font-medium text-foreground">What this does:</p>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">Syncs all bookings made by your Retell AI agents</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">Displays bookings in a calendar view</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">Shows attendee details, status, and meeting links</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConnect} disabled={connecting || !apiKey.trim()}>
            {connecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
