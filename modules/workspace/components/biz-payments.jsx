"use client";
import { CreditCard, Download, Receipt } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { useMyPayments } from "@shared/hooks/use-rifah-api";

const tone = (s) =>
  s === "completed" || s === "Paid"
    ? "success"
    : s === "pending" || s === "Pending"
    ? "warning"
    : "danger";

function BizPayments() {
  const { data: paymentsData } = useMyPayments();
  const payments = paymentsData?.payments || [];

  const totalPaid = payments
    .filter((p) => p.status === "completed")
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  return (
    <AppShell
      role="business"
      title="Payments & Invoices"
      subtitle="Membership and subscription transactions"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Total Paid"
            value={`₹ ${totalPaid.toLocaleString("en-IN")}`}
            icon={Receipt}
            tone="success"
          />
          <StatCard
            label="Invoices"
            value={String(payments.length)}
            icon={CreditCard}
          />
          <StatCard label="Account Status" value="Active Member" tone="primary" />
          <StatCard label="Chamber Desk" value="Trade Invoicing" />
        </div>

        <Panel title="Transaction history">
          {payments.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No transactions recorded yet.
            </p>
          ) : (
            <ResponsiveTable
              rows={payments}
              columns={[
                { key: "invoiceNumber", header: "Invoice", cell: (r) => <span className="font-semibold">{r.invoiceNumber}</span> },
                { key: "purpose", header: "Purpose", cell: (r) => r.purpose || "Membership Subscription" },
                { key: "date", header: "Date", cell: (r) => new Date(r.createdAt).toLocaleDateString() },
                { key: "amount", header: "Amount", cell: (r) => `₹ ${r.amount?.toLocaleString("en-IN")}` },
                { key: "status", header: "Status", cell: (r) => <Pill tone={tone(r.status)}>{r.status}</Pill> },
              ]}
              mobile={(r) => (
                <div className="rounded-xl border border-border p-3.5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{r.invoiceNumber}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {r.purpose} · {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Pill tone={tone(r.status)}>{r.status}</Pill>
                  </div>
                </div>
              )}
            />
          )}
        </Panel>
      </div>
    </AppShell>
  );
}

export { BizPayments };
export default BizPayments;
