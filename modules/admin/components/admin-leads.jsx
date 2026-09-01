"use client";
import { Target } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill, StatusBadge } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { useAllEnquiries } from "@shared/hooks/use-rifah-api";

function AdminLeads() {
  const { data: enquiriesData } = useAllEnquiries();
  const enquiries = enquiriesData?.data || [];

  return (
    <AppShell role="admin" title="Lead routing" subtitle="Matching buyer requirements to verified enterprises">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total leads" value={String(enquiries.length)} icon={Target} tone="primary" />
          <StatCard label="Direct RFQs" value={String(enquiries.filter((e) => e.business).length)} tone="success" />
          <StatCard label="Broadcast RFQs" value={String(enquiries.filter((e) => !e.business).length)} tone="warning" />
          <StatCard label="Routing Desk" value="Active" />
        </div>

        <Panel title="Routing worklist">
          <ResponsiveTable
            rows={enquiries}
            empty={<EmptyState icon={Target} title="No leads to route" description="New buyer requirements appear here." />}
            columns={[
              { key: "title", header: "Requirement", cell: (r) => <span className="font-semibold">{r.title}</span> },
              { key: "category", header: "Category", cell: (r) => r.category },
              { key: "buyer", header: "Buyer", cell: (r) => r.buyerName || "Registered Buyer" },
              { key: "location", header: "Location", cell: (r) => r.city },
              { key: "quantity", header: "Quantity", cell: (r) => r.quantity || "On request" },
              { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
            ]}
            mobile={(r) => (
              <div className="rounded-xl border border-border p-3.5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{r.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {r.category} · {r.city}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
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
