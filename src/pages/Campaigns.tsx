import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { campaigns } from "@/lib/mock-data";
import { Plus, Play, Pause } from "lucide-react";

const Campaigns = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Campaigns</h1>
          <p className="mt-1 text-sm text-muted-foreground">{campaigns.length} campaigns</p>
        </div>
        <Button className="bg-gradient-primary">
          <Plus className="mr-2 h-4 w-4" /> New Campaign
        </Button>
      </div>

      <div className="rounded-xl border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Campaign</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Type</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Leads</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Agent</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Calls</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Booked</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">Cost</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.createdAt}</p>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{c.type}</td>
                  <td className="px-5 py-3 text-muted-foreground">{c.leadCount.toLocaleString()}</td>
                  <td className="px-5 py-3 text-muted-foreground">{c.agent || "—"}</td>
                  <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-3 text-muted-foreground">{c.callsCompleted.toLocaleString()}</td>
                  <td className="px-5 py-3 text-muted-foreground">{c.appointmentsBooked}</td>
                  <td className="px-5 py-3 text-right text-muted-foreground">${c.cost.toFixed(2)}</td>
                  <td className="px-5 py-3 text-right">
                    {c.status === "Running" && (
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Pause className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    )}
                    {(c.status === "Draft" || c.status === "Paused") && (
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Play className="h-3.5 w-3.5 text-primary" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Campaigns;
