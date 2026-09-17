"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Download,
  MessageSquare,
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  Send,
  Check,
  FileText,
  Clock,
  IndianRupee,
  Lock,
  Search,
  Target,
  Sparkles,
  Filter,
  X,
  FileDown,
  ChevronRight,
  TrendingUp,
  Phone,
  Mail,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { StatusBadge, Pill } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@shared/components/ui/dialog";
import { useBusinessEnquiries, useMyLeads } from "@shared/hooks/use-rifah-api";
import { leadApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/api-client";
import { cn } from "@shared/lib/utils";

function getEnquiryType(r) {
  if (!r) return "b2b";
  const targetType = r.targetType || r.enquiry?.targetType;
  if (targetType === "all") {
    return "general";
  }
  const hasGuestInfo = Boolean(
    r.guestName ||
    r.guestEmail ||
    r.guestPhone ||
    r.enquiry?.guestName ||
    r.enquiry?.guestEmail ||
    r.enquiry?.guestPhone
  );
  const role = (r.requesterRole || r.enquiry?.requesterRole || "").toLowerCase();
  if (hasGuestInfo || role.includes("guest") || (!r.requester && !r.enquiry?.requester && targetType === "business")) {
    return "guest";
  }
  return "b2b";
}

function resolveCustomerName(r) {
  if (!r) return "Customer";
  const candidates = [
    r.guestName,
    r.enquiry?.guestName,
    r.customerName,
    r.enquiry?.customerName,
    r.clientName,
    r.enquiry?.clientName,
    r.enquiry?.requester?.name,
    r.requester?.name,
    r.enquiry?.user?.name,
    r.buyerName,
    r.enquiry?.buyerName,
    r.enquiry?.requesterName,
    r.requesterName,
    r.name,
  ];

  for (const name of candidates) {
    if (name && typeof name === "string") {
      const lower = name.toLowerCase().trim();
      if (
        lower &&
        !lower.includes("buyer account") &&
        !lower.includes("registered buyer") &&
        !lower.includes("demo buyer") &&
        lower !== "buyer" &&
        lower !== "guest buyer"
      ) {
        return name.trim();
      }
    }
  }

  const email = r.enquiry?.requester?.email || r.enquiry?.buyerEmail || r.buyerEmail || r.email;
  if (email && typeof email === "string") {
    const prefix = email.split("@")[0].replace(/[0-9._-]/g, " ").trim();
    if (prefix && !prefix.toLowerCase().includes("buyer")) {
      return prefix
        .split(" ")
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    }
  }

  return "Raj Sharma";
}

function formatEnquiryCode(item, index = 0) {
  if (!item) return "ENQ";
  if (item.referenceId) return item.referenceId;
  if (item.refCode) return item.refCode;
  if (item.enquiryCode) return item.enquiryCode;
  if (item.code) return item.code;
  if (item.enquiry?.referenceId) return item.enquiry.referenceId;
  if (item.enquiry?.code) return item.enquiry.code;
  if (item._id) {
    return `ENQ-${String(item._id).slice(-4).toUpperCase()}`;
  }
  return `ENQ-${index + 1}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "Immediate / Flexible";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatRelativeTime(dateInput) {
  if (!dateInput) return "Just now";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "Recently";
  const diffInMinutes = Math.floor((new Date() - date) / (1000 * 60));
  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function handleExportList(enquiries) {
  if (!enquiries || enquiries.length === 0) {
    toast.error("No enquiries to export");
    return;
  }

  const headers = ["Enquiry ID", "Requirement", "Buyer", "Quantity", "Budget", "Required By", "Status", "Quotation"];
  const rows = enquiries.map((r, i) => [
    `"${formatEnquiryCode(r, i)}"`,
    `"${(r.title || r.enquiry?.title || "Requirement").replace(/"/g, '""')}"`,
    `"${(r.buyerName || r.requesterName || "Customer").replace(/"/g, '""')}"`,
    `"${r.quantity || r.enquiry?.quantity || "On request"}"`,
    `"${r.budget || "Market standard"}"`,
    `"${formatDate(r.requiredBy || r.enquiry?.requiredBy)}"`,
    `"${r.leadStatus || r.status || "New"}"`,
    `"${r.myQuotation?.amount ? `₹${r.myQuotation.amount}` : "Not quoted"}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `RIFAH_Enquiries_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success("Enquiries exported successfully");
}

export function BizEnquiries() {
  const [tab, setTab] = useState("All");
  const [typeFilter, setTypeFilter] = useState("all"); // "all", "b2b", "guest", "general"
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [quoteAmount, setQuoteAmount] = useState("");
  const [quoteNotes, setQuoteNotes] = useState("");
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  const { data: enquiriesData, isLoading: loadingEnquiries, refetch: refetchEnquiries } = useBusinessEnquiries();
  const { data: leadsData, isLoading: loadingLeads, refetch: refetchLeads } = useMyLeads();

  const refetch = () => {
    refetchEnquiries();
    refetchLeads();
  };

  // Seamlessly merge direct enquiries and chamber-routed leads so 100% of data appears in one place
  const allRows = useMemo(() => {
    const rawEnquiries = Array.isArray(enquiriesData) ? enquiriesData : enquiriesData?.enquiries || [];
    const rawLeads = Array.isArray(leadsData) ? leadsData : leadsData?.leads || [];

    const map = new Map();

    // 1. Add all direct and chamber enquiries
    rawEnquiries.forEach((enq, idx) => {
      const key = String(enq._id || enq.referenceId || idx);
      const buyerName = resolveCustomerName(enq);
      map.set(key, {
        ...enq,
        _itemType: "enquiry",
        buyerName,
        requesterName: buyerName,
        guestName: enq.guestName || enq.enquiry?.guestName || "",
        guestEmail: enq.guestEmail || enq.enquiry?.guestEmail || "",
        guestPhone: enq.guestPhone || enq.enquiry?.guestPhone || "",
      });
    });

    // 2. Add / merge leads
    rawLeads.forEach((lead) => {
      const enqId = lead.enquiry?._id ? String(lead.enquiry._id) : (lead.enquiry ? String(lead.enquiry) : null);
      const buyerName = resolveCustomerName(lead.enquiry || lead);
      const hasQuote = Boolean(lead.quotation?.amount);
      const gName = lead.enquiry?.guestName || lead.guestName || "";
      const gEmail = lead.enquiry?.guestEmail || lead.guestEmail || "";
      const gPhone = lead.enquiry?.guestPhone || lead.guestPhone || "";

      if (enqId && map.has(enqId)) {
        const existing = map.get(enqId);
        map.set(enqId, {
          ...existing,
          leadId: lead._id,
          businessId: lead.business?._id || lead.business,
          leadStatus: hasQuote ? (lead.status || "Responded") : (lead.status || existing.leadStatus || "New"),
          myQuotation: hasQuote ? lead.quotation : existing.myQuotation,
          priority: lead.priority || existing.priority || "Standard",
          guestName: existing.guestName || gName,
          guestEmail: existing.guestEmail || gEmail,
          guestPhone: existing.guestPhone || gPhone,
        });
      } else {
        const key = String(lead._id);
        map.set(key, {
          _id: lead.enquiry?._id || lead._id,
          leadId: lead._id,
          businessId: lead.business?._id || lead.business,
          referenceId: lead.enquiry?.referenceId || formatEnquiryCode(lead),
          title: lead.enquiry?.title || lead.requirement || "Business Requirement",
          description: lead.enquiry?.description || lead.notes || "",
          category: lead.enquiry?.category || "General",
          quantity: lead.enquiry?.quantity || lead.quantity || "On request",
          budget: lead.enquiry?.budget || lead.budget || "Market standard",
          requiredBy: lead.enquiry?.requiredBy || lead.enquiry?.targetDate || lead.requiredBy,
          location: lead.enquiry?.city || lead.city || "Mumbai",
          targetType: lead.enquiry?.targetType || lead.targetType || "chamber",
          requesterName: buyerName,
          buyerName,
          requesterRole: lead.enquiry?.requesterRole || (gName ? "Guest Customer" : "Verified Customer"),
          requester: lead.enquiry?.requester || null,
          status: lead.status || "New",
          leadStatus: hasQuote ? (lead.status || "Responded") : (lead.status || "New"),
          myQuotation: hasQuote ? lead.quotation : null,
          priority: lead.priority || "Standard",
          createdAt: lead.createdAt,
          guestName: gName,
          guestEmail: gEmail,
          guestPhone: gPhone,
        });
      }
    });

    return Array.from(map.values());
  }, [enquiriesData, leadsData]);

  // Dynamic filter tabs
  const filteredRows = useMemo(() => {
    let rows = allRows;

    // 1. Source / Type filter (b2b, guest, general)
    if (typeFilter !== "all") {
      rows = rows.filter((r) => getEnquiryType(r) === typeFilter);
    }

    // 2. Tab stage filtering
    if (tab !== "All") {
      rows = rows.filter((r) => {
        const st = (r.leadStatus || r.status || "New").toLowerCase();
        if (tab === "New") return st === "new";
        if (tab === "In Progress") return st === "in progress" || st === "in_progress";
        if (tab === "Responded") return st === "responded" || Boolean(r.myQuotation?.amount);
        if (tab === "Won") return st === "won";
        if (tab === "Closed") return st === "closed" || st === "lost" || st === "won";
        return true;
      });
    }

    // 3. Search keyword filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      rows = rows.filter((r) => {
        return (
          (r.title || "").toLowerCase().includes(q) ||
          (r.referenceId || "").toLowerCase().includes(q) ||
          (r.buyerName || "").toLowerCase().includes(q) ||
          (r.requesterName || "").toLowerCase().includes(q) ||
          (r.guestName || "").toLowerCase().includes(q) ||
          (r.guestEmail || "").toLowerCase().includes(q) ||
          (r.guestPhone || "").toLowerCase().includes(q) ||
          (r.location || r.city || "").toLowerCase().includes(q) ||
          (r.category || "").toLowerCase().includes(q) ||
          (r.description || "").toLowerCase().includes(q)
        );
      });
    }

    return rows;
  }, [allRows, typeFilter, tab, searchQuery]);

  // Stat metrics
  const totalCount = allRows.length;
  const newCount = allRows.filter((r) => (r.leadStatus || r.status || "New").toLowerCase() === "new").length;
  const inProgressCount = allRows.filter((r) => (r.leadStatus || r.status || "").toLowerCase().includes("progress")).length;
  const respondedCount = allRows.filter((r) => (r.leadStatus || r.status || "").toLowerCase() === "responded" || Boolean(r.myQuotation?.amount)).length;
  const responseRate = totalCount > 0 ? `${Math.round((respondedCount / totalCount) * 100)}%` : "0%";

  // Counts by enquiry source
  const b2bCount = allRows.filter((r) => getEnquiryType(r) === "b2b").length;
  const guestCount = allRows.filter((r) => getEnquiryType(r) === "guest").length;
  const generalCount = allRows.filter((r) => getEnquiryType(r) === "general").length;

  const handleOpenDialog = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setQuoteAmount(enquiry.myQuotation?.amount ? String(enquiry.myQuotation.amount) : "");
    setQuoteNotes(enquiry.myQuotation?.notes || "");
    setShowQuoteForm(false);
  };

  const handleAcceptRequirement = async () => {
    if (!selectedEnquiry?.leadId) {
      toast.error("Lead tracking reference not found for this enquiry");
      return;
    }
    setUpdatingStatus(true);
    try {
      await leadApi.updateStatus(selectedEnquiry.leadId, { status: "In Progress" });
      setSelectedEnquiry((prev) => ({
        ...prev,
        leadStatus: "In Progress",
        status: "In Progress",
      }));
      toast.success("Requirement accepted! You can now submit your official quotation.");
      refetch();
    } catch (err) {
      toast.error(err?.message || "Failed to accept requirement");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedEnquiry?.leadId) return;
    try {
      await leadApi.updateStatus(selectedEnquiry.leadId, { status: newStatus });
      setSelectedEnquiry((prev) => ({
        ...prev,
        leadStatus: newStatus,
        status: newStatus,
      }));
      toast.success(`Enquiry marked as ${newStatus}`);
      refetch();
    } catch (err) {
      toast.error(err?.message || "Failed to update enquiry status");
    }
  };

  const handleSubmitQuotation = async (e) => {
    e.preventDefault();
    const cleanAmount = String(quoteAmount).trim();
    if (!cleanAmount || isNaN(Number(cleanAmount)) || Number(cleanAmount) <= 0) {
      toast.error("Please enter a valid quotation amount (greater than zero)");
      return;
    }

    if (!selectedEnquiry?.leadId) {
      toast.error("Lead reference not found for this enquiry");
      return;
    }

    setSubmittingQuote(true);
    try {
      await leadApi.submitQuotation(selectedEnquiry.leadId, {
        amount: cleanAmount,
        notes: quoteNotes.trim(),
      });

      const updatedQuote = {
        amount: cleanAmount,
        notes: quoteNotes.trim(),
        submittedAt: new Date(),
      };

      setSelectedEnquiry((prev) => ({
        ...prev,
        leadStatus: "Responded",
        status: "Responded",
        myQuotation: updatedQuote,
      }));

      setShowQuoteForm(false);
      toast.success("Official quotation submitted! Generated PDF document delivered to buyer's message box.");
      refetch();
    } catch (err) {
      toast.error(err?.message || "Failed to submit quotation");
    } finally {
      setSubmittingQuote(false);
    }
  };

  const handleDownloadQuotePDF = async (enquiry) => {
    const qtnRef = `QTN-${String(enquiry.leadId || enquiry._id).slice(-6).toUpperCase()}`;
    const pdfPath = enquiry.myQuotation?.pdfUrl || `/uploads/attachments/quotation-${qtnRef}.pdf`;
    const fullUrl = resolveMediaUrl(pdfPath);
    try {
      const res = await fetch(fullUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `quotation-${qtnRef}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Quotation PDF downloaded successfully");
    } catch (e) {
      window.open(fullUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <AppShell
      role="business"
      title="Member & buyer enquiries"
      subtitle="Direct sourcing requirements and chamber-wide requests from verified members and buyers"
      actions={
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => handleExportList(filteredRows)}
          disabled={filteredRows.length === 0}
        >
          <Download className="h-4 w-4" />
          Export list
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Top 4 Real-time Stat Cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Total Enquiries"
            value={String(totalCount)}
            icon={Target}
            tone="neutral"
            active={tab === "All"}
            onClick={() => setTab("All")}
          />
          <StatCard
            label="New / Need Quote"
            value={String(newCount)}
            hint={`${newCount} awaiting reply`}
            icon={Clock}
            tone="danger"
            active={tab === "New"}
            onClick={() => setTab("New")}
          />
          <StatCard
            label="In Progress"
            value={String(inProgressCount)}
            hint="Requirements accepted"
            icon={MessageSquare}
            tone="warning"
            active={tab === "In Progress"}
            onClick={() => setTab("In Progress")}
          />
          <StatCard
            label="Quoted / Won"
            value={String(respondedCount)}
            hint={`${responseRate} response rate`}
            icon={CheckCircle2}
            tone="success"
            active={tab === "Responded"}
            onClick={() => setTab("Responded")}
          />
        </div>

        {/* Source Type Filter Pills & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Category Type Filter: All | Business (B2B) | Guest | General Query */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl border border-border bg-surface w-fit shadow-2xs">
            {[
              { id: "all", label: "All", count: totalCount },
              { id: "b2b", label: "Business (B2B)", count: b2bCount },
              { id: "guest", label: "Guest", count: guestCount },
              { id: "general", label: "General Query", count: generalCount },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setTypeFilter(f.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                  typeFilter === f.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
              >
                <span>{f.label}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.2 text-[10px] font-bold",
                    typeFilter === f.id
                      ? "bg-white/20 text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Bar on Right */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64 md:w-80">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search requirements, buyers, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-border bg-surface pl-10 pr-9 py-1.5 text-xs sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2 text-muted-foreground hover:text-foreground p-0.5"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {tab !== "All" && (
              <button
                type="button"
                onClick={() => setTab("All")}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer shrink-0"
              >
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px]">✕ {tab}</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Enquiries Table */}
        <Panel>
          <ResponsiveTable
            rows={filteredRows}
            empty={
              <EmptyState
                icon={MessageSquare}
                title="No matching enquiries found"
                description={
                  searchQuery || tab !== "All"
                    ? "Try adjusting your search keywords or switching filter tabs."
                    : "When chamber members or buyers post sourcing requirements or send direct RFQs, they will appear here."
                }
              />
            }
            columns={[
              {
                key: "enquiry",
                header: "ENQUIRY ID",
                cell: (r, i) => {
                  const type = getEnquiryType(r);
                  return (
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground">
                          {formatEnquiryCode(r, i)}
                        </span>
                        {type === "guest" && (
                          <span className="rounded px-1.5 py-0.2 text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                            Guest
                          </span>
                        )}
                        {type === "general" && (
                          <span className="rounded px-1.5 py-0.2 text-[10px] font-bold bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20">
                            General RFQ
                          </span>
                        )}
                        {type === "b2b" && (
                          <span className="rounded px-1.5 py-0.2 text-[10px] font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
                            B2B Member
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground block mt-0.5">
                        {type === "guest" ? "Profile Enquiry" : type === "general" ? "Home RFQ" : (r.chapter || "Chamber Network")}
                      </span>
                    </div>
                  );
                },
              },
              {
                key: "title",
                header: "REQUIREMENT",
                cell: (r) => (
                  <div>
                    <span className="font-medium text-foreground block line-clamp-1">
                      {r.title || r.enquiry?.title || "Requirement"}
                    </span>
                    {Boolean(r.category) && (
                      <span className="text-xs text-muted-foreground">{r.category}</span>
                    )}
                  </div>
                ),
              },
              {
                key: "buyer",
                header: "REQUESTER",
                cell: (r) => {
                  const type = getEnquiryType(r);
                  const buyer = r.buyerName || r.requesterName || r.guestName || "Customer";
                  return (
                    <div>
                      <span className="font-medium text-foreground block">
                        {buyer}
                      </span>
                      <span className="text-xs text-muted-foreground block">
                        {type === "guest"
                          ? `Guest Customer ${r.location ? `· ${r.location}` : ""}`
                          : type === "general"
                            ? `General Buyer ${r.location ? `· ${r.location}` : ""}`
                            : `${r.requesterRole || "Business Member"} ${r.location ? `· ${r.location}` : ""}`}
                      </span>
                    </div>
                  );
                },
              },
              {
                key: "qty",
                header: "QUANTITY",
                cell: (r) => r.quantity || r.enquiry?.quantity || "On request",
              },
              {
                key: "by",
                header: "REQUIRED BY",
                cell: (r) => formatDate(r.requiredBy || r.enquiry?.requiredBy),
              },
              {
                key: "status",
                header: "STATUS / YOUR QUOTE",
                cell: (r) => {
                  const type = getEnquiryType(r);
                  if (type === "b2b") {
                    const hasQuote = Boolean(r.myQuotation?.amount && Number(r.myQuotation.amount) > 0);
                    if (hasQuote) {
                      return (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          Quoted ₹{Number(r.myQuotation.amount).toLocaleString("en-IN")}
                        </span>
                      );
                    }
                    if (r.leadStatus === "In Progress" || r.status === "In Progress") {
                      return (
                        <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-400">
                          Accepted
                        </span>
                      );
                    }
                  }
                  return <StatusBadge status={r.leadStatus || r.status || "New"} />;
                },
              },
              {
                key: "action",
                header: "ACTION",
                cell: (r) => {
                  const type = getEnquiryType(r);
                  const buyerId = r.requester?._id || r.requester || r.enquiry?.requester?._id || r.enquiry?.requester || "";
                  const buyerName = r.buyerName || r.requesterName || "Requester";
                  const isQuoted = Boolean(r.myQuotation?.amount && Number(r.myQuotation.amount) > 0);

                  // GUEST & GENERAL: ONLY "View Details". NO Message button!
                  if (type === "guest" || type === "general") {
                    return (
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs font-semibold"
                          onClick={() => handleOpenDialog(r)}
                        >
                          View Details
                        </Button>
                      </div>
                    );
                  }

                  // B2B: Retains full "View & Quote" and "Message"
                  return (
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant={isQuoted ? "outline" : "default"}
                        className="h-8 text-xs font-semibold"
                        onClick={() => handleOpenDialog(r)}
                      >
                        {isQuoted ? "View Details" : "View & Quote"}
                      </Button>
                      {isQuoted ? (
                        <Button asChild size="sm" variant="outline" className="h-8 text-xs font-semibold">
                          <Link href={buyerId ? `/biz/messages?userId=${buyerId}&name=${encodeURIComponent(buyerName)}` : "/biz/messages"}>
                            <MessageSquare className="mr-1 h-3.5 w-3.5" /> Message
                          </Link>
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled className="h-8 text-xs font-semibold opacity-50 cursor-not-allowed pointer-events-none">
                          <Lock className="mr-1 h-3 w-3 text-muted-foreground" /> Message
                        </Button>
                      )}
                    </div>
                  );
                },
              },
            ]}
            mobile={(r, i) => {
              const type = getEnquiryType(r);
              const buyerId = r.requester?._id || r.requester || r.enquiry?.requester?._id || r.enquiry?.requester || "";
              const buyerName = r.buyerName || r.requesterName || "Requester";
              const isQuoted = Boolean(r.myQuotation?.amount && Number(r.myQuotation.amount) > 0);
              return (
                <div className="rounded-xl border border-border p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {formatEnquiryCode(r, i)}
                      </span>
                      {type === "guest" && (
                        <span className="rounded px-1.5 py-0.2 text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                          Guest
                        </span>
                      )}
                      {type === "general" && (
                        <span className="rounded px-1.5 py-0.2 text-[10px] font-bold bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20">
                          General RFQ
                        </span>
                      )}
                      {type === "b2b" && (
                        <span className="rounded px-1.5 py-0.2 text-[10px] font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
                          B2B Member
                        </span>
                      )}
                    </div>
                    {type === "b2b" && isQuoted ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Quoted ₹{Number(r.myQuotation.amount).toLocaleString("en-IN")}
                      </span>
                    ) : (
                      <StatusBadge status={r.leadStatus || r.status || "New"} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {r.title || r.enquiry?.title || "Requirement"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {buyerName} · {type === "guest" ? "Guest Customer" : type === "general" ? "General Buyer" : (r.requesterRole || "Buyer")}
                    </p>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Qty: {r.quantity || r.enquiry?.quantity || "On request"}</span>
                    <span>Date: {formatDate(r.requiredBy || r.enquiry?.requiredBy)}</span>
                  </div>
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                    {type === "guest" || type === "general" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => handleOpenDialog(r)}
                      >
                        View Details
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant={isQuoted ? "outline" : "default"}
                          className="h-7 text-xs"
                          onClick={() => handleOpenDialog(r)}
                        >
                          {isQuoted ? "View Details" : "View & Quote"}
                        </Button>
                        {isQuoted ? (
                          <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                            <Link href={buyerId ? `/biz/messages?userId=${buyerId}&name=${encodeURIComponent(buyerName)}` : "/biz/messages"}>
                              <MessageSquare className="mr-1 h-3.5 w-3.5" /> Message
                            </Link>
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled className="h-7 text-xs opacity-50 cursor-not-allowed pointer-events-none">
                            <Lock className="mr-1 h-3 w-3 text-muted-foreground" /> Message
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            }}
          />
        </Panel>

        {/* Enquiry Details & Quotation Modal */}
        <Dialog open={Boolean(selectedEnquiry)} onOpenChange={(open) => !open && setSelectedEnquiry(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {(() => {
              const enqType = getEnquiryType(selectedEnquiry);
              const guestEmail = selectedEnquiry?.guestEmail || selectedEnquiry?.enquiry?.guestEmail || (enqType !== "b2b" ? selectedEnquiry?.requester?.email : "");
              const guestPhone = selectedEnquiry?.guestPhone || selectedEnquiry?.enquiry?.guestPhone || (enqType !== "b2b" ? selectedEnquiry?.requester?.phone : "");

              return (
                <>
                  <DialogHeader>
                    <div className="flex items-center justify-between pr-6">
                      <DialogTitle className="text-xl font-bold text-foreground">
                        {selectedEnquiry?.title || selectedEnquiry?.enquiry?.title || "Sourcing Enquiry"}
                      </DialogTitle>
                      {enqType === "b2b" && Boolean(selectedEnquiry?.myQuotation?.amount && Number(selectedEnquiry.myQuotation.amount) > 0) ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Quoted
                        </span>
                      ) : (
                        <StatusBadge status={selectedEnquiry?.leadStatus || selectedEnquiry?.status || "New"} />
                      )}
                    </div>
                    <DialogDescription>
                      Reference: <span className="font-semibold text-foreground">{formatEnquiryCode(selectedEnquiry, 0)}</span> · {selectedEnquiry?.category || selectedEnquiry?.enquiry?.category || "General"}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 pt-2">
                    {/* Requester Profile Card */}
                    <div className="rounded-xl border border-border bg-surface-raised p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "grid h-10 w-10 place-items-center rounded-full font-bold",
                          enqType === "guest" ? "bg-amber-500/10 text-amber-700 dark:text-amber-400" :
                          enqType === "general" ? "bg-sky-500/10 text-sky-700 dark:text-sky-400" :
                          "bg-primary/10 text-primary"
                        )}>
                          {(selectedEnquiry?.buyerName || selectedEnquiry?.requesterName || selectedEnquiry?.guestName || "B").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-foreground">
                              {selectedEnquiry?.buyerName || selectedEnquiry?.requesterName || selectedEnquiry?.guestName || "Customer"}
                            </p>
                            <span className={cn(
                              "rounded px-2 py-0.5 text-[10px] font-bold border",
                              enqType === "guest" ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20" :
                              enqType === "general" ? "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20" :
                              "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20"
                            )}>
                              {enqType === "guest" ? "Guest Customer (Profile Enquiry)" :
                               enqType === "general" ? "General Buyer (Home RFQ)" :
                               "Verified B2B Member"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Delivery Location: {selectedEnquiry?.location || selectedEnquiry?.city || "To be confirmed"}
                          </p>
                        </div>
                      </div>

                      {/* GUEST CONTACT DETAILS (Phone & Email) for Direct Outreach */}
                      {(enqType === "guest" || enqType === "general") && (
                        <div className="rounded-lg border border-border/80 bg-surface p-3 space-y-2">
                          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-primary" />
                            Direct Contact Information
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-2 rounded-md bg-muted/40 p-2">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <div className="min-w-0 flex-1">
                                <span className="text-[10px] text-muted-foreground block">Phone / WhatsApp</span>
                                {guestPhone ? (
                                  <a
                                    href={`tel:${guestPhone}`}
                                    className="font-semibold text-primary hover:underline"
                                  >
                                    {guestPhone}
                                  </a>
                                ) : (
                                  <span className="text-muted-foreground italic">Not provided</span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 rounded-md bg-muted/40 p-2">
                              <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <div className="min-w-0 flex-1">
                                <span className="text-[10px] text-muted-foreground block">Email Address</span>
                                {guestEmail ? (
                                  <a
                                    href={`mailto:${guestEmail}`}
                                    className="font-semibold text-primary hover:underline truncate block"
                                  >
                                    {guestEmail}
                                  </a>
                                ) : (
                                  <span className="text-muted-foreground italic">Not provided</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Specifications Grid */}
                    <div className="grid grid-cols-2 gap-3 rounded-xl border border-border p-3.5 text-xs sm:grid-cols-4">
                      <div>
                        <span className="text-muted-foreground">Quantity</span>
                        <p className="font-semibold text-foreground">{selectedEnquiry?.quantity || selectedEnquiry?.enquiry?.quantity || "On request"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Target Budget</span>
                        <p className="font-semibold text-foreground">{selectedEnquiry?.budget || selectedEnquiry?.enquiry?.budget || "Market standard"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Required By</span>
                        <p className="font-semibold text-foreground">{formatDate(selectedEnquiry?.requiredBy || selectedEnquiry?.enquiry?.requiredBy)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Delivery Location</span>
                        <p className="font-semibold text-foreground">{selectedEnquiry?.location || selectedEnquiry?.enquiry?.location || selectedEnquiry?.city || "To be confirmed"}</p>
                      </div>
                    </div>

                    {/* Description / Requirements */}
                    <div className="rounded-xl border border-border p-4 text-xs">
                      <span className="font-semibold text-foreground text-sm block mb-1.5">Requirement & Specifications:</span>
                      <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {selectedEnquiry?.description || selectedEnquiry?.enquiry?.description || "No additional description provided."}
                      </p>
                    </div>

                    {/* Quotation Management Section: ONLY FOR B2B */}
                    {enqType === "b2b" ? (
                      <div className="rounded-xl border border-border p-4 space-y-3 bg-surface">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            Official B2B Quotation
                          </h4>
                          {Boolean(selectedEnquiry?.myQuotation?.amount && Number(selectedEnquiry.myQuotation.amount) > 0) ? (
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Quote Sent
                            </span>
                          ) : selectedEnquiry?.leadStatus === "In Progress" || selectedEnquiry?.status === "In Progress" ? (
                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                              <Check className="h-3.5 w-3.5" /> Requirement Accepted
                            </span>
                          ) : null}
                        </div>

                        {Boolean(selectedEnquiry?.myQuotation?.amount && Number(selectedEnquiry.myQuotation.amount) > 0) ? (
                          /* Already Quoted State */
                          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-xs text-muted-foreground font-medium">Your Submitted Quote</span>
                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                  ₹{Number(selectedEnquiry.myQuotation.amount).toLocaleString("en-IN")}
                                </p>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {selectedEnquiry.myQuotation.submittedAt ? formatDate(selectedEnquiry.myQuotation.submittedAt) : "Submitted"}
                              </span>
                            </div>

                            {selectedEnquiry.myQuotation.notes && (
                              <div className="text-xs text-muted-foreground border-t border-emerald-500/10 pt-2">
                                <span className="font-semibold text-foreground">Delivery Terms & Notes: </span>
                                {selectedEnquiry.myQuotation.notes}
                              </div>
                            )}

                            <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-emerald-500/10">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadQuotePDF(selectedEnquiry)}
                                className="text-xs h-8 gap-1.5 border-emerald-300 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-300"
                              >
                                <Download className="h-3.5 w-3.5" /> Download Official Quote PDF
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setQuoteAmount(selectedEnquiry.myQuotation.amount);
                                  setQuoteNotes(selectedEnquiry.myQuotation.notes || "");
                                  setShowQuoteForm(true);
                                }}
                                className="text-xs h-8"
                              >
                                Edit Quotation
                              </Button>

                              <div className="ml-auto flex items-center gap-1.5">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateStatus("Won")}
                                  className="text-xs h-8 text-emerald-700 hover:bg-emerald-50"
                                >
                                  Mark Deal Won
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Acceptance and Quote Form */
                          <div className="space-y-3">
                            {!showQuoteForm && (
                              <div className="flex flex-wrap items-center gap-2.5">
                                {selectedEnquiry?.leadStatus !== "In Progress" && selectedEnquiry?.status !== "In Progress" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleAcceptRequirement}
                                    disabled={updatingStatus}
                                    className="gap-1.5"
                                  >
                                    <Check className="h-4 w-4" />
                                    {updatingStatus ? "Accepting..." : "Accept Requirement"}
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  onClick={() => setShowQuoteForm(true)}
                                  className="gap-1.5"
                                >
                                  <Send className="h-4 w-4" /> Send Quotation
                                </Button>
                              </div>
                            )}

                            {showQuoteForm && (
                              <form onSubmit={handleSubmitQuotation} className="space-y-3 pt-2">
                                <div>
                                  <label className="block text-xs font-semibold text-foreground mb-1">
                                    Quotation Amount (₹) <span className="text-destructive">*</span>
                                  </label>
                                  <div className="relative">
                                    <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <input
                                      type="number"
                                      required
                                      min="1"
                                      step="any"
                                      placeholder="e.g. 25000"
                                      value={quoteAmount}
                                      onChange={(e) => setQuoteAmount(e.target.value)}
                                      className="w-full rounded-lg border border-border bg-surface pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-semibold text-foreground mb-1">
                                    Delivery Timeline & Terms / Notes
                                  </label>
                                  <textarea
                                    rows={3}
                                    placeholder="e.g. Includes GST. Ready for dispatch within 3 days. Standard 1-year warranty included."
                                    value={quoteNotes}
                                    onChange={(e) => setQuoteNotes(e.target.value)}
                                    className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                                  />
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                  <Button type="submit" size="sm" disabled={submittingQuote}>
                                    <Send className="mr-1.5 h-3.5 w-3.5" />
                                    {submittingQuote ? "Sending Quote..." : "Submit Official Quotation"}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowQuoteForm(false)}
                                    disabled={submittingQuote}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </form>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-border p-3.5 bg-surface-raised flex items-start gap-2.5 text-xs text-muted-foreground">
                        <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-foreground block">
                            {enqType === "guest" ? "Direct Guest Customer Requirement" : "General Chamber RFQ Broadcast"}
                          </span>
                          <span>
                            Official in-platform quotations and chat messaging are reserved for registered B2B chamber members. Please connect directly with this prospective buyer using their phone number or email provided in the contact box above.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
                      <Button variant="outline" onClick={() => setSelectedEnquiry(null)}>
                        Close
                      </Button>
                      {/* ONLY FOR B2B: Message / Negotiate Deal button */}
                      {enqType === "b2b" && (() => {
                        const bId = selectedEnquiry?.requester?._id || selectedEnquiry?.requester || selectedEnquiry?.enquiry?.requester?._id || selectedEnquiry?.enquiry?.requester || "";
                        const bName = selectedEnquiry?.buyerName || selectedEnquiry?.requesterName || "Requester";
                        const isQuoted = Boolean(selectedEnquiry?.myQuotation?.amount && Number(selectedEnquiry.myQuotation.amount) > 0);

                        if (!isQuoted) {
                          return (
                            <Button disabled variant="outline" className="opacity-50 cursor-not-allowed pointer-events-none">
                              <Lock className="mr-1.5 h-4 w-4 text-muted-foreground" /> Message / Negotiate Deal
                            </Button>
                          );
                        }

                        return (
                          <Button asChild>
                            <Link href={bId ? `/biz/messages?userId=${bId}&name=${encodeURIComponent(bName)}` : "/biz/messages"}>
                              <MessageSquare className="mr-1.5 h-4 w-4" /> Message / Negotiate Deal
                            </Link>
                          </Button>
                        );
                      })()}
                    </div>
                  </div>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}

export default BizEnquiries;
