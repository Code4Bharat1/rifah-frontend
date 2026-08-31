"use client";
import { Filter, Target } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill, StatusBadge } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,

} from "@shared/components/ui/sheet";
import { enquiries } from "@shared/lib/mock-data";

const stages = ["All", "New", "In Progress", "Responded", "Won", "Closed"] ;

function LeadsPage() {
  const [stage, setStage] = useState("All");
  const [openId, setOpenId] = useState(null);
  const rows = enquiries.filter((e) => stage === "All" || e.status === stage);
  const active = enquiries.find((e) => e.id === openId) ?? null;

  return (
    <AppShell role="business" title="Lead management" subtitle="Buyer enquiries matched to your business">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="New" value="12" icon={Target} tone="brand" />
          <StatCard label="In progress" value="7" tone="primary" />
          <StatCard label="Won" value="9" tone="success" />
          <StatCard label="Response rate" value="86%" hint="Within 24 hours" />
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
            {stages.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStage(s)}
                aria-pressed={stage === s}
                className={
                  stage === s
                    ? "shrink-0 rounded-full bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground"
                    : "shrink-0 rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm font-medium text-muted-foreground"
                }
              >
                {s}
              </button>
            ))}
          </div>
          <Button variant="outline" size="icon" aria-label="Filter leads">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <Panel>
          <ResponsiveTable
            rows={rows}
            empty={
              <EmptyState
                icon={Target}
                title="No leads in this stage"
                description="New buyer enquiries matching your categories will appear here."
              />
            }
            columns={[
              { key: "id", header: "Lead", cell: (r) => <span className="font-semibold">{r.id}</span> },
              { key: "title", header: "Requirement", cell: (r) => r.title },
              { key: "buyer", header: "Buyer", cell: (r) => r.requester },
              { key: "loc", header: "Location", cell: (r) => r.location },
              { key: "pri", header: "Priority", cell: (r) => <Pill tone={r.priority === "High" ? "danger" : "neutral"}>{r.priority}</Pill> },
              { key: "status", header: "Stage", cell: (r) => <StatusBadge status={r.status} /> },
              {
                key: "act",
                header: "",
                cell: (r) => (
                  <Button size="sm" variant="outline" onClick={() => setOpenId(r.id)}>
                    Open
                  </Button>
                ),
              },
            ]}
            mobile={(r) => (
              <button
                type="button"
                onClick={() => setOpenId(r.id)}
                className="w-full rounded-xl border border-border p-3.5 text-left"
              >
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
                  <Pill tone={r.priority === "High" ? "danger" : "neutral"}>{r.priority}</Pill>
                  <Pill>{r.quantity}</Pill>
                  <Pill>{r.location}</Pill>
                </div>
              </button>
            )}
          />
        </Panel>
      </div>

      <Sheet open={active !== null} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          {active && (
            <>
              <SheetHeader>
                <SheetTitle className="text-left">{active.title}</SheetTitle>
                <SheetDescription className="text-left">
                  {active.id} · {active.category}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4 px-4 pb-8">
                <p className="text-sm text-muted-foreground">{active.description}</p>
                <dl className="rounded-xl border border-border p-3.5 text-sm">
                  {[
                    ["Buyer", active.requester],
                    ["Role", active.requesterRole],
                    ["Quantity", active.quantity],
                    ["Budget", active.budget],
                    ["Required by", active.requiredBy],
                    ["Location", active.location],
                  ].map(([k, v]) => (
                    <div key={k} className="grid grid-cols-2 gap-3 border-b border-border py-2 last:border-0">
                      <dt className="text-xs text-muted-foreground">{k}</dt>
                      <dd className="font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
                <ol className="space-y-2">
                  {active.timeline.map((t) => (
                    <li key={t.label} className="flex items-center gap-2 text-sm">
                      <span className={t.done ? "h-2 w-2 rounded-full bg-success" : "h-2 w-2 rounded-full bg-muted"} />
                      <span className={t.done ? "font-medium" : "text-muted-foreground"}>{t.label}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{t.at}</span>
                    </li>
                  ))}
                </ol>
                <div className="grid gap-2">
                  <Button>Send quotation</Button>
                  <Button variant="outline">Message buyer</Button>
                  <Button variant="ghost">Mark as not relevant</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}


const BizLeads = LeadsPage;

export { BizLeads };
export default BizLeads;
