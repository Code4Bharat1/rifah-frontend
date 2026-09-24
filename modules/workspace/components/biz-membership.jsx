"use client";
// Unified Business Membership & Lifecycle Module (Option 2)
import { useState, useEffect, useMemo, useRef } from "react";
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
  Upload,
  ExternalLink,
  Lock,
  Layers,
  Info,
  Building2,
  Calendar,
  MapPin,
  Wallet,
  Zap,
  BadgeCheck,
  Star,
  FileSpreadsheet,
  XCircle,
  RotateCcw,
  Loader2,
  Trash2,
  Send,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { ChamberMembershipTiers } from "@shared/components/rifah/chamber-membership-tiers";
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
  useChapters,
} from "@shared/hooks/use-rifah-api";
import { verificationApi, businessApi } from "@shared/lib/api-services";
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
  const tier = (membershipData?.planName || membershipData?.planId || business?.membership || "").toLowerCase();
  if (tier === "free" || !membershipData || membershipData?.tier === "free") {
    toast.info("Accreditation Required", {
      description: "Official Chamber Membership Certificates are exclusively issued to accredited Chamber members (Silver/Gold/Platinum). Please upgrade to unlock.",
    });
    return;
  }

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    toast.error("Pop-up blocked. Please allow pop-ups to generate certificate.");
    return;
  }

  const businessName = business?.name || "Business Enterprise";
  const tierName = (membershipData?.planName || business?.membership || "Enterprise").toUpperCase();
  const chapterName = typeof business?.chapter === "object" ? business?.chapter?.name : (business?.chapter || "Mumbai");
  const memberId = business?._id ? `RIFAH-MEM-${business._id.slice(-6).toUpperCase()}` : "RIFAH-MEM-BF403C";

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
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,400;1,600&family=Montserrat:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background-color: #0f172a;
          background-image: radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 100%);
          font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 30px 15px 50px;
          min-height: 100vh;
          color: #0b1f33;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        /* Top Action Toolbar */
        .toolbar {
          width: 940px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding: 12px 20px;
          background: rgba(30, 41, 59, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
        }
        .toolbar-info {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #e2e8f0;
          font-size: 13px;
        }
        .toolbar-pill {
          background: rgba(197, 155, 39, 0.2);
          border: 1px solid rgba(197, 155, 39, 0.4);
          color: #fcd34d;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 20px;
          letter-spacing: 0.5px;
        }
        .print-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #c59b27 0%, #e0b84c 50%, #b8861b 100%);
          color: #0f172a;
          border: 1px solid #fef08a;
          padding: 10px 24px;
          font-weight: 800;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 15px rgba(197, 155, 39, 0.4);
          transition: all 0.2s ease;
        }
        .print-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(197, 155, 39, 0.5);
        }

        /* Certificate Master Container */
        .cert-outer-wrapper {
          position: relative;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        .certificate-container {
          width: 940px;
          height: 650px;
          background: #ffffff;
          background-image: radial-gradient(ellipse at 50% 45%, #ffffff 0%, #fdfbf7 65%, #f7f1e4 100%);
          border: 12px solid #081729;
          outline: 3px solid #c59b27;
          outline-offset: -7px;
          padding: 36px 54px 30px;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          justify-content: space-between;
          overflow: hidden;
        }

        /* Inset Guilloche / Security Border Line */
        .cert-inner-frame {
          position: absolute;
          top: 14px;
          left: 14px;
          right: 14px;
          bottom: 14px;
          border: 1px solid rgba(197, 155, 39, 0.55);
          outline: 1px solid rgba(8, 23, 41, 0.25);
          outline-offset: -5px;
          pointer-events: none;
        }

        /* Classical Filigree Corner Brackets */
        .corner-filigree {
          position: absolute;
          width: 52px;
          height: 52px;
          pointer-events: none;
          z-index: 2;
        }
        .filigree-tl { top: 12px; left: 12px; }
        .filigree-tr { top: 12px; right: 12px; transform: scaleX(-1); }
        .filigree-bl { bottom: 12px; left: 12px; transform: scaleY(-1); }
        .filigree-br { bottom: 12px; right: 12px; transform: scale(-1); }

        /* Faint Security Emblem Watermark in Center */
        .cert-watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 320px;
          height: 320px;
          opacity: 0.038;
          pointer-events: none;
          background: url('${logoUrl}') no-repeat center center;
          background-size: contain;
          filter: grayscale(100%);
          z-index: 1;
        }

        /* Header Elements */
        .cert-header {
          position: relative;
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }
        .cert-logo {
          height: 72px;
          max-width: 230px;
          object-fit: contain;
          filter: drop-shadow(0 2px 5px rgba(0,0,0,0.05));
        }
        .cert-chamber-tag {
          font-family: 'Montserrat', sans-serif;
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 3.5px;
          color: #8a733e;
          text-transform: uppercase;
          margin-top: 8px;
        }
        .cert-title {
          font-family: 'Cinzel', Georgia, serif;
          font-size: 23px;
          font-weight: 800;
          color: #081729;
          letter-spacing: 3.5px;
          margin-top: 5px;
          line-height: 1.15;
        }
        .ornament-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 360px;
          margin: 6px auto 3px;
        }
        .ornament-divider .line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, #c59b27, transparent);
        }
        .ornament-divider .diamond {
          color: #c59b27;
          font-size: 10px;
          line-height: 1;
        }
        .cert-credential-tag {
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          color: #b45309;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2.2px;
        }

        /* Body Section */
        .cert-body {
          position: relative;
          z-index: 3;
          margin: 6px 0 10px;
          max-width: 740px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .cert-presentation {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-size: 14.5px;
          color: #556477;
          letter-spacing: 0.2px;
        }
        .member-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 32px;
          font-weight: 800;
          color: #081729;
          letter-spacing: 0.5px;
          text-transform: capitalize;
          margin: 6px 0 4px;
          line-height: 1.2;
        }
        .name-accent-rule {
          width: 280px;
          height: 1.5px;
          background: linear-gradient(90deg, transparent, #c59b27 25%, #c59b27 75%, transparent);
          margin-bottom: 8px;
        }
        .tier-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #fffef7 0%, #fef3c7 50%, #fde68a 100%);
          border: 1px solid #d4af37;
          box-shadow: 0 2px 6px rgba(180, 130, 30, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.9);
          padding: 3.5px 18px;
          border-radius: 50px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 800;
          font-size: 10.5px;
          letter-spacing: 2px;
          color: #78350f;
          text-transform: uppercase;
        }
        .tier-badge .star {
          color: #d97706;
          font-size: 9px;
        }
        .cert-body-text {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px;
          color: #475569;
          line-height: 1.6;
          max-width: 660px;
          margin-top: 10px;
        }
        .cert-highlight {
          font-weight: 700;
          color: #081729;
        }

        /* Footer Section */
        .cert-footer {
          position: relative;
          z-index: 3;
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-top: 14px;
          border-top: 1px solid rgba(226, 232, 240, 0.8);
        }

        /* Left Credentials Block */
        .cert-credentials {
          text-align: left;
          font-family: 'Montserrat', sans-serif;
          font-size: 10.5px;
        }
        .cred-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 2.5px;
        }
        .cred-label {
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #64748b;
          width: 72px;
          text-transform: uppercase;
        }
        .cred-val {
          font-weight: 700;
          color: #081729;
          font-family: 'Plus Jakarta Sans', monospace;
          letter-spacing: 0.4px;
        }
        .cred-status-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-top: 5px;
          padding: 2.5px 8px;
          border-radius: 4px;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: #047857;
          font-size: 8.5px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .status-pulse {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 5px rgba(16, 185, 129, 0.8);
        }

        /* Center Official Gold Seal Medallion */
        .seal-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-bottom: -4px;
        }
        .seal-svg-container {
          filter: drop-shadow(0 5px 12px rgba(146, 64, 14, 0.35));
        }

        /* Right Signature Block */
        .sig-block {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 170px;
        }
        .sig-svg-wrap {
          height: 38px;
          display: flex;
          align-items: flex-end;
          margin-bottom: 2px;
          opacity: 0.9;
        }
        .sig-line {
          width: 160px;
          height: 1px;
          background: #081729;
          margin-bottom: 4px;
        }
        .sig-title {
          font-family: 'Montserrat', sans-serif;
          font-weight: 800;
          font-size: 10.5px;
          color: #081729;
          letter-spacing: 0.6px;
        }
        .sig-role {
          font-size: 9.5px;
          color: #475569;
          font-weight: 600;
          margin-top: 1px;
        }
        .sig-dept {
          font-size: 8.5px;
          color: #94a3b8;
          letter-spacing: 0.5px;
        }

        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body {
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            min-height: 100vh !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .toolbar { display: none !important; }
          .cert-outer-wrapper {
            box-shadow: none !important;
            width: 100vw !important;
            height: 100vh !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .certificate-container {
            width: 100% !important;
            height: 100% !important;
            border-width: 12px !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="toolbar">
        <div class="toolbar-info">
          <span class="toolbar-pill">OFFICIAL CREDENTIAL</span>
          <span>RIFAH Chamber of Commerce Membership Certificate</span>
        </div>
        <button class="print-btn" onclick="window.print()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          Print / Save as PDF
        </button>
      </div>

      <div class="cert-outer-wrapper">
        <div class="certificate-container">
          <!-- Inset Frame Line -->
          <div class="cert-inner-frame"></div>

          <!-- Symmetrical Classic Filigree Corner Vectors -->
          <div class="corner-filigree filigree-tl">
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
              <path d="M4 4h44M4 4v44" stroke="#c59b27" stroke-width="2.2" stroke-linecap="square"/>
              <path d="M10 10h28M10 10v28" stroke="#081729" stroke-width="1.2"/>
              <circle cx="4" cy="4" r="2.8" fill="#c59b27"/>
              <circle cx="22" cy="4" r="1.5" fill="#c59b27"/>
              <circle cx="4" cy="22" r="1.5" fill="#c59b27"/>
              <path d="M14 14c0 6 6 6 6 6" stroke="#c59b27" stroke-width="1" stroke-linecap="round"/>
              <circle cx="14" cy="14" r="1.8" fill="#c59b27"/>
            </svg>
          </div>
          <div class="corner-filigree filigree-tr">
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
              <path d="M4 4h44M4 4v44" stroke="#c59b27" stroke-width="2.2" stroke-linecap="square"/>
              <path d="M10 10h28M10 10v28" stroke="#081729" stroke-width="1.2"/>
              <circle cx="4" cy="4" r="2.8" fill="#c59b27"/>
              <circle cx="22" cy="4" r="1.5" fill="#c59b27"/>
              <circle cx="4" cy="22" r="1.5" fill="#c59b27"/>
              <path d="M14 14c0 6 6 6 6 6" stroke="#c59b27" stroke-width="1" stroke-linecap="round"/>
              <circle cx="14" cy="14" r="1.8" fill="#c59b27"/>
            </svg>
          </div>
          <div class="corner-filigree filigree-bl">
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
              <path d="M4 4h44M4 4v44" stroke="#c59b27" stroke-width="2.2" stroke-linecap="square"/>
              <path d="M10 10h28M10 10v28" stroke="#081729" stroke-width="1.2"/>
              <circle cx="4" cy="4" r="2.8" fill="#c59b27"/>
              <circle cx="22" cy="4" r="1.5" fill="#c59b27"/>
              <circle cx="4" cy="22" r="1.5" fill="#c59b27"/>
              <path d="M14 14c0 6 6 6 6 6" stroke="#c59b27" stroke-width="1" stroke-linecap="round"/>
              <circle cx="14" cy="14" r="1.8" fill="#c59b27"/>
            </svg>
          </div>
          <div class="corner-filigree filigree-br">
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
              <path d="M4 4h44M4 4v44" stroke="#c59b27" stroke-width="2.2" stroke-linecap="square"/>
              <path d="M10 10h28M10 10v28" stroke="#081729" stroke-width="1.2"/>
              <circle cx="4" cy="4" r="2.8" fill="#c59b27"/>
              <circle cx="22" cy="4" r="1.5" fill="#c59b27"/>
              <circle cx="4" cy="22" r="1.5" fill="#c59b27"/>
              <path d="M14 14c0 6 6 6 6 6" stroke="#c59b27" stroke-width="1" stroke-linecap="round"/>
              <circle cx="14" cy="14" r="1.8" fill="#c59b27"/>
            </svg>
          </div>

          <!-- Security Watermark -->
          <div class="cert-watermark"></div>

          <!-- Certificate Header -->
          <div class="cert-header">
            <img class="cert-logo" src="${logoUrl}" alt="RIFAH Chamber of Commerce and Industry" />
            <div class="cert-chamber-tag">Chamber of Commerce & Business Network</div>
            <div class="cert-title">CERTIFICATE OF MEMBERSHIP</div>
            <div class="ornament-divider">
              <span class="line"></span>
              <span class="diamond">❖</span>
              <span class="line"></span>
            </div>
            <div class="cert-credential-tag">Official Chamber Accreditation</div>
          </div>

          <!-- Certificate Body -->
          <div class="cert-body">
            <p class="cert-presentation">This is proudly presented to certify that</p>
            <div class="member-name">${businessName}</div>
            <div class="name-accent-rule"></div>
            <div class="tier-badge">
              <span class="star">★</span>
              <span>${tierName} MEMBER</span>
              <span class="star">★</span>
            </div>
            <p class="cert-body-text">
              is an officially recognized and accredited corporate business member in good standing with the
              <strong class="cert-highlight">RIFAH Chamber of Commerce, ${chapterName} Chapter</strong>,
              entitled to all membership privileges, commercial affiliations, and business networking forums.
            </p>
          </div>

          <!-- Certificate Footer -->
          <div class="cert-footer">
            <!-- Left Metadata -->
            <div class="cert-credentials">
              <div class="cred-row">
                <span class="cred-label">Member ID:</span>
                <span class="cred-val">${memberId}</span>
              </div>
              <div class="cred-row">
                <span class="cred-label">Issue Date:</span>
                <span class="cred-val">${formattedStart}</span>
              </div>
              <div class="cred-row">
                <span class="cred-label">Valid Until:</span>
                <span class="cred-val">${formattedEnd}</span>
              </div>
              <div class="cred-status-chip">
                <span class="status-pulse"></span>
                <span>Verified Active Credential</span>
              </div>
            </div>

            <!-- Center Gold Foil Seal with Silk Ribbon Tails -->
            <div class="seal-wrapper">
              <div class="seal-svg-container">
                <svg width="98" height="106" viewBox="0 0 98 106" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <!-- Satin Ribbon Tails -->
                  <path d="M34 62 L20 102 L36 94 L44 102 L42 62 Z" fill="#991b1b" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
                  <path d="M64 62 L78 102 L62 94 L54 102 L56 62 Z" fill="#b91c1c" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
                  <path d="M34 62 L20 102 L29 97 L36 94 L42 62 Z" fill="#dc2626"/>
                  <path d="M64 62 L78 102 L69 97 L62 94 L56 62 Z" fill="#ef4444"/>

                  <!-- Gold Radial & Linear Definitions -->
                  <defs>
                    <radialGradient id="sealGold" cx="35%" cy="30%" r="70%">
                      <stop offset="0%" stop-color="#fffbeb"/>
                      <stop offset="28%" stop-color="#f59e0b"/>
                      <stop offset="65%" stop-color="#d97706"/>
                      <stop offset="90%" stop-color="#b45309"/>
                      <stop offset="100%" stop-color="#78350f"/>
                    </radialGradient>
                    <linearGradient id="ringGold" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#fef08a"/>
                      <stop offset="50%" stop-color="#b45309"/>
                      <stop offset="100%" stop-color="#fde047"/>
                    </linearGradient>
                  </defs>

                  <!-- 24-point Scalloped Starburst Rosette -->
                  <g transform="translate(49, 44)">
                    <g>
                      ${Array.from({ length: 24 }).map((_, i) => `<polygon points="0,-42 5,-35 -5,-35" transform="rotate(${i * 15})" fill="#b45309"/>`).join('')}
                    </g>
                    <!-- Outer Golden Medallion Disc -->
                    <circle cx="0" cy="0" r="38" fill="url(#sealGold)" stroke="#78350f" stroke-width="1"/>
                    <circle cx="0" cy="0" r="35" fill="none" stroke="#fef3c7" stroke-width="1.2" stroke-dasharray="2 1.5"/>
                    <circle cx="0" cy="0" r="32" fill="none" stroke="#78350f" stroke-width="0.8"/>

                    <!-- Inner Disc -->
                    <circle cx="0" cy="0" r="28" fill="#92400e"/>
                    <circle cx="0" cy="0" r="26.5" fill="url(#sealGold)"/>

                    <!-- Medallion Center Typography & Stars -->
                    <text x="0" y="-14" text-anchor="middle" font-family="'Cinzel', Georgia, serif" font-weight="900" font-size="7" fill="#78350f" letter-spacing="1">RIFAH</text>
                    <text x="0" y="-5" text-anchor="middle" font-family="'Montserrat', sans-serif" font-weight="800" font-size="4.2" fill="#78350f" letter-spacing="1.5">★ OFFICIAL ★</text>
                    <text x="0" y="7" text-anchor="middle" font-family="'Cinzel', Georgia, serif" font-weight="900" font-size="10" fill="#78350f" letter-spacing="1.5">SEAL</text>
                    <text x="0" y="16" text-anchor="middle" font-family="'Montserrat', sans-serif" font-weight="800" font-size="4" fill="#92400e" letter-spacing="1.2">ACCREDITED</text>
                    <polygon points="0,21 1.5,23.5 4,23.5 2,25 3,27.5 0,26 -3,27.5 -2,25 -4,23.5 -1.5,23.5" fill="#78350f"/>
                  </g>
                </svg>
              </div>
            </div>

            <!-- Right Official Authorizing Signature -->
            <div class="sig-block">
              <div class="sig-svg-wrap">
                <svg width="150" height="38" viewBox="0 0 150 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 26 C22 6, 36 8, 40 18 C44 28, 56 4, 66 14 C76 26, 82 8, 96 14 C104 18, 118 20, 142 16 M36 24 C50 26, 78 22, 110 24" stroke="#081729" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="sig-line"></div>
              <div class="sig-title">Authorized Signatory</div>
              <div class="sig-role">President / National Secretariat</div>
              <div class="sig-dept">RIFAH Chamber Central Desk</div>
            </div>
          </div>
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 400);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(certHtml);
  printWindow.document.close();
}

function BizMembership() {
  const { data: business, refetch: refetchBiz } = useMyBusiness();
  const hasBusinessProfile = Boolean(
    business &&
    business._id &&
    ((typeof business.name === "string" && business.name.trim().length > 0) ||
     (typeof business.title === "string" && business.title.trim().length > 0) ||
     (typeof business.legalName === "string" && business.legalName.trim().length > 0))
  );
  const { data: membershipData } = useMyMembership();
  const { data: plansData } = useMembershipPlans();
  const { data: paymentsData } = useMyPayments();
  const { data: chaptersData } = useChapters();

  const chaptersList = useMemo(() => {
    const list = Array.isArray(chaptersData) ? chaptersData : chaptersData?.chapters || [];
    return list;
  }, [chaptersData]);

  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [assigningChapter, setAssigningChapter] = useState(false);

  const [verificationData, setVerificationData] = useState(null);
  const [loadingVerification, setLoadingVerification] = useState(false);
  const [replacingType, setReplacingType] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [submittingVerification, setSubmittingVerification] = useState(false);

  const [autoRenew, setAutoRenew] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [deletingType, setDeletingType] = useState(null);
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState(null);
  const fileInputRef = useRef(null);
  const [activeAnchor, setActiveAnchor] = useState("overview");

  const fetchVerification = async () => {
    if (!business?._id) return;
    try {
      setLoadingVerification(true);
      const res = await verificationApi.getByBusinessId(business._id);
      let verif = null;
      if (res && typeof res === "object" && "data" in res) {
        verif = res.data;
      } else {
        verif = res;
      }
      setVerificationData(
        verif && typeof verif === "object" && Array.isArray(verif.documents)
          ? verif
          : verif && typeof verif === "object" && verif.documents
          ? verif
          : null
      );
    } catch (err) {
      console.error("fetchVerification error in biz-membership:", err);
      setVerificationData(null);
    } finally {
      setLoadingVerification(false);
    }
  };

  useEffect(() => {
    if (business?._id) {
      fetchVerification();
    }
  }, [business?._id]);

  const handleReplaceClick = (templateType) => {
    if (!hasBusinessProfile) {
      toast.warning("Complete Business Profile First", {
        description: "Please fill in and save your business details under Workspace > Profile before uploading compliance documents.",
      });
      return;
    }
    setReplacingType(templateType);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !replacingType) return;

    if (!business?._id || !hasBusinessProfile) {
      toast.warning("Complete Business Profile First", {
        description: "Please fill in and save your business details under Workspace > Profile before uploading compliance documents.",
      });
      return;
    }

    const fileName = (file.name || "").toLowerCase();
    const fileType = (file.type || "").toLowerCase();
    const isAllowed =
      fileType === "application/pdf" ||
      fileType.includes("pdf") ||
      fileType.startsWith("image/") ||
      fileName.endsWith(".pdf") ||
      fileName.endsWith(".jpg") ||
      fileName.endsWith(".jpeg") ||
      fileName.endsWith(".png") ||
      fileName.endsWith(".webp");

    if (!isAllowed) {
      toast.error("Please upload documents in PDF format (.pdf) or clear image scans (.jpg, .png, .webp).");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error("File size must be less than 25 MB.");
      return;
    }

    setUploadingDoc(true);
    const toastId = toast.loading(`Uploading "${file.name}"...`);
    try {
      const uploadRes = await verificationApi.uploadDocument(file);
      const fileData = uploadRes && typeof uploadRes === "object" && "data" in uploadRes ? uploadRes.data : uploadRes;
      const filePath = fileData?.fileUrl || fileData?.path || fileData?.url;

      if (!filePath) {
        toast.error("File upload failed — no file URL received from server.", { id: toastId });
        return;
      }

      const existingDocs = Array.isArray(verificationData?.documents)
        ? verificationData.documents
        : Array.isArray(business?.documents)
        ? business.documents
        : [];

      const updatedDocs = [
        ...existingDocs.filter((d) => !isMatchingDoc(d?.type, replacingType)),
        {
          type: replacingType,
          name: file.name,
          fileUrl: filePath,
          status: "pending",
          uploadedAt: new Date().toISOString(),
        },
      ];

      const submitRes = await verificationApi.submit({
        businessId: business._id,
        documents: updatedDocs,
      });

      const updatedRecord = submitRes && typeof submitRes === "object" && "data" in submitRes ? submitRes.data : submitRes;
      if (updatedRecord && updatedRecord.documents) {
        setVerificationData(updatedRecord);
      } else {
        await fetchVerification();
      }

      if (refetchBiz) await refetchBiz();

      toast.success(`"${file.name}" uploaded successfully.`, { id: toastId });
    } catch (err) {
      console.error("Replace document error:", err);
      toast.error(err.message || "Failed to upload document.", { id: toastId });
    } finally {
      setUploadingDoc(false);
      setReplacingType(null);
    }
  };

  const handleDeleteDocument = async (templateType, docName, uploadedInfo = null) => {
    if (!business?._id || !hasBusinessProfile) {
      toast.warning("Complete Business Profile First", {
        description: "Please fill in and save your business details under Workspace > Profile before managing compliance documents.",
      });
      return;
    }

    setDeletingType(templateType);
    const toastId = toast.loading(`Deleting "${docName || "document"}"...`);
    try {
      const existingDocs = Array.isArray(verificationData?.documents)
        ? verificationData.documents
        : Array.isArray(business?.documents)
        ? business.documents
        : [];

      const targetUrl = uploadedInfo?.fileUrl || uploadedInfo?.url || uploadedInfo?.path;
      const targetId = uploadedInfo?._id;

      const updatedDocs = existingDocs.filter((d) => {
        if (targetId && d?._id && String(d._id) === String(targetId)) return false;
        if (targetUrl && (d?.fileUrl === targetUrl || d?.url === targetUrl || d?.path === targetUrl)) return false;
        if (isMatchingDoc(d?.type, templateType) || isMatchingDoc(d?.name, templateType)) return false;
        return true;
      });

      const submitRes = await verificationApi.submit({
        businessId: business._id,
        documents: updatedDocs,
        notes: `Business owner deleted document: ${docName || templateType}`,
      });

      const updatedRecord =
        submitRes && typeof submitRes === "object" && "data" in submitRes
          ? submitRes.data
          : submitRes;

      if (updatedRecord && Array.isArray(updatedRecord.documents)) {
        setVerificationData(updatedRecord);
      } else {
        await fetchVerification();
      }

      if (refetchBiz) await refetchBiz();

      toast.success(
        `"${docName || "Document"}" deleted successfully. You can now upload the correct file.`,
        { id: toastId }
      );

      if (
        previewDoc &&
        (previewDoc.type === templateType ||
          isMatchingDoc(previewDoc.type, templateType) ||
          isMatchingDoc(previewDoc.name, templateType))
      ) {
        setPreviewDoc(null);
      }
    } catch (err) {
      console.error("Delete document error:", err);
      toast.error(err.message || "Failed to delete document.", { id: toastId });
    } finally {
      setDeletingType(null);
      setDeleteConfirmDoc(null);
    }
  };

  const handleSubmitForVerification = async () => {
    if (!hasBusinessProfile) {
      toast.warning("Complete Business Profile First", {
        description: "Please fill in and save your business details under Workspace > Profile before submitting verification documents.",
      });
      return;
    }

    if (totalUploadedDocsCount === 0) {
      toast.warning("No Documents Uploaded", {
        description: "Please upload your business compliance/registration documents before submitting for Chapter Admin verification.",
      });
      return;
    }

    setSubmittingVerification(true);
    const toastId = toast.loading("Submitting documents to Chapter Admin for verification...");
    try {
      const existingDocs = Array.isArray(verificationData?.documents)
        ? verificationData.documents
        : Array.isArray(business?.documents)
        ? business.documents
        : [];

      const docsToSend = existingDocs.length > 0 ? existingDocs : uploadedDocs;

      const submitRes = await verificationApi.submit({
        businessId: business._id,
        documents: docsToSend,
        notes: `Business owner submitted ${docsToSend.length} document(s) for Chapter Admin verification`,
      });

      const updatedRecord =
        submitRes && typeof submitRes === "object" && "data" in submitRes
          ? submitRes.data
          : submitRes;

      if (updatedRecord && Array.isArray(updatedRecord.documents)) {
        setVerificationData(updatedRecord);
      } else {
        await fetchVerification();
      }

      if (refetchBiz) await refetchBiz();

      const chapterName = business?.chapter || "your Chapter";
      toast.success(`Verification documents submitted successfully! Sent to ${chapterName} Admin for review.`, {
        id: toastId,
        duration: 5000,
      });
    } catch (err) {
      console.error("Submit verification error:", err);
      toast.error(err.message || "Failed to submit verification to Chapter Admin.", { id: toastId });
    } finally {
      setSubmittingVerification(false);
    }
  };

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
  const tierName = membershipData?.planName || membershipData?.planId || business?.membership || "Free";
  const currentTier = (tierName || "").toLowerCase();

  const matchedPlan = Object.values(plans).find(
    (p) => (p.id || p.planId || "").toLowerCase() === currentTier || (p.name || "").toLowerCase() === currentTier
  ) || plans[currentTier];

  const currentPlan = matchedPlan || {
    name: membershipData?.planName || (currentTier === "free" ? "Free" : tierName) || "Free",
    price: membershipData?.price ?? 0,
    summary: membershipData?.summary || (currentTier === "free" ? "Get started on RIFAH Connect with basic directory presence." : "Active Chamber Membership"),
    features: membershipData?.features?.length > 0 ? membershipData.features : [
      "Directory listing on RIFAH Connect",
      "Basic business presence",
      "Search visibility",
    ],
  };

  const isFreeTier = currentTier === "free" || (currentPlan?.name || "").toLowerCase() === "free";

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
  const daysProgress = Math.max(10, Math.min(100, Math.round(((365 - Math.min(365, daysRemaining)) / 365) * 100)));
  const isExpiringSoon = !isExpired && currentTier !== "free" && (membershipData?.isExpiringSoon || (daysRemaining <= 15 && daysRemaining > 0));

  // Verification status logic & uploaded documents
  const uploadedDocs = useMemo(() => {
    if (verificationData && Array.isArray(verificationData.documents)) {
      return verificationData.documents;
    }
    if (Array.isArray(business?.documents)) {
      return business.documents;
    }
    return [];
  }, [verificationData, business]);

  const rawStatus = (
    verificationData?.status ||
    business?.verification ||
    business?.verificationStatus ||
    "pending"
  ).toLowerCase();
  const isVerified = (rawStatus === "verified" || rawStatus === "approved" || business?.isVerified === true) && (rawStatus !== "rejected" && rawStatus !== "correction_requested");
  const isUnderReview = rawStatus === "under_review" || rawStatus === "pending";
  const isChangesRequired = rawStatus === "correction_requested" || rawStatus === "changes_required";
  const isRejected = rawStatus === "rejected";

  const findMatchingUploadedDoc = (templateType, docs) => {
    if (!Array.isArray(docs) || docs.length === 0) return null;
    const byType = docs.find((d) => isMatchingDoc(d?.type, templateType));
    if (byType) return byType;
    const byName = docs.find((d) => isMatchingDoc(d?.name, templateType));
    if (byName) return byName;
    return null;
  };

  const verifiedDocsCount = useMemo(() => {
    return docTemplates.filter((template) => {
      const m = findMatchingUploadedDoc(template.type, uploadedDocs);
      return m && (m.status === "verified" || m.status === "approved" || isVerified);
    }).length;
  }, [uploadedDocs, isVerified]);

  const totalUploadedDocsCount = useMemo(() => {
    return docTemplates.filter((template) => {
      const m = findMatchingUploadedDoc(template.type, uploadedDocs);
      return Boolean(m?.fileUrl || m?.url || m?.path);
    }).length;
  }, [uploadedDocs]);

  const displayVerifiedCount = isVerified ? docTemplates.length : verifiedDocsCount;

  const handlePreviewDocument = (template, uploaded) => {
    const docUrl = uploaded?.fileUrl || uploaded?.url || uploaded?.path;
    if (!docUrl) {
      toast.info(`No document file uploaded yet for "${template.name}". Click Replace to upload.`);
      handleReplaceClick(template.type);
      return;
    }

    setPreviewDoc({
      name: uploaded?.name || template.name,
      fileUrl: docUrl,
      type: template.type,
      docDate: uploaded?.uploadedAt
        ? new Date(uploaded.uploadedAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : formattedStarted,
      status: uploaded?.status || (isVerified ? "Verified" : "Pending"),
    });
  };

  const rawChapter = typeof business?.chapter === "object" ? business?.chapter?.name : business?.chapter;
  const isChapterInvalid = !rawChapter || rawChapter.trim().toLowerCase() === "unassigned" || rawChapter.trim().toLowerCase() === "none";

  const chapterName = useMemo(() => {
    if (rawChapter && !isChapterInvalid) {
      return rawChapter.includes("Chapter") ? rawChapter : `${rawChapter} Chapter`;
    }

    if (business?.chapterId && chaptersList.length > 0) {
      const matchById = chaptersList.find((c) => String(c._id) === String(business.chapterId));
      if (matchById?.name) return matchById.name;
    }

    if (business?.city && chaptersList.length > 0) {
      const cleanCity = business.city.trim().toLowerCase();
      const matchByCity = chaptersList.find(
        (c) =>
          c.city?.trim().toLowerCase() === cleanCity ||
          c.name?.trim().toLowerCase().includes(cleanCity)
      );
      if (matchByCity?.name) return matchByCity.name;
    }

    if (business?.state && chaptersList.length > 0) {
      const cleanState = business.state.trim().toLowerCase();
      const matchByState = chaptersList.find(
        (c) => c.state?.trim().toLowerCase() === cleanState
      );
      if (matchByState?.name) return matchByState.name;
    }

    if (business?.city && business.city.trim()) {
      return `${business.city} Chapter`;
    }

    return "Hyderabad Chapter";
  }, [rawChapter, isChapterInvalid, business, chaptersList]);

  // Auto-sync resolved chapter to backend if business had unassigned/missing chapter
  useEffect(() => {
    if (business?._id && isChapterInvalid && chapterName && chapterName.toLowerCase() !== "unassigned") {
      const matched = chaptersList.find((c) => c.name?.toLowerCase() === chapterName.toLowerCase());
      businessApi.update(business._id, {
        chapter: chapterName,
        ...(matched?._id ? { chapterId: matched._id } : {}),
      })
      .then(() => {
        if (refetchBiz) refetchBiz();
      })
      .catch(() => {});
    }
  }, [business?._id, isChapterInvalid, chapterName, chaptersList]);

  const handleAssignChapter = async (selectedCh) => {
    if (!business?._id || !selectedCh) return;
    setAssigningChapter(true);
    const toastId = toast.loading(`Assigning ${selectedCh.name}...`);
    try {
      await businessApi.update(business._id, {
        chapter: selectedCh.name,
        chapterId: selectedCh._id,
      });
      if (refetchBiz) await refetchBiz();
      toast.success(`Assigned to ${selectedCh.name} successfully!`, { id: toastId });
      setChapterModalOpen(false);
    } catch (err) {
      toast.error(err.message || "Failed to update chapter.", { id: toastId });
    } finally {
      setAssigningChapter(false);
    }
  };

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
    const entries = Array.isArray(rawPlans)
      ? rawPlans.map(p => ({ id: p.id || p.planId, ...p }))
      : Object.entries(rawPlans).map(([key, p]) => ({ id: p.id || p.planId || key, ...p }));

    const activeList = entries
      .filter((p) => p.isActive !== false)
      .sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0));

    return activeList.map((p) => {
      const pId = (p.id || p.planId || "").toLowerCase();
      const priceNum = Number(p.price) || 0;
      const durationYears = Number(p.durationYears) || 1;
      return {
        id: pId,
        name: p.name || pId.toUpperCase(),
        price: priceNum === 0 ? "₹ 0" : `₹ ${priceNum.toLocaleString("en-IN")}`,
        rawPrice: priceNum,
        period: durationYears === 1 ? "/ year" : `/ ${durationYears} yrs`,
        highlight: Boolean(p.isRecommended),
        desc: p.summary || (priceNum === 0 ? "Get started on RIFAH Connect with basic directory presence." : "Active chamber membership plan."),
        features: Array.isArray(p.features) && p.features.length > 0 ? p.features : ["Directory listing", "Verified badge", "Leads access"],
      };
    });
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
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
              <Link href="/biz" className="hover:text-primary transition-colors flex items-center gap-1 font-medium">
                <Building2 className="h-3.5 w-3.5" />
                <span>Workspace</span>
              </Link>
              <span className="text-border">/</span>
              <span className="text-foreground font-semibold">Membership & Accreditation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <span>My Membership</span>
              {isVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold px-2.5 py-0.5">
                  <Crown className="h-3 w-3" />
                  <span>{currentPlan.name}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-xs font-bold px-3 py-0.5 shadow-2xs">
                  <Clock className="h-3 w-3 text-amber-600 animate-pulse" />
                  <span>{currentPlan.name} (Approval Pending)</span>
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Manage your chamber plan, compliance audit, accredited perks and payment records.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {!isFreeTier && (
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card/80 px-3.5 py-2 text-xs font-semibold text-foreground shadow-2xs">
                <CalendarDays className="h-3.5 w-3.5 text-primary" />
                <span>{isVerified ? "Member since" : "Application submitted"} <strong className="font-bold">{formattedStarted}</strong></span>
              </div>
            )}

            {isFreeTier ? (
              <button
                type="button"
                onClick={() => setUpgradeDialogOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                <span>Free Basic Plan</span>
              </button>
            ) : isVerified ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>{isExpired ? "Expired Plan" : "Active Accredited Member"}</span>
              </div>
            ) : isRejected ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 px-3.5 py-2 text-xs font-bold text-rose-700 dark:text-rose-300 shadow-2xs">
                <XCircle className="h-3.5 w-3.5" />
                <span>Verification Rejected</span>
              </div>
            ) : isChangesRequired ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/80 px-3.5 py-2 text-xs font-bold text-sky-700 dark:text-sky-300 shadow-2xs">
                <RotateCcw className="h-3.5 w-3.5 text-sky-600 animate-spin" />
                <span>Changes Requested by Secretariat</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/80 px-3.5 py-2 text-xs font-bold text-amber-800 dark:text-amber-200 shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                <span>Membership Confirmation Pending</span>
              </div>
            )}
          </div>
        </div>

        {/* Hero Plan Overview Banner: Redesigned for Pending Buyer/Business vs Active Member */}
        {!isVerified && !isFreeTier ? (
          <div className="relative overflow-hidden rounded-3xl border border-amber-300/80 dark:border-amber-800/70 bg-gradient-to-br from-amber-50/90 via-card to-card dark:from-amber-950/30 dark:via-card dark:to-card p-6 sm:p-8 shadow-sm transition-all">
            {/* Subtle Ambient Radial Glows */}
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
            <div className="absolute right-4 -bottom-6 opacity-5 dark:opacity-10 pointer-events-none transform rotate-6">
              <ShieldCheck className="h-64 w-64 text-amber-600" />
            </div>

            <div className="relative z-10 space-y-6">
              {/* Top Banner Row: Icon + Title & Explanation */}
              <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
                <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
                  <div className="relative grid h-16 w-16 sm:h-18 sm:w-18 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25 ring-4 ring-amber-100 dark:ring-amber-950/60">
                    <Clock className="h-8 w-8 sm:h-9 sm:w-9" />
                    <span className="absolute -bottom-1.5 -right-1.5 grid h-6 w-6 place-items-center rounded-full bg-amber-600 text-white ring-2 ring-background text-[10px]">
                      <AlertTriangle className="h-3.5 w-3.5" />
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                        Membership Confirmation Pending
                      </h2>
                      <span className="rounded-full bg-amber-100/90 dark:bg-amber-900/60 border border-amber-300 dark:border-amber-700 px-3 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-200 flex items-center gap-1.5 shadow-2xs">
                        <Clock className="h-3 w-3 text-amber-600 animate-pulse" />
                        <span>Awaiting Secretariat Approval</span>
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-3xl leading-relaxed">
                      Your application for the <strong className="font-semibold text-foreground">{currentPlan.name} Chamber Membership</strong> has been registered and is currently under compliance audit. Once your verification documents are reviewed and approved by the Chapter Secretariat desk, your official green verified shield badge, directory search visibility, and full membership benefits will be activated.
                    </p>

                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        <span>Submitted: <strong className="text-foreground">{formattedStarted}</strong></span>
                      </span>
                      <span className="text-border">•</span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-rose-500" />
                        <span>Chapter: <strong className="text-foreground">{chapterName}</strong></span>
                        <button
                          type="button"
                          onClick={() => setChapterModalOpen(true)}
                          className="text-[10px] text-primary hover:underline ml-1 cursor-pointer font-medium"
                        >
                          (Change)
                        </button>
                      </span>
                      <span className="text-border">•</span>
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Estimated review: 24–48 business hours</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Quick Action Buttons */}
                <div className="flex flex-wrap sm:flex-nowrap xl:flex-col gap-2.5 shrink-0">
                  <Button
                    type="button"
                    onClick={() => scrollToAnchor("verification")}
                    className="gap-1.5 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-600/20 cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>{totalUploadedDocsCount < docTemplates.length ? "Upload Pending Documents" : "Review Submitted Documents"}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => scrollToAnchor("payment-history")}
                    className="gap-1.5 rounded-xl font-semibold text-xs border-border hover:bg-muted cursor-pointer"
                  >
                    <Receipt className="h-3.5 w-3.5 text-sky-500" />
                    <span>View Payment Invoice</span>
                  </Button>
                </div>
              </div>

              {/* 4-Step Milestone Progress Bar */}
              <div className="pt-4 border-t border-amber-200/60 dark:border-amber-900/40">
                <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-amber-600" />
                  <span>Membership Activation Milestones:</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Milestone 1 */}
                  <div className="p-3 rounded-2xl bg-background/90 dark:bg-card/90 border border-emerald-200 dark:border-emerald-900/50 shadow-2xs flex items-center gap-3">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white shadow-xs">
                      <Check className="h-4 w-4 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground">1. Application & Plan</p>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{currentPlan.name} Recorded ✓</p>
                    </div>
                  </div>

                  {/* Milestone 2 */}
                  <div className={cn(
                    "p-3 rounded-2xl bg-background/90 dark:bg-card/90 border shadow-2xs flex items-center gap-3",
                    totalUploadedDocsCount >= docTemplates.length
                      ? "border-emerald-200 dark:border-emerald-900/50"
                      : "border-amber-300 dark:border-amber-800"
                  )}>
                    <div className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-xl text-white shadow-xs",
                      totalUploadedDocsCount >= docTemplates.length ? "bg-emerald-500" : "bg-amber-500"
                    )}>
                      {totalUploadedDocsCount >= docTemplates.length ? (
                        <Check className="h-4 w-4 stroke-[2.5]" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground">2. Compliance Docs</p>
                      <p className={cn(
                        "text-[11px] font-semibold",
                        totalUploadedDocsCount >= docTemplates.length
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-amber-700 dark:text-amber-300"
                      )}>
                        {totalUploadedDocsCount} of {docTemplates.length} Attached
                      </p>
                    </div>
                  </div>

                  {/* Milestone 3 */}
                  <div className="p-3 rounded-2xl bg-background/90 dark:bg-card/90 border border-amber-300 dark:border-amber-800 shadow-2xs flex items-center gap-3">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-amber-500 text-white shadow-xs">
                      <Clock className="h-4 w-4 animate-spin" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground">3. Secretariat Desk</p>
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold">Under Audit ⏳</p>
                    </div>
                  </div>

                  {/* Milestone 4 */}
                  <div className="p-3 rounded-2xl bg-background/60 dark:bg-card/60 border border-border/60 shadow-2xs flex items-center gap-3 opacity-75">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground border">
                      <Lock className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground">4. Live Accreditation</p>
                      <p className="text-[11px] text-muted-foreground">Unlocks upon approval</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-3xl border border-amber-300/60 dark:border-amber-900/50 bg-gradient-to-br from-amber-50/70 via-card to-card dark:from-amber-950/20 dark:via-card dark:to-card p-6 sm:p-8 shadow-sm transition-all">
            {/* Subtle Ambient Radial Glows */}
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            <div className="absolute right-2 -bottom-4 opacity-10 dark:opacity-15 pointer-events-none transform rotate-12">
              <Crown className="h-56 w-56 text-amber-500" />
            </div>

            <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6 lg:gap-8">
              {/* Left Info with Crown & Progress Bar */}
              <div className="flex items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0">
                <div className="relative grid h-16 w-16 sm:h-18 sm:w-18 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25 ring-4 ring-amber-100 dark:ring-amber-950/60">
                  <Crown className="h-8 w-8 sm:h-9 sm:w-9" />
                  <span className="absolute -bottom-1.5 -right-1.5 grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-white ring-2 ring-background text-[10px]">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                      {currentPlan.name} Tier
                    </h2>
                    {!isFreeTier && (
                      <span className="rounded-full bg-amber-100/80 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700 px-3 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-200 flex items-center gap-1 shadow-2xs">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        <span>VIP Member Access</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl leading-relaxed">
                    {currentPlan.summary}
                  </p>

                  {/* Days Remaining Progress Bar - ONLY for Paid Active Tiers */}
                  {!isFreeTier && (
                    <div className="mt-3.5 max-w-md">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground mb-1">
                        <span className="flex items-center gap-1 text-foreground font-bold">
                          <Clock className="h-3 w-3 text-amber-500" />
                          <span>{daysRemaining} days remaining in current cycle</span>
                        </span>
                        <span className="text-muted-foreground font-normal">Renews {formattedRenews}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted/80 overflow-hidden p-0.5 border border-border/40">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 via-emerald-500 to-emerald-400 transition-all duration-500"
                          style={{ width: `${daysProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Meta Chips & Actions */}
              <div className="flex flex-col sm:flex-row xl:flex-col justify-between items-start xl:items-end gap-4 pt-4 xl:pt-0 border-t xl:border-t-0 border-border/70 shrink-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full xl:w-auto">
                  {!isFreeTier && (
                    <div className="p-3 rounded-2xl bg-background/80 dark:bg-card/80 border border-border/70 shadow-2xs min-w-[130px]">
                      <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-primary" /> Valid Until
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-foreground mt-1 block truncate">{formattedRenews}</span>
                    </div>
                  )}

                  {!isFreeTier && (
                    <div className="p-3 rounded-2xl bg-background/80 dark:bg-card/80 border border-border/70 shadow-2xs min-w-[130px]">
                      <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Wallet className="h-3 w-3 text-emerald-500" /> Billing
                      </span>
                      <button
                        type="button"
                        onClick={handleToggleAutoRenew}
                        className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer group"
                        title="Click to toggle auto-renewal"
                      >
                        <span>Annual</span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold border transition-all shadow-2xs",
                            autoRenew
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 group-hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                              : "bg-slate-100 text-slate-600 border-slate-200 group-hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                          )}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", autoRenew ? "bg-emerald-500 animate-pulse" : "bg-slate-400")} />
                          {autoRenew ? "Auto ON" : "Auto OFF"}
                        </span>
                      </button>
                    </div>
                  )}

                  <div className={cn(
                    "p-3 rounded-2xl bg-background/80 dark:bg-card/80 border border-border/70 shadow-2xs min-w-[130px]",
                    isFreeTier ? "col-span-2 sm:col-span-3 min-w-[220px]" : "col-span-2 sm:col-span-1"
                  )}>
                    <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-rose-500" /> Chapter
                      </span>
                      <button
                        type="button"
                        onClick={() => setChapterModalOpen(true)}
                        className="text-[9px] font-semibold text-primary hover:underline cursor-pointer"
                      >
                        Change
                      </button>
                    </span>
                    <button
                      type="button"
                      onClick={() => setChapterModalOpen(true)}
                      className="text-xs sm:text-sm font-bold text-foreground mt-1 block truncate hover:text-primary transition-colors text-left cursor-pointer w-full group flex items-center justify-between gap-1"
                      title="Click to view or change chapter"
                    >
                      <span className="truncate">{chapterName}</span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full xl:w-auto">
                  <Button
                    type="button"
                    onClick={() => setUpgradeDialogOpen(true)}
                    className="flex-1 xl:flex-none gap-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-sm shadow-amber-500/20 cursor-pointer"
                  >
                    <Crown className="h-3.5 w-3.5" />
                    <span>{isFreeTier ? "Upgrade Plan" : "Upgrade / Change Plan"}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Anchor Sub-Tabs (Segmented Frosted Pill Bar) */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-muted/60 border border-border/80 overflow-x-auto no-scrollbar shadow-2xs">
          <button
            type="button"
            onClick={() => scrollToAnchor("overview")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap",
              activeAnchor === "overview"
                ? "bg-background text-foreground shadow-xs border border-border/80"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40"
            )}
          >
            <Layers className="h-4 w-4" />
            <span>Overview</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToAnchor("verification")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap",
              activeAnchor === "verification"
                ? "bg-background text-foreground shadow-xs border border-border/80"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40"
            )}
          >
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Compliance & Documents</span>
            <span className={cn(
              "rounded-full text-[10px] font-bold px-1.5 py-0.2",
              isVerified
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                : isRejected
                ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
            )}>
              {isVerified
                ? "Verified ✓"
                : isRejected
                ? "Correction Needed"
                : totalUploadedDocsCount >= docTemplates.length
                ? "Under Review"
                : `${totalUploadedDocsCount}/${docTemplates.length} Attached`}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setUpgradeDialogOpen(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-background/40 transition-all cursor-pointer whitespace-nowrap"
          >
            <Crown className="h-4 w-4 text-amber-500" />
            <span>All 4 Plans & Pricing</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToAnchor("payment-history")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap",
              activeAnchor === "payment-history"
                ? "bg-background text-foreground shadow-xs border border-border/80"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40"
            )}
          >
            <Receipt className="h-4 w-4 text-sky-500" />
            <span>Payment History</span>
            <span className="rounded-full bg-muted text-muted-foreground text-[10px] font-bold px-1.5 py-0.2">
              {payments.length}
            </span>
          </button>
        </div>

        {/* Row 1: 3 Columns Grid (Status, Quick Actions, Benefits) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {/* Card 1: Membership Status */}
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-border/90 transition-all">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">Membership Status</h3>
                  <span className="relative flex h-2 w-2">
                    <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", isVerified ? "bg-emerald-400" : "bg-amber-400")} />
                    <span className={cn("relative inline-flex rounded-full h-2 w-2", isVerified ? "bg-emerald-500" : "bg-amber-500")} />
                  </span>
                </div>
                <span className={cn(
                  "rounded-full text-[11px] font-bold px-2.5 py-0.5",
                  !isVerified
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                    : isExpired
                    ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                )}>
                  {!isVerified ? "Confirmation Pending" : isExpired ? "Expired" : "Active"}
                </span>
              </div>

              <div className="space-y-2.5 pt-4 text-xs sm:text-sm">
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
                  <span className="text-muted-foreground font-medium flex items-center gap-2">
                    <Crown className="h-3.5 w-3.5 text-amber-500" /> Current Plan
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-foreground">{currentPlan.name}</span>
                    <span className={cn(
                      "rounded-full border text-[10px] font-semibold px-2 py-0.2",
                      isFreeTier
                        ? "bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-700 dark:text-slate-300"
                        : isVerified
                        ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200 text-amber-700 dark:text-amber-300"
                        : "bg-amber-100/70 dark:bg-amber-950/60 border-amber-300 text-amber-800 dark:text-amber-200"
                    )}>
                      {isFreeTier ? "Basic" : isVerified ? `⭐ ${currentPlan.name}` : "⏳ Pending Approval"}
                    </span>
                  </div>
                </div>

                {!isFreeTier && (
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
                    <span className="text-muted-foreground font-medium flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-sky-500" /> Started On
                    </span>
                    <span className="font-bold text-foreground">{formattedStarted}</span>
                  </div>
                )}

                {!isFreeTier && (
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
                    <span className="text-muted-foreground font-medium flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-emerald-500" /> Valid Until
                    </span>
                    <span className="font-bold text-foreground">
                      {isVerified ? formattedRenews : "Activates on approval"}
                    </span>
                  </div>
                )}

                {!isFreeTier && (
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
                    <span className="text-muted-foreground font-medium flex items-center gap-2">
                      <Wallet className="h-3.5 w-3.5 text-violet-500" /> Billing Cycle
                    </span>
                    <span className="font-bold text-foreground">Annual Subscription</span>
                  </div>
                )}

                {!isFreeTier && (
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
                    <div className="min-w-0">
                      <span className="text-muted-foreground font-medium flex items-center gap-2">
                        <RotateCcw className="h-3.5 w-3.5 text-primary" /> Auto-Renewal
                      </span>
                      <span className="text-[10px] text-muted-foreground block pl-5.5">
                        {!isVerified ? "Scheduled upon approval" : autoRenew ? "Renews automatically" : "Manual renewal required"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn("text-xs font-bold", autoRenew ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
                        {autoRenew ? "ON" : "OFF"}
                      </span>
                      <Switch
                        checked={autoRenew}
                        onCheckedChange={handleToggleAutoRenew}
                        aria-label="Toggle auto-renewal"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
                  <span className="text-muted-foreground font-medium flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-rose-500" /> Chamber Chapter
                  </span>
                  <button
                    type="button"
                    onClick={() => setChapterModalOpen(true)}
                    className="font-bold text-foreground truncate max-w-[140px] text-right hover:text-primary hover:underline transition-colors cursor-pointer text-xs"
                    title="Click to view or change chapter"
                  >
                    {chapterName}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Quick Actions */}
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-border/90 transition-all">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border/80">
                <h3 className="text-base font-bold text-foreground">Quick Actions</h3>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Fast Access</span>
              </div>

              <div className="space-y-3 pt-4">
                <button
                  type="button"
                  onClick={() => setUpgradeDialogOpen(true)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-sky-200/80 bg-gradient-to-r from-sky-50/70 to-card dark:border-sky-900/40 dark:from-sky-950/20 dark:to-card hover:bg-sky-100/70 hover:border-sky-300 hover:shadow-md hover:-translate-y-0.5 transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-sm shadow-sky-500/20 group-hover:scale-105 transition-transform">
                      <Crown className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          {isFreeTier ? "Upgrade Plan" : "Upgrade or Change Plan"}
                        </p>
                        <span className="rounded-full bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 text-[9px] font-extrabold px-1.5 py-0.2">
                          Tier
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {isFreeTier ? "Unlock verified badge, leads & chamber perks" : "Explore higher membership benefits"}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all shrink-0 ml-2" />
                </button>

                <button
                  type="button"
                  onClick={() => setDialogOpen(true)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-border bg-card hover:bg-muted/50 hover:shadow-md hover:-translate-y-0.5 transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white dark:from-slate-600 dark:to-slate-800 shadow-sm group-hover:scale-105 transition-transform">
                      <CreditCard className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        Update Billing Details
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">Manage tax ID, address & invoices</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all shrink-0 ml-2" />
                </button>

                {/* Membership Certificate - ONLY FOR ACCREDITED PAID MEMBERS, NOT FREE TIER */}
                {!isFreeTier && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!isVerified) {
                        toast.info("Certificate Locked", {
                          description: "Your official Membership Certificate will be available to download once the Chapter Secretariat verifies and approves your application."
                        });
                        return;
                      }
                      handleDownloadCertificate(business, membershipData);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between p-3.5 rounded-2xl border text-left cursor-pointer group transition-all",
                      isVerified
                        ? "border-border bg-card hover:bg-muted/50 hover:shadow-md hover:-translate-y-0.5"
                        : "border-border/60 bg-muted/20 opacity-80 hover:bg-muted/40"
                    )}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={cn(
                        "grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white shadow-sm transition-transform group-hover:scale-105",
                        isVerified
                          ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20"
                          : "bg-gradient-to-br from-slate-400 to-slate-600"
                      )}>
                        {isVerified ? <FileCheck className="h-4.5 w-4.5" /> : <Lock className="h-4.5 w-4.5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                            Download Membership Certificate
                          </p>
                          <span className={cn(
                            "rounded-full text-[9px] font-extrabold px-1.5 py-0.2",
                            isVerified
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                              : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                          )}>
                            {isVerified ? "PDF" : "Locked"}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {isVerified ? "Official Chamber membership certificate" : "Unlocks once Secretariat approves membership"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all shrink-0 ml-2" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Your Benefits */}
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between relative overflow-hidden hover:border-border/90 transition-all">
            <div className="absolute -top-4 -right-4 opacity-5 pointer-events-none">
              <ShieldCheck className="h-36 w-36 text-primary" />
            </div>

            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">Your Benefits</h3>
                  <span className="rounded-full bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5">
                    {currentPlan.features.length} Perks
                  </span>
                </div>
                <span className={cn(
                  "rounded-full border text-[10px] font-bold px-2 py-0.5",
                  isFreeTier
                    ? "bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-700 dark:text-slate-300"
                    : isVerified
                    ? "bg-amber-50 dark:bg-amber-950/50 border-amber-200 text-amber-700 dark:text-amber-300"
                    : "bg-amber-100/70 dark:bg-amber-950/60 border-amber-300 text-amber-800 dark:text-amber-200"
                )}>
                  {isFreeTier ? "Free Tier" : isVerified ? `${currentPlan.name} VIP` : `${currentPlan.name} (Pending)`}
                </span>
              </div>

              <div className="pt-3.5 space-y-2">
                {currentPlan.features.slice(0, 6).map((f, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 p-2 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 mt-0.5">
                      <Check className="h-3 w-3 stroke-[2.5]" />
                    </div>
                    <span className="text-xs font-medium text-foreground/90 leading-tight">{f}</span>
                  </div>
                ))}
              </div>

              {!isVerified && (
                <div className="mt-3 p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 flex items-start gap-2">
                  <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium leading-tight">
                    Benefits and verified chapter accreditation will activate immediately upon confirmation.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border/70 mt-3">
              <button
                type="button"
                onClick={() => setUpgradeDialogOpen(true)}
                className="w-full text-center text-xs font-bold text-primary hover:underline flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Compare All Plan Tiers & Benefits</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: 2 Columns Grid (Verification Status & Verification Documents) */}
        <div id="verification" className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch pt-2 scroll-mt-20">
          {/* Card 1: Verification Status (Vertical Animated Stepper) */}
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-border/90 transition-all">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-foreground">Verification Status</h3>
                  <span className={cn(
                    "rounded-full text-[11px] font-bold px-2.5 py-0.5 flex items-center gap-1.5 border shadow-2xs",
                    isVerified
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                      : isRejected
                      ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
                      : isChangesRequired
                      ? "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800"
                      : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                  )}>
                    {isVerified ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : isRejected ? (
                      <XCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                    ) : isChangesRequired ? (
                      <RotateCcw className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                    ) : (
                      <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
                    )}
                    <span>{isVerified ? "Verified" : isRejected ? "Rejected" : isChangesRequired ? "Changes Required" : "Under Review"}</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setVerificationModalOpen(true)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span>Audit Trail</span>
                  <span>→</span>
                </button>
              </div>

              <p className="text-xs text-muted-foreground mt-2.5">
                {isVerified
                  ? "Your business profile has been vetted and officially accredited by the RIFAH Chamber Secretariat."
                  : isChangesRequired
                  ? "The Secretariat requested adjustments to your verification paperwork."
                  : isRejected
                  ? "Your verification application was rejected by the Secretariat."
                  : "Your compliance paperwork is currently under review by the Chapter Admin and Secretariat desk."}
              </p>

              {/* Vertical Stepper with Connected Animated Progress Line */}
              <div className="relative my-7 pl-1 space-y-9 sm:space-y-10">
                {/* Step 1: Profile & Application Submitted */}
                <div className="relative flex items-start gap-4.5 group">
                  {/* Vertical Track connecting to step 2 */}
                  <div
                    className={cn(
                      "absolute left-[17px] top-11 -bottom-9 w-[2px] rounded-full transition-all duration-500",
                      hasBusinessProfile
                        ? totalUploadedDocsCount >= docTemplates.length
                          ? "bg-emerald-500"
                          : totalUploadedDocsCount > 0
                          ? "bg-gradient-to-b from-emerald-500 to-amber-500"
                          : "bg-emerald-500"
                        : "bg-muted-foreground/20"
                    )}
                  />

                  <div
                    className={cn(
                      "relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full ring-4 ring-card transition-all duration-300",
                      hasBusinessProfile
                        ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/25"
                        : "bg-amber-500 text-white shadow-sm shadow-amber-500/30 ring-amber-100 dark:ring-amber-950/40"
                    )}
                  >
                    {hasBusinessProfile ? (
                      <Check className="h-4.5 w-4.5 stroke-[2.5]" />
                    ) : (
                      <AlertTriangle className="h-4.5 w-4.5" />
                    )}

                    {!hasBusinessProfile && (
                      <span className="absolute -inset-1 rounded-full bg-amber-400/35 animate-ping pointer-events-none" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 pt-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-foreground">
                        1. Application & Profile Submitted
                      </h4>
                      {hasBusinessProfile ? (
                        <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 shrink-0">
                          Completed
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-2.5 py-0.5 shrink-0 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Action Required
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                      {hasBusinessProfile
                        ? "Business profile, registration details & contact credentials recorded."
                        : "Enterprise details are missing. Complete your business profile before submitting compliance paperwork."}
                    </p>
                    {!hasBusinessProfile && (
                      <div className="mt-2.5">
                        <Link
                          href="/biz/profile"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 hover:underline"
                        >
                          <Building2 className="h-3 w-3" />
                          <span>Complete Business Profile</span>
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 2: Compliance Documents Uploaded */}
                <div className="relative flex items-start gap-4.5 group">
                  {/* Vertical Track connecting to step 3 */}
                  <div className={cn(
                    "absolute left-[17px] top-11 -bottom-9 w-[2px] rounded-full transition-all duration-500",
                    !hasBusinessProfile
                      ? "bg-muted-foreground/20"
                      : totalUploadedDocsCount >= docTemplates.length
                      ? "bg-emerald-500"
                      : totalUploadedDocsCount > 0
                      ? "bg-gradient-to-b from-emerald-500 to-amber-500"
                      : "bg-muted-foreground/20"
                  )} />

                  <div className={cn(
                    "relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full ring-4 ring-card transition-all duration-300",
                    !hasBusinessProfile
                      ? "bg-muted text-muted-foreground/50 border border-border/70"
                      : totalUploadedDocsCount >= docTemplates.length
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/25"
                      : totalUploadedDocsCount > 0
                      ? "bg-amber-500 text-white shadow-sm shadow-amber-500/30"
                      : "bg-muted text-muted-foreground border border-border"
                  )}>
                    {!hasBusinessProfile ? (
                      <Lock className="h-4 w-4 text-muted-foreground/60" />
                    ) : totalUploadedDocsCount >= docTemplates.length ? (
                      <Check className="h-4.5 w-4.5 stroke-[2.5]" />
                    ) : totalUploadedDocsCount > 0 ? (
                      <FileCheck className="h-4.5 w-4.5" />
                    ) : (
                      <FileText className="h-4.5 w-4.5 text-muted-foreground/70" />
                    )}

                    {/* Animated Pulsing Beacon only when Step 1 is done and currently in active upload progress */}
                    {hasBusinessProfile && totalUploadedDocsCount > 0 && totalUploadedDocsCount < docTemplates.length && (
                      <span className="absolute -inset-1 rounded-full bg-amber-400/30 animate-ping pointer-events-none" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 pt-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-foreground">2. Compliance Documents Uploaded</h4>
                      {!hasBusinessProfile ? (
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold px-2.5 py-0.5 shrink-0 flex items-center gap-1">
                          <Lock className="h-2.5 w-2.5" />
                          Locked
                        </span>
                      ) : totalUploadedDocsCount >= docTemplates.length ? (
                        <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 shrink-0">
                          {totalUploadedDocsCount} of {docTemplates.length} Done
                        </span>
                      ) : totalUploadedDocsCount > 0 ? (
                        <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-2.5 py-0.5 shrink-0 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                          {totalUploadedDocsCount} of {docTemplates.length} Uploaded
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold px-2.5 py-0.5 shrink-0">
                          Pending Upload
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                      {!hasBusinessProfile
                        ? "Locked until Step 1 (Business Profile) is completed."
                        : totalUploadedDocsCount > 0
                        ? `${totalUploadedDocsCount} of ${docTemplates.length} legal paperwork and registration files attached.`
                        : "Upload incorporation certificate, GSTIN, PAN & bank verification papers."}
                    </p>
                  </div>
                </div>

                {/* Step 3: Secretariat & Chapter Admin Review */}
                <div className="relative flex items-start gap-4.5 group">
                  {/* Vertical Track connecting to step 4 */}
                  <div className={cn(
                    "absolute left-[17px] top-11 -bottom-9 w-[2px] rounded-full transition-all duration-500",
                    isVerified
                      ? "bg-emerald-500"
                      : isRejected
                      ? "bg-rose-500"
                      : totalUploadedDocsCount >= docTemplates.length
                      ? "bg-gradient-to-b from-amber-500 via-amber-400 to-slate-300 dark:to-slate-700"
                      : "bg-muted-foreground/20"
                  )} />

                  <div className={cn(
                    "relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full ring-4 ring-card transition-all duration-300",
                    isVerified
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/25"
                      : isRejected
                      ? "bg-rose-600 text-white shadow-sm shadow-rose-600/25"
                      : totalUploadedDocsCount > 0
                      ? "bg-amber-500 text-white shadow-sm shadow-amber-500/30"
                      : "bg-muted text-muted-foreground border border-border"
                  )}>
                    {isVerified ? (
                      <Check className="h-4.5 w-4.5 stroke-[2.5]" />
                    ) : isRejected ? (
                      <XCircle className="h-4.5 w-4.5" />
                    ) : totalUploadedDocsCount > 0 ? (
                      <Clock className="h-4.5 w-4.5 animate-pulse" />
                    ) : (
                      <Clock className="h-4.5 w-4.5 text-muted-foreground/70" />
                    )}

                    {/* Animated Pulsing Beacon only when Step 2 is done and Step 3 is actively under desk review */}
                    {!isVerified && !isRejected && totalUploadedDocsCount >= docTemplates.length && (
                      <span className="absolute -inset-1 rounded-full bg-amber-400/30 animate-ping pointer-events-none" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 pt-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-foreground">3. Secretariat & Admin Review</h4>
                      {isVerified ? (
                        <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 shrink-0">
                          Approved
                        </span>
                      ) : isRejected ? (
                        <span className="rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 text-[10px] font-bold px-2.5 py-0.5 shrink-0">
                          Rejected
                        </span>
                      ) : isChangesRequired ? (
                        <span className="rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 text-[10px] font-bold px-2.5 py-0.5 shrink-0">
                          Re-upload Req.
                        </span>
                      ) : totalUploadedDocsCount > 0 ? (
                        <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-2.5 py-0.5 shrink-0 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Under Review
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold px-2.5 py-0.5 shrink-0">
                          Awaiting Docs
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                      {isVerified
                        ? "Chapter Admin and Secretariat team validated your documents."
                        : isRejected
                        ? "Documentation rejected. Please check notes and replace documents."
                        : totalUploadedDocsCount > 0
                        ? "Chapter Admin & Secretariat reviewing compliance documents."
                        : "Documentation will be vetted once required files are uploaded."}
                    </p>
                  </div>
                </div>

                {/* Step 4: Verified & Live on Directory */}
                <div className="relative flex items-start gap-4.5 group">
                  <div className={cn(
                    "relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full ring-4 ring-card transition-all duration-300",
                    isVerified
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30 ring-emerald-100 dark:ring-emerald-950"
                      : "bg-muted text-muted-foreground border border-border"
                  )}>
                    <ShieldCheck className={cn("h-4.5 w-4.5", isVerified ? "text-white" : "text-muted-foreground/60")} />

                    {/* Continuous Glow Beacon when accredited */}
                    {isVerified && (
                      <span className="absolute -inset-1 rounded-full bg-emerald-400/40 animate-pulse pointer-events-none" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 pt-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-foreground">4. Verified & Live on Directory</h4>
                      {isVerified ? (
                        <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 shrink-0">
                          Active Badge
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold px-2.5 py-0.5 shrink-0">
                          Locked
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                      {isVerified
                        ? "Official green shield badge active on public directory and search."
                        : "Directory accreditation badge unlocks after Secretariat approval."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Embedded Verified Accreditation Seal Card */}
              {isVerified && (
                <div className="mt-3 rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/90 via-emerald-50/40 to-transparent dark:border-emerald-800/60 dark:from-emerald-950/30 dark:to-transparent p-3.5 flex items-start gap-3 shadow-2xs">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 ring-2 ring-emerald-100 dark:ring-emerald-900">
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="text-xs sm:text-sm font-extrabold text-emerald-950 dark:text-emerald-200">
                        Official Chamber Accreditation Confirmed
                      </p>
                      <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
                        VER-HYD-2026
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-emerald-800/90 dark:text-emerald-300 mt-1 leading-relaxed">
                      Your business profile has passed all Chamber compliance checks and is officially visible to accredited buyers on the directory.
                    </p>
                  </div>
                </div>
              )}

              {isChangesRequired && (
                <div className="mt-3 rounded-2xl border border-sky-300 bg-sky-50/90 dark:border-sky-900/50 dark:bg-sky-950/20 p-3.5 flex items-start gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-sky-600 text-white shadow-2xs">
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
                <div className="mt-3 rounded-2xl border border-rose-300 bg-rose-50/90 dark:border-rose-900/50 dark:bg-rose-950/20 p-3.5 flex items-start gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-rose-600 text-white shadow-2xs">
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
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-border/90 transition-all">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/80">
                <div>
                  <h3 className="text-base font-bold text-foreground">Verification Documents (PDF)</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Official certificates, registration papers & identity proof
                  </p>
                </div>

                <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap">
                  {/* Submit Button placed on the left side of the verification status badge */}
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSubmitForVerification}
                    disabled={submittingVerification || uploadingDoc || totalUploadedDocsCount === 0 || !hasBusinessProfile}
                    className={cn(
                      "h-8 px-3 rounded-xl text-xs font-semibold gap-1.5 shadow-2xs transition-all cursor-pointer",
                      isVerified
                        ? "bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 disabled:opacity-50"
                    )}
                    title={
                      !hasBusinessProfile
                        ? "Complete business profile first"
                        : totalUploadedDocsCount === 0
                        ? "Upload documents first"
                        : "Submit documents to Chapter Admin for verification"
                    }
                  >
                    {submittingVerification ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>{isVerified ? "Re-submit" : "Submit for Verification"}</span>
                      </>
                    )}
                  </Button>

                  {isVerified ? (
                    <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold px-2.5 py-1 shrink-0">
                      {verifiedDocsCount || docTemplates.length} of {docTemplates.length} Verified
                    </span>
                  ) : totalUploadedDocsCount > 0 ? (
                    <span className="rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-[11px] font-bold px-2.5 py-1 shrink-0">
                      {totalUploadedDocsCount} of {docTemplates.length} Under Review
                    </span>
                  ) : !hasBusinessProfile ? (
                    <span className="rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-[11px] font-bold px-2.5 py-1 shrink-0 flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Locked · Profile Incomplete
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-[11px] font-bold px-2.5 py-1 shrink-0">
                      0 of {docTemplates.length} Uploaded
                    </span>
                  )}
                </div>
              </div>

              {/* Guidance Callout when Business Profile is not yet completed */}
              {!hasBusinessProfile && (
                <div className="mt-4 rounded-2xl border border-amber-300/80 bg-amber-50/90 dark:border-amber-900/60 dark:bg-amber-950/30 p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                      <AlertTriangle className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-100 flex items-center gap-2">
                        <span>Complete Business Details First</span>
                        <span className="rounded-full bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-[10px] font-bold px-2 py-0.5">
                          Step 1 Required
                        </span>
                      </h4>
                      <p className="text-[11px] sm:text-xs text-amber-800/90 dark:text-amber-300/90 mt-0.5 leading-relaxed">
                        Document uploads are locked because your enterprise profile details are not submitted yet. Complete your business information on Workspace &gt; Profile to unlock uploads.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/biz/profile"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 shadow-xs transition-colors"
                  >
                    <Building2 className="h-3.5 w-3.5" />
                    <span>Complete Profile</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}

              <div className="space-y-2.5 pt-4">
                {docTemplates.map((template) => {
                  const uploaded = findMatchingUploadedDoc(template.type, uploadedDocs);
                  const docUrl = uploaded?.fileUrl || uploaded?.url || uploaded?.path;
                  const docDate = uploaded?.uploadedAt
                    ? new Date(uploaded.uploadedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                    : null;
                  const isUploaded = Boolean(docUrl);
                  const isDocVerified = isUploaded && (uploaded?.status === "verified" || uploaded?.status === "approved" || (isVerified && uploaded?.status !== "rejected" && uploaded?.status !== "pending"));
                  const isDocRejected = isUploaded && uploaded?.status === "rejected";

                  return (
                    <div
                      key={template.type}
                      className={cn(
                        "flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl border transition-all",
                        !hasBusinessProfile && !isUploaded
                          ? "border-border/60 bg-muted/20 opacity-75"
                          : "border-border/70 bg-card hover:bg-muted/30 hover:border-border hover:shadow-2xs"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={cn(
                          "grid h-9 w-9 shrink-0 place-items-center rounded-xl border shadow-2xs",
                          isDocVerified
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-900/40"
                            : isUploaded
                            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-900/40"
                            : "bg-muted text-muted-foreground border-border/70"
                        )}>
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-semibold text-foreground truncate" title={template.name}>
                            {template.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {isUploaded ? `Uploaded (${docDate || "Recently"})` : "Not uploaded yet"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap justify-end">
                        {isDocVerified ? (
                          <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold px-2.5 py-0.5">
                            Verified
                          </span>
                        ) : isDocRejected ? (
                          <span className="rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[11px] font-semibold px-2.5 py-0.5">
                            Needs Re-upload
                          </span>
                        ) : isUploaded ? (
                          <span className="rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-[11px] font-semibold px-2.5 py-0.5">
                            Under Review
                          </span>
                        ) : !hasBusinessProfile ? (
                          <span className="rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[11px] font-medium px-2 py-0.5 flex items-center gap-1">
                            <Lock className="h-2.5 w-2.5" />
                            <span>Locked</span>
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[11px] font-semibold px-2.5 py-0.5">
                            Pending
                          </span>
                        )}

                        {isUploaded && (
                          <button
                            type="button"
                            onClick={() => handlePreviewDocument(template, uploaded)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-950/40"
                            title="Preview uploaded document"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Preview</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (!hasBusinessProfile) {
                              toast.warning("Complete Business Profile First", {
                                description: "Please fill in and save your business details under Workspace > Profile before uploading compliance documents.",
                              });
                              return;
                            }
                            handleReplaceClick(template.type);
                          }}
                          disabled={!hasBusinessProfile || uploadingDoc || deletingType === template.type}
                          className={cn(
                            "inline-flex items-center gap-1.5 text-xs font-medium rounded-xl px-2.5 py-1.5 shadow-2xs transition-all",
                            !hasBusinessProfile
                              ? "bg-muted/60 text-muted-foreground/50 border border-border/50 cursor-not-allowed opacity-50"
                              : "text-foreground bg-card border border-border hover:bg-muted cursor-pointer hover:border-foreground/20 disabled:opacity-50"
                          )}
                          title={
                            !hasBusinessProfile
                              ? "Complete your business profile on Workspace > Profile first to unlock file upload"
                              : isUploaded
                              ? "Replace uploaded document"
                              : "Upload document"
                          }
                        >
                          {uploadingDoc && replacingType === template.type ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                          ) : !hasBusinessProfile ? (
                            <Lock className="h-3.5 w-3.5 text-muted-foreground/60" />
                          ) : (
                            <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                          <span>{isUploaded ? "Replace" : "Upload"}</span>
                        </button>

                        {isUploaded && !isDocVerified && (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmDoc({ template, uploaded })}
                            disabled={!hasBusinessProfile || uploadingDoc || deletingType === template.type}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-card border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300 rounded-xl px-2.5 py-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                            title={`Delete ${template.name}`}
                          >
                            {deletingType === template.type ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Row 3 (Sabse Niche): Full Payment History */}
        <div id="payment-history" className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
            <div>
              <h3 className="text-lg font-bold text-foreground">Payment History & Billing Invoices</h3>
              <p className="text-xs text-muted-foreground mt-0.5">All your verified chamber membership payments, receipts and GST tax invoices</p>
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

          {/* Financial Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="h-3 w-3 text-emerald-500" /> Total Invoiced
              </span>
              <p className="text-base sm:text-lg font-extrabold text-foreground mt-1">₹ 12,999</p>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                <Check className="h-3 w-3" /> Fully settled
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="h-3 w-3 text-sky-500" /> Active Receipts
              </span>
              <p className="text-base sm:text-lg font-extrabold text-foreground mt-1">{payments.length} Tax Invoice</p>
              <span className="text-[10px] text-muted-foreground">GST compliance valid</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-amber-500" /> Next Due Date
              </span>
              <p className="text-base sm:text-lg font-extrabold text-foreground mt-1">{formattedRenews}</p>
              <span className="text-[10px] text-muted-foreground">Annual renewal</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3 text-primary" /> Payment Method
              </span>
              <p className="text-base sm:text-lg font-extrabold text-foreground mt-1">UPI / Net Banking</p>
              <span className="text-[10px] text-emerald-600 font-semibold">100% Secure SSL</span>
            </div>
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

            <div className={cn(
              "p-3 rounded-xl border",
              isVerified
                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200"
                : isRejected
                ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-200"
                : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200"
            )}>
              <span className="font-bold block mb-1">
                Status: {isVerified ? "Officially Verified & Accredited" : isRejected ? "Verification Rejected" : "Under Review by Secretariat"}
              </span>
              <p className={cn(
                "text-[11px] leading-relaxed",
                isVerified ? "text-emerald-800 dark:text-emerald-300" : isRejected ? "text-rose-800 dark:text-rose-300" : "text-amber-800 dark:text-amber-300"
              )}>
                {isVerified
                  ? "All compliance and identification documents have been verified against statutory government registries (GST, MCA, CBDT)."
                  : isRejected
                  ? (business?.verificationReviewReason || "Submitted documents did not meet verification criteria.")
                  : `${totalUploadedDocsCount} documents submitted. Secretariat desk is currently reviewing compliance certificates.`}
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

      {/* Hidden File Input for Replace Document */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
        onChange={handleFileUpload}
      />

      {/* Document Preview Modal */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="max-w-4xl h-[88vh] flex flex-col p-0 overflow-hidden bg-background">
          <DialogHeader className="p-4 border-b bg-muted/20 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40 shadow-2xs">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base font-bold text-foreground truncate">
                  {previewDoc?.name || "Document Preview"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground truncate">
                  Official Chamber Compliance Record · Uploaded {previewDoc?.docDate || "on file"}
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {previewDoc?.fileUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(resolveMediaUrl(previewDoc.fileUrl), "_blank")}
                  className="h-8 text-xs font-semibold gap-1.5 cursor-pointer shadow-2xs"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Open in new tab</span>
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden p-2 sm:p-3 bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center relative">
            {previewDoc?.fileUrl ? (
              (previewDoc.fileUrl.toLowerCase().includes(".pdf") || previewDoc.name?.toLowerCase().endsWith(".pdf")) ? (
                <div className="w-full h-full flex flex-col relative">
                  <iframe
                    src={resolveMediaUrl(previewDoc.fileUrl)}
                    title={previewDoc.name || "PDF Document"}
                    className="w-full h-full flex-1 border rounded-xl bg-white shadow-xs"
                  />
                  <div className="absolute top-3 right-3 hidden sm:flex gap-2">
                    <button
                      type="button"
                      onClick={() => window.open(resolveMediaUrl(previewDoc.fileUrl), "_blank")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/95 dark:bg-slate-900/95 hover:bg-white border shadow-md text-foreground backdrop-blur transition-all cursor-pointer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Fullscreen ↗</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <img
                    src={resolveMediaUrl(previewDoc.fileUrl)}
                    alt={previewDoc.name || "Document scan"}
                    className="max-w-full max-h-full object-contain rounded-xl shadow-md bg-white border"
                  />
                </div>
              )
            ) : (
              <div className="text-center p-6 bg-card rounded-2xl border max-w-md shadow-xs">
                <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
                <h4 className="font-bold text-sm text-foreground">Document File Not Available</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  No digital file has been uploaded for this document yet. You can attach a PDF or image scan by clicking Replace.
                </p>
                <Button
                  size="sm"
                  disabled={!hasBusinessProfile}
                  onClick={() => {
                    if (!hasBusinessProfile) {
                      toast.warning("Complete Business Profile First", {
                        description: "Please fill in and save your business details under Workspace > Profile before uploading compliance documents.",
                      });
                      return;
                    }
                    const typeToReplace = previewDoc?.type;
                    setPreviewDoc(null);
                    if (typeToReplace) handleReplaceClick(typeToReplace);
                  }}
                  className="mt-3 text-xs font-semibold gap-1.5 disabled:opacity-50"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload Document Now</span>
                </Button>
              </div>
            )}
          </div>

          <div className="p-3 sm:p-4 border-t bg-background flex flex-col sm:flex-row items-center justify-between gap-3">
            {previewDoc?.fileUrl ? (
              <div className="flex items-center gap-3">
                <a
                  href={resolveMediaUrl(previewDoc.fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Open in new tab ↗
                </a>
                <span className="text-muted-foreground text-xs">•</span>
                <a
                  href={resolveMediaUrl(previewDoc.fileUrl)}
                  download={previewDoc.name || "document.pdf"}
                  className="text-xs font-semibold text-muted-foreground hover:underline inline-flex items-center gap-1"
                >
                  <Download className="h-3.5 w-3.5" /> Download PDF
                </a>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">Compliance Verification Record</span>
            )}

            <div className="flex items-center gap-2 flex-wrap justify-end">
              {!isVerified && previewDoc?.type && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!hasBusinessProfile}
                    onClick={() => {
                      if (!hasBusinessProfile) {
                        toast.warning("Complete Business Profile First", {
                          description: "Please fill in and save your business details under Workspace > Profile before uploading compliance documents.",
                        });
                        return;
                      }
                      const tType = previewDoc.type;
                      setPreviewDoc(null);
                      handleReplaceClick(tType);
                    }}
                    className="gap-1.5 text-xs font-semibold rounded-xl disabled:opacity-50"
                  >
                    <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Replace</span>
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      const targetTemplate = docTemplates.find((t) => isMatchingDoc(t.type, previewDoc.type)) || {
                        type: previewDoc.type,
                        name: previewDoc.name,
                      };
                      setDeleteConfirmDoc({
                        template: targetTemplate,
                        uploaded: { name: previewDoc.name, fileUrl: previewDoc.fileUrl },
                      });
                    }}
                    className="gap-1.5 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={() => setPreviewDoc(null)} className="rounded-xl text-xs font-semibold">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Document Confirmation Dialog */}
      <Dialog open={!!deleteConfirmDoc} onOpenChange={(open) => !open && setDeleteConfirmDoc(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mb-2 border border-rose-200 dark:border-rose-900/50">
              <Trash2 className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-lg font-bold text-foreground">
              Delete Uploaded Document?
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground">
              Are you sure you want to delete <span className="font-semibold text-foreground font-sans">"{deleteConfirmDoc?.template?.name || "this document"}"</span>?
              <br />
              This slot will revert to <span className="font-semibold text-amber-600 dark:text-amber-400">Pending</span> so you can upload the correct file.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-2xl border border-border bg-muted/40 p-3.5 flex items-center gap-3 mt-1">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate">
                {deleteConfirmDoc?.uploaded?.name || deleteConfirmDoc?.template?.name}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Status: Under Review · Will be removed from compliance submission
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmDoc(null)}
              disabled={deletingType !== null}
              className="rounded-xl text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                if (deleteConfirmDoc?.template?.type) {
                  handleDeleteDocument(
                    deleteConfirmDoc.template.type,
                    deleteConfirmDoc.template.name,
                    deleteConfirmDoc.uploaded
                  );
                }
              }}
              disabled={deletingType !== null}
              className="rounded-xl text-xs font-semibold gap-1.5 bg-rose-600 hover:bg-rose-700 text-white"
            >
              {deletingType ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              <span>Yes, Delete Document</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Explore All Plans / Upgrade Modal */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent className="w-[96vw] sm:max-w-5xl xl:max-w-6xl max-h-[92vh] overflow-y-auto no-scrollbar rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-border bg-card shadow-2xl">
          <ChamberMembershipTiers
            currentTier={currentTier}
            plansData={plansData}
            currency="INR"
            showHeader={true}
          />
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

      {/* ── Chapter Selection Modal ── */}
      <Dialog open={chapterModalOpen} onOpenChange={setChapterModalOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-rose-500" />
              <span>Select Chamber Chapter</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Your chapter determines your regional networking events, local leadership desk, and member community.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-2 max-h-[340px] overflow-y-auto no-scrollbar">
            {chaptersList.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                Loading official chamber chapters...
              </div>
            ) : (
              chaptersList.map((ch) => {
                const isCurrent = (ch.name || "").toLowerCase() === chapterName.toLowerCase();
                return (
                  <button
                    key={ch._id || ch.name}
                    type="button"
                    disabled={assigningChapter}
                    onClick={() => handleAssignChapter(ch)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-2xl border text-left cursor-pointer transition-all",
                      isCurrent
                        ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-2xs font-bold"
                        : "border-border bg-card hover:bg-muted/50 hover:border-border/90"
                    )}
                  >
                    <div className="min-w-0 flex items-center gap-3">
                      <div className={cn(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-bold",
                        isCurrent
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}>
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-foreground truncate">{ch.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {[ch.city, ch.state].filter(Boolean).join(", ") || "Chamber Region"}
                        </p>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="rounded-full bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 shrink-0 ml-2">
                        Active
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setChapterModalOpen(false)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export { BizMembership };
export default BizMembership;
