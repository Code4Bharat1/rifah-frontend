"use client";
import { useState, useMemo } from "react";
import { Inbox, MessageSquare, MoreHorizontal, Clock, AlertCircle, ShieldCheck, MapPin, UserCheck, Eye, Download, Target, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill, StatusBadge } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { useAllEnquiries, useChapters, useAdminUsers, useStates } from "@shared/hooks/use-rifah-api";
import { useDebounce } from "@shared/hooks/use-debounce";
import { enquiryApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/api-client";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from "@shared/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@shared/components/ui/dialog";
import { useAuth } from "@shared/providers/auth-provider";

function AdminEnquiries() {
  const { user } = useAuth();
  const currentRole = user?.role === "state_admin"
    ? "state_admin"
    : user?.role === "chapter_admin"
      ? "chapter_admin"
      : "admin";

  const subtitle = user?.role === "state_admin"
    ? `State Enquiry Desk · Buyer sourcing RFQs routed across ${user?.state ? user.state + " " : ""}chapters`
    : user?.role === "chapter_admin"
      ? "Chapter Enquiry Desk · Buyer sourcing RFQs for your chapter"
      : "Buyer sourcing RFQs routed across chamber network";

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [chapterFilter, setChapterFilter] = useState("all");

  const { data: enquiriesData } = useAllEnquiries({
    search: debouncedSearch || undefined,
    status: statusFilter,
    type: typeFilter,
    chapter: chapterFilter,
  });
  const enquiries = Array.isArray(enquiriesData) ? enquiriesData : [];

  const { data: chaptersData } = useChapters();
  const chapters = Array.isArray(chaptersData) ? chaptersData : [];

  const { data: adminUsersData } = useAdminUsers({ limit: 100 });
  const adminUsers = Array.isArray(adminUsersData)
    ? adminUsersData.filter(u => ["central_admin", "state_admin", "chapter_admin"].includes(u.role))
    : [];

  const { data: statesData } = useStates();

  // Consolidate all State Admins across admin users and allocated state records
  const stateAdminList = useMemo(() => {
    const list = [];
    const seenIds = new Set();

    if (Array.isArray(adminUsersData)) {
      adminUsersData
        .filter((u) => u.role === "state_admin")
        .forEach((u) => {
          if (!seenIds.has(String(u._id))) {
            seenIds.add(String(u._id));
            list.push({
              _id: u._id,
              name: u.name,
              email: u.email,
              state: u.state || "",
              phone: u.phone || "",
            });
          }
        });
    }

    if (Array.isArray(statesData)) {
      statesData.forEach((s) => {
        if (s.admin && s.admin._id && !seenIds.has(String(s.admin._id))) {
          seenIds.add(String(s.admin._id));
          list.push({
            _id: s.admin._id,
            name: s.admin.name,
            email: s.admin.email,
            state: s.admin.state || s.state || "",
            phone: s.admin.phone || "",
          });
        }
      });
    }

    return list;
  }, [adminUsersData, statesData]);

  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");
  const [resolveStatus, setResolveStatus] = useState("");
  const [resolvingId, setResolvingId] = useState(null);

  // State Admin Assignment Modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningEnquiry, setAssigningEnquiry] = useState(null);
  const [selectedStateAdminId, setSelectedStateAdminId] = useState("");
  const [assignRoutingNote, setAssignRoutingNote] = useState("");
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false);

  const handleOpenAssignModal = (enquiry) => {
    setAssigningEnquiry(enquiry);
    const currentAdminId = enquiry?.assignedTo?._id || enquiry?.assignedTo;
    setSelectedStateAdminId(currentAdminId || (stateAdminList[0]?._id || ""));
    setAssignRoutingNote("");
    setIsAssignModalOpen(true);
  };

  const handleQuickAssignStateAdmin = async (enquiry, stateAdmin) => {
    try {
      await enquiryApi.updateStatus(enquiry._id, {
        assignedTo: stateAdmin._id,
        status: "Routed",
        timelineUpdate: {
          label: `Assigned to State Admin (${stateAdmin.name}${stateAdmin.state ? ` - ${stateAdmin.state}` : ""})`,
          at: new Date().toISOString(),
        },
      });
      toast.success(`Enquiry assigned to State Admin (${stateAdmin.name})`);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to assign to State Admin");
    }
  };

  const handleConfirmAssignModal = async () => {
    if (!assigningEnquiry || !selectedStateAdminId) {
      toast.error("Please select a State Admin");
      return;
    }
    const adminObj = stateAdminList.find((sa) => String(sa._id) === String(selectedStateAdminId));
    const adminLabel = adminObj ? `${adminObj.name}${adminObj.state ? ` - ${adminObj.state}` : ""}` : "State Admin";
    setIsSubmittingAssign(true);
    try {
      await enquiryApi.updateStatus(assigningEnquiry._id, {
        assignedTo: selectedStateAdminId,
        status: "Routed",
        resolutionNote: assignRoutingNote.trim() || undefined,
        timelineUpdate: {
          label: `Assigned to State Admin (${adminLabel})`,
          at: new Date().toISOString(),
        },
      });
      toast.success(`Enquiry successfully assigned & routed to ${adminObj?.name || "State Admin"}`);
      setIsAssignModalOpen(false);
      setAssigningEnquiry(null);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to assign State Admin");
    } finally {
      setIsSubmittingAssign(false);
    }
  };

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
      role={currentRole}
      title="Enquiries"
      subtitle={subtitle}
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
            icon={AlertCircle}
            tone="warning"
            active={statusFilter === "New"}
            onClick={() => setStatusFilter("New")}
          />
          <StatCard label="Avg. first response" value="9.4 hrs" icon={Clock} tone="info" />
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
                  <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => setSelectedEnquiry(r)}>
                    <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
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
                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => setSelectedEnquiry(r)}>
                      <Eye className="h-3.5 w-3.5" /> View Details
                    </Button>
                  </div>
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

            {/* Attached Reference Photos */}
            {Boolean(selectedEnquiry?.images?.length) && (
              <div className="rounded-xl border border-border p-3.5 text-xs space-y-2 bg-muted/30">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    Attached Reference Photos ({selectedEnquiry.images.length})
                  </span>
                  <span className="text-[11px] text-muted-foreground">Click photo to zoom</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {selectedEnquiry.images.map((img, idx) => {
                    const resolved = resolveMediaUrl(img);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPreviewImage(resolved)}
                        className="group relative aspect-video sm:aspect-square rounded-lg overflow-hidden border border-border bg-black/5 hover:border-primary/50 transition-all text-left focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <img
                          src={resolved}
                          alt={`Attachment ${idx + 1}`}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye className="h-4 w-4" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </DialogContent>
      </Dialog>

      {/* Full Image Preview Lightbox */}
      <Dialog open={Boolean(previewImage)} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-3xl p-2 bg-background/95 backdrop-blur-md">
          <div className="relative flex flex-col items-center justify-center p-2">
            {previewImage && (
              <img
                src={previewImage}
                alt="Enquiry attachment full view"
                className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
              />
            )}
            <div className="mt-3 flex items-center justify-between w-full px-2 text-xs text-muted-foreground">
              <span>Attachment Preview</span>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1.5"
                onClick={() => window.open(previewImage, "_blank")}
              >
                <Download className="h-3.5 w-3.5" /> Open in New Tab
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign to State Admin Dialog */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Assign Enquiry to State Admin
            </DialogTitle>
            <DialogDescription>
              Route this buyer requirement directly to a regional State Admin for execution and supplier routing.
            </DialogDescription>
          </DialogHeader>

          {assigningEnquiry && (
            <div className="space-y-4 py-2">
              {/* Enquiry Quick Summary Card */}
              <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-primary font-mono">ENQ-{assigningEnquiry._id?.slice(-4).toUpperCase() || "1000"}</span>
                  <StatusBadge status={assigningEnquiry.status} />
                </div>
                <p className="text-sm font-semibold text-foreground truncate">{assigningEnquiry.title}</p>
                <p className="text-muted-foreground">
                  Buyer: {assigningEnquiry.requesterName || assigningEnquiry.buyerName || "Registered Buyer"} · Location: {assigningEnquiry.city || assigningEnquiry.location || "Not specified"}
                </p>
              </div>

              {/* State Admin Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                  <span>Select State Admin</span>
                  <span className="text-[11px] font-normal text-muted-foreground">
                    {stateAdminList.length} registered
                  </span>
                </div>

                {stateAdminList.length === 0 ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
                    <p className="font-semibold">No State Admins configured yet</p>
                    <p className="mt-0.5">Please allocate a State Admin in the <strong>States</strong> section first.</p>
                  </div>
                ) : (
                  <Select value={selectedStateAdminId} onValueChange={setSelectedStateAdminId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a State Admin..." />
                    </SelectTrigger>
                    <SelectContent>
                      {stateAdminList.map((sa) => (
                        <SelectItem key={sa._id} value={sa._id}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{sa.name}</span>
                            {sa.state && (
                              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                {sa.state}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">({sa.email})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Routing / Handover Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Handover Instructions / Note <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <Input
                  placeholder="e.g. Please coordinate with regional suppliers for prompt fulfillment..."
                  value={assignRoutingNote}
                  onChange={(e) => setAssignRoutingNote(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAssignModal}
              disabled={isSubmittingAssign || !selectedStateAdminId || stateAdminList.length === 0}
              className="gap-1.5"
            >
              {isSubmittingAssign ? (
                <>Saving...</>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Assign & Route
                </>
              )}
            </Button>
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
