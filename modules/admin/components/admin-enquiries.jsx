"use client";
import { useState } from "react";
import { Inbox, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill, StatusBadge } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { useAllEnquiries, useChapters } from "@shared/hooks/use-rifah-api";
import { enquiryApi } from "@shared/lib/api-services";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@shared/components/ui/dialog";
import { Download, Target } from "lucide-react";

function AdminEnquiries() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [chapterFilter, setChapterFilter] = useState("all");

  const { data: enquiriesData } = useAllEnquiries({
    search: search || undefined,
    status: statusFilter,
    type: typeFilter,
    chapter: chapterFilter,
  });
  const enquiries = Array.isArray(enquiriesData) ? enquiriesData : [];

  const { data: chaptersData } = useChapters();
  const chapters = Array.isArray(chaptersData) ? chaptersData : [];

  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

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
          <StatCard
            label="Enquiries"
            value={String(enquiries.length)}
            icon={Inbox}
            tone="primary"
            active={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
          />
          <StatCard
            label="Responded"
            value={String(enquiries.filter((e) => e.responses?.length > 0).length)}
            icon={MessageSquare}
            tone="success"
            active={statusFilter === "Responded"}
            onClick={() => setStatusFilter("Responded")}
          />
          <StatCard
            label="Unmatched"
            value={String(enquiries.filter((e) => !e.responses || e.responses.length === 0).length)}
            tone="warning"
            active={statusFilter === "New"}
            onClick={() => setStatusFilter("New")}
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
              { key: "responses", header: "RESPONSES", cell: (r) => r.responses?.length || 0 },
              {
                key: "action",
                header: "",
                cell: (r) => (
                  <Button variant="outline" size="sm" onClick={() => setSelectedEnquiry(r)}>
                    View Details
                  </Button>
                ),
              },
            ]}
            mobile={(r) => (
              <div className="rounded-xl border border-border p-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{r.title}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {r.requesterName || r.buyerName} · {r.city || r.location}
                  </p>
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
    </AppShell>
  );
}

export { AdminEnquiries };
export default AdminEnquiries;
