import { useState, useEffect, useMemo } from "react";
import { Phone, Calendar, TrendingUp, Megaphone, Clock, SmilePlus, Loader2, Coins, CreditCard } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/contexts/CreditsContext";
import { formatRemainingTime, secondsToCredits } from "@/lib/credits";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

type TimeRange = "today" | "7days" | "30days" | "month" | "year" | "max";

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  today: "Today",
  "7days": "Last 7 Days",
  "30days": "Last 30 Days",
  month: "This Month",
  year: "This Year",
  max: "Maximum",
};

interface CallLog {
  id: string;
  created_at: string;
  duration_seconds: number | null;
  status: string;
  sentiment: string | null;
  disconnection_reason: string | null;
  lead_name: string | null;
  lead_phone: string | null;
  campaign_id: string | null;
}

function getStartDate(range: TimeRange): Date | null {
  const now = new Date();
  switch (range) {
    case "today":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case "7days": {
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "30days": {
      const d = new Date(now);
      d.setDate(d.getDate() - 29);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "month":
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case "year":
      return new Date(now.getFullYear(), 0, 1);
    case "max":
      return null;
  }
}

function getDayCount(range: TimeRange): number {
  switch (range) {
    case "today": return 1;
    case "7days": return 7;
    case "30days": return 30;
    case "month": {
      const now = new Date();
      return now.getDate();
    }
    case "year": {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      return Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }
    case "max": return 0;
  }
}

const formatDuration = (sec: number) => {
  const min = Math.floor(sec / 60);
  const s = sec % 60;
  return `${min}:${s.toString().padStart(2, "0")}`;
};

const Dashboard = () => {
  const { user } = useAuth();
  const { balance } = useCredits();
  const navigate = useNavigate();
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [campaignMap, setCampaignMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [activeCampaigns, setActiveCampaigns] = useState(0);
  const [timeRange, setTimeRange] = useState<TimeRange>("30days");

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);

      const [{ data: callData }, { data: campaigns }] = await Promise.all([
        supabase
          .from("call_logs")
          .select("id, created_at, duration_seconds, status, sentiment, disconnection_reason, lead_name, lead_phone, campaign_id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1000),
        supabase
          .from("campaigns")
          .select("id, name, status")
          .eq("user_id", user.id),
      ]);

      setCalls(callData || []);
      const map: Record<string, string> = {};
      (campaigns || []).forEach((c) => { map[c.id] = c.name; });
      setCampaignMap(map);
      setActiveCampaigns((campaigns || []).filter((c) => c.status === "Running").length);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const filteredCalls = useMemo(() => {
    const start = getStartDate(timeRange);
    if (!start) return calls;
    return calls.filter((c) => new Date(c.created_at) >= start);
  }, [calls, timeRange]);

  // Compute stats from filtered calls
  const stats = useMemo(() => {
    const totalCalls = filteredCalls.length;
    const answeredCalls = filteredCalls.filter((c) => c.status !== "No Answer" && c.status !== "Queued").length;
    const answerRate = totalCalls > 0 ? Math.round((answeredCalls / totalCalls) * 1000) / 10 : 0;
    const bookedCalls = filteredCalls.filter((c) => c.status === "Booked").length;
    const totalDurationSec = filteredCalls.reduce((s, c) => s + (c.duration_seconds || 0), 0);
    const avgDurationSec = totalCalls > 0 ? Math.round(totalDurationSec / totalCalls) : 0;
    const creditsUsed = secondsToCredits(totalDurationSec);
    const positiveSentiment = filteredCalls.filter((c) => c.sentiment === "Positive").length;
    const sentimentPct = totalCalls > 0 ? Math.round((positiveSentiment / totalCalls) * 1000) / 10 : 0;
    return { totalCalls, answerRate, bookedCalls, totalDurationSec, avgDurationSec, creditsUsed, sentimentPct };
  }, [filteredCalls]);

  // Chart data
  const { callsOverTime, creditsOverTime } = useMemo(() => {
    const dayCount = timeRange === "max" ? (() => {
      if (filteredCalls.length === 0) return 14;
      const oldest = new Date(filteredCalls[filteredCalls.length - 1].created_at);
      const now = new Date();
      return Math.ceil((now.getTime() - oldest.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    })() : getDayCount(timeRange);

    const callsByDay: Record<string, { calls: number; answered: number; booked: number }> = {};
    const creditsByDay: Record<string, number> = {};

    for (let i = dayCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      callsByDay[key] = { calls: 0, answered: 0, booked: 0 };
      creditsByDay[key] = 0;
    }

    for (const c of filteredCalls) {
      const d = new Date(c.created_at);
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (callsByDay[key]) {
        callsByDay[key].calls++;
        if (c.status !== "No Answer" && c.status !== "Queued") callsByDay[key].answered++;
        if (c.status === "Booked") callsByDay[key].booked++;
      }
      if (creditsByDay[key] !== undefined) {
        creditsByDay[key] += secondsToCredits(c.duration_seconds || 0);
      }
    }

    return {
      callsOverTime: Object.entries(callsByDay).map(([date, data]) => ({ date, ...data })),
      creditsOverTime: Object.entries(creditsByDay).map(([date, credits]) => ({ date, credits: Math.round(credits * 100) / 100 })),
    };
  }, [filteredCalls, timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Campaign performance overview</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/app/billing")}>
            <CreditCard className="mr-1.5 h-3 w-3" /> Add Credits
          </Button>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            Balance: <span className="font-semibold text-foreground">{balance.toFixed(2)} credits</span>
            <span className="ml-2 text-xs">({formatRemainingTime(balance)} remaining)</span>
          </span>
        </div>
      </div>

      {/* Time Range Tabs */}
      <div className="flex flex-wrap gap-1.5 rounded-lg border bg-muted/30 p-1">
        {(Object.keys(TIME_RANGE_LABELS) as TimeRange[]).map((key) => (
          <button
            key={key}
            onClick={() => setTimeRange(key)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              timeRange === key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {TIME_RANGE_LABELS[key]}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Calls" value={stats.totalCalls} icon={Phone} />
        <StatCard label="Answer Rate" value={`${stats.answerRate}%`} icon={TrendingUp} />
        <StatCard label="Appointments Booked" value={stats.bookedCalls} icon={Calendar} />
        <StatCard label="Credits Used" value={stats.creditsUsed.toFixed(2)} icon={Coins} />
        <StatCard label="Positive Sentiment" value={`${stats.sentimentPct}%`} icon={SmilePlus} />
        <StatCard label="Avg Duration" value={formatDuration(stats.avgDurationSec)} icon={Clock} />
        <StatCard label="Total Duration" value={formatDuration(stats.totalDurationSec)} icon={Clock} />
        <StatCard label="Balance Credits" value={balance.toFixed(2)} icon={Coins} />
        <StatCard label="Active Campaigns" value={activeCampaigns} icon={Megaphone} />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="font-display text-sm font-semibold text-foreground">Call Volume ({TIME_RANGE_LABELS[timeRange]})</h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={callsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(218 11% 45%)" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(218 11% 45%)" }} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(220 13% 91%)", fontSize: "12px" }} />
                <Area type="monotone" dataKey="calls" stroke="hsl(218 11% 65%)" fill="hsl(218 11% 65% / 0.1)" strokeWidth={2} name="Total" />
                <Area type="monotone" dataKey="answered" stroke="hsl(245 58% 51%)" fill="hsl(245 58% 51% / 0.1)" strokeWidth={2} name="Answered" />
                <Area type="monotone" dataKey="booked" stroke="hsl(160 84% 39%)" fill="hsl(160 84% 39% / 0.1)" strokeWidth={2} name="Booked" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="font-display text-sm font-semibold text-foreground">Credits Used by Day</h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={creditsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(218 11% 45%)" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(218 11% 45%)" }} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(220 13% 91%)", fontSize: "12px" }} formatter={(value: number) => [`${value} credits`, "Credits"]} />
                <Bar dataKey="credits" fill="hsl(245 58% 51%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Call Logs Table */}
      <div className="rounded-xl border bg-card shadow-card">
        <div className="border-b px-5 py-4">
          <h3 className="font-display text-sm font-semibold text-foreground">Call Logs</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Detailed call records from your campaigns</p>
        </div>
        {filteredCalls.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Time</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Lead</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Campaign</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Duration</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Credits</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Outcome</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Sentiment</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">End Reason</th>
                </tr>
              </thead>
              <tbody>
                {filteredCalls.map((row) => {
                  const dur = row.duration_seconds || 0;
                  const credits = secondsToCredits(dur);
                  return (
                    <tr key={row.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                        {new Date(row.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <p className="font-medium text-foreground">{row.lead_name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{row.lead_phone || ""}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {row.campaign_id ? campaignMap[row.campaign_id] || "—" : "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatDuration(dur)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{credits.toFixed(2)}</td>
                      <td className="whitespace-nowrap px-4 py-3"><StatusBadge status={row.status} /></td>
                      <td className="whitespace-nowrap px-4 py-3"><StatusBadge status={row.sentiment || "Unknown"} /></td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{row.disconnection_reason || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Phone className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">No call data yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Start campaigns to see call logs here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
