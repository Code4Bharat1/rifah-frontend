"use client";
import Link from "next/link";
import { Download, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { StatusBadge } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { useMyLeads } from "@shared/hooks/use-rifah-api";

function formatEnquiryCode(item, index) {
  if (item.enquiryCode) return item.enquiryCode;
  if (item.code) return item.code;
  if (item.enquiry?.code) return item.enquiry.code;
  if (item._id) {
    const hex = item._id.toString().replace(/[^0-9]/g, "");
    const num = hex ? parseInt(hex.slice(-4), 10) : 2041;
    return `ENQ-${isNaN(num) ? 2041 - index : num}`;
  }
  return `ENQ-${2041 - index}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "30 Sep 2026";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function handleExportList(leads) {
  if (!leads || leads.length === 0) {
    toast.error("No enquiries to export");
    return;
  }

  const headers = ["Enquiry", "Requirement", "Buyer", "Quantity", "Required By", "Status"];
  const rows = leads.map((r, i) => [
    `"${formatEnquiryCode(r, i)}"`,
    `"${(r.enquiry?.title || r.title || r.requirement || "Machined brackets for assembly line").replace(/"/g, '""')}"`,
    `"${(r.enquiry?.buyerName || r.buyerName || r.buyer || "Registered Buyer").replace(/"/g, '""')}"`,
    `"${r.enquiry?.quantity || r.quantity || "On request"}"`,
    `"${formatDate(r.enquiry?.requiredBy || r.requiredBy)}"`,
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
  toast.success("Enquiries list exported successfully");
}

function BizEnquiries() {
  const { data: leadsData } = useMyLeads();
  const rows = Array.isArray(leadsData) ? leadsData : (leadsData?.leads || []);

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
              description="Buyers who open your profile or category and submit an enquiry will appear here."
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
                <span className="font-medium">
                  {r.enquiry?.title || r.title || r.requirement || "Buyer RFQ"}
                </span>
              ),
            },
            {
              key: "buyer",
              header: "BUYER",
              cell: (r) => r.enquiry?.buyerName || r.buyerName || r.buyer || "Registered Buyer",
            },
            {
              key: "qty",
              header: "QUANTITY",
              cell: (r) => r.enquiry?.quantity || r.quantity || "On request",
            },
            {
              key: "by",
              header: "REQUIRED BY",
              cell: (r) => formatDate(r.enquiry?.requiredBy || r.requiredBy),
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
                    <Link href={`/biz/messages?userId=${buyerId}`}>Message</Link>
                  </Button>
                );
              },
            },
          ]}
          mobile={(r, i) => (
            <div className="rounded-xl border border-border p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  {formatEnquiryCode(r, i)}
                </span>
                <StatusBadge status={r.status || "New"} />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {r.enquiry?.title || r.title || r.requirement || "Buyer RFQ"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {r.enquiry?.buyerName || r.buyerName || "Registered Buyer"}
                </p>
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Qty: {r.enquiry?.quantity || r.quantity || "On request"}</span>
                <span>Date: {formatDate(r.enquiry?.requiredBy || r.requiredBy)}</span>
              </div>
            </div>
          )}
        />
      </Panel>
    </AppShell>
  );
}

export { BizEnquiries };
export default BizEnquiries;

