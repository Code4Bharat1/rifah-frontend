"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileStack,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  MapPin,
  IndianRupee,
  FileText,
  Download,
  MessageSquare,
  Search,
  ExternalLink,
  ChevronRight,
  Eye,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@shared/components/ui/dialog";
import { enquiryApi, leadApi } from "@shared/lib/api-services";
import { useAuth } from "@shared/providers/auth-provider";
import { toast } from "sonner";
import { resolveMediaUrl } from "@shared/lib/api-client";

export function CustomerEnquiries() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [quoteDetails, setQuoteDetails] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await enquiryApi.getMyEnquiries({ limit: 100 });
      const list = Array.isArray(res) ? res : res?.data || res?.enquiries || [];
      setEnquiries(list);
    } catch (err) {
      console.error("Failed to fetch customer enquiries:", err);
      toast.error(err?.message || "Could not load enquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?role=customer&redirect=${encodeURIComponent("/customer/enquiries")}`);
      return;
    }
    if (user) {
      fetchEnquiries();
    }
  }, [user, authLoading]);

  // Filter enquiries
  const filteredEnquiries = enquiries.filter((e) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      e.title?.toLowerCase().includes(q) ||
      e.referenceId?.toLowerCase().includes(q) ||
      e.targetBusiness?.name?.toLowerCase().includes(q) ||
      e.category?.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (selectedStatus === "all") return true;
    if (selectedStatus === "quoted") {
      return (
        e.quotes?.length > 0 ||
        e.latestQuote ||
        e.status === "Responded" ||
        e.status === "Won"
      );
    }
    if (selectedStatus === "accepted") {
      return e.hasAccepted && !e.latestQuote;
    }
    if (selectedStatus === "pending") {
      return !e.hasAccepted && !e.latestQuote && e.status !== "Closed";
    }
    return true;
  });

  const openQuotationModal = async (enquiry) => {
    setSelectedEnquiry(enquiry);
    setLoadingQuotes(true);
    try {
      const leadsRes = await leadApi.getEnquiryResponses(enquiry._id);
      const leads = Array.isArray(leadsRes) ? leadsRes : leadsRes?.data || [];
      setQuoteDetails(leads);
    } catch (err) {
      console.warn("Could not fetch extra quote leads:", err?.message);
      setQuoteDetails(enquiry.quotes || (enquiry.latestQuote ? [{ quotation: enquiry.latestQuote }] : []));
    } finally {
      setLoadingQuotes(false);
    }
  };

  return (
    <AppShell
      role="customer"
      title="My Enquiries"
      subtitle="Track your submitted requirements and review received business quotations"
    >
      <div className="space-y-5">
        {/* Filter & Search Bar */}
        <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search enquiries by title, reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-xl border-border text-xs"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchEnquiries}
              className="h-10 rounded-xl text-xs gap-1.5 self-end sm:self-auto"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {[
              { id: "all", label: "All Enquiries" },
              { id: "pending", label: "Pending Review" },
              { id: "accepted", label: "Accepted by Business" },
              { id: "quoted", label: "Quotation Received" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                  selectedStatus === tab.id
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Enquiries List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-muted/40 animate-pulse border border-border/60" />
            ))}
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card">
            <FileStack className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-semibold text-foreground">No enquiries found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              You haven&apos;t submitted any enquiries in this category yet. Visit the Discover tab to find businesses and request quotes.
            </p>
            <div className="mt-4">
              <Link
                href="/customer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
              >
                <Search className="h-3.5 w-3.5" />
                Discover Businesses
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredEnquiries.map((e) => {
              const hasQuote = Boolean(e.latestQuote?.amount || e.quotes?.length > 0);
              const quoteAmount = e.latestQuote?.amount || e.quotes?.[0]?.amount;
              const formattedPrice = quoteAmount
                ? !isNaN(Number(quoteAmount))
                  ? Number(quoteAmount).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
                  : `₹${quoteAmount}`
                : null;

              return (
                <div
                  key={e._id}
                  className="rounded-2xl border border-border bg-card p-4 sm:p-5 hover:border-emerald-500/30 hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 min-w-0 flex-1">
                    {/* Top Row: Ref ID + Status Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11px] font-semibold text-muted-foreground px-2 py-0.5 rounded bg-muted/70">
                        {e.referenceId || "ENQ-REQ"}
                      </span>

                      {hasQuote ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Quotation Received
                        </span>
                      ) : e.hasAccepted || e.status === "In Progress" || e.status === "Accepted" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 bg-sky-50 border border-sky-200/60 px-2 py-0.5 rounded-full">
                          <Clock className="h-3 w-3" /> Accepted by Business
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
                          <Clock className="h-3 w-3" /> Pending Review
                        </span>
                      )}

                      <span className="text-[11px] text-muted-foreground">
                        {new Date(e.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-sm sm:text-base text-foreground truncate">
                      {e.title}
                    </h3>

                    {/* Meta Details */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      {e.targetBusiness?.name && (
                        <span className="inline-flex items-center gap-1 font-medium text-foreground">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          {e.targetBusiness.name}
                        </span>
                      )}
                      {e.quantity && <span>Qty: <strong>{e.quantity}</strong></span>}
                      {e.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {e.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Section: Price & Actions */}
                  <div className="flex items-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-border/60 justify-between md:justify-end">
                    {hasQuote && (
                      <div className="text-right">
                        <span className="block text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                          Official Quote
                        </span>
                        <span className="block text-base sm:text-lg font-black text-emerald-600 tracking-tight">
                          {formattedPrice}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => openQuotationModal(e)}
                        variant={hasQuote ? "default" : "outline"}
                        className={`h-9 rounded-xl text-xs font-semibold ${
                          hasQuote
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                            : ""
                        }`}
                      >
                        {hasQuote ? (
                          <>
                            <Sparkles className="h-3.5 w-3.5 mr-1" />
                            View Quote
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Details
                          </>
                        )}
                      </Button>

                      {e.targetBusiness?.owner && (
                        <Link
                          href={`/customer/messages?userId=${e.targetBusiness.owner}`}
                          className="h-9 w-9 rounded-xl border border-border bg-background hover:bg-muted text-foreground flex items-center justify-center transition-colors"
                          title="Message Supplier"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quotation & Enquiry Details Modal */}
      <Dialog open={Boolean(selectedEnquiry)} onOpenChange={(open) => !open && setSelectedEnquiry(null)}>
        <DialogContent className="max-w-lg rounded-2xl p-0 overflow-hidden border-border bg-card">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

          <div className="p-6 space-y-4">
            <DialogHeader className="text-left space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-muted-foreground px-2 py-0.5 rounded bg-muted">
                  {selectedEnquiry?.referenceId}
                </span>
                <span className="text-xs text-muted-foreground">
                  {selectedEnquiry?.createdAt ? new Date(selectedEnquiry.createdAt).toLocaleDateString() : ""}
                </span>
              </div>
              <DialogTitle className="text-base font-bold text-foreground">
                {selectedEnquiry?.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Target Business: <strong className="text-foreground">{selectedEnquiry?.targetBusiness?.name || "Member Business"}</strong>
              </DialogDescription>
            </DialogHeader>

            {/* Requirement Details Box */}
            <div className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Quantity</span>
                  <span className="font-semibold text-foreground">{selectedEnquiry?.quantity || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Required By</span>
                  <span className="font-semibold text-foreground">{selectedEnquiry?.requiredBy || "Within 1 week"}</span>
                </div>
              </div>

              {selectedEnquiry?.description && (
                <div className="pt-2 border-t border-border/60">
                  <span className="text-muted-foreground block text-[11px] mb-0.5">Your Requirements Notes</span>
                  <p className="text-foreground leading-relaxed">{selectedEnquiry.description}</p>
                </div>
              )}
            </div>

            {/* Quotation Section */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <IndianRupee className="h-3.5 w-3.5 text-emerald-600" /> Supplier Quotation
              </h4>

              {selectedEnquiry?.latestQuote || (quoteDetails && quoteDetails.length > 0) ? (
                <div className="space-y-3">
                  {(quoteDetails.length > 0 ? quoteDetails : [selectedEnquiry.latestQuote]).map((q, idx) => {
                    const quote = q?.quotation || q;
                    const rawAmount = quote?.amount;
                    const formatted = !isNaN(Number(rawAmount))
                      ? Number(rawAmount).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
                      : `₹${rawAmount}`;

                    return (
                      <div
                        key={idx}
                        className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/30 p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                              Quoted Price
                            </span>
                            <span className="text-2xl font-black text-emerald-600 tracking-tight">
                              {formatted}
                            </span>
                          </div>

                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Verified Quote
                          </span>
                        </div>

                        {quote?.notes && (
                          <div className="p-2.5 rounded-xl bg-white border border-emerald-200/50 text-xs text-slate-700">
                            <span className="font-semibold block text-[11px] text-slate-500 mb-0.5">Supplier Notes & Terms</span>
                            <p className="whitespace-pre-line leading-relaxed">{quote.notes}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-1">
                          {selectedEnquiry?.targetBusiness?.owner && (
                            <Link
                              href={`/customer/messages?userId=${selectedEnquiry.targetBusiness.owner}`}
                              className="flex-1 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                              Chat with Supplier
                            </Link>
                          )}

                          <Button
                            variant="outline"
                            onClick={() => {
                              toast.info("Official quotation details confirmed. Connect with supplier in messages.");
                            }}
                            className="h-9 rounded-xl text-xs"
                          >
                            Accept Quote
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-5 text-center bg-muted/10">
                  <Clock className="h-6 w-6 text-muted-foreground mx-auto mb-1.5 opacity-60" />
                  <p className="text-xs font-medium text-foreground">Awaiting quotation from supplier</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {selectedEnquiry?.hasAccepted
                      ? "The supplier has accepted your enquiry and is preparing your price quote."
                      : "The supplier has received your requirement and will review it shortly."}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="ghost"
                onClick={() => setSelectedEnquiry(null)}
                className="h-8 rounded-xl text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
export default CustomerEnquiries;
