"use client";
import Link from "next/link";
import { Send } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill, StatusBadge } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { enquiries } from "@shared/lib/mock-data";

const tabs = ["All", "New", "In Progress", "Responded", "Closed"] ;

function MyEnquiries() {
  const [tab, setTab] = useState("All");
  const rows = enquiries.filter((e) => tab === "All" || e.status === tab);

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
                  title="No enquiries in this view"
                  description="Post a sourcing requirement and matched members will respond here."
                  action={
                    <Button asChild>
                      <Link href="/enquiry/new">Post an enquiry</Link>
                    </Button>
                  }
                />
              }
              columns={[
                { key: "id", header: "Enquiry", cell: (r) => <span className="font-semibold">{r.id}</span> },
                { key: "title", header: "Requirement", cell: (r) => r.title },
                { key: "qty", header: "Quantity", cell: (r) => r.quantity },
                { key: "by", header: "Required by", cell: (r) => r.requiredBy },
                { key: "resp", header: "Responses", cell: (r) => <span className="tabular-nums">{r.responses}</span> },
                { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
              ]}
              mobile={(r) => (
                <div className="rounded-xl border border-border p-3.5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{r.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {r.id} · {r.createdAt}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <Pill>{r.quantity}</Pill>
                    <Pill>By {r.requiredBy}</Pill>
                    <Pill tone={r.responses > 0 ? "success" : "neutral"}>{r.responses} responses</Pill>
                  </div>
                  <ol className="mt-3 space-y-1.5 border-t border-border pt-3">
                    {r.timeline.map((t) => (
                      <li key={t.label} className="flex items-center gap-2 text-xs">
                        <span
                          className={t.done ? "h-2 w-2 rounded-full bg-success" : "h-2 w-2 rounded-full bg-muted"}
                          aria-hidden
                        />
                        <span className={t.done ? "font-medium" : "text-muted-foreground"}>{t.label}</span>
                        <span className="ml-auto text-muted-foreground">{t.at}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            />
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}


const CustomerEnquiries = MyEnquiries;

export { CustomerEnquiries };
export default CustomerEnquiries;
