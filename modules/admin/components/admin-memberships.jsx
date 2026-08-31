"use client";
import { Star } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { MembershipBadge, Pill, VerificationBadge } from "@shared/components/rifah/badges";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { businesses, membershipPlans } from "@shared/lib/mock-data";

function AdminMemberships() {
  return (
    <AppShell role="admin" title="Memberships" subtitle="Tiers, renewals and benefits">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Paid members" value="661" icon={Star} tone="primary" />
          <StatCard label="Renewals due" value="63" tone="warning" />
          <StatCard label="Upgrades this month" value="18" tone="success" />
          <StatCard label="Lapsed" value="9" />
        </div>

        <Panel title="Plans" description="Prototype configuration of membership tiers">
          <div className="grid gap-3 md:grid-cols-2">
            {membershipPlans.map((p) => (
              <div key={p.id} className="rounded-xl border border-border p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{p.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{p.price}</p>
                  </div>
                  <Pill tone={p.highlight ? "brand" : "neutral"}>{p.period}</Pill>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {p.features.slice(0, 4).map((f) => (
                    <li key={f} className="text-xs text-muted-foreground">
                      · {f}
                    </li>
                  ))}
                </ul>
                <Button size="sm" variant="outline" className="mt-3">
                  Edit plan
                </Button>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Member subscriptions">
          <ResponsiveTable
            rows={businesses}
            columns={[
              { key: "name", header: "Business", cell: (r) => <span className="font-semibold">{r.name}</span> },
              { key: "tier", header: "Tier", cell: (r) => <MembershipBadge tier={r.membership} /> },
              { key: "chapter", header: "Chapter", cell: (r) => r.chapter },
              { key: "ver", header: "Verification", cell: (r) => <VerificationBadge status={r.verification} compact /> },
              {
                key: "act",
                header: "",
                cell: () => (
                  <Button size="sm" variant="ghost">
                    Change tier
                  </Button>
                ),
              },
            ]}
            mobile={(r) => (
              <div className="rounded-xl border border-border p-3.5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <p className="min-w-0 truncate text-sm font-semibold">{r.name}</p>
                  <MembershipBadge tier={r.membership} />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Pill>{r.chapter}</Pill>
                  <VerificationBadge status={r.verification} compact />
                </div>
              </div>
            )}
          />
        </Panel>
      </div>
    </AppShell>
  );
}


export { AdminMemberships };
export default AdminMemberships;
