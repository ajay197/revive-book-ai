import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { agents } from "@/lib/mock-data";
import { Bot, Phone, Calendar, TrendingUp } from "lucide-react";

const Agents = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">AI Agents</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your AI calling agents powered by Retell AI</p>
        </div>
        <Button variant="outline" onClick={() => window.open("https://www.retellai.com/dashboard", "_blank")}>View Retell Dashboard</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <div key={agent.id} className="rounded-xl border bg-card p-6 shadow-card transition-shadow hover:shadow-elevated">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <Badge variant={agent.active ? "default" : "secondary"} className={agent.active ? "bg-success/10 text-success border-success/20" : ""}>
                {agent.active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{agent.name}</h3>
            <p className="text-sm text-primary">{agent.purpose}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{agent.description}</p>
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <span>{agent.voice}</span>
              <span>•</span>
              <span>{agent.language}</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 border-t pt-4">
              <div className="text-center">
                <p className="font-display text-sm font-bold text-foreground">{agent.campaignsUsing}</p>
                <p className="text-[10px] text-muted-foreground">Campaigns</p>
              </div>
              <div className="text-center">
                <p className="font-display text-sm font-bold text-foreground">{agent.callsMade.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">Calls</p>
              </div>
              <div className="text-center">
                <p className="font-display text-sm font-bold text-success">{agent.bookingRate}%</p>
                <p className="text-[10px] text-muted-foreground">Booking Rate</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Agents;
