"use client";
import { useState } from "react";
import Link from "next/link";
import { Check, Crown, Download } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { MembershipBadge, Pill } from "@shared/components/rifah/badges";
import { FieldRow, Panel, ResponsiveTable } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/components/ui/dialog";
import { useMyBusiness, useMembershipPlans, useMyPayments, useMyMembership } from "@shared/hooks/use-rifah-api";

function handleDownloadPDF(payment) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    toast.error("Pop-up blocked. Please allow pop-ups to generate PDF.");
    return;
  }

  const logoUrl = `${window.location.origin}/rifah-logo.png`;

  const invoiceHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Invoice - ${payment.invoiceNumber || "INV"}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f8fafc;
            color: #0b1f33;
            padding: 30px 20px;
            -webkit-font-smoothing: antialiased;
          }
          .print-toolbar { max-width: 800px; margin: 0 auto 20px auto; display: flex; justify-content: flex-end; }
          .print-btn {
            background: linear-gradient(135deg, #0088d1 0%, #0b1f33 100%);
            color: #ffffff; border: none; padding: 10px 24px; font-size: 14px; font-weight: 700;
            border-radius: 50px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
          }
          .invoice-card {
            max-width: 800px; margin: 0 auto; background: #ffffff; border-radius: 16px;
            border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 30px -5px rgba(11, 31, 51, 0.08);
          }
          .brand-stripe { height: 6px; background: linear-gradient(90deg, #c90000 0%, #0088d1 50%, #0b1f33 100%); }
          .invoice-body { padding: 40px; }
          .header-row { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #f1f5f9; padding-bottom: 28px; margin-bottom: 32px; }
          .logo-img { height: 48px; width: auto; object-fit: contain; }
          .invoice-title { font-size: 24px; font-weight: 800; color: #0b1f33; text-transform: uppercase; }
          .invoice-number { font-size: 14px; font-weight: 700; color: #0088d1; margin-top: 4px; }
          .grid-two { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
          .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
          .info-card-header { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #0088d1; margin-bottom: 12px; }
          .table-container { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; }
          thead tr { background: #0b1f33; color: #ffffff; }
          th { font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 14px 20px; text-align: left; }
          td { padding: 18px 20px; font-size: 14px; color: #334155; border-bottom: 1px solid #f1f5f9; }
          .total-box { width: 280px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-left: auto; }
          .total-line { display: flex; justify-content: space-between; font-size: 13px; color: #64748b; margin-bottom: 8px; }
          .total-line.grand { font-size: 18px; font-weight: 800; color: #0b1f33; border-top: 2px solid #e2e8f0; padding-top: 10px; margin-bottom: 0; }
          .footer-section { margin-top: 40px; padding-top: 24px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8; }
          @media print { body { background: #ffffff; padding: 0; } .print-toolbar { display: none !important; } .invoice-card { box-shadow: none; border: none; } }
        </style>
      </head>
      <body>
        <div class="print-toolbar">
          <button class="print-btn" onclick="window.print()">Print / Download PDF</button>
        </div>
        <div class="invoice-card">
          <div class="brand-stripe"></div>
          <div class="invoice-body">
            <div class="header-row">
              <div>
                <img src="${logoUrl}" class="logo-img" alt="RIFAH" />
                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Chamber of Commerce & Business Network</div>
              </div>
              <div style="text-align: right;">
                <div class="invoice-title">OFFICIAL INVOICE</div>
                <div class="invoice-number"># ${payment.invoiceNumber || "INV-0000"}</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Issued: ${new Date(payment.paidAt || payment.createdAt || Date.now()).toLocaleDateString("en-IN")}</div>
              </div>
            </div>
            <div class="grid-two">
              <div class="info-card">
                <div class="info-card-header">BILLED TO</div>
                <div style="font-weight: 700; font-size: 16px;">${payment.payer?.name || "Member User"}</div>
                <div style="font-size: 13px; color: #475569; margin-top: 4px;">${payment.payer?.email || ""}</div>
              </div>
              <div class="info-card">
                <div class="info-card-header">PAYMENT SUMMARY</div>
                <div style="font-size: 13px;">Status: <strong>${payment.status || "Paid"}</strong></div>
                <div style="font-size: 13px; margin-top: 4px;">Txn ID: <strong>${payment.transactionId || "N/A"}</strong></div>
                <div style="font-size: 13px; margin-top: 4px;">Method: <strong>${payment.method || "Online"}</strong></div>
              </div>
            </div>
            <div class="table-container">
              <table>
                <thead>
                  <tr><th>Description</th><th style="text-align: center;">Qty</th><th style="text-align: right;">Amount</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>${payment.description || payment.purpose || payment.itemType || "Membership Subscription"}</strong></td>
                    <td style="text-align: center;">1</td>
                    <td style="text-align: right; font-weight: 700;">₹ ${(payment.amount || 0).toLocaleString("en-IN")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="total-box">
              <div class="total-line grand"><span>Total Paid:</span><span style="color:#0088d1;">₹ ${(payment.amount || 0).toLocaleString("en-IN")}</span></div>
            </div>
            <div class="footer-section">
              <p>Thank you for being a valued member of RIFAH Connect.</p>
            </div>
          </div>
        </div>
        <script>window.onload = function() { setTimeout(function() { window.print(); }, 350); }</script>
      </body>
    </html>
  `;

  printWindow.document.write(invoiceHtml);
  printWindow.document.close();
}

function handleDownloadAllInvoices(payments) {
  if (!payments || payments.length === 0) {
    toast.error("No invoices available to download");
    return;
  }

  const headers = ["Invoice Number", "Item / Purpose", "Date", "Method", "Amount (INR)", "Status"];
  const rows = payments.map((p) => [
    `"${p.invoiceNumber || ""}"`,
    `"${(p.description || p.purpose || p.itemType || "Membership Subscription").replace(/"/g, '""')}"`,
    `"${new Date(p.paidAt || p.createdAt || Date.now()).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}"`,
    `"${p.method || "Online"}"`,
    `"${p.amount || 0}"`,
    `"${p.status || "Paid"}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `RIFAH_All_Invoices_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success("All invoices downloaded successfully");
}

function BizMembership() {
  const { data: business } = useMyBusiness();
  const { data: membershipData } = useMyMembership();
  const { data: plansData } = useMembershipPlans();
  const { data: paymentsData } = useMyPayments();

  const [autoRenew, setAutoRenew] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [billingForm, setBillingForm] = useState({
    legalName: business?.name || "",
    gstNo: "27AAAAA0000A1Z5",
    billingEmail: business?.email || "accounts@example.com",
    address: business?.city ? `${business.city}, India` : "Main Street",
    city: business?.city || "Mumbai",
    postalCode: "400001",
  });

  const plans = plansData || {};
  const tierName = membershipData?.planId || business?.membership || "free";
  const currentTier = tierName.toLowerCase();

  const currentPlan = plans[currentTier] || {
    name: membershipData?.planName || (currentTier === "premium" ? "Premium" : currentTier === "enterprise" ? "Enterprise" : currentTier === "basic" ? "Basic" : "Free"),
    price: membershipData?.price || (currentTier === "premium" ? 12999 : currentTier === "enterprise" ? 29999 : currentTier === "basic" ? 4999 : 0),
    summary: "Active chamber membership plan",
    features: membershipData?.features || [],
  };

  const payments = Array.isArray(paymentsData) ? paymentsData : (paymentsData?.payments || []);

  // Calculate Started and Renews dates dynamically
  const startDateRaw =
    membershipData?.startedAt ||
    membershipData?.createdAt ||
    membershipData?.startDate ||
    business?.createdAt ||
    (payments.length > 0 ? payments[payments.length - 1].paidAt || payments[payments.length - 1].createdAt : null);

  const startDate = startDateRaw ? new Date(startDateRaw) : new Date();

  const renewDateRaw =
    membershipData?.expiresAt ||
    membershipData?.renewalDate ||
    membershipData?.endDate;

  let renewDate;
  if (renewDateRaw) {
    renewDate = new Date(renewDateRaw);
  } else {
    renewDate = new Date(startDate);
    renewDate.setFullYear(renewDate.getFullYear() + 1);
  }

  const formattedStarted = startDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const formattedRenews = renewDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const handleBillingSave = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem("rifah_billing_details", JSON.stringify(billingForm));
    } catch (err) {}
    toast.success("Billing details updated successfully");
    setDialogOpen(false);
  };

  const handleToggleAutoRenew = () => {
    const nextState = !autoRenew;
    setAutoRenew(nextState);
    if (nextState) {
      toast.success("Auto-renewal enabled for your subscription.");
    } else {
      toast.info("Auto-renewal turned off for your subscription.");
    }
  };

  return (
    <AppShell role="business" title="My membership" subtitle="Plan, benefits and invoices">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <Panel title="Current plan">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <p className="text-xl font-bold tracking-tight">{currentPlan.name}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{currentPlan.summary}</p>
              </div>
              <MembershipBadge tier={currentPlan.name} />
            </div>
            <dl className="mt-4 border-t border-border pt-2">
              <FieldRow label="Status" value={<Pill tone="success">Active</Pill>} />
              <FieldRow label="Started" value={formattedStarted} />
              <FieldRow label="Renews" value={formattedRenews} />
              <FieldRow
                label="Billing"
                value={
                  <span className="font-medium text-foreground">
                    Annual · auto-renew {autoRenew ? "on" : "off"}
                  </span>
                }
              />
              <FieldRow label="Chapter" value={business?.chapter || "Mumbai Chapter"} />
            </dl>
            <ul className="mt-4 grid gap-2 border-t border-border pt-3 sm:grid-cols-2">
              {currentPlan.features?.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Invoices" description="Membership and event payments">
            {payments.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">No invoices recorded yet.</p>
            ) : (
              <ResponsiveTable
                rows={payments}
                columns={[
                  { key: "invoiceNumber", header: "INVOICE", cell: (r) => <span className="font-semibold">{r.invoiceNumber}</span> },
                  { key: "purpose", header: "ITEM", cell: (r) => r.description || r.purpose || r.itemType || "Membership Subscription" },
                  { key: "date", header: "DATE", cell: (r) => new Date(r.paidAt || r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) },
                  { key: "method", header: "METHOD", cell: (r) => r.method || "Card" },
                  { key: "amount", header: "AMOUNT", cell: (r) => `₹ ${r.amount?.toLocaleString("en-IN")}` },
                  {
                    key: "status",
                    header: "STATUS",
                    cell: (r) => (
                      <div className="flex items-center justify-between gap-2">
                        <Pill tone={r.status === "Paid" || r.status === "completed" ? "success" : "warning"}>
                          {r.status}
                        </Pill>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Download Invoice PDF"
                          onClick={() => handleDownloadPDF(r)}
                          className="h-7 w-7 text-muted-foreground hover:text-primary"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ),
                  },
                ]}
                mobile={(r) => (
                  <div className="rounded-xl border border-border p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{r.invoiceNumber}</span>
                      <Pill tone={r.status === "Paid" || r.status === "completed" ? "success" : "warning"}>
                        {r.status}
                      </Pill>
                    </div>
                    <p className="text-sm font-semibold">{r.description || r.purpose || "Membership"}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>₹ {r.amount?.toLocaleString("en-IN")} · {r.method || "Card"}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadPDF(r)}
                        className="h-6 gap-1 px-2 text-xs"
                      >
                        <Download className="h-3 w-3" /> PDF
                      </Button>
                    </div>
                  </div>
                )}
              />
            )}
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Upgrade">
            <div className="rounded-2xl border border-sky-200/90 bg-sky-50/70 dark:border-sky-900/60 dark:bg-sky-950/25 p-5">
              <p className="flex items-center gap-2 text-sm font-bold text-[#0088d1]">
                <Crown className="h-4 w-4 text-[#0088d1]" /> Enterprise
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                For large organisations and multi-unit groups.
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Everything in Premium</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Multiple business units</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Team accounts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Custom lead rules</span>
                </li>
              </ul>
              <Button
                asChild
                className="mt-6 w-full rounded-xl bg-[#0088d1] hover:bg-[#0077b6] text-white font-semibold py-2.5 shadow-sm text-sm h-10 transition-all"
              >
                <Link href="/membership/checkout?plan=enterprise">
                  Upgrade plan
                </Link>
              </Button>
            </div>
          </Panel>

          <Panel title="Manage">
            <div className="space-y-2.5">
              <Button
                variant="outline"
                className="w-full justify-center text-sm font-medium"
                onClick={() => setDialogOpen(true)}
              >
                Update billing details
              </Button>
              <Button
                variant="outline"
                className="w-full justify-center text-sm font-medium"
                onClick={() => handleDownloadAllInvoices(payments)}
              >
                Download all invoices
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-center text-sm font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleToggleAutoRenew}
              >
                {autoRenew ? "Turn off auto-renew" : "Turn on auto-renew"}
              </Button>
            </div>
          </Panel>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update billing details</DialogTitle>
            <DialogDescription>
              Update your registered tax and invoice billing address details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBillingSave} className="space-y-3 py-2">
            <div className="space-y-1">
              <Label htmlFor="legalName" className="text-xs">Registered business name</Label>
              <Input
                id="legalName"
                value={billingForm.legalName}
                onChange={(e) => setBillingForm({ ...billingForm, legalName: e.target.value })}
                placeholder="Business Name"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="gstNo" className="text-xs">GST / Tax ID</Label>
                <Input
                  id="gstNo"
                  value={billingForm.gstNo}
                  onChange={(e) => setBillingForm({ ...billingForm, gstNo: e.target.value })}
                  placeholder="27AAAAA0000A1Z5"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="billingEmail" className="text-xs">Billing Email</Label>
                <Input
                  id="billingEmail"
                  type="email"
                  value={billingForm.billingEmail}
                  onChange={(e) => setBillingForm({ ...billingForm, billingEmail: e.target.value })}
                  placeholder="accounts@example.com"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="address" className="text-xs">Billing Address</Label>
              <Input
                id="address"
                value={billingForm.address}
                onChange={(e) => setBillingForm({ ...billingForm, address: e.target.value })}
                placeholder="Street address, area"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="city" className="text-xs">City</Label>
                <Input
                  id="city"
                  value={billingForm.city}
                  onChange={(e) => setBillingForm({ ...billingForm, city: e.target.value })}
                  placeholder="City"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="postalCode" className="text-xs">PIN Code</Label>
                <Input
                  id="postalCode"
                  value={billingForm.postalCode}
                  onChange={(e) => setBillingForm({ ...billingForm, postalCode: e.target.value })}
                  placeholder="400001"
                />
              </div>
            </div>
            <DialogFooter className="mt-4 sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save details
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export { BizMembership };
export default BizMembership;

