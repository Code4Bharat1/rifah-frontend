"use client";
import { CreditCard, Download, Receipt } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { payments } from "@shared/lib/mock-data";

const tone = (s) => (s === "Paid" ? "success" : s === "Pending" ? "warning" : s === "Refunded" ? "primary" : "danger");

function BizPayments() {
  return (
    <AppShell
      role="business"
      title="Payments"
      subtitle="Membership and event transactions"
      actions={
        <Button variant="outline">
          <Download className="h-4 w-4" /> Export
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Paid this year" value="4 invoices" icon={Receipt} tone="success" />
          <StatCard label="Pending" value="1" icon={CreditCard} tone="warning" />
          <StatCard label="Next renewal" value="14 Nov 2026" />
          <StatCard label="Payment method" value="Card ····4242" />
        </div>

        <Panel title="Transaction history">
          <ResponsiveTable
            rows={payments}
            columns={[
              { key: "id", header: "Invoice", cell: (r) => <span className="font-semibold">{r.id}</span> },
              { key: "item", header: "Item", cell: (r) => r.item },
              { key: "date", header: "Date", cell: (r) => r.date },
              { key: "method", header: "Method", cell: (r) => r.method },
              { key: "amount", header: "Amount", cell: (r) => r.amount },
              { key: "status", header: "Status", cell: (r) => <Pill tone={tone(r.status)}>{r.status}</Pill> },
              {
                key: "act",
                header: "",
                cell: () => (
                  <Button size="sm" variant="ghost">
                    Receipt
                  </Button>
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
                  <Pill tone={tone(r.status)}>{r.status}</Pill>
                </div>
                <Button size="sm" variant="outline" className="mt-3">
                  Download receipt
                </Button>
              </div>
            )}
          />
        </Panel>
      </div>
    </AppShell>
  );
}


export { BizPayments };
export default BizPayments;
