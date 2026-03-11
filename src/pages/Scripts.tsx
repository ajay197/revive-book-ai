import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { scripts } from "@/lib/mock-data";
import { Plus, FileText, MoreHorizontal } from "lucide-react";

const Scripts = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Scripts</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your AI calling scripts</p>
        </div>
        <Button className="bg-gradient-primary">
          <Plus className="mr-2 h-4 w-4" /> New Script
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {scripts.map((script) => (
          <div key={script.id} className="rounded-xl border bg-card p-5 shadow-card transition-shadow hover:shadow-elevated">
            <div className="flex items-start justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
            <h3 className="mt-3 font-display text-sm font-semibold text-foreground">{script.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{script.description}</p>
            <div className="mt-3 flex items-center gap-2">
              <StatusBadge status={script.active ? "Running" : "Draft"} />
              <span className="text-xs text-muted-foreground">{script.category}</span>
            </div>
            <div className="mt-3 border-t pt-3">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Objective:</span> {script.objective}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Scripts;
