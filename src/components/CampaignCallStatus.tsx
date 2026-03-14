import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type ActiveLead = {
  id: string;
  name: string;
  phone: string;
};

export const CampaignCallStatus = ({
  campaignId,
  campaignStatus,
}: {
  campaignId: string;
  campaignStatus: string;
}) => {
  const [activeLead, setActiveLead] = useState<ActiveLead | null>(null);

  const fetchActiveLead = async () => {
    if (campaignStatus !== "Running") {
      setActiveLead(null);
      return;
    }

    const { data } = await supabase
      .from("campaign_leads")
      .select("lead_id, leads!campaign_leads_lead_id_fkey(id, name, phone)")
      .eq("campaign_id", campaignId)
      .eq("status", "Queued")
      .not("retell_call_id", "is", null)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const leadData = data?.leads;
    if (leadData && !Array.isArray(leadData)) {
      setActiveLead({ id: leadData.id, name: leadData.name, phone: leadData.phone });
    } else {
      setActiveLead(null);
    }
  };

  useEffect(() => {
    fetchActiveLead();

    if (campaignStatus !== "Running") return;

    const channel = supabase
      .channel(`campaign-calls-${campaignId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "campaign_leads",
          filter: `campaign_id=eq.${campaignId}`,
        },
        () => {
          fetchActiveLead();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campaignId, campaignStatus]);

  if (campaignStatus !== "Running" || !activeLead) return null;

  return (
    <div className="mt-1 flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
      </span>
      <span className="max-w-[140px] truncate text-xs text-muted-foreground">
        Calling {activeLead.name}
      </span>
    </div>
  );
};
