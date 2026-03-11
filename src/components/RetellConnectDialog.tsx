import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Phone, RefreshCw, Loader2 } from "lucide-react";

interface RetellAgent {
  agent_id: string;
  agent_name: string;
  voice_id?: string;
  language?: string;
}

interface RetellConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: (apiKey: string, agent: RetellAgent) => void;
}

export function RetellConnectDialog({ open, onOpenChange, onConnected }: RetellConnectDialogProps) {
  const [apiKey, setApiKey] = useState("");
  const [agents, setAgents] = useState<RetellAgent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);

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
      if (agentList.length === 0) {
        toast.info("No agents found in this Retell account");
      } else {
        toast.success(`Found ${agentList.length} agent(s)`);
      }
      setAgents(agentList);
      setSelectedAgentId("");
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch agents");
      setAgents([]);
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    const agent = agents.find((a) => a.agent_id === selectedAgentId);
    if (!agent) {
      toast.error("Please select a voice agent");
      return;
    }
    setSaving(true);
    try {
      // Store connection info in localStorage for now
      localStorage.setItem("retell_connected", "true");
      localStorage.setItem("retell_agent_id", agent.agent_id);
      localStorage.setItem("retell_agent_name", agent.agent_name || agent.agent_id);
      toast.success("Retell AI connected successfully!");
      onConnected(apiKey, agent);
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

          {agents.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Select Voice Agent</label>
              <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.agent_id} value={agent.agent_id}>
                      {agent.agent_name || agent.agent_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !selectedAgentId}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save & Connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
