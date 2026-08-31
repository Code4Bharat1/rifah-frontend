"use client";
import { Inbox, MessageSquare } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill, StatusBadge } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { useAllEnquiries } from "@shared/hooks/use-rifah-api";

function AdminEnquiries() {
  const { data: enquiriesData } = useAllEnquiries();
  const enquiries = enquiriesData?.enquiries || [];

  return (
    <AppShell role="admin" title="Enquiry flow" subtitle="Buyer sourcing RFQs routed across chamber network">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total RFQs" value={String(enquiries.length)} icon={Inbox} tone="primary" />
          <StatCard
            label="Open RFQs"
            value={String(enquiries.filter((e) => e.status === "open").length)}
            icon={MessageSquare}
            tone="warning"
          />
          <StatCard
            label="Completed"
            value={String(enquiries.filter((e) => e.status === "completed").length)}
            tone="success"
          />
          <StatCard label="Chamber Routing" value="Automated" />
        </div>

        <Panel title="All buyer requirements">
          <ResponsiveTable
            rows={enquiries}
            empty={<EmptyState icon={Inbox} title="No enquiries yet" description="Buyer requirements will appear here." />}
            columns={[
              { key: "title", header: "Requirement", cell: (r) => <span className="font-semibold">{r.title}</span> },
              { key: "category", header: "Category", cell: (r) => r.category },
              { key: "buyer", header: "Buyer", cell: (r) => r.buyerName || "Registered Buyer" },
              { key: "city", header: "Location", cell: (r) => r.city },
              { key: "date", header: "Date", cell: (r) => new Date(r.createdAt).toLocaleDateString() },
              { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
            ]}
            mobile={(r) => (
              <div className="rounded-xl border border-border p-3.5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{r.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {r.buyerName} · {r.city}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <Pill>{r.category}</Pill>
                </div>
              </div>
            )}
          />
        </Panel>
      </div>
    </AppShell>
  );
}

export { AdminEnquiries };
export default AdminEnquiries;
