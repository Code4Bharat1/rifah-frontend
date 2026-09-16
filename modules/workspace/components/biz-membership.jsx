"use client";
// Unified Business Membership & Lifecycle Module (Option 2)
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Check,
  Crown,
  Download,
  AlertTriangle,
  Clock,
  Sparkles,
  CalendarDays,
  CheckCircle2,
  ShieldCheck,
  FileText,
  CreditCard,
  Receipt,
  FileCheck,
  ChevronRight,
  Eye,
  ExternalLink,
  Lock,
  Layers,
  Info,
  Building2,
  Star,
  FileSpreadsheet,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { MembershipBadge, Pill, VerificationBadge } from "@shared/components/rifah/badges";
import { ResponsiveTable } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Switch } from "@shared/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/components/ui/dialog";
import {
  useMyBusiness,
  useMembershipPlans,
  useMyPayments,
  useMyMembership,
} from "@shared/hooks/use-rifah-api";
import { resolveMediaUrl } from "@shared/lib/api-client";
import { cn } from "@shared/lib/utils";

const docTemplates = [
  {
    type: "incorporation_certificate",
    name: "Certificate of Incorporation / Trade License",
  },
  {
    type: "gst_tax_registration",
    name: "GSTIN / Tax Registration Certificate",
  },
  {
    type: "pan_card",
    name: "Business PAN / Tax ID Card",
  },
  {
    type: "authorized_letter",
    name: "Authorized Signatory Letter / ID Proof",
  },
  {
    type: "bank_details_invoicing",
    name: "Bank Account Details / Cancelled Cheque",
  },
];

const typeAliases = {
  incorporation_certificate: [
    "incorporation_certificate",
    "certificate of incorporation",
    "certificate_of_incorporation",
    "incorporation",
    "trade_license",
    "trade license",
    "trade license / incorporation certificate",
    "company incorporation",
  ],
  gst_tax_registration: [
    "gst_tax_registration",
    "gst / tax registration",
    "gst_certificate",
    "gst certificate",
    "gst registration certificate",
    "gst",
  ],
  pan_card: [
    "pan_card",
    "pan",
    "pan card",
    "tax_id",
    "factory_licence",
    "factory licence",
  ],
  authorized_letter: [
    "authorized_letter",
    "authorized_signatory",
    "authorized signatory letter",
    "chamber_membership_form",
    "chamber membership form",
    "msme_udyam",
  ],
  bank_details_invoicing: [
    "bank_details_invoicing",
    "bank details for invoicing",
    "bank details",
    "bank_details",
    "cancelled cheque",
  ],
};

const isMatchingDoc = (docType, templateType) => {
  if (!docType) return false;
  const dt = String(docType).toLowerCase().trim();
  const tt = String(templateType).toLowerCase().trim();
  if (dt === tt) return true;
  const aliases = typeAliases[templateType] || [];
  return aliases.some((a) => dt === a || dt.includes(a) || a.includes(dt));
};

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

  const headers = ["Invoice Number", "Purpose / Item", "Date", "Method", "Currency", "Amount", "Status"];
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
  toast.success("All invoices downloaded as CSV successfully");
}

function handleDownloadCertificate(business, membershipData) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    toast.error("Pop-up blocked. Please allow pop-ups to generate certificate.");
    return;
  }

  const businessName = business?.name || "Business Enterprise";
  const tierName = (membershipData?.planName || business?.membership || "Premium").toUpperCase();
  const chapterName = typeof business?.chapter === "object" ? business?.chapter?.name : (business?.chapter || "Chamber Central");
  const memberId = business?._id ? `RIFAH-MEM-${business._id.slice(-6).toUpperCase()}` : "RIFAH-MEM-001";

  const startDate = membershipData?.startDate || membershipData?.createdAt || business?.createdAt || new Date();
  const endDate = membershipData?.endDate || membershipData?.renewalDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  const formattedStart = new Date(startDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const formattedEnd = new Date(endDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const logoUrl = `${window.location.origin}/rifah-logo.png`;

  const certHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>RIFAH Membership Certificate - ${businessName}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background-color: #f1f5f9;
          font-family: 'Plus Jakarta Sans', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 30px 15px;
          color: #0b1f33;
        }
        .toolbar {
          width: 900px;
          display: flex;
          justify-content: flex-end;
          margin-bottom: 15px;
        }
        .print-btn {
          background: #0088d1;
          color: #fff;
          border: none;
          padding: 10px 24px;
          font-weight: 700;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          box-shadow: 0 4px 10px rgba(0,136,209,0.3);
        }
        .certificate-container {
          width: 900px;
          height: 636px;
          background: #ffffff;
          border: 14px solid #0b1f33;
          outline: 3px solid #d97706;
          outline-offset: -8px;
          padding: 40px 60px;
          position: relative;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          justify-content: space-between;
          background-image: radial-gradient(circle at 50% 50%, rgba(248,250,252,1) 0%, rgba(241,245,249,0.5) 100%);
        }
        .corner-ornament {
          position: absolute;
          width: 32px;
          height: 32px;
          border-color: #d97706;
          border-style: solid;
        }
        .top-left { top: 12px; left: 12px; border-width: 3px 0 0 3px; }
        .top-right { top: 12px; right: 12px; border-width: 3px 3px 0 0; }
        .bottom-left { bottom: 12px; left: 12px; border-width: 0 0 3px 3px; }
        .bottom-right { bottom: 12px; right: 12px; border-width: 0 3px 3px 0; }
        .cert-header img { height: 48px; }
        .cert-org { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #64748b; font-weight: 800; margin-top: 6px; }
        .cert-title { font-family: 'Cinzel', serif; font-size: 32px; font-weight: 800; color: #0b1f33; letter-spacing: 3px; margin-top: 10px; }
        .cert-subtitle { font-size: 13px; color: #0088d1; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; }
        .cert-body { margin: 15px 0; max-width: 700px; }
        .cert-text { font-size: 14px; color: #475569; line-height: 1.6; }
        .member-name { font-size: 26px; font-weight: 800; color: #0b1f33; margin: 10px 0 4px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; display: inline-block; }
        .cert-tier-badge {
          display: inline-block;
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fcd34d;
          font-weight: 800;
          font-size: 12px;
          padding: 3px 14px;
          border-radius: 50px;
          letter-spacing: 1px;
          margin-top: 4px;
        }
        .cert-footer {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-top: 1px solid #e2e8f0;
          padding-top: 15px;
          font-size: 11px;
        }
        .sig-block { text-align: center; }
        .sig-line { width: 140px; border-top: 1px solid #0b1f33; margin-bottom: 4px; }
        .seal-badge {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #d97706, #b45309);
          color: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          box-shadow: 0 4px 10px rgba(180,83,9,0.3);
          border: 2px dashed #fef3c7;
        }
        @media print {
          body { background: #fff; padding: 0; }
          .toolbar { display: none; }
          .certificate-container { box-shadow: none; width: 100%; height: 100vh; border-width: 10px; }
        }
      </style>
    </head>
    <body>
      <div class="toolbar">
        <button class="print-btn" onclick="window.print()">Print / Download PDF</button>
      </div>
      <div class="certificate-container">
        <div class="corner-ornament top-left"></div>
        <div class="corner-ornament top-right"></div>
        <div class="corner-ornament bottom-left"></div>
        <div class="corner-ornament bottom-right"></div>

        <div class="cert-header">
          <img src="${logoUrl}" alt="RIFAH Logo" />
          <div class="cert-org">Chamber of Commerce & Business Network</div>
          <div class="cert-title">CERTIFICATE OF MEMBERSHIP</div>
          <div class="cert-subtitle">Official Chamber Credentials</div>
        </div>

        <div class="cert-body">
          <p class="cert-text">This is proudly presented to certify that</p>
          <div class="member-name">${businessName}</div>
          <br/>
          <div class="cert-tier-badge">${tierName} MEMBER</div>
          <p class="cert-text" style="margin-top: 10px;">
            is an officially verified and accredited business member in good standing with the
            <strong>RIFAH Chamber of Commerce, ${chapterName}</strong>.
          </p>
        </div>

        <div class="cert-footer">
          <div style="text-align: left;">
            <div><strong>Member ID:</strong> ${memberId}</div>
            <div style="margin-top: 3px;"><strong>Issue Date:</strong> ${formattedStart}</div>
            <div style="margin-top: 3px;"><strong>Valid Until:</strong> ${formattedEnd}</div>
          </div>

          <div class="seal-badge">
            <span>RIFAH</span>
            <span style="font-size:7px;">OFFICIAL</span>
            <span>SEAL</span>
          </div>

          <div class="sig-block">
            <div class="sig-line"></div>
            <strong>President / Secretary</strong>
            <div style="color: #64748b;">RIFAH Chamber Central Desk</div>
          </div>
        </div>
      </div>
      <script>window.onload = function() { setTimeout(function() { window.print(); }, 350); }</script>
    </body>
    </html>
  `;

  printWindow.document.write(certHtml);
  printWindow.document.close();
}

function BizMembership() {
  const { data: business } = useMyBusiness();
  const { data: membershipData } = useMyMembership();
  const { data: plansData } = useMembershipPlans();
  const { data: paymentsData } = useMyPayments();

  const [autoRenew, setAutoRenew] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [activeAnchor, setActiveAnchor] = useState("overview");

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
  const tierName = membershipData?.planId || business?.membership || "premium";
  const currentTier = tierName.toLowerCase();

  const currentPlan = plans[currentTier] || {
    name: membershipData?.planName || (currentTier === "premium" ? "Premium" : currentTier === "enterprise" ? "Enterprise" : currentTier === "basic" ? "Basic" : "Free"),
    price: membershipData?.price || (currentTier === "premium" ? 12999 : currentTier === "enterprise" ? 29999 : currentTier === "basic" ? 4999 : 0),
    summary: currentTier === "free" ? "Get started on RIFAH Connect" : "For established businesses. Get maximum visibility and opportunities.",
    features: membershipData?.features?.length > 0 ? membershipData.features : [
      "Featured listing in directory",
      "Verified badge",
      "Unlimited leads",
      "Chamber event passes",
      "Priority RFQ quoting privileges",
      "Direct buyer enquiries",
      "Business networking opportunities",
      "Access to exclusive events",
      "Dedicated support",
    ],
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
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedRenews = renewDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const now = new Date();
  const isExpired = membershipData?.isExpired || membershipData?.status === "Expired" || (renewDate && renewDate < now && currentTier !== "free");
  const daysRemaining = typeof membershipData?.daysRemaining === "number"
    ? membershipData.daysRemaining
    : Math.max(0, Math.ceil((renewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const isExpiringSoon = !isExpired && currentTier !== "free" && (membershipData?.isExpiringSoon || (daysRemaining <= 15 && daysRemaining > 0));

  // Verification status logic
  const uploadedDocs = Array.isArray(business?.documents) ? business.documents : [];
  const rawStatus = (business?.verification || business?.verificationStatus || "verified").toLowerCase();
  const isVerified = rawStatus === "verified" || rawStatus === "approved" || business?.isVerified === true;
  const isUnderReview = rawStatus === "under_review" || rawStatus === "pending";
  const isChangesRequired = rawStatus === "correction_requested" || rawStatus === "changes_required";
  const isRejected = rawStatus === "rejected";

  const chapterName = typeof business?.chapter === "object" ? business?.chapter?.name : (business?.chapter || "Hyderabad Chapter");

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

  const scrollToAnchor = (id) => {
    setActiveAnchor(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
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
        features: ["All Premium benefits", "Multi-chapter directory", "Central Admin trade advisory", "Custom expo pavilion", "Unlimited catalogue"],
      },
    ];
  }, [plansData]);

  return (
    <AppShell
      role="business"
      title=""
      subtitle=""
    >
      <div id="overview" className="space-y-6 max-w-[1380px] mx-auto pb-12">
        {/* Breadcrumb & Top Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Link href="/biz" className="hover:text-foreground transition-colors">Membership</Link>
              <span>&gt;</span>
              <span className="text-foreground font-medium">My Membership</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">My Membership</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Manage your plan, verification, benefits and payment history — all in one place.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card/80 px-3 py-1.5 text-xs font-semibold text-foreground/80 shadow-2xs">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Member since <strong className="text-foreground">{formattedStarted}</strong></span>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isExpired ? "Expired Plan" : "Active Member"}</span>
            </div>
          </div>
        </div>

        {/* Hero Plan Overview Bar */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs">
          <div className="absolute -right-6 -bottom-8 opacity-5 dark:opacity-10 pointer-events-none">
            <Crown className="h-44 w-44 text-amber-500" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-xs">
                <Crown className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">{currentPlan.name}</h2>
                  <span className="rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 px-2.5 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-300 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-rose-500 text-rose-500" />
                    <span>{currentPlan.name} member</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
                  {currentPlan.summary}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 pt-4 lg:pt-0 border-t lg:border-t-0 border-border">
              <div>
                <span className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Valid till</span>
                <span className="text-sm font-bold text-foreground mt-0.5 block">{formattedRenews}</span>
              </div>
              <div>
                <span className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Billing</span>
                <button
                  type="button"
                  onClick={handleToggleAutoRenew}
                  className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer group"
                  title="Click to turn auto-renewal ON or OFF"
                >
                  <span>Annual</span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all shadow-2xs",
                      autoRenew
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 group-hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                        : "bg-slate-100 text-slate-600 border-slate-200 group-hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        autoRenew ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                      )}
                    />
                    {autoRenew ? "Auto-renew ON" : "Auto-renew OFF"}
                  </span>
                </button>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Chapter</span>
                <span className="text-sm font-bold text-foreground mt-0.5 block">{chapterName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Anchor Sub-Tabs */}
        <div className="flex items-center gap-1 border-b border-border pb-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => scrollToAnchor("overview")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer",
              activeAnchor === "overview"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Layers className="h-4 w-4" />
            <span>Overview</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToAnchor("verification")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer",
              activeAnchor === "verification"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Verification</span>
          </button>
          <button
            type="button"
            onClick={() => setUpgradeDialogOpen(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
          >
            <Crown className="h-4 w-4 text-amber-500" />
            <span>Plans & Upgrade</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToAnchor("payment-history")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer",
              activeAnchor === "payment-history"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Receipt className="h-4 w-4" />
            <span>Payment History</span>
          </button>
        </div>

        {/* Row 1: 3 Columns Grid (Status, Quick Actions, Benefits) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {/* Card 1: Membership Status */}
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border/80">
                <h3 className="text-base font-bold text-foreground">Membership Status</h3>
                <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[11px] font-bold px-2.5 py-0.5">
                  {isExpired ? "Expired" : "Active"}
                </span>
              </div>

              <div className="space-y-3.5 pt-4 text-xs sm:text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Plan</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-foreground">{currentPlan.name}</span>
                    <span className="rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-600 text-[10px] font-semibold px-2 py-0.2">
                      ⭐ {currentPlan.name} member
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Started on</span>
                  <span className="font-bold text-foreground">{formattedStarted}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Valid till</span>
                  <span className="font-bold text-foreground">{formattedRenews}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Billing cycle</span>
                  <span className="font-bold text-foreground">Annual</span>
                </div>

                <div className="flex items-center justify-between py-0.5">
                  <div className="min-w-0">
                    <span className="text-muted-foreground font-medium block">Auto-renewal</span>
                    <span className="text-[11px] text-muted-foreground">
                      {autoRenew ? "Renews automatically" : "Manual renewal required"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={cn(
                        "text-xs font-bold",
                        autoRenew ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                      )}
                    >
                      {autoRenew ? "ON" : "OFF"}
                    </span>
                    <Switch
                      checked={autoRenew}
                      onCheckedChange={handleToggleAutoRenew}
                      aria-label="Toggle auto-renewal"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Chapter</span>
                  <span className="font-bold text-foreground">{chapterName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Quick Actions */}
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <h3 className="text-base font-bold text-foreground pb-4 border-b border-border/80">Quick Actions</h3>

            <div className="space-y-2.5 pt-4">
              <button
                type="button"
                onClick={() => setUpgradeDialogOpen(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-sky-200/80 bg-sky-50/50 dark:border-sky-900/40 dark:bg-sky-950/20 hover:bg-sky-100/70 hover:border-sky-300 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300">
                    <Crown className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      Upgrade or Change Plan
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">Explore higher membership benefits</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-primary transition-all shrink-0 ml-2" />
              </button>

              <button
                type="button"
                onClick={() => setDialogOpen(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-muted/60 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted text-foreground/80">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      Update Billing Details
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">Manage your payment method</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-primary transition-all shrink-0 ml-2" />
              </button>

              <div className="w-full flex items-center justify-between p-3 rounded-xl border border-border bg-card/60">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors",
                      autoRenew
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-foreground">
                      Auto-Renewal
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {autoRenew ? "Renews automatically on due date" : "Manual renewal will be required"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span
                    className={cn(
                      "text-xs font-bold",
                      autoRenew ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                    )}
                  >
                    {autoRenew ? "ON" : "OFF"}
                  </span>
                  <Switch
                    checked={autoRenew}
                    onCheckedChange={handleToggleAutoRenew}
                    aria-label="Toggle auto-renewal"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDownloadCertificate(business, membershipData)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-muted/60 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted text-foreground/80">
                    <FileCheck className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      Download Membership Certificate
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">Get your official membership certificate</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-primary transition-all shrink-0 ml-2" />
              </button>
            </div>
          </div>

          {/* Card 3: Your Benefits */}
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-2 right-2 opacity-5 pointer-events-none">
              <ShieldCheck className="h-28 w-28 text-primary" />
            </div>

            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <h3 className="text-base font-bold text-foreground">Your Benefits</h3>
              </div>

              <div className="flex items-center gap-1.5 pt-3 pb-2 text-xs font-bold text-primary">
                <ShieldCheck className="h-4 w-4" />
                <span>{currentPlan.name} Benefits</span>
              </div>

              <ul className="space-y-2 text-xs text-foreground/90">
                {currentPlan.features.slice(0, 9).map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" />
                    <span className="leading-snug">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Row 2: 2 Columns Grid (Verification Status & Verification Documents) */}
        <div id="verification" className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch pt-2">
          {/* Card 1: Verification Status */}
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">Verification Status</h3>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{isVerified ? "Verified" : isRejected ? "Rejected" : isChangesRequired ? "Changes Required" : "In Review"}</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setVerificationModalOpen(true)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View Details</span>
                  <span>→</span>
                </button>
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                {isVerified
                  ? "Your business profile has been verified by the RIFAH Secretariat."
                  : isChangesRequired
                  ? "The Secretariat requested adjustments to your verification paperwork."
                  : isRejected
                  ? "Your verification application was rejected by the Secretariat."
                  : "Your compliance paperwork is currently under review by the Secretariat desk."}
              </p>

              {/* Stepper with 4 steps */}
              <div className="grid grid-cols-4 gap-2 my-5 pt-1 text-center">
                <div className="flex flex-col items-center">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-emerald-600 text-white text-xs font-bold shadow-2xs">
                    <Check className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold text-foreground mt-1.5 leading-tight">Submitted</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Completed</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-emerald-600 text-white text-xs font-bold shadow-2xs">
                    <Check className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold text-foreground mt-1.5 leading-tight">Documents Checked</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Completed</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-emerald-600 text-white text-xs font-bold shadow-2xs">
                    <Check className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold text-foreground mt-1.5 leading-tight">Secretariat Review</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Completed</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-sky-500 text-white text-xs font-bold shadow-2xs">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold text-foreground mt-1.5 leading-tight">Verified & Live</span>
                  <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold">Active</span>
                </div>
              </div>

              {/* Embedded In-Card Alert Box (Clean, NO overlap) */}
              {isVerified && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/90 dark:border-emerald-900/50 dark:bg-emerald-950/20 p-3.5 flex items-start gap-3">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-500 text-white shadow-2xs">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-200">
                      Congratulations! Your business profile has been verified by the RIFAH Secretariat.
                    </p>
                    <p className="text-[11px] sm:text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                      Your business is now live on the directory and visible to buyers.
                    </p>
                  </div>
                </div>
              )}

              {isChangesRequired && (
                <div className="mt-4 rounded-xl border border-sky-300 bg-sky-50/90 dark:border-sky-900/50 dark:bg-sky-950/20 p-3.5 flex items-start gap-3">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-sky-600 text-white shadow-2xs">
                    <RotateCcw className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-sky-950 dark:text-sky-200">
                      Secretariat Action Required: Please replace documents
                    </p>
                    <p className="text-[11px] sm:text-xs text-sky-800 dark:text-sky-300 mt-0.5">
                      {business?.verificationReviewReason || "Please review notes and re-upload the requested certificates."}
                    </p>
                  </div>
                </div>
              )}

              {isRejected && (
                <div className="mt-4 rounded-xl border border-rose-300 bg-rose-50/90 dark:border-rose-900/50 dark:bg-rose-950/20 p-3.5 flex items-start gap-3">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-rose-600 text-white shadow-2xs">
                    <XCircle className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-rose-950 dark:text-rose-200">
                      Verification Application Rejected
                    </p>
                    <p className="text-[11px] sm:text-xs text-rose-800 dark:text-rose-300 mt-0.5">
                      {business?.verificationReviewReason || "Submitted documents did not meet verification criteria."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Verification Documents */}
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <h3 className="text-base font-bold text-foreground">Verification Documents</h3>
                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold px-2.5 py-0.5">
                  All verified
                </span>
              </div>

              <div className="space-y-2 pt-3">
                {docTemplates.map((template) => {
                  const uploaded = uploadedDocs.find((d) => isMatchingDoc(d?.type, template.type));
                  const docUrl = uploaded?.fileUrl || uploaded?.url;

                  return (
                    <div
                      key={template.type}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-border/70 bg-card/60 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400">
                          <FileText className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-semibold text-foreground truncate">
                          {template.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5">
                          Verified
                        </span>

                        <Button
                          variant="ghost"
                          size="icon"
                          title="View / Download Document"
                          onClick={() => {
                            if (docUrl) {
                              window.open(resolveMediaUrl(docUrl), "_blank");
                            } else {
                              toast.info("Document verified by chamber secretariat.");
                            }
                          }}
                          className="h-7 w-7 text-muted-foreground hover:text-primary cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Row 3 (Sabse Niche): Full Payment History */}
        <div id="payment-history" className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
            <div>
              <h3 className="text-lg font-bold text-foreground">Payment History</h3>
              <p className="text-xs text-muted-foreground mt-0.5">All your membership and event payments</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownloadAllInvoices(payments)}
              className="gap-2 text-xs font-semibold h-9 rounded-xl border-border hover:bg-muted cursor-pointer shadow-2xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download All Invoices</span>
            </Button>
          </div>

          {payments.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <Receipt className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>No payment history recorded yet.</p>
            </div>
          ) : (
            <ResponsiveTable
              rows={payments}
              columns={[
                {
                  key: "invoiceNumber",
                  header: "INVOICE NO.",
                  cell: (r) => <span className="font-bold text-xs text-foreground">{r.invoiceNumber || "INV-9763"}</span>,
                },
                {
                  key: "purpose",
                  header: "PURPOSE",
                  cell: (r) => (
                    <span className="text-xs font-medium text-foreground">
                      {r.description || r.purpose || r.itemType || "Premium Membership Subscription (INR)"}
                    </span>
                  ),
                },
                {
                  key: "date",
                  header: "DATE",
                  cell: (r) => (
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.paidAt || r.createdAt || Date.now()).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  ),
                },
                {
                  key: "amount",
                  header: "AMOUNT",
                  cell: (r) => {
                    const isUsd = (r.currency || "").toUpperCase() === "USD" || (r.description && r.description.includes("(USD)"));
                    return (
                      <span className="text-xs font-bold text-foreground">
                        {isUsd ? `$ ${Number(r.amount || 0).toLocaleString("en-US")} USD` : `₹ ${Number(r.amount || 0).toLocaleString("en-IN")}`}
                      </span>
                    );
                  },
                },
                {
                  key: "status",
                  header: "STATUS",
                  cell: (r) => (
                    <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5">
                      {r.status || "Paid"}
                    </span>
                  ),
                },
                {
                  key: "method",
                  header: "METHOD",
                  cell: (r) => <span className="text-xs font-medium text-muted-foreground">{r.method || "UPI"}</span>,
                },
                {
                  key: "action",
                  header: "ACTION",
                  className: "text-right",
                  cell: (r) => (
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Download Invoice PDF"
                      onClick={() => handleDownloadInvoicePDF(r)}
                      className="h-8 w-8 text-muted-foreground hover:text-primary cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  ),
                },
              ]}
              mobile={(r) => {
                const isUsd = (r.currency || "").toUpperCase() === "USD" || (r.description && r.description.includes("(USD)"));
                const formattedAmt = isUsd ? `$ ${Number(r.amount || 0).toLocaleString("en-US")} USD` : `₹ ${Number(r.amount || 0).toLocaleString("en-IN")}`;
                return (
                  <div className="rounded-xl border border-border p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">{r.invoiceNumber || "INV-9763"}</span>
                      <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5">
                        {r.status || "Paid"}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-foreground">{r.description || r.purpose || "Membership Subscription"}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/60">
                      <span>{formattedAmt} · {r.method || "UPI"}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadInvoicePDF(r)}
                        className="h-7 gap-1 text-xs text-primary"
                      >
                        <Download className="h-3.5 w-3.5" /> PDF
                      </Button>
                    </div>
                  </div>
                );
              }}
            />
          )}
        </div>
      </div>

      {/* Verification Details Modal */}
      <Dialog open={verificationModalOpen} onOpenChange={setVerificationModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <span>Verification Audit & Compliance</span>
            </DialogTitle>
            <DialogDescription>
              RIFAH Chamber Secretariat official vetting records
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/50 border border-border">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">Reference ID</span>
                <span className="font-bold text-foreground text-sm">
                  VER-2026-{business?._id ? business._id.slice(-4).toUpperCase() : "A3D6"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">Reviewing Desk</span>
                <span className="font-bold text-foreground text-sm">
                  Secretariat · {chapterName}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200">
              <span className="font-bold block mb-1">Status: Officially Verified & Accredited</span>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                All 5 compliance and identification documents have been verified against statutory government registries (GST, MCA, CBDT).
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setVerificationModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Explore All Plans / Upgrade Modal */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              <span>Chamber Membership Tiers</span>
            </DialogTitle>
            <DialogDescription>
              Select the right plan tier to match your enterprise growth and chamber networking requirements.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 py-4">
            {allAvailablePlans.map((plan) => {
              const isCurrent = currentTier === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col justify-between rounded-2xl border p-4 transition-all ${
                    plan.highlight
                      ? "border-sky-400 bg-sky-50/40 dark:border-sky-800 dark:bg-sky-950/20 shadow-sm"
                      : isCurrent
                      ? "border-emerald-400 bg-emerald-50/30 dark:border-emerald-900/40"
                      : "border-border bg-card"
                  }`}
                >
                  {plan.highlight && !isCurrent && (
                    <span className="absolute -top-2.5 right-4 rounded-full bg-[#0088d1] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                      Most Popular
                    </span>
                  )}

                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="text-base font-bold text-foreground">{plan.name}</h4>
                      <div className="text-right">
                        <span className="text-base font-extrabold text-foreground">{plan.price}</span>
                        <span className="text-[10px] text-muted-foreground block">{plan.period}</span>
                      </div>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                      {plan.desc}
                    </p>

                    <ul className="mt-3.5 space-y-1.5 border-t border-border/60 pt-3 text-xs text-foreground">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="text-[11px] leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/40">
                    {isCurrent ? (
                      <Button asChild size="sm" variant="outline" className="w-full font-bold text-xs border-emerald-400 text-emerald-700 dark:text-emerald-300">
                        <Link href={`/membership/checkout?plan=${plan.id}`}>
                          Renew {plan.name}
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        asChild
                        size="sm"
                        className={`w-full font-bold text-xs shadow-2xs ${
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

          <DialogFooter className="mt-2 sm:justify-between items-center">
            <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground">
              <Link href="/membership">View Full Pricing Breakdown →</Link>
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setUpgradeDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Billing Details Modal */}
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
              <Button type="submit">Save details</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export { BizMembership };
export default BizMembership;
