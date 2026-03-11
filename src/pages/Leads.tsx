import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Upload, Search, Filter, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { CSVUploadModal } from "@/components/CSVUploadModal";
import { EditLeadDialog } from "@/components/EditLeadDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const Leads = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const filtered = leads.filter((l) =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.company || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImport = async (data: Record<string, string>[]) => {
    if (!user) return;
    const rows = data.map((row) => ({
      user_id: user.id,
      name: row.name,
      phone: row.phone,
      email: row.email,
      company: row.company || null,
      city: row.city || null,
      state: row.state || null,
      source: row.source || "CSV Import",
      tags: row.tags ? row.tags.split(",").map((t) => t.trim()) : null,
      notes: row.notes || null,
    }));

    const { error } = await supabase.from("leads").insert(rows);
    if (error) {
      toast.error("Failed to import leads: " + error.message);
    } else {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Leads</h1>
          <p className="mt-1 text-sm text-muted-foreground">{leads.length} total leads across all campaigns</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/sample-leads.csv"
            download="sample-leads.csv"
            className="text-sm text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
          >
            Download sample CSV
          </a>
          <Button className="bg-gradient-primary" onClick={() => setUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Upload CSV
          </Button>
        </div>
      </div>

      <CSVUploadModal open={uploadOpen} onOpenChange={setUploadOpen} onImport={handleImport} />

      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-3.5 w-3.5" /> Filter
        </Button>
      </div>

      <div className="rounded-xl border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Name</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Company</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Phone</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Source</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Campaign</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Created</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">Loading leads...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">
                    {searchQuery ? "No leads match your search" : "No leads yet — upload a CSV to get started"}
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => (
                  <tr key={lead.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.email}</p>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{lead.company || "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{lead.phone}</td>
                    <td className="px-5 py-3 text-muted-foreground">{lead.source || "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{lead.campaign || "—"}</td>
                    <td className="px-5 py-3"><StatusBadge status={lead.status as any} /></td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(lead.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-right">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leads;
