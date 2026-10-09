"use client";
import {
  Download,
  Wallet,
  MoreHorizontal,
  Eye,
  CheckCircle2,
  CreditCard,
  Clock,
  Ticket,
  Banknote,
  Plus,
  FileText,
  Printer,
  Sparkles,
  Building2,
  User,
  Search,
  Receipt,
  ArrowUpRight,
  Loader2,
  Percent,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect, useMemo, useRef } from "react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Textarea } from "@shared/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@shared/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import { useAllPayments, useBusinesses } from "@shared/hooks/use-rifah-api";
import { useAuth } from "@shared/providers/auth-provider";
import { paymentApi } from "@shared/lib/api-services";
import {
  generateInvoiceHtml,
  downloadInvoicePdf,
  openAndPrintInvoice,
} from "@shared/lib/invoice-generator";

const tone = (s) =>
  s === "completed" || s === "Paid"
    ? "success"
    : s === "pending" || s === "Pending"
      ? "warning"
      : "danger";

const INVOICE_PRESETS = [
  {
    name: "Membership Accreditation",
    purpose: "Annual Chamber Membership Accreditation",
    sacCode: "9983",
    subtotal: 5000,
    notes: "Full chamber access, official directory listing, networking desk & credentials.",
  },
  {
    name: "Event Sponsorship",
    purpose: "Chamber Business Conclave Sponsorship",
    sacCode: "9985",
    subtotal: 25000,
    notes: "Prime stage branding, keynote acknowledgement, digital media spotlight and VIP delegate passes.",
  },
  {
    name: "Exhibition Stall",
    purpose: "RIFAH Expo Commercial Stall Booking",
    sacCode: "9985",
    subtotal: 15000,
    notes: "Equipped exhibition stall, facia board, electrical fittings, and official exhibitor credentials.",
  },
  {
    name: "Strategic Consulting",
    purpose: "Business Consulting & Growth Advisory",
    sacCode: "9983",
    subtotal: 10000,
    notes: "Specialized enterprise diagnostic session, strategic growth roadmap and chamber mentorship.",
  },
  {
    name: "Media & Promotion",
    purpose: "Chamber Portal & Newsletter Spotlight",
    sacCode: "9983",
    subtotal: 7500,
    notes: "Featured enterprise showcase in monthly newsletter, portal banner, and social media blast.",
  },
  {
    name: "Custom Deliverable",
    purpose: "",
    sacCode: "9983",
    subtotal: "",
    notes: "",
  },
];

const INITIAL_INVOICE_FORM = {
  recipientType: "existing", // "existing" or "custom"
  businessId: "",
  payerName: "",
  payerEmail: "",
  payerPhone: "",
  businessName: "",
  gstin: "",
  chapter: "Central",
  state: "Maharashtra",
  categoryPreset: "Membership Accreditation",
  purpose: "Annual Chamber Membership Accreditation",
  sacCode: "9983",
  notes: "Full chamber access, official directory listing, networking desk & credentials.",
  quantity: 1,
  currency: "INR",
  subtotal: 5000,
  gstRate: 18,
  amount: 5900,
  status: "Paid",
  method: "Bank Transfer",
  transactionId: "",
  invoiceNumber: "", // blank for auto-generate
  paidAt: new Date().toISOString().split("T")[0],
};

export function AdminPayments({ expectedRole = "admin" }) {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Central Admin Access Guard
  const isCentralAdmin =
    mounted &&
    expectedRole !== "chapter_admin" &&
    ["central_admin", "super_admin", "admin", "secretariat"].includes(user?.role) &&
    (!user?.activeWorkspace ||
      user.activeWorkspace.panelType === "central-admin" ||
      user.activeWorkspace.workspaceId === "admin");

  const { data: paymentsData, refetch, isLoading, error } = useAllPayments();

  let payments = [];
  if (Array.isArray(paymentsData)) {
    payments = paymentsData;
  } else if (paymentsData && typeof paymentsData === "object") {
    payments = Array.isArray(paymentsData.payments)
      ? paymentsData.payments
      : Array.isArray(paymentsData.data)
        ? paymentsData.data
        : [];
  }

  // Fetch businesses for Central Admin member selector
  const { data: businessesData } = useBusinesses(
    { limit: 200, status: "Active" },
    { enabled: Boolean(isCentralAdmin) }
  );

  const businesses = useMemo(() => {
    if (Array.isArray(businessesData)) return businessesData;
    if (businessesData?.businesses && Array.isArray(businessesData.businesses))
      return businessesData.businesses;
    if (businessesData?.data && Array.isArray(businessesData.data))
      return businessesData.data;
    return [];
  }, [businessesData]);

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  // Create Invoice Modal State
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bizSearchTerm, setBizSearchTerm] = useState("");
  const [invoiceForm, setInvoiceForm] = useState(INITIAL_INVOICE_FORM);

  // Invoice Preview Modal State
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const previewIframeRef = useRef(null);

  const filteredPayments = payments.filter((p) => {
    if (filter === "revenue")
      return (p.status === "completed" || p.status === "Paid") && Number(p.amount || 0) > 0;
    if (filter === "completed") return p.status === "completed" || p.status === "Paid";
    if (filter === "pending") return p.status === "pending" || p.status === "Pending";
    if (filter === "events") return p.itemType === "Event Pass";
    if (filter === "cash") return p.method === "CASH" && p.itemType === "Membership";
    if (filter === "custom") return Boolean(p.isCustomInvoice);
    return true;
  });

  // Calculate live taxes for Create Invoice form
  const handleSubtotalChange = (val) => {
    const num = Number(val) || 0;
    const rate = Number(invoiceForm.gstRate) || 0;
    const gstAmt = Math.round(num * (rate / 100) * 100) / 100;
    const total = Math.round((num + gstAmt) * 100) / 100;
    setInvoiceForm((prev) => ({
      ...prev,
      subtotal: val,
      amount: total,
    }));
  };

  const handleGstRateChange = (rateVal) => {
    const rate = Number(rateVal) || 0;
    const num = Number(invoiceForm.subtotal) || 0;
    const gstAmt = Math.round(num * (rate / 100) * 100) / 100;
    const total = Math.round((num + gstAmt) * 100) / 100;
    setInvoiceForm((prev) => ({
      ...prev,
      gstRate: rateVal,
      amount: total,
    }));
  };

  const handleTotalAmountChange = (totalVal) => {
    const total = Number(totalVal) || 0;
    const rate = Number(invoiceForm.gstRate) || 0;
    let sub = total;
    if (rate > 0) {
      sub = Math.round((total / (1 + rate / 100)) * 100) / 100;
    }
    setInvoiceForm((prev) => ({
      ...prev,
      amount: totalVal,
      subtotal: sub,
    }));
  };

  const applyPreset = (preset) => {
    const rate = Number(invoiceForm.gstRate) || 18;
    const sub = preset.subtotal !== "" ? Number(preset.subtotal) : Number(invoiceForm.subtotal) || 0;
    const gstAmt = Math.round(sub * (rate / 100) * 100) / 100;
    setInvoiceForm((prev) => ({
      ...prev,
      categoryPreset: preset.name,
      purpose: preset.purpose || prev.purpose,
      sacCode: preset.sacCode || prev.sacCode,
      notes: preset.notes || prev.notes,
      subtotal: preset.subtotal !== "" ? preset.subtotal : prev.subtotal,
      amount: preset.subtotal !== "" ? Math.round((sub + gstAmt) * 100) / 100 : prev.amount,
    }));
  };

  const handleSelectBusiness = (bId) => {
    const biz = businesses.find((b) => b._id === bId);
    if (!biz) return;
    setInvoiceForm((prev) => ({
      ...prev,
      businessId: biz._id,
      businessName: biz.name || "",
      payerName: biz.contactPerson || biz.owner?.name || biz.name || "",
      payerEmail: biz.email || biz.owner?.email || "",
      payerPhone: biz.phone || biz.owner?.phone || "",
      gstin: biz.gstin || "",
      chapter: biz.chapter || "Central",
      state: biz.state || "Maharashtra",
    }));
  };

  const handleSubmitInvoice = async (e) => {
    e?.preventDefault?.();
    const pName = invoiceForm.payerName.trim();
    const bName = invoiceForm.businessName.trim();

    if (!pName && !bName) {
      toast.error("Please specify a Recipient Name or Enterprise Name");
      return;
    }
    if (!invoiceForm.purpose.trim()) {
      toast.error("Please specify the purpose or deliverable of the invoice");
      return;
    }
    if (!invoiceForm.amount || Number(invoiceForm.amount) <= 0) {
      toast.error("Please provide a valid invoice amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...invoiceForm,
        payerName: pName || bName,
        businessName: bName,
        purpose: invoiceForm.purpose.trim(),
        description: invoiceForm.purpose.trim(),
        subtotal: Number(invoiceForm.subtotal) || 0,
        amount: Number(invoiceForm.amount) || 0,
        gstRate: Number(invoiceForm.gstRate) || 0,
        quantity: Number(invoiceForm.quantity) || 1,
        invoiceNumber: invoiceForm.invoiceNumber ? invoiceForm.invoiceNumber.trim() : undefined,
      };

      const res = await paymentApi.createAdminInvoice(payload);
      const createdPayment = res?.data || res?.payment || res;

      toast.success(
        `Invoice #${createdPayment.invoiceNumber || "Created"} issued successfully!`
      );
      setIsCreateInvoiceOpen(false);
      setInvoiceForm(INITIAL_INVOICE_FORM);
      refetch();

      // Automatically open the themed invoice preview so Central Admin can view or print immediately
      setPreviewInvoice(createdPayment);
      setIsPreviewOpen(true);
    } catch (err) {
      toast.error(err.message || "Failed to create invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadReceipt = async (r) => {
    if (!r) return;
    const isUsd = (r.currency || "").toUpperCase() === "USD";
    const currSymbol = isUsd ? "$" : "Rs.";
    const formattedAmount = `${currSymbol} ${Number(r.amount || 0).toLocaleString(isUsd ? "en-US" : "en-IN")}${isUsd ? " USD" : ""}`;

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pw = doc.internal.pageSize.getWidth();
      const mx = 20;
      const cw = pw - mx * 2;

      for (let i = 0; i < cw; i++) {
        const t = i / cw;
        const red = Math.round(16 + (2 - 16) * t);
        const green = Math.round(185 + (132 - 185) * t);
        const blue = Math.round(129 + (199 - 129) * t);
        doc.setFillColor(red, green, blue);
        doc.rect(mx + i, 18, 1.2, 3, "F");
      }

      let y = 28;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(11, 25, 44);
      doc.text("RIFAH Chamber of Commerce", mx, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("CENTRAL ADMIN PAYMENT RECEIPT & OFFICIAL VOUCHER", mx, y + 6);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(2, 132, 199);
      doc.text(`INVOICE #${r.invoiceNumber || "N/A"}`, pw - mx, y, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Date: ${new Date(r.paidAt || r.createdAt || Date.now()).toLocaleDateString()}`,
        pw - mx,
        y + 6,
        { align: "right" }
      );

      y += 12;
      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.5);
      doc.line(mx, y, pw - mx, y);

      y += 8;

      let rawPlan = r.planTier || r.membershipTier || r.business?.membership || r.membership || "";
      if (rawPlan) {
        const clean = rawPlan.replace(/\bplan\b/gi, "").trim();
        rawPlan = clean ? `${clean} Plan` : rawPlan;
      }

      let subItemText = "";
      if (r.itemType === "Event Pass" && r.eventId) {
        subItemText = `Event: ${r.eventId.title || "Pass"}`;
      } else {
        const baseDesc = r.description || r.purpose || "Chamber Service Invoice";
        if (rawPlan && !baseDesc.toLowerCase().includes(rawPlan.toLowerCase())) {
          subItemText = `${baseDesc} (${rawPlan})`;
        } else {
          subItemText = baseDesc;
        }
      }

      const chName = (r.collectingChapter || r.chapter || r.business?.chapter || r.payer?.chapter || "").trim();
      const stName = (r.collectingState || r.state || r.business?.state || r.payer?.state || "").trim();
      let chapterStateLocation = "RIFAH Central / All Chapters";
      if (chName && stName && chName.toLowerCase() !== "unassigned") {
        chapterStateLocation = `${chName}, ${stName}`;
      } else if (chName && chName.toLowerCase() !== "unassigned") {
        chapterStateLocation = chName;
      } else if (stName) {
        chapterStateLocation = stName;
      }

      const rows = [
        ["Payer Member / Client", r.payerName || r.payer?.name || r.user?.name || "Direct Client"],
        ["Business / Enterprise", r.businessName || r.business?.name || "N/A"],
        ["Contact Email", r.payerEmail || r.payer?.email || "N/A"],
        ["Subscription / Purpose", subItemText],
        ["Chapter / State", chapterStateLocation],
        ["Payment Method", r.method || "Bank Transfer"],
        ["Currency", r.currency || "INR"],
        ["Transaction ID", r.transactionId || "N/A"],
        ["Audit Status", (r.status || "Paid").toUpperCase()],
      ];

      const labelW = cw * 0.35;
      const rowH = 10;

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(mx, y - 2, cw, rows.length * rowH + 4, 2, 2, "S");

      rows.forEach(([label, value], i) => {
        const ry = y + i * rowH;

        doc.setFillColor(248, 250, 252);
        doc.rect(mx, ry - 2, labelW, rowH, "F");

        if (i > 0) {
          doc.setDrawColor(241, 245, 249);
          doc.setLineWidth(0.2);
          doc.line(mx, ry, pw - mx, ry);
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(label, mx + 5, ry + 6.5);

        if (label === "Audit Status") {
          const badgeText = `  ${value}  `;
          doc.setFillColor(220, 252, 231);
          doc.setTextColor(22, 101, 52);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          const tw = doc.getTextWidth(badgeText);
          doc.roundedRect(mx + labelW + 5, ry + 2.5, tw + 4, 5.5, 2, 2, "F");
          doc.text(badgeText, mx + labelW + 7, ry + 6.5);
        } else {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(value && String(value).length > 36 ? 8.5 : 9.5);
          doc.setTextColor(30, 41, 59);
          doc.text(String(value || "").slice(0, 60), mx + labelW + 5, ry + 6.5);
        }
      });

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

      y += 26;
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.2);
      doc.line(mx, y, pw - mx, y);

      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        "This is a verified computer-generated payment receipt issued by RIFAH Central Admin.",
        pw / 2,
        y,
        { align: "center" }
      );
      doc.text(
        "www.rifah.org  |  Official transaction record for tax & audit verification",
        pw / 2,
        y + 5,
        { align: "center" }
      );

      doc.save(`Receipt-${r.invoiceNumber || "INV"}.pdf`);
      toast.success("Receipt PDF downloaded successfully");
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Failed to generate PDF receipt");
    }
  };

  const handleDownloadThemedPdf = async () => {
    if (!previewInvoice) return;
    setIsExportingPdf(true);
    try {
      await downloadInvoicePdf(previewInvoice, previewInvoice.business);
      toast.success("Official RIFAH Tax Invoice PDF downloaded");
    } catch (err) {
      toast.error("Failed to export PDF invoice");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const totalRevenue = payments
    .filter((p) => p.status === "completed" || p.status === "Paid")
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  const customInvoicesCount = payments.filter((p) => p.isCustomInvoice).length;

  const filteredBusinesses = businesses.filter((b) => {
    if (!bizSearchTerm.trim()) return true;
    const term = bizSearchTerm.toLowerCase();
    return (
      (b.name && b.name.toLowerCase().includes(term)) ||
      (b.contactPerson && b.contactPerson.toLowerCase().includes(term)) ||
      (b.city && b.city.toLowerCase().includes(term)) ||
      (b.chapter && b.chapter.toLowerCase().includes(term))
    );
  });

  return (
    <AppShell
      role={user?.role === "chapter_admin" ? "chapter_admin" : "admin"}
      title="Payments & Revenue"
      subtitle="Chamber membership fee, event tickets & official invoice ledger"
      actions={
        isCentralAdmin && (
          <Button
            onClick={() => {
              setInvoiceForm(INITIAL_INVOICE_FORM);
              setIsCreateInvoiceOpen(true);
            }}
            className="bg-sky-600 hover:bg-sky-700 text-white font-semibold gap-2 shadow-sm text-xs sm:text-sm h-9"
          >
            <Plus className="h-4 w-4" />
            Create Invoice
          </Button>
        )
      }
    >
      <div className="space-y-4">
        {/* KPI / Stat Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          <StatCard
            label="Total Revenue"
            value={`₹ ${totalRevenue.toLocaleString("en-IN")}`}
            icon={Wallet}
            tone="success"
            active={filter === "revenue"}
            onClick={() => setFilter(filter === "revenue" ? "all" : "revenue")}
          />
          <StatCard
            label="Transactions"
            value={String(payments.length)}
            icon={CreditCard}
            tone="primary"
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
          <StatCard
            label="Completed"
            value={String(
              payments.filter((p) => p.status === "completed" || p.status === "Paid").length
            )}
            icon={CheckCircle2}
            tone="success"
            active={filter === "completed"}
            onClick={() => setFilter(filter === "completed" ? "all" : "completed")}
          />
          <StatCard
            label="Pending"
            value={String(
              payments.filter((p) => p.status === "pending" || p.status === "Pending").length
            )}
            icon={Clock}
            tone="warning"
            active={filter === "pending"}
            onClick={() => setFilter(filter === "pending" ? "all" : "pending")}
          />
          <StatCard
            label="Event Passes"
            value={String(payments.filter((p) => p.itemType === "Event Pass").length)}
            icon={Ticket}
            tone="primary"
            active={filter === "events"}
            onClick={() => setFilter(filter === "events" ? "all" : "events")}
          />
          <StatCard
            label="Cash Registrations"
            value={String(
              payments.filter((p) => p.method === "CASH" && p.itemType === "Membership").length
            )}
            icon={Banknote}
            tone="success"
            active={filter === "cash"}
            onClick={() => setFilter(filter === "cash" ? "all" : "cash")}
          />
          {isCentralAdmin && (
            <StatCard
              label="Centre Invoices"
              value={String(customInvoicesCount)}
              icon={Sparkles}
              tone="primary"
              active={filter === "custom"}
              onClick={() => setFilter(filter === "custom" ? "all" : "custom")}
            />
          )}
        </div>

        {/* Incoming Ledger Panel */}
        <Panel
          title={
            filter === "revenue"
              ? `Revenue Ledger (${filteredPayments.length} Paid • ₹ ${totalRevenue.toLocaleString("en-IN")})`
              : filter === "completed"
                ? `Completed Transactions (${filteredPayments.length})`
                : filter === "pending"
                  ? `Pending Transactions (${filteredPayments.length})`
                  : filter === "events"
                    ? `Event Payments (${filteredPayments.length})`
                    : filter === "cash"
                      ? `Cash Business Registrations (${filteredPayments.length})`
                      : filter === "custom"
                        ? `Central Admin Invoices (${filteredPayments.length} Created)`
                        : `Payment History · Incoming Ledger (${payments.length} Transactions)`
          }
          action={
            isCentralAdmin && (
              <Button
                onClick={() => {
                  setInvoiceForm(INITIAL_INVOICE_FORM);
                  setIsCreateInvoiceOpen(true);
                }}
                className="bg-sky-600 hover:bg-sky-700 text-white font-semibold gap-1.5 shadow-sm text-xs sm:text-sm h-8 sm:h-9"
              >
                <Plus className="h-4 w-4" />
                Create Invoice
              </Button>
            )
          }
        >
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
              empty={
                <EmptyState
                  icon={Wallet}
                  title="No transactions"
                  description="Incoming payment records and generated invoices will appear here."
                />
              }
              columns={[
                {
                  key: "invoiceNumber",
                  header: "Invoice No.",
                  cell: (r) => (
                    <div className="flex flex-col">
                      <span className="font-bold font-mono text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                        #{r.invoiceNumber || "N/A"}
                      </span>
                      {r.isCustomInvoice && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-600 dark:text-sky-400 mt-0.5">
                          <Sparkles className="h-2.5 w-2.5" /> Centre Created
                        </span>
                      )}
                    </div>
                  ),
                },
                {
                  key: "payer",
                  header: "Payer / Recipient",
                  cell: (r) => {
                    const displayName =
                      r.payerName || r.payer?.name || r.user?.name || r.businessName || "Direct Client";
                    const orgName =
                      r.businessName || r.business?.name;
                    return (
                      <div className="flex flex-col max-w-[220px]">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {displayName}
                        </span>
                        {orgName && orgName !== displayName && (
                          <span className="text-xs text-muted-foreground truncate">
                            {orgName}
                          </span>
                        )}
                        {(r.payerEmail || r.payer?.email) && (
                          <span className="text-[11px] text-muted-foreground truncate">
                            {r.payerEmail || r.payer?.email}
                          </span>
                        )}
                      </div>
                    );
                  },
                },
                {
                  key: "purpose",
                  header: "Purpose / Plan",
                  cell: (r) => {
                    if (r.itemType === "Event Pass" && r.eventId) {
                      return <span className="font-medium text-primary">Event: {r.eventId.title}</span>;
                    }
                    let rawPlan =
                      r.planTier ||
                      r.membershipTier ||
                      r.business?.membership ||
                      r.membership ||
                      "";
                    if (rawPlan && rawPlan !== "Free") {
                      const clean = rawPlan.replace(/\bplan\b/gi, "").trim();
                      rawPlan = clean ? `${clean} Plan` : rawPlan;
                    }
                    const baseDesc =
                      r.description || r.purpose || r.itemType || "Chamber Service Invoice";
                    let formattedDesc = baseDesc;
                    if (
                      rawPlan &&
                      rawPlan !== "Free" &&
                      !baseDesc.toLowerCase().includes(rawPlan.toLowerCase())
                    ) {
                      if (/\(Cash\)/i.test(baseDesc)) {
                        formattedDesc = `${baseDesc.replace(/\(Cash\)/i, "").trim()} (${rawPlan}) (Cash)`;
                      } else {
                        formattedDesc = `${baseDesc} (${rawPlan})`;
                      }
                    }
                    const ch = (
                      r.collectingChapter ||
                      r.chapter ||
                      r.business?.chapter ||
                      ""
                    ).trim();
                    const st = (
                      r.collectingState ||
                      r.state ||
                      r.business?.state ||
                      ""
                    ).trim();
                    const loc =
                      ch && ch.toLowerCase() !== "unassigned"
                        ? st
                          ? `${ch}, ${st}`
                          : ch
                        : st || "";

                    return (
                      <div className="flex flex-col max-w-[260px]">
                        <span className="font-medium text-slate-800 dark:text-slate-100 line-clamp-1">
                          {formattedDesc}
                        </span>
                        {r.notes && (
                          <span className="text-[11px] text-muted-foreground line-clamp-1 italic">
                            {r.notes}
                          </span>
                        )}
                        {loc && <span className="text-[11px] text-muted-foreground">{loc}</span>}
                      </div>
                    );
                  },
                },
                {
                  key: "date",
                  header: "Date",
                  cell: (r) => (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(r.paidAt || r.createdAt).toLocaleDateString()}
                    </span>
                  ),
                },
                {
                  key: "amount",
                  header: "Amount",
                  cell: (r) => {
                    const isUsd = (r.currency || "").toUpperCase() === "USD";
                    return (
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                          {isUsd ? "$" : "₹"}{" "}
                          {Number(r.amount || 0).toLocaleString(isUsd ? "en-US" : "en-IN")}
                          {isUsd ? " USD" : ""}
                        </span>
                        {r.gstRate !== undefined && Number(r.gstRate) > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            incl. {r.gstRate}% GST
                          </span>
                        )}
                      </div>
                    );
                  },
                },
                {
                  key: "status",
                  header: "Status",
                  cell: (r) => <Pill tone={tone(r.status)}>{r.status}</Pill>,
                },
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
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Invoice Actions</DropdownMenuLabel>

                        <DropdownMenuItem
                          className="font-medium text-sky-600 focus:bg-sky-50 focus:text-sky-700 dark:focus:bg-sky-950/60"
                          onClick={() => {
                            setPreviewInvoice(r);
                            setIsPreviewOpen(true);
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2 text-sky-600" />
                          View & Print Invoice
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedTransaction(r);
                            setIsDetailOpen(true);
                          }}
                        >
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
                          Download Receipt (Voucher)
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                          disabled={r.status === "refunded" || r.status === "Refunded"}
                          onClick={async () => {
                            if (
                              confirm(
                                `Are you sure you want to mark invoice ${r.invoiceNumber} as refunded?`
                              )
                            ) {
                              try {
                                await paymentApi.refund(r._id);
                                toast.success("Payment marked as refunded");
                                refetch();
                              } catch (e) {
                                toast.error(e.message || "Failed to process refund");
                              }
                            }
                          }}
                        >
                          Process Refund
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ),
                },
              ]}
              mobile={(r) => (
                <div className="rounded-xl border border-border p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                          #{r.invoiceNumber || "N/A"}
                        </p>
                        {r.isCustomInvoice && (
                          <span className="text-[10px] font-semibold text-sky-600 bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.5 rounded">
                            Centre
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground truncate">
                        {r.payerName || r.payer?.name || r.businessName || "Member"} ·{" "}
                        {new Date(r.paidAt || r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Pill tone={tone(r.status)}>{r.status}</Pill>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
                    <span className="text-muted-foreground truncate max-w-[180px]">
                      {r.description || r.purpose || r.itemType}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {(r.currency || "").toUpperCase() === "USD" ? "$" : "₹"}{" "}
                      {Number(r.amount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs h-8 gap-1.5"
                      onClick={() => {
                        setPreviewInvoice(r);
                        setIsPreviewOpen(true);
                      }}
                    >
                      <FileText className="h-3.5 w-3.5 text-sky-600" />
                      View Invoice
                    </Button>
                  </div>
                </div>
              )}
            />
          )}
        </Panel>
      </div>

      {/* ========================================================================= */}
      {/* CREATE INVOICE DIALOG (CENTRAL ADMIN EXCLUSIVE)                           */}
      {/* ========================================================================= */}
      <Dialog open={isCreateInvoiceOpen} onOpenChange={setIsCreateInvoiceOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-bold">
                  Create Chamber Tax Invoice
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  Issue an official RIFAH GST Tax Invoice for any service, event, fee or client.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmitInvoice} className="space-y-5 py-2">
            {/* Recipient Source Toggle */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                1. Recipient Selection
              </Label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
                <button
                  type="button"
                  onClick={() =>
                    setInvoiceForm((prev) => ({ ...prev, recipientType: "existing" }))
                  }
                  className={`py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${
                    invoiceForm.recipientType === "existing"
                      ? "bg-white dark:bg-slate-900 shadow-xs text-sky-700 dark:text-sky-300"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Registered Member / Business
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setInvoiceForm((prev) => ({
                      ...prev,
                      recipientType: "custom",
                      businessId: "",
                    }))
                  }
                  className={`py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${
                    invoiceForm.recipientType === "custom"
                      ? "bg-white dark:bg-slate-900 shadow-xs text-sky-700 dark:text-sky-300"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Direct Client / External Recipient
                </button>
              </div>

              {invoiceForm.recipientType === "existing" ? (
                <div className="space-y-3 pt-1">
                  <div>
                    <Label className="text-xs">Search & Select Registered Member Business</Label>
                    <div className="relative mt-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by company name, owner, city or chapter..."
                        value={bizSearchTerm}
                        onChange={(e) => setBizSearchTerm(e.target.value)}
                        className="pl-9 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="max-h-36 overflow-y-auto rounded-lg border border-border p-1 space-y-1 bg-slate-50/50 dark:bg-slate-900/50">
                    {filteredBusinesses.length === 0 ? (
                      <p className="p-3 text-center text-xs text-muted-foreground">
                        No registered businesses found matching filter
                      </p>
                    ) : (
                      filteredBusinesses.slice(0, 15).map((b) => {
                        const isSelected = invoiceForm.businessId === b._id;
                        return (
                          <div
                            key={b._id}
                            onClick={() => handleSelectBusiness(b._id)}
                            className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors text-xs ${
                              isSelected
                                ? "bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-800"
                                : "hover:bg-muted"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold truncate text-slate-900 dark:text-slate-100">
                                {b.name}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {b.contactPerson || b.owner?.name || "Member"} ·{" "}
                                {b.city || b.chapter || "Chamber"}
                              </p>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0 ml-2" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : null}

              {/* Recipient Details Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <Label className="text-xs">
                    Recipient / Contact Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="e.g. Dr. Salman Khan"
                    value={invoiceForm.payerName}
                    onChange={(e) =>
                      setInvoiceForm((prev) => ({ ...prev, payerName: e.target.value }))
                    }
                    className="text-xs sm:text-sm mt-1"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs">Enterprise / Organization Name</Label>
                  <Input
                    placeholder="e.g. Apex Global Logistics Ltd."
                    value={invoiceForm.businessName}
                    onChange={(e) =>
                      setInvoiceForm((prev) => ({ ...prev, businessName: e.target.value }))
                    }
                    className="text-xs sm:text-sm mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Recipient Email</Label>
                  <Input
                    type="email"
                    placeholder="billing@company.com"
                    value={invoiceForm.payerEmail}
                    onChange={(e) =>
                      setInvoiceForm((prev) => ({ ...prev, payerEmail: e.target.value }))
                    }
                    className="text-xs sm:text-sm mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Recipient Phone</Label>
                  <Input
                    placeholder="+91 98765 43210"
                    value={invoiceForm.payerPhone}
                    onChange={(e) =>
                      setInvoiceForm((prev) => ({ ...prev, payerPhone: e.target.value }))
                    }
                    className="text-xs sm:text-sm mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Recipient GSTIN (Optional)</Label>
                  <Input
                    placeholder="27AABCR9823M1Z4"
                    value={invoiceForm.gstin}
                    onChange={(e) =>
                      setInvoiceForm((prev) => ({ ...prev, gstin: e.target.value.toUpperCase() }))
                    }
                    className="text-xs sm:text-sm mt-1 font-mono uppercase"
                  />
                </div>
                <div>
                  <Label className="text-xs">Chapter / Location</Label>
                  <Input
                    placeholder="e.g. Mumbai, Maharashtra"
                    value={invoiceForm.chapter}
                    onChange={(e) =>
                      setInvoiceForm((prev) => ({ ...prev, chapter: e.target.value }))
                    }
                    className="text-xs sm:text-sm mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Presets & Purpose */}
            <div className="space-y-2 pt-2 border-t border-border">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                2. Invoice Deliverable & Purpose
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {INVOICE_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      invoiceForm.categoryPreset === preset.name
                        ? "bg-sky-600 border-sky-600 text-white font-semibold"
                        : "border-border hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="sm:col-span-2">
                  <Label className="text-xs">
                    Item Description / Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="e.g. Annual Chamber Membership Accreditation"
                    value={invoiceForm.purpose}
                    onChange={(e) =>
                      setInvoiceForm((prev) => ({ ...prev, purpose: e.target.value }))
                    }
                    className="text-xs sm:text-sm mt-1 font-medium"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs">SAC / HSN Code</Label>
                  <Input
                    placeholder="9983"
                    value={invoiceForm.sacCode}
                    onChange={(e) =>
                      setInvoiceForm((prev) => ({ ...prev, sacCode: e.target.value }))
                    }
                    className="text-xs sm:text-sm mt-1 font-mono"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Deliverable Notes / Detailed Scope</Label>
                <Textarea
                  placeholder="Describe included services, booth dimensions, entitlements or event dates..."
                  value={invoiceForm.notes}
                  onChange={(e) =>
                    setInvoiceForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  className="text-xs sm:text-sm mt-1 min-h-[60px]"
                />
              </div>
            </div>

            {/* Pricing & GST Calculation */}
            <div className="space-y-3 pt-2 border-t border-border">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                3. Financials & Tax Computation
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs">Currency</Label>
                  <Select
                    value={invoiceForm.currency}
                    onValueChange={(val) =>
                      setInvoiceForm((prev) => ({ ...prev, currency: val }))
                    }
                  >
                    <SelectTrigger className="mt-1 text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">
                    Base Subtotal ({invoiceForm.currency === "USD" ? "$" : "₹"})
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    value={invoiceForm.subtotal}
                    onChange={(e) => handleSubtotalChange(e.target.value)}
                    className="mt-1 text-xs sm:text-sm font-semibold tabular-nums"
                  />
                </div>

                <div>
                  <Label className="text-xs">GST Rate (%)</Label>
                  <Select
                    value={String(invoiceForm.gstRate)}
                    onValueChange={(val) => handleGstRateChange(Number(val))}
                  >
                    <SelectTrigger className="mt-1 text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18">18% (Standard GST)</SelectItem>
                      <SelectItem value="12">12%</SelectItem>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="0">0% (GST Exempt)</SelectItem>
                      <SelectItem value="28">28%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={invoiceForm.quantity}
                    onChange={(e) =>
                      setInvoiceForm((prev) => ({ ...prev, quantity: e.target.value }))
                    }
                    className="mt-1 text-xs sm:text-sm tabular-nums"
                  />
                </div>
              </div>

              {/* Live Calculation Preview Card */}
              <div className="rounded-xl border border-sky-200 dark:border-sky-900 bg-sky-50/50 dark:bg-sky-950/30 p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-xs text-muted-foreground">Computed Breakdown:</span>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Base Subtotal:{" "}
                      <strong>
                        {invoiceForm.currency === "USD" ? "$" : "₹"}{" "}
                        {Number(invoiceForm.subtotal || 0).toLocaleString()}
                      </strong>{" "}
                      + GST ({invoiceForm.gstRate}%):{" "}
                      <strong>
                        {invoiceForm.currency === "USD" ? "$" : "₹"}{" "}
                        {(
                          Number(invoiceForm.amount || 0) - Number(invoiceForm.subtotal || 0)
                        ).toLocaleString()}
                      </strong>
                    </p>
                  </div>
                  <div className="text-right sm:border-l sm:border-sky-200 sm:dark:border-sky-900 sm:pl-4">
                    <span className="text-[11px] font-bold uppercase text-sky-800 dark:text-sky-300">
                      Total Invoice Amount
                    </span>
                    <p className="text-xl sm:text-2xl font-black text-sky-700 dark:text-sky-400 tabular-nums">
                      {invoiceForm.currency === "USD" ? "$" : "₹"}{" "}
                      {Number(invoiceForm.amount || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Audit & Payment Metadata */}
            <div className="space-y-3 pt-2 border-t border-border">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                4. Audit & Payment Status
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs">Payment Status</Label>
                  <Select
                    value={invoiceForm.status}
                    onValueChange={(val) =>
                      setInvoiceForm((prev) => ({ ...prev, status: val }))
                    }
                  >
                    <SelectTrigger className="mt-1 text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Paid">Paid / Completed</SelectItem>
                      <SelectItem value="Pending">Pending / Awaiting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Payment Method</Label>
                  <Select
                    value={invoiceForm.method}
                    onValueChange={(val) =>
                      setInvoiceForm((prev) => ({ ...prev, method: val }))
                    }
                  >
                    <SelectTrigger className="mt-1 text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Transfer">Bank Transfer / NEFT</SelectItem>
                      <SelectItem value="Cheque / DD">Cheque / DD</SelectItem>
                      <SelectItem value="UPI">UPI / QR</SelectItem>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="Online Gateway">Online Gateway</SelectItem>
                      <SelectItem value="Other">Other Mode</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Ref / UTR Number</Label>
                  <Input
                    placeholder="UTR-8239014"
                    value={invoiceForm.transactionId}
                    onChange={(e) =>
                      setInvoiceForm((prev) => ({ ...prev, transactionId: e.target.value }))
                    }
                    className="mt-1 text-xs sm:text-sm font-mono"
                  />
                </div>

                <div>
                  <Label className="text-xs">Invoice Date</Label>
                  <Input
                    type="date"
                    value={invoiceForm.paidAt}
                    onChange={(e) =>
                      setInvoiceForm((prev) => ({ ...prev, paidAt: e.target.value }))
                    }
                    className="mt-1 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">
                  Custom Invoice Number{" "}
                  <span className="text-muted-foreground font-normal">
                    (Leave blank for auto-generation e.g. INV-XXXX)
                  </span>
                </Label>
                <Input
                  placeholder="e.g. RIFAH-2026-INV-1092"
                  value={invoiceForm.invoiceNumber}
                  onChange={(e) =>
                    setInvoiceForm((prev) => ({
                      ...prev,
                      invoiceNumber: e.target.value.toUpperCase(),
                    }))
                  }
                  className="mt-1 text-xs sm:text-sm font-mono uppercase"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateInvoiceOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-sky-600 hover:bg-sky-700 text-white font-semibold gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Invoice...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Create & Generate Invoice
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* THEMED INVOICE PREVIEW MODAL (RIFAH OFFICIAL GST TAX INVOICE)              */}
      {/* ========================================================================= */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[94vh] flex flex-col p-4 sm:p-6">
          <DialogHeader className="flex flex-row items-center justify-between border-b pb-3 space-y-0">
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-sky-600" />
                <span>
                  Official RIFAH Tax Invoice — #{previewInvoice?.invoiceNumber || "N/A"}
                </span>
                {previewInvoice?.isCustomInvoice && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                    Centre Created
                  </span>
                )}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Formatted according to official Chamber GST guidelines with SAC codes and verification badges.
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs font-semibold"
                onClick={() => {
                  if (previewIframeRef.current?.contentWindow) {
                    previewIframeRef.current.contentWindow.print();
                  } else {
                    openAndPrintInvoice(previewInvoice, previewInvoice?.business);
                  }
                }}
              >
                <Printer className="h-3.5 w-3.5 text-sky-600" />
                Print Invoice
              </Button>

              <Button
                size="sm"
                className="bg-sky-600 hover:bg-sky-700 text-white gap-1.5 text-xs font-semibold"
                disabled={isExportingPdf}
                onClick={handleDownloadThemedPdf}
              >
                {isExportingPdf ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                Download PDF
              </Button>
            </div>
          </DialogHeader>

          {/* Iframe rendering the exact official RIFAH invoice HTML theme */}
          <div className="flex-1 min-h-[560px] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-2 sm:p-4 my-2">
            {previewInvoice && (
              <iframe
                ref={previewIframeRef}
                srcDoc={generateInvoiceHtml(previewInvoice, previewInvoice?.business, {
                  isPreview: true,
                })}
                className="w-full h-full min-h-[540px] rounded-lg border border-slate-200 dark:border-slate-800 bg-white shadow-sm"
                title={`Invoice-${previewInvoice.invoiceNumber}`}
              />
            )}
          </div>

          <DialogFooter className="border-t pt-3 flex justify-between items-center sm:justify-between">
            <span className="text-xs text-muted-foreground">
              Invoice Total:{" "}
              <strong className="text-slate-900 dark:text-slate-100">
                {(previewInvoice?.currency || "").toUpperCase() === "USD" ? "$" : "₹"}{" "}
                {Number(previewInvoice?.amount || 0).toLocaleString()}
              </strong>{" "}
              · Status:{" "}
              <strong className="capitalize text-emerald-600">
                {previewInvoice?.status || "Paid"}
              </strong>
            </span>
            <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(false)}>
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* TRANSACTION DETAILS MODAL                                                 */}
      {/* ========================================================================= */}
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
                      (selectedTransaction.currency || "").toUpperCase() === "USD"
                        ? "en-US"
                        : "en-IN"
                    )}{" "}
                    {selectedTransaction.currency || "INR"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground mb-1">Date</span>
                  <span className="text-sm">
                    {new Date(
                      selectedTransaction.paidAt || selectedTransaction.createdAt
                    ).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground mb-1">Payer</span>
                  <span className="text-sm font-medium">
                    {selectedTransaction.payerName ||
                      selectedTransaction.payer?.name ||
                      selectedTransaction.user?.name ||
                      "Direct Client"}
                  </span>
                  {(selectedTransaction.payerEmail ||
                    selectedTransaction.payer?.email ||
                    selectedTransaction.payerPhone ||
                    selectedTransaction.payer?.phone) && (
                    <span className="block text-xs text-muted-foreground">
                      {selectedTransaction.payerEmail || selectedTransaction.payer?.email}{" "}
                      {selectedTransaction.payerPhone || selectedTransaction.payer?.phone
                        ? `• ${selectedTransaction.payerPhone || selectedTransaction.payer?.phone}`
                        : ""}
                    </span>
                  )}
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground mb-1">Method</span>
                  <span className="text-sm">{selectedTransaction.method || "Online"}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-xs text-muted-foreground mb-1">
                    Subscription / Deliverable
                  </span>
                  <span className="text-sm font-semibold">
                    {selectedTransaction.description ||
                      selectedTransaction.purpose ||
                      selectedTransaction.itemType ||
                      "Chamber Deliverable"}
                  </span>
                  {selectedTransaction.notes && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedTransaction.notes}
                    </p>
                  )}
                </div>
                <div className="col-span-2">
                  <span className="block text-xs text-muted-foreground mb-1">Chapter / State</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {(() => {
                      const ch = (
                        selectedTransaction.collectingChapter ||
                        selectedTransaction.chapter ||
                        selectedTransaction.business?.chapter ||
                        selectedTransaction.payer?.chapter ||
                        ""
                      ).trim();
                      const st = (
                        selectedTransaction.collectingState ||
                        selectedTransaction.state ||
                        selectedTransaction.business?.state ||
                        selectedTransaction.payer?.state ||
                        ""
                      ).trim();
                      if (ch && st && ch.toLowerCase() !== "unassigned") return `${ch}, ${st}`;
                      if (ch && ch.toLowerCase() !== "unassigned") return ch;
                      return st || "RIFAH Central / All Chapters";
                    })()}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="block text-xs text-muted-foreground mb-1">Transaction ID</span>
                  <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {selectedTransaction.transactionId || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-between border-t pt-4 gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setPreviewInvoice(selectedTransaction);
                  setIsDetailOpen(false);
                  setIsPreviewOpen(true);
                }}
                className="gap-1.5"
              >
                <FileText className="h-4 w-4 text-sky-600" /> View Invoice
              </Button>
              {selectedTransaction &&
                selectedTransaction.status !== "completed" &&
                selectedTransaction.status !== "Paid" && (
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
                    onClick={async () => {
                      try {
                        await paymentApi.verifyByAdmin(selectedTransaction._id);
                        toast.success(
                          `Payment #${selectedTransaction.invoiceNumber} verified & approved!`
                        );
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

export default AdminPayments;
