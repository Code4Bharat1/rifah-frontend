"use client";
import { Inbox, MessageSquare, TrendingUp } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { enquiries } from "@shared/lib/mock-data";

function AdminEnquiries() {
  const unmatched = enquiries.filter((e) => e.responses === 0);

  return (
    <AppShell role="admin" title="Enquiry flow" subtitle="Buyer requirements routed to member businesses">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Enquiries" value={String(enquiries.length)} icon={Inbox} tone="primary" />
          <StatCard label="Responded" value={String(enquiries.length - unmatched.length)} icon={MessageSquare} tone="success" />
          <StatCard label="Unmatched" value={String(unmatched.length)} tone="warning" />
          <StatCard label="Avg. first response" value="9.4 hrs" icon={TrendingUp} />
        </div>

        <Panel title="All enquiries" description="Prototype data — moderation actions are non-functional">
          <ResponsiveTable
            rows={enquiries}
            empty={<EmptyState icon={Inbox} title="No enquiries yet" description="Buyer requirements will appear here." />}
            columns={[
              { key: "id", header: "Ref", cell: (r) => <span className="font-semibold">{r.id}</span> },
              { key: "title", header: "Requirement", cell: (r) => r.title },
              { key: "category", header: "Category", cell: (r) => r.category },
              { key: "requester", header: "Buyer", cell: (r) => r.requester },
              { key: "location", header: "Location", cell: (r) => r.location },
              { key: "status", header: "Status", cell: (r) => <Pill tone={r.responses > 0 ? "success" : "warning"}>{r.status}</Pill> },
              { key: "responses", header: "Responses", cell: (r) => r.responses },
              {
                key: "act",
                header: "",
                cell: () => (
                  <Button size="sm" variant="ghost">
                    Review
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
                      {r.id} · {r.requester} · {r.location}
                    </p>
                  </div>
                  <Pill tone={r.responses > 0 ? "success" : "warning"}>{r.status}</Pill>
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <Pill>{r.category}</Pill>
                  <Pill>{r.responses} responses</Pill>
                </div>
                <Button size="sm" variant="outline" className="mt-3">
                  Review enquiry
                </Button>
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
