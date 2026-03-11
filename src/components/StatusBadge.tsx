import { Badge } from "@/components/ui/badge";

type StatusType = "Running" | "Paused" | "Completed" | "Draft" | "Scheduled" | "Failed"
  | "New" | "Queued" | "Called" | "Answered" | "No Answer" | "Voicemail" | "Booked" | "Unsuccessful" | "Do Not Call"
  | "Positive" | "Negative" | "Neutral";

const statusConfig: Record<string, { className: string }> = {
  Running: { className: "bg-info/10 text-info border-info/20" },
  Paused: { className: "bg-warning/10 text-warning border-warning/20" },
  Completed: { className: "bg-success/10 text-success border-success/20" },
  Draft: { className: "bg-muted text-muted-foreground border-border" },
  Scheduled: { className: "bg-primary/10 text-primary border-primary/20" },
  Failed: { className: "bg-destructive/10 text-destructive border-destructive/20" },
  New: { className: "bg-primary/10 text-primary border-primary/20" },
  Queued: { className: "bg-muted text-muted-foreground border-border" },
  Called: { className: "bg-info/10 text-info border-info/20" },
  Answered: { className: "bg-success/10 text-success border-success/20" },
  "No Answer": { className: "bg-muted text-muted-foreground border-border" },
  Voicemail: { className: "bg-warning/10 text-warning border-warning/20" },
  Booked: { className: "bg-success/10 text-success border-success/20" },
  Unsuccessful: { className: "bg-destructive/10 text-destructive border-destructive/20" },
  "Do Not Call": { className: "bg-destructive/10 text-destructive border-destructive/20" },
  Positive: { className: "bg-success/10 text-success border-success/20" },
  Negative: { className: "bg-destructive/10 text-destructive border-destructive/20" },
  Neutral: { className: "bg-muted text-muted-foreground border-border" },
};

export function StatusBadge({ status }: { status: StatusType | string }) {
  const config = statusConfig[status] || statusConfig.Draft;
  return (
    <Badge variant="outline" className={`font-medium text-xs ${config.className}`}>
      {status}
    </Badge>
  );
}
