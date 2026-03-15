import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Upload, Search, Filter, MoreHorizontal, Pencil, Trash2, X, Plus } from "lucide-react";
import { CSVUploadModal } from "@/components/CSVUploadModal";
import { EditLeadDialog } from "@/components/EditLeadDialog";
import { AddLeadDialog } from "@/components/AddLeadDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const STATUS_OPTIONS = ["New", "Queued", "Called", "Answered", "No Answer", "Voicemail", "Booked", "Unsuccessful", "Do Not Call"];

const SENTIMENT_OPTIONS = ["Positive", "Negative", "Neutral", "Unknown"];

interface Filters {
  statuses: string[];
  sources: string[];
  companies: string[];
  campaigns: string[];
  sentiments: string[];
}

const emptyFilters: Filters = { statuses: [], sources: [], companies: [], campaigns: [], sentiments: [] };

const Leads = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editLead, setEditLead] = useState<Tables<"leads"> | null>(null);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [filterOpen, setFilterOpen] = useState(false);
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

  // Fetch latest sentiment per lead from call_logs
  const { data: sentimentMap = {} } = useQuery({
    queryKey: ["lead-sentiments", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("call_logs")
        .select("lead_id, sentiment, created_at")
        .eq("user_id", user!.id)
        .not("lead_id", "is", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const map: Record<string, string> = {};
      (data || []).forEach((c) => {
        if (c.lead_id && !map[c.lead_id]) {
          map[c.lead_id] = c.sentiment || "Unknown";
        }
      });
      return map;
    },
    enabled: !!user,
  });

  // Derive unique filter options from data
  const filterOptions = useMemo(() => {
    const statuses = new Set<string>();
    const sources = new Set<string>();
    const companies = new Set<string>();
    const campaigns = new Set<string>();
    leads.forEach((l) => {
      if (l.status) statuses.add(l.status);
      if (l.source) sources.add(l.source);
      if (l.company) companies.add(l.company);
      if (l.campaign) campaigns.add(l.campaign);
    });
    return {
      statuses: Array.from(statuses).sort(),
      sources: Array.from(sources).sort(),
      companies: Array.from(companies).sort(),
      campaigns: Array.from(campaigns).sort(),
    };
  }, [leads]);

  const activeFilterCount =
    filters.statuses.length + filters.sources.length + filters.companies.length + filters.campaigns.length + filters.sentiments.length;

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      // Search
      const q = searchQuery.toLowerCase();
      if (q && !(
        l.name.toLowerCase().includes(q) ||
        (l.company || "").toLowerCase().includes(q) ||
        (l.email || "").toLowerCase().includes(q) ||
        (l.phone || "").includes(q)
      )) return false;

      // Filters
      if (filters.statuses.length > 0 && !filters.statuses.includes(l.status || "")) return false;
      if (filters.sources.length > 0 && !filters.sources.includes(l.source || "")) return false;
      if (filters.companies.length > 0 && !filters.companies.includes(l.company || "")) return false;
      if (filters.campaigns.length > 0 && !filters.campaigns.includes(l.campaign || "")) return false;
      if (filters.sentiments.length > 0) {
        const s = sentimentMap[l.id] || "Unknown";
        if (!filters.sentiments.includes(s)) return false;
      }

      return true;
    });
  }, [leads, searchQuery, filters, sentimentMap]);

  const toggleFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

  const handleImport = async (data: Record<string, string>[]) => {
    if (!user) return;

    // Check for duplicates by phone number against existing leads
    const existingPhones = new Set(leads.map((l) => l.phone));
    const duplicates: Record<string, string>[] = [];
    const unique: Record<string, string>[] = [];

    data.forEach((row) => {
      if (existingPhones.has(row.phone)) {
        duplicates.push(row);
      } else {
        unique.push(row);
        existingPhones.add(row.phone); // also dedupe within the batch
      }
    });

    if (duplicates.length > 0) {
      toast.warning(`${duplicates.length} duplicate lead(s) skipped (phone already exists)`, {
        description: duplicates.slice(0, 3).map((d) => `${d.name} (${d.phone})`).join(", ") +
          (duplicates.length > 3 ? ` and ${duplicates.length - 3} more` : ""),
        duration: 8000,
      });
    }

    if (unique.length === 0) {
      toast.info("No new leads to import — all are duplicates");
      return;
    }

    const rows = unique.map((row) => ({
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
      toast.success(`${unique.length} new leads imported`);
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
          <Button variant="outline" onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Lead
          </Button>
          <Button className="bg-gradient-primary" onClick={() => setUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Upload CSV
          </Button>
        </div>
      </div>

      <CSVUploadModal open={uploadOpen} onOpenChange={setUploadOpen} onImport={handleImport} />
      <AddLeadDialog open={addOpen} onOpenChange={setAddOpen} existingPhones={leads.map((l) => l.phone)} />
      <EditLeadDialog lead={editLead} open={!!editLead} onOpenChange={(v) => { if (!v) setEditLead(null); }} />

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
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <Filter className="mr-2 h-3.5 w-3.5" /> Filter
              {activeFilterCount > 0 && (
                <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-[10px] flex items-center justify-center bg-primary text-primary-foreground">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <p className="text-sm font-semibold text-foreground">Filter Leads</p>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setFilters(emptyFilters)}>
                  Clear all
                </Button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto divide-y">
              {/* Status filter */}
              <FilterSection
                label="Status"
                options={filterOptions.statuses.length > 0 ? filterOptions.statuses : STATUS_OPTIONS}
                selected={filters.statuses}
                onToggle={(v) => toggleFilter("statuses", v)}
              />
              {/* Source filter */}
              {filterOptions.sources.length > 0 && (
                <FilterSection
                  label="Source"
                  options={filterOptions.sources}
                  selected={filters.sources}
                  onToggle={(v) => toggleFilter("sources", v)}
                />
              )}
              {/* Company filter */}
              {filterOptions.companies.length > 0 && (
                <FilterSection
                  label="Company"
                  options={filterOptions.companies}
                  selected={filters.companies}
                  onToggle={(v) => toggleFilter("companies", v)}
                />
              )}
              {/* Campaign filter */}
              {filterOptions.campaigns.length > 0 && (
                <FilterSection
                  label="Campaign"
                  options={filterOptions.campaigns}
                  selected={filters.campaigns}
                  onToggle={(v) => toggleFilter("campaigns", v)}
                />
              )}
              {/* Sentiment filter */}
              <FilterSection
                label="Sentiment"
                options={SENTIMENT_OPTIONS}
                selected={filters.sentiments}
                onToggle={(v) => toggleFilter("sentiments", v)}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filter badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {Object.entries(filters).map(([key, values]) =>
            (values as string[]).map((v) => (
              <Badge
                key={`${key}-${v}`}
                variant="secondary"
                className="gap-1 pl-2 pr-1 text-xs cursor-pointer hover:bg-destructive/10"
                onClick={() => toggleFilter(key as keyof Filters, v)}
              >
                {v}
                <X className="h-3 w-3" />
              </Badge>
            ))
          )}
        </div>
      )}

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
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Sentiment</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Created</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-muted-foreground">Loading leads...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-muted-foreground">
                    {searchQuery || activeFilterCount > 0
                      ? "No leads match your search or filters"
                      : "No leads yet — upload a CSV to get started"}
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditLead(lead)}>
                            <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={async () => {
                              const { error } = await supabase.from("leads").delete().eq("id", lead.id);
                              if (error) toast.error("Delete failed");
                              else {
                                toast.success("Lead deleted");
                                queryClient.invalidateQueries({ queryKey: ["leads"] });
                              }
                            }}
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

function FilterSection({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="px-4 py-3 space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
      <div className="space-y-1.5">
        {options.map((opt) => (
          <div key={opt} className="flex items-center gap-2">
            <Checkbox
              id={`filter-${label}-${opt}`}
              checked={selected.includes(opt)}
              onCheckedChange={() => onToggle(opt)}
            />
            <Label
              htmlFor={`filter-${label}-${opt}`}
              className="text-sm font-normal text-foreground cursor-pointer"
            >
              {opt}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Leads;
