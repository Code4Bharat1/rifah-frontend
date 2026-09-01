"use client";
import { Star } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { MembershipBadge, Pill, VerificationBadge } from "@shared/components/rifah/badges";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { useMembershipPlans, useBusinesses } from "@shared/hooks/use-rifah-api";

function AdminMemberships() {
  const { data: plansData } = useMembershipPlans();
  const { data: businessesData } = useBusinesses();

  const plans = plansData || {};
  const businesses = businessesData?.data || [];

  return (
    <AppShell role="admin" title="Memberships" subtitle="Tiers, subscription plans and member allocations">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total members" value={String(businesses.length)} icon={Star} tone="primary" />
          <StatCard
            label="Premium / Enterprise"
            value={String(businesses.filter((b) => b.membership === "Premium" || b.membership === "Enterprise").length)}
            tone="success"
          />
          <StatCard
            label="Basic"
            value={String(businesses.filter((b) => b.membership === "Basic").length)}
          />
          <StatCard
            label="Verified"
            value={String(businesses.filter((b) => b.verification === "verified").length)}
            tone="warning"
          />
        </div>

        <Panel title="Membership Tier Structure">
          <div className="grid gap-3 md:grid-cols-3">
            {Object.entries(plans).map(([key, p]) => (
              <div key={key} className="rounded-xl border border-border p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{p.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">₹ {p.price?.toLocaleString("en-IN")} / year</p>
                  </div>
                  <Pill tone="brand">Annual</Pill>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{p.summary}</p>
                <ul className="mt-3 space-y-1.5">
                  {p.features?.map((f, i) => (
                    <li key={i} className="text-xs text-muted-foreground">
                      · {f}
                    </li>
                  ))}
                </ul>
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
