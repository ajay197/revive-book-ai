import { Button } from "@/components/ui/button";
import { Building, Users, CreditCard, Key, Phone, Bell, AlertTriangle } from "lucide-react";

const settingsSections = [
  {
    title: "Workspace",
    description: "Manage your workspace name, logo, and default settings",
    icon: Building,
    fields: [
      { label: "Workspace Name", value: "Acme Agency" },
      { label: "Slug", value: "acme-agency" },
    ],
  },
  {
    title: "Team Members",
    description: "Manage who has access to this workspace",
    icon: Users,
    members: [
      { name: "John Doe", email: "john@acme.com", role: "Owner" },
      { name: "Jane Smith", email: "jane@acme.com", role: "Admin" },
      { name: "Mike Johnson", email: "mike@acme.com", role: "Member" },
    ],
  },
  {
    title: "Billing",
    description: "Manage your subscription and payment methods",
    icon: CreditCard,
    plan: "Growth",
    price: "$149/mo",
    callsUsed: 3247,
    callsLimit: 5000,
  },
  {
    title: "API Keys",
    description: "Manage API keys for external integrations",
    icon: Key,
    keys: [
      { name: "Retell AI", status: "Active", lastUsed: "2 min ago" },
    ],
  },
  {
    title: "Phone Numbers",
    description: "Manage outbound phone numbers for campaigns",
    icon: Phone,
    numbers: [
      { number: "+1 (201) 492-9779", label: "Primary", campaigns: 4 },
    ],
  },
  {
    title: "Notifications",
    description: "Configure notification preferences",
    icon: Bell,
  },
];

const Settings = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted-foreground">Manage your workspace and account</p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Workspace */}
        <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Building className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-foreground">Workspace</h3>
              <p className="text-xs text-muted-foreground">Manage your workspace settings</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Workspace Name</label>
              <input className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground" defaultValue="Acme Agency" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Slug</label>
              <input className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground" defaultValue="acme-agency" disabled />
            </div>
          </div>
          <Button size="sm" className="mt-4">Save Changes</Button>
        </div>

        {/* Team */}
        <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold text-foreground">Team Members</h3>
                <p className="text-xs text-muted-foreground">3 members</p>
              </div>
            </div>
            <Button size="sm" variant="outline">Invite Member</Button>
          </div>
          <div className="mt-4 space-y-3">
            {[
              { name: "John Doe", email: "john@acme.com", role: "Owner" },
              { name: "Jane Smith", email: "jane@acme.com", role: "Admin" },
              { name: "Mike Johnson", email: "mike@acme.com", role: "Member" },
            ].map((m) => (
              <div key={m.email} className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-display text-xs font-semibold text-muted-foreground">
                    {m.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{m.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Billing */}
        <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-foreground">Billing</h3>
              <p className="text-xs text-muted-foreground">Growth plan — $149/mo</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Calls used this month</span>
              <span className="font-medium text-foreground">3,247 / 5,000</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-gradient-primary" style={{ width: "65%" }} />
            </div>
          </div>
          <Button size="sm" variant="outline" className="mt-4">Manage Subscription</Button>
        </div>

        {/* Danger Zone */}
        <div className="rounded-xl border border-destructive/20 bg-card p-4 sm:p-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-destructive">Danger Zone</h3>
              <p className="text-xs text-muted-foreground">Irreversible actions</p>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/5">
              Delete Workspace
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
