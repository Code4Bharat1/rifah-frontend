"use client";
import { FileCheck2, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill, VerificationBadge } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/components/ui/tabs";
import { Textarea } from "@shared/components/ui/textarea";
import { businesses } from "@shared/lib/mock-data";

const docs = ["Registration certificate", "GST / tax document", "Authorised signatory ID", "Address proof"];

function AdminVerification() {
  const [note, setNote] = useState("");
  const pending = businesses.filter((b) => b.verification === "pending");
  const review = businesses.filter((b) => b.verification === "correction" || b.verification === "rejected");
  const done = businesses.filter((b) => b.verification === "verified");

  const card = (b) => (
    <div key={b.id} className="rounded-xl border border-border p-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{b.name}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {b.industry} · {b.city} · {b.chapter}
          </p>
        </div>
        <VerificationBadge status={b.verification} compact />
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {docs.map((d, i) => (
          <div key={d} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
            <span className="min-w-0 truncate text-xs">{d}</span>
            <Pill tone={i < 3 ? "success" : "warning"}>{i < 3 ? "Received" : "Missing"}</Pill>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm">Approve verification</Button>
        <Button size="sm" variant="outline">
          Request correction
        </Button>
        <Button size="sm" variant="ghost" className="text-destructive">
          Reject
        </Button>
      </div>
    </div>
  );

  return (
    <AppShell role="admin" title="Verification queue" subtitle="Prototype review workflow — no live decisions">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Awaiting review" value={String(pending.length)} icon={ShieldCheck} tone="warning" />
          <StatCard label="Needs documents" value={String(review.length)} icon={FileCheck2} />
          <StatCard label="Verified members" value={String(done.length)} tone="success" />
          <StatCard label="Avg. turnaround" value="3.2 days" />
        </div>

        <Tabs defaultValue="pending">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="pending">Awaiting review ({pending.length})</TabsTrigger>
            <TabsTrigger value="docs">Needs documents ({review.length})</TabsTrigger>
            <TabsTrigger value="done">Verified ({done.length})</TabsTrigger>
          </TabsList>
          {(
            [
              ["pending", pending],
              ["docs", review],
              ["done", done],
            ] 
          ).map(([key, rows]) => (
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

        <Panel title="Reviewer note" description="Attached to the decision record in the audit log">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add context for the secretariat decision"
            rows={3}
          />
          <Button className="mt-3">Save note</Button>
        </Panel>
      </div>
    </AppShell>
  );
}


export { AdminVerification };
export default AdminVerification;
