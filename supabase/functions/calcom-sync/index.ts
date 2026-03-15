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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const { action, apiKey: providedApiKey, eventTypeId } = body;

    // Cron-triggered sync: no user auth needed, syncs ALL connected users
    if (action === "cron_sync") {
      const { data: integrations } = await supabase
        .from("user_integrations")
        .select("user_id, api_key")
        .eq("provider", "calcom");

      if (!integrations || integrations.length === 0) {
        return new Response(JSON.stringify({ message: "No Cal.com integrations found" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const calcomBase = "https://api.cal.com/v1";
      let totalSynced = 0;

      for (const integration of integrations) {
        const calcomApiKey = integration.api_key;
        const userId = integration.user_id;
        const statuses = ["upcoming", "past", "cancelled"];
        let allBookings: any[] = [];

        for (const status of statuses) {
          try {
            const res = await fetch(`${calcomBase}/bookings?apiKey=${calcomApiKey}&status=${status}`);
            if (!res.ok) continue;
            const data = await res.json();
            allBookings = allBookings.concat(data.bookings || []);
          } catch {
            continue;
          }
        }

        for (const booking of allBookings) {
          const attendee = booking.attendees?.[0];
          const attendeeEmail = attendee?.email || null;
          const attendeePhone = attendee?.phone || booking.metadata?.phone || null;

          let leadId: string | null = null;
          if (attendeeEmail) {
            const { data: leadByEmail } = await supabase.from("leads").select("id").eq("user_id", userId).eq("email", attendeeEmail).limit(1).maybeSingle();
            if (leadByEmail) leadId = leadByEmail.id;
          }
          if (!leadId && attendeePhone) {
            const { data: leadByPhone } = await supabase.from("leads").select("id").eq("user_id", userId).eq("phone", attendeePhone).limit(1).maybeSingle();
            if (leadByPhone) leadId = leadByPhone.id;
          }

          const bookingData = {
            user_id: userId,
            calcom_booking_id: booking.id,
            title: booking.title || "Booking",
            description: booking.description || null,
            start_time: booking.startTime,
            end_time: booking.endTime,
            status: (booking.status || "accepted").toLowerCase(),
            attendee_name: attendee?.name || null,
            attendee_email: attendeeEmail,
            attendee_phone: attendeePhone,
            event_type_name: booking.eventType?.title || null,
            event_type_id: booking.eventType?.id || null,
            meeting_url: booking.metadata?.videoCallUrl || booking.location || null,
            location: booking.location || null,
            lead_id: leadId,
            metadata: { responses: booking.responses || {}, source: booking.source || null, uid: booking.uid },
            updated_at: new Date().toISOString(),
          };

          const { error } = await supabase.from("bookings").upsert(bookingData, { onConflict: "calcom_booking_id,user_id" });
          if (!error) totalSynced++;
        }
      }

      return new Response(JSON.stringify({ synced: totalSynced, users: integrations.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // All other actions require user auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get or use provided API key
    let calcomApiKey = providedApiKey;
    if (!calcomApiKey) {
      const { data: integration } = await supabase
        .from("user_integrations")
        .select("api_key")
        .eq("user_id", user.id)
        .eq("provider", "calcom")
        .single();
      calcomApiKey = integration?.api_key;
    }

    if (!calcomApiKey) {
      return new Response(JSON.stringify({ error: "Cal.com API key not configured" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const calcomBase = "https://api.cal.com/v1";

    if (action === "fetch_event_types") {
      const res = await fetch(`${calcomBase}/event-types?apiKey=${calcomApiKey}`);
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Cal.com API error: ${res.status} ${errText}`);
      }
      const data = await res.json();
      const eventTypes = (data.event_types || []).map((et: any) => ({
        id: et.id,
        title: et.title,
        slug: et.slug,
        length: et.length,
        description: et.description,
        bookingFields: (et.bookingFields || []).map((f: any) => ({
          name: f.name,
          type: f.type,
          label: f.label || f.name,
          required: f.required ?? false,
          placeholder: f.placeholder || "",
          options: f.options || undefined,
          hidden: f.hidden ?? false,
          editable: f.editable ?? "user",
        })),
      }));
      return new Response(JSON.stringify({ event_types: eventTypes }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "fetch_slots") {
      const { eventTypeId: slotEventTypeId, startTime: slotStart, endTime: slotEnd, timeZone: slotTz } = body;
      if (!slotEventTypeId || !slotStart || !slotEnd) {
        return new Response(JSON.stringify({ error: "Missing eventTypeId, startTime, or endTime" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const tz = slotTz || "America/New_York";
      const slotsUrl = `${calcomBase}/slots?apiKey=${calcomApiKey}&eventTypeId=${slotEventTypeId}&startTime=${slotStart}&endTime=${slotEnd}&timeZone=${encodeURIComponent(tz)}`;
      const res = await fetch(slotsUrl);
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Cal.com slots API error: ${res.status} ${errText}`);
      }
      const data = await res.json();
      const rawSlots = data?.slots || {};
      const normalizedSlots: Record<string, string[]> = {};

      const extractIso = (value: any, fallback?: string): string | null => {
        if (typeof value === "string") {
          return value.includes("T") ? value : null;
        }
        if (value && typeof value === "object") {
          return value.time || value.start || value.startTime || (typeof fallback === "string" && fallback.includes("T") ? fallback : null) || null;
        }
        return typeof fallback === "string" && fallback.includes("T") ? fallback : null;
      };

      for (const [dateKey, slotValue] of Object.entries(rawSlots)) {
        const values: string[] = [];

        if (Array.isArray(slotValue)) {
          for (const slot of slotValue) {
            const iso = extractIso(slot);
            if (iso) values.push(iso);
          }
        } else if (slotValue && typeof slotValue === "object") {
          for (const [k, v] of Object.entries(slotValue as Record<string, any>)) {
            if (Array.isArray(v)) {
              for (const item of v) {
                const iso = extractIso(item, k);
                if (iso) values.push(iso);
              }
            } else {
              const iso = extractIso(v, k);
              if (iso) values.push(iso);
            }
          }
        }

        normalizedSlots[dateKey] = [...new Set(values)].sort();
      }

      return new Response(JSON.stringify({ slots: normalizedSlots }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "sync_bookings") {
      // Fetch bookings from Cal.com - must query each status separately
      const statuses = ["upcoming", "past", "cancelled"];
      let allBookings: any[] = [];

      for (const status of statuses) {
        let url = `${calcomBase}/bookings?apiKey=${calcomApiKey}&status=${status}`;
        if (eventTypeId) {
          url += `&eventTypeId=${eventTypeId}`;
        }
        const res = await fetch(url);
        if (!res.ok) {
          console.warn(`Cal.com fetch for status=${status} failed: ${res.status}`);
          continue;
        }
        const data = await res.json();
        allBookings = allBookings.concat(data.bookings || []);
      }

      const bookings = allBookings;

      let synced = 0;
      for (const booking of bookings) {
        const attendee = booking.attendees?.[0];
        const attendeeEmail = attendee?.email || null;
        const attendeePhone = attendee?.phone || booking.metadata?.phone || null;

        // Auto-link to lead by matching email or phone
        let leadId: string | null = null;
        if (attendeeEmail || attendeePhone) {
          let query = supabase.from("leads").select("id").eq("user_id", user.id);
          if (attendeeEmail) {
            const { data: leadByEmail } = await query.eq("email", attendeeEmail).limit(1).maybeSingle();
            if (leadByEmail) leadId = leadByEmail.id;
          }
          if (!leadId && attendeePhone) {
            const { data: leadByPhone } = await supabase.from("leads").select("id").eq("user_id", user.id).eq("phone", attendeePhone).limit(1).maybeSingle();
            if (leadByPhone) leadId = leadByPhone.id;
          }
        }

        const bookingData = {
          user_id: user.id,
          calcom_booking_id: booking.id,
          title: booking.title || "Booking",
          description: booking.description || null,
          start_time: booking.startTime,
          end_time: booking.endTime,
          status: (booking.status || "accepted").toLowerCase(),
          attendee_name: attendee?.name || null,
          attendee_email: attendeeEmail,
          attendee_phone: attendeePhone,
          event_type_name: booking.eventType?.title || null,
          event_type_id: booking.eventType?.id || null,
          meeting_url: booking.metadata?.videoCallUrl || booking.location || null,
          location: booking.location || null,
          lead_id: leadId,
          metadata: {
            responses: booking.responses || {},
            source: booking.source || null,
            uid: booking.uid,
          },
          updated_at: new Date().toISOString(),
        };

        const { error: upsertError } = await supabase
          .from("bookings")
          .upsert(bookingData, {
            onConflict: "calcom_booking_id,user_id",
          });

        if (!upsertError) synced++;
      }

      // Save API key if provided for the first time
      if (providedApiKey) {
        await supabase.from("user_integrations").upsert(
          {
            user_id: user.id,
            provider: "calcom",
            api_key: providedApiKey,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,provider" }
        );
      }

      return new Response(JSON.stringify({ synced, total: bookings.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "create_booking") {
      const { attendeeName, attendeeEmail, attendeePhone, eventTypeId, startTime, timeZone, customResponses } = body;
      if (!eventTypeId || !startTime || !attendeeName || !attendeeEmail) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const phone = attendeePhone || "";
      const responses: Record<string, any> = {
        name: attendeeName,
        email: attendeeEmail,
        attendeePhoneNumber: phone,
        smsReminderNumber: phone,
      };
      if (attendeePhone) responses.phone = attendeePhone;

      // Merge custom field responses
      if (customResponses && typeof customResponses === "object") {
        for (const [key, value] of Object.entries(customResponses)) {
          if (value !== undefined && value !== "") {
            responses[key] = value;
          }
        }
      }

      const bookingPayload = {
        eventTypeId: Number(eventTypeId),
        start: startTime,
        responses,
        timeZone: timeZone || "America/New_York",
        language: "en",
        metadata: {},
      };

      const res = await fetch(`${calcomBase}/bookings?apiKey=${calcomApiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Cal.com create booking error:", errText);
        throw new Error(`Failed to create booking on Cal.com: ${res.status}`);
      }

      const result = await res.json();
      return new Response(JSON.stringify({ success: true, booking: result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "reschedule_booking") {
      const { calcomBookingId, bookingUid, newStart, newEnd, rescheduleReason } = body;
      if (!calcomBookingId || !bookingUid) {
        return new Response(JSON.stringify({ error: "Missing calcomBookingId or bookingUid" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Prefer Cal.com API v2 reschedule endpoint using the booking UID
      const calcomV2Base = "https://api.cal.com/v2";
      const rescheduleUrl = `${calcomV2Base}/bookings/${bookingUid}/reschedule`;
      const res = await fetch(rescheduleUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${calcomApiKey}`,
          "cal-api-version": "2024-08-13",
        },
        body: JSON.stringify({
          start: newStart,
          rescheduledBy: "Lead Revival AI",
          reschedulingReason: rescheduleReason || "Rescheduled from Lead Revival AI",
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Cal.com reschedule error:", errText);
        throw new Error(`Failed to reschedule on Cal.com: ${res.status}`);
      }

      const result = await res.json();
      return new Response(JSON.stringify({ success: true, booking: result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "cancel_booking") {
      const { calcomBookingId, uid } = body;
      if (!calcomBookingId && !uid) {
        return new Response(JSON.stringify({ error: "Missing calcomBookingId or uid" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Cal.com v1 cancel endpoint: DELETE /v1/bookings/:id
      const bookingIdToCancel = calcomBookingId;
      const cancelUrl = `${calcomBase}/bookings/${bookingIdToCancel}/cancel?apiKey=${calcomApiKey}`;
      const res = await fetch(cancelUrl, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Cal.com cancel error:", errText);
        throw new Error(`Failed to cancel booking on Cal.com: ${res.status}`);
      }

      return new Response(JSON.stringify({ success: true, cancelled: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "connect") {
      // Verify API key by fetching event types
      const res = await fetch(`${calcomBase}/event-types?apiKey=${calcomApiKey}`);
      if (!res.ok) {
        throw new Error("Invalid Cal.com API key");
      }
      const data = await res.json();

      // Save API key
      // Need unique constraint on user_id + provider for upsert
      const { data: existing } = await supabase
        .from("user_integrations")
        .select("id")
        .eq("user_id", user.id)
        .eq("provider", "calcom")
        .single();

      if (existing) {
        await supabase.from("user_integrations").update({
          api_key: calcomApiKey,
          updated_at: new Date().toISOString(),
        }).eq("id", existing.id);
      } else {
        await supabase.from("user_integrations").insert({
          user_id: user.id,
          provider: "calcom",
          api_key: calcomApiKey,
        });
      }

      const eventTypes = (data.event_types || []).map((et: any) => ({
        id: et.id,
        title: et.title,
        slug: et.slug,
        length: et.length,
      }));

      return new Response(JSON.stringify({ connected: true, event_types: eventTypes }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "disconnect") {
      await supabase.from("user_integrations")
        .delete()
        .eq("user_id", user.id)
        .eq("provider", "calcom");

      return new Response(JSON.stringify({ disconnected: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("calcom-sync error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
