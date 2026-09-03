"use client";
import { useState } from "react";
import { Target, Download } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill, StatusBadge } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { useAllEnquiries, useBusinesses } from "@shared/hooks/use-rifah-api";
import { leadApi } from "@shared/lib/api-services";
import { Button } from "@shared/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@shared/components/ui/dialog";
import { ScrollArea } from "@shared/components/ui/scroll-area";

function AdminLeads() {
  const { data: enquiriesData, refetch: refetchEnquiries } = useAllEnquiries();
  const enquiries = Array.isArray(enquiriesData) ? enquiriesData : [];
  
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedBusinessIds, setSelectedBusinessIds] = useState([]);
  const [isRouting, setIsRouting] = useState(false);

  // Fetch businesses for routing (in a real app, you'd filter by category or allow search)
  const { data: businessesData } = useBusinesses();
  const businesses = Array.isArray(businessesData) ? businessesData : [];

  const handleRouteLead = async () => {
    if (!selectedLead || selectedBusinessIds.length === 0) return;
    setIsRouting(true);
    try {
      await leadApi.routeLead({
        enquiryId: selectedLead._id,
        businessIds: selectedBusinessIds,
      });
      alert("Lead routed successfully!");
      setSelectedLead(null);
      setSelectedBusinessIds([]);
      refetchEnquiries();
    } catch (error) {
      alert(error.message || "Failed to route lead.");
    } finally {
      setIsRouting(false);
    }
  };

  const handleOpenLead = (lead) => {
    setSelectedLead(lead);
    setSelectedBusinessIds([]);
  };

  return (
    <AppShell 
      role="admin" 
      title="Lead routing" 
      subtitle="Matching buyer requirements to verified enterprises"
      actions={
        <Button variant="outline" onClick={async () => {
          try {
            toast.info("Exporting leads...");
            const token = localStorage.getItem("rifah_token");
            const response = await fetch("http://localhost:3001/api/leads/export/csv", {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Export failed");
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "leads_export.csv";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.success("Export completed successfully!");
          } catch (e) {
            toast.error("Failed to export leads");
          }
        }}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total leads" value={String(enquiries.length)} icon={Target} tone="primary" />
          <StatCard label="Direct RFQs" value={String(enquiries.filter((e) => e.business).length)} tone="success" />
          <StatCard label="Broadcast RFQs" value={String(enquiries.filter((e) => !e.business).length)} tone="warning" />
          <StatCard label="Routing Desk" value="Active" />
        </div>

        <Panel title="Routing worklist">
          <ResponsiveTable
            rows={enquiries}
            empty={<EmptyState icon={Target} title="No leads to route" description="New buyer requirements appear here." />}
            columns={[
              { key: "title", header: "Requirement", cell: (r) => <span className="font-semibold">{r.title}</span> },
              { key: "category", header: "Category", cell: (r) => r.category },
              { key: "buyer", header: "Buyer", cell: (r) => r.requesterName || r.buyerName || "Registered Buyer" },
              { key: "location", header: "Location", cell: (r) => r.city || r.location },
              { key: "quantity", header: "Quantity", cell: (r) => r.quantity || "On request" },
              { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
              { key: "action", header: "", cell: (r) => (
                <Button variant="outline" size="sm" onClick={() => handleOpenLead(r)}>Route</Button>
              )}
            ]}
            mobile={(r) => (
              <div className="rounded-xl border border-border p-3.5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{r.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {r.category} · {r.city || r.location}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1.5">
                   <div></div>
                   <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleOpenLead(r)}>Route Lead</Button>
                </div>
              </div>
            )}
          />
        </Panel>
      </div>

      <Dialog open={!!selectedLead} onOpenChange={(o) => !o && setSelectedLead(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
          <div className="p-6 pb-4 border-b border-border">
            <DialogTitle className="text-xl">{selectedLead?.title}</DialogTitle>
            <DialogDescription className="mt-1">
              {selectedLead?.category} · {selectedLead?.business ? "Direct RFQ" : "Broadcast RFQ"}
            </DialogDescription>
          </div>
          
          <div className="flex-1 overflow-hidden grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Left: Lead Details */}
            <div className="h-[50vh] md:h-full overflow-y-auto p-6 bg-muted/20">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Lead Description</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedLead?.description || "No description provided."}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 rounded-lg bg-surface border border-border p-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Buyer Details</p>
                    <p className="text-sm font-semibold mt-0.5">{selectedLead?.requesterName || selectedLead?.buyerName || "Registered Buyer"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Target Location</p>
                    <p className="text-sm font-semibold mt-0.5">{selectedLead?.city || selectedLead?.location || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Volume / Quantity</p>
                    <p className="text-sm font-semibold mt-0.5">{selectedLead?.quantity || "On request"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Estimated Budget</p>
                    <p className="text-sm font-semibold mt-0.5">{selectedLead?.budget || "To be discussed"}</p>
                  </div>
                </div>
                
                <div>
                   <p className="text-xs font-medium text-muted-foreground mb-2">Current Routing Status</p>
                   <StatusBadge status={selectedLead?.status} />
                </div>
              </div>
            </div>

            {/* Right: Select Businesses */}
            <div className="flex flex-col h-[50vh] md:h-full overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/50">
                <h4 className="font-semibold text-sm">Select Members for Routing</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Check the verified businesses you want to forward this RFQ to.</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                  {businesses.map((b) => (
                    <label key={b._id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-surface hover:bg-muted/50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={selectedBusinessIds.includes(b._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBusinessIds([...selectedBusinessIds, b._id]);
                          } else {
                            setSelectedBusinessIds(selectedBusinessIds.filter(id => id !== b._id));
                          }
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground">{b.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{b.industry} · {b.city}</p>
                      </div>
                      {b.verification === "verified" && (
                        <div className="shrink-0 flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-600">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>
              <div className="p-4 border-t border-border bg-surface flex justify-between items-center">
                <span className="text-sm font-medium">{selectedBusinessIds.length} selected</span>
                <Button onClick={handleRouteLead} disabled={selectedBusinessIds.length === 0 || isRouting}>
                  {isRouting ? "Routing..." : "Route Lead"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export { AdminLeads };
export default AdminLeads;
