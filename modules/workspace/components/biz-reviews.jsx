"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Star,
  MessageCircle,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ThumbsUp,
  BarChart3,
} from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { useBusinessReviews, useMyBusiness } from "@shared/hooks/use-rifah-api";

// ─── Helpers ────────────────────────────────────────────────────────────────

function StarRow({ filled = 0, total = 5 }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: total }).map((_, i) => (
        <Star
          key={i}
          className={
            i < filled
              ? "h-3.5 w-3.5 fill-amber-400 text-amber-400"
              : "h-3.5 w-3.5 text-slate-200"
          }
        />
      ))}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    approved: {
      label: "Approved",
      icon: CheckCircle2,
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    published: {
      label: "Published",
      icon: CheckCircle2,
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    pending: {
      label: "Pending review",
      icon: Clock,
      cls: "bg-amber-50 text-amber-700 border-amber-200",
    },
    rejected: {
      label: "Rejected",
      icon: XCircle,
      cls: "bg-red-50 text-red-600 border-red-200",
    },
  };
  const cfg = map[status] ?? {
    label: status,
    icon: AlertCircle,
    cls: "bg-slate-50 text-slate-600 border-slate-200",
  };
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cfg.cls}`}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

const TABS = ["All", "Approved", "Pending", "Rejected"];

function tabFilter(review, tab) {
  if (tab === "All") return true;
  const s = (review.status || "").toLowerCase();
  if (tab === "Approved") return s === "approved" || s === "published";
  if (tab === "Pending") return s === "pending";
  if (tab === "Rejected") return s === "rejected";
  return true;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function BizReviews() {
  const [activeTab, setActiveTab] = useState("All");

  const { data: business } = useMyBusiness();
  const { data: reviewsData, isLoading } = useBusinessReviews(business?._id);

  const allReviews = Array.isArray(reviewsData)
    ? reviewsData
    : reviewsData?.reviews ?? [];

  const filtered = allReviews.filter((r) => tabFilter(r, activeTab));

  // ── Aggregate Stats ────────────────────────────────────────────────────────
  const approvedReviews = allReviews.filter(
    (r) => r.status === "approved" || r.status === "published"
  );
  const pendingReviews = allReviews.filter((r) => r.status === "pending");
  const rejectedReviews = allReviews.filter((r) => r.status === "rejected");

  const avgRating =
    approvedReviews.length > 0
      ? approvedReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) /
        approvedReviews.length
      : 0;

  // Star distribution (1–5) based on approved/published reviews
  const starDist = [5, 4, 3, 2, 1].map((star) => {
    const count = approvedReviews.filter((r) => Number(r.rating) === star).length;
    const pct = approvedReviews.length > 0 ? (count / approvedReviews.length) * 100 : 0;
    return { star, count, pct };
  });

  // Public profile URL for buyers to leave reviews
  const publicProfileUrl = business?.slug
    ? `/business/${business._id}`
    : null;

  return (
    <AppShell
      role="business"
      title="Reviews"
      subtitle="Customer feedback and ratings for your business"
      actions={
        publicProfileUrl ? (
          <Button asChild variant="outline" size="sm">
            <Link href={publicProfileUrl} target="_blank">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              View Public Profile
            </Link>
          </Button>
        ) : null
      }
    >
      <div className="space-y-4">

        {/* ── Stat cards ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Average rating"
            value={approvedReviews.length > 0 ? avgRating.toFixed(1) : "—"}
            hint={
              approvedReviews.length > 0
                ? `${approvedReviews.length} published review${approvedReviews.length !== 1 ? "s" : ""}`
                : "No reviews yet"
            }
            icon={Star}
            tone="warning"
          />
          <StatCard
            label="Total reviews"
            value={String(allReviews.length)}
            hint="All statuses combined"
            icon={MessageCircle}
            tone="primary"
          />
          <StatCard
            label="Pending review"
            value={String(pendingReviews.length)}
            hint="Awaiting moderation"
            icon={Clock}
            tone="brand"
          />
          <StatCard
            label="Approved"
            value={String(approvedReviews.length)}
            hint="Visible on public profile"
            icon={ThumbsUp}
            tone="success"
          />
        </div>

        {/* ── Rating Distribution + List ──────────────────────────────────── */}
        <div className="grid gap-4 lg:grid-cols-3">

          {/* Star distribution panel */}
          <Panel
            title="Rating breakdown"
            description="Based on approved reviews"
          >
            {approvedReviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                <BarChart3 className="h-8 w-8 text-slate-200 stroke-[1.5]" />
                <p className="text-sm font-semibold text-slate-600">No approved reviews yet</p>
                <p className="text-xs text-slate-400">
                  Share your public profile so buyers can leave reviews
                </p>
                {publicProfileUrl && (
                  <Button asChild size="sm" className="mt-2">
                    <Link href={publicProfileUrl} target="_blank">
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                      View Profile
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {/* Big average */}
                <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                  <span className="text-4xl font-bold text-slate-800 tabular-nums leading-none">
                    {avgRating.toFixed(1)}
                  </span>
                  <div className="space-y-1">
                    <StarRow filled={Math.round(avgRating)} />
                    <p className="text-xs text-slate-500">
                      {approvedReviews.length} review{approvedReviews.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Per-star bars */}
                {starDist.map(({ star, count, pct }) => (
                  <div key={star} className="flex items-center gap-2.5">
                    <span className="w-3 text-xs font-bold text-slate-700 text-right">
                      {star}
                    </span>
                    <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />
                    <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      {pct > 0 && (
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-amber-400 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      )}
                    </div>
                    <span className="w-5 text-xs font-bold tabular-nums text-slate-500 text-right">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* Reviews list panel */}
          <Panel
            title="All reviews"
            description="Buyer feedback across all moderation statuses"
            className="lg:col-span-2"
          >
            {/* Tab bar */}
            <div className="no-scrollbar -mx-1 mb-3 flex gap-2 overflow-x-auto px-1">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTab(t)}
                  aria-pressed={activeTab === t}
                  className={
                    activeTab === t
                      ? "shrink-0 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground"
                      : "shrink-0 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/40 transition-colors"
                  }
                >
                  {t}
                  {t === "Pending" && pendingReviews.length > 0 && (
                    <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                      {pendingReviews.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm text-slate-500">Loading reviews…</p>
              </div>
            )}

            {/* Empty */}
            {!isLoading && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                <MessageCircle className="h-8 w-8 text-slate-200 stroke-[1.5]" />
                <p className="text-sm font-semibold text-slate-600">
                  {activeTab === "All"
                    ? "No reviews yet"
                    : `No ${activeTab.toLowerCase()} reviews`}
                </p>
                {activeTab === "All" && (
                  <p className="text-xs text-slate-400 max-w-xs">
                    When buyers submit reviews on your public profile, they'll appear here for you to track
                  </p>
                )}
                {activeTab === "All" && publicProfileUrl && (
                  <Button asChild size="sm" className="mt-2" variant="outline">
                    <Link href={publicProfileUrl} target="_blank">
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                      Share Your Profile
                    </Link>
                  </Button>
                )}
              </div>
            )}

            {/* Review list */}
            {!isLoading && filtered.length > 0 && (
              <ul className="space-y-3">
                {filtered.map((r, idx) => (
                  <li
                    key={r._id ?? idx}
                    className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-2 transition-all hover:border-slate-200"
                  >
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="space-y-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {r.title || "Buyer Review"}
                        </p>
                        <p className="text-[11px] font-medium text-slate-400">
                          {r.authorName || "Verified Member"}
                          {r.authorRole ? ` · ${r.authorRole}` : ""}
                          {r.createdAt
                            ? ` · ${new Date(r.createdAt).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}`
                            : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StarRow filled={Number(r.rating) || 0} />
                        <StatusBadge status={r.status} />
                      </div>
                    </div>

                    {/* Body */}
                    {r.body && (
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {r.body}
                      </p>
                    )}

                    {/* Pending note */}
                    {r.status === "pending" && (
                      <div className="flex items-start gap-1.5 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 mt-1">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-amber-700 font-medium">
                          This review is awaiting moderation and is not yet visible on your public profile.
                        </p>
                      </div>
                    )}

                    {/* Rejected note */}
                    {r.status === "rejected" && (
                      <div className="flex items-start gap-1.5 rounded-lg bg-red-50 border border-red-100 px-3 py-2 mt-1">
                        <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-red-600 font-medium">
                          This review was not approved and is hidden from your public profile.
                        </p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {/* ── CTA card when no reviews at all ────────────────────────────── */}
        {!isLoading && allReviews.length === 0 && (
          <Panel className="border-dashed">
            <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 border border-amber-100">
                <Star className="h-7 w-7 fill-amber-400 text-amber-400" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-800">No reviews yet — start collecting them!</p>
                <p className="text-sm text-slate-500 max-w-md">
                  Share your public business profile with your customers and ask them to leave a review. Reviews build trust and improve your chapter standing.
                </p>
              </div>
              {publicProfileUrl && (
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  <Button asChild>
                    <Link href={publicProfileUrl} target="_blank">
                      <ExternalLink className="mr-1.5 h-4 w-4" />
                      View Public Profile
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </Panel>
        )}
      </div>
    </AppShell>
  );
}

export default BizReviews;
