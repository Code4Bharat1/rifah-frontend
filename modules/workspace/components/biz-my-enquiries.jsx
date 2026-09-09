"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, Send, CheckCircle, Clock } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill, StatusBadge } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@shared/components/ui/dialog";
import { useMyEnquiries, useEnquiryResponses } from "@shared/hooks/use-rifah-api";

const tabs = ["All", "Submitted", "Routed", "Responded", "Closed"];

export function BizMyEnquiries() {
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
      role="business"
      title="My Sourcing Enquiries"
      subtitle="B2B requirements and raw material needs you posted to fellow RIFAH members"
      actions={
        <Button asChild>
          <Link href="/biz/my-enquiries/new">
            <Send className="mr-2 h-4 w-4" /> Post B2B Requirement
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
                  title="No sourcing requirements posted"
                  description="Post your raw material, inventory, or service requirements to connect with verified businesses across the chamber."
                  action={
                    <Button asChild>
                      <Link href="/biz/my-enquiries/new">Post a B2B requirement</Link>
                    </Button>
                  }
                />
              }
              columns={[
                {
                  key: "title",
                  header: "Requirement",
                  cell: (r) => (
                    <div>
                      <span className="font-semibold text-foreground">{r.title}</span>
                      <p className="text-xs text-muted-foreground">{r.referenceId || "ENQ"}</p>
                    </div>
                  ),
                },
                { key: "category", header: "Category", cell: (r) => r.category },
                {
                  key: "target",
                  header: "Routing",
                  cell: (r) => {
                    if (r.targetType === "business" || r.targetBusiness) {
                      return (
                        <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                          Direct
                        </span>
                      );
                    }
                    if (r.targetType === "chamber" || (r.chapter && r.chapter !== "All Chapters")) {
                      return (
                        <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400">
                          {r.chapter || "Chamber"}
                        </span>
                      );
                    }
                    return (
                      <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        Pan-Chamber
                      </span>
                    );
                  },
                },
                { key: "qty", header: "Quantity", cell: (r) => r.quantity || "On request" },
                {
                  key: "by",
                  header: "Required by",
                  cell: (r) => (r.requiredBy ? new Date(r.requiredBy).toLocaleDateString() : "Immediate"),
                },
                {
                  key: "resp",
                  header: "Quotations",
                  cell: (r) => (
                    <span className="tabular-nums font-semibold">
                      {r.responsesCount || r.responses?.length || 0}
                    </span>
                  ),
                },
                { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
                {
                  key: "action",
                  header: "",
                  cell: (r) => (
                    <Button variant="outline" size="sm" onClick={() => setSelectedEnquiry(r)}>
                      View
                    </Button>
                  ),
                },
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
                      {r.responsesCount || r.responses?.length || 0} quotes
                    </Pill>
                    {(r.targetType === "business" || r.targetBusiness) && <Pill tone="warning">Direct</Pill>}
                    {(r.targetType === "chamber" || (r.chapter && r.chapter !== "All Chapters")) && (
                      <Pill tone="info">{r.chapter}</Pill>
                    )}
                    {(r.targetType === "all" || (!r.targetType && !r.targetBusiness && r.chapter === "All Chapters")) && (
                      <Pill tone="success">Pan-Chamber</Pill>
                    )}
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setSelectedEnquiry(r)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              )}
            />
          </div>
        </Panel>
      </div>

      {/* Quotation Responses Dialog */}
      <Dialog open={Boolean(selectedEnquiry)} onOpenChange={(open) => !open && setSelectedEnquiry(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              {selectedEnquiry?.title}
              <span className="text-sm font-normal text-muted-foreground">
                ({selectedEnquiry?.referenceId || "ENQ"})
              </span>
            </DialogTitle>
            <DialogDescription>
              {selectedEnquiry?.category} · Posted on{" "}
              {selectedEnquiry?.createdAt ? new Date(selectedEnquiry.createdAt).toLocaleDateString() : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-surface-raised p-3.5 text-xs sm:grid-cols-4">
              <div>
                <span className="text-muted-foreground">Quantity</span>
                <p className="font-semibold text-foreground">{selectedEnquiry?.quantity || "On request"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Target Budget</span>
                <p className="font-semibold text-foreground">{selectedEnquiry?.budget || "Market rate"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Delivery Location</span>
                <p className="font-semibold text-foreground">{selectedEnquiry?.location || "Not specified"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Routing Scope</span>
                <p className="font-semibold text-foreground">
                  {selectedEnquiry?.targetType === "business"
                    ? "Direct Vendor"
                    : selectedEnquiry?.targetType === "chamber"
                    ? selectedEnquiry?.chapter
                    : "Pan-Chamber"}
                </p>
              </div>
            </div>

            {selectedEnquiry?.description && (
              <div className="rounded-xl border border-border p-3.5 text-xs">
                <span className="font-semibold text-muted-foreground">Requirement Notes:</span>
                <p className="mt-1 text-foreground whitespace-pre-wrap">{selectedEnquiry.description}</p>
              </div>
            )}

            <div>
              <h4 className="mb-2 text-sm font-semibold">Vendor Quotations & Responses</h4>
              {loadingResponses ? (
                <div className="py-6 text-center text-xs text-muted-foreground">Loading quotations...</div>
              ) : responses && responses.length > 0 ? (
                <div className="space-y-2.5">
                  {responses.map((resp) => (
                    <div
                      key={resp._id}
                      className="flex flex-col justify-between gap-3 rounded-xl border border-border p-3.5 sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="font-semibold text-foreground">
                          {resp.business?.name || "Verified Member Business"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Quote:{" "}
                          <span className="font-bold text-primary">
                            ₹
                            {Number(
                              resp.quotation?.amount || resp.quoteAmount || resp.amount || 0
                            ).toLocaleString("en-IN")}
                          </span>
                          {(resp.quotation?.notes || resp.quotation?.terms || resp.notes) &&
                            ` · "${resp.quotation?.notes || resp.quotation?.terms || resp.notes}"`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const vendorOwnerId = resp.business?.owner?._id || resp.business?.owner || "";
                            const vendorName = resp.business?.name || "Member Business";
                            setSelectedEnquiry(null);
                            router.push(
                              vendorOwnerId
                                ? `/biz/messages?userId=${vendorOwnerId}&name=${encodeURIComponent(vendorName)}`
                                : "/biz/messages"
                            );
                          }}
                        >
                          <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Chat
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
                  No businesses have submitted quotations for this requirement yet.
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
