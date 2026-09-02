"use client";
import { FileCheck2, ShieldCheck, Download } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill, VerificationBadge } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@shared/components/ui/dialog";
import { useVerificationQueue } from "@shared/hooks/use-rifah-api";
import { verificationApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/api-client";
import { toast } from "sonner";

function AdminVerification() {
  const { data: queueData, error, isLoading, refetch } = useVerificationQueue();
  const queue = queueData || [];
  
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [verifiedDocs, setVerifiedDocs] = useState([]);

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
  const review = queue.filter((b) => b.status === "correction" || b.status === "rejected");
  const done = queue.filter((b) => b.status === "approved" || b.status === "verified");

  const handleDecision = async (id, decision) => {
    try {
      await verificationApi.review(id, { status: decision, remarks: "Processed via quick action" });
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
            {item.business?.industry} · {item.business?.city} · {item.business?.chapter}
          </p>
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
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Awaiting review" value={String(pending.length)} icon={ShieldCheck} tone="warning" />
          <StatCard label="Needs correction" value={String(review.length)} icon={FileCheck2} />
          <StatCard label="Approved / Verified" value={String(done.length)} tone="success" />
          <StatCard label="Queue total" value={String(queue.length)} />
        </div>

        <Tabs defaultValue="pending">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="pending">Awaiting review ({pending.length})</TabsTrigger>
            <TabsTrigger value="docs">Corrections & Rejections ({review.length})</TabsTrigger>
            <TabsTrigger value="done">Verified ({done.length})</TabsTrigger>
          </TabsList>
          {[
            ["pending", pending],
            ["docs", review],
            ["done", done],
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
        <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b bg-muted/20">
            <DialogTitle>{selectedDoc?.name || selectedDoc?.type}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-100">
            {selectedDoc?.fileUrl && (
              <img 
                src={resolveMediaUrl(selectedDoc.fileUrl)} 
                alt={selectedDoc.name || "Document"} 
                className="max-w-full max-h-full object-contain shadow-sm border bg-white"
              />
            )}
          </div>

          <div className="p-4 border-t bg-background flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSelectedDoc(null)}>Close</Button>
            <Button onClick={handleVerifyDocument}>Verify Document</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export { AdminVerification };
export default AdminVerification;
