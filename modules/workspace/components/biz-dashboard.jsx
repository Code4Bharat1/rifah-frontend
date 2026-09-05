"use client";
import Link from "next/link";
import {
  ArrowUpRight,
  Eye,
  MessageSquare,
  Package,
  ShieldCheck,
  Star,
  Target,
  TrendingUp,
  CheckCircle2,
  Bell,
  Sparkles,
} from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { MembershipBadge, Pill, StatusBadge, VerificationBadge } from "@shared/components/rifah/badges";
import { MoreLink, Panel, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Progress } from "@shared/components/ui/progress";
import {
  useMyBusiness,
  useMyLeads,
  useBusinessEnquiries,
  useBusinessCatalogue,
  useBusinessAnalytics,
  useConversations,
  useNotifications,
  useBusinessReviews,
} from "@shared/hooks/use-rifah-api";

function safeText(val, fallback = "") {
  if (!val) return fallback;
  if (typeof val === "string" || typeof val === "number") return String(val);
  if (typeof val === "object") {
    if (typeof val.text === "string") return val.text;
    if (typeof val.body === "string") return val.body;
    if (typeof val.message === "string") return val.message;
    if (typeof val.title === "string") return val.title;
    return fallback;
  }
  return fallback;
}

function BusinessHome() {
  const { data: business } = useMyBusiness();
  const { data: leadsData } = useMyLeads();
  const { data: enquiriesData } = useBusinessEnquiries();
  const { data: catalogueItems } = useBusinessCatalogue(business?._id);
  const { data: analyticsData } = useBusinessAnalytics();
  const { data: convData } = useConversations();
  const { data: notifData } = useNotifications();
  const { data: reviewsData } = useBusinessReviews(business?._id);

  const rawLeads = Array.isArray(leadsData) ? leadsData : leadsData?.leads || [];
  const rawEnquiries = Array.isArray(enquiriesData) ? enquiriesData : enquiriesData?.enquiries || [];
  const catalogue = catalogueItems || [];
  const stats = analyticsData?.summary || analyticsData || {};
  const conversations = Array.isArray(convData) ? convData : (convData?.conversations || []);
  const rawNotifs = Array.isArray(notifData)
    ? notifData
    : Array.isArray(notifData?.notifications)
    ? notifData.notifications
    : [];
  const reviews = Array.isArray(reviewsData)
    ? reviewsData
    : Array.isArray(reviewsData?.reviews)
    ? reviewsData.reviews
    : [];

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / reviews.length).toFixed(1)
    : (business?.rating ? Number(business.rating).toFixed(1) : "0.0");

  // Profile Completeness list dynamically computed from real business profile
  const completenessList = [
    {
      label: "Business details",
      done: Boolean(business?.name && (business?.industry || business?.category) && business?.city),
    },
    {
      label: `Catalogue (${catalogue.length} items)`,
      done: Boolean(catalogue.length > 0),
    },
    {
      label: "Certifications",
      done: Boolean(business?.verification === "verified" || (business?.certifications && business.certifications.length > 0)),
    },
    {
      label: "Gallery images",
      done: Boolean(business?.gallery && business.gallery.length > 0),
    },
    {
      label: "Bank details for invoices",
      done: Boolean(business?.phone && business?.email && business?.address),
    },
  ];

  const doneCount = completenessList.filter((item) => item.done).length;
  const completeness = Math.round((doneCount / completenessList.length) * 100);

  const bizName = safeText(business?.name, "Business Workspace");
  const bizSlugOrId = business?.slug || business?._id || "";
  const bizChapter = typeof business?.chapter === "object" ? business?.chapter?.name : safeText(business?.chapter, "General Chapter");

  // Dynamic Performance Stats
  const totalLeadsCount = rawLeads.length;
  const totalEnquiriesCount = rawEnquiries.length || stats.enquiries || 0;
  const wonCount = rawLeads.filter((l) => ["Won", "Responded"].includes(l.status)).length;
  const conversionRate = totalLeadsCount > 0 ? `${Math.round((wonCount / totalLeadsCount) * 100)}%` : "0%";

  // Monthly breakdown calculation dynamically computed for the last 6 months
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentDate = new Date();
  const dynamicMonths = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    dynamicMonths.push(monthNames[d.getMonth()]);
  }

  const monthlyViewsMap = {};
  if (Array.isArray(analyticsData?.monthlyProfileViews)) {
    analyticsData.monthlyProfileViews.forEach((item) => {
      if (item.month) monthlyViewsMap[item.month] = Number(item.views) || 0;
    });
  }

  const monthlyData = dynamicMonths.map((m, idx) => ({
    month: m,
    val: monthlyViewsMap[m] || stats.monthlyViews?.[m] || (idx === dynamicMonths.length - 1 ? (stats.profileViews || rawLeads.length || 0) : 0),
  }));
  const maxVal = Math.max(...monthlyData.map((d) => d.val), 1);

  // Dynamic recent messages from live conversation API
  const messageList = conversations.slice(0, 3);

  // Dynamic notifications from live notification API
  const notificationItems = rawNotifs.slice(0, 4);

  return (
    <AppShell
      role="business"
      title={bizName}
      subtitle={`Business workspace · ${bizChapter}`}
      actions={
        bizSlugOrId ? (
          <Button asChild variant="outline" className="rounded-xl border-slate-200 shadow-2xs hover:bg-slate-50">
            <Link href={`/business/${bizSlugOrId}`}>
              <Eye className="h-4 w-4 mr-1.5" /> View public profile
            </Link>
          </Button>
        ) : null
      }
    >
      <div className="space-y-4">
        {/* Top 4 Stat Cards dynamically bound to live backend data */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="New leads"
            value={String(rawLeads.filter((l) => l.status === "New").length)}
            hint="This week"
            icon={Target}
            tone="danger"
            href="/biz/leads"
          />
          <StatCard
            label="Open enquiries"
            value={String(rawLeads.filter((l) => ["New", "In Progress"].includes(l.status)).length)}
            hint={`${rawLeads.filter((l) => l.status === "New").length} need response`}
            icon={MessageSquare}
            tone="primary"
            href="/biz/enquiries"
          />
          <StatCard
            label="Profile views"
            value={String(stats.profileViews || stats.views || 0)}
            hint="Last 30 days"
            icon={Eye}
            tone="success"
            href="/biz/analytics"
          />
          <StatCard
            label="Catalogue items"
            value={String(catalogue.length)}
            hint={`${catalogue.filter((i) => i.status === "draft").length} drafts`}
            icon={Package}
            tone="neutral"
            href="/biz/catalogue"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main Left Column */}
          <div className="space-y-4">
            {/* Matched Leads Panel */}
            <Panel
              title="Matched leads"
              description="Buyer enquiries routed to your categories"
              action={<MoreLink href="/biz/leads" label="View all →" />}
            >
              {rawLeads.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <Target className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-700">No matched leads yet</p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-0.5">
                    New buyer enquiries matching your categories will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rawLeads.slice(0, 5).map((l) => {
                    const leadTitle = safeText(l.enquiry?.title || l.title, "Buyer RFQ");
                    const leadCity = safeText(l.enquiry?.city || l.city, "Location on request");
                    const refCode = l.refCode || (l._id ? `ENQ-${l._id.slice(-4).toUpperCase()}` : "ENQ-2041");
                    const leadStatus = safeText(l.status, "New");

                    return (
                      <div
                        key={l._id}
                        className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 leading-snug">{leadTitle}</h4>
                            <p className="mt-0.5 text-xs text-slate-400 font-normal">
                              {refCode} · {leadCity}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-3 py-0.5 text-xs font-semibold ${
                              leadStatus === "New"
                                ? "bg-sky-100 text-sky-700"
                                : leadStatus === "In Progress"
                                ? "bg-amber-100 text-amber-700"
                                : leadStatus === "Responded"
                                ? "bg-blue-100 text-blue-700"
                                : leadStatus === "Won"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {leadStatus}
                          </span>
                        </div>

                        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                          <span
                            className={`rounded-full px-2.5 py-0.5 font-medium ${
                              l.priority === "High"
                                ? "bg-red-50 text-red-600 border border-red-100"
                                : l.priority === "Medium"
                                ? "bg-amber-50 text-amber-700 border border-amber-100"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {safeText(l.priority, "Standard")} priority
                          </span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-600">
                            {safeText(l.enquiry?.quantity || l.quantity, "Quantity on request")}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-600">
                            {safeText(l.enquiry?.deadline || l.deadline, "As per requirement")}
                          </span>
                        </div>

                        <div className="mt-3.5 flex items-center gap-2 pt-1">
                          <Button
                            asChild
                            size="sm"
                            className="rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-5 shadow-2xs"
                          >
                            <Link href="/biz/leads">Respond</Link>
                          </Button>
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="rounded-full border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <Link href="/biz/leads">View details</Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>

            {/* Performance Panel with Bar Chart */}
            <Panel
              title="Performance"
              description="Leads, enquiries and profile views by month"
              action={<MoreLink href="/biz/analytics" label="View all →" />}
            >
              <div className="pt-2 pb-4">
                {/* Bar Chart Bars */}
                <div className="flex items-end justify-between gap-3 h-44 px-4 pt-6 pb-2">
                  {monthlyData.map((d) => {
                    const heightPercent = Math.round((d.val / maxVal) * 100);
                    return (
                      <div key={d.month} className="flex-1 flex flex-col items-center gap-2 group">
                        <span className="text-[11px] font-bold text-slate-500">{d.val}</span>
                        <div className="w-full max-w-[54px] bg-slate-100 rounded-t-lg h-32 flex items-end overflow-hidden">
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full bg-sky-500 rounded-t-lg transition-all group-hover:bg-sky-600"
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-400">{d.month}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Summary Indicators */}
                <div className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 text-center">
                  <div>
                    <p className="text-xl font-bold text-slate-900 tabular-nums">{totalLeadsCount}</p>
                    <p className="text-xs text-slate-400 font-medium">Leads</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-900 tabular-nums">{totalEnquiriesCount}</p>
                    <p className="text-xs text-slate-400 font-medium">Enquiries</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-900 tabular-nums">{conversionRate}</p>
                    <p className="text-xs text-slate-400 font-medium">Conversion</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-1.5 px-2 text-xs font-semibold text-emerald-600">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Views performance updated live</span>
                </div>
              </div>
            </Panel>
          </div>

          {/* Right Sidebar Column */}
          <div className="space-y-4">
            {/* Box 1: Profile Completeness */}
            <Panel title="Profile completeness">
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-bold tabular-nums text-slate-900">{completeness}%</p>
                <MembershipBadge tier={safeText(business?.membership?.tier || business?.membership, "Free Listing")} />
              </div>
              <Progress value={completeness} className="mt-3 h-2" />
              <ul className="mt-4 space-y-2.5 text-xs">
                {completenessList.map((item) => (
                  <li key={item.label} className="flex items-center justify-between gap-3">
                    <span className={item.done ? "text-slate-600 font-medium" : "text-slate-900 font-bold"}>
                      {item.label}
                    </span>
                    <Pill tone={item.done ? "success" : "warning"} className="px-3 py-0.5 text-[11px]">
                      {item.done ? "Done" : "Pending"}
                    </Pill>
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" className="mt-5 w-full rounded-xl text-xs font-semibold">
                <Link href="/biz/profile">Complete profile</Link>
              </Button>
            </Panel>

            {/* Box 2: Verification & Membership */}
            <Panel title="Verification & membership">
              <ul className="space-y-3 text-xs">
                <li className="flex items-center justify-between gap-3">
                  <span className="text-slate-500 font-medium">Verification</span>
                  <VerificationBadge status={safeText(business?.verification || business?.verificationStatus, "pending")} compact />
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="text-slate-500 font-medium">Plan</span>
                  <MembershipBadge tier={safeText(business?.membership?.tier || business?.membership, "Free Listing")} />
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="text-slate-500 font-medium">Status</span>
                  <span className="font-bold text-slate-900">
                    {business?.verification === "verified" ? "Active Verified" : "Pending Verification"}
                  </span>
                </li>
              </ul>
              <div className="mt-5 space-y-2">
                <Button asChild className="w-full rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs h-10 shadow-2xs">
                  <Link href="/biz/membership">
                    Manage membership <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full rounded-xl text-xs font-semibold border-slate-200 h-10">
                  <Link href="/biz/verification">
                    <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-slate-500" /> Verification status
                  </Link>
                </Button>
              </div>
            </Panel>

            {/* Box 3: Recent Messages */}
            {/* Box 3: Recent Messages */}
            <Panel title="Recent messages" action={<MoreLink href="/biz/messages" label="View all →" />}>
              {messageList.length === 0 ? (
                <p className="text-xs text-slate-400 font-medium text-center py-4">No recent messages</p>
              ) : (
                <ul className="space-y-2.5">
                  {messageList.map((msg, i) => {
                    const senderName = safeText(msg.otherUser?.name || msg.name, "Customer");
                    const lastMsg = safeText(msg.lastMessage?.text || msg.lastMessage?.body || msg.lastMessage || msg.snippet, "New message");
                    const unreadCount = Number(msg.unreadCount || msg.unread || 0);
                    const isUnread = unreadCount > 0 || !msg.isRead;
                    const otherUserId = msg.otherUser?._id || msg.otherUser?.id || "";

                    return (
                      <li key={msg._id || msg.id || msg.conversationId || i}>
                        <Link
                          href={otherUserId ? `/biz/messages?userId=${otherUserId}` : "/biz/messages"}
                          className={`flex items-center justify-between gap-3 p-2 rounded-xl transition-all hover:bg-slate-50 ${
                            isUnread ? "bg-red-50/40 border border-red-100/60" : "border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative shrink-0">
                              <span className="grid h-8 w-8 place-items-center rounded-full text-xs font-bold bg-sky-100 text-sky-700 uppercase">
                                {senderName.slice(0, 2)}
                              </span>
                              {isUnread && (
                                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className={`truncate text-xs ${isUnread ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>
                                  {senderName}
                                </p>
                                {isUnread && (
                                  <span className="rounded-full bg-red-100 px-1.5 py-0.2 text-[9px] font-bold text-red-700">
                                    {unreadCount > 1 ? `${unreadCount} new` : "New"}
                                  </span>
                                )}
                              </div>
                              <p className={`truncate text-[11px] ${isUnread ? "font-medium text-slate-700" : "text-slate-400"}`}>
                                {lastMsg}
                              </p>
                            </div>
                          </div>
                          {unreadCount > 0 && (
                            <span className="grid h-5 min-w-5 px-1.5 place-items-center rounded-full bg-red-600 text-[10px] font-bold text-white shrink-0 shadow-2xs">
                              {unreadCount}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>

            {/* Box 4: Reviews */}
            <Panel title="Reviews" action={<MoreLink href={bizSlugOrId ? `/business/${bizSlugOrId}` : "/biz/profile"} label="View all →" />}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-slate-900 tabular-nums">
                    {avgRating}
                  </span>
                  <div>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${
                            star <= Math.round(Number(avgRating))
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200 fill-slate-100"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                      {reviews.length} published {reviews.length === 1 ? "review" : "reviews"}
                    </p>
                  </div>
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-xs text-slate-400 font-medium">No reviews published yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Customer feedback and ratings will appear here.</p>
                </div>
              ) : (
                <div className="mt-3 space-y-2.5">
                  {reviews.slice(0, 3).map((rev, idx) => {
                    const authorName = safeText(rev.author?.name || rev.authorName, "Verified Customer");
                    const revRating = Number(rev.rating) || 5;
                    const revText = safeText(rev.body || rev.comment, "Great service and business.");
                    const revDate = rev.createdAt ? new Date(rev.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "";

                    return (
                      <div key={rev._id || idx} className="rounded-xl bg-slate-50/80 p-3 border border-slate-100">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="grid h-6 w-6 place-items-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-800 uppercase">
                              {authorName.slice(0, 1)}
                            </span>
                            <span className="text-xs font-bold text-slate-900 truncate">{authorName}</span>
                          </div>
                          <div className="flex items-center gap-0.5 text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`h-2.5 w-2.5 ${s <= revRating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          "{revText}"
                        </p>
                        {revDate && (
                          <p className="mt-1 text-[10px] text-slate-400 text-right">{revDate}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>

            {/* Box 5: Notifications */}
            <Panel title="Notifications" action={<MoreLink href="/biz/notifications" label="View all →" />}>
              {notificationItems.length === 0 ? (
                <p className="text-xs text-slate-400 font-medium text-center py-4">No notifications</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {notificationItems.map((n, idx) => {
                    const notifTitle = safeText(n.title || n.type, "Notification");
                    const notifBody = safeText(n.body || n.message || n.desc, "");
                    const isUnread = !n.isRead && !n.readAt;

                    return (
                      <li key={n._id || n.id || idx} className="py-2.5 first:pt-0 last:pb-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {isUnread && (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-red-600 ring-2 ring-red-100" />
                            )}
                            <p className={`text-sm leading-snug truncate ${isUnread ? "font-bold text-slate-900" : "font-medium text-slate-700"}`}>
                              {notifTitle}
                            </p>
                          </div>
                          {isUnread && (
                            <span className="shrink-0 rounded-full bg-red-50 border border-red-100 px-1.5 py-0.2 text-[10px] font-bold text-red-600">
                              Unread
                            </span>
                          )}
                        </div>
                        {Boolean(notifBody) && (
                          <p className={`mt-0.5 text-xs leading-normal truncate ${isUnread ? "text-slate-600 font-medium" : "text-slate-400"}`}>
                            {notifBody}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export { BusinessHome as BizDashboard };
export default BusinessHome;
