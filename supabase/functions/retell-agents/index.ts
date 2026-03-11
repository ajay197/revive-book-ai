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

  if (!response.ok) return { totalCalls: 0, booked: 0 };

  const calls = await response.json();
  const callList = Array.isArray(calls) ? calls : [];
  const totalCalls = callList.length;
  const booked = callList.filter(
    (c: any) => c.call_analysis?.call_successful === true || c.call_analysis?.custom_analysis_data?.appointment_booked === true
  ).length;

  return { totalCalls, booked };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { apiKey, withStats } = await req.json();
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
          const stats = await fetchCallsForAgent(apiKey, agent.agent_id);
          return {
            ...agent,
            stats,
          };
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
