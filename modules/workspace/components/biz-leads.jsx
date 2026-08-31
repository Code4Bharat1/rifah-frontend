"use client";
import { Filter, Target, Loader2, Send } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill, StatusBadge } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Textarea } from "@shared/components/ui/textarea";
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
  const [quoteAmount, setQuoteAmount] = useState("");
  const [quoteNotes, setQuoteNotes] = useState("");
  const [submittingQuote, setSubmittingQuote] = useState(false);

  const { data: leadsData, refetch } = useMyLeads({
    status: stage === "All" ? undefined : stage,
  });

  const rows = leadsData?.leads || [];

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
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Total leads"
            value={String(rows.length)}
            icon={Target}
            tone="brand"
          />
          <StatCard
            label="New"
            value={String(rows.filter((r) => r.status === "New").length)}
            tone="primary"
          />
          <StatCard
            label="Responded"
            value={String(rows.filter((r) => r.status === "Responded").length)}
            tone="success"
          />
          <StatCard
            label="Won"
            value={String(rows.filter((r) => r.status === "Won").length)}
            tone="success"
          />
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
            {stages.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStage(s)}
                aria-pressed={stage === s}
                className={
                  stage === s
                    ? "shrink-0 rounded-full bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground"
                    : "shrink-0 rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm font-medium text-muted-foreground"
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <Panel>
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
                key: "title",
                header: "Requirement",
                cell: (r) => <span className="font-semibold">{r.enquiry?.title || "Buyer RFQ"}</span>,
              },
              { key: "buyer", header: "Buyer", cell: (r) => r.enquiry?.buyerName || "Registered Buyer" },
              { key: "category", header: "Category", cell: (r) => r.enquiry?.category },
              { key: "city", header: "Location", cell: (r) => r.enquiry?.city },
              {
                key: "pri",
                header: "Priority",
                cell: (r) => (
                  <Pill tone={r.priority === "High" ? "danger" : "neutral"}>{r.priority || "Standard"}</Pill>
                ),
              },
              { key: "status", header: "Stage", cell: (r) => <StatusBadge status={r.status} /> },
              {
                key: "act",
                header: "",
                cell: (r) => (
                  <Button size="sm" variant="outline" onClick={() => setOpenLead(r)}>
                    Open
                  </Button>
                ),
              },
            ]}
            mobile={(r) => (
              <button
                type="button"
                onClick={() => setOpenLead(r)}
                className="w-full rounded-xl border border-border p-3.5 text-left"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{r.enquiry?.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {r.enquiry?.buyerName} · {r.enquiry?.city}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              </button>
            )}
          />
        </Panel>
      </div>

      <Sheet open={openLead !== null} onOpenChange={(o) => !o && setOpenLead(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          {openLead && (
            <>
              <SheetHeader>
                <SheetTitle className="text-left">{openLead.enquiry?.title}</SheetTitle>
                <SheetDescription className="text-left">
                  Category: {openLead.enquiry?.category} · Stage: {openLead.status}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4 px-4 pb-8">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {openLead.enquiry?.description}
                </p>

                <dl className="rounded-xl border border-border p-3.5 text-sm">
                  {[
                    ["Buyer Name", openLead.enquiry?.buyerName],
                    ["Buyer Email", openLead.enquiry?.buyerEmail],
                    ["Buyer Phone", openLead.enquiry?.buyerPhone || "Provided on request"],
                    ["Quantity", openLead.enquiry?.quantity],
                    ["Budget", openLead.enquiry?.budget || "Not specified"],
                    ["Delivery Location", openLead.enquiry?.city],
                  ].map(([k, v]) => (
                    <div key={k} className="grid grid-cols-2 gap-3 border-b border-border py-2 last:border-0">
                      <dt className="text-xs text-muted-foreground">{k}</dt>
                      <dd className="font-medium text-xs text-right">{v}</dd>
                    </div>
                  ))}
                </dl>

                {openLead.quotation?.amount ? (
                  <div className="rounded-xl bg-success-soft p-3 text-xs">
                    <p className="font-semibold text-success">Quotation Submitted: ₹ {openLead.quotation.amount}</p>
                    {openLead.quotation.notes && <p className="mt-1 text-muted-foreground">{openLead.quotation.notes}</p>}
                  </div>
                ) : (
                  <form onSubmit={handleSendQuotation} className="space-y-3 rounded-xl border border-border p-3.5">
                    <h4 className="text-sm font-semibold">Submit Quotation</h4>
                    <div>
                      <label className="text-xs font-medium">Quote Amount (₹) *</label>
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
                      <label className="text-xs font-medium">Notes / Terms</label>
                      <Textarea
                        rows={2}
                        value={quoteNotes}
                        onChange={(e) => setQuoteNotes(e.target.value)}
                        placeholder="Delivery within 7 days, payment 30% advance..."
                        className="mt-1"
                      />
                    </div>
                    <Button type="submit" size="sm" className="w-full" disabled={submittingQuote}>
                      {submittingQuote ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="mr-1 h-3.5 w-3.5" /> Send Quote</>}
                    </Button>
                  </form>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleUpdateStatus("In Progress")}>
                    Mark In Progress
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleUpdateStatus("Won")}>
                    Mark Won
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}

export { LeadsPage as BizLeads };
export default LeadsPage;
