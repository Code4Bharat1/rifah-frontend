"use client";
import { Download, Wallet, MoreHorizontal, Eye, CheckCircle2, ShieldCheck, Check } from "lucide-react";
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
  const [filter, setFilter] = useState("all");

  const filteredPayments = payments.filter((p) => {
    if (filter === "completed") return p.status === "completed" || p.status === "Paid";
    if (filter === "pending") return p.status === "pending" || p.status === "Pending";
    if (filter === "events") return p.itemType === "Event Pass";
    if (filter === "cash") return p.method === "CASH" && p.itemType === "Membership";
    return true;
  });

  const handleDownloadReceipt = async (r) => {
    if (!r) return;
    const isUsd = (r.currency || "").toUpperCase() === "USD";
    const currSymbol = isUsd ? "$" : "Rs.";
    const formattedAmount = `${currSymbol} ${Number(r.amount || 0).toLocaleString(isUsd ? "en-US" : "en-IN")}${isUsd ? " USD" : ""}`;

    const receiptContent = `
      <html>
        <head>
          <title>Official Receipt - ${r.invoiceNumber || "INV"}</title>
          <style>
            body { font-family: 'Inter', -apple-system, sans-serif; padding: 30px; color: #1e293b; background: #f8fafc; }
            .receipt-box { max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 36px; background: #ffffff; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); }
            .header-bar { height: 6px; background: linear-gradient(90deg, #10b981 0%, #0284c7 100%); border-radius: 6px 6px 0 0; margin: -36px -36px 30px -36px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; border-bottom: 2px solid #0f172a; padding-bottom: 20px; }
            .header h1 { margin: 0; font-size: 22px; font-weight: 800; color: #0b192c; }
            .header p { margin: 4px 0 0 0; color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
            .inv-meta { text-align: right; }
            .inv-meta h2 { margin: 0; font-size: 16px; font-weight: 800; color: #0284c7; }
            .inv-meta p { margin: 3px 0 0 0; font-size: 12px; color: #64748b; }
            .details-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
            .details-table th, .details-table td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; text-align: left; font-size: 13px; }
            .details-table th { color: #64748b; width: 35%; background: #f8fafc; font-weight: 600; }
            .total-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px 20px; text-align: right; margin-top: 24px; }
            .total-box span.label { font-size: 13px; color: #166534; font-weight: 600; text-transform: uppercase; margin-right: 12px; }
            .total-box span.val { font-size: 22px; font-weight: 800; color: #15803d; }
            .badge-verified { display: inline-block; background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
            .footer { text-align: center; color: #94a3b8; font-size: 11px; margin-top: 36px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="receipt-box">
            <div class="header-bar"></div>
            <div class="header">
              <div>
                <h1>RIFAH Chamber of Commerce</h1>
                <p>Secretariat Payment Receipt & Official Voucher</p>
              </div>
              <div class="inv-meta">
                <h2>INVOICE #${r.invoiceNumber || "N/A"}</h2>
                <p>Date: ${new Date(r.paidAt || r.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <table class="details-table">
              <tr><th>Payer Member</th><td><strong>${r.payer?.name || r.user?.name || "Member User"}</strong></td></tr>
              <tr><th>Business / Enterprise</th><td>${r.business?.name || "Member Enterprise"}</td></tr>
              <tr><th>Contact Email</th><td>${r.payer?.email || "N/A"}</td></tr>
              <tr><th>Subscription Item</th><td>${(r.itemType === "Event Pass" && r.eventId) ? `Event: ${r.eventId.title}` : (r.description || r.purpose || r.itemType || "Membership Subscription")}</td></tr>
              <tr><th>Payment Method</th><td>${r.method || "Online Gateway"}</td></tr>
              <tr><th>Currency</th><td>${r.currency || "INR"}</td></tr>
              <tr><th>Transaction ID</th><td><code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${r.transactionId || "N/A"}</code></td></tr>
              <tr><th>Audit Status</th><td><span class="badge-verified">✓ ${r.status || "Paid"}</span></td></tr>
            </table>
            <div class="total-box">
              <span class="label">Total Paid & Verified:</span>
              <span class="val">${formattedAmount}</span>
            </div>
            <div class="footer">
              This is a verified computer-generated payment receipt issued by RIFAH Chamber Secretariat.<br/>
              www.rifah.org · Official transaction record for tax & audit verification
            </div>
          </div>
        </body>
      </html>
    `;
    const blob = new Blob([receiptContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Receipt-${r.invoiceNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const pw = doc.internal.pageSize.getWidth();
    const mx = 20; // margin x
    const cw = pw - mx * 2; // content width

    // --- Gradient header bar ---
    for (let i = 0; i < cw; i++) {
      const t = i / cw;
      const red = Math.round(16 + (2 - 16) * t);
      const green = Math.round(185 + (132 - 185) * t);
      const blue = Math.round(129 + (199 - 129) * t);
      doc.setFillColor(red, green, blue);
      doc.rect(mx + i, 18, 1.2, 3, "F");
    }

    // --- Header ---
    let y = 28;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(11, 25, 44);
    doc.text("RIFAH Chamber of Commerce", mx, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("SECRETARIAT PAYMENT RECEIPT & OFFICIAL VOUCHER", mx, y + 6);

    // Invoice number & date (right aligned)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(2, 132, 199);
    doc.text(`INVOICE #${r.invoiceNumber || "N/A"}`, pw - mx, y, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Date: ${new Date(r.paidAt || r.createdAt).toLocaleDateString()}`, pw - mx, y + 6, { align: "right" });

    // Separator line
    y += 12;
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.5);
    doc.line(mx, y, pw - mx, y);

    // --- Details table ---
    y += 8;
    const rows = [
      ["Payer Member", r.payer?.name || r.user?.name || "Member User"],
      ["Business / Enterprise", r.business?.name || "Member Enterprise"],
      ["Contact Email", r.payer?.email || "N/A"],
      ["Subscription Item", r.description || r.purpose || r.itemType || "Membership Subscription"],
      ["Payment Method", r.method || "Online Gateway"],
      ["Currency", r.currency || "INR"],
      ["Transaction ID", r.transactionId || "N/A"],
      ["Audit Status", (r.status || "Paid").toUpperCase()],
    ];

    const labelW = cw * 0.35;
    const valueW = cw * 0.65;
    const rowH = 10;

    // Table border
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(mx, y - 2, cw, rows.length * rowH + 4, 2, 2, "S");

    rows.forEach(([label, value], i) => {
      const ry = y + i * rowH;

      // Label cell background
      doc.setFillColor(248, 250, 252);
      if (i === 0) {
        doc.rect(mx, ry - 2, labelW, rowH, "F");
      } else {
        doc.rect(mx, ry, labelW, rowH, "F");
      }

      // Row divider
      if (i > 0) {
        doc.setDrawColor(241, 245, 249);
        doc.setLineWidth(0.2);
        doc.line(mx, ry, pw - mx, ry);
      }

      // Label text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(label, mx + 5, ry + 6.5);

      // Value text
      if (label === "Audit Status") {
        // Green badge
        const badgeText = `  ${value}  `;
        doc.setFillColor(220, 252, 231);
        doc.setTextColor(22, 101, 52);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        const tw = doc.getTextWidth(badgeText);
        doc.roundedRect(mx + labelW + 5, ry + 2.5, tw + 4, 5.5, 2, 2, "F");
        doc.text(badgeText, mx + labelW + 7, ry + 6.5);
      } else if (label === "Payer Member") {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59);
        doc.text(value, mx + labelW + 5, ry + 6.5);
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59);
        doc.text(value, mx + labelW + 5, ry + 6.5);
      }
    });

    // --- Total box ---
    y += rows.length * rowH + 12;
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.setLineWidth(0.4);
    doc.roundedRect(mx, y, cw, 16, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(22, 101, 52);
    doc.text("TOTAL PAID & VERIFIED:", pw - mx - 5, y + 7, { align: "right" });

    doc.setFontSize(16);
    doc.setTextColor(21, 128, 61);
    doc.text(formattedAmount, pw - mx - 5, y + 13, { align: "right" });

    // --- Footer ---
    y += 26;
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.2);
    doc.line(mx, y, pw - mx, y);

    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      "This is a verified computer-generated payment receipt issued by RIFAH Chamber Secretariat.",
      pw / 2, y, { align: "center" }
    );
    doc.text(
      "www.rifah.org  |  Official transaction record for tax & audit verification",
      pw / 2, y + 5, { align: "center" }
    );

    // Save
    doc.save(`Receipt-${r.invoiceNumber || "INV"}.pdf`);
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
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <div onClick={() => setFilter("all")} className={`cursor-pointer transition-all duration-200 ${filter === 'all' ? 'ring-2 ring-primary ring-offset-2 rounded-2xl opacity-100' : 'opacity-70 hover:opacity-100'}`}>
            <StatCard
              label="Total Revenue"
              value={`₹ ${totalRevenue.toLocaleString("en-IN")}`}
              icon={Wallet}
              tone="success"
            />
          </div>
          <div onClick={() => setFilter("all")} className={`cursor-pointer transition-all duration-200 ${filter === 'all' ? 'ring-2 ring-primary ring-offset-2 rounded-2xl opacity-100' : 'opacity-70 hover:opacity-100'}`}>
            <StatCard label="Transactions" value={String(payments.length)} tone="primary" />
          </div>
          <div onClick={() => setFilter("completed")} className={`cursor-pointer transition-all duration-200 ${filter === 'completed' ? 'ring-2 ring-primary ring-offset-2 rounded-2xl opacity-100' : 'opacity-70 hover:opacity-100'}`}>
            <StatCard
              label="Completed"
              value={String(payments.filter((p) => p.status === "completed" || p.status === "Paid").length)}
              tone="success"
            />
          </div>
          <div onClick={() => setFilter("pending")} className={`cursor-pointer transition-all duration-200 ${filter === 'pending' ? 'ring-2 ring-primary ring-offset-2 rounded-2xl opacity-100' : 'opacity-70 hover:opacity-100'}`}>
            <StatCard
              label="Pending"
              value={String(payments.filter((p) => p.status === "pending" || p.status === "Pending").length)}
              tone="warning"
            />
          </div>
          <div onClick={() => setFilter("events")} className={`cursor-pointer transition-all duration-200 ${filter === 'events' ? 'ring-2 ring-primary ring-offset-2 rounded-2xl opacity-100' : 'opacity-70 hover:opacity-100'}`}>
            <StatCard
              label="Event Passes"
              value={String(payments.filter((p) => p.itemType === "Event Pass").length)}
              tone="primary"
            />
          </div>
          <div onClick={() => setFilter("cash")} className={`cursor-pointer transition-all duration-200 ${filter === 'cash' ? 'ring-2 ring-primary ring-offset-2 rounded-2xl opacity-100' : 'opacity-70 hover:opacity-100'}`}>
            <StatCard
              label="Cash Registrations"
              value={String(payments.filter((p) => p.method === "CASH" && p.itemType === "Membership").length)}
              tone="success"
            />
          </div>
        </div>

        <Panel title={filter === "all" ? "Transaction ledger" : filter === "completed" ? "Completed Transactions" : filter === "events" ? "Event Payments" : filter === "cash" ? "Cash Business Registrations" : "Pending Transactions"}>
          {error ? (
            <EmptyState
              icon={Wallet}
              title="Error Loading Payments"
              description={error.message || "Authentication token is required or session expired."}
            />
          ) : (
            <ResponsiveTable
              isLoading={isLoading}
              rows={filteredPayments}
              empty={<EmptyState icon={Wallet} title="No transactions" description="Payments will appear here." />}
            columns={[
              { key: "invoiceNumber", header: "Invoice", cell: (r) => <span className="font-semibold">{r.invoiceNumber || "N/A"}</span> },
              { key: "payer", header: "Payer", cell: (r) => r.payer?.name || r.user?.name || "Member Enterprise" },
              { key: "purpose", header: "Purpose", cell: (r) => (r.itemType === "Event Pass" && r.eventId) ? <span className="font-medium text-primary">Event: {r.eventId.title}</span> : (r.description || r.purpose || r.itemType || "Membership Subscription") },
              { key: "date", header: "Date", cell: (r) => new Date(r.paidAt || r.createdAt).toLocaleDateString() },
              {
                key: "amount",
                header: "Amount",
                cell: (r) => {
                  const isUsd = (r.currency || "").toUpperCase() === "USD";
                  return `${isUsd ? "$" : "₹"} ${Number(r.amount || 0).toLocaleString(isUsd ? "en-US" : "en-IN")}${isUsd ? " USD" : ""}`;
                },
              },
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

                      {r.status !== "completed" && r.status !== "Paid" && (
                        <DropdownMenuItem
                          className="text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700 font-semibold"
                          onClick={async () => {
                            try {
                              await paymentApi.verifyByAdmin(r._id);
                              toast.success(`Payment #${r.invoiceNumber} verified & approved!`);
                              refetch();
                            } catch (e) {
                              toast.error(e.message || "Failed to verify payment");
                            }
                          }}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-600" />
                          Verify & Approve Payment
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDownloadReceipt(r)}>
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
                  <span className="font-semibold text-lg text-emerald-600">
                    {(selectedTransaction.currency || "").toUpperCase() === "USD" ? "$" : "₹"}{" "}
                    {Number(selectedTransaction.amount || 0).toLocaleString(
                      (selectedTransaction.currency || "").toUpperCase() === "USD" ? "en-US" : "en-IN"
                    )}{" "}
                    {selectedTransaction.currency || "INR"}
                  </span>
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

          <DialogFooter className="sm:justify-between border-t pt-4 gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
            <div className="flex items-center gap-2">
              {selectedTransaction && selectedTransaction.status !== "completed" && selectedTransaction.status !== "Paid" && (
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
                  onClick={async () => {
                    try {
                      await paymentApi.verifyByAdmin(selectedTransaction._id);
                      toast.success(`Payment #${selectedTransaction.invoiceNumber} verified & approved!`);
                      setIsDetailOpen(false);
                      refetch();
                    } catch (e) {
                      toast.error(e.message || "Failed to verify payment");
                    }
                  }}
                >
                  <CheckCircle2 className="h-4 w-4" /> Verify Payment
                </Button>
              )}
              <Button 
                onClick={() => handleDownloadReceipt(selectedTransaction)}
                className="gap-1.5"
              >
                <Download className="h-4 w-4" /> Download Receipt
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export { AdminPayments };
export default AdminPayments;
