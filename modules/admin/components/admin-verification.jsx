"use client";
import {
  FileCheck2,
  ShieldCheck,
  Download,
  ExternalLink,
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Building2,
  Phone,
  Mail,
  CreditCard,
  History,
  RotateCcw,
  Loader2,
  ArrowRight,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import { useState, useEffect } from "react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { VerificationBadge, StatusBadge, MembershipBadge } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Textarea } from "@shared/components/ui/textarea";
import { Label } from "@shared/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import { useVerificationQueue, useChapters } from "@shared/hooks/use-rifah-api";
import { verificationApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/api-client";
import { toast } from "sonner";
import { useAuth } from "@shared/providers/auth-provider";
import { cn } from "@shared/lib/utils";

function AdminVerification() {
  const { user } = useAuth();
  const isSuperAdmin = ["super_admin", "secretariat"].includes(user?.role);
  const [chapterFilter, setChapterFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  const { data: queueData, error, isLoading, refetch } = useVerificationQueue({
    chapter: chapterFilter,
    search: searchQuery,
  });
  const queue = Array.isArray(queueData) ? queueData : (queueData?.verifications || []);

  const { data: chaptersData } = useChapters();
  const chapters = Array.isArray(chaptersData) ? chaptersData : [];

  // Document Inspection State
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [secureDocUrl, setSecureDocUrl] = useState(null);
  const [verifiedDocs, setVerifiedDocs] = useState([]);

  // Decision Modal States
  const [decisionModal, setDecisionModal] = useState({
    open: false,
    type: null, // "approve" | "changes_required" | "reject"
    item: null,
    reason: "",
    submitting: false,
  });

  // Timeline Drawer / Modal
  const [historyModal, setHistoryModal] = useState({
    open: false,
    item: null,
  });

  useEffect(() => {
    if (selectedDoc?.fileUrl) {
      const url = resolveMediaUrl(selectedDoc.fileUrl);
      setSecureDocUrl(url);
    } else {
      setSecureDocUrl(null);
    }
  }, [selectedDoc]);

  if (error && error.status === 401) {
    return (
      <AppShell role="admin" title="Verification queue">
        <Panel className="p-12 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold">Session Expired</h2>
          <p className="text-muted-foreground mt-2 mb-6">
            Your admin session has expired. Please log out and log in again.
          </p>
          <Button asChild>
            <a href="/auth/login">Go to Login</a>
          </Button>
        </Panel>
      </AppShell>
    );
  }

  // Filter queue into tabs
  const pending = queue.filter(
    (b) => b.status === "pending" || b.status === "under_review" || !b.status
  );
  const changesReq = queue.filter(
    (b) => b.status === "changes_required" || b.status === "correction" || b.status === "correction_requested"
  );
  const approved = queue.filter((b) => b.status === "approved" || b.status === "verified");
  const rejected = queue.filter((b) => b.status === "rejected");

  const openDecisionModal = (item, type) => {
    setDecisionModal({
      open: true,
      type,
      item,
      reason: "",
      submitting: false,
    });
  };

  const handleExecuteDecision = async () => {
    const { type, item, reason } = decisionModal;
    if (!item?._id) return;

    if ((type === "changes_required" || type === "reject") && !reason.trim()) {
      toast.error(
        type === "changes_required"
          ? "Please provide instructions for the changes required."
          : "Please provide a reason for rejecting this application."
      );
      return;
    }

    setDecisionModal((prev) => ({ ...prev, submitting: true }));
    try {
      const statusMap = {
        approve: "verified",
        changes_required: "correction_requested",
        reject: "rejected",
      };

      await verificationApi.review(item._id, {
        status: statusMap[type],
        remarks: reason.trim(),
        reason: reason.trim(),
      });

      toast.success(
        type === "approve"
          ? `"${item.business?.name || "Business"}" verified & published live!`
          : type === "changes_required"
          ? "Change request sent to business owner."
          : "Application rejected."
      );

      setDecisionModal({ open: false, type: null, item: null, reason: "", submitting: false });
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to submit verification review.");
      setDecisionModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleVerifySingleDoc = () => {
    if (selectedDoc) {
      setVerifiedDocs((prev) => [...prev, selectedDoc.fileUrl]);
      toast.success(`${selectedDoc.name || selectedDoc.type} checked`);
      setSelectedDoc(null);
    }
  };

  const renderCard = (item) => {
    const biz = item.business || {};
    const owner = item.submittedBy || {};
    const status = item.status || "under_review";
    const docs = Array.isArray(item.documents) ? item.documents : [];
    const isUnderReview = status === "pending" || status === "under_review";
    const isChangesReq = status === "changes_required" || status === "correction" || status === "correction_requested";
    const isApproved = status === "approved" || status === "verified";
    const isRejected = status === "rejected";

    return (
      <div
        key={item._id}
        className={cn(
          "rounded-2xl border p-5 transition-all bg-card shadow-2xs hover:shadow-xs",
          isUnderReview && "border-amber-200/80 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/10",
          isChangesReq && "border-blue-200/80 dark:border-blue-900/40 bg-blue-50/20 dark:bg-blue-950/10",
          isApproved && "border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10",
          isRejected && "border-rose-200/80 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10"
        )}
      >
        {/* Header Header & Badges */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-border/60 pb-3.5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-foreground tracking-tight">
                {biz.name || "Business Applicant"}
              </h3>
              <VerificationBadge status={status} compact />
              {biz.membership && (
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {biz.membership} Tier
                </span>
              )}
              {biz.paymentStatus === "paid" ? (
                <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <CreditCard className="h-3 w-3" /> Paid
                </span>
              ) : (
                <span className="rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                  Payment: {biz.paymentStatus || "Pending"}
                </span>
              )}
            </div>

            <p className="mt-1 text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
              <span>{biz.industry || "General Industry"}</span>
              <span>•</span>
              <span>{biz.city || "India"}</span>
              <span>•</span>
              <span className="font-semibold text-foreground">{biz.chapter || "National"}</span>
              {biz.taxId && (
                <>
                  <span>•</span>
                  <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[11px] text-foreground">
                    GSTIN: {biz.taxId}
                  </span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start shrink-0">
            <button
              type="button"
              onClick={() => setHistoryModal({ open: true, item })}
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors"
            >
              <History className="h-3.5 w-3.5" />
              <span>Timeline</span>
            </button>
          </div>
        </div>

        {/* Applicant Details & Document Grid */}
        <div className="mt-3.5 grid gap-4 lg:grid-cols-2">
          {/* Owner & Submission Info */}
          <div className="space-y-2 rounded-xl bg-muted/40 p-3.5 text-xs">
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              <span>Applicant Information</span>
            </p>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Owner Name</span>
                <span className="font-medium text-foreground">{owner.name || "—"}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Owner Email</span>
                <span className="font-medium text-foreground truncate block">{owner.email || "—"}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Phone</span>
                <span className="font-medium text-foreground">{owner.phone || biz.phone || "—"}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Submitted At</span>
                <span className="font-medium text-foreground">
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-GB") : "Recently"}
                </span>
              </div>
            </div>

            {item.remarks && (
              <div className="mt-2 pt-2 border-t border-border/50">
                <span className="block text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">
                  Secretariat Remarks / Changes Requested
                </span>
                <p className="mt-0.5 text-xs text-foreground font-medium bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                  {item.remarks}
                </p>
              </div>
            )}
          </div>

          {/* Verification Documents */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FileCheck2 className="h-3.5 w-3.5 text-primary" />
                <span>Submitted Documents ({docs.length})</span>
              </p>
              <span className="text-[11px] text-muted-foreground">Click to inspect</span>
            </div>

            {docs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-3.5 text-center text-xs text-muted-foreground">
                No formal documents uploaded yet.
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {docs.map((d, i) => {
                  const isVerified = verifiedDocs.includes(d.fileUrl) || isApproved;
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-2 rounded-xl border border-border/80 bg-background/80 p-2.5 text-xs hover:border-primary/50 transition-all"
                    >
                      <div className="min-w-0 flex items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-primary" />
                        <span className="truncate font-medium capitalize" title={d.name || d.type}>
                          {(d.name || d.type || "Document").replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isVerified && <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />}
                        {d.fileUrl ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-primary font-semibold hover:bg-primary/10"
                            onClick={() => setSelectedDoc(d)}
                          >
                            {isVerified ? "View" : "Inspect"}
                          </Button>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">No file</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3.5">
          <div className="text-xs text-muted-foreground">
            {isApproved && item.reviewedBy && (
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Approved by {item.reviewedBy.name || "Secretariat"}
              </span>
            )}
            {isChangesReq && (
              <span className="text-blue-700 dark:text-blue-400 font-semibold flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> Changes requested from owner
              </span>
            )}
            {isRejected && (
              <span className="text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-1">
                <XCircle className="h-3.5 w-3.5" /> Application rejected
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isApproved && (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs gap-1.5"
                onClick={() => openDecisionModal(item, "approve")}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Approve & Publish Live</span>
              </Button>
            )}

            {!isChangesReq && !isApproved && (
              <Button
                size="sm"
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/40 font-semibold gap-1.5"
                onClick={() => openDecisionModal(item, "changes_required")}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Request Changes</span>
              </Button>
            )}

            {!isRejected && (
              <Button
                size="sm"
                variant="ghost"
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/30 font-semibold gap-1.5"
                onClick={() => openDecisionModal(item, "reject")}
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Reject</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppShell
      role="admin"
      title="Verification Queue"
      subtitle="Secretariat Business Compliance, Document Vetting & Approval Desk"
    >
      <div className="space-y-4">
        {/* Top Control Bar: Search & Chapter Scope */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by business name, GSTIN, email..."
              className="pl-9 h-10"
            />
          </div>

          {isSuperAdmin ? (
            <Select value={chapterFilter} onValueChange={setChapterFilter}>
              <SelectTrigger className="sm:max-w-[220px] h-10">
                <SelectValue placeholder="Filter by chapter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chapters</SelectItem>
                {chapters.map((ch) => (
                  <SelectItem key={ch._id || ch.name} value={ch.name}>
                    {ch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex h-10 items-center justify-between rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-primary font-medium sm:max-w-[220px] truncate">
              {user?.chapter
                ? `${user.chapter.replace(/\s*[Cc]hapter\s*/g, "")}'s Queue`
                : "Your Chapter Queue"}
            </div>
          )}
        </div>

        {/* Top Stat Cards / Tab Selectors */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div
            onClick={() => setActiveTab("pending")}
            className={cn(
              "cursor-pointer transition-transform active:scale-95 rounded-2xl",
              activeTab === "pending" ? "ring-2 ring-primary ring-offset-1 bg-primary/5" : ""
            )}
          >
            <StatCard
              label="Awaiting Review"
              value={String(pending.length)}
              icon={ShieldCheck}
              tone="warning"
              hint="Requires verification"
            />
          </div>
          <div
            onClick={() => setActiveTab("changes")}
            className={cn(
              "cursor-pointer transition-transform active:scale-95 rounded-2xl",
              activeTab === "changes" ? "ring-2 ring-primary ring-offset-1 bg-primary/5" : ""
            )}
          >
            <StatCard
              label="Changes Requested"
              value={String(changesReq.length)}
              icon={RotateCcw}
              tone="primary"
              hint="Waiting for owner resubmission"
            />
          </div>
          <div
            onClick={() => setActiveTab("approved")}
            className={cn(
              "cursor-pointer transition-transform active:scale-95 rounded-2xl",
              activeTab === "approved" ? "ring-2 ring-primary ring-offset-1 bg-primary/5" : ""
            )}
          >
            <StatCard
              label="Approved / Verified"
              value={String(approved.length)}
              icon={CheckCircle2}
              tone="success"
              hint="Live on directory"
            />
          </div>
          <div
            onClick={() => setActiveTab("all")}
            className={cn(
              "cursor-pointer transition-transform active:scale-95 rounded-2xl",
              activeTab === "all" ? "ring-2 ring-primary ring-offset-1 bg-primary/5" : ""
            )}
          >
            <StatCard
              label="Total"
              value={String(queue.length)}
              icon={Building2}
              hint="All submissions"
            />
          </div>
        </div>

        {/* Tabbed Queue List */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto h-11 p-1 bg-muted/70 rounded-xl">
            <TabsTrigger value="pending" className="rounded-lg text-xs font-semibold">
              Awaiting Review ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="changes" className="rounded-lg text-xs font-semibold">
              Changes Requested ({changesReq.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="rounded-lg text-xs font-semibold">
              Verified & Live ({approved.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="rounded-lg text-xs font-semibold">
              Rejected ({rejected.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="rounded-lg text-xs font-semibold">
              All Submissions ({queue.length})
            </TabsTrigger>
          </TabsList>

          {[
            ["pending", pending],
            ["changes", changesReq],
            ["approved", approved],
            ["rejected", rejected],
            ["all", queue],
          ].map(([key, rows]) => (
            <TabsContent key={key} value={key} className="mt-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm font-medium">Loading verification queue...</p>
                </div>
              ) : rows.length === 0 ? (
                <Panel className="p-8">
                  <EmptyState
                    icon={ShieldCheck}
                    title="No applications in this view"
                    description={
                      searchQuery
                        ? `No results matching "${searchQuery}".`
                        : "Submissions will appear here as businesses register."
                    }
                  />
                </Panel>
              ) : (
                <div className="space-y-3.5">{rows.map(renderCard)}</div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* 1. Secure Document Inspector Modal */}
      <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
        <DialogContent className="max-w-4xl h-[88vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b bg-muted/20 flex flex-row items-center justify-between">
            <DialogTitle className="truncate text-base font-bold">
              {selectedDoc?.name || selectedDoc?.type || "Verification Document"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden p-3 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900">
            {secureDocUrl ? (
              (selectedDoc?.fileUrl?.toLowerCase().endsWith(".pdf") ||
              selectedDoc?.name?.toLowerCase().endsWith(".pdf") ||
              secureDocUrl.toLowerCase().includes(".pdf")) ? (
                <div className="w-full h-full flex flex-col relative">
                  <iframe
                    src={secureDocUrl}
                    title={selectedDoc?.name || "PDF Document"}
                    className="w-full flex-1 border rounded-lg bg-white shadow-sm"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <a
                      href={secureDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-white/95 hover:bg-white border shadow-sm text-foreground backdrop-blur transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Open Fullscreen ↗
                    </a>
                  </div>
                </div>
              ) : (
                <img
                  src={secureDocUrl}
                  alt={selectedDoc?.name || "Document"}
                  className="max-w-full max-h-full object-contain shadow-sm border bg-white rounded-lg"
                />
              )
            ) : selectedDoc?.fileUrl ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground animate-pulse">
                <FileText className="h-8 w-8 text-primary" />
                <p className="text-sm">Loading secure document...</p>
              </div>
            ) : null}
          </div>

          <div className="p-4 border-t bg-background flex items-center justify-between">
            {secureDocUrl ? (
              <div className="flex items-center gap-3">
                <a
                  href={secureDocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Open in new tab ↗
                </a>
                <span className="text-muted-foreground text-xs">•</span>
                <a
                  href={secureDocUrl}
                  download={selectedDoc?.name || "document.pdf"}
                  className="text-xs font-semibold text-muted-foreground hover:underline inline-flex items-center gap-1"
                >
                  <Download className="h-3.5 w-3.5" /> Download PDF
                </a>
              </div>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setSelectedDoc(null)}>
                Close
              </Button>
              <Button onClick={handleVerifySingleDoc} className="bg-primary text-primary-foreground">
                Mark as Checked
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 2. Decision Suite Modal (Approve / Request Changes / Reject) */}
      <Dialog
        open={decisionModal.open}
        onOpenChange={(open) => !open && setDecisionModal((p) => ({ ...p, open: false }))}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              {decisionModal.type === "approve" && (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span>Approve & Publish Business</span>
                </>
              )}
              {decisionModal.type === "changes_required" && (
                <>
                  <RotateCcw className="h-5 w-5 text-blue-600" />
                  <span>Request Changes from Owner</span>
                </>
              )}
              {decisionModal.type === "reject" && (
                <>
                  <XCircle className="h-5 w-5 text-rose-600" />
                  <span>Reject Application</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {decisionModal.type === "approve" &&
                `Approving "${decisionModal.item?.business?.name}" will grant verified chamber status, activate their listing on the public directory, and notify the owner via email.`}
              {decisionModal.type === "changes_required" &&
                `Please detail the required corrections for "${decisionModal.item?.business?.name}". The owner will be notified to update their profile and resubmit.`}
              {decisionModal.type === "reject" &&
                `Please specify the reason for rejecting "${decisionModal.item?.business?.name}". The owner will receive formal notification.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {decisionModal.type === "approve" ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/40 dark:bg-emerald-950/20 p-3.5 text-xs text-emerald-900 dark:text-emerald-300 space-y-2">
                <p className="font-semibold">Summary of Approval Action:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                  <li>Sets verification status to <strong className="text-emerald-600">VERIFIED</strong></li>
                  <li>Publishes profile to RIFAH Public Directory</li>
                  <li>Dispatches official verification email to applicant</li>
                </ul>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="admin-reason" className="text-xs font-semibold">
                  {decisionModal.type === "changes_required"
                    ? "Correction Instructions (Mandatory) *"
                    : "Rejection Reason (Mandatory) *"}
                </Label>
                <Textarea
                  id="admin-reason"
                  rows={4}
                  required
                  value={decisionModal.reason}
                  onChange={(e) => setDecisionModal((p) => ({ ...p, reason: e.target.value }))}
                  placeholder={
                    decisionModal.type === "changes_required"
                      ? "e.g. Please upload a clear GST Registration Certificate and provide your official business premises photo."
                      : "e.g. Entity registration number could not be validated against official registrar records."
                  }
                  className="text-xs"
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              disabled={decisionModal.submitting}
              onClick={() => setDecisionModal((p) => ({ ...p, open: false }))}
            >
              Cancel
            </Button>
            <Button
              disabled={decisionModal.submitting}
              onClick={handleExecuteDecision}
              className={cn(
                "font-semibold text-white",
                decisionModal.type === "approve"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : decisionModal.type === "changes_required"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-rose-600 hover:bg-rose-700"
              )}
            >
              {decisionModal.submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Processing...
                </>
              ) : decisionModal.type === "approve" ? (
                "Confirm Approval"
              ) : decisionModal.type === "changes_required" ? (
                "Send Change Request"
              ) : (
                "Confirm Rejection"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Verification History & Audit Timeline Modal */}
      <Dialog
        open={historyModal.open}
        onOpenChange={(open) => !open && setHistoryModal({ open: false, item: null })}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <History className="h-4 w-4 text-primary" />
              <span>Verification Audit Trail — {historyModal.item?.business?.name}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto space-y-3 py-2 pr-1">
            {Array.isArray(historyModal.item?.business?.verificationHistory) &&
            historyModal.item.business.verificationHistory.length > 0 ? (
              <div className="relative border-l-2 border-primary/20 ml-3 space-y-4 pl-4 py-1">
                {historyModal.item.business.verificationHistory.map((h, i) => (
                  <div key={i} className="relative">
                    <span className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground capitalize">
                        {(h.action || h.status || "Update").replace(/_/g, " ")}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {h.createdAt ? new Date(h.createdAt).toLocaleString("en-GB") : "—"}
                      </span>
                    </div>
                    {h.reason && (
                      <p className="mt-1 text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
                        {h.reason}
                      </p>
                    )}
                    {h.reviewedByName && (
                      <p className="mt-0.5 text-[10px] text-slate-400">By: {h.reviewedByName}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No previous history events recorded for this application.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export { AdminVerification };
export default AdminVerification;
