"use client";
import { Eye, MessageSquare, Star, Target, TrendingUp, Sparkles, FolderOpen, MessageCircle } from "lucide-react";

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
  const { data: analyticsData, isLoading } = useBusinessAnalytics();
  const { data: reviewsData } = useBusinessReviews(business?._id);
  const { data: catalogueItems } = useBusinessCatalogue(business?._id);

  const stats = analyticsData?.summary || {};
  const reviews = Array.isArray(analyticsData?.recentReviews) && analyticsData.recentReviews.length > 0
    ? analyticsData.recentReviews
    : (Array.isArray(reviewsData?.reviews) ? reviewsData.reviews : []);

  const catalogue = Array.isArray(analyticsData?.topCatalogueItems) && analyticsData.topCatalogueItems.length > 0
    ? analyticsData.topCatalogueItems
    : (Array.isArray(catalogueItems) ? catalogueItems : (catalogueItems?.items || []));

  // Generate last 6 months dynamic labels strictly based on current date
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentDate = new Date();
  const defaultLast6Months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    defaultLast6Months.push(monthNames[d.getMonth()]);
  }

  // Real Profile views directly from backend database
  const profileViewsData = Array.isArray(analyticsData?.monthlyProfileViews) && analyticsData.monthlyProfileViews.length > 0
    ? analyticsData.monthlyProfileViews
    : defaultLast6Months.map((m) => ({ month: m, views: 0 }));
  const maxViews = Math.max(...profileViewsData.map((d) => Number(d.views) || 0), 5);

  // Real Leads vs enquiries directly from backend database
  const leadsVsEnquiriesData = Array.isArray(analyticsData?.monthlyLeadsVsEnquiries) && analyticsData.monthlyLeadsVsEnquiries.length > 0
    ? analyticsData.monthlyLeadsVsEnquiries
    : defaultLast6Months.map((m) => ({ month: m, leads: 0, enquiries: 0 }));

  // Real Catalogue items directly from backend database
  const catalogueList = catalogue.map((item) => ({
    _id: item._id,
    name: item.name,
    category: item.category || item.type || "Offering",
    views: Number(item.views) || 0,
  }));
  const maxItemViews = Math.max(...catalogueList.map((t) => t.views || 0), 5);

  return (
    <AppShell
      role="business"
      title="Analytics"
      subtitle={`Last 6 months of activity (${defaultLast6Months[0]} – ${defaultLast6Months[5]} ${currentDate.getFullYear()})`}
    >
      <div className="space-y-4 font-sans">
        {/* Top 4 Stat Cards - 100% Real Database Metrics */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Profile views"
            value={String(stats.profileViews ?? 0)}
            hint={stats.viewsGrowth || "Real-time analytics"}
            icon={Eye}
            tone="primary"
          />
          <StatCard
            label="Leads received"
            value={String(stats.totalLeadsReceived ?? 0)}
            hint={stats.totalLeadsReceived > 0 ? "Matched buyer enquiries" : "No leads yet"}
            icon={Target}
            tone="brand"
          />
          <StatCard
            label="Enquiries"
            value={String(stats.enquiries ?? 0)}
            hint={stats.enquiries > 0 ? "Direct inquiries" : "No direct enquiries yet"}
            icon={MessageSquare}
            tone="success"
          />
          <StatCard
            label="Average rating"
            value={Number(stats.averageRating || business?.rating || 0).toFixed(1)}
            hint={`${stats.reviewsCount ?? reviews.length ?? 0} reviews`}
            icon={Star}
            tone="warning"
          />
        </div>

        {/* Top 2 Charts Grid */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Real Profile views bar chart */}
          <Panel title="Profile views" description="Monthly unique discovery views from database">
            <div className="flex h-48 items-end justify-between gap-3 pt-6 pb-2 px-2">
              {profileViewsData.map((item, index) => {
                const viewsCount = Number(item.views) || 0;
                const heightPercent = maxViews > 0 ? Math.max(viewsCount > 0 ? 12 : 3, Math.min(100, (viewsCount / maxViews) * 100)) : 3;
                return (
                  <div key={index} className="flex flex-1 flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[11px] font-bold text-slate-700">{viewsCount}</span>
                    <div
                      className={`w-full max-w-[44px] rounded-t-md transition-all duration-300 ${
                        viewsCount > 0 ? "bg-[#0088D1] shadow-2xs hover:opacity-90" : "bg-slate-200/80"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-xs font-semibold text-slate-500 mt-1">{item.month}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-600 border-t border-slate-100 pt-3">
              <TrendingUp className="h-3.5 w-3.5 text-sky-600" />
              <span>{stats.growthMessage || "Live traffic data directly from RIFAH database"}</span>
            </div>
          </Panel>

          {/* Real Leads vs enquiries dual horizontal bars */}
          <Panel
            title="Leads vs enquiries"
            description="Monthly volume comparison from database"
            action={
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#0088D1]" /> Leads
                </span>
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]" /> Enquiries
                </span>
              </div>
            }
          >
            <div className="space-y-3 pt-2">
              {leadsVsEnquiriesData.map((item, index) => {
                const leadCount = Number(item.leads) || 0;
                const enquiryCount = Number(item.enquiries) || 0;
                const maxVal = Math.max(...leadsVsEnquiriesData.flatMap((d) => [Number(d.leads) || 0, Number(d.enquiries) || 0]), 5);
                const leadPercent = Math.max(leadCount > 0 ? 6 : 0, Math.min(100, (leadCount / maxVal) * 100));
                const enquiryPercent = Math.max(enquiryCount > 0 ? 6 : 0, Math.min(100, (enquiryCount / maxVal) * 100));

                return (
                  <div key={index} className="space-y-1.5 py-1 border-b border-slate-100/80 last:border-0">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800">{item.month}</span>
                      <div className="flex items-center gap-2.5 text-[11px] font-bold">
                        <span className="text-[#0088D1]">{leadCount} Leads</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-emerald-600">{enquiryCount} Enquiries</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 h-2.5 w-full">
                      <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        {leadCount > 0 && (
                          <div
                            className="absolute inset-y-0 left-0 bg-[#0088D1] rounded-full transition-all duration-300"
                            style={{ width: `${leadPercent}%` }}
                          />
                        )}
                      </div>
                      <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        {enquiryCount > 0 && (
                          <div
                            className="absolute inset-y-0 left-0 bg-[#10b981] rounded-full transition-all duration-300"
                            style={{ width: `${enquiryPercent}%` }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        {/* Bottom 2 Panels Grid */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Real Catalogue items */}
          <Panel title="Top catalogue items" description="By actual buyer views">
            {catalogueList.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 space-y-1">
                <FolderOpen className="h-6 w-6 mx-auto text-slate-300 stroke-[1.5]" />
                <p className="font-semibold text-slate-600">No catalogue items published yet</p>
                <p className="text-[11px] text-slate-400">Add products or services from the Catalogue page to track views</p>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                {catalogueList.slice(0, 5).map((item, idx) => {
                  const widthPercent = maxItemViews > 0 ? Math.max(item.views > 0 ? 8 : 2, Math.min(100, (item.views / maxItemViews) * 100)) : 2;
                  return (
                    <div key={item._id || idx} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800 truncate max-w-[280px]">
                          {item.name}
                        </span>
                        <span className="font-bold tabular-nums text-slate-600">
                          {item.views} views
                        </span>
                      </div>
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        {item.views > 0 && (
                          <div
                            className="absolute inset-y-0 left-0 bg-[#0088D1] rounded-full transition-all duration-300"
                            style={{ width: `${widthPercent}%` }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          {/* Real Reviews */}
          <Panel title="Recent reviews" description="Moderated buyer feedback directly from database">
            {reviews.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 space-y-1">
                <MessageCircle className="h-6 w-6 mx-auto text-slate-300 stroke-[1.5]" />
                <p className="font-semibold text-slate-600">No buyer reviews submitted yet</p>
                <p className="text-[11px] text-slate-400">Reviews left by verified buyers will appear here automatically</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {reviews.slice(0, 3).map((r, idx) => (
                  <li key={r._id || idx} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-1.5">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-bold text-slate-800">{r.title || "Buyer Review"}</p>
                      <span className="flex shrink-0 gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={
                              i < (Number(r.rating) || 5)
                                ? "h-3.5 w-3.5 fill-amber-400 text-amber-400"
                                : "h-3.5 w-3.5 text-slate-200"
                            }
                          />
                        ))}
                      </span>
                    </div>
                    {r.body && <p className="text-xs text-slate-600 leading-relaxed">{r.body}</p>}
                    <p className="text-[11px] font-medium text-slate-400 pt-0.5">
                      {r.authorName || "Verified Member"} · {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Recent"}
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
