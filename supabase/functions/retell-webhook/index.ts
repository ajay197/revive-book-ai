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

    // We only care about call completion events
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
    const userId = metadata.user_id;

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

    // Update lead status
    await supabase.from("leads").update({
      status: leadStatus,
    }).eq("id", leadId);

    // Deduct credits based on call duration
    const durationMs = (call?.end_timestamp && call?.start_timestamp)
      ? call.end_timestamp - call.start_timestamp
      : 0;
    const durationSeconds = Math.round(durationMs / 1000);

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
          cost: (Number(campaign.cost) || 0) + (call?.cost || 0),
        };
        if (isBooked) {
          updates.appointments_booked = (campaign.appointments_booked || 0) + 1;
        }
        await supabase.from("campaigns").update(updates).eq("id", campaignId);

        // If campaign is still running, trigger the next call
        if (campaign.status === "Running") {
          // Call the campaign-caller function to initiate next call
          const callerUrl = `${supabaseUrl}/functions/v1/campaign-caller`;
          const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

          // Fire and forget — don't wait for response to avoid webhook timeout
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

    return new Response(JSON.stringify({ ok: true, leadStatus, durationSeconds }), {
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
