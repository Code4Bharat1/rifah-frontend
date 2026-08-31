"use client";
import { Target } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { enquiries } from "@shared/lib/mock-data";

function AdminLeads() {
  return (
    <AppShell role="admin" title="Lead routing" subtitle="Matching buyer requirements to members">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Open leads" value={String(enquiries.length)} icon={Target} tone="primary" />
          <StatCard label="Matched" value={String(enquiries.filter((e) => e.responses > 0).length)} tone="success" />
          <StatCard label="Needs routing" value={String(enquiries.filter((e) => e.responses === 0).length)} tone="warning" />
          <StatCard label="Avg. matches / lead" value="3.4" />
        </div>

        <Panel title="Routing worklist" description="Assign members to each requirement">
          <ResponsiveTable
            rows={enquiries}
            empty={<EmptyState icon={Target} title="No leads to route" description="New buyer requirements appear here." />}
            columns={[
              { key: "id", header: "Ref", cell: (r) => <span className="font-semibold">{r.id}</span> },
              { key: "title", header: "Requirement", cell: (r) => r.title },
              { key: "category", header: "Category", cell: (r) => r.category },
              { key: "location", header: "Location", cell: (r) => r.location },
              { key: "matched", header: "Matches", cell: (r) => `${r.responses} responded` },
              {
                key: "act",
                header: "",
                cell: () => (
                  <Button size="sm" variant="ghost">
                    Route
                  </Button>
                ),
              },
            ]}
            mobile={(r) => (
              <div className="rounded-xl border border-border p-3.5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{r.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {r.id} · {r.category} · {r.location}
                    </p>
                  </div>
                  <Pill tone={r.responses > 0 ? "success" : "warning"}>{r.responses}</Pill>
                </div>
                <Button size="sm" variant="outline" className="mt-3">
                  Route to members
                </Button>
              </div>
            )}
          />
        </Panel>
      </div>
    </AppShell>
  );
}


export { AdminLeads };
export default AdminLeads;
