import { LucideIcon } from "lucide-react";
import { useAnimatedCounter } from "@/hooks/use-animated-counter";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  prefix?: string;
  suffix?: string;
}

export function StatCard({ label, value, change, icon: Icon, prefix, suffix }: StatCardProps) {
  const isPositive = change?.startsWith("+");

  // Parse numeric value for animation
  const numericValue = typeof value === "number" ? value : parseFloat(value);
  const isNumeric = !isNaN(numericValue);
  const hasDecimals = isNumeric && String(value).includes(".");
  const decimals = hasDecimals ? (String(value).split(".")[1]?.length || 2) : 0;
  const animated = useAnimatedCounter(isNumeric ? numericValue : 0, 1500, decimals);

  const displayValue = isNumeric
    ? (decimals > 0 ? animated.toFixed(decimals) : animated.toLocaleString())
    : value;

  return (
    <div className="rounded-xl border bg-card p-4 sm:p-5 shadow-card transition-shadow hover:shadow-elevated">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">{label}</p>
          <p className="mt-1.5 sm:mt-2 font-display text-xl sm:text-2xl font-bold text-foreground tabular-nums">
            {prefix}{displayValue}{suffix}
          </p>
          {change && (
            <p className={`mt-1 text-[11px] sm:text-xs font-medium ${isPositive ? "text-success" : "text-destructive"}`}>
              {change}
            </p>
          )}
        </div>
        <div className="flex h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
        </div>
      </div>
    </div>
  );
}
