"use client";
import { MessageSquare, Star } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { reviews } from "@shared/lib/mock-data";

function AdminReviews() {
  return (
    <AppShell role="admin" title="Review moderation" subtitle="All reviews are moderated before publication">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Awaiting moderation" value={String(reviews.length)} icon={MessageSquare} tone="warning" />
          <StatCard label="Published" value="214" tone="success" />
          <StatCard label="Removed" value="7" />
          <StatCard label="Average rating" value="4.4" icon={Star} tone="primary" />
        </div>

        <Panel title="Moderation queue">
          {reviews.length === 0 ? (
            <EmptyState icon={MessageSquare} title="Queue is clear" description="New reviews will arrive here." />
          ) : (
            <ul className="space-y-3">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-xl border border-border p-3.5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{r.author}</p>
                      <p className="text-xs text-muted-foreground">{r.date}</p>
                    </div>
                    <Pill tone="primary">{r.rating}/5</Pill>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{r.body}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm">Publish</Button>
                    <Button size="sm" variant="outline">
                      Hold
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive">
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}


export { AdminReviews };
export default AdminReviews;
