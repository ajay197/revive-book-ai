import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowLeft, Phone, Clock, Loader2, RefreshCw, Settings2, CircleDot } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { EditCampaignSettingsDialog } from "@/components/EditCampaignSettingsDialog";

interface CallLog {
  id: string;
  lead_name: string | null;
  lead_phone: string | null;
  status: string;
  duration_seconds: number | null;
  cost: number | null;
  sentiment: string | null;
  disconnection_reason: string | null;
  attempt_number: number | null;
  started_at: string | null;
  ended_at: string | null;
}

interface CampaignInfo {
  id: string;
  name: string;
  status: string;
  type: string;
  lead_count: number | null;
  calls_completed: number | null;
  appointments_booked: number | null;
  cost: number | null;
  max_retries: number | null;
  retry_delay: number | null;
  call_interval_minutes: number | null;
  window_start: string | null;
  window_end: string | null;
  timezone: string | null;
}

const formatDuration = (seconds: number | null) => {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const CampaignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState<CampaignInfo | null>(null);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const fetchData = async () => {
    if (!user || !id) return;
    setLoading(true);

    const [campRes, logsRes] = await Promise.all([
      supabase.from("campaigns").select("*").eq("id", id).eq("user_id", user.id).single(),
      supabase
        .from("call_logs")
        .select("*")
        .eq("campaign_id", id)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    if (campRes.data) setCampaign(campRes.data);
    if (logsRes.data) setCallLogs(logsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user, id]);

  // Realtime subscription for call logs
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`call-logs-${id}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "call_logs",
        filter: `campaign_id=eq.${id}`,
      }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/app/campaigns")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Campaigns
        </Button>
        <p className="text-muted-foreground">Campaign not found.</p>
      </div>
    );
  }

  const totalDuration = callLogs.reduce((sum, l) => sum + (l.duration_seconds || 0), 0);
  const answeredCalls = callLogs.filter(l => !["Queued", "Failed", "No Answer"].includes(l.status)).length;
  const retriedCalls = callLogs.filter(l => (l.attempt_number || 1) > 1).length;

  const windowStart = campaign.window_start || "09:00";
  const windowEnd = campaign.window_end || "17:00";
  const campaignTz = campaign.timezone || "America/New_York";
  const tz = campaignTz.replace(/_/g, " ");
  const isReactivation = campaign.type === "Old Lead Reactivation";

  // Compute whether we're inside the calling window right now
  const getWindowStatus = () => {
    try {
      const nowInTz = new Date().toLocaleString("en-US", { timeZone: campaignTz });
      const localDate = new Date(nowInTz);
      const currentMinutes = localDate.getHours() * 60 + localDate.getMinutes();
      const [startH, startM] = windowStart.split(":").map(Number);
      const [endH, endM] = windowEnd.split(":").map(Number);
      const startMin = startH * 60 + startM;
      const endMin = endH * 60 + endM;
      const inside = currentMinutes >= startMin && currentMinutes < endMin;
      const localTime = `${String(localDate.getHours()).padStart(2, "0")}:${String(localDate.getMinutes()).padStart(2, "0")}`;
      return { inside, localTime };
    } catch {
      return { inside: true, localTime: "" };
    }
  };

  const windowStatus = getWindowStatus();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/campaigns")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-foreground">{campaign.name}</h1>
            <StatusBadge status={campaign.status} />
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{campaign.type}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          <Settings2 className="mr-1.5 h-3.5 w-3.5" /> Edit Settings
        </Button>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {[
          { label: "Total Calls", value: callLogs.length },
          { label: "Answered", value: answeredCalls },
          { label: "Booked", value: campaign.appointments_booked || 0 },
          { label: "Retries", value: retriedCalls },
          { label: "Duration", value: formatDuration(totalDuration) },
          { label: "Cost", value: `$${Number(campaign.cost || 0).toFixed(2)}` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border bg-card p-3 shadow-sm">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-lg font-semibold text-foreground mt-0.5">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Campaign settings summary */}
      <div className="rounded-lg border bg-muted/30 px-4 py-3 text-xs text-muted-foreground space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>Calling window: {windowStart} – {windowEnd} ({tz})</span>
          </div>
          <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
            windowStatus.inside
              ? "bg-green-500/10 text-green-600 dark:text-green-400"
              : "bg-orange-500/10 text-orange-600 dark:text-orange-400"
          }`}>
            <CircleDot className="h-3 w-3" />
            {windowStatus.inside ? "Active now" : "Outside window"}
            {windowStatus.localTime && <span className="opacity-70">({windowStatus.localTime} local)</span>}
          </div>
        </div>
        {(campaign.max_retries || 0) > 0 && (
          <div className="flex items-center gap-2">
            <RefreshCw className="h-3.5 w-3.5 shrink-0" />
            <span>Retry policy: up to {campaign.max_retries} retries, {campaign.retry_delay || 24}h delay</span>
          </div>
        )}
        {isReactivation && (campaign.call_interval_minutes || 0) > 0 && (
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>Next call after: {campaign.call_interval_minutes} minutes</span>
          </div>
        )}
      </div>

      {/* Call logs table */}
      <div className="rounded-xl border bg-card shadow-card">
        <div className="px-5 py-3 border-b">
          <h2 className="font-display text-sm font-semibold text-foreground">Call History</h2>
        </div>
        {callLogs.length === 0 ? (
          <div className="py-12 text-center">
            <Phone className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No calls have been made yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Lead</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Phone</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Attempt</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Duration</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Sentiment</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Cost</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Time</th>
                </tr>
              </thead>
              <tbody>
                {callLogs.map((log) => (
                  <tr key={log.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-2.5 font-medium text-foreground">{log.lead_name || "—"}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{log.lead_phone || "—"}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={log.status} /></td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {(log.attempt_number || 1) > 1 ? (
                        <span className="inline-flex items-center gap-1">
                          <RefreshCw className="h-3 w-3" />
                          #{log.attempt_number}
                        </span>
                      ) : (
                        "#1"
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(log.duration_seconds)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      {log.sentiment ? <StatusBadge status={log.sentiment} /> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">
                      ${Number(log.cost || 0).toFixed(4)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground text-xs">
                      {log.started_at ? new Date(log.started_at).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Settings Dialog */}
      {campaign && (
        <EditCampaignSettingsDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          campaign={campaign}
          onSaved={(updated) => setCampaign({ ...campaign, ...updated })}
        />
      )}
    </div>
  );
};

export default CampaignDetail;
