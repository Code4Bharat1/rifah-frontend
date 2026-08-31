"use client";
import Link from "next/link";
import { Check, Crown } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { MembershipBadge, Pill } from "@shared/components/rifah/badges";
import { FieldRow, Panel, ResponsiveTable } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { membershipPlans, payments } from "@shared/lib/mock-data";

function BizMembership() {
  const current = membershipPlans.find((p) => p.id === "premium");
  const upgrade = membershipPlans.find((p) => p.id === "enterprise");

  return (
    <AppShell role="business" title="My membership" subtitle="Plan, benefits and invoices">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <Panel title="Current plan">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <p className="text-xl font-bold tracking-tight">{current.name}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{current.summary}</p>
              </div>
              <MembershipBadge tier="Premium" />
            </div>
            <dl className="mt-4">
              <FieldRow label="Status" value={<Pill tone="success">Active</Pill>} />
              <FieldRow label="Started" value="14 Nov 2025" />
              <FieldRow label="Renews" value="14 Nov 2026" />
              <FieldRow label="Billing" value="Annual · auto-renew on" />
              <FieldRow label="Chapter" value="Mumbai Chapter" />
            </dl>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {current.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Invoices" description="Membership and event payments">
            <ResponsiveTable
              rows={payments}
              columns={[
                { key: "id", header: "Invoice", cell: (r) => <span className="font-semibold">{r.id}</span> },
                { key: "item", header: "Item", cell: (r) => r.item },
                { key: "date", header: "Date", cell: (r) => r.date },
                { key: "method", header: "Method", cell: (r) => r.method },
                {
                  key: "status",
                  header: "Status",
                  cell: (r) => (
                    <Pill tone={r.status === "Paid" ? "success" : r.status === "Pending" ? "warning" : "danger"}>
                      {r.status}
                    </Pill>
                  ),
                },
              ]}
              mobile={(r) => (
                <div className="rounded-xl border border-border p-3.5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{r.item}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {r.id} · {r.date} · {r.method}
                      </p>
                    </div>
                    <Pill tone={r.status === "Paid" ? "success" : r.status === "Pending" ? "warning" : "danger"}>
                      {r.status}
                    </Pill>
                  </div>
                </div>
              )}
            />
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Upgrade">
            <div className="rounded-xl border border-primary/30 bg-primary-soft p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-primary">
                <Crown className="h-4 w-4" /> {upgrade.name}
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">{upgrade.summary}</p>
              <ul className="mt-3 space-y-1.5">
                {upgrade.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-4 w-full">
                <Link href={`/membership/checkout?plan=custom`}>
                  Upgrade plan
                </Link>
              </Button>
            </div>
          </Panel>

          <Panel title="Manage">
            <div className="grid gap-2">
              <Button variant="outline">Update billing details</Button>
              <Button variant="outline">Download all invoices</Button>
              <Button variant="ghost" className="text-destructive">
                Turn off auto-renew
              </Button>
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}


export { BizMembership };
export default BizMembership;
