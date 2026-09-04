"use client";
import { useState } from "react";
import { Inbox, MessageSquare, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill, StatusBadge } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { useAllEnquiries, useChapters, useAdminUsers } from "@shared/hooks/use-rifah-api";
import { enquiryApi } from "@shared/lib/api-services";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@shared/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@shared/components/ui/dialog";
import { Download, Target } from "lucide-react";

function AdminEnquiries() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [chapterFilter, setChapterFilter] = useState("all");

  const { data: enquiriesData, refetch } = useAllEnquiries({
    search: search || undefined,
    status: statusFilter,
    type: typeFilter,
    chapter: chapterFilter,
  });
  const enquiries = Array.isArray(enquiriesData) ? enquiriesData : [];
  
  const { data: chaptersData } = useChapters();
  const chapters = Array.isArray(chaptersData) ? chaptersData : [];

  const { data: adminUsersData } = useAdminUsers();
  const adminUsers = Array.isArray(adminUsersData) ? adminUsersData : [];

  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");
  const [resolveStatus, setResolveStatus] = useState("");
  const [resolvingId, setResolvingId] = useState(null);
  
  const handleUpdateStatus = async (id, newStatus) => {
    if (newStatus === "Closed" || newStatus === "Won" || newStatus === "Rejected") {
      setResolvingId(id);
      setResolveStatus(newStatus);
      setResolutionNote("");
      setIsResolving(true);
      return;
    }
    try {
      await enquiryApi.updateStatus(id, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      refetch();
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleResolveSubmit = async () => {
    try {
      await enquiryApi.updateStatus(resolvingId, { 
        status: resolveStatus, 
        resolutionNote: resolutionNote,
        timelineUpdate: { label: `Marked as ${resolveStatus}`, at: new Date().toISOString() }
      });
      toast.success(`Enquiry marked as ${resolveStatus}`);
      setIsResolving(false);
      refetch();
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleAssign = async (id, userId) => {
    try {
      await enquiryApi.updateStatus(id, { assignedTo: userId });
      toast.success("Enquiry assigned successfully");
      refetch();
    } catch (error) {
      toast.error(error.message || "Failed to assign enquiry");
    }
  };

  return (
    <AppShell 
      role="admin" 
      title="Enquiry flow" 
      subtitle="Buyer sourcing RFQs routed across chamber network"
      actions={
        <Button variant="outline" disabled={isExporting} onClick={async () => {
          try {
            setIsExporting(true);
            toast.info("Exporting enquiries...");
            const csvText = await enquiryApi.exportCsv({
              search: search || undefined,
              status: statusFilter,
              type: typeFilter,
              chapter: chapterFilter,
            });
            const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `enquiries_export_${new Date().toISOString().split("T")[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.success("Export completed successfully!");
          } catch (e) {
            toast.error("Failed to export enquiries");
          } finally {
            setIsExporting(false);
          }
        }}>
          {isExporting ? <Target className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          Export CSV
        </Button>
      }
    >
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

        <div className="flex flex-col sm:flex-row gap-3">
          <Input 
            placeholder="Search enquiries by title or buyer..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-[300px]" 
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="sm:max-w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Routed">Routed</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Responded">Responded</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
              <SelectItem value="Won">Won</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="sm:max-w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="direct">Direct RFQs</SelectItem>
              <SelectItem value="broadcast">Broadcast RFQs</SelectItem>
            </SelectContent>
          </Select>
          <Select value={chapterFilter} onValueChange={setChapterFilter}>
            <SelectTrigger className="sm:max-w-[180px]">
              <SelectValue placeholder="Filter by chapter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chapters</SelectItem>
              {chapters.map((ch) => (
                <SelectItem key={ch._id || ch.name} value={ch.name}>{ch.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              { key: "assignedTo", header: "ASSIGNED TO", cell: (r) => r.assignedTo ? <span className="text-sm font-medium">{r.assignedTo.name}</span> : <span className="text-xs text-muted-foreground italic">Unassigned</span> },
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
                      
                      {/* Submenu-like approach or direct map for assigning */}
                      <DropdownMenuLabel>Assign To</DropdownMenuLabel>
                      {adminUsers.length > 0 ? (
                        adminUsers.slice(0, 5).map(u => (
                          <DropdownMenuItem key={u._id} onClick={() => handleAssign(r._id, u._id)} disabled={r.assignedTo?._id === u._id}>
                            {r.assignedTo?._id === u._id ? "✓ " : ""}Assign to {u.name}
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <DropdownMenuItem disabled>No admins available</DropdownMenuItem>
                      )}

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
               <div className="flex items-center gap-3">
                 <StatusBadge status={selectedEnquiry?.status} />
                 {selectedEnquiry?.assignedTo && (
                   <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                     Assigned to: <span className="font-medium text-foreground">{selectedEnquiry.assignedTo.name}</span>
                   </span>
                 )}
               </div>
               
               {selectedEnquiry?.resolutionNote && (
                 <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
                   <p className="text-xs font-semibold mb-1 text-primary">Resolution Note</p>
                   <p className="text-sm text-muted-foreground italic">"{selectedEnquiry.resolutionNote}"</p>
                 </div>
               )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resolution Dialog */}
      <Dialog open={isResolving} onOpenChange={setIsResolving}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mark Enquiry as {resolveStatus}</DialogTitle>
            <DialogDescription>
              Please add a short note about how this enquiry was resolved. This will be saved in the timeline.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              autoFocus
              placeholder="e.g. Deal closed for 5 tons of packaging material."
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsResolving(false)}>Cancel</Button>
            <Button onClick={handleResolveSubmit} disabled={!resolutionNote.trim()}>Save & Update</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export { AdminEnquiries };
export default AdminEnquiries;
