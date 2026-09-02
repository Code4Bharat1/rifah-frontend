"use client";
import { Eye, MessageSquare, Star, Target, TrendingUp } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel, StatCard } from "@shared/components/rifah/ui-bits";
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
  const reviews = analyticsData?.recentReviews?.length > 0 ? analyticsData.recentReviews : (reviewsData?.reviews || []);
  const catalogue = analyticsData?.topCatalogueItems?.length > 0 ? analyticsData.topCatalogueItems : (Array.isArray(catalogueItems) ? catalogueItems : (catalogueItems?.items || []));

  // Generate last 6 months dynamic labels
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentDate = new Date();
  const defaultLast6Months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    defaultLast6Months.push(monthNames[d.getMonth()]);
  }

  // Profile views data directly from backend
  const profileViewsData = analyticsData?.monthlyProfileViews?.length > 0
    ? analyticsData.monthlyProfileViews
    : defaultLast6Months.map((m) => ({ month: m, views: 0 }));
  const maxViews = Math.max(...profileViewsData.map((d) => d.views || 0), 10);

  // Leads vs enquiries data directly from backend
  const leadsVsEnquiriesData = analyticsData?.monthlyLeadsVsEnquiries?.length > 0
    ? analyticsData.monthlyLeadsVsEnquiries
    : defaultLast6Months.map((m) => ({ month: m, leads: 0, enquiries: 0 }));
  const maxEnquiries = Math.max(...leadsVsEnquiriesData.map((d) => d.enquiries || 0), 10);

  // Catalogue items list directly from backend
  const catalogueList = catalogue.map((item) => ({
    name: item.name,
    category: item.category || item.type || "Offering",
    views: item.views || 0,
  }));
  const maxItemViews = Math.max(...catalogueList.map((t) => t.views || 0), 10);

  return (
    <AppShell role="business" title="Analytics" subtitle="Last 6 months of activity">
      <div className="space-y-4">
        {/* Top 4 Stat Cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Profile views"
            value={String(stats.profileViews ?? 0)}
            hint={stats.profileViews > 0 ? "+21% vs last month" : "No views recorded yet"}
            icon={Eye}
            tone="primary"
          />
          <StatCard
            label="Leads received"
            value={String(stats.totalLeadsReceived ?? 0)}
            icon={Target}
            tone="brand"
          />
          <StatCard
            label="Enquiries"
            value={String(stats.enquiries ?? 0)}
            icon={MessageSquare}
            tone="success"
          />
          <StatCard
            label="Average rating"
            value={Number(stats.averageRating || business?.rating || 0).toFixed(1)}
            hint={`${stats.reviewsCount || reviews.length || 0} reviews`}
            icon={Star}
            tone="warning"
          />
        </div>

        {/* Top 2 Charts Grid */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Profile views bar chart */}
          <Panel title="Profile views" description="Monthly unique views">
            <div className="flex h-48 items-end justify-between gap-3 pt-6 pb-2 px-2">
              {profileViewsData.map((item, index) => {
                const heightPercent = maxViews > 0 ? Math.max(8, Math.min(100, (item.views / maxViews) * 100)) : 8;
                return (
                  <div key={index} className="flex flex-1 flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[11px] font-semibold text-muted-foreground">{item.views}</span>
                    <div
                      className="w-full max-w-[44px] rounded-t-md bg-[#0088D1] transition-all duration-300 hover:opacity-90"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-xs font-medium text-muted-foreground mt-1">{item.month}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-success border-t border-border/50 pt-3">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Steady growth since subscription active</span>
            </div>
          </Panel>

          {/* Leads vs enquiries horizontal bars */}
          <Panel title="Leads vs enquiries" description="Volume by month">
            <div className="space-y-3.5 pt-2">
              {leadsVsEnquiriesData.map((item, index) => {
                const widthPercent = maxEnquiries > 0 ? Math.max(8, Math.min(100, (item.enquiries / maxEnquiries) * 100)) : 8;
                return (
                  <div key={index} className="grid grid-cols-[36px_minmax(0,1fr)_50px] items-center gap-3 text-xs">
                    <span className="font-medium text-muted-foreground">{item.month}</span>
                    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="absolute inset-y-0 left-0 bg-[#0088D1] rounded-full transition-all duration-300"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                    <span className="text-right font-semibold tabular-nums text-muted-foreground">
                      {item.leads}/{item.enquiries}
                    </span>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        {/* Bottom 2 Panels Grid */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Top catalogue items */}
          <Panel title="Top catalogue items" description="By buyer views">
            {catalogueList.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">No catalogue items published yet.</p>
            ) : (
              <div className="space-y-4 pt-1">
                {catalogueList.slice(0, 5).map((item, idx) => {
                  const widthPercent = maxItemViews > 0 ? Math.max(8, Math.min(100, (item.views / maxItemViews) * 100)) : 8;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-foreground truncate max-w-[280px]">
                          {item.name}
                        </span>
                        <span className="font-semibold tabular-nums text-muted-foreground">
                          {item.views}
                        </span>
                      </div>
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="absolute inset-y-0 left-0 bg-[#0088D1] rounded-full transition-all duration-300"
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          {/* Recent reviews */}
          <Panel title="Recent reviews" description="Moderated buyer feedback">
            {reviews.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">No buyer reviews submitted yet.</p>
            ) : (
              <ul className="space-y-3">
                {reviews.slice(0, 3).map((r, idx) => (
                  <li key={r._id || r.id || idx} className="rounded-xl border border-border p-3.5 space-y-1">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-semibold text-foreground">{r.title || "Buyer Review"}</p>
                      <span className="flex shrink-0 gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={
                              i < (r.rating || 5)
                                ? "h-3.5 w-3.5 fill-warning text-warning"
                                : "h-3.5 w-3.5 text-muted"
                            }
                          />
                        ))}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{r.body || r.comment}</p>
                    <p className="text-[11px] text-muted-foreground pt-0.5">
                      {r.authorName || r.author?.name || "Verified Buyer"} · {new Date(r.createdAt || Date.now()).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
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
