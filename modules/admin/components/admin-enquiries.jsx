"use client";
import { useState } from "react";
import { Inbox, MessageSquare, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill, StatusBadge } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { useAllEnquiries } from "@shared/hooks/use-rifah-api";
import { enquiryApi } from "@shared/lib/api-services";
import { Button } from "@shared/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@shared/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@shared/components/ui/dialog";

function AdminEnquiries() {
  const { data: enquiriesData, refetch } = useAllEnquiries();
  const enquiries = Array.isArray(enquiriesData) ? enquiriesData : [];
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await enquiryApi.updateStatus(id, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      refetch();
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    }
  };

  return (
    <AppShell role="admin" title="Enquiry flow" subtitle="Buyer sourcing RFQs routed across chamber network">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Enquiries" value={String(enquiries.length)} icon={Inbox} tone="primary" />
          <StatCard
            label="Responded"
            value={String(enquiries.filter((e) => e.responses?.length > 0).length)}
            icon={MessageSquare}
            tone="success"
          />
          <StatCard
            label="Unmatched"
            value={String(enquiries.filter((e) => !e.responses || e.responses.length === 0).length)}
            tone="warning"
          />
          <StatCard label="Avg. first response" value="9.4 hrs" />
        </div>

        <Panel title="All buyer requirements">
          <ResponsiveTable
            rows={enquiries}
            empty={<EmptyState icon={Inbox} title="No enquiries yet" description="Buyer requirements will appear here." />}
            columns={[
              { key: "ref", header: "REF", cell: (r) => <span className="font-semibold text-sm">ENQ-{r._id?.slice(-4).toUpperCase() || '1000'}</span> },
              { key: "title", header: "REQUIREMENT", cell: (r) => <span className="font-semibold text-sm">{r.title}</span> },
              { key: "category", header: "CATEGORY", cell: (r) => r.category },
              { key: "buyer", header: "BUYER", cell: (r) => r.requesterName || r.buyerName || "Registered Buyer" },
              { key: "city", header: "LOCATION", cell: (r) => r.city || r.location },
              { key: "status", header: "STATUS", cell: (r) => <StatusBadge status={r.status} /> },
              { key: "responses", header: "RESPONSES", cell: (r) => r.responses?.length || 0 },
              {
                key: "action",
                header: "",
                cell: (r) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Manage Enquiry</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => setSelectedEnquiry(r)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleUpdateStatus(r._id, "New")} disabled={r.status === "New"}>
                        Mark as New
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateStatus(r._id, "Routed")} disabled={r.status === "Routed"}>
                        Mark as Routed
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateStatus(r._id, "In Progress")} disabled={r.status === "In Progress"}>
                        Mark as In Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateStatus(r._id, "Responded")} disabled={r.status === "Responded"}>
                        Mark as Responded
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateStatus(r._id, "Won")} disabled={r.status === "Won"}>
                        Mark as Won
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600 focus:bg-red-50" onClick={() => handleUpdateStatus(r._id, "Rejected")} disabled={r.status === "Rejected"}>
                        Reject Enquiry
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateStatus(r._id, "Closed")} disabled={r.status === "Closed"}>
                        Close Enquiry
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ),
              },
            ]}
            mobile={(r) => (
              <div className="rounded-xl border border-border p-3.5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{r.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {r.requesterName || r.buyerName} · {r.city || r.location}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1.5">
                  <Pill>{r.category}</Pill>
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setSelectedEnquiry(r)}>View Details</Button>
                </div>
              </div>
            )}
          />
        </Panel>
      </div>

      <Dialog open={!!selectedEnquiry} onOpenChange={(o) => !o && setSelectedEnquiry(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedEnquiry?.title}</DialogTitle>
            <DialogDescription>
              {selectedEnquiry?.category} · Posted {selectedEnquiry && new Date(selectedEnquiry.createdAt).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <h4 className="text-sm font-semibold mb-1">Description</h4>
              <p className="text-sm text-muted-foreground">{selectedEnquiry?.description || "No description provided."}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Buyer</p>
                <p className="text-sm font-semibold">{selectedEnquiry?.requesterName || selectedEnquiry?.buyerName || "Registered Buyer"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Location</p>
                <p className="text-sm font-semibold">{selectedEnquiry?.city || selectedEnquiry?.location || "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Quantity</p>
                <p className="text-sm font-semibold">{selectedEnquiry?.quantity || "On request"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Budget</p>
                <p className="text-sm font-semibold">{selectedEnquiry?.budget || "To be discussed"}</p>
              </div>
            </div>
            <div>
               <p className="text-xs font-medium text-muted-foreground mb-2">Current Status</p>
               <StatusBadge status={selectedEnquiry?.status} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export { AdminEnquiries };
export default AdminEnquiries;
