"use client";
import { MessageSquare, Star, Undo2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { useAdminReviews } from "@shared/hooks/use-rifah-api";
import { reviewApi } from "@shared/lib/api-services";

function AdminReviews() {
  const { data: reviewsData, refetch } = useAdminReviews();
  const reviews = Array.isArray(reviewsData) ? reviewsData : [];

  const handleModerate = async (id, status) => {
    try {
      await reviewApi.moderate(id, { status });
      toast.success(`Review ${status} successfully`);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to moderate review.");
    }
  };

  return (
    <AppShell role="admin" title="Review moderation" subtitle="All reviews are verified by secretariat before public directory display">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total Reviews" value={String(reviews.length)} icon={MessageSquare} tone="warning" />
          <StatCard
            label="Approved / Live"
            value={String(reviews.filter((r) => r.status === "approved").length)}
            tone="success"
          />
          <StatCard
            label="Pending Moderation"
            value={String(reviews.filter((r) => r.status === "pending").length)}
            tone="brand"
          />
          <StatCard label="Moderation Desk" value="Active" tone="primary" />
        </div>

        <Panel title="Moderation queue">
          {reviews.length === 0 ? (
            <EmptyState icon={MessageSquare} title="Queue is clear" description="New reviews will arrive here." />
          ) : (
            <ul className="space-y-3">
              {reviews.map((r) => (
                <li key={r._id || r.id} className="rounded-xl border border-border p-3.5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{r.title || "Business Review"}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.authorName || r.author?.name || "Buyer"} · {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Pill tone={r.status === "approved" ? "success" : "warning"}>{r.rating} / 5 · {r.status}</Pill>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{r.body}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.status !== "approved" && (
                      <Button size="sm" onClick={() => handleModerate(r._id || r.id, "approved")}>
                        Publish / Approve
                      </Button>
                    )}
                    {r.status !== "rejected" && (
                      <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleModerate(r._id || r.id, "rejected")}>
                        Reject
                      </Button>
                    )}
                    {r.status !== "pending" && (
                      <Button size="sm" variant="ghost" onClick={() => handleModerate(r._id || r.id, "pending")}>
                        <Undo2 className="h-4 w-4 mr-1.5" />
                        Move to Pending
                      </Button>
                    )}
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
