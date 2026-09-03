"use client";
import { Download, TrendingUp, FileBarChart } from "lucide-react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { useAdminOverview, useChapters, useCategories } from "@shared/hooks/use-rifah-api";

const reportFiles = [
  { name: "Membership register", period: "Sep 2026", format: "CSV", icon: "csv" },
  { name: "Enquiry flow summary", period: "Q3 2026", format: "PDF", icon: "pdf" },
  { name: "Revenue statement", period: "Sep 2026", format: "CSV", icon: "csv" },
  { name: "Verification turnaround", period: "Q3 2026", format: "PDF", icon: "pdf" },
];

function AdminReports() {
  const { data: overviewData } = useAdminOverview();
  const { data: chaptersData } = useChapters();
  const { data: categoriesData } = useCategories();

  const kpi = overviewData?.kpi || {};
  const chapters = chaptersData || [];
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const chartData = overviewData?.membershipGrowth?.length > 0 
    ? overviewData.membershipGrowth.map(m => ({ name: m.name, value: m.new }))
    : [];

  // Sort chapters by member count from real overview data
  const realChapterData = overviewData?.chaptersDistribution || [];
  const sortedChapterData = [...realChapterData].sort((a, b) => b.members - a.members).slice(0, 5);
  const chapterDisplayData = sortedChapterData.map(c => ({
    name: c.name,
    value: c.members,
  }));
  const maxChapterVal = Math.max(...chapterDisplayData.map(c => c.value), 1);

  // Take top categories
  const topCategories = categories.slice(0, 5).map(c => c.name);
  if (topCategories.length === 0) {
    topCategories.push("Precision Engineering", "Agro Commodities", "Software Development", "Freight & Warehousing", "Corrugated Packaging");
  }

  return (
    <AppShell
      role="admin"
      title="Reports and insights"
      subtitle="Prototype analytics for the secretariat"
      actions={
        <Button variant="outline" onClick={async () => {
          try {
            toast.info("Exporting all reports...");
            // Use native fetch to handle blob download
            const token = localStorage.getItem("rifah_token");
            const response = await fetch("http://localhost:3001/api/reports/admin/export/csv", {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Export failed");
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "admin_reports.csv";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.success("Export completed successfully!");
          } catch (e) {
            toast.error("Failed to export reports");
          }
        }}>
          <Download className="mr-2 h-4 w-4" /> Export all
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Members</p>
            <div className="mt-2 text-3xl font-bold tracking-tight">{kpi.totalBusinesses || 0}</div>
            <p className="mt-1 text-xs text-muted-foreground">+9.4% QoQ</p>
          </div>
          
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Enquiries</p>
            <div className="mt-2 text-3xl font-bold tracking-tight">{(kpi.totalEnquiries || 0).toLocaleString()}</div>
            <p className="mt-1 text-xs text-muted-foreground">+17% QoQ</p>
          </div>
          
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Response rate</p>
            <div className="mt-2 text-3xl font-bold tracking-tight">78%</div>
          </div>
          
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Renewals due</p>
            <div className="mt-2 text-3xl font-bold tracking-tight">63</div>
          </div>
        </div>

        {/* Middle Section: Chart and Progress Bars */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
          {/* Registration Volume Chart */}
          <Panel title="Registration volume" description="Monthly new registrations" className="flex flex-col">
            <div className="h-[300px] w-full pt-4 mt-auto">
              <div className="flex h-full flex-col justify-end">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <Tooltip cursor={{ fill: "hsl(var(--muted)/0.5)" }} contentStyle={{ borderRadius: "8px" }} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground)/0.2)"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No growth data available</div>
                )}
              </div>
            </div>
            <div className="mt-6 flex items-center text-sm font-medium text-emerald-600">
              <TrendingUp className="mr-2 h-4 w-4" />
              Sourcing demand strongest in textiles and packaging
            </div>
          </Panel>

          {/* Chapter Performance Progress Bars */}
          <Panel title="Chapter performance" description="Share of active member businesses">
            <div className="mt-6 flex flex-col gap-6">
              {chapterDisplayData.map((chapter) => {
                const percentage = Math.round((chapter.value / maxChapterVal) * 100);
                return (
                  <div key={chapter.name} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-foreground">{chapter.name}</span>
                      <span className="font-medium text-muted-foreground">{chapter.value}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div 
                        className="h-full rounded-full bg-[#0284c7]" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        {/* Bottom Section: Categories */}
        <Panel title="Category demand" description="Most requested sourcing categories">
          <div className="mt-4 flex flex-wrap gap-3">
            {topCategories.map((cat, index) => {
              // The first 3 get the red tint based on the screenshot design
              const isRedTint = index < 3;
              return (
                <span 
                  key={cat} 
                  className={`inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold ${
                    isRedTint 
                      ? 'bg-red-50 text-red-600 border border-red-100' 
                      : 'bg-slate-50 text-slate-600 border border-slate-200'
                  }`}
                >
                  {cat}
                </span>
              );
            })}
          </div>
        </Panel>
        
        {/* Downloadable Reports List */}
        <Panel title="Downloadable reports" bodyClassName="p-0 sm:p-0">
          <ul className="divide-y divide-border">
            {reportFiles.map((r) => (
              <li key={r.name} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-6 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-slate-50">
                  <FileBarChart className="h-5 w-5 text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{r.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {r.period} · {r.format}
                  </p>
                </div>
                <Button size="sm" variant="outline" className="px-5 font-semibold text-slate-700 h-9" onClick={() => {
                  toast.success(`Preparing ${r.name}...`);
                  setTimeout(() => toast.info(`${r.name} downloaded successfully!`), 1500);
                }}>
                  Download
                </Button>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}

export { AdminReports };
export default AdminReports;
