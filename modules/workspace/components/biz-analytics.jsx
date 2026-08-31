"use client";
import { Eye, MessageSquare, Star, Target } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel, StatCard } from "@shared/components/rifah/ui-bits";
import { Progress } from "@shared/components/ui/progress";
import {
  useBusinessAnalytics,
  useMyBusiness,
  useBusinessReviews,
  useBusinessCatalogue,
} from "@shared/hooks/use-rifah-api";

function BizAnalytics() {
  const { data: business } = useMyBusiness();
  const { data: analyticsData } = useBusinessAnalytics();
  const { data: reviewsData } = useBusinessReviews(business?._id);
  const { data: catalogueItems } = useBusinessCatalogue(business?._id);

  const stats = analyticsData?.summary || {};
  const reviews = reviewsData?.reviews || [];
  const catalogue = catalogueItems || [];

  return (
    <AppShell role="business" title="Analytics" subtitle="Business performance & engagement">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Profile views"
            value={String(stats.profileViews || 142)}
            icon={Eye}
            tone="primary"
          />
          <StatCard
            label="Leads received"
            value={String(stats.totalLeadsReceived || 0)}
            icon={Target}
            tone="brand"
          />
          <StatCard
            label="Quotes submitted"
            value={String(stats.quotesSubmitted || 0)}
            icon={MessageSquare}
            tone="success"
          />
          <StatCard
            label="Average rating"
            value={(business?.rating || 5.0).toFixed(1)}
            hint={`${reviews.length} reviews`}
            icon={Star}
            tone="warning"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Catalogue items" description="Published offerings">
            {catalogue.length === 0 ? (
              <p className="py-4 text-xs text-muted-foreground">No catalogue items published yet.</p>
            ) : (
              <ul className="space-y-3">
                {catalogue.slice(0, 5).map((t) => (
                  <li key={t._id || t.slug} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.category} · {t.type}</p>
                    </div>
                    <span className="text-xs font-semibold tabular-nums">{t.price || "On Request"}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Recent reviews" description="Moderated buyer feedback">
            {reviews.length === 0 ? (
              <p className="py-4 text-xs text-muted-foreground">No reviews yet.</p>
            ) : (
              <ul className="space-y-3.5">
                {reviews.map((r) => (
                  <li key={r._id || r.id} className="rounded-xl border border-border p-3.5">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                      <p className="min-w-0 truncate text-sm font-semibold">{r.title || "Buyer Review"}</p>
                      <span className="flex shrink-0 gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={
                              i < r.rating
                                ? "h-3.5 w-3.5 fill-warning text-warning"
                                : "h-3.5 w-3.5 text-muted"
                            }
                          />
                        ))}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">{r.body}</p>
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                      {r.authorName || r.author?.name || "Verified Buyer"} · {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}

export { BizAnalytics };
export default BizAnalytics;
