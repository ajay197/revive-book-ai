import { Phone, Calendar, BarChart3, DollarSign, Megaphone, TrendingUp, Clock, SmilePlus } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { dashboardStats, recentCalls, chartData } from "@/lib/mock-data";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Campaign performance overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Calls" value={dashboardStats.totalCalls} change="+12.3%" icon={Phone} />
        <StatCard label="Calls Today" value={dashboardStats.callsToday} change="+8.1%" icon={Clock} />
        <StatCard label="Answer Rate" value={`${dashboardStats.answerRate}%`} change="+3.2%" icon={TrendingUp} />
        <StatCard label="Avg Duration" value={dashboardStats.avgDuration} icon={Clock} />
        <StatCard label="Appointments Booked" value={dashboardStats.appointmentsBooked} change="+18.7%" icon={Calendar} />
        <StatCard label="Total Cost" value={dashboardStats.totalCost.toFixed(2)} prefix="$" change="-4.1%" icon={DollarSign} />
        <StatCard label="Active Campaigns" value={dashboardStats.activeCampaigns} icon={Megaphone} />
        <StatCard label="Positive Sentiment" value={`${dashboardStats.positiveSentiment}%`} change="+5.3%" icon={SmilePlus} />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-card lg:col-span-2">
          <h3 className="font-display text-sm font-semibold text-foreground">Calls Over Time</h3>
          <p className="mt-1 text-xs text-muted-foreground">Daily call volume, answered, and booked</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.callsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(218 11% 45%)" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(218 11% 45%)" }} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(220 13% 91%)", fontSize: "12px" }} />
                <Area type="monotone" dataKey="calls" stroke="hsl(218 11% 65%)" fill="hsl(218 11% 65% / 0.1)" strokeWidth={2} />
                <Area type="monotone" dataKey="answered" stroke="hsl(245 58% 51%)" fill="hsl(245 58% 51% / 0.1)" strokeWidth={2} />
                <Area type="monotone" dataKey="booked" stroke="hsl(160 84% 39%)" fill="hsl(160 84% 39% / 0.1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="font-display text-sm font-semibold text-foreground">Outcome Distribution</h3>
          <p className="mt-1 text-xs text-muted-foreground">Call outcomes breakdown</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData.outcomeDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {chartData.outcomeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(220 13% 91%)", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {chartData.outcomeDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }} />
                {item.name}: {item.value}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Calls */}
      <div className="rounded-xl border bg-card shadow-card">
        <div className="border-b px-5 py-4">
          <h3 className="font-display text-sm font-semibold text-foreground">Recent Calls</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Latest call activity across campaigns</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Time</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Lead</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Campaign</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Duration</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Outcome</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Sentiment</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">Cost</th>
              </tr>
            </thead>
            <tbody>
              {recentCalls.map((call) => (
                <tr key={call.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-5 py-3 text-xs text-muted-foreground">{call.time.split(" ")[1]}</td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground">{call.lead}</p>
                    <p className="text-xs text-muted-foreground">{call.phone}</p>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{call.campaign}</td>
                  <td className="px-5 py-3 text-muted-foreground">{call.duration}</td>
                  <td className="px-5 py-3"><StatusBadge status={call.outcome} /></td>
                  <td className="px-5 py-3"><StatusBadge status={call.sentiment} /></td>
                  <td className="px-5 py-3 text-right text-muted-foreground">${call.cost.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
