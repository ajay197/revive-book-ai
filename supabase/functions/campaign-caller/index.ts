import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaignId, userId } = await req.json();
    if (!campaignId || !userId) {
      return new Response(JSON.stringify({ error: "campaignId and userId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get campaign details
    const { data: campaign, error: campError } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .eq("user_id", userId)
      .single();

    if (campError || !campaign) {
      return new Response(JSON.stringify({ error: "Campaign not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (campaign.status !== "Running") {
      return new Response(JSON.stringify({ error: "Campaign is not running", status: campaign.status }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user's Retell API key
    const { data: integration } = await supabase
      .from("user_integrations")
      .select("api_key")
      .eq("user_id", userId)
      .eq("provider", "retell")
      .single();

    if (!integration?.api_key) {
      return new Response(JSON.stringify({ error: "Retell API key not found. Please reconnect Retell AI." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check user credits
    const { data: credits } = await supabase
      .from("user_credits")
      .select("balance_credits")
      .eq("user_id", userId)
      .single();

    if (!credits || credits.balance_credits <= 5) {
      // Pause campaign due to insufficient credits
      await supabase.from("campaigns").update({ status: "Paused" }).eq("id", campaignId);
      return new Response(JSON.stringify({ error: "Insufficient credits. Campaign paused." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find next lead to call: assigned to this campaign with status 'New' or 'Queued'
    const { data: nextLead, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .eq("campaign", campaign.name)
      .eq("user_id", userId)
      .in("status", ["New", "Queued"])
      .is("retell_call_id", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (leadError || !nextLead) {
      // No more leads to call — mark campaign as Completed
      await supabase.from("campaigns").update({ status: "Completed" }).eq("id", campaignId);
      return new Response(JSON.stringify({ message: "No more leads to call. Campaign completed.", completed: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the agent's phone number from Retell
    const phoneRes = await fetch("https://api.retellai.com/list-phone-numbers", {
      headers: { Authorization: `Bearer ${integration.api_key}` },
    });
    const phoneNumbers = await phoneRes.json();
    const agentPhone = Array.isArray(phoneNumbers)
      ? phoneNumbers.find((p: any) => p.outbound_agent_id === campaign.agent_id)
      : null;

    if (!agentPhone) {
      return new Response(JSON.stringify({ error: "No phone number found for this agent. Please assign a phone number to your agent in Retell AI." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create the outbound call via Retell AI
    const callRes = await fetch("https://api.retellai.com/v2/create-phone-call", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${integration.api_key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from_number: agentPhone.phone_number,
        to_number: nextLead.phone,
        override_agent_id: campaign.agent_id,
        retell_llm_dynamic_variables: {
          customer_name: nextLead.name,
          customer_email: nextLead.email || "",
          customer_company: nextLead.company || "",
          campaign_name: campaign.name,
          campaign_type: campaign.type,
        },
        metadata: {
          lead_id: nextLead.id,
          campaign_id: campaign.id,
          campaign_name: campaign.name,
          user_id: userId,
        },
      }),
    });

    if (!callRes.ok) {
      const errText = await callRes.text();
      console.error("Retell create call error:", callRes.status, errText);

      // Mark lead as failed so we can try next one
      await supabase.from("leads").update({ status: "Unsuccessful" }).eq("id", nextLead.id);

      return new Response(JSON.stringify({ error: `Failed to create call: ${errText}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callData = await callRes.json();
    const callId = callData.call_id;

    // Update lead with call ID and status
    await supabase.from("leads").update({
      status: "Queued",
      retell_call_id: callId,
    }).eq("id", nextLead.id);

    // Increment calls_completed on campaign
    await supabase.from("campaigns").update({
      calls_completed: (campaign.calls_completed || 0) + 1,
    }).eq("id", campaignId);

    return new Response(JSON.stringify({
      success: true,
      callId,
      leadId: nextLead.id,
      leadName: nextLead.name,
      leadPhone: nextLead.phone,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("campaign-caller error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
