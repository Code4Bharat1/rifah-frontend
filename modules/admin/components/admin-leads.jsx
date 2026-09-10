"use client";
import { useState } from "react";
import { Target, Download, Lock } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill, StatusBadge } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { useAllEnquiries, useBusinesses, useChapters } from "@shared/hooks/use-rifah-api";
import { leadApi, enquiryApi } from "@shared/lib/api-services";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@shared/components/ui/dialog";
import { ScrollArea } from "@shared/components/ui/scroll-area";
import { useAuth } from "@shared/providers/auth-provider";

function AdminLeads() {
  const { user } = useAuth();
  const isSuperAdmin = ["super_admin", "secretariat"].includes(user?.role);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [chapterFilter, setChapterFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("total");

  const { data: enquiriesData, refetch: refetchEnquiries } = useAllEnquiries({
    search: search || undefined,
    status: statusFilter,
    type: typeFilter,
    chapter: chapterFilter,
  });
  const enquiries = Array.isArray(enquiriesData) ? enquiriesData : [];
  
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedBusinessIds, setSelectedBusinessIds] = useState([]);
  const [isRouting, setIsRouting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [routingSearch, setRoutingSearch] = useState("");

  // Fetch businesses for routing (in a real app, you'd filter by category or allow search)
  const { data: businessesData } = useBusinesses();
  const { data: chaptersData } = useChapters();
  const chapters = Array.isArray(chaptersData) ? chaptersData : [];
  const businesses = Array.isArray(businessesData) ? businessesData : [];

  const filteredEnquiries = enquiries.filter(e => {
    if (activeTab === "direct") return !!e.business;
    if (activeTab === "broadcast") return !e.business;
    return true;
  });

  const canRouteLead = (lead) => {
    if (!lead) return false;
    if (isSuperAdmin) return !lead.chapterId || lead.status === "Escalated";
    return Boolean(lead.chapterId) && String(lead.chapterId) === String(user?.chapterId) && lead.status !== "Escalated";
  };

  const displayBusinesses = businesses
    .filter(b => isSuperAdmin || String(b.chapterId) === String(user?.chapterId))
    .filter(b => {
      if (!routingSearch) return true;
      const term = routingSearch.toLowerCase();
      return b.name?.toLowerCase().includes(term) || b.industry?.toLowerCase().includes(term) || b.categories?.some(c => c.toLowerCase().includes(term));
    })
    .sort((a, b) => {
      // Prioritize matching category
      const aMatchesCategory = selectedLead?.category && (a.industry === selectedLead.category || a.categories?.includes(selectedLead.category)) ? 1 : 0;
      const bMatchesCategory = selectedLead?.category && (b.industry === selectedLead.category || b.categories?.includes(selectedLead.category)) ? 1 : 0;
      if (aMatchesCategory !== bMatchesCategory) return bMatchesCategory - aMatchesCategory;

      // Premium/Enterprise members first
      const aPremium = ["Premium", "Enterprise", "premium", "enterprise"].includes(a.membership) ? 1 : 0;
      const bPremium = ["Premium", "Enterprise", "premium", "enterprise"].includes(b.membership) ? 1 : 0;
      if (aPremium !== bPremium) return bPremium - aPremium;
      // Verified next
      const aVerified = ["verified", "Verified"].includes(a.verification) ? 1 : 0;
      const bVerified = ["verified", "Verified"].includes(b.verification) ? 1 : 0;
      return bVerified - aVerified;
    });

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

  const handleEscalate = async () => {
    if (!selectedLead) return;
    setIsRouting(true);
    try {
      await enquiryApi.escalate(selectedLead._id, "Escalated to Head Office by Chapter Admin");
      toast.success("Lead escalated to Head Office successfully!");
      setSelectedLead(null);
      refetchEnquiries();
    } catch (error) {
      toast.error(error.message || "Failed to escalate lead.");
    } finally {
      setIsRouting(false);
    }
  };

  const handleOpenLead = (lead) => {
    setSelectedLead(lead);
    setSelectedBusinessIds([]);
    setRoutingSearch("");
  };

  return (
    <AppShell 
      role="admin" 
      title="Lead routing" 
      subtitle="Matching buyer requirements to verified enterprises"
      actions={
        <Button variant="outline" disabled={isExporting} onClick={async () => {
          try {
            setIsExporting(true);
            toast.info("Exporting leads...");
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
            a.download = `leads_export_${new Date().toISOString().split("T")[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.success("Export completed successfully!");
          } catch (e) {
            toast.error("Failed to export leads");
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
          <div className={`cursor-pointer transition-all ${activeTab === 'total' ? 'ring-2 ring-primary rounded-xl' : 'opacity-80 hover:opacity-100'}`} onClick={() => setActiveTab('total')}>
            <StatCard label="Total leads" value={String(enquiries.length)} icon={Target} tone="primary" />
          </div>
          <div className={`cursor-pointer transition-all ${activeTab === 'direct' ? 'ring-2 ring-primary rounded-xl' : 'opacity-80 hover:opacity-100'}`} onClick={() => setActiveTab('direct')}>
            <StatCard label="Direct RFQs" value={String(enquiries.filter((e) => e.business).length)} tone="success" />
          </div>
          <div className={`cursor-pointer transition-all ${activeTab === 'broadcast' ? 'ring-2 ring-primary rounded-xl' : 'opacity-80 hover:opacity-100'}`} onClick={() => setActiveTab('broadcast')}>
            <StatCard label="Broadcast RFQs" value={String(enquiries.filter((e) => !e.business).length)} tone="warning" />
          </div>
          <StatCard label="Routing Desk" value="Active" />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input 
            placeholder="Search leads by title or buyer..." 
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
          {isSuperAdmin ? (
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
          ) : (
            <div className="flex h-10 items-center justify-between rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-primary font-medium sm:max-w-[180px] truncate" title={user?.chapter ? `${user.chapter.replace(/\s*[Cc]hapter\s*/g, '')}'s Leads` : "Your Leads"}>
              {user?.chapter ? `${user.chapter.replace(/\s*[Cc]hapter\s*/g, '')}'s Leads` : "Your Leads"}
            </div>
          )}
        </div>

        <Panel title="Routing worklist">
          <ResponsiveTable
            rows={filteredEnquiries}
            empty={<EmptyState icon={Target} title="No leads to route" description="New buyer requirements appear here." />}
            columns={[
              { key: "title", header: "Requirement", cell: (r) => <span className="font-semibold">{r.title}</span> },
              { key: "category", header: "Category", cell: (r) => r.category },
              { key: "buyer", header: "Buyer", cell: (r) => r.requesterName || r.requester?.name || r.buyerName || "Registered Buyer" },
              { key: "location", header: "Location", cell: (r) => r.city || r.location },
              { key: "quantity", header: "Quantity", cell: (r) => r.quantity || "On request" },
              { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
              ...(isSuperAdmin ? [{ key: "chapter", header: "Chapter", cell: (r) => (
                <span className="text-xs text-muted-foreground">{r.chapter || "Unassigned"}</span>
              )}] : []),
              { key: "action", header: "", cell: (r) => (
                <Button variant="outline" size="sm" onClick={() => handleOpenLead(r)}>
                  {canRouteLead(r) ? "Route" : "View"}
                </Button>
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
                   <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleOpenLead(r)}>
                     {canRouteLead(r) ? "Route Lead" : "View Lead"}
                   </Button>
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
                    <p className="text-sm font-semibold mt-0.5">{selectedLead?.requesterName || selectedLead?.requester?.name || selectedLead?.buyerName || "Registered Buyer"}</p>
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

            {/* Right: Select Businesses (only rendered when the viewer is actually allowed to route this lead) */}
            <div className="flex flex-col h-[50vh] md:h-full overflow-hidden">
              {canRouteLead(selectedLead) ? (
                <>
                  <div className="p-4 border-b border-border bg-muted/50">
                    <h4 className="font-semibold text-sm">Select Members for Routing</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Check the verified businesses you want to forward this RFQ to.</p>
                    <div className="mt-3">
                      <Input
                        placeholder="Search businesses or industry..."
                        value={routingSearch}
                        onChange={(e) => setRoutingSearch(e.target.value)}
                        className="h-8 text-xs bg-surface"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-3">
                      {displayBusinesses.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">No matching businesses found in your chapter.</p>
                      )}
                      {displayBusinesses.map((b) => (
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
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-foreground">{b.name}</p>
                              {["Premium", "Enterprise", "premium", "enterprise"].includes(b.membership) && (
                                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">Priority</span>
                              )}
                              {selectedLead?.category && (b.industry === selectedLead.category || b.categories?.includes(selectedLead.category)) && (
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">Category Match</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{b.industry} · {b.city}</p>
                          </div>
                          {["verified", "Verified"].includes(b.verification) && (
                            <div className="shrink-0 flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-600" title="Verified">
                              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                            </div>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 border-t border-border bg-surface flex justify-between items-center gap-2">
                    {!isSuperAdmin && (
                      <Button variant="outline" onClick={handleEscalate} disabled={isRouting}>
                        {isRouting ? "Escalating..." : "Escalate to Head Office"}
                      </Button>
                    )}
                    <div className="flex items-center gap-3 ml-auto">
                      <span className="text-sm font-medium">{selectedBusinessIds.length} selected</span>
                      <Button onClick={handleRouteLead} disabled={selectedBusinessIds.length === 0 || isRouting}>
                        {isRouting ? "Routing..." : "Route Lead"}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-amber-600">
                    <Lock className="h-6 w-6" />
                  </div>
                  {isSuperAdmin ? (
                    <>
                      <h4 className="font-semibold text-sm">Routing Locked</h4>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        This lead belongs to {selectedLead?.chapter || "a chapter"}. Only that chapter&apos;s admin can route it — Head Office can only route once it has been escalated.
                      </p>
                    </>
                  ) : (
                    <>
                      <h4 className="font-semibold text-sm">No Longer Yours to Route</h4>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        This lead has been escalated to Head Office. Only Head Office can route it from here.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export { AdminLeads };
export default AdminLeads;
