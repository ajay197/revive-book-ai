import { useState, useEffect } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { StatCard } from "@/components/StatCard";
import { Phone, Clock, Calendar, TrendingUp, Coins, Loader2, SmilePlus } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { secondsToCredits } from "@/lib/credits";

interface CallLog {
  id: string;
  created_at: string;
  duration_seconds: number | null;
  status: string;
  sentiment: string | null;
  disconnection_reason: string | null;
  lead_name: string | null;
  lead_phone: string | null;
  retell_call_id: string | null;
  campaign_id: string | null;
}

const Analytics = () => {
  const { user } = useAuth();
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("call_logs")
        .select("id, created_at, duration_seconds, status, sentiment, disconnection_reason, lead_name, lead_phone, retell_call_id, campaign_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(500);
      setCalls(data || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Compute stats
  const totalCalls = calls.length;
  const answeredCalls = calls.filter(c => c.status !== "No Answer" && c.status !== "Queued").length;
  const answerRate = totalCalls > 0 ? Math.round((answeredCalls / totalCalls) * 1000) / 10 : 0;
  const bookedCalls = calls.filter(c => c.status === "Booked").length;
  const totalDurationSec = calls.reduce((s, c) => s + (c.duration_seconds || 0), 0);
  const totalCreditsUsed = secondsToCredits(totalDurationSec);
  const positiveSentiment = calls.filter(c => c.sentiment === "Positive").length;
  const sentimentPct = totalCalls > 0 ? Math.round((positiveSentiment / totalCalls) * 1000) / 10 : 0;

  // Calls over time (last 14 days)
  const callsByDay: Record<string, { calls: number; answered: number; booked: number }> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    callsByDay[key] = { calls: 0, answered: 0, booked: 0 };
  }
  for (const c of calls) {
    const d = new Date(c.created_at);
    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (callsByDay[key]) {
      callsByDay[key].calls++;
      if (c.status !== "No Answer" && c.status !== "Queued") callsByDay[key].answered++;
      if (c.status === "Booked") callsByDay[key].booked++;
    }
  }
  const callsOverTime = Object.entries(callsByDay).map(([date, data]) => ({ date, ...data }));

  // Credits by day (last 14 days)
  const creditsByDay: Record<string, number> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    creditsByDay[key] = 0;
  }
  for (const c of calls) {
    const d = new Date(c.created_at);
    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (creditsByDay[key] !== undefined) {
      creditsByDay[key] += secondsToCredits(c.duration_seconds || 0);
    }
  }
  const creditsOverTime = Object.entries(creditsByDay).map(([date, credits]) => ({ date, credits: Math.round(credits * 100) / 100 }));

  const formatDuration = (sec: number) => {
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Call performance and business outcomes</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Calls" value={totalCalls} icon={Phone} />
        <StatCard label="Answer Rate" value={`${answerRate}%`} icon={TrendingUp} />
        <StatCard label="Appointments Booked" value={bookedCalls} icon={Calendar} />
        <StatCard label="Credits Used" value={totalCreditsUsed.toFixed(2)} icon={Coins} />
        <StatCard label="Positive Sentiment" value={`${sentimentPct}%`} icon={SmilePlus} />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="font-display text-sm font-semibold text-foreground">Call Volume (Last 14 Days)</h3>
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

      {/* Call Log Table */}
      <div className="rounded-xl border bg-card shadow-card">
        <div className="border-b px-5 py-4">
          <h3 className="font-display text-sm font-semibold text-foreground">Call Log</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Detailed call records from your campaigns</p>
        </div>
        {calls.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Time</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Lead</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Duration</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Credits</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Outcome</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Sentiment</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">End Reason</th>
                </tr>
              </thead>
              <tbody>
                {calls.map((row) => {
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
            <p className="mt-1 text-sm text-muted-foreground">Start campaigns to see analytics here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
