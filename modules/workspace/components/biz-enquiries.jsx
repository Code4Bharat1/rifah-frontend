"use client";
import { MessageSquare } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill, StatusBadge } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { enquiries } from "@shared/lib/mock-data";

function BizEnquiries() {
  const rows = enquiries.filter((e) => e.businessId);

  return (
    <AppShell
      role="business"
      title="Direct enquiries"
      subtitle="Sent straight to your business profile"
      actions={<Button variant="outline">Export list</Button>}
    >
      <Panel>
        <ResponsiveTable
          rows={rows}
          empty={
            <EmptyState
              icon={MessageSquare}
              title="No direct enquiries yet"
              description="Buyers who open your profile and submit an enquiry will appear here."
            />
          }
          columns={[
            { key: "id", header: "Enquiry", cell: (r) => <span className="font-semibold">{r.id}</span> },
            { key: "title", header: "Requirement", cell: (r) => r.title },
            { key: "buyer", header: "Buyer", cell: (r) => r.requester },
            { key: "qty", header: "Quantity", cell: (r) => r.quantity },
            { key: "by", header: "Required by", cell: (r) => r.requiredBy },
            { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
          ]}
          mobile={(r) => (
            <div className="rounded-xl border border-border p-3.5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{r.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {r.id} · {r.requester}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <Pill>{r.quantity}</Pill>
                <Pill>By {r.requiredBy}</Pill>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm">Reply</Button>
                <Button size="sm" variant="outline">
                  Details
                </Button>
              </div>
            </div>
          )}
        />
      </Panel>
    </AppShell>
  );
}


export { BizEnquiries };
export default BizEnquiries;
