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
import { verificationApi } from "@shared/lib/api-services";
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
  const { data: business, refetch: refetchBiz } = useMyBusiness();
  const { data: membershipData } = useMyMembership();
  const { data: plansData } = useMembershipPlans();
  const { data: paymentsData } = useMyPayments();

  const [verificationData, setVerificationData] = useState(null);
  const [loadingVerification, setLoadingVerification] = useState(false);
  const [replacingType, setReplacingType] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [autoRenew, setAutoRenew] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
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
      setVerificationData(verif && typeof verif === "object" && verif.documents ? verif : null);
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
    setReplacingType(templateType);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !replacingType) return;

    if (!business?._id) {
      toast.error("Business information is missing. Please refresh the page.");
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
  const daysProgress = Math.max(10, Math.min(100, Math.round(((365 - Math.min(365, daysRemaining)) / 365) * 100)));
  const isExpiringSoon = !isExpired && currentTier !== "free" && (membershipData?.isExpiringSoon || (daysRemaining <= 15 && daysRemaining > 0));

  // Verification status logic & uploaded documents
  const uploadedDocs = useMemo(() => {
    if (Array.isArray(verificationData?.documents) && verificationData.documents.length > 0) {
      return verificationData.documents;
    }
    if (Array.isArray(business?.documents) && business.documents.length > 0) {
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
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold px-2.5 py-0.5">
                <Crown className="h-3 w-3" />
                <span>{currentPlan.name}</span>
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Manage your chamber plan, compliance audit, accredited perks and payment records.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card/80 px-3.5 py-2 text-xs font-semibold text-foreground shadow-2xs">
              <CalendarDays className="h-3.5 w-3.5 text-primary" />
              <span>Member since <strong className="font-bold">{formattedStarted}</strong></span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>{isExpired ? "Expired Plan" : "Active Accredited Member"}</span>
            </div>
          </div>
        </div>

        {/* Hero Plan Overview Banner (Executive VIP Luxury Styling) */}
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
                  <span className="rounded-full bg-amber-100/80 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700 px-3 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-200 flex items-center gap-1 shadow-2xs">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    <span>VIP Member Access</span>
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  {currentPlan.summary}
                </p>

                {/* Days Remaining Progress Bar */}
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
              </div>
            </div>

            {/* Right Meta Chips & Actions */}
            <div className="flex flex-col sm:flex-row xl:flex-col justify-between items-start xl:items-end gap-4 pt-4 xl:pt-0 border-t xl:border-t-0 border-border/70 shrink-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full xl:w-auto">
                <div className="p-3 rounded-2xl bg-background/80 dark:bg-card/80 border border-border/70 shadow-2xs min-w-[130px]">
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-primary" /> Valid Until
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-foreground mt-1 block truncate">{formattedRenews}</span>
                </div>

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

                <div className="p-3 rounded-2xl bg-background/80 dark:bg-card/80 border border-border/70 shadow-2xs min-w-[130px] col-span-2 sm:col-span-1">
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-rose-500" /> Chapter
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-foreground mt-1 block truncate">{chapterName}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full xl:w-auto">
                <Button
                  type="button"
                  onClick={() => setUpgradeDialogOpen(true)}
                  className="flex-1 xl:flex-none gap-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-sm shadow-amber-500/20"
                >
                  <Crown className="h-3.5 w-3.5" />
                  <span>Upgrade / Change Plan</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

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
            <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold px-1.5 py-0.2">
              Verified ✓
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
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                </div>
                <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[11px] font-bold px-2.5 py-0.5">
                  {isExpired ? "Expired" : "Active"}
                </span>
              </div>

              <div className="space-y-2.5 pt-4 text-xs sm:text-sm">
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
                  <span className="text-muted-foreground font-medium flex items-center gap-2">
                    <Crown className="h-3.5 w-3.5 text-amber-500" /> Current Plan
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-foreground">{currentPlan.name}</span>
                    <span className="rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-700 dark:text-amber-300 text-[10px] font-semibold px-2 py-0.2">
                      ⭐ {currentPlan.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
                  <span className="text-muted-foreground font-medium flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-sky-500" /> Started On
                  </span>
                  <span className="font-bold text-foreground">{formattedStarted}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
                  <span className="text-muted-foreground font-medium flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-emerald-500" /> Valid Until
                  </span>
                  <span className="font-bold text-foreground">{formattedRenews}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
                  <span className="text-muted-foreground font-medium flex items-center gap-2">
                    <Wallet className="h-3.5 w-3.5 text-violet-500" /> Billing Cycle
                  </span>
                  <span className="font-bold text-foreground">Annual Subscription</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
                  <div className="min-w-0">
                    <span className="text-muted-foreground font-medium flex items-center gap-2">
                      <RotateCcw className="h-3.5 w-3.5 text-primary" /> Auto-Renewal
                    </span>
                    <span className="text-[10px] text-muted-foreground block pl-5.5">
                      {autoRenew ? "Renews automatically" : "Manual renewal required"}
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

                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
                  <span className="text-muted-foreground font-medium flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-rose-500" /> Chamber Chapter
                  </span>
                  <span className="font-bold text-foreground truncate max-w-[140px] text-right">{chapterName}</span>
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
                          Upgrade or Change Plan
                        </p>
                        <span className="rounded-full bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 text-[9px] font-extrabold px-1.5 py-0.2">
                          Tier
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">Explore higher membership benefits</p>
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

                <button
                  type="button"
                  onClick={() => handleDownloadCertificate(business, membershipData)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-border bg-card hover:bg-muted/50 hover:shadow-md hover:-translate-y-0.5 transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                      <FileCheck className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          Download Membership Certificate
                        </p>
                        <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[9px] font-extrabold px-1.5 py-0.2">
                          PDF
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">Official Chamber membership certificate</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all shrink-0 ml-2" />
                </button>
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
                <span className="rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 text-amber-700 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5">
                  {currentPlan.name} VIP
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
        <div id="verification" className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch pt-2">
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
                  <div className="absolute left-[17px] top-11 -bottom-9 w-[2px] bg-emerald-500 rounded-full" />
                  
                  <div className="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-600 text-white shadow-sm shadow-emerald-600/25 ring-4 ring-card transition-transform group-hover:scale-105">
                    <Check className="h-4.5 w-4.5 stroke-[2.5]" />
                  </div>

                  <div className="min-w-0 flex-1 pt-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-foreground">1. Application & Profile Submitted</h4>
                      <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 shrink-0">
                        Completed
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                      Business profile, registration details & contact credentials recorded.
                    </p>
                  </div>
                </div>

                {/* Step 2: Compliance Documents Uploaded */}
                <div className="relative flex items-start gap-4.5 group">
                  {/* Vertical Track connecting to step 3 */}
                  <div className={cn(
                    "absolute left-[17px] top-11 -bottom-9 w-[2px] rounded-full transition-all duration-500",
                    totalUploadedDocsCount >= docTemplates.length
                      ? "bg-emerald-500"
                      : totalUploadedDocsCount > 0
                      ? "bg-gradient-to-b from-emerald-500 to-amber-500"
                      : "bg-muted-foreground/20"
                  )} />

                  <div className={cn(
                    "relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full ring-4 ring-card transition-all duration-300",
                    totalUploadedDocsCount >= docTemplates.length
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/25"
                      : totalUploadedDocsCount > 0
                      ? "bg-amber-500 text-white shadow-sm shadow-amber-500/30"
                      : "bg-muted text-muted-foreground border border-border"
                  )}>
                    {totalUploadedDocsCount >= docTemplates.length ? (
                      <Check className="h-4.5 w-4.5 stroke-[2.5]" />
                    ) : totalUploadedDocsCount > 0 ? (
                      <FileCheck className="h-4.5 w-4.5" />
                    ) : (
                      <FileText className="h-4.5 w-4.5 text-muted-foreground/70" />
                    )}

                    {/* Animated Pulsing Beacon only when currently in active upload progress */}
                    {totalUploadedDocsCount > 0 && totalUploadedDocsCount < docTemplates.length && (
                      <span className="absolute -inset-1 rounded-full bg-amber-400/30 animate-ping pointer-events-none" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 pt-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-foreground">2. Compliance Documents Uploaded</h4>
                      {totalUploadedDocsCount >= docTemplates.length ? (
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
                      {totalUploadedDocsCount > 0
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
              <div className="flex items-center justify-between pb-4 border-b border-border/80">
                <div>
                  <h3 className="text-base font-bold text-foreground">Verification Documents (PDF)</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Official certificates, registration papers & identity proof
                  </p>
                </div>
                {isVerified ? (
                  <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 shrink-0">
                    {verifiedDocsCount || docTemplates.length} of {docTemplates.length} Verified
                  </span>
                ) : totalUploadedDocsCount > 0 ? (
                  <span className="rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-[11px] font-bold px-2.5 py-0.5 shrink-0">
                    {totalUploadedDocsCount} of {docTemplates.length} Under Review
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-[11px] font-bold px-2.5 py-0.5 shrink-0">
                    0 of {docTemplates.length} Uploaded
                  </span>
                )}
              </div>

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
                      className="flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl border border-border/70 bg-card hover:bg-muted/30 hover:border-border hover:shadow-2xs transition-all"
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

                      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
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
                          onClick={() => handleReplaceClick(template.type)}
                          disabled={uploadingDoc}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground bg-card border border-border hover:bg-muted rounded-xl px-2.5 py-1.5 shadow-2xs transition-all cursor-pointer hover:border-foreground/20 disabled:opacity-50"
                        >
                          {uploadingDoc && replacingType === template.type ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                          ) : (
                            <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                          <span>{isUploaded ? "Replace" : "Upload"}</span>
                        </button>
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
                  onClick={() => {
                    const typeToReplace = previewDoc?.type;
                    setPreviewDoc(null);
                    if (typeToReplace) handleReplaceClick(typeToReplace);
                  }}
                  className="mt-3 text-xs font-semibold gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload Document Now</span>
                </Button>
              </div>
            )}
          </div>

          <div className="p-3 sm:p-4 border-t bg-background flex items-center justify-between gap-3">
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

            <Button variant="outline" size="sm" onClick={() => setPreviewDoc(null)}>
              Close
            </Button>
          </div>
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
