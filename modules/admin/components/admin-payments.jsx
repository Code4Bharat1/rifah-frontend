"use client";
import { Download, Wallet } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable, StatCard, TrendNote } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { adminTrend, payments } from "@shared/lib/mock-data";

const tone = (s) => (s === "Paid" ? "success" : s === "Pending" ? "warning" : s === "Refunded" ? "primary" : "danger");

function AdminPayments() {
  const max = Math.max(...adminTrend.map((d) => d.revenue));

  return (
    <AppShell
      role="admin"
      title="Payments"
      subtitle="Membership and event transactions"
      actions={
        <Button variant="outline">
          <Download className="h-4 w-4" /> Export ledger
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Transactions" value={String(payments.length)} icon={Wallet} tone="primary" />
          <StatCard label="Paid" value={String(payments.filter((p) => p.status === "Paid").length)} tone="success" />
          <StatCard label="Pending" value={String(payments.filter((p) => p.status === "Pending").length)} tone="warning" />
          <StatCard label="Failed / refunded" value={String(payments.filter((p) => p.status !== "Paid" && p.status !== "Pending").length)} tone="brand" />
        </div>

        <Panel title="Revenue index" description="Relative monthly collection (prototype figures)">
          <div className="flex items-end gap-2 sm:gap-4" role="img" aria-label="Monthly revenue index">
            {adminTrend.map((d) => (
              <div key={d.month} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-md bg-brand" style={{ height: `${(d.revenue / max) * 120}px` }} />
                <span className="text-[11px] text-muted-foreground">{d.month}</span>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <TrendNote>Collections trending upward with renewal season</TrendNote>
          </div>
        </Panel>

        <Panel title="Transaction ledger">
          <ResponsiveTable
            rows={payments}
            empty={<EmptyState icon={Wallet} title="No transactions" description="Payments will appear here." />}
            columns={[
              { key: "id", header: "Invoice", cell: (r) => <span className="font-semibold">{r.id}</span> },
              { key: "payer", header: "Payer", cell: (r) => r.payer },
              { key: "item", header: "Item", cell: (r) => r.item },
              { key: "date", header: "Date", cell: (r) => r.date },
              { key: "method", header: "Method", cell: (r) => r.method },
              { key: "amount", header: "Amount", cell: (r) => r.amount },
              { key: "status", header: "Status", cell: (r) => <Pill tone={tone(r.status)}>{r.status}</Pill> },
            ]}
            mobile={(r) => (
              <div className="rounded-xl border border-border p-3.5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{r.payer}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {r.item} · {r.date}
                    </p>
                  </div>
                  <Pill tone={tone(r.status)}>{r.status}</Pill>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {r.id} · {r.method} · {r.amount}
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
