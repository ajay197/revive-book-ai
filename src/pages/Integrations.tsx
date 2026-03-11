import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Database, Webhook, Facebook, Zap, Wrench, CheckCircle, Clock } from "lucide-react";
import { RetellConnectDialog } from "@/components/RetellConnectDialog";

const Integrations = () => {
  const [retellDialogOpen, setRetellDialogOpen] = useState(false);
  const [retellConnected, setRetellConnected] = useState(false);
  const [retellAgentName, setRetellAgentName] = useState("");

  useEffect(() => {
    const connected = localStorage.getItem("retell_connected") === "true";
    const storedAgents = localStorage.getItem("retell_agents");
    const agentCount = storedAgents ? JSON.parse(storedAgents).length : 0;
    setRetellConnected(connected);
    setRetellAgentName(connected ? `${agentCount} agent(s)` : "");
  }, []);

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
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Integrations</h1>
        <p className="mt-1 text-sm text-muted-foreground">Connect your tools and services</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <div key={integration.name} className="rounded-xl border bg-card p-5 shadow-card">
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
            <ul className="mt-3 space-y-1">
              {integration.details.map((detail) => (
                <li key={detail} className="text-xs text-muted-foreground">• {detail}</li>
              ))}
            </ul>
            {integration.name === "Retell AI" && !retellConnected && (
              <Button size="sm" className="mt-4 w-full" onClick={() => setRetellDialogOpen(true)}>
                Connect
              </Button>
            )}
            {integration.name === "Retell AI" && retellConnected && (
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setRetellDialogOpen(true)}>
                  Configure
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={handleDisconnectRetell}>
                  Disconnect
                </Button>
              </div>
            )}
            {integration.action === "configure" && integration.name !== "Retell AI" && (
              <Button variant="outline" size="sm" className="mt-4 w-full">
                Configure
              </Button>
            )}
          </div>
        ))}
      </div>

      <RetellConnectDialog
        open={retellDialogOpen}
        onOpenChange={setRetellDialogOpen}
        onConnected={handleRetellConnected}
      />
    </div>
  );
};

export default Integrations;
