"use client";
import { Download, Wallet, MoreHorizontal, Eye } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@shared/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@shared/components/ui/dropdown-menu";
import { useAllPayments } from "@shared/hooks/use-rifah-api";
import { paymentApi } from "@shared/lib/api-services";
import { useState } from "react";

const tone = (s) =>
  s === "completed" || s === "Paid"
    ? "success"
    : s === "pending" || s === "Pending"
    ? "warning"
    : "danger";

function AdminPayments() {
  const { data: paymentsData, refetch, isLoading, error } = useAllPayments();
  
  let payments = [];
  if (Array.isArray(paymentsData)) {
    payments = paymentsData;
  } else if (paymentsData && typeof paymentsData === "object") {
    payments = Array.isArray(paymentsData.payments) ? paymentsData.payments : 
               (Array.isArray(paymentsData.data) ? paymentsData.data : []);
  }

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleDownloadReceipt = (r) => {
    const receiptContent = `
      <html>
        <head>
          <title>Receipt - ${r.invoiceNumber}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 40px; }
            .header h1 { margin: 0; color: #1a1a1a; }
            .header p { color: #666; }
            .details-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .details-table th, .details-table td { padding: 12px; border-bottom: 1px solid #eee; text-align: left; }
            .total { font-size: 24px; font-weight: bold; text-align: right; margin-top: 20px; }
            .footer { text-align: center; color: #888; font-size: 12px; margin-top: 50px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>RIFAH Chamber of Commerce</h1>
            <p>Official Payment Receipt</p>
          </div>
          <table class="details-table">
            <tr><th>Invoice Number</th><td>${r.invoiceNumber || "N/A"}</td></tr>
            <tr><th>Date</th><td>${new Date(r.paidAt || r.createdAt).toLocaleString()}</td></tr>
            <tr><th>Payer</th><td>${r.payer?.name || r.user?.name || "Member"}</td></tr>
            <tr><th>Item Type</th><td>${r.itemType || "Membership"}</td></tr>
            <tr><th>Description</th><td>${r.description || r.purpose || "N/A"}</td></tr>
            <tr><th>Payment Method</th><td>${r.method || "Online"}</td></tr>
            <tr><th>Transaction ID</th><td>${r.transactionId || "N/A"}</td></tr>
            <tr><th>Status</th><td>${r.status}</td></tr>
          </table>
          <div class="total">
            Total Paid: ₹ ${Number(r.amount || 0).toLocaleString("en-IN")}
          </div>
          <div class="footer">
            Thank you for being a part of RIFAH Connect. This is a computer-generated receipt.
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(receiptContent);
    printWindow.document.close();
  };

  const totalRevenue = payments
    .filter((p) => p.status === "completed" || p.status === "Paid")
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
            value={String(payments.filter((p) => p.status === "completed" || p.status === "Paid").length)}
            tone="success"
          />
          <StatCard
            label="Pending"
            value={String(payments.filter((p) => p.status === "pending" || p.status === "Pending").length)}
            tone="warning"
          />
        </div>

        <Panel title="Transaction ledger">
          {error ? (
            <EmptyState
              icon={Wallet}
              title="Error Loading Payments"
              description={error.message || "Authentication token is required or session expired."}
            />
          ) : (
            <ResponsiveTable
              isLoading={isLoading}
              rows={payments}
              empty={<EmptyState icon={Wallet} title="No transactions" description="Payments will appear here." />}
            columns={[
              { key: "invoiceNumber", header: "Invoice", cell: (r) => <span className="font-semibold">{r.invoiceNumber || "N/A"}</span> },
              { key: "payer", header: "Payer", cell: (r) => r.payer?.name || r.user?.name || "Member Enterprise" },
              { key: "purpose", header: "Purpose", cell: (r) => r.description || r.purpose || r.itemType || "Membership Subscription" },
              { key: "date", header: "Date", cell: (r) => new Date(r.paidAt || r.createdAt).toLocaleDateString() },
              { key: "amount", header: "Amount", cell: (r) => `₹ ${Number(r.amount || 0).toLocaleString("en-IN")}` },
              { key: "status", header: "Status", cell: (r) => <Pill tone={tone(r.status)}>{r.status}</Pill> },
              {
                key: "act",
                header: "",
                cell: (r) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Transaction Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => {
                        setSelectedTransaction(r);
                        setIsDetailOpen(true);
                      }}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDownloadReceipt(r)} disabled={r.status !== "completed" && r.status !== "Paid"}>
                        <Download className="h-4 w-4 mr-2" />
                        Download Receipt
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" 
                        disabled={r.status === "refunded" || r.status === "Refunded"}
                        onClick={async () => {
                          if (confirm(`Are you sure you want to mark invoice ${r.invoiceNumber} as refunded?`)) {
                            try {
                              await paymentApi.refund(r._id);
                              toast.success("Payment marked as refunded");
                              refetch();
                            } catch (e) {
                              toast.error("Failed to process refund");
                            }
                          }
                      }}>
                        Process Refund
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ),
              },
            ]}
            mobile={(r) => (
              <div className="rounded-xl border border-border p-3.5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{r.invoiceNumber || "N/A"}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {r.payer?.name || r.user?.name} · {new Date(r.paidAt || r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Pill tone={tone(r.status)}>{r.status}</Pill>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  ₹ {r.amount || 0} · {r.description || r.purpose || r.itemType}
                </p>
              </div>
            )}
          />
        )}
        </Panel>
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              {selectedTransaction?.invoiceNumber || "N/A"}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                <Pill tone={tone(selectedTransaction.status)}>{selectedTransaction.status}</Pill>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs text-muted-foreground mb-1">Amount</span>
                  <span className="font-semibold text-lg">₹ {Number(selectedTransaction.amount || 0).toLocaleString("en-IN")}</span>
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground mb-1">Date</span>
                  <span className="text-sm">{new Date(selectedTransaction.paidAt || selectedTransaction.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground mb-1">Payer</span>
                  <span className="text-sm font-medium">{selectedTransaction.payer?.name || selectedTransaction.user?.name || "Member"}</span>
                  {(selectedTransaction.payer?.email || selectedTransaction.payer?.phone) && (
                    <span className="block text-xs text-muted-foreground">
                      {selectedTransaction.payer?.email} {selectedTransaction.payer?.phone ? `• ${selectedTransaction.payer.phone}` : ''}
                    </span>
                  )}
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground mb-1">Method</span>
                  <span className="text-sm">{selectedTransaction.method || "Online"}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-xs text-muted-foreground mb-1">Description</span>
                  <span className="text-sm">{selectedTransaction.description || selectedTransaction.purpose || "Membership Subscription"}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-xs text-muted-foreground mb-1">Transaction ID</span>
                  <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{selectedTransaction.transactionId || "N/A"}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-between border-t pt-4">
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
            <Button 
              onClick={() => handleDownloadReceipt(selectedTransaction)}
              disabled={selectedTransaction?.status !== "completed" && selectedTransaction?.status !== "Paid"}
            >
              <Download className="h-4 w-4 mr-2" /> Download Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export { AdminPayments };
export default AdminPayments;
