"use client";
import Link from "next/link";
import { Check, Crown } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { MembershipBadge, Pill } from "@shared/components/rifah/badges";
import { FieldRow, Panel, ResponsiveTable } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { useMyBusiness, useMembershipPlans, useMyPayments, useMyMembership } from "@shared/hooks/use-rifah-api";

function BizMembership() {
  const { data: business } = useMyBusiness();
  const { data: membershipData } = useMyMembership();
  const { data: plansData } = useMembershipPlans();
  const { data: paymentsData } = useMyPayments();

  const plans = plansData || {};
  const tierName = membershipData?.planId || business?.membership || "free";
  const currentTier = tierName.toLowerCase();

  const currentPlan = plans[currentTier] || {
    name: membershipData?.planName || business?.membership || "Basic",
    price: membershipData?.price || 0,
    summary: "Active chamber membership plan",
    features: membershipData?.features || ["Directory listing", "Lead notifications", "Basic catalogue"],
  };

  const payments = Array.isArray(paymentsData) ? paymentsData : (paymentsData?.payments || []);

  return (
    <AppShell role="business" title="My membership" subtitle="Plan, benefits and invoices">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <Panel title="Current plan">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <p className="text-xl font-bold tracking-tight">{currentPlan.name} Membership</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{currentPlan.summary}</p>
              </div>
              <MembershipBadge tier={currentPlan.name} />
            </div>
            <dl className="mt-4">
              <FieldRow label="Status" value={<Pill tone="success">Active</Pill>} />
              <FieldRow label="Annual Fee" value={`₹ ${currentPlan.price?.toLocaleString("en-IN") || 0} / year`} />
              <FieldRow label="Chapter" value={business?.chapter || "Central Chamber"} />
            </dl>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {currentPlan.features?.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Invoices & Receipts" description="Payment history with the chamber">
            {payments.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">No invoices recorded yet.</p>
            ) : (
              <ResponsiveTable
                rows={payments}
                columns={[
                  { key: "invoiceNumber", header: "Invoice", cell: (r) => <span className="font-semibold">{r.invoiceNumber}</span> },
                  { key: "purpose", header: "Description", cell: (r) => r.description || r.purpose || r.itemType || "Membership Subscription" },
                  { key: "amount", header: "Amount", cell: (r) => `₹ ${r.amount?.toLocaleString("en-IN")}` },
                  { key: "date", header: "Date", cell: (r) => new Date(r.paidAt || r.createdAt).toLocaleDateString() },
                  {
                    key: "status",
                    header: "Status",
                    cell: (r) => (
                      <Pill tone={r.status === "Paid" || r.status === "completed" ? "success" : "warning"}>
                        {r.status}
                      </Pill>
                    ),
                  },
                ]}
                mobile={(r) => (
                  <div className="rounded-xl border border-border p-3.5">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{r.invoiceNumber}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          ₹ {r.amount} · {new Date(r.paidAt || r.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Pill tone={r.status === "Paid" || r.status === "completed" ? "success" : "warning"}>
                        {r.status}
                      </Pill>
                    </div>
                  </div>
                )}
              />
            )}
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Upgrade Tier">
            <div className="rounded-xl border border-primary/30 bg-primary-soft p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-primary">
                <Crown className="h-4 w-4" /> Premium / Enterprise Tier
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Get priority RFQ routing, featured directory placement, and unlimited catalogue uploads.
              </p>
              <Button asChild className="mt-4 w-full">
                <Link href="/membership/checkout?plan=premium">
                  Upgrade plan
                </Link>
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
