import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Database, Webhook, Facebook, Zap, Wrench, CheckCircle, Clock } from "lucide-react";

const integrations = [
  {
    name: "Retell AI",
    description: "AI voice calling engine",
    icon: Phone,
    status: "Connected" as const,
    details: ["API key configured", "Webhook active", "Last sync: 2 min ago"],
  },
  {
    name: "Database",
    description: "Data storage and queries",
    icon: Database,
    status: "Connected" as const,
    details: ["PostgreSQL connected", "6 tables active", "Auto-sync enabled"],
  },
  {
    name: "Webhooks",
    description: "Real-time event processing",
    icon: Webhook,
    status: "Connected" as const,
    details: ["Retell webhook active", "1,247 events processed", "0 errors"],
  },
  {
    name: "Facebook Leads",
    description: "Import leads from Facebook ads",
    icon: Facebook,
    status: "Coming Soon" as const,
    details: ["Auto-import new leads", "Instant follow-up campaigns"],
  },
  {
    name: "Zapier",
    description: "Connect to 5,000+ apps",
    icon: Zap,
    status: "Coming Soon" as const,
    details: ["Trigger automations", "Sync with your CRM"],
  },
  {
    name: "Make",
    description: "Advanced workflow automation",
    icon: Wrench,
    status: "Coming Soon" as const,
    details: ["Multi-step automations", "Custom workflows"],
  },
];

const Integrations = () => {
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
                className={integration.status === "Connected"
                  ? "bg-success/10 text-success border-success/20"
                  : "bg-muted text-muted-foreground border-border"}
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
            {integration.status === "Connected" && (
              <Button variant="outline" size="sm" className="mt-4 w-full">
                Configure
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Integrations;
