"use client";
import Link from "next/link";
import { Send } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill, StatusBadge } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { useMyEnquiries } from "@shared/hooks/use-rifah-api";

const tabs = ["All", "Submitted", "Routed", "Responded", "Closed"];

function MyEnquiries() {
  const [tab, setTab] = useState("All");
  const { data: enquiriesData, isLoading } = useMyEnquiries(
    tab === "All" ? {} : { status: tab === "Submitted" ? "New" : tab }
  );

  const allRows = Array.isArray(enquiriesData) ? enquiriesData : (enquiriesData?.enquiries || []);
  const rows = allRows.filter((r) => {
    if (tab === "All") return true;
    if (tab === "Submitted") return r.status === "New" || r.status === "Submitted";
    return r.status?.toLowerCase() === tab.toLowerCase();
  });

  return (
    <AppShell
      role="customer"
      title="My enquiries"
      subtitle="Requirements you posted to RIFAH members"
      actions={
        <Button asChild>
          <Link href="/enquiry/new">
            <Send className="h-4 w-4" /> New enquiry
          </Link>
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
              className={
                tab === t
                  ? "shrink-0 rounded-full bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground"
                  : "shrink-0 rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm font-medium text-muted-foreground"
              }
            >
              {t}
            </button>
          ))}
        </div>

        <Panel bodyClassName="p-0 md:p-0">
          <div className="p-4 md:p-5">
            <ResponsiveTable
              rows={rows}
              empty={
                <EmptyState
                  icon={Send}
                  title="No enquiries found"
                  description="Post a sourcing requirement and matched members will respond here."
                  action={
                    <Button asChild>
                      <Link href="/enquiry/new">Post an enquiry</Link>
                    </Button>
                  }
                />
              }
              columns={[
                { key: "title", header: "Requirement", cell: (r) => <span className="font-semibold">{r.title}</span> },
                { key: "category", header: "Category", cell: (r) => r.category },
                { key: "qty", header: "Quantity", cell: (r) => r.quantity },
                { key: "by", header: "Required by", cell: (r) => r.requiredBy ? new Date(r.requiredBy).toLocaleDateString() : "Immediate" },
                { key: "resp", header: "Responses", cell: (r) => <span className="tabular-nums">{r.responses?.length || 0}</span> },
                { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
              ]}
              mobile={(r) => (
                <div className="rounded-xl border border-border p-3.5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{r.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {r.category} · {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <Pill>Qty: {r.quantity}</Pill>
                    {r.budget && <Pill>Budget: {r.budget}</Pill>}
                    <Pill tone={r.responses?.length > 0 ? "success" : "neutral"}>
                      {r.responses?.length || 0} responses
                    </Pill>
                  </div>
                </div>
              )}
            />
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}

export { MyEnquiries as CustomerEnquiries };
export default MyEnquiries;
