import { useState, useEffect } from "react";
import { Phone, Calendar, TrendingUp, DollarSign, Megaphone, Clock, SmilePlus, Loader2 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface DashboardData {
  stats: {
    totalCalls: number;
    callsToday: number;
    answerRate: number;
    avgDuration: string;
    appointmentsBooked: number;
    totalCost: number;
    positiveSentiment: number;
  };
  outcomeDistribution: { name: string; value: number; fill: string }[];
  callsOverTime: { date: string; calls: number; answered: number; booked: number }[];
  recentCalls: {
    id: string;
    time: string;
    lead: string;
    phone: string;
    campaign: string;
    duration: string;
    outcome: string;
    sentiment: string;
    cost: number;
  }[];
}

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCampaigns, setActiveCampaigns] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchDashboard = async () => {
      setLoading(true);

      // Get user's campaigns to find agent IDs
      const { data: campaigns } = await supabase
        .from("campaigns")
        .select("agent_id, status")
        .eq("user_id", user.id);

      const agentIds = [...new Set((campaigns || []).map((c) => c.agent_id).filter(Boolean))] as string[];
      const active = (campaigns || []).filter((c) => c.status === "Running").length;
      setActiveCampaigns(active);

      if (agentIds.length === 0) {
        setData(null);
        setLoading(false);
        return;
      }

      const apiKey = localStorage.getItem("retell_api_key");
      if (!apiKey) {
        setData(null);
        setLoading(false);
        return;
      }

      try {
        const { data: fnData, error } = await supabase.functions.invoke("retell-agents", {
          body: { apiKey, mode: "dashboard", agentIds },
        });

        if (!error && fnData) {
          setData(fnData);
        }
      } catch {
        // silent fail
      }

      setLoading(false);
    };

    fetchDashboard();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const stats = data?.stats;
  const hasData = data && stats && stats.totalCalls > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Campaign performance overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Calls" value={stats?.totalCalls ?? 0} icon={Phone} />
        <StatCard label="Calls Today" value={stats?.callsToday ?? 0} icon={Clock} />
        <StatCard label="Answer Rate" value={stats ? `${stats.answerRate}%` : "0%"} icon={TrendingUp} />
        <StatCard label="Avg Duration" value={stats?.avgDuration ?? "0:00"} icon={Clock} />
        <StatCard label="Appointments Booked" value={stats?.appointmentsBooked ?? 0} icon={Calendar} />
        <StatCard label="Total Cost" value={(stats?.totalCost ?? 0).toFixed(2)} prefix="$" icon={DollarSign} />
        <StatCard label="Active Campaigns" value={activeCampaigns} icon={Megaphone} />
        <StatCard label="Positive Sentiment" value={stats ? `${stats.positiveSentiment}%` : "0%"} icon={SmilePlus} />
      </div>

      {/* Charts */}
      {hasData && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border bg-card p-5 shadow-card lg:col-span-2">
            <h3 className="font-display text-sm font-semibold text-foreground">Calls Over Time</h3>
            <p className="mt-1 text-xs text-muted-foreground">Daily call volume, answered, and booked</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.callsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(218 11% 45%)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(218 11% 45%)" }} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(220 13% 91%)", fontSize: "12px" }} />
                  <Area type="monotone" dataKey="calls" stroke="hsl(218 11% 65%)" fill="hsl(218 11% 65% / 0.1)" strokeWidth={2} />
                  <Area type="monotone" dataKey="answered" stroke="hsl(245 58% 51%)" fill="hsl(245 58% 51% / 0.1)" strokeWidth={2} />
                  <Area type="monotone" dataKey="booked" stroke="hsl(160 84% 39%)" fill="hsl(160 84% 39% / 0.1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-card">
            <h3 className="font-display text-sm font-semibold text-foreground">Outcome Distribution</h3>
            <p className="mt-1 text-xs text-muted-foreground">Call outcomes breakdown</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.outcomeDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {data.outcomeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(220 13% 91%)", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {data.outcomeDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }} />
                  {item.name}: {item.value}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Calls */}
      {data && data.recentCalls.length > 0 ? (
        <div className="rounded-xl border bg-card shadow-card">
          <div className="border-b px-5 py-4">
            <h3 className="font-display text-sm font-semibold text-foreground">Recent Calls</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Latest call activity across campaigns</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Time</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Lead</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Campaign</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Duration</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Outcome</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Sentiment</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">Cost</th>
                </tr>
              </thead>
              <tbody>
                {data.recentCalls.map((call) => (
                  <tr key={call.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-5 py-3 text-xs text-muted-foreground">{call.time}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">{call.lead}</p>
                      <p className="text-xs text-muted-foreground">{call.phone}</p>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{call.campaign}</td>
                    <td className="px-5 py-3 text-muted-foreground">{call.duration}</td>
                    <td className="px-5 py-3"><StatusBadge status={call.outcome} /></td>
                    <td className="px-5 py-3"><StatusBadge status={call.sentiment} /></td>
                    <td className="px-5 py-3 text-right text-muted-foreground">${call.cost.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : !loading && (
        <div className="rounded-xl border bg-card p-12 text-center shadow-card">
          <Phone className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 font-display text-lg font-semibold text-foreground">No call data yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create campaigns and start calling to see live data here.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
