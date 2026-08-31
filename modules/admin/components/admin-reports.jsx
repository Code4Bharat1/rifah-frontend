"use client";
import { Download, FileBarChart } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Panel, StatCard, TrendNote } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Progress } from "@shared/components/ui/progress";
import { adminTrend, categories, chapters } from "@shared/lib/mock-data";

const reportFiles = [
  { name: "Membership register", period: "Sep 2026", format: "CSV" },
  { name: "Enquiry flow summary", period: "Q3 2026", format: "PDF" },
  { name: "Revenue statement", period: "Sep 2026", format: "CSV" },
  { name: "Verification turnaround", period: "Q3 2026", format: "PDF" },
];

function AdminReports() {
  const maxEnq = Math.max(...adminTrend.map((d) => d.registrations));

  return (
    <AppShell
      role="admin"
      title="Reports and insights"
      subtitle="Prototype analytics for the secretariat"
      actions={
        <Button variant="outline">
          <Download className="h-4 w-4" /> Export all
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Members" value="872" hint="+9.4% QoQ" tone="primary" />
          <StatCard label="Enquiries" value="1,284" hint="+17% QoQ" tone="success" />
          <StatCard label="Response rate" value="78%" tone="warning" />
          <StatCard label="Renewals due" value="63" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Registration volume" description="Monthly new registrations">
            <div className="flex items-end gap-2 sm:gap-4" role="img" aria-label="Monthly registrations">
              {adminTrend.map((d) => (
                <div key={d.month} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">{d.registrations}</span>
                  <div className="w-full rounded-t-md bg-primary" style={{ height: `${(d.registrations / maxEnq) * 120}px` }} />
                  <span className="text-[11px] text-muted-foreground">{d.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <TrendNote>Sourcing demand strongest in textiles and packaging</TrendNote>
            </div>
          </Panel>

          <Panel title="Chapter performance" description="Share of active member businesses">
            <ul className="space-y-3">
              {chapters.map((c, i) => (
                <li key={c.id}>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <p className="min-w-0 truncate text-sm font-medium">{c.name}</p>
                    <span className="text-xs font-semibold tabular-nums">{c.businesses}</span>
                  </div>
                  <Progress value={92 - i * 12} className="mt-1.5" />
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel title="Category demand" description="Most requested sourcing categories">
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 12).map((c, i) => (
              <Pill key={c.id} tone={i < 3 ? "brand" : "neutral"}>
                {c.name}
              </Pill>
            ))}
          </div>
        </Panel>

        <Panel title="Downloadable reports">
          <ul className="divide-y divide-border">
            {reportFiles.map((r) => (
              <li key={r.name} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3 first:pt-0 last:pb-0">
                <FileBarChart className="h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.period} · {r.format}
                  </p>
                </div>
                <Button size="sm" variant="outline">
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
