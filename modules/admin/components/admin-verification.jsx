"use client";
import { FileCheck2, ShieldCheck, Download } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill, VerificationBadge } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/components/ui/tabs";
import { useVerificationQueue } from "@shared/hooks/use-rifah-api";
import { verificationApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/api-client";

function AdminVerification() {
  const { data: queueData, refetch } = useVerificationQueue();
  const queue = queueData || [];

  const pending = queue.filter((b) => b.status === "pending" || b.status === "under_review");
  const review = queue.filter((b) => b.status === "correction" || b.status === "rejected");
  const done = queue.filter((b) => b.status === "approved" || b.status === "verified");

  const handleDecision = async (id, decision) => {
    const notes = prompt(`Enter secretariat notes for ${decision}:`) || "";
    try {
      await verificationApi.review(id, { decision, notes });
      alert(`Application marked as ${decision}.`);
      refetch();
    } catch (err) {
      alert(err.message || "Failed to update verification decision.");
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
        {(item.documents || []).map((d, i) => (
          <div key={i} className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2">
            <span className="min-w-0 truncate text-xs font-medium">{d.name || d.type}</span>
            {d.fileUrl && (
              <a
                href={resolveMediaUrl(d.fileUrl)}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline"
              >
                View Doc
              </a>
            )}
          </div>
        ))}
      </div>

      {item.status !== "approved" && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => handleDecision(item._id, "approved")}>
            Approve verification
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleDecision(item._id, "correction")}>
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
    </AppShell>
  );
}

export { AdminVerification };
export default AdminVerification;
