import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  prefix?: string;
}

export function StatCard({ label, value, change, icon: Icon, prefix }: StatCardProps) {
  const isPositive = change?.startsWith("+");
  return (
    <div className="rounded-xl border bg-card p-5 shadow-card transition-shadow hover:shadow-elevated">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold text-foreground">
            {prefix}{typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {change && (
            <p className={`mt-1 text-xs font-medium ${isPositive ? "text-success" : "text-destructive"}`}>
              {change} from last week
            </p>
          )}
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
    </div>
  );
}
