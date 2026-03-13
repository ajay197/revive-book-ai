import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function fetchCallsForAgent(apiKey: string, agentId: string) {
  const response = await fetch("https://api.retellai.com/v2/list-calls", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filter_criteria: {
        agent_id: [agentId],
      },
      limit: 1000,
    }),
  });

  if (!response.ok) return [];

  const calls = await response.json();
  return Array.isArray(calls) ? calls : [];
}

function formatDuration(ms: number): string {
  const totalSec = Math.round(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { apiKey, withStats, mode, agentIds } = await req.json();
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Phone numbers mode: list phone numbers from Retell
    if (mode === "phone-numbers") {
      const response = await fetch("https://api.retellai.com/list-phone-numbers", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return new Response(
          JSON.stringify({ error: `Retell API error [${response.status}]: ${errorText}` }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const phoneNumbers = await response.json();
      return new Response(JSON.stringify({ phoneNumbers }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Dashboard mode: fetch all calls for given agent IDs and return aggregated stats + recent calls
    if (mode === "dashboard" && Array.isArray(agentIds) && agentIds.length > 0) {
      const allCalls: any[] = [];
      await Promise.all(
        agentIds.map(async (agentId: string) => {
          const calls = await fetchCallsForAgent(apiKey, agentId);
          allCalls.push(...calls);
        })
      );

      // Sort by start timestamp descending
      allCalls.sort((a, b) => (b.start_timestamp || 0) - (a.start_timestamp || 0));

      const totalCalls = allCalls.length;
      const answeredCalls = allCalls.filter((c) => c.call_status === "ended" || c.call_status === "error" || c.disconnection_reason !== "no_answer_from_user").length;
      const booked = allCalls.filter(
        (c) => c.call_analysis?.call_successful === true || c.call_analysis?.custom_analysis_data?.appointment_booked === true
      ).length;
      const noAnswer = allCalls.filter((c) => c.disconnection_reason === "no_answer_from_user").length;
      const voicemail = allCalls.filter((c) => c.disconnection_reason === "voicemail_reached" || c.call_analysis?.in_voicemail === true).length;
      const unsuccessful = totalCalls - booked - noAnswer - voicemail;

      // Duration & cost
      const durations = allCalls.map((c) => (c.end_timestamp && c.start_timestamp) ? (c.end_timestamp - c.start_timestamp) : 0).filter((d) => d > 0);
      const avgDurationMs = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
      const totalCost = allCalls.reduce((sum, c) => sum + (c.cost || 0), 0);

      // Sentiment
      const sentiments = allCalls.map((c) => c.call_analysis?.user_sentiment).filter(Boolean);
      const positiveSentiment = sentiments.filter((s) => s === "Positive").length;
      const positivePct = sentiments.length > 0 ? Math.round((positiveSentiment / sentiments.length) * 100 * 10) / 10 : 0;

      // Answer rate
      const answered = totalCalls - noAnswer;
      const answerRate = totalCalls > 0 ? Math.round((answered / totalCalls) * 100 * 10) / 10 : 0;

      // Calls today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const callsToday = allCalls.filter((c) => c.start_timestamp && c.start_timestamp >= todayStart.getTime()).length;

      // Calls over time (last 10 days)
      const callsByDay: Record<string, { calls: number; answered: number; booked: number }> = {};
      for (let i = 9; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        callsByDay[key] = { calls: 0, answered: 0, booked: 0 };
      }
      for (const c of allCalls) {
        if (!c.start_timestamp) continue;
        const d = new Date(c.start_timestamp);
        const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (callsByDay[key]) {
          callsByDay[key].calls++;
          if (c.disconnection_reason !== "no_answer_from_user") callsByDay[key].answered++;
          if (c.call_analysis?.call_successful === true || c.call_analysis?.custom_analysis_data?.appointment_booked === true) callsByDay[key].booked++;
        }
      }
      const callsOverTime = Object.entries(callsByDay).map(([date, data]) => ({ date, ...data }));

      // Recent calls (top 20)
      const recentCalls = allCalls.slice(0, 20).map((c) => {
        const duration = (c.end_timestamp && c.start_timestamp) ? formatDuration(c.end_timestamp - c.start_timestamp) : "0:00";
        const isBooked = c.call_analysis?.call_successful === true || c.call_analysis?.custom_analysis_data?.appointment_booked === true;
        const isNoAnswer = c.disconnection_reason === "no_answer_from_user";
        const isVoicemail = c.disconnection_reason === "voicemail_reached" || c.call_analysis?.in_voicemail === true;
        let outcome = "Unsuccessful";
        if (isBooked) outcome = "Booked";
        else if (isNoAnswer) outcome = "No Answer";
        else if (isVoicemail) outcome = "Voicemail";

        return {
          id: c.call_id,
          time: c.start_timestamp ? new Date(c.start_timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "",
          lead: c.retell_llm_dynamic_variables?.customer_name || c.metadata?.customer_name || "Unknown",
          phone: c.to_phone_number || c.from_phone_number || "",
          campaign: c.metadata?.campaign_name || c.retell_llm_dynamic_variables?.campaign_name || "—",
          duration,
          outcome,
          sentiment: c.call_analysis?.user_sentiment || "Neutral",
          cost: c.cost || 0,
          agent_id: c.agent_id,
        };
      });

      return new Response(
        JSON.stringify({
          stats: {
            totalCalls,
            callsToday,
            answerRate,
            avgDuration: formatDuration(avgDurationMs),
            totalDuration: formatDuration(durations.reduce((a, b) => a + b, 0)),
            appointmentsBooked: booked,
            totalCost,
            positiveSentiment: positivePct,
          },
          outcomeDistribution: [
            { name: "Booked", value: booked, fill: "hsl(160 84% 39%)" },
            { name: "Unsuccessful", value: Math.max(0, unsuccessful), fill: "hsl(0 84% 60%)" },
            { name: "No Answer", value: noAnswer, fill: "hsl(218 11% 65%)" },
            { name: "Voicemail", value: voicemail, fill: "hsl(38 92% 50%)" },
          ],
          callsOverTime,
          recentCalls,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Default: list agents
    const response = await fetch("https://api.retellai.com/list-agents", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: `Retell API error [${response.status}]: ${errorText}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const agents = await response.json();

    if (withStats && Array.isArray(agents)) {
      const agentsWithStats = await Promise.all(
        agents.map(async (agent: any) => {
          const calls = await fetchCallsForAgent(apiKey, agent.agent_id);
          const totalCalls = calls.length;
          const booked = calls.filter(
            (c: any) => c.call_analysis?.call_successful === true || c.call_analysis?.custom_analysis_data?.appointment_booked === true
          ).length;
          return { ...agent, stats: { totalCalls, booked } };
        })
      );
      return new Response(JSON.stringify({ agents: agentsWithStats }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ agents }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
