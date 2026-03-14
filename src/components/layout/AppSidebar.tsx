import {
  LayoutDashboard, Users, Megaphone, Bot, FileText, BarChart3, Plug, Settings, Phone, LogOut, CreditCard, History, Shield, CalendarCheck,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/contexts/CreditsContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/app", icon: LayoutDashboard },
  { title: "Leads", url: "/app/leads", icon: Users },
  { title: "Campaigns", url: "/app/campaigns", icon: Megaphone },
  { title: "Bookings", url: "/app/bookings", icon: CalendarCheck },
  { title: "Agents", url: "/app/agents", icon: Bot },
  { title: "Phone Numbers", url: "/app/phone-numbers", icon: Phone },
  { title: "Scripts", url: "/app/scripts", icon: FileText },
  { title: "Analytics", url: "/app/analytics", icon: BarChart3 },
];

const secondaryItems = [
  { title: "Billing", url: "/app/billing", icon: CreditCard },
  { title: "Credit History", url: "/app/credit-history", icon: History },
  { title: "Integrations", url: "/app/integrations", icon: Plug },
  { title: "Settings", url: "/app/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { profile, user, signOut } = useAuth();
  const { isAdmin } = useCredits();
  const isActive = (path: string) => location.pathname === path;

  const initials = (profile?.display_name || user?.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-primary">
            <Phone className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && <span className="font-display text-sm font-bold text-foreground">Lead Revival AI</span>}
        </div>
      </SidebarHeader>

      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end className="hover:bg-muted/50" activeClassName="bg-primary/10 text-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end className="hover:bg-muted/50" activeClassName="bg-primary/10 text-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/app/admin/credits")}>
                    <NavLink to="/app/admin/credits" end className="hover:bg-muted/50" activeClassName="bg-primary/10 text-primary font-medium">
                      <Shield className="mr-2 h-4 w-4" />
                      {!collapsed && <span>Credit Management</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted font-display text-xs font-semibold text-muted-foreground">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{profile?.display_name || user?.email}</p>
              <p className="truncate text-xs text-muted-foreground">{profile?.company || user?.email}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={signOut} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors" title="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
