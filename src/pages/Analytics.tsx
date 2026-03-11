import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { analyticsData, dashboardStats, chartData } from "@/lib/mock-data";
import { StatCard } from "@/components/StatCard";
import { Download, Filter, Phone, Clock, DollarSign, Calendar, TrendingUp, BarChart3 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Call performance and business outcomes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-3.5 w-3.5" /> Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Calls" value={dashboardStats.totalCalls} change="+12.3%" icon={Phone} />
        <StatCard label="Answer Rate" value={`${dashboardStats.answerRate}%`} change="+3.2%" icon={TrendingUp} />
        <StatCard label="Appointments Booked" value={dashboardStats.appointmentsBooked} change="+18.7%" icon={Calendar} />
        <StatCard label="Total Cost" value={dashboardStats.totalCost.toFixed(2)} prefix="$" icon={DollarSign} />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="font-display text-sm font-semibold text-foreground">Call Volume</h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.callsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(218 11% 45%)" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(218 11% 45%)" }} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(220 13% 91%)", fontSize: "12px" }} />
                <Area type="monotone" dataKey="calls" stroke="hsl(245 58% 51%)" fill="hsl(245 58% 51% / 0.1)" strokeWidth={2} />
                <Area type="monotone" dataKey="answered" stroke="hsl(160 84% 39%)" fill="hsl(160 84% 39% / 0.1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="font-display text-sm font-semibold text-foreground">Cost by Day</h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.costByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(218 11% 45%)" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(218 11% 45%)" }} tickFormatter={(v) => `$${v}`} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(220 13% 91%)", fontSize: "12px" }} formatter={(value: number) => [`$${value.toFixed(2)}`, "Cost"]} />
                <Bar dataKey="cost" fill="hsl(245 58% 51%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Analytics Table */}
      <div className="rounded-xl border bg-card shadow-card">
        <div className="border-b px-5 py-4">
          <h3 className="font-display text-sm font-semibold text-foreground">Call Log</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Detailed call records</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Time</th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Duration</th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Cost</th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Session ID</th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">End Reason</th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Sentiment</th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">From</th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">To</th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Outcome</th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Latency</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.map((row, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{row.time}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{row.duration}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">${row.cost.toFixed(3)}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">{row.sessionId.substring(0, 16)}...</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{row.endReason}</td>
                  <td className="whitespace-nowrap px-4 py-3"><StatusBadge status={row.sentiment} /></td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{row.from}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{row.to}</td>
                  <td className="whitespace-nowrap px-4 py-3"><StatusBadge status={row.outcome} /></td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{row.latency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
