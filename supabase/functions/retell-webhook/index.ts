import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const { event, call } = payload;

    if (event !== "call_ended" && event !== "call_analyzed") {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const callId = call?.call_id;
    const metadata = call?.metadata || {};
    const leadId = metadata.lead_id;
    const campaignId = metadata.campaign_id;
    const campaignLeadId = metadata.campaign_lead_id;
    const userId = metadata.user_id;
    const attemptNumber = metadata.attempt_number || 1;

    if (!callId || !leadId || !userId) {
      console.warn("Webhook missing metadata:", { callId, leadId, userId });
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine call outcome
    const disconnectionReason = call?.disconnection_reason;
    const callAnalysis = call?.call_analysis;
    const isBooked = callAnalysis?.call_successful === true ||
      callAnalysis?.custom_analysis_data?.appointment_booked === true;
    const isNoAnswer = disconnectionReason === "no_answer_from_user";
    const isVoicemail = disconnectionReason === "voicemail_reached" ||
      callAnalysis?.in_voicemail === true;

    let leadStatus = "Unsuccessful";
    if (isBooked) leadStatus = "Booked";
    else if (isNoAnswer) leadStatus = "No Answer";
    else if (isVoicemail) leadStatus = "Voicemail";
    else if (call?.call_status === "ended") leadStatus = "Called";

    // Calculate duration
    const durationMs = (call?.end_timestamp && call?.start_timestamp)
      ? call.end_timestamp - call.start_timestamp
      : 0;
    const durationSeconds = Math.round(durationMs / 1000);
    const callCost = call?.cost || 0;
    const sentiment = callAnalysis?.user_sentiment || null;

    // Update call log entry
    await supabase.from("call_logs").update({
      status: leadStatus,
      duration_seconds: durationSeconds,
      cost: callCost,
      sentiment,
      disconnection_reason: disconnectionReason || null,
      call_analysis: callAnalysis || null,
      ended_at: new Date().toISOString(),
    }).eq("retell_call_id", callId);

    // Update campaign_leads status (per-campaign tracking)
    let shouldRetry = false;

    if (campaignId && campaignLeadId && (isNoAnswer || isVoicemail || leadStatus === "Unsuccessful")) {
      const { data: campaign } = await supabase
        .from("campaigns")
        .select("max_retries, retry_delay, status")
        .eq("id", campaignId)
        .single();

      if (campaign && campaign.max_retries && campaign.max_retries > 0) {
        // Get current retry count from campaign_leads
        const { data: cl } = await supabase
          .from("campaign_leads")
          .select("retry_count")
          .eq("id", campaignLeadId)
          .single();

        const currentRetries = cl?.retry_count || 0;
        if (currentRetries < campaign.max_retries) {
          shouldRetry = true;
          const retryDelayMinutes = campaign.retry_delay || 60;
          const nextRetryAt = new Date(Date.now() + retryDelayMinutes * 60 * 1000).toISOString();

          // Mark campaign_lead for retry
          await supabase.from("campaign_leads").update({
            status: leadStatus,
            retell_call_id: null,
            retry_count: currentRetries + 1,
            next_retry_at: nextRetryAt,
          }).eq("id", campaignLeadId);
        }
      }
    }

    // If not retrying, update campaign_leads status
    if (!shouldRetry && campaignLeadId) {
      await supabase.from("campaign_leads").update({
        status: leadStatus,
      }).eq("id", campaignLeadId);
    }

    // Also update the lead's global status for display purposes
    await supabase.from("leads").update({
      status: leadStatus,
    }).eq("id", leadId);

    // Deduct credits
    if (durationSeconds > 0 && userId) {
      await supabase.rpc("deduct_call_credits", {
        p_user_id: userId,
        p_call_id: callId,
        p_duration_seconds: durationSeconds,
        p_campaign_id: campaignId || null,
      });
    }

    // Update campaign stats
    if (campaignId) {
      const { data: campaign } = await supabase
        .from("campaigns")
        .select("appointments_booked, cost, status")
        .eq("id", campaignId)
        .single();

      if (campaign) {
        const updates: Record<string, any> = {
          cost: (Number(campaign.cost) || 0) + callCost,
        };
        if (isBooked) {
          updates.appointments_booked = (campaign.appointments_booked || 0) + 1;
        }
        await supabase.from("campaigns").update(updates).eq("id", campaignId);

        // Trigger next call if campaign is still running
        if (campaign.status === "Running") {
          const callerUrl = `${supabaseUrl}/functions/v1/campaign-caller`;
          const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

          fetch(callerUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${anonKey}`,
            },
            body: JSON.stringify({ campaignId, userId }),
          }).catch((err) => console.error("Failed to trigger next call:", err));
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, leadStatus, durationSeconds, shouldRetry }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("retell-webhook error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
