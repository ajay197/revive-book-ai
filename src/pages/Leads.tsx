import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { leads } from "@/lib/mock-data";
import { Upload, Search, Filter, MoreHorizontal } from "lucide-react";

const Leads = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const filtered = leads.filter((l) =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Leads</h1>
          <p className="mt-1 text-sm text-muted-foreground">{leads.length} total leads across all campaigns</p>
        </div>
        <Button className="bg-gradient-primary">
          <Upload className="mr-2 h-4 w-4" /> Upload CSV
        </Button>
      </div>

      {/* Filters */}
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

      {/* Table */}
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
              {filtered.map((lead) => (
                <tr key={lead.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.email}</p>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{lead.company}</td>
                  <td className="px-5 py-3 text-muted-foreground">{lead.phone}</td>
                  <td className="px-5 py-3 text-muted-foreground">{lead.source}</td>
                  <td className="px-5 py-3 text-muted-foreground">{lead.campaign || "—"}</td>
                  <td className="px-5 py-3"><StatusBadge status={lead.status} /></td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{lead.createdAt}</td>
                  <td className="px-5 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </Button>
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

export default Leads;
