"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Check, Crown, Download, AlertTriangle, Clock, Sparkles } from "lucide-react";
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

function handleDownloadInvoicePDF(payment) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    toast.error("Pop-up blocked. Please allow pop-ups to generate PDF.");
    return;
  }

  const isUsd = (payment.currency || "").toUpperCase() === "USD" || (payment.description && payment.description.includes("(USD)"));
  const currSymbol = isUsd ? "$" : "₹";
  const currSuffix = isUsd ? " USD" : "";
  const locale = isUsd ? "en-US" : "en-IN";
  const formattedAmt = `${currSymbol} ${(Number(payment.amount) || 0).toLocaleString(locale)}${currSuffix}`;

  const logoUrl = `${window.location.origin}/rifah-logo.png`;
  const invoiceHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Invoice - ${payment.invoiceNumber || "INV"}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          body { background-color: #f8fafc; color: #0b1f33; padding: 30px 20px; }
          .print-toolbar { max-width: 750px; margin: 0 auto 20px auto; display: flex; justify-content: flex-end; }
          .print-btn { background: #0088d1; color: #fff; border: none; padding: 8px 20px; font-size: 14px; font-weight: 700; border-radius: 6px; cursor: pointer; }
          .invoice-card { max-width: 750px; margin: 0 auto; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .brand-stripe { height: 6px; background: linear-gradient(90deg, #c90000, #0088d1, #0b1f33); }
          .invoice-body { padding: 36px; }
          .header-row { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 24px; }
          .logo-img { height: 42px; }
          .invoice-title { font-size: 20px; font-weight: 800; color: #0b1f33; }
          .invoice-number { font-size: 14px; font-weight: 700; color: #0088d1; margin-top: 2px; }
          .grid-two { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
          .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
          .info-card-header { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #0088d1; margin-bottom: 8px; }
          .table-container { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          thead tr { background: #0b1f33; color: #fff; }
          th { font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 10px 16px; text-align: left; }
          td { padding: 14px 16px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
          .total-box { display: flex; justify-content: flex-end; margin-bottom: 24px; }
          .total-line { width: 220px; display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; border-top: 2px solid #e2e8f0; padding-top: 8px; }
          .footer-section { text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 16px; }
          @media print { body { background: #fff; padding: 0; } .print-toolbar { display: none !important; } .invoice-card { box-shadow: none; border: none; } }
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
                <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Issued: ${new Date(payment.paidAt || payment.createdAt || Date.now()).toLocaleDateString(locale)}</div>
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
                    <td style="text-align: right; font-weight: 700;">${formattedAmt}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="total-box">
              <div class="total-line grand"><span>Total Paid:</span><span style="color:#0088d1;">${formattedAmt}</span></div>
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

  const headers = ["Invoice Number", "Item / Purpose", "Date", "Method", "Currency", "Amount", "Status"];
  const rows = payments.map((p) => {
    const isUsd = (p.currency || "").toUpperCase() === "USD" || (p.description && p.description.includes("(USD)"));
    const curr = isUsd ? "USD" : (p.currency || "INR");
    return [
      `"${p.invoiceNumber || ""}"`,
      `"${(p.description || p.purpose || p.itemType || "Membership Subscription").replace(/"/g, '""')}"`,
      `"${new Date(p.paidAt || p.createdAt || Date.now()).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}"`,
      `"${p.method || "Online"}"`,
      `"${curr}"`,
      `"${p.amount || 0}"`,
      `"${p.status || "Paid"}"`,
    ];
  });

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
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [billingForm, setBillingForm] = useState({
    legalName: "",
    gstNo: "",
    billingEmail: "",
    address: "",
    city: "",
    postalCode: "",
  });

  useEffect(() => {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem("rifah_billing_details") || "null");
    } catch (err) {}

    if (saved) {
      setBillingForm(saved);
    } else if (business) {
      setBillingForm({
        legalName: business.name || "",
        gstNo: business.gstin || business.taxId || "",
        billingEmail: business.email || "",
        address: business.address || (business.city ? `${business.city}, India` : ""),
        city: business.city || "",
        postalCode: business.pincode || business.postalCode || "",
      });
    }
  }, [business]);

  const plans = plansData || {};
  const tierName = membershipData?.planId || business?.membership || "free";
  const currentTier = tierName.toLowerCase();

  const currentPlan = plans[currentTier] || {
    name: membershipData?.planName || (currentTier === "premium" ? "Premium" : currentTier === "enterprise" ? "Enterprise" : currentTier === "basic" ? "Basic" : "Free"),
    price: membershipData?.price || (currentTier === "premium" ? 12999 : currentTier === "enterprise" ? 29999 : currentTier === "basic" ? 4999 : 0),
    summary: currentTier === "free" ? "Get started on RIFAH Connect" : "Active chamber membership plan",
    features: membershipData?.features?.length > 0 ? membershipData.features : (currentTier === "enterprise" ? ["All Premium features", "Secretariat advisory", "Global chapter access", "Custom expo pavilion"] : currentTier === "premium" ? ["Featured listing", "Verified badge", "Unlimited leads", "Chamber event passes", "RFQ priority"] : currentTier === "basic" ? ["Directory listing", "Verified badge", "15 leads / mo", "Direct buyer messaging"] : ["Directory listing", "Basic search", "5 leads / mo"]),
  };

  const payments = Array.isArray(paymentsData) ? paymentsData : (paymentsData?.payments || []);

  // Calculate Started and Renews dates dynamically
  const startDateRaw =
    membershipData?.startDate ||
    membershipData?.startedAt ||
    membershipData?.createdAt ||
    business?.createdAt ||
    (payments.length > 0 ? payments[payments.length - 1].paidAt || payments[payments.length - 1].createdAt : null);

  const startDate = startDateRaw ? new Date(startDateRaw) : new Date();

  const renewDateRaw =
    membershipData?.endDate ||
    membershipData?.expiresAt ||
    membershipData?.renewalDate;

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

  // Calculate expiration status
  const now = new Date();
  const isExpired = membershipData?.isExpired || membershipData?.status === "Expired" || (renewDate && renewDate < now && currentTier !== "free");
  const daysRemaining = typeof membershipData?.daysRemaining === "number"
    ? membershipData.daysRemaining
    : Math.max(0, Math.ceil((renewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const isExpiringSoon = !isExpired && currentTier !== "free" && (membershipData?.isExpiringSoon || (daysRemaining <= 15 && daysRemaining > 0));

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

  // Dynamic available plans computed from DB / API
  const allAvailablePlans = useMemo(() => {
    const rawPlans = plansData && typeof plansData === "object" ? plansData : {};
    const keys = Object.keys(rawPlans);

    if (keys.length > 0) {
      return keys.map((key) => {
        const p = rawPlans[key] || {};
        const pId = (p.id || p.planId || key).toLowerCase();
        const priceNum = Number(p.price) || 0;
        return {
          id: pId,
          name: p.name || key.charAt(0).toUpperCase() + key.slice(1),
          price: priceNum === 0 ? "₹ 0" : `₹ ${priceNum.toLocaleString("en-IN")}`,
          rawPrice: priceNum,
          period: "/ year",
          highlight: pId === "premium",
          desc: p.summary || p.desc || (priceNum === 0 ? "Get started on RIFAH Connect with basic directory presence." : "Active chamber membership plan."),
          features: Array.isArray(p.features) && p.features.length > 0 ? p.features : ["Directory listing", "Verified badge", "Leads access"],
        };
      });
    }

    return [
      {
        id: "free",
        name: "Free",
        price: "₹ 0",
        rawPrice: 0,
        period: "/ year",
        desc: "Get started on RIFAH Connect with basic directory presence.",
        features: ["Directory listing", "Basic search", "5 leads / mo", "Standard profile"],
      },
      {
        id: "basic",
        name: "Basic",
        price: "₹ 4,999",
        rawPrice: 4999,
        period: "/ year",
        desc: "For growing businesses looking to build credibility & leads.",
        features: ["Verified Business Badge", "15 leads / mo", "Catalogue (up to 5 items)", "Direct buyer messaging"],
      },
      {
        id: "premium",
        name: "Premium",
        price: "₹ 12,999",
        rawPrice: 12999,
        period: "/ year",
        highlight: true,
        desc: "Featured placement, priority leads and VIP event invitations.",
        features: ["Featured on Directory", "Unlimited leads", "Catalogue (up to 25 items)", "Priority RFQ quoting", "2 Chamber event passes"],
      },
      {
        id: "enterprise",
        name: "Enterprise",
        price: "₹ 29,999",
        rawPrice: 29999,
        period: "/ year",
        desc: "For corporate groups, leaders and multi-chapter operations.",
        features: ["All Premium benefits", "Multi-chapter directory", "Secretariat trade advisory", "Custom expo pavilion", "Unlimited catalogue"],
      },
    ];
  }, [plansData]);

  // Smart dynamic upgrade tier calculation
  const upgradeTarget = useMemo(() => {
    if (currentTier === "free") {
      const basic = allAvailablePlans.find((p) => p.id === "basic") || allAvailablePlans[1] || allAvailablePlans[0];
      return { id: basic?.id || "basic", name: basic?.name || "Basic", price: basic?.price || "₹ 4,999", desc: basic?.desc || "For growing businesses seeking verified credentials & buyer inquiries." };
    }
    if (currentTier === "basic") {
      const prem = allAvailablePlans.find((p) => p.id === "premium") || allAvailablePlans[2] || allAvailablePlans[1];
      return { id: prem?.id || "premium", name: prem?.name || "Premium", price: prem?.price || "₹ 12,999", desc: prem?.desc || "Featured placement, unlimited leads & priority RFQ routing." };
    }
    const ent = allAvailablePlans.find((p) => p.id === "enterprise") || allAvailablePlans[allAvailablePlans.length - 1];
    return { id: ent?.id || "enterprise", name: ent?.name || "Enterprise", price: ent?.price || "₹ 29,999", desc: ent?.desc || "For large organisations and multi-unit groups." };
  }, [currentTier, allAvailablePlans]);

  return (
    <AppShell role="business" title="My membership" subtitle="Plan, benefits and invoices">
      {/* Expiry Alerts */}
      {isExpired && (
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-rose-300 bg-rose-50/90 dark:border-rose-900/60 dark:bg-rose-950/30 p-4 text-rose-950 dark:text-rose-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Your {currentPlan.name} Plan has Expired</p>
              <p className="text-xs text-rose-800 dark:text-rose-300">Renew your plan to restore full chamber access, verified credentials, and priority lead routing.</p>
            </div>
          </div>
          <Button asChild size="sm" className="shrink-0 bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm">
            <Link href={`/membership/checkout?plan=${currentTier !== "free" ? currentTier : "basic"}`}>
              Renew Now
            </Link>
          </Button>
        </div>
      )}

      {isExpiringSoon && (
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50/90 dark:border-amber-900/60 dark:bg-amber-950/30 p-4 text-amber-950 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Plan Expiring Soon ({daysRemaining} days left)</p>
              <p className="text-xs text-amber-800 dark:text-amber-300">Your membership renews on {formattedRenews}. Keep auto-renew active or renew early.</p>
            </div>
          </div>
          <Button asChild size="sm" className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm">
            <Link href={`/membership/checkout?plan=${currentTier !== "free" ? currentTier : "basic"}`}>
              Extend Plan
            </Link>
          </Button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <Panel
            title="Current plan"
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUpgradeDialogOpen(true)}
                className="rounded-xl border-sky-300 bg-sky-50/70 text-sky-700 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300 font-bold text-xs h-8 gap-1.5 shadow-2xs transition-all"
              >
                <Sparkles className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                Upgrade / Change plan
              </Button>
            }
          >
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <p className="text-xl font-bold tracking-tight">{currentPlan.name}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{currentPlan.summary}</p>
              </div>
              <MembershipBadge tier={currentPlan.name} />
            </div>
            <dl className="mt-4 border-t border-border pt-2">
              <FieldRow
                label="Status"
                value={
                  isExpired ? (
                    <Pill tone="destructive">Expired</Pill>
                  ) : isExpiringSoon ? (
                    <Pill tone="warning">Expiring Soon ({daysRemaining}d left)</Pill>
                  ) : (
                    <Pill tone="success">Active</Pill>
                  )
                }
              />
              <FieldRow label="Started" value={formattedStarted} />
              <FieldRow label="Renews" value={formattedRenews} />
              <FieldRow
                label="Billing"
                value={
                  <span className="font-medium text-foreground">
                    {membershipData?.billingCycle || "Annual"} · auto-renew {autoRenew ? "on" : "off"}
                  </span>
                }
              />
              <FieldRow label="Chapter" value={typeof business?.chapter === "object" ? business?.chapter?.name : (business?.chapter || "Chamber Mumbai")} />
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
                  { key: "amount", header: "AMOUNT", cell: (r) => (r.currency === "USD" ? `$ ${r.amount?.toLocaleString("en-US")} USD` : `₹ ${r.amount?.toLocaleString("en-IN")}`) },
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
                      <span>{r.currency === "USD" ? `$ ${r.amount?.toLocaleString("en-US")} USD` : `₹ ${r.amount?.toLocaleString("en-IN")}`} · {r.method || "Card"}</span>
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
          <Panel title="Upgrade & Plans">
            <div className="rounded-2xl border border-sky-200/90 bg-sky-50/70 dark:border-sky-900/60 dark:bg-sky-950/25 p-5">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-sm font-bold text-[#0088d1]">
                  <Crown className="h-4 w-4 text-[#0088d1]" /> {currentTier === "enterprise" ? "Enterprise" : upgradeTarget.name}
                </p>
                {currentTier === "enterprise" && (
                  <span className="rounded-full bg-sky-200/80 px-2 py-0.5 text-[10px] font-bold text-sky-800 dark:bg-sky-900 dark:text-sky-200">
                    Active
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                {currentTier === "enterprise"
                  ? "You have full access to all chamber trade privileges, secretariat advisory & multi-chapter tools."
                  : upgradeTarget.desc}
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Verified chamber directory profile</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Direct buyer B2B enquiry routing</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Full product & service catalogue</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Priority RFQ quoting privileges</span>
                </li>
              </ul>
              
              <div className="mt-6 space-y-2">
                {currentTier !== "enterprise" ? (
                  <Button
                    asChild
                    className="w-full rounded-xl bg-[#0088d1] hover:bg-[#0077b6] text-white font-semibold py-2.5 shadow-sm text-sm h-10 transition-all"
                  >
                    <Link href={`/membership/checkout?plan=${upgradeTarget.id}`}>
                      Upgrade to {upgradeTarget.name}
                    </Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="w-full rounded-xl bg-[#0088d1] hover:bg-[#0077b6] text-white font-semibold py-2.5 shadow-sm text-sm h-10 transition-all"
                  >
                    <Link href="/membership/checkout?plan=enterprise">
                      Extend / Renew Enterprise
                    </Link>
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => setUpgradeDialogOpen(true)}
                  className="w-full rounded-xl border-sky-300 text-sky-700 hover:bg-sky-100/60 dark:border-sky-800 dark:text-sky-300 text-xs font-bold h-9"
                >
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Explore all membership plans
                </Button>
              </div>
            </div>
          </Panel>

          <Panel title="Manage">
            <div className="space-y-2.5">
              <Button
                variant="outline"
                className="w-full justify-center text-sm font-semibold text-sky-700 border-sky-200 hover:bg-sky-50 dark:text-sky-300 dark:border-sky-900"
                onClick={() => setUpgradeDialogOpen(true)}
              >
                <Sparkles className="mr-1.5 h-4 w-4 text-sky-600" />
                Change or upgrade plan
              </Button>
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

      {/* Plan Selection & Upgrade Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#0088d1]" /> Choose a Membership Plan
            </DialogTitle>
            <DialogDescription>
              Select an upgraded tier to unlock higher lead limits, featured directory placement, and exclusive chamber benefits.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2 mt-4">
            {allAvailablePlans.map((plan) => {
              const isCurrent = currentTier === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col justify-between rounded-2xl border p-4.5 transition-all ${
                    isCurrent
                      ? "border-emerald-500/80 bg-emerald-50/40 dark:border-emerald-700 dark:bg-emerald-950/20 shadow-sm"
                      : plan.highlight
                      ? "border-[#0088d1] bg-sky-50/40 dark:border-sky-700 dark:bg-sky-950/20 shadow-md"
                      : "border-border bg-card hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  {isCurrent && (
                    <span className="absolute -top-2.5 right-4 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                      Current Plan
                    </span>
                  )}
                  {plan.highlight && !isCurrent && (
                    <span className="absolute -top-2.5 right-4 rounded-full bg-[#0088d1] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                      Most Popular
                    </span>
                  )}

                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="text-base font-bold text-foreground">{plan.name}</h4>
                      <div className="text-right">
                        <span className="text-lg font-extrabold text-foreground">{plan.price}</span>
                        <span className="text-xs text-muted-foreground">{plan.period}</span>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {plan.desc}
                    </p>

                    <ul className="mt-3.5 space-y-2 border-t border-border/60 pt-3 text-xs text-foreground">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-5 pt-3 border-t border-border/40">
                    {isCurrent ? (
                      <Button asChild size="sm" variant="outline" className="w-full font-bold border-emerald-400 text-emerald-700 dark:text-emerald-300">
                        <Link href={`/membership/checkout?plan=${plan.id}`}>
                          Renew {plan.name}
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        asChild
                        size="sm"
                        className={`w-full font-bold shadow-2xs ${
                          plan.highlight
                            ? "bg-[#0088d1] hover:bg-[#0077b6] text-white"
                            : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900"
                        }`}
                      >
                        <Link href={`/membership/checkout?plan=${plan.id}`}>
                          Select {plan.name}
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter className="mt-4 sm:justify-between items-center">
            <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground">
              <Link href="/membership">
                View Full Pricing Breakdown →
              </Link>
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setUpgradeDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

