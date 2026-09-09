"use client";
import { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { StatusBadge } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@shared/components/ui/dialog";
import { useBusinessEnquiries } from "@shared/hooks/use-rifah-api";
import { leadApi } from "@shared/lib/api-services";

function formatEnquiryCode(item, index = 0) {
  if (!item) return "ENQ";
  if (item.referenceId) return item.referenceId;
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

function handleExportList(enquiries) {
  if (!enquiries || enquiries.length === 0) {
    toast.error("No enquiries to export");
    return;
  }

  const headers = ["Enquiry ID", "Requirement", "Buyer", "Quantity", "Budget", "Required By", "Status"];
  const rows = enquiries.map((r, i) => [
    `"${formatEnquiryCode(r, i)}"`,
    `"${(r.title || r.enquiry?.title || "Requirement").replace(/"/g, '""')}"`,
    `"${(r.requesterName || r.requester?.name || r.buyerName || "Customer").replace(/"/g, '""')}"`,
    `"${r.quantity || r.enquiry?.quantity || "On request"}"`,
    `"${r.budget || "Market standard"}"`,
    `"${formatDate(r.requiredBy || r.enquiry?.requiredBy)}"`,
    `"${r.leadStatus || r.status || "New"}"`,
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

function BizEnquiries() {
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [quoteAmount, setQuoteAmount] = useState("");
  const [quoteNotes, setQuoteNotes] = useState("");
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  const { data: enquiriesData, isLoading, refetch } = useBusinessEnquiries();
  const rows = Array.isArray(enquiriesData) ? enquiriesData : enquiriesData?.enquiries || [];

  const handleOpenDialog = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setQuoteAmount("");
    setQuoteNotes("");
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
      }));
      toast.success("Requirement accepted! You can now submit your official quotation.");
      refetch();
    } catch (err) {
      toast.error(err?.message || "Failed to accept requirement");
    } finally {
      setUpdatingStatus(false);
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
      toast.error("Lead tracking reference not found for this enquiry");
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
        myQuotation: updatedQuote,
      }));

      setShowQuoteForm(false);
      setQuoteAmount("");
      setQuoteNotes("");
      toast.success("Official quotation submitted! Generated PDF document delivered to buyer's message box.");
      refetch();
    } catch (err) {
      toast.error(err?.message || "Failed to submit quotation");
    } finally {
      setSubmittingQuote(false);
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
          onClick={() => handleExportList(rows)}
          disabled={rows.length === 0}
        >
          <Download className="h-4 w-4" />
          Export list
        </Button>
      }
    >
      <Panel>
        <ResponsiveTable
          rows={rows}
          empty={
            <EmptyState
              icon={MessageSquare}
              title="No enquiries received yet"
              description="When chamber members or buyers post sourcing requirements or send direct RFQs, they will appear here."
            />
          }
          columns={[
            {
              key: "enquiry",
              header: "ENQUIRY",
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
                  <span className="font-medium text-foreground block">
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
                    {r.requesterName || r.requester?.name || r.buyerName || "Customer"}
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
                if (r.leadStatus === "In Progress") {
                  return (
                    <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-400">
                      Accepted
                    </span>
                  );
                }
                return <StatusBadge status={r.status || "New"} />;
              },
            },
            {
              key: "action",
              header: "ACTION",
              cell: (r) => {
                const buyerId = r.requester?._id || r.requester || r.enquiry?.requester?._id || r.enquiry?.requester || "";
                const buyerName = r.requesterName || r.requester?.name || r.buyerName || "Requester";
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
                    <Button asChild size="sm" variant="outline" className="h-8 text-xs font-semibold">
                      <Link href={buyerId ? `/biz/messages?userId=${buyerId}&name=${encodeURIComponent(buyerName)}` : "/biz/messages"}>
                        <MessageSquare className="mr-1 h-3.5 w-3.5" /> Message
                      </Link>
                    </Button>
                  </div>
                );
              },
            },
          ]}
          mobile={(r, i) => {
            const buyerId = r.requester?._id || r.requester || r.enquiry?.requester?._id || r.enquiry?.requester || "";
            const buyerName = r.requesterName || r.requester?.name || r.buyerName || "Requester";
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
                    <StatusBadge status={r.status || "New"} />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {r.title || r.enquiry?.title || "Requirement"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {r.requesterName || r.requester?.name || r.buyerName || "Customer"} · {r.requesterRole || "Buyer"}
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
                  <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                    <Link href={buyerId ? `/biz/messages?userId=${buyerId}&name=${encodeURIComponent(buyerName)}` : "/biz/messages"}>
                      <MessageSquare className="mr-1 h-3.5 w-3.5" /> Message
                    </Link>
                  </Button>
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
                <StatusBadge status={selectedEnquiry?.status || "New"} />
              )}
            </div>
            <DialogDescription>
              Reference: <span className="font-semibold text-foreground">{formatEnquiryCode(selectedEnquiry, 0)}</span> · {selectedEnquiry?.category || selectedEnquiry?.enquiry?.category || "General"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Requester Profile Card */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-border bg-surface-raised p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 font-bold text-primary">
                  {(selectedEnquiry?.requesterName || selectedEnquiry?.requester?.name || selectedEnquiry?.buyerName || "B").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {selectedEnquiry?.requesterName || selectedEnquiry?.requester?.name || selectedEnquiry?.buyerName || "Customer"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedEnquiry?.requesterRole || (selectedEnquiry?.targetType === "business" ? "Business Member" : "Verified Customer")} · {selectedEnquiry?.location || selectedEnquiry?.city || selectedEnquiry?.requester?.email || "Chamber Network"}
                  </p>
                </div>
              </div>
              {(() => {
                const bId = selectedEnquiry?.requester?._id || selectedEnquiry?.requester || selectedEnquiry?.enquiry?.requester?._id || selectedEnquiry?.enquiry?.requester || "";
                const bName = selectedEnquiry?.requesterName || selectedEnquiry?.requester?.name || selectedEnquiry?.buyerName || "Requester";
                return (
                  <Button asChild size="sm" variant="outline">
                    <Link href={bId ? `/biz/messages?userId=${bId}&name=${encodeURIComponent(bName)}` : "/biz/messages"}>
                      <MessageSquare className="mr-1.5 h-4 w-4" /> Chat With Requester
                    </Link>
                  </Button>
                );
              })()}
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
                ) : selectedEnquiry?.leadStatus === "In Progress" ? (
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Requirement Accepted
                  </span>
                ) : null}
              </div>

              {Boolean(selectedEnquiry?.myQuotation?.amount && Number(selectedEnquiry.myQuotation.amount) > 0) ? (
                /* Already Quoted State */
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground">Your Submitted Quote</span>
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{Number(selectedEnquiry?.myQuotation?.amount || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {selectedEnquiry?.myQuotation?.submittedAt ? new Date(selectedEnquiry.myQuotation.submittedAt).toLocaleDateString() : "Submitted"}
                    </span>
                  </div>
                  {selectedEnquiry?.myQuotation?.notes && (
                    <div className="text-xs text-muted-foreground border-t border-emerald-500/10 pt-2">
                      <span className="font-medium text-foreground">Terms & Notes: </span>
                      {selectedEnquiry.myQuotation.notes}
                    </div>
                  )}
                  <p className="text-[11px] text-muted-foreground">
                    An official PDF quotation was generated and delivered straight to the buyer's message box.
                  </p>
                </div>
              ) : (
                /* Acceptance and Quote Form */
                <div className="space-y-3">
                  {!showQuoteForm && (
                    <div className="flex flex-wrap items-center gap-2.5">
                      {selectedEnquiry?.leadStatus !== "In Progress" && (
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
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" onClick={() => setSelectedEnquiry(null)}>
                Close
              </Button>
              {(() => {
                const bId = selectedEnquiry?.requester?._id || selectedEnquiry?.requester || selectedEnquiry?.enquiry?.requester?._id || selectedEnquiry?.enquiry?.requester || "";
                const bName = selectedEnquiry?.requesterName || selectedEnquiry?.requester?.name || selectedEnquiry?.buyerName || "Requester";
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
    </AppShell>
  );
}

export { BizEnquiries };
export default BizEnquiries;
