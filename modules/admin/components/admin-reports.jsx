"use client";
import { Download, FileBarChart } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Panel, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { useAdminOverview, useChapters, useCategories } from "@shared/hooks/use-rifah-api";

const reportFiles = [
  { name: "Membership Master Register", period: "Real-time", format: "CSV" },
  { name: "Sourcing RFQ Demand Summary", period: "Real-time", format: "PDF" },
  { name: "Chamber Financial Revenue Ledger", period: "Real-time", format: "CSV" },
  { name: "Secretariat Compliance & Audit Trail", period: "Real-time", format: "PDF" },
];

function AdminReports() {
  const { data: overviewData } = useAdminOverview();
  const { data: chaptersData } = useChapters();
  const { data: categoriesData } = useCategories();

  const kpi = overviewData?.kpi || {};
  const chapters = chaptersData || [];
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  return (
    <AppShell
      role="admin"
      title="Reports & Analytics"
      subtitle="Executive intelligence for RIFAH Secretariat"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total Members" value={String(kpi.totalBusinesses || 0)} tone="primary" />
          <StatCard label="Total RFQs" value={String(kpi.totalEnquiries || 0)} tone="success" />
          <StatCard label="Verified Ratio" value={`${kpi.totalBusinesses ? Math.round(((kpi.verifiedBusinesses || 0) / kpi.totalBusinesses) * 100) : 0}%`} tone="warning" />
          <StatCard label="Registered Users" value={String(kpi.totalUsers || 0)} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Regional chapter presence" description="Branch distribution">
            {chapters.length === 0 ? (
              <p className="py-4 text-xs text-muted-foreground">No chapters recorded.</p>
            ) : (
              <ul className="space-y-3">
                {chapters.map((c) => (
                  <li key={c._id || c.name} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.city}, {c.state}</p>
                    </div>
                    <span className="text-xs font-semibold tabular-nums">{c.units?.length || 0} units</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Sourcing categories" description="Active industry verticals">
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <Pill key={c._id || c.name} tone="brand">
                  {c.name}
                </Pill>
              ))}
            </div>
          </Panel>
        </div>

        <Panel title="Secretariat Executive Reports">
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
                <Button size="sm" variant="outline" onClick={() => alert(`Generated ${r.name}`)}>
                  Export {r.format}
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
