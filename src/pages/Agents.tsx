import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Bot, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AgentWithStats {
  agent_id: string;
  agent_name: string;
  voice_id?: string;
  language?: string;
  stats: {
    totalCalls: number;
    booked: number;
  };
}

const Agents = () => {
  const [agents, setAgents] = useState<AgentWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      const apiKey = localStorage.getItem("retell_api_key");
      if (!apiKey) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("retell-agents", {
          body: { apiKey, withStats: true },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        const agentList: AgentWithStats[] = Array.isArray(data?.agents) ? data.agents : [];
        const unique = agentList.filter(
          (a, i, self) => i === self.findIndex((b) => b.agent_id === a.agent_id)
        );
        setAgents(unique);
      } catch (err: any) {
        toast.error(err.message || "Failed to fetch agents");
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const bookingRate = (agent: AgentWithStats) => {
    if (agent.stats.totalCalls === 0) return 0;
    return ((agent.stats.booked / agent.stats.totalCalls) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">AI Agents</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your AI calling agents powered by Retell AI</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : agents.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center shadow-card">
          <Bot className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 font-display text-lg font-semibold text-foreground">No agents connected</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect your Retell AI account in Integrations to see your agents here.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <div key={agent.agent_id} className="rounded-xl border bg-card p-6 shadow-card transition-shadow hover:shadow-elevated">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  Active
                </Badge>
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                {agent.agent_name || agent.agent_id}
              </h3>
              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                {agent.language && <span>{agent.language}</span>}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 border-t pt-4">
                <div className="text-center">
                  <p className="font-display text-sm font-bold text-foreground">
                    {agent.stats.totalCalls.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Calls</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-sm font-bold text-foreground">
                    {agent.stats.booked}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Booked</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-sm font-bold text-success">
                    {bookingRate(agent)}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">Booking Rate</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Agents;
