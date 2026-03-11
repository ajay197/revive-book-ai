import { Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

export function TopBar() {
  const { profile, user } = useAuth();

  const initials = (profile?.display_name || user?.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-card px-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <div className="hidden items-center gap-2 rounded-lg border bg-background px-3 py-1.5 text-sm text-muted-foreground md:flex">
          <Search className="h-3.5 w-3.5" />
          <span>Search...</span>
          <kbd className="ml-8 rounded border bg-muted px-1.5 py-0.5 font-body text-[10px] text-muted-foreground">⌘K</kbd>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-display text-xs font-semibold text-muted-foreground">
          {initials}
        </div>
      </div>
    </header>
  );
}
