"use client";
import { Download, Wallet } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { useAllPayments } from "@shared/hooks/use-rifah-api";

const tone = (s) =>
  s === "completed" || s === "Paid"
    ? "success"
    : s === "pending" || s === "Pending"
    ? "warning"
    : "danger";

function AdminPayments() {
  const { data: paymentsData } = useAllPayments();
  const payments = Array.isArray(paymentsData) ? paymentsData : [];

  const totalRevenue = payments
    .filter((p) => p.status === "completed")
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  return (
    <AppShell
      role="admin"
      title="Payments & Revenue"
      subtitle="Chamber membership fee & event transaction records"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Total Revenue"
            value={`₹ ${totalRevenue.toLocaleString("en-IN")}`}
            icon={Wallet}
            tone="success"
          />
          <StatCard label="Transactions" value={String(payments.length)} tone="primary" />
          <StatCard
            label="Completed"
            value={String(payments.filter((p) => p.status === "completed").length)}
            tone="success"
          />
          <StatCard
            label="Pending"
            value={String(payments.filter((p) => p.status === "pending").length)}
            tone="warning"
          />
        </div>

        <Panel title="Transaction ledger">
          <ResponsiveTable
            rows={payments}
            empty={<EmptyState icon={Wallet} title="No transactions" description="Payments will appear here." />}
            columns={[
              { key: "invoiceNumber", header: "Invoice", cell: (r) => <span className="font-semibold">{r.invoiceNumber}</span> },
              { key: "payer", header: "Payer", cell: (r) => r.user?.name || "Member Enterprise" },
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
                      {r.user?.name} · {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Pill tone={tone(r.status)}>{r.status}</Pill>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  ₹ {r.amount} · {r.purpose}
                </p>
              </div>
            )}
          />
        </Panel>
      </div>
    </AppShell>
  );
}

export { AdminPayments };
export default AdminPayments;
