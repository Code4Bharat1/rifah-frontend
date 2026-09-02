"use client";
import Link from "next/link";
import { Filter, Target, Loader2, Send, CheckCircle2, Clock, MapPin, Building2, User, Check, Sparkles } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill, StatusBadge } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Textarea } from "@shared/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@shared/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@shared/components/ui/sheet";
import { useMyLeads } from "@shared/hooks/use-rifah-api";
import { leadApi } from "@shared/lib/api-services";

const stages = ["All", "New", "In Progress", "Responded", "Won", "Closed"];

function LeadsPage() {
  const [stage, setStage] = useState("All");
  const [openLead, setOpenLead] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState("");
  const [quoteNotes, setQuoteNotes] = useState("");
  const [submittingQuote, setSubmittingQuote] = useState(false);

  // Dynamic filter states
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterSearch, setFilterSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Overall leads query for dynamic top bar stats
  const { data: allLeadsData, refetch: refetchAll } = useMyLeads();
  // Filtered leads query for the table
  const { data: leadsData, refetch: refetchFiltered } = useMyLeads({
    status: stage === "All" ? undefined : stage,
  });

  const allLeads = Array.isArray(allLeadsData) ? allLeadsData : allLeadsData?.leads || [];
  let rawRows = Array.isArray(leadsData) ? leadsData : leadsData?.leads || [];

  // Apply Priority Filter
  if (filterPriority !== "All") {
    rawRows = rawRows.filter(
      (r) => (r.priority || r.enquiry?.priority || "Standard").toLowerCase() === filterPriority.toLowerCase()
    );
  }

  // Apply Search Keyword Filter
  if (filterSearch.trim()) {
    const q = filterSearch.toLowerCase().trim();
    rawRows = rawRows.filter(
      (r) =>
        (r.enquiry?.title || r.title || "").toLowerCase().includes(q) ||
        (r.enquiry?.buyerName || r.buyerName || "").toLowerCase().includes(q) ||
        (r.enquiry?.city || r.city || "").toLowerCase().includes(q) ||
        (r.refCode || "").toLowerCase().includes(q)
    );
  }

  // Apply Sorting
  if (sortBy === "oldest") {
    rawRows = [...rawRows].reverse();
  }

  const rows = rawRows;

  // Dynamic stat counts directly from backend API
  const newCount = String(allLeads.filter((l) => l.status === "New").length);
  const inProgressCount = String(allLeads.filter((l) => l.status === "In Progress").length);
  const wonCount = String(allLeads.filter((l) => l.status === "Won").length);
  const respondedCount = allLeads.filter((l) => ["Responded", "Won"].includes(l.status)).length;
  const responseRate = allLeads.length > 0 ? `${Math.round((respondedCount / allLeads.length) * 100)}%` : "0%";

  const refetch = () => {
    refetchAll();
    refetchFiltered();
  };

  const handleSendQuotation = async (e) => {
    e.preventDefault();
    if (!openLead || !quoteAmount) return;
    setSubmittingQuote(true);
    try {
      await leadApi.submitQuotation(openLead._id, {
        amount: Number(quoteAmount),
        notes: quoteNotes,
      });
      alert("Quotation submitted successfully!");
      setQuoteAmount("");
      setQuoteNotes("");
      setShowQuoteForm(false);
      setOpenLead(null);
      refetch();
    } catch (err) {
      alert(err.message || "Failed to submit quotation.");
    } finally {
      setSubmittingQuote(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!openLead) return;
    try {
      await leadApi.updateStatus(openLead._id, { status: newStatus });
      setOpenLead(null);
      refetch();
    } catch (err) {
      alert(err.message || "Failed to update lead stage.");
    }
  };

  return (
    <AppShell role="business" title="Lead management" subtitle="Buyer enquiries matched to your business">
      <div className="space-y-4">
        {/* Top 4 Stat Cards dynamically bound to backend API */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="New"
            value={newCount}
            icon={Target}
            tone="danger"
            href="/biz/leads"
          />
          <StatCard
            label="In progress"
            value={inProgressCount}
            tone="warning"
            href="/biz/leads"
          />
          <StatCard
            label="Won"
            value={wonCount}
            tone="success"
            href="/biz/leads"
          />
          <StatCard
            label="Response rate"
            value={responseRate}
            hint="Within 24 hours"
            tone="primary"
            href="/biz/analytics"
          />
        </div>

        {/* Stage Filter Tabs & Filter Icon */}
        <div className="flex items-center justify-between gap-3">
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
            {stages.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStage(s)}
                aria-pressed={stage === s}
                className={
                  stage === s
                    ? "shrink-0 rounded-full bg-sky-600 px-4 py-1.5 text-xs font-bold text-white shadow-2xs transition-all cursor-pointer"
                    : "shrink-0 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                }
              >
                {s}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowFilterModal(true)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>

        {/* Table matching Screenshot 1 */}
        <Panel className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
          <ResponsiveTable
            rows={rows}
            empty={
              <EmptyState
                icon={Target}
                title="No leads in this stage"
                description="New buyer enquiries matching your categories will appear here."
              />
            }
            columns={[
              {
                key: "refCode",
                header: "LEAD",
                cell: (r) => (
                  <span className="font-bold text-xs text-[#0f172a]">
                    {r.refCode || (r._id ? `ENQ-${r._id.slice(-4).toUpperCase()}` : "ENQ-2041")}
                  </span>
                ),
              },
              {
                key: "title",
                header: "REQUIREMENT",
                cell: (r) => (
                  <span className="font-semibold text-xs text-[#0f172a]">
                    {r.enquiry?.title || r.title || "Buyer RFQ"}
                  </span>
                ),
              },
              {
                key: "buyer",
                header: "BUYER",
                cell: (r) => (
                  <span className="font-medium text-xs text-[#0f172a]">
                    {r.enquiry?.buyerName || r.buyerName || "Registered Buyer"}
                  </span>
                ),
              },
              {
                key: "city",
                header: "LOCATION",
                cell: (r) => (
                  <span className="font-medium text-xs text-[#64748b]">
                    {r.enquiry?.city || r.city || "Mumbai, Maharashtra"}
                  </span>
                ),
              },
              {
                key: "pri",
                header: "PRIORITY",
                cell: (r) => {
                  const p = r.priority || "Standard";
                  return (
                    <span
                      className={`inline-block rounded-full px-3 py-0.5 text-[11px] font-bold ${
                        p === "High"
                          ? "bg-red-50 text-red-600 border border-red-100"
                          : p === "Medium"
                          ? "bg-amber-50 text-amber-700 border border-amber-100"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {p}
                    </span>
                  );
                },
              },
              {
                key: "status",
                header: "STAGE",
                cell: (r) => {
                  const st = r.status || "New";
                  return (
                    <span
                      className={`inline-block shrink-0 rounded-full px-3.5 py-0.5 text-xs font-bold ${
                        st === "New"
                          ? "bg-sky-100 text-sky-700"
                          : st === "In Progress"
                          ? "bg-amber-100 text-amber-700"
                          : st === "Responded"
                          ? "bg-blue-100 text-blue-700"
                          : st === "Won"
                          ? "bg-emerald-100 text-emerald-700"
                          : st === "Rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {st}
                    </span>
                  );
                },
              },
              {
                key: "act",
                header: "",
                cell: (r) => (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full px-5 h-8 text-xs font-bold text-[#0f172a] border-slate-200 hover:bg-slate-50 shadow-2xs cursor-pointer"
                    onClick={() => {
                      setOpenLead(r);
                      setShowQuoteForm(false);
                    }}
                  >
                    Open
                  </Button>
                ),
              },
            ]}
            mobile={(r) => (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5 text-xs shadow-2xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-slate-900">{r.refCode || `ENQ-2041`}</span>
                    <p className="font-semibold text-slate-800 text-sm mt-0.5">{r.enquiry?.title || r.title}</p>
                  </div>
                  <span className="rounded-full bg-sky-100 text-sky-700 px-3 py-0.5 text-[11px] font-bold">
                    {r.status || "New"}
                  </span>
                </div>
                <p className="text-slate-500">{r.enquiry?.buyerName || r.buyerName} · {r.enquiry?.city || r.city}</p>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <Pill tone={r.priority === "High" ? "danger" : "warning"}>{r.priority || "Standard"}</Pill>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full px-4 h-8 text-xs font-semibold"
                    onClick={() => {
                      setOpenLead(r);
                      setShowQuoteForm(false);
                    }}
                  >
                    Open
                  </Button>
                </div>
              </div>
            )}
          />
        </Panel>
      </div>

      {/* Detail Slide-Over Sheet matching Target Screenshot 100% */}
      <Sheet open={openLead !== null} onOpenChange={(o) => !o && setOpenLead(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-[430px] p-6 bg-[#f8fafc] border-l border-slate-200 shadow-2xl font-sans">
          {openLead && (
            <div className="space-y-4">
              {/* Header Title & Subtitle */}
              <div className="space-y-1 pr-6">
                <h3 className="text-left text-xl font-bold text-[#0f172a] leading-tight font-sans">
                  {openLead.enquiry?.title || openLead.title}
                </h3>
                <p className="text-left text-xs font-semibold text-[#8a99ad] font-sans">
                  {openLead.refCode || `ENQ-${(openLead._id || "2041").slice(-4).toUpperCase()}`} ·{" "}
                  {openLead.enquiry?.category || openLead.category || "Precision Engineering"}
                </p>
              </div>

              <div className="space-y-4 pt-0.5">
                {/* Description */}
                <p className="text-xs text-[#64748b] leading-relaxed font-sans font-normal">
                  {openLead.enquiry?.description || openLead.description}
                </p>

                {/* Details Box matching Target Image 100% */}
                <div className="rounded-2xl border border-slate-200/70 bg-white p-4.5 space-y-3 shadow-2xs font-sans">
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-xs font-medium text-[#8a99ad]">Buyer</span>
                    <span className="text-xs font-bold text-[#0f172a]">
                      {openLead.enquiry?.buyerName || openLead.buyerName}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-0.5 border-t border-slate-100">
                    <span className="text-xs font-medium text-[#8a99ad]">Role</span>
                    <span className="text-xs font-bold text-[#0f172a] text-right truncate max-w-[200px]">
                      {openLead.buyerRole || "Procurement, demo buyer account"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-0.5 border-t border-slate-100">
                    <span className="text-xs font-medium text-[#8a99ad]">Quantity</span>
                    <span className="text-xs font-bold text-[#0f172a]">
                      {openLead.enquiry?.quantity || openLead.quantity || "5,000 units"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-0.5 border-t border-slate-100">
                    <span className="text-xs font-medium text-[#8a99ad]">Budget</span>
                    <span className="text-xs font-bold text-[#0f172a]">
                      {openLead.enquiry?.budget || openLead.budget || "Placeholder budget"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-0.5 border-t border-slate-100">
                    <span className="text-xs font-medium text-[#8a99ad]">Required by</span>
                    <span className="text-xs font-bold text-[#0f172a]">
                      {openLead.deadline || "30 Sep 2026"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-0.5 border-t border-slate-100">
                    <span className="text-xs font-medium text-[#8a99ad]">Location</span>
                    <span className="text-xs font-bold text-[#0f172a]">
                      {openLead.enquiry?.city || openLead.city || "Mumbai, Maharashtra"}
                    </span>
                  </div>
                </div>

                {/* Timeline Status matching Target Image 100% */}
                <div className="space-y-3.5 pt-3 font-sans">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full bg-[#10b981] shrink-0" />
                      <span className="font-bold text-[#0f172a]">Enquiry submitted</span>
                    </div>
                    <span className="text-[#8a99ad] font-normal">{openLead.timeAgo || "2 hours ago"}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full bg-[#10b981] shrink-0" />
                      <span className="font-bold text-[#0f172a]">Routed to matching businesses</span>
                    </div>
                    <span className="text-[#8a99ad] font-normal">{openLead.timeAgo || "2 hours ago"}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full bg-[#e2e8f0] shrink-0" />
                      <span className="font-medium text-[#8a99ad]">Awaiting business response</span>
                    </div>
                    <span className="text-[#8a99ad] font-semibold">Pending</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full bg-[#e2e8f0] shrink-0" />
                      <span className="font-medium text-[#8a99ad]">Enquiry closed</span>
                    </div>
                    <span className="text-[#8a99ad] font-semibold">Pending</span>
                  </div>
                </div>

                {/* Action Buttons Stack matching Latest Image 100% */}
                <div className="mt-6 space-y-3 font-sans">
                  {openLead.quotation?.amount ? (
                    <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-xs space-y-1">
                      <p className="font-bold text-emerald-800">
                        Quotation Submitted: ₹ {openLead.quotation.amount}
                      </p>
                      {openLead.quotation.notes && (
                        <p className="text-emerald-700">{openLead.quotation.notes}</p>
                      )}
                    </div>
                  ) : showQuoteForm ? (
                    <form onSubmit={handleSendQuotation} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                      <h4 className="text-xs font-bold text-[#0f172a]">Submit Quotation</h4>
                      <div>
                        <label className="text-[11px] font-medium text-slate-600">Quote Amount (₹) *</label>
                        <Input
                          type="number"
                          required
                          value={quoteAmount}
                          onChange={(e) => setQuoteAmount(e.target.value)}
                          placeholder="e.g. 50000"
                          className="mt-1 h-9"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-600">Notes / Terms</label>
                        <Textarea
                          rows={2}
                          value={quoteNotes}
                          onChange={(e) => setQuoteNotes(e.target.value)}
                          placeholder="Delivery within 7 days, 30% advance..."
                          className="mt-1 text-xs"
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Button type="submit" size="sm" className="flex-1 rounded-full bg-[#0088cc] hover:bg-[#0077bb] text-white font-bold text-xs" disabled={submittingQuote}>
                          {submittingQuote ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="mr-1.5 h-3.5 w-3.5" /> Submit Quote</>}
                        </Button>
                        <Button type="button" variant="outline" size="sm" className="rounded-full text-xs" onClick={() => setShowQuoteForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <Button
                      onClick={() => setShowQuoteForm(true)}
                      className="w-full rounded-full bg-[#0088cc] hover:bg-[#0077bb] text-white font-bold text-sm h-12 shadow-sm cursor-pointer transition-all"
                    >
                      Send quotation
                    </Button>
                  )}

                  <Button
                    asChild
                    variant="outline"
                    className="w-full rounded-full border border-slate-200/90 bg-white hover:bg-slate-50 text-[#0f172a] font-bold text-sm h-12 shadow-2xs cursor-pointer"
                  >
                    <Link href={`/biz/messages?userId=${openLead.enquiry?.requester?._id || openLead.enquiry?.requester || openLead.requester?._id || openLead.requester || ""}`}>
                      Message buyer
                    </Link>
                  </Button>

                  <div className="pt-1 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdateStatus("Closed");
                      }}
                      className="w-full bg-white hover:bg-slate-50 text-[#0f172a] font-bold text-sm h-12 shadow-2xs cursor-pointer"
                    >
                      Mark as not relevant
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Dynamic Filter Modal for Leads */}
      <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white border border-slate-100 shadow-2xl font-sans">
          <DialogHeader className="space-y-1 text-left">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600 tracking-wider uppercase">
              <Filter className="h-3.5 w-3.5" /> DYNAMIC FILTER
            </div>
            <DialogTitle className="text-xl font-extrabold text-[#0f172a] pt-0.5">
              Filter leads
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 leading-relaxed pt-0.5">
              Filter and search buyer enquiries matching your criteria in real time.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Search Input */}
            <div>
              <label className="text-xs font-bold text-[#0f172a] mb-1 block">Search Keyword</label>
              <Input
                type="text"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                placeholder="Search requirement, buyer name, or city..."
                className="h-10 text-xs rounded-xl border-slate-200"
              />
            </div>

            {/* Priority Selector */}
            <div>
              <label className="text-xs font-bold text-[#0f172a] mb-1.5 block">Priority</label>
              <div className="flex flex-wrap gap-2">
                {["All", "High", "Medium", "Low"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFilterPriority(p)}
                    className={
                      filterPriority === p
                        ? "rounded-full bg-sky-600 px-3.5 py-1 text-xs font-bold text-white shadow-2xs cursor-pointer"
                        : "rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    }
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Stage Selector */}
            <div>
              <label className="text-xs font-bold text-[#0f172a] mb-1.5 block">Stage</label>
              <div className="flex flex-wrap gap-2">
                {stages.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStage(st)}
                    className={
                      stage === st
                        ? "rounded-full bg-sky-600 px-3.5 py-1 text-xs font-bold text-white shadow-2xs cursor-pointer"
                        : "rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    }
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Order */}
            <div>
              <label className="text-xs font-bold text-[#0f172a] mb-1.5 block">Sort Order</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSortBy("newest")}
                  className={
                    sortBy === "newest"
                      ? "flex-1 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-2xs cursor-pointer"
                      : "flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  }
                >
                  Newest First
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy("oldest")}
                  className={
                    sortBy === "oldest"
                      ? "flex-1 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-2xs cursor-pointer"
                      : "flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  }
                >
                  Oldest First
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFilterSearch("");
                  setFilterPriority("All");
                  setStage("All");
                  setSortBy("newest");
                }}
                className="rounded-full text-xs font-bold text-slate-600 px-4 h-9 border-slate-200"
              >
                Reset Filters
              </Button>
              <Button
                type="button"
                onClick={() => setShowFilterModal(false)}
                className="rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-6 h-9 shadow-2xs cursor-pointer"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export { LeadsPage as BizLeads };
export default LeadsPage;
