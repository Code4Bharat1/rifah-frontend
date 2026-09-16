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

function resolveCustomerName(r) {
  if (!r) return "Customer";
  const candidates = [
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
      });
    });

    // 2. Add / merge leads
    rawLeads.forEach((lead) => {
      const enqId = lead.enquiry?._id ? String(lead.enquiry._id) : (lead.enquiry ? String(lead.enquiry) : null);
      const buyerName = resolveCustomerName(lead.enquiry || lead);
      const hasQuote = Boolean(lead.quotation?.amount);

      if (enqId && map.has(enqId)) {
        const existing = map.get(enqId);
        map.set(enqId, {
          ...existing,
          leadId: lead._id,
          businessId: lead.business?._id || lead.business,
          leadStatus: hasQuote ? (lead.status || "Responded") : (lead.status || existing.leadStatus || "New"),
          myQuotation: hasQuote ? lead.quotation : existing.myQuotation,
          priority: lead.priority || existing.priority || "Standard",
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
          targetType: "chamber",
          requesterName: buyerName,
          buyerName,
          requesterRole: "Verified Customer",
          requester: lead.enquiry?.requester || null,
          status: lead.status || "New",
          leadStatus: hasQuote ? (lead.status || "Responded") : (lead.status || "New"),
          myQuotation: hasQuote ? lead.quotation : null,
          priority: lead.priority || "Standard",
          createdAt: lead.createdAt,
        });
      }
    });

    return Array.from(map.values());
  }, [enquiriesData, leadsData]);

  // Dynamic filter tabs
  const filteredRows = useMemo(() => {
    let rows = allRows;

    // 1. Tab stage filtering
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

    // 2. Search keyword filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      rows = rows.filter((r) => {
        return (
          (r.title || "").toLowerCase().includes(q) ||
          (r.referenceId || "").toLowerCase().includes(q) ||
          (r.buyerName || "").toLowerCase().includes(q) ||
          (r.requesterName || "").toLowerCase().includes(q) ||
          (r.location || r.city || "").toLowerCase().includes(q) ||
          (r.category || "").toLowerCase().includes(q) ||
          (r.description || "").toLowerCase().includes(q)
        );
      });
    }

    return rows;
  }, [allRows, tab, searchQuery]);

  // Stat metrics
  const totalCount = allRows.length;
  const newCount = allRows.filter((r) => (r.leadStatus || r.status || "New").toLowerCase() === "new").length;
  const inProgressCount = allRows.filter((r) => (r.leadStatus || r.status || "").toLowerCase().includes("progress")).length;
  const respondedCount = allRows.filter((r) => (r.leadStatus || r.status || "").toLowerCase() === "responded" || Boolean(r.myQuotation?.amount)).length;
  const responseRate = totalCount > 0 ? `${Math.round((respondedCount / totalCount) * 100)}%` : "0%";

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

        {/* Search Bar on Left */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative w-full max-w-sm sm:max-w-md">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search requirements, buyers, reference code, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-border bg-surface pl-10 pr-9 py-2 text-xs sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground p-0.5"
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {tab !== "All" && (
            <button
              type="button"
              onClick={() => setTab("All")}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              <span>Showing: {tab}</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px]">✕ Show All</span>
            </button>
          )}
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
                cell: (r, i) => (
                  <div>
                    <span className="font-semibold text-foreground block">
                      {formatEnquiryCode(r, i)}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {r.targetType === "business" ? "Direct" : r.targetType === "chamber" ? (r.chapter || "Chamber") : "Pan-Chamber"}
                    </span>
                  </div>
                ),
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
                cell: (r) => (
                  <div>
                    <span className="font-medium text-foreground block">
                      {r.buyerName || r.requesterName || "Customer"}
                    </span>
                    {Boolean(r.requesterRole || r.location) && (
                      <span className="text-xs text-muted-foreground block">
                        {r.requesterRole || (r.targetType === "business" ? "Business Member" : "Buyer")} {r.location ? `· ${r.location}` : ""}
                      </span>
                    )}
                  </div>
                ),
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
                  return <StatusBadge status={r.leadStatus || r.status || "New"} />;
                },
              },
              {
                key: "action",
                header: "ACTION",
                cell: (r) => {
                  const buyerId = r.requester?._id || r.requester || r.enquiry?.requester?._id || r.enquiry?.requester || "";
                  const buyerName = r.buyerName || r.requesterName || "Requester";
                  const isQuoted = Boolean(r.myQuotation?.amount && Number(r.myQuotation.amount) > 0);
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
              const buyerId = r.requester?._id || r.requester || r.enquiry?.requester?._id || r.enquiry?.requester || "";
              const buyerName = r.buyerName || r.requesterName || "Requester";
              const isQuoted = Boolean(r.myQuotation?.amount && Number(r.myQuotation.amount) > 0);
              return (
                <div className="rounded-xl border border-border p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {formatEnquiryCode(r, i)}
                    </span>
                    {isQuoted ? (
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
                      {buyerName} · {r.requesterRole || "Buyer"}
                    </p>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Qty: {r.quantity || r.enquiry?.quantity || "On request"}</span>
                    <span>Date: {formatDate(r.requiredBy || r.enquiry?.requiredBy)}</span>
                  </div>
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
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
                  </div>
                </div>
              );
            }}
          />
        </Panel>

        {/* Enquiry Details & Quotation Modal */}
        <Dialog open={Boolean(selectedEnquiry)} onOpenChange={(open) => !open && setSelectedEnquiry(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between pr-6">
                <DialogTitle className="text-xl font-bold text-foreground">
                  {selectedEnquiry?.title || selectedEnquiry?.enquiry?.title || "Sourcing Enquiry"}
                </DialogTitle>
                {Boolean(selectedEnquiry?.myQuotation?.amount && Number(selectedEnquiry.myQuotation.amount) > 0) ? (
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
              <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-raised p-4">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 font-bold text-primary">
                  {(selectedEnquiry?.buyerName || selectedEnquiry?.requesterName || "B").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {selectedEnquiry?.buyerName || selectedEnquiry?.requesterName || "Customer"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedEnquiry?.requesterRole || (selectedEnquiry?.targetType === "business" ? "Business Member" : "Verified Customer")} · {selectedEnquiry?.location || selectedEnquiry?.city || selectedEnquiry?.requester?.email || "Chamber Network"}
                  </p>
                </div>
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

              {/* B2B Quotation Management Section */}
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

              {/* Footer Actions */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
                <Button variant="outline" onClick={() => setSelectedEnquiry(null)}>
                  Close
                </Button>
                {(() => {
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
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}

export default BizEnquiries;
