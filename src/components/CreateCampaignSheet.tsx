import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RetellAgent } from "@/components/RetellConnectDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Rocket,
  FileText,
  Bot,
  Clock,
  ClipboardCheck,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const CAMPAIGN_TYPES = [
  { value: "Old Lead Reactivation", label: "Old Lead Reactivation", desc: "Re-engage dormant CRM leads" },
  { value: "Facebook Lead Follow-up", label: "Facebook Lead Follow-up", desc: "Instant follow-up on Facebook leads" },
  { value: "Appointment Reminder", label: "Appointment Reminder", desc: "Confirm upcoming appointments" },
  { value: "Lead Qualification", label: "Lead Qualification", desc: "Qualify and route inbound leads" },
];

type Step = 1 | 2 | 3 | 4 | 5;

const STEPS: { step: Step; label: string; icon: React.ElementType }[] = [
  { step: 1, label: "Name", icon: FileText },
  { step: 2, label: "Type", icon: ClipboardCheck },
  { step: 3, label: "Agent", icon: Bot },
  { step: 4, label: "Window", icon: Clock },
  { step: 5, label: "Review", icon: CheckCircle2 },
];

interface CreateCampaignSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

export function CreateCampaignSheet({ open, onOpenChange, onCreated }: CreateCampaignSheetProps) {
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [campaignType, setCampaignType] = useState("");
  const [agentId, setAgentId] = useState("");
  const [agentName, setAgentName] = useState("");
  const [windowStart, setWindowStart] = useState("09:00");
  const [windowEnd, setWindowEnd] = useState("17:00");
  const [timezone, setTimezone] = useState("America/New_York");
  const [maxRetries, setMaxRetries] = useState("3");
  const [retryDelay, setRetryDelay] = useState("24");
  const [callInterval, setCallInterval] = useState("5");
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const [retellAgents, setRetellAgents] = useState<RetellAgent[]>([]);
  const isRetellConnected = localStorage.getItem("retell_connected") === "true";

  useEffect(() => {
    if (isRetellConnected) {
      try {
        const stored = localStorage.getItem("retell_agents");
        if (stored) setRetellAgents(JSON.parse(stored));
      } catch {}
    }
  }, [isRetellConnected]);

  const reset = () => {
    setStep(1);
    setName("");
    setCampaignType("");
    setAgentId("");
    setAgentName("");
    setWindowStart("09:00");
    setWindowEnd("17:00");
    setTimezone("America/New_York");
    setMaxRetries("3");
    setRetryDelay("24");
    setCallInterval("5");
  };

  const handleClose = (val: boolean) => {
    if (!val) reset();
    onOpenChange(val);
  };

  const canNext = (): boolean => {
    switch (step) {
      case 1: return name.trim().length > 0;
      case 2: return campaignType !== "";
      case 3: return agentId !== "";
      case 4: return windowStart !== "" && windowEnd !== "";
      default: return true;
    }
  };

  const handleLaunch = async () => {
    if (!user) return;
    setSaving(true);

    const { data: campaignData, error } = await supabase.from("campaigns").insert({
      user_id: user.id,
      name,
      type: campaignType,
      agent_id: agentId,
      agent_name: agentName,
      status: "Draft",
      window_start: windowStart,
      window_end: windowEnd,
      timezone,
      max_retries: parseInt(maxRetries) || 3,
      retry_delay: parseInt(retryDelay) || 24,
      call_interval_minutes: campaignType === "Old Lead Reactivation" ? (parseInt(callInterval) || 5) : 0,
    } as any).select("id").single();

    if (error || !campaignData) {
      setSaving(false);
      toast.error("Failed to create campaign");
      return;
    }

    // Fetch agent's phone numbers from Retell and register them
    const apiKey = localStorage.getItem("retell_api_key");
    if (apiKey && agentId) {
      try {
        const { data: phonesRes } = await supabase.functions.invoke("retell-agents", {
          body: { apiKey, mode: "phone-numbers" },
        });

        const phoneNumbers = phonesRes?.phoneNumbers;
        if (Array.isArray(phoneNumbers)) {
          // Filter phone numbers assigned to this agent
          const agentPhones = phoneNumbers.filter(
            (p: any) => p.outbound_agent_id === agentId || p.inbound_agent_id === agentId
          );

          for (const phone of agentPhones) {
            // Insert with unique constraint protection (won't duplicate)
            const { error: insertError } = await supabase
              .from("phone_number_purchases")
              .insert({
                user_id: user.id,
                phone_number: phone.phone_number_pretty || phone.phone_number,
                phone_number_id: phone.phone_number_id,
                credits_deducted: 2,
                campaign_id: campaignData.id,
                campaign_name: name,
                agent_id: agentId,
                agent_name: agentName,
              } as any);

            if (insertError) {
              // Already registered — skip
              console.warn("Phone already registered:", insertError.message);
              continue;
            }

            // Deduct 2 credits for the new phone number
            await supabase.functions.invoke("deduct-credits", {
              body: {
                userId: user.id,
                callId: `phone-purchase-${phone.phone_number_id}-${campaignData.id}`,
                durationSeconds: 2 * 150, // 2 credits
                campaignId: campaignData.id,
              },
            });
          }

          if (agentPhones.length > 0) {
            toast.success(`${agentPhones.length} phone number(s) registered. ${agentPhones.length * 2} credits deducted.`);
          }
        }
      } catch (err) {
        console.error("Failed to register phone numbers:", err);
      }
    }

    setSaving(false);
    toast.success(`Campaign "${name}" created successfully!`);
    handleClose(false);
    onCreated?.();
  };

  const selectedAgent = retellAgents.find((a) => a.agent_id === agentId);
  const selectedType = CAMPAIGN_TYPES.find((t) => t.value === campaignType);

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-lg flex flex-col gap-0 p-0 overflow-hidden">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="font-display text-lg font-bold text-foreground">
            Create Campaign
          </SheetTitle>
          <div className="flex items-center gap-1 mt-3">
            {STEPS.map((s, i) => (
              <div key={s.step} className="flex items-center gap-1 flex-1">
                <div
                  className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-medium transition-colors shrink-0 ${
                    step === s.step
                      ? "bg-primary text-primary-foreground"
                      : step > s.step
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s.step ? <CheckCircle2 className="h-3.5 w-3.5" /> : s.step}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px flex-1 ${step > s.step ? "bg-primary/30" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Step {step} of {STEPS.length} — {STEPS[step - 1].label}
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Step 1 — Name */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-name" className="text-sm font-medium">Campaign Name</Label>
                <Input
                  id="campaign-name"
                  placeholder="e.g. Spring Reactivation 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Give your campaign a descriptive name so you can find it later.
                </p>
              </div>
            </div>
          )}

          {/* Step 2 — Type */}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-1">What type of campaign is this?</p>
              {CAMPAIGN_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setCampaignType(t.value)}
                  className={`w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                    campaignType === t.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:border-primary/30 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                  {campaignType === t.value && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                </button>
              ))}
            </div>
          )}

          {/* Step 3 — Agent */}
          {step === 3 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-1">Choose an AI voice agent for this campaign.</p>
              {isRetellConnected && retellAgents.length > 0 ? (
                retellAgents.map((a) => (
                  <button
                    key={a.agent_id}
                    onClick={() => { setAgentId(a.agent_id); setAgentName(a.agent_name || a.agent_id); }}
                    className={`w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                      agentId === a.agent_id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border hover:border-primary/30 hover:bg-muted/50"
                    }`}
                  >
                    <div className="rounded-lg bg-muted p-2"><Bot className="h-4 w-4 text-primary" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{a.agent_name || a.agent_id}</p>
                      <p className="text-xs text-muted-foreground">Retell AI Agent</p>
                    </div>
                    {agentId === a.agent_id && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                  </button>
                ))
              ) : (
                <div className="text-center py-6 space-y-2">
                  <Bot className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    {!isRetellConnected
                      ? "Connect Retell AI in Integrations to use voice agents."
                      : "No agents found. Create agents in your Retell AI dashboard."}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4 — Calling Window & Settings */}
          {step === 4 && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">Set the daily calling window and retry settings.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="win-start" className="text-sm font-medium">Calling Start Time</Label>
                  <Input id="win-start" type="time" value={windowStart} onChange={(e) => setWindowStart(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="win-end" className="text-sm font-medium">Calling End Time</Label>
                  <Input id="win-end" type="time" value={windowEnd} onChange={(e) => setWindowEnd(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone" className="text-sm font-medium">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger id="timezone"><SelectValue placeholder="Select timezone" /></SelectTrigger>
                  <SelectContent>
                    {["America/New_York","America/Chicago","America/Denver","America/Los_Angeles","America/Anchorage","Pacific/Honolulu","America/Phoenix","America/Toronto","America/Vancouver","Europe/London","Europe/Paris","Europe/Berlin","Asia/Dubai","Asia/Kolkata","Asia/Singapore","Asia/Tokyo","Australia/Sydney"].map((tz) => (
                      <SelectItem key={tz} value={tz}>{tz.replace(/_/g, " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max-retries" className="text-sm font-medium">Max Retries</Label>
                  <Input id="max-retries" type="number" min="0" max="10" value={maxRetries} onChange={(e) => setMaxRetries(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retry-delay" className="text-sm font-medium">Retry Delay (hours)</Label>
                  <Input id="retry-delay" type="number" min="1" max="168" value={retryDelay} onChange={(e) => setRetryDelay(e.target.value)} />
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
                <Clock className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
                Calls run {windowStart} – {windowEnd} daily ({timezone.replace(/_/g, " ")}). Up to {maxRetries} retries with {retryDelay}h delay.
              </div>
            </div>
          )}

          {/* Step 5 — Review */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-3 pb-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <Rocket className="h-7 w-7 text-primary" />
                </div>
                <p className="text-lg font-semibold text-foreground">Ready to launch</p>
                <p className="text-sm text-muted-foreground text-center">Review your campaign setup before going live.</p>
              </div>
              <div className="divide-y rounded-xl border bg-card">
                {[
                  { label: "Campaign Name", value: name },
                  { label: "Campaign Type", value: selectedType?.label },
                  { label: "AI Agent", value: agentName || selectedAgent?.agent_name },
                  { label: "Calling Window", value: `${windowStart} – ${windowEnd}` },
                  { label: "Timezone", value: timezone.replace(/_/g, " ") },
                  { label: "Max Retries", value: maxRetries },
                  { label: "Retry Delay", value: `${retryDelay} hours` },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-muted-foreground">{row.label}</span>
                    <span className="text-sm font-medium text-foreground">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-6 py-4 bg-muted/30">
          <Button
            variant="ghost"
            onClick={() => {
              if (step === 1) handleClose(false);
              else setStep((step - 1) as Step);
            }}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            {step === 1 ? "Cancel" : "Back"}
          </Button>

          {step < 5 ? (
            <Button
              onClick={() => setStep((step + 1) as Step)}
              disabled={!canNext()}
              className="bg-gradient-primary"
            >
              Continue <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleLaunch} disabled={saving} className="bg-gradient-primary">
              {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Rocket className="mr-1.5 h-4 w-4" />}
              Create Campaign
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
