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
import { agents as mockAgents, scripts } from "@/lib/mock-data";
import type { RetellAgent } from "@/components/RetellConnectDialog";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Rocket,
  FileText,
  Users,
  Bot,
  ScrollText,
  Clock,
  ClipboardCheck,
} from "lucide-react";
import { toast } from "sonner";

const CAMPAIGN_TYPES = [
  { value: "old_lead_reactivation", label: "Old Lead Reactivation", desc: "Re-engage dormant CRM leads" },
  { value: "facebook_followup", label: "Facebook Lead Follow-up", desc: "Instant follow-up on Facebook leads" },
  { value: "appointment_reminder", label: "Appointment Reminder", desc: "Confirm upcoming appointments" },
  { value: "lead_qualification", label: "Lead Qualification", desc: "Qualify and route inbound leads" },
];

const LEAD_LISTS = [
  { value: "spring", label: "Spring Reactivation List", count: 847 },
  { value: "fb_march", label: "FB Leads — March", count: 234 },
  { value: "hvac_q1", label: "HVAC Leads Q1", count: 412 },
  { value: "dental", label: "Dental Reactivation", count: 563 },
];

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const STEPS: { step: Step; label: string; icon: React.ElementType }[] = [
  { step: 1, label: "Name", icon: FileText },
  { step: 2, label: "Leads", icon: Users },
  { step: 3, label: "Type", icon: ClipboardCheck },
  { step: 4, label: "Agent", icon: Bot },
  { step: 5, label: "Script", icon: ScrollText },
  { step: 6, label: "Window", icon: Clock },
  { step: 7, label: "Review", icon: CheckCircle2 },
];

interface CreateCampaignSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCampaignSheet({ open, onOpenChange }: CreateCampaignSheetProps) {
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [leadList, setLeadList] = useState("");
  const [campaignType, setCampaignType] = useState("");
  const [agentId, setAgentId] = useState("");
  const [scriptId, setScriptId] = useState("");
  const [windowStart, setWindowStart] = useState("09:00");
  const [windowEnd, setWindowEnd] = useState("17:00");
  const [timezone, setTimezone] = useState("America/New_York");
  const [maxRetries, setMaxRetries] = useState("3");
  const [retryDelay, setRetryDelay] = useState("24");

  // Load Retell agents from localStorage
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
    setLeadList("");
    setCampaignType("");
    setAgentId("");
    setScriptId("");
    setWindowStart("09:00");
    setWindowEnd("17:00");
    setTimezone("America/New_York");
    setMaxRetries("3");
    setRetryDelay("24");
  };

  const handleClose = (val: boolean) => {
    if (!val) reset();
    onOpenChange(val);
  };

  const canNext = (): boolean => {
    switch (step) {
      case 1: return name.trim().length > 0;
      case 2: return leadList !== "";
      case 3: return campaignType !== "";
      case 4: return agentId !== "";
      case 5: return scriptId !== "";
      case 6: return windowStart !== "" && windowEnd !== "";
      default: return true;
    }
  };

  const handleLaunch = () => {
    toast.success(`Campaign "${name}" launched successfully!`);
    handleClose(false);
  };

  const selectedAgent = isRetellConnected
    ? retellAgents.find((a) => a.agent_id === agentId)
    : mockAgents.find((a) => a.id === agentId);
  const selectedAgentName = isRetellConnected
    ? (selectedAgent as RetellAgent)?.agent_name
    : (selectedAgent as (typeof mockAgents)[0])?.name;
  const selectedScript = scripts.find((s) => s.id === scriptId);
  const selectedList = LEAD_LISTS.find((l) => l.value === leadList);
  const selectedType = CAMPAIGN_TYPES.find((t) => t.value === campaignType);

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-lg flex flex-col gap-0 p-0 overflow-hidden">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="font-display text-lg font-bold text-foreground">
            Create Campaign
          </SheetTitle>
          {/* Step progress */}
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
                  {step > s.step ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    s.step
                  )}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-px flex-1 ${
                      step > s.step ? "bg-primary/30" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Step {step} of 7 — {STEPS[step - 1].label}
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Step 1 — Name */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-name" className="text-sm font-medium">
                  Campaign Name
                </Label>
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

          {/* Step 2 — Lead List */}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-1">
                Select a lead list for this campaign.
              </p>
              {LEAD_LISTS.map((list) => (
                <button
                  key={list.value}
                  onClick={() => setLeadList(list.value)}
                  className={`w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                    leadList === list.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:border-primary/30 hover:bg-muted/50"
                  }`}
                >
                  <div className="rounded-lg bg-muted p-2">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{list.label}</p>
                    <p className="text-xs text-muted-foreground">{list.count} leads</p>
                  </div>
                  {leadList === list.value && (
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Step 3 — Type */}
          {step === 3 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-1">
                What type of campaign is this?
              </p>
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
                  {campaignType === t.value && (
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Step 4 — Agent */}
          {step === 4 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-1">
                Choose an AI voice agent for this campaign.
              </p>
              {isRetellConnected && retellAgents.length > 0 ? (
                retellAgents.map((a) => (
                  <button
                    key={a.agent_id}
                    onClick={() => setAgentId(a.agent_id)}
                    className={`w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                      agentId === a.agent_id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border hover:border-primary/30 hover:bg-muted/50"
                    }`}
                  >
                    <div className="rounded-lg bg-muted p-2">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{a.agent_name || a.agent_id}</p>
                      <p className="text-xs text-muted-foreground">Retell AI Agent</p>
                    </div>
                    {agentId === a.agent_id && (
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    )}
                  </button>
                ))
              ) : !isRetellConnected ? (
                <div className="text-center py-6 space-y-2">
                  <Bot className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Connect Retell AI in Integrations to use voice agents.
                  </p>
                </div>
              ) : (
                <div className="text-center py-6 space-y-2">
                  <Bot className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    No agents found. Create agents in your Retell AI dashboard.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 5 — Script */}
          {step === 5 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-1">
                Select a calling script for the agent.
              </p>
              {scripts.filter((s) => s.active).map((s) => (
                <button
                  key={s.id}
                  onClick={() => setScriptId(s.id)}
                  className={`w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                    scriptId === s.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:border-primary/30 hover:bg-muted/50"
                  }`}
                >
                  <div className="rounded-lg bg-muted p-2">
                    <ScrollText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.category} · {s.objective}</p>
                  </div>
                  {scriptId === s.id && (
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Step 6 — Calling Window & Settings */}
          {step === 6 && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">
                Set the daily calling window and retry settings.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="win-start" className="text-sm font-medium">Calling Start Time</Label>
                  <Input
                    id="win-start"
                    type="time"
                    value={windowStart}
                    onChange={(e) => setWindowStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="win-end" className="text-sm font-medium">Calling End Time</Label>
                  <Input
                    id="win-end"
                    type="time"
                    value={windowEnd}
                    onChange={(e) => setWindowEnd(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone" className="text-sm font-medium">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "America/New_York",
                      "America/Chicago",
                      "America/Denver",
                      "America/Los_Angeles",
                      "America/Anchorage",
                      "Pacific/Honolulu",
                      "America/Phoenix",
                      "America/Toronto",
                      "America/Vancouver",
                      "Europe/London",
                      "Europe/Paris",
                      "Europe/Berlin",
                      "Asia/Dubai",
                      "Asia/Kolkata",
                      "Asia/Singapore",
                      "Asia/Tokyo",
                      "Australia/Sydney",
                    ].map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max-retries" className="text-sm font-medium">Max Retries</Label>
                  <Input
                    id="max-retries"
                    type="number"
                    min="0"
                    max="10"
                    value={maxRetries}
                    onChange={(e) => setMaxRetries(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retry-delay" className="text-sm font-medium">Retry Delay (hours)</Label>
                  <Input
                    id="retry-delay"
                    type="number"
                    min="1"
                    max="168"
                    value={retryDelay}
                    onChange={(e) => setRetryDelay(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
                <Clock className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
                Calls run {windowStart} – {windowEnd} daily ({timezone.replace(/_/g, " ")}). Up to {maxRetries} retries with {retryDelay}h delay.
              </div>
            </div>
          )}

          {/* Step 7 — Review */}
          {step === 7 && (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-3 pb-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <Rocket className="h-7 w-7 text-primary" />
                </div>
                <p className="text-lg font-semibold text-foreground">Ready to launch</p>
                <p className="text-sm text-muted-foreground text-center">
                  Review your campaign setup before going live.
                </p>
              </div>

              <div className="divide-y rounded-xl border bg-card">
                {[
                  { label: "Campaign Name", value: name },
                  { label: "Lead List", value: `${selectedList?.label} (${selectedList?.count} leads)` },
                  { label: "Campaign Type", value: selectedType?.label },
                  { label: "AI Agent", value: selectedAgentName },
                  { label: "Script", value: selectedScript?.name },
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

          {step < 7 ? (
            <Button
              onClick={() => setStep((step + 1) as Step)}
              disabled={!canNext()}
              className="bg-gradient-primary"
            >
              Continue <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleLaunch} className="bg-gradient-primary">
              <Rocket className="mr-1.5 h-4 w-4" /> Launch Campaign
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
