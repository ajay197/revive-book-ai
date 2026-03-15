import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Bot, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AgentWithStats {
  agent_id: string;
  agent_name: string;
  stats: {
    totalCalls: number;
    booked: number;
  };
  campaignCount: number;
}

const Agents = () => {
  const [agents, setAgents] = useState<AgentWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAgents = async () => {
      if (!user) { setLoading(false); return; }

      // 1. Get the user's campaigns with agent info
      const { data: campaigns, error } = await supabase
        .from("campaigns")
        .select("agent_id, agent_name")
        .eq("user_id", user.id)
        .not("agent_id", "is", null);

      if (error) {
        toast.error("Failed to load campaigns");
        setLoading(false);
        return;
      }

      if (!campaigns || campaigns.length === 0) {
        setAgents([]);
        setLoading(false);
        return;
      }

      // 2. Deduplicate agents used in campaigns
      const agentMap = new Map<string, { name: string; count: number }>();
      for (const c of campaigns) {
        if (!c.agent_id) continue;
        const existing = agentMap.get(c.agent_id);
        if (existing) {
          existing.count++;
        } else {
          agentMap.set(c.agent_id, { name: c.agent_name || c.agent_id, count: 1 });
        }
      }

      // 3. Fetch real stats from Retell for each agent
      const apiKey = localStorage.getItem("retell_api_key");
      const agentResults: AgentWithStats[] = [];

      if (apiKey) {
        try {
          const { data, error: fnError } = await supabase.functions.invoke("retell-agents", {
            body: { apiKey, withStats: true },
          });
          if (!fnError && data?.agents) {
            const retellAgents = Array.isArray(data.agents) ? data.agents : [];
            for (const [agentId, info] of agentMap.entries()) {
              const retellAgent = retellAgents.find((a: any) => a.agent_id === agentId);
              agentResults.push({
                agent_id: agentId,
                agent_name: retellAgent?.agent_name || info.name,
                stats: retellAgent?.stats || { totalCalls: 0, booked: 0 },
                campaignCount: info.count,
              });
            }
          }
        } catch {
          // Fallback: show agents without stats
          for (const [agentId, info] of agentMap.entries()) {
            agentResults.push({
              agent_id: agentId,
              agent_name: info.name,
              stats: { totalCalls: 0, booked: 0 },
              campaignCount: info.count,
            });
          }
        }
      } else {
        for (const [agentId, info] of agentMap.entries()) {
          agentResults.push({
            agent_id: agentId,
            agent_name: info.name,
            stats: { totalCalls: 0, booked: 0 },
            campaignCount: info.count,
          });
        }
      }

      setAgents(agentResults);
      setLoading(false);
    };

    fetchAgents();
  }, [user]);

  const bookingRate = (agent: AgentWithStats) => {
    if (agent.stats.totalCalls === 0) return "0.0";
    return ((agent.stats.booked / agent.stats.totalCalls) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">AI Agents</h1>
        <p className="mt-1 text-sm text-muted-foreground">Agents used in your campaigns</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : agents.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center shadow-card">
          <Bot className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 font-display text-lg font-semibold text-foreground">No agents in use</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a campaign and assign a calling AI agent to see it here.
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
                {agent.agent_name}
              </h3>
              <div className="mt-4 grid grid-cols-4 gap-3 border-t pt-4">
                <div className="text-center">
                  <p className="font-display text-sm font-bold text-foreground">{agent.campaignCount}</p>
                  <p className="text-[10px] text-muted-foreground">Campaigns</p>
                </div>
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
