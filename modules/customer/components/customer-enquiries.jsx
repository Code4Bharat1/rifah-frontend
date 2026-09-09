"use client";
import Link from "next/link";
import { Send } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill, StatusBadge } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { useMyEnquiries, useEnquiryResponses } from "@shared/hooks/use-rifah-api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@shared/components/ui/dialog";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

const tabs = ["All", "Submitted", "Routed", "Responded", "Closed"];

function MyEnquiries() {
  const router = useRouter();
  const [tab, setTab] = useState("All");
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const { data: enquiriesData, isLoading } = useMyEnquiries(
    tab === "All" ? {} : { status: tab === "Submitted" ? "New" : tab }
  );

  const { data: responses, isLoading: loadingResponses } = useEnquiryResponses(selectedEnquiry?._id);

  const allRows = Array.isArray(enquiriesData) ? enquiriesData : (enquiriesData?.enquiries || []);
  const rows = allRows.filter((r) => {
    if (tab === "All") return true;
    if (tab === "Submitted") return r.status === "New" || r.status === "Submitted";
    return r.status?.toLowerCase() === tab.toLowerCase();
  });

  return (
    <AppShell
      role="customer"
      title="My enquiries"
      subtitle="Requirements you posted to RIFAH members"
      actions={
        <Button asChild>
          <Link href="/enquiry/new">
            <Send className="h-4 w-4" /> New enquiry
          </Link>
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
              className={
                tab === t
                  ? "shrink-0 rounded-full bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground"
                  : "shrink-0 rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm font-medium text-muted-foreground"
              }
            >
              {t}
            </button>
          ))}
        </div>

        <Panel bodyClassName="p-0 md:p-0">
          <div className="p-4 md:p-5">
            <ResponsiveTable
              rows={rows}
              empty={
                <EmptyState
                  icon={Send}
                  title="No enquiries found"
                  description="Post a sourcing requirement and matched members will respond here."
                  action={
                    <Button asChild>
                      <Link href="/enquiry/new">Post an enquiry</Link>
                    </Button>
                  }
                />
              }
              columns={[
                { key: "title", header: "Requirement", cell: (r) => <span className="font-semibold">{r.title}</span> },
                { key: "category", header: "Category", cell: (r) => r.category },
                { key: "qty", header: "Quantity", cell: (r) => r.quantity || "On request" },
                { key: "by", header: "Required by", cell: (r) => r.requiredBy ? new Date(r.requiredBy).toLocaleDateString() : "Immediate" },
                { key: "resp", header: "Responses", cell: (r) => <span className="tabular-nums">{r.responsesCount || r.responses?.length || 0}</span> },
                { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
                {
                  key: "action", header: "", cell: (r) => (
                    <Button variant="outline" size="sm" onClick={() => setSelectedEnquiry(r)}>View</Button>
                  )
                }
              ]}
              mobile={(r) => (
                <div className="rounded-xl border border-border p-3.5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{r.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {r.category} · {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <Pill>Qty: {r.quantity}</Pill>
                    {r.budget && <Pill>Budget: {r.budget}</Pill>}
                    <Pill tone={(r.responsesCount || r.responses?.length) > 0 ? "success" : "neutral"}>
                      {r.responsesCount || r.responses?.length || 0} responses
                    </Pill>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setSelectedEnquiry(r)}>View Details</Button>
                  </div>
                </div>
              )}
            />
          </div>
        </Panel>
      </div>

      <Dialog open={!!selectedEnquiry} onOpenChange={(o) => !o && setSelectedEnquiry(null)}>
        <DialogContent className="w-[95vw] max-w-[620px] max-h-[88vh] sm:max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-2xl sm:rounded-2xl border-border bg-background shadow-2xl">
          <DialogHeader className="p-5 sm:p-6 pb-3 border-b border-border/70 shrink-0 text-left">
            <DialogTitle className="text-lg sm:text-xl font-bold pr-6 line-clamp-2">{selectedEnquiry?.title}</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
              {selectedEnquiry?.category} · Posted {selectedEnquiry && new Date(selectedEnquiry.createdAt).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-5">
            <div>
              <h4 className="text-xs sm:text-sm font-semibold mb-1 text-foreground">Description</h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {selectedEnquiry?.description || "No description provided."}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 rounded-xl bg-muted/40 p-3.5 sm:p-4 border border-border/60">
              <div>
                <p className="text-[11px] sm:text-xs font-medium text-muted-foreground">Target Location</p>
                <p className="text-xs sm:text-sm font-semibold text-foreground mt-0.5">{selectedEnquiry?.city || selectedEnquiry?.location || "Not specified"}</p>
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-medium text-muted-foreground">Quantity</p>
                <p className="text-xs sm:text-sm font-semibold text-foreground mt-0.5">{selectedEnquiry?.quantity || "On request"}</p>
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-medium text-muted-foreground">Budget</p>
                <p className="text-xs sm:text-sm font-semibold text-foreground mt-0.5">{selectedEnquiry?.budget || "To be discussed"}</p>
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-medium text-muted-foreground">Required By</p>
                <p className="text-xs sm:text-sm font-semibold text-foreground mt-0.5">{selectedEnquiry?.requiredBy ? new Date(selectedEnquiry.requiredBy).toLocaleDateString() : "Immediate"}</p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-3 sm:p-3.5">
              <div>
                <p className="text-[11px] sm:text-xs font-medium text-muted-foreground mb-1">Current Status</p>
                <StatusBadge status={selectedEnquiry?.status} />
              </div>
              <div className="text-right">
                <p className="text-[11px] sm:text-xs font-medium text-muted-foreground mb-0.5">Responses Received</p>
                <p className="text-base sm:text-lg font-bold text-foreground">{selectedEnquiry?.responsesCount || selectedEnquiry?.responses?.length || 0}</p>
              </div>
            </div>

            {/* Quotations Section */}
            {selectedEnquiry && (selectedEnquiry.responsesCount > 0 || (responses && responses.length > 0)) && (
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs sm:text-sm font-semibold text-foreground">Quotations & Responses</h4>
                  <span className="text-[11px] text-muted-foreground">
                    {responses?.length || 0} {responses?.length === 1 ? "quote" : "quotes"}
                  </span>
                </div>
                {loadingResponses ? (
                  <p className="text-xs sm:text-sm text-muted-foreground">Loading responses...</p>
                ) : responses && responses.length > 0 ? (
                  <div className="space-y-3">
                    {responses.map((resp) => (
                      <div key={resp._id} className="rounded-xl border border-border p-3.5 sm:p-4 bg-surface hover:border-border/80 transition-colors shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm text-foreground truncate">{resp.business?.name || "Business"}</p>
                            {resp.quotation?.amount && (
                              <p className="text-xs sm:text-sm mt-1 text-foreground">
                                <span className="text-muted-foreground">Amount:</span> <span className="font-bold text-primary">₹ {resp.quotation.amount}</span>
                              </p>
                            )}
                            {resp.quotation?.deliveryTime && (
                              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                                <span>Delivery Time:</span> <span className="font-medium text-foreground">{resp.quotation.deliveryTime}</span>
                              </p>
                            )}
                            {resp.quotation?.notes && (
                              <p className="text-xs sm:text-sm mt-1.5 text-muted-foreground line-clamp-3 bg-muted/30 p-2 rounded-lg">
                                {resp.quotation.notes}
                              </p>
                            )}
                          </div>
                          {resp.business?.owner && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="shrink-0 w-full sm:w-auto mt-1 sm:mt-0 font-medium"
                              onClick={() => router.push(`/me/messages?userId=${resp.business?.owner}&name=${encodeURIComponent(resp.business?.name)}`)}
                            >
                              <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Message
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-muted-foreground">No quotations submitted yet.</p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export { MyEnquiries as CustomerEnquiries };
export default MyEnquiries;
