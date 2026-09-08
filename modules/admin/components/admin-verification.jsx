"use client";
import { FileCheck2, ShieldCheck, Download, ExternalLink, FileText } from "lucide-react";
import { useState, useEffect } from "react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill, VerificationBadge } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@shared/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
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

  const { data: queueData, error, isLoading, refetch } = useVerificationQueue({
    chapter: chapterFilter,
  });
  const queue = queueData || [];
  
  const { data: chaptersData } = useChapters();
  const chapters = Array.isArray(chaptersData) ? chaptersData : [];
  
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [verifiedDocs, setVerifiedDocs] = useState([]);
  const [secureDocUrl, setSecureDocUrl] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    let objectUrl = null;
    if (selectedDoc?.fileUrl) {
      const fetchBlob = async () => {
        try {
          const token = localStorage.getItem("rifah_access_token");
          const filename = selectedDoc.fileUrl.split('/').pop();
          const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
          const res = await fetch(`${API_BASE.replace(/\/$/, '')}/verification/documents/${filename}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) throw new Error("Unauthorized");
          const blob = await res.blob();
          objectUrl = URL.createObjectURL(blob);
          setSecureDocUrl(objectUrl);
        } catch (e) {
          toast.error("Failed to load secure document. You may not have permission.");
          setSecureDocUrl(null);
        }
      };
      fetchBlob();
    } else {
      setSecureDocUrl(null);
    }
    
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [selectedDoc]);

  if (error && error.status === 401) {
    return (
      <AppShell role="admin" title="Verification queue">
        <Panel className="p-12 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold">Session Expired</h2>
          <p className="text-muted-foreground mt-2 mb-6">Your admin session has expired. Please log out and log in again.</p>
          <Button asChild><a href="/auth/login">Go to Login</a></Button>
        </Panel>
      </AppShell>
    );
  }

  const pending = queue.filter((b) => b.status === "pending" || b.status === "under_review");
  const review = queue.filter((b) => b.status === "correction" || b.status === "correction_requested" || b.status === "rejected");
  const done = queue.filter((b) => b.status === "approved" || b.status === "verified");

  const handleDecision = async (id, decision) => {
    try {
      await verificationApi.review(id, { decision, notes: "" });
      toast.success(`Application marked as ${decision}.`);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to update verification decision.");
    }
  };

  const handleVerifyDocument = () => {
    if (selectedDoc) {
      setVerifiedDocs((prev) => [...prev, selectedDoc.fileUrl]);
      toast.success(`${selectedDoc.name || selectedDoc.type} verified successfully`);
      setSelectedDoc(null);
    }
  };

  const card = (item) => (
    <div key={item._id} className="rounded-xl border border-border p-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{item.business?.name || "Business Applicant"}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {item.business?.industry} · {item.business?.city} · <span className="font-medium text-foreground">{item.business?.chapter}</span>
          </p>
          {item.status === "verified" && item.reviewedBy && (
            <p className="mt-1 text-xs text-emerald-600 bg-emerald-50 inline-block px-2 py-0.5 rounded-full border border-emerald-100">
              Verified by {item.reviewedBy.name} ({item.reviewedBy.chapter?.replace(/\s*[Cc]hapter\s*/g, '') || "Admin"})
            </p>
          )}
        </div>
        <VerificationBadge status={item.status} compact />
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {(item.documents || []).map((d, i) => {
          const isVerified = verifiedDocs.includes(d.fileUrl) || item.status === "verified";
          return (
            <div key={i} className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="min-w-0 truncate text-xs font-medium">{d.name || d.type}</span>
                {isVerified && <ShieldCheck className="h-3 w-3 text-emerald-600 shrink-0" />}
              </div>
              {d.fileUrl && (
                <button
                  type="button"
                  onClick={() => setSelectedDoc(d)}
                  className="text-xs text-primary hover:underline"
                >
                  View Doc
                </button>
              )}
            </div>
          );
        })}
      </div>

      {item.status !== "verified" && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => handleDecision(item._id, "verified")}>
            Approve
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleDecision(item._id, "correction_requested")}>
            Request correction
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDecision(item._id, "rejected")}>
            Reject
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <AppShell role="admin" title="Verification queue" subtitle="Secretariat business vetting & compliance desk">
      <div className="space-y-4">
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {isSuperAdmin ? (
            <Select value={chapterFilter} onValueChange={setChapterFilter}>
              <SelectTrigger className="sm:max-w-[200px]">
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
            <div className="flex h-10 items-center justify-between rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-primary font-medium sm:max-w-[200px] truncate">
              {user?.chapter ? `${user.chapter.replace(/\s*[Cc]hapter\s*/g, '')}'s Queue` : "Your Queue"}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div onClick={() => setActiveTab("pending")} className={cn("cursor-pointer transition-transform active:scale-95 rounded-2xl", activeTab === "pending" ? "ring-2 ring-primary ring-offset-1 bg-primary/5" : "")}>
            <StatCard label="Awaiting review" value={String(pending.length)} icon={ShieldCheck} tone="warning" />
          </div>
          <div onClick={() => setActiveTab("docs")} className={cn("cursor-pointer transition-transform active:scale-95 rounded-2xl", activeTab === "docs" ? "ring-2 ring-primary ring-offset-1 bg-primary/5" : "")}>
            <StatCard label="Needs correction" value={String(review.length)} icon={FileCheck2} />
          </div>
          <div onClick={() => setActiveTab("done")} className={cn("cursor-pointer transition-transform active:scale-95 rounded-2xl", activeTab === "done" ? "ring-2 ring-primary ring-offset-1 bg-primary/5" : "")}>
            <StatCard label="Approved / Verified" value={String(done.length)} tone="success" />
          </div>
          <div onClick={() => setActiveTab("all")} className={cn("cursor-pointer transition-transform active:scale-95 rounded-2xl", activeTab === "all" ? "ring-2 ring-primary ring-offset-1 bg-primary/5" : "")}>
            <StatCard label="Queue total" value={String(queue.length)} />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="pending">Awaiting review ({pending.length})</TabsTrigger>
            <TabsTrigger value="docs">Corrections & Rejections ({review.length})</TabsTrigger>
            <TabsTrigger value="done">Verified ({done.length})</TabsTrigger>
            <TabsTrigger value="all">All ({queue.length})</TabsTrigger>
          </TabsList>
          {[
            ["pending", pending],
            ["docs", review],
            ["done", done],
            ["all", queue],
          ].map(([key, rows]) => (
            <TabsContent key={key} value={key} className="mt-3">
              {rows.length === 0 ? (
                <Panel>
                  <EmptyState icon={ShieldCheck} title="Nothing in this queue" description="New submissions will appear here." />
                </Panel>
              ) : (
                <div className="space-y-3">{rows.map(card)}</div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
        <DialogContent className="max-w-4xl h-[88vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b bg-muted/20">
            <DialogTitle className="truncate pr-8">{selectedDoc?.name || selectedDoc?.type}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden p-3 flex flex-col items-center justify-center bg-slate-100">
            {secureDocUrl ? (
              selectedDoc.fileUrl.toLowerCase().endsWith(".pdf") || selectedDoc.name?.toLowerCase().endsWith(".pdf") ? (
                <div className="w-full h-full flex flex-col relative">
                  <iframe
                    src={secureDocUrl}
                    title={selectedDoc.name || "PDF Document"}
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
                  alt={selectedDoc.name || "Document"} 
                  className="max-w-full max-h-full object-contain shadow-sm border bg-white rounded-lg"
                />
              )
            ) : selectedDoc?.fileUrl ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground animate-pulse">
                <FileText className="h-8 w-8" />
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
                  <ExternalLink className="h-3.5 w-3.5" /> Open PDF in new tab ↗
                </a>
                <span className="text-muted-foreground text-xs">•</span>
                <a
                  href={secureDocUrl}
                  download={selectedDoc.name || "document.pdf"}
                  className="text-xs font-semibold text-muted-foreground hover:underline inline-flex items-center gap-1"
                >
                  <Download className="h-3.5 w-3.5" /> Download PDF
                </a>
              </div>
            ) : <span />}
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setSelectedDoc(null)}>Close</Button>
              <Button onClick={handleVerifyDocument}>Verify Document</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export { AdminVerification };
export default AdminVerification;
