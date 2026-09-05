"use client";
import Link from "next/link";
import { Download, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { StatusBadge } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { useBusinessEnquiries } from "@shared/hooks/use-rifah-api";

function formatEnquiryCode(item, index) {
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
    toast.error("No direct enquiries to export");
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
    `"${r.status || "New"}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `RIFAH_Direct_Enquiries_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success("Enquiries exported successfully");
}

function BizEnquiries() {
  const { data: enquiriesData, isLoading } = useBusinessEnquiries();
  const rows = Array.isArray(enquiriesData) ? enquiriesData : (enquiriesData?.enquiries || []);

  return (
    <AppShell
      role="business"
      title="Direct enquiries"
      subtitle="Sent straight to your business profile"
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
              title="No direct enquiries yet"
              description="Buyers who view your business profile and submit a direct requirement will appear here."
            />
          }
          columns={[
            {
              key: "enquiry",
              header: "ENQUIRY",
              cell: (r, i) => (
                <span className="font-semibold text-foreground">
                  {formatEnquiryCode(r, i)}
                </span>
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
              header: "BUYER",
              cell: (r) => (
                <div>
                  <span className="font-medium text-foreground block">
                    {r.requesterName || r.requester?.name || r.buyerName || "Customer"}
                  </span>
                  {Boolean(r.requester?.email || r.location) && (
                    <span className="text-xs text-muted-foreground block">
                      {r.location || r.requester?.email}
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
              header: "STATUS",
              cell: (r) => <StatusBadge status={r.status || "New"} />,
            },
            {
              key: "action",
              header: "ACTION",
              cell: (r) => {
                const buyerId = r.requester?._id || r.requester || r.enquiry?.requester?._id || r.enquiry?.requester || "";
                return (
                  <Button asChild size="sm" variant="outline" className="h-8 text-xs font-semibold">
                    <Link href={buyerId ? `/biz/messages?userId=${buyerId}` : "/biz/messages"}>Message</Link>
                  </Button>
                );
              },
            },
          ]}
          mobile={(r, i) => {
            const buyerId = r.requester?._id || r.requester || r.enquiry?.requester?._id || r.enquiry?.requester || "";
            return (
              <div className="rounded-xl border border-border p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {formatEnquiryCode(r, i)}
                  </span>
                  <StatusBadge status={r.status || "New"} />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {r.title || r.enquiry?.title || "Requirement"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {r.requesterName || r.requester?.name || r.buyerName || "Customer"}
                  </p>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Qty: {r.quantity || r.enquiry?.quantity || "On request"}</span>
                  <span>Date: {formatDate(r.requiredBy || r.enquiry?.requiredBy)}</span>
                </div>
                <div className="pt-1 flex justify-end">
                  <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                    <Link href={buyerId ? `/biz/messages?userId=${buyerId}` : "/biz/messages"}>Message Buyer</Link>
                  </Button>
                </div>
              </div>
            );
          }}
        />
      </Panel>
    </AppShell>
  );
}

export { BizEnquiries };
export default BizEnquiries;
