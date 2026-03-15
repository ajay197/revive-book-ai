import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Database, Webhook, Facebook, Zap, Wrench, CheckCircle, Clock, Calendar } from "lucide-react";
import { RetellConnectDialog } from "@/components/RetellConnectDialog";
import { CalComConnectDialog } from "@/components/CalComConnectDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Integrations = () => {
  const { user } = useAuth();
  const [retellDialogOpen, setRetellDialogOpen] = useState(false);
  const [retellConnected, setRetellConnected] = useState(false);
  const [retellAgentName, setRetellAgentName] = useState("");
  const [calcomDialogOpen, setCalcomDialogOpen] = useState(false);
  const [calcomConnected, setCalcomConnected] = useState(false);

  useEffect(() => {
    const connected = localStorage.getItem("retell_connected") === "true";
    const storedAgents = localStorage.getItem("retell_agents");
    const agentCount = storedAgents ? JSON.parse(storedAgents).length : 0;
    setRetellConnected(connected);
    setRetellAgentName(connected ? `${agentCount} agent(s)` : "");

    // Check Cal.com connection
    if (user) {
      supabase
        .from("user_integrations")
        .select("id")
        .eq("user_id", user.id)
        .eq("provider", "calcom")
        .maybeSingle()
        .then(({ data }) => setCalcomConnected(!!data));
    }
  }, [user]);

  const handleRetellConnected = (_apiKey: string, agents: { agent_id: string; agent_name: string }[]) => {
    setRetellConnected(true);
    setRetellAgentName(`${agents.length} agent(s)`);
  };

  const handleDisconnectRetell = () => {
    localStorage.removeItem("retell_connected");
    localStorage.removeItem("retell_api_key");
    localStorage.removeItem("retell_agents");
    setRetellConnected(false);
    setRetellAgentName("");
  };

  const handleCalcomConnected = () => {
    setCalcomConnected(true);
  };

  const handleDisconnectCalcom = async () => {
    try {
      await supabase.functions.invoke("calcom-sync", {
        body: { action: "disconnect" },
      });
      setCalcomConnected(false);
      toast.success("Cal.com disconnected");
    } catch {
      toast.error("Failed to disconnect Cal.com");
    }
  };

  const integrations = [
    {
      name: "Retell AI",
      description: "AI voice calling engine",
      icon: Phone,
      status: retellConnected ? ("Connected" as const) : ("Not Connected" as const),
      details: retellConnected
        ? [`Agent: ${retellAgentName}`, "API key configured", "Ready to make calls"]
        : ["Connect your Retell AI account", "Fetch and select voice agents"],
      action: retellConnected ? "configure" : "connect",
    },
    {
      name: "Database",
      description: "Data storage and queries",
      icon: Database,
      status: "Connected" as const,
      details: ["PostgreSQL connected", "6 tables active", "Auto-sync enabled"],
      action: "configure" as const,
    },
    {
      name: "Webhooks",
      description: "Real-time event processing",
      icon: Webhook,
      status: "Connected" as const,
      details: ["Retell webhook active", "1,247 events processed", "0 errors"],
      action: "configure" as const,
    },
    {
      name: "Cal.com",
      description: "Calendar & booking management",
      icon: Calendar,
      status: calcomConnected ? ("Connected" as const) : ("Not Connected" as const),
      details: calcomConnected
        ? ["Syncing bookings", "Calendar view enabled", "Attendee tracking active"]
        : ["Connect your Cal.com account", "View bookings from AI agents"],
      action: calcomConnected ? "configure" : "connect",
    },
    {
      name: "Facebook Leads",
      description: "Import leads from Facebook ads",
      icon: Facebook,
      status: "Coming Soon" as const,
      details: ["Auto-import new leads", "Instant follow-up campaigns"],
      action: "none" as const,
    },
    {
      name: "Zapier",
      description: "Connect to 5,000+ apps",
      icon: Zap,
      status: "Coming Soon" as const,
      details: ["Trigger automations", "Sync with your CRM"],
      action: "none" as const,
    },
    {
      name: "Make",
      description: "Advanced workflow automation",
      icon: Wrench,
      status: "Coming Soon" as const,
      details: ["Multi-step automations", "Custom workflows"],
      action: "none" as const,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">Integrations</h1>
        <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted-foreground">Connect your tools and services</p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <div key={integration.name} className="flex flex-col rounded-xl border bg-card p-4 sm:p-5 shadow-card">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <integration.icon className="h-5 w-5 text-primary" />
              </div>
              <Badge
                variant="outline"
                className={
                  integration.status === "Connected"
                    ? "bg-success/10 text-success border-success/20"
                    : integration.status === "Not Connected"
                    ? "bg-destructive/10 text-destructive border-destructive/20"
                    : "bg-muted text-muted-foreground border-border"
                }
              >
                {integration.status === "Connected" && <CheckCircle className="mr-1 h-3 w-3" />}
                {integration.status === "Coming Soon" && <Clock className="mr-1 h-3 w-3" />}
                {integration.status}
              </Badge>
            </div>
            <h3 className="mt-3 font-display text-sm font-semibold text-foreground">{integration.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{integration.description}</p>
            <ul className="mt-3 space-y-1 flex-1">
              {integration.details.map((detail) => (
                <li key={detail} className="text-xs text-muted-foreground">• {detail}</li>
              ))}
            </ul>
            <div className="mt-4">
              {integration.name === "Retell AI" && !retellConnected && (
                <Button size="sm" className="w-full" onClick={() => setRetellDialogOpen(true)}>
                  Connect
                </Button>
              )}
              {integration.name === "Retell AI" && retellConnected && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setRetellDialogOpen(true)}>
                    Configure
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-destructive hover:text-destructive" onClick={handleDisconnectRetell}>
                    Disconnect
                  </Button>
                </div>
              )}
              {integration.name === "Cal.com" && !calcomConnected && (
                <Button size="sm" className="w-full" onClick={() => setCalcomDialogOpen(true)}>
                  Connect
                </Button>
              )}
              {integration.name === "Cal.com" && calcomConnected && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => window.location.href = "/app/bookings"}>
                    View Bookings
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-destructive hover:text-destructive" onClick={handleDisconnectCalcom}>
                    Disconnect
                  </Button>
                </div>
              )}
              {integration.action === "configure" && integration.name !== "Retell AI" && integration.name !== "Cal.com" && (
                <Button variant="outline" size="sm" className="w-full">
                  Configure
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <RetellConnectDialog
        open={retellDialogOpen}
        onOpenChange={setRetellDialogOpen}
        onConnected={handleRetellConnected}
      />

      <CalComConnectDialog
        open={calcomDialogOpen}
        onOpenChange={setCalcomDialogOpen}
        onConnected={handleCalcomConnected}
      />
    </div>
  );
};

export default Integrations;
