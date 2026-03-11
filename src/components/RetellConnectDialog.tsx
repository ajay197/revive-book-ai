import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Phone, RefreshCw, Loader2, Bot, CheckCircle } from "lucide-react";

export interface RetellAgent {
  agent_id: string;
  agent_name: string;
  voice_id?: string;
  language?: string;
}

interface RetellConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: (apiKey: string, agents: RetellAgent[]) => void;
}

export function RetellConnectDialog({ open, onOpenChange, onConnected }: RetellConnectDialogProps) {
  const [apiKey, setApiKey] = useState("");
  const [agents, setAgents] = useState<RetellAgent[]>([]);
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchAgents = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter your Retell AI API key");
      return;
    }
    setFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke("retell-agents", {
        body: { apiKey: apiKey.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const agentList: RetellAgent[] = Array.isArray(data?.agents) ? data.agents : [];
      // Deduplicate by agent_id
      const uniqueAgents = agentList.filter(
        (agent, index, self) => index === self.findIndex((a) => a.agent_id === agent.agent_id)
      );

      if (uniqueAgents.length === 0) {
        toast.info("No agents found in this Retell account");
      } else {
        toast.success(`Found ${uniqueAgents.length} agent(s)`);
      }
      setAgents(uniqueAgents);
      setFetched(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch agents");
      setAgents([]);
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem("retell_connected", "true");
      localStorage.setItem("retell_api_key", apiKey.trim());
      localStorage.setItem("retell_agents", JSON.stringify(agents));
      toast.success("Retell AI connected successfully!");
      onConnected(apiKey, agents);
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Failed to save connection");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            Connect Retell AI
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">API Key</label>
            <Input
              type="password"
              placeholder="Enter your Retell AI API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Get your API key from{" "}
              <a href="https://www.retellai.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                retellai.com
              </a>{" "}
              → Settings → API Keys
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={fetchAgents}
            disabled={fetching || !apiKey.trim()}
          >
            {fetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Fetch Agents from Retell AI
          </Button>

          {fetched && agents.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Available Agents ({agents.length})
              </label>
              <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-lg border bg-muted/30 p-2">
                {agents.map((agent) => (
                  <div
                    key={agent.agent_id}
                    className="flex items-center gap-2.5 rounded-md border bg-card px-3 py-2"
                  >
                    <Bot className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {agent.agent_name || agent.agent_id}
                      </p>
                    </div>
                    <CheckCircle className="h-3.5 w-3.5 text-success shrink-0" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                You can select an agent when setting up a campaign.
              </p>
            </div>
          )}

          {fetched && agents.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              No agents found. Create agents in your Retell AI dashboard first.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !fetched || agents.length === 0}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save & Connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
