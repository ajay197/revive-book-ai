import { useEffect, useState } from "react";
import { Phone, PhoneOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ActiveLead {
  id: string;
  name: string;
  phone: string;
  status: string | null;
}

export const CampaignCallStatus = ({ campaignName, campaignStatus }: { campaignName: string; campaignStatus: string }) => {
  const [activeLead, setActiveLead] = useState<ActiveLead | null>(null);

  const fetchActiveLead = async () => {
    if (campaignStatus !== "Running") {
      setActiveLead(null);
      return;
    }

    const { data } = await supabase
      .from("leads")
      .select("id, name, phone, status")
      .eq("campaign", campaignName)
      .eq("status", "Queued")
      .not("retell_call_id", "is", null)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setActiveLead(data);
  };

  useEffect(() => {
    fetchActiveLead();

    if (campaignStatus !== "Running") return;

    const channel = supabase
      .channel(`campaign-calls-${campaignName}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "leads",
          filter: `campaign=eq.${campaignName}`,
        },
        () => {
          fetchActiveLead();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campaignName, campaignStatus]);

  if (campaignStatus !== "Running" || !activeLead) return null;

  return (
    <div className="flex items-center gap-1.5 mt-1">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
      </span>
      <span className="text-xs text-muted-foreground truncate max-w-[140px]">
        Calling {activeLead.name}
      </span>
    </div>
  );
};
