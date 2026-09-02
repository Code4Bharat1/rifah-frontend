"use client";
import Link from "next/link";
import { CreditCard, Download, FileSpreadsheet, Plus, Receipt } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { useMyPayments, useMyMembership } from "@shared/hooks/use-rifah-api";

const tone = (s) =>
  s === "completed" || s === "Paid"
    ? "success"
    : s === "pending" || s === "Pending"
      ? "warning"
      : "danger";

function handleExportCSV(payments) {
  if (!payments || payments.length === 0) {
    toast.error("No transactions available to export");
    return;
  }

  const headers = ["Invoice Number", "Purpose", "Date", "Amount (INR)", "Status", "Transaction ID"];
  const rows = payments.map((p) => [
    `"${p.invoiceNumber || ""}"`,
    `"${(p.description || p.purpose || p.itemType || "Membership Subscription").replace(/"/g, '""')}"`,
    `"${new Date(p.paidAt || p.createdAt || Date.now()).toLocaleDateString()}"`,
    `"${p.amount || 0}"`,
    `"${p.status || "Paid"}"`,
    `"${p.transactionId || ""}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `RIFAH_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success("CSV exported successfully");
}

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
          .print-toolbar {
            max-width: 800px;
            margin: 0 auto 20px auto;
            display: flex;
            justify-content: flex-end;
          }
          .print-btn {
            background: linear-gradient(135deg, #0088d1 0%, #0b1f33 100%);
            color: #ffffff;
            border: none;
            padding: 10px 24px;
            font-size: 14px;
            font-weight: 700;
            border-radius: 50px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 136, 209, 0.25);
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }
          .print-btn:hover {
            opacity: 0.95;
            transform: translateY(-1px);
          }
          .invoice-card {
            max-width: 800px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
            overflow: hidden;
            box-shadow: 0 10px 30px -5px rgba(11, 31, 51, 0.08);
            position: relative;
          }
          .brand-stripe {
            height: 6px;
            background: linear-gradient(90deg, #c90000 0%, #0088d1 50%, #0b1f33 100%);
          }
          .invoice-body {
            padding: 40px;
          }
          .header-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 28px;
            margin-bottom: 32px;
          }
          .logo-container {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .logo-img {
            height: 48px;
            width: auto;
            object-fit: contain;
          }
          .brand-text {
            font-size: 26px;
            font-weight: 800;
            letter-spacing: -0.5px;
          }
          .brand-text .red { color: #c90000; }
          .brand-text .blue { color: #0088d1; }
          .brand-sub {
            font-size: 12px;
            color: #64748b;
            font-weight: 500;
            margin-top: 2px;
          }
          .invoice-tag {
            text-align: right;
          }
          .invoice-title {
            font-size: 24px;
            font-weight: 800;
            color: #0b1f33;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .invoice-number {
            font-size: 14px;
            font-weight: 700;
            color: #0088d1;
            margin-top: 4px;
          }
          .invoice-date {
            font-size: 12px;
            color: #64748b;
            margin-top: 2px;
          }
          .grid-two {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 32px;
          }
          .info-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
          }
          .info-card-header {
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #0088d1;
            margin-bottom: 12px;
          }
          .info-name {
            font-size: 16px;
            font-weight: 700;
            color: #0b1f33;
            margin-bottom: 4px;
          }
          .info-detail {
            font-size: 13px;
            color: #475569;
            margin-bottom: 3px;
          }
          .status-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #dcfce7;
            color: #15803d;
            font-size: 12px;
            font-weight: 700;
            padding: 3px 12px;
            border-radius: 20px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .status-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #16a34a;
          }
          .table-container {
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 28px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          thead tr {
            background: #0b1f33;
            color: #ffffff;
          }
          th {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            padding: 14px 20px;
            text-align: left;
          }
          td {
            padding: 18px 20px;
            font-size: 14px;
            color: #334155;
            border-bottom: 1px solid #f1f5f9;
          }
          tbody tr:last-child td {
            border-bottom: none;
          }
          .item-desc {
            font-weight: 600;
            color: #0b1f33;
          }
          .item-sub {
            font-size: 12px;
            color: #64748b;
            margin-top: 2px;
          }
          .summary-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 10px;
          }
          .stamp-badge {
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            border: 2px dashed #16a34a;
            border-radius: 8px;
            padding: 10px 18px;
            color: #16a34a;
            background: #f0fdf4;
            transform: rotate(-3deg);
          }
          .stamp-text {
            font-size: 14px;
            font-weight: 800;
            letter-spacing: 1.5px;
            text-transform: uppercase;
          }
          .stamp-sub {
            font-size: 10px;
            font-weight: 600;
            opacity: 0.8;
          }
          .total-box {
            width: 280px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 18px;
          }
          .total-line {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            color: #64748b;
            margin-bottom: 8px;
          }
          .total-line.grand {
            font-size: 18px;
            font-weight: 800;
            color: #0b1f33;
            border-top: 2px solid #e2e8f0;
            padding-top: 10px;
            margin-bottom: 0;
          }
          .total-line.grand span:last-child {
            color: #0088d1;
          }
          .footer-section {
            margin-top: 40px;
            padding-top: 24px;
            border-top: 1px solid #f1f5f9;
            text-align: center;
          }
          .footer-thanks {
            font-size: 14px;
            font-weight: 700;
            color: #0b1f33;
          }
          .footer-note {
            font-size: 11px;
            color: #94a3b8;
            margin-top: 4px;
          }
          .footer-links {
            font-size: 11px;
            font-weight: 600;
            color: #0088d1;
            margin-top: 8px;
          }

          @media print {
            body { background: #ffffff; padding: 0; }
            .print-toolbar { display: none !important; }
            .invoice-card { box-shadow: none; border: none; border-radius: 0; max-width: 100%; }
            .invoice-body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="print-toolbar">
          <button class="print-btn" onclick="window.print()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Print / Download PDF
          </button>
        </div>

        <div class="invoice-card">
          <div class="brand-stripe"></div>
          <div class="invoice-body">

            <!-- Header -->
            <div class="header-row">
              <div>
                <div class="logo-container">
                  <img src="${logoUrl}" class="logo-img" alt="RIFAH" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
                  <div class="brand-text" style="display: none;"><span class="red">RIFAH</span> <span class="blue">Connect</span></div>
                </div>
                <div class="brand-sub">Chamber of Commerce & Business Network</div>
              </div>
              <div class="invoice-tag">
                <div class="invoice-title">OFFICIAL INVOICE</div>
                <div class="invoice-number"># ${payment.invoiceNumber || "INV-0000"}</div>
                <div class="invoice-date">Issued: ${new Date(payment.paidAt || payment.createdAt || Date.now()).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              </div>
            </div>

            <!-- Grid Details -->
            <div class="grid-two">
              <div class="info-card">
                <div class="info-card-header">BILLED TO</div>
                <div class="info-name">${payment.payer?.name || "Member User"}</div>
                ${payment.payer?.email ? `<div class="info-detail">✉ ${payment.payer.email}</div>` : ""}
                ${payment.business?.name ? `<div class="info-detail">🏢 ${payment.business.name}</div>` : ""}
              </div>

              <div class="info-card">
                <div class="info-card-header">PAYMENT DETAILS</div>
                <div class="info-detail" style="margin-bottom: 6px;">
                  Status: 
                  <span class="status-pill">
                    <span class="status-dot"></span>
                    ${payment.status || "Paid"}
                  </span>
                </div>
                <div class="info-detail">Transaction ID: <strong>${payment.transactionId || "N/A"}</strong></div>
                <div class="info-detail">Payment Method: <strong>${payment.method || "Online (Razorpay)"}</strong></div>
              </div>
            </div>

            <!-- Table -->
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Description / Purpose</th>
                    <th style="text-align: center; width: 80px;">Qty</th>
                    <th style="text-align: right; width: 140px;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div class="item-desc">${payment.description || payment.purpose || payment.itemType || "Membership Subscription"}</div>
                      <div class="item-sub">RIFAH Connect Member Services & Tier Access</div>
                    </td>
                    <td style="text-align: center; font-weight: 600;">1</td>
                    <td style="text-align: right; font-weight: 700; color: #0b1f33;">₹ ${(payment.amount || 0).toLocaleString("en-IN")}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Summary -->
            <div class="summary-section">
              <div class="stamp-badge">
                <span class="stamp-text">✓ PAID & VERIFIED</span>
                <span class="stamp-sub">RIFAH CONNECT TREASURY</span>
              </div>

              <div class="total-box">
                <div class="total-line">
                  <span>Subtotal:</span>
                  <span>₹ ${(payment.amount || 0).toLocaleString("en-IN")}</span>
                </div>
                <div class="total-line">
                  <span>Taxes / Fees:</span>
                  <span>Included</span>
                </div>
                <div class="total-line grand">
                  <span>Total Paid:</span>
                  <span>₹ ${(payment.amount || 0).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer-section">
              <div class="footer-thanks">Thank you for being a valued member of RIFAH Connect</div>
              <div class="footer-note">This is a computer-generated tax receipt and requires no physical signature.</div>
              <div class="footer-links">www.rifah.org · Chamber Desk Invoicing</div>
            </div>

          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 350);
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(invoiceHtml);
  printWindow.document.close();
}

function BizPayments() {
  const { data: paymentsData } = useMyPayments();
  const { data: membershipData } = useMyMembership();
  const payments = Array.isArray(paymentsData) ? paymentsData : (paymentsData?.payments || []);
  const backendSummary = paymentsData?.summary || {};

  // 1. Paid this year count
  const currentYear = new Date().getFullYear();
  const paidThisYearCount = payments.filter((p) => {
    const isPaid = p.status === "Paid" || p.status === "completed";
    const year = new Date(p.paidAt || p.createdAt || Date.now()).getFullYear();
    return isPaid && year === currentYear;
  }).length;
  const countDisplay = backendSummary.paidThisYearCount ?? paidThisYearCount ?? payments.length;
  const paidThisYearText = `${countDisplay} ${countDisplay === 1 ? "invoice" : "invoices"}`;

  // 2. Pending count
  const pendingCount = backendSummary.pendingCount ?? payments.filter(
    (p) => p.status === "pending" || p.status === "Pending"
  ).length;

  // 3. Next renewal date
  let nextRenewalText = backendSummary.nextRenewal || "14 Nov 2026";
  if (membershipData?.expiresAt || membershipData?.validUntil || membershipData?.endDate) {
    const d = new Date(membershipData.expiresAt || membershipData.validUntil || membershipData.endDate);
    nextRenewalText = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } else if (payments.length > 0) {
    const latest = payments[0];
    const d = new Date(latest.paidAt || latest.createdAt || Date.now());
    d.setFullYear(d.getFullYear() + 1);
    nextRenewalText = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  // 4. Payment method
  const latestPayment = payments[0];
  let paymentMethodText = backendSummary.latestPaymentMethod || "Card ····4242";
  if (latestPayment?.method) {
    paymentMethodText = latestPayment.method;
  } else if (latestPayment?.transactionId) {
    paymentMethodText = latestPayment.transactionId.startsWith("pay_")
      ? "UPI / Razorpay"
      : "Card ····4242";
  }

  return (
    <AppShell
      role="business"
      title="Payments & Invoices"
      subtitle="Membership and subscription transactions"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Paid this year"
            value={paidThisYearText}
            icon={Receipt}
            tone="success"
          />
          <StatCard
            label="Pending"
            value={String(pendingCount)}
            icon={CreditCard}
            tone="warning"
          />
          <StatCard
            label="Next renewal"
            value={nextRenewalText}
          />
          <StatCard
            label="Payment method"
            value={paymentMethodText}
          />
        </div>

        <Panel
          title="Transaction history"
          action={
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => handleExportCSV(payments)}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export CSV
            </Button>
          }
        >
          {payments.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No transactions recorded yet.
            </p>
          ) : (
            <ResponsiveTable
              rows={payments}
              columns={[
                { key: "invoiceNumber", header: "Invoice", cell: (r) => <span className="font-semibold">{r.invoiceNumber}</span> },
                { key: "purpose", header: "Purpose", cell: (r) => r.description || r.purpose || r.itemType || "Membership Subscription" },
                { key: "date", header: "Date", cell: (r) => new Date(r.paidAt || r.createdAt).toLocaleDateString() },
                { key: "amount", header: "Amount", cell: (r) => `₹ ${r.amount?.toLocaleString("en-IN")}` },
                { key: "status", header: "Status", cell: (r) => <Pill tone={tone(r.status)}>{r.status}</Pill> },
                {
                  key: "action",
                  header: "Invoice",
                  className: "text-right",
                  cell: (r) => (
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Download Invoice PDF"
                      onClick={() => handleDownloadPDF(r)}
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  ),
                },
              ]}
              mobile={(r) => (
                <div className="rounded-xl border border-border p-3.5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{r.invoiceNumber}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {r.description || r.purpose || r.itemType || "Membership Subscription"} · {new Date(r.paidAt || r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Pill tone={tone(r.status)}>{r.status}</Pill>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Download Invoice PDF"
                        onClick={() => handleDownloadPDF(r)}
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
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

