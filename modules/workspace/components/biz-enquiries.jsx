"use client";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill, StatusBadge } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { useMyLeads } from "@shared/hooks/use-rifah-api";

function BizEnquiries() {
  const { data: leadsData } = useMyLeads();
  const rows = leadsData?.leads || [];

  return (
    <AppShell
      role="business"
      title="Direct enquiries"
      subtitle="Buyer sourcing requirements routed to your enterprise"
      actions={
        <Button asChild variant="outline">
          <Link href="/biz/leads">Manage in Lead CRM</Link>
        </Button>
      }
    >
      <Panel>
        <ResponsiveTable
          rows={rows}
          empty={
            <EmptyState
              icon={MessageSquare}
              title="No direct enquiries yet"
              description="Buyers who open your profile or category and submit an enquiry will appear here."
            />
          }
          columns={[
            {
              key: "title",
              header: "Requirement",
              cell: (r) => <span className="font-semibold">{r.enquiry?.title || "Buyer RFQ"}</span>,
            },
            { key: "buyer", header: "Buyer", cell: (r) => r.enquiry?.buyerName || "Registered Buyer" },
            { key: "qty", header: "Quantity", cell: (r) => r.enquiry?.quantity || "On request" },
            {
              key: "by",
              header: "Required by",
              cell: (r) =>
                r.enquiry?.requiredBy
                  ? new Date(r.enquiry.requiredBy).toLocaleDateString()
                  : "Immediate",
            },
            { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
          ]}
          mobile={(r) => (
            <div className="rounded-xl border border-border p-3.5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{r.enquiry?.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {r.enquiry?.buyerName} · {r.enquiry?.city}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <Pill>{r.enquiry?.quantity}</Pill>
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
