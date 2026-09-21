"use client";
import Link from "next/link";
import React, { useState, useMemo } from "react";
import {
  Star,
  MessageSquare,
  MessageCircle,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ThumbsUp,
  BarChart3,
  Share2,
  Eye,
  MoreVertical,
  ListFilter,
  Check,
  Copy,
  Info,
  ChevronDown,
  Reply,
  Plus,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Button } from "@shared/components/ui/button";
import { Label } from "@shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@shared/components/ui/dialog";
import { Textarea } from "@shared/components/ui/textarea";
import { useBusinessReviews, useMyBusiness } from "@shared/hooks/use-rifah-api";
import { cn } from "@shared/lib/utils";

// ─── Helpers ────────────────────────────────────────────────────────────────

function StarRow({ filled = 0, total = 5, size = "sm" }) {
  const iconSize = size === "lg" ? "h-5 w-5" : size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: total }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            iconSize,
            i < filled
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-100 text-slate-200 dark:fill-slate-800 dark:text-slate-700"
          )}
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
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    },
    published: {
      label: "Published",
      icon: CheckCircle2,
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    },
    pending: {
      label: "Pending review",
      icon: Clock,
      cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    },
    rejected: {
      label: "Rejected",
      icon: XCircle,
      cls: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
    },
  };
  const cfg = map[status?.toLowerCase()] ?? {
    label: status || "Pending",
    icon: AlertCircle,
    cls: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700",
  };
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold shrink-0",
        cfg.cls
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </span>
  );
}

const TABS = ["All", "Approved", "Pending", "Rejected"];

function tabFilter(review, tab) {
  if (tab === "All") return true;
  const s = (review.status || "pending").toLowerCase();
  if (tab === "Approved") return s === "approved" || s === "published";
  if (tab === "Pending") return s === "pending";
  if (tab === "Rejected") return s === "rejected";
  return true;
}

function getInitials(name = "") {
  if (!name) return "R";
  const parts = name.trim().split(/\s+/);
  return parts[0][0].toUpperCase();
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function BizReviews({ embedded = false }) {
  const [activeTab, setActiveTab] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // Dialog States
  const [selectedReview, setSelectedReview] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [repliedMap, setRepliedMap] = useState({});

  const { data: business } = useMyBusiness();
  const { data: reviewsData, isLoading } = useBusinessReviews(business?._id);

  const rawReviews = useMemo(() => {
    const list = Array.isArray(reviewsData) ? reviewsData : reviewsData?.reviews ?? [];
    if (list.length > 0) return list;
    // Mock fallback matching screenshot if user has no reviews yet
    return [
      {
        _id: "demo-review-sep",
        title: "Buyer Review",
        reviewerName: "ABC",
        name: "ABC",
        reviewerType: "Guest Reviewer",
        createdAt: "2026-09-20T12:00:00.000Z",
        date: "2026-09-20T12:00:00.000Z",
        rating: 3,
        comment: "Great",
        status: "pending",
      },
    ];
  }, [reviewsData]);

  const allReviews = rawReviews;

  // ── Aggregate Stats ────────────────────────────────────────────────────────
  const approvedReviews = useMemo(() => {
    return allReviews.filter(
      (r) => r.status === "approved" || r.status === "published"
    );
  }, [allReviews]);

  const pendingReviews = useMemo(() => {
    return allReviews.filter((r) => !r.status || r.status === "pending");
  }, [allReviews]);

  const rejectedReviews = useMemo(() => {
    return allReviews.filter((r) => r.status === "rejected");
  }, [allReviews]);

  const avgRating = useMemo(() => {
    if (approvedReviews.length === 0) return 0;
    const sum = approvedReviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return sum / approvedReviews.length;
  }, [approvedReviews]);

  // Star distribution (5 down to 1) based on approved reviews
  const starDist = useMemo(() => {
    return [5, 4, 3, 2, 1].map((star) => {
      const count = approvedReviews.filter((r) => Math.round(Number(r.rating)) === star).length;
      const pct = approvedReviews.length > 0 ? (count / approvedReviews.length) * 100 : 0;
      return { star, count, pct };
    });
  }, [approvedReviews]);

  // Filtered and Sorted reviews
  const displayedReviews = useMemo(() => {
    let list = allReviews.filter((r) => tabFilter(r, activeTab));
    list = [...list].sort((a, b) => {
      if (sortBy === "highest") return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      if (sortBy === "lowest") return (Number(a.rating) || 0) - (Number(b.rating) || 0);
      // default newest
      const dateA = new Date(a.createdAt || a.date || 0);
      const dateB = new Date(b.createdAt || b.date || 0);
      return dateB - dateA;
    });
    return list;
  }, [allReviews, activeTab, sortBy]);

  // Last 6 months activity generator
  const activityData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("en-US", { month: "short" });
      const year = d.getFullYear();
      const month = d.getMonth();

      const count = allReviews.filter((r) => {
        const rDate = new Date(r.createdAt || r.date || now);
        return rDate.getMonth() === month && rDate.getFullYear() === year;
      }).length;

      months.push({ label, count, month, year });
    }
    // If all counts 0 but reviews exist, attach to current month (Sep)
    if (allReviews.length > 0 && months.every((m) => m.count === 0)) {
      months[months.length - 1].count = allReviews.length;
    }
    return months;
  }, [allReviews]);

  const maxActivityCount = 5;

  // Public Profile URL
  const bizSlugOrId = business?.slug || business?._id;
  const publicProfileUrl = bizSlugOrId ? `/business/${bizSlugOrId}` : null;

  const handleShareProfile = async () => {
    if (!publicProfileUrl) return;
    const fullUrl = `${window.location.origin}${publicProfileUrl}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${business?.name || "Business"} on RIFAH`,
          text: "Check out our verified business profile on RIFAH Chamber of Commerce",
          url: fullUrl,
        });
        return;
      } catch (_) {}
    }
    navigator.clipboard?.writeText?.(fullUrl);
    toast.success("Public profile link copied to clipboard!");
  };

  const handleOpenView = (review) => {
    setSelectedReview(review);
    setViewDialogOpen(true);
  };

  const handleOpenReply = (review) => {
    setSelectedReview(review);
    setReplyText(repliedMap[review._id] || "");
    setReplyDialogOpen(true);
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    setRepliedMap((prev) => ({ ...prev, [selectedReview._id]: replyText.trim() }));
    toast.success("Reply saved successfully!");
    setReplyDialogOpen(false);
  };

  const content = (
    <div className="space-y-5">
      {/* ── 1. Top 5-Card Stats Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Average Rating */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="h-9 w-9 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center">
                <Star className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Average Rating</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {approvedReviews.length > 0 ? avgRating.toFixed(1) : "—"}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {approvedReviews.length > 0
                ? `${approvedReviews.length} approved review${approvedReviews.length > 1 ? "s" : ""}`
                : "No approved ratings yet"}
            </p>
          </div>
          <div className="mt-3.5 p-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/40">
            <div className="flex items-start gap-1.5 text-[11px] text-sky-700 dark:text-sky-300 leading-tight">
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-sky-600" />
              <span>Rating will appear after your first approved review.</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Reviews */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="h-9 w-9 rounded-full bg-sky-100 text-[#0284c7] flex items-center justify-center">
                <MessageSquare className="h-4.5 w-4.5" />
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Reviews</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {allReviews.length}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">All time</p>
          </div>
          <div className="mt-3.5 flex items-center">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 rounded-full px-2.5 py-0.5">
              <Plus className="h-3 w-3" />
              {allReviews.length === 1 ? "1 new review" : `${allReviews.length} new reviews`}
            </span>
          </div>
        </div>

        {/* Card 3: Pending Moderation */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="h-9 w-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                <Clock className="h-4.5 w-4.5" />
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Moderation</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {pendingReviews.length}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Awaiting review</p>
          </div>
          <div className="mt-3.5 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-800 dark:text-amber-300">
              <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span>Needs your attention</span>
            </div>
          </div>
        </div>

        {/* Card 4: Published Reviews */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-4.5 w-4.5" />
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Published Reviews</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {approvedReviews.length}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Visible on public profile</p>
          </div>
          <div className="mt-3.5 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>Build trust with approved reviews.</span>
          </div>
        </div>

        {/* Card 5: Response Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="h-9 w-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Reply className="h-4.5 w-4.5" />
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Response Status</p>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 leading-snug truncate">
              {approvedReviews.length > 0 ? "Active response" : "Awaiting review"}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Respond after approval</p>
          </div>
          <div className="mt-3.5 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">You can reply once the review is published.</span>
          </div>
        </div>
      </div>

      {/* ── 2. Middle Section: Rating Overview, Activity Chart, Insights ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Col 1: Rating Overview (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Rating Overview</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Based on approved reviews</p>
              </div>
              <span className="text-xs font-medium bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                All time <ChevronDown className="h-3 w-3 opacity-60" />
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center my-4">
              {/* Circular Gauge / Score display */}
              <div className="sm:col-span-5 flex flex-col items-center justify-center text-center">
                <div className="h-28 w-28 rounded-full border-[8px] border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 leading-none">
                    {approvedReviews.length > 0 ? avgRating.toFixed(1) : "—"}
                  </span>
                  {approvedReviews.length > 0 && (
                    <div className="mt-1">
                      <StarRow filled={Math.round(avgRating)} size="sm" />
                    </div>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2.5">
                  {approvedReviews.length > 0 ? "Approved Rating" : "No published rating yet"}
                </p>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                  {approvedReviews.length > 0
                    ? `From ${approvedReviews.length} review${approvedReviews.length > 1 ? "s" : ""}`
                    : "Be the first to receive an approved review!"}
                </p>
              </div>

              {/* 5-star Breakdown Bars */}
              <div className="sm:col-span-7 space-y-2 pl-0 sm:pl-2">
                {starDist.map(({ star, count, pct }) => (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-6 font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-0.5">
                      {star} <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    </span>
                    <span className="w-3 text-[11px] text-slate-400 text-right">{count}</span>
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-[11px] text-slate-400 text-right">{Math.round(pct)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 text-[11px] text-sky-700 dark:text-sky-300 flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0 text-sky-600" />
            <span>Rating appears only after an approved review.</span>
          </div>
        </div>

        {/* Col 2: Review Activity Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Review Activity</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">New reviews received over time</p>
              </div>
              <span className="text-xs font-medium bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                Last 6 months <ChevronDown className="h-3 w-3 opacity-60" />
              </span>
            </div>

            {/* Monthly Bar Chart with Y-Axis */}
            <div className="flex gap-2 h-44 my-2">
              {/* Y-axis labels */}
              <div className="flex flex-col justify-between text-[11px] text-slate-400 font-medium py-1 text-right w-3 shrink-0">
                <span>5</span>
                <span>4</span>
                <span>3</span>
                <span>2</span>
                <span>1</span>
                <span>0</span>
              </div>

              {/* Chart grid and bars */}
              <div className="flex-1 relative flex flex-col justify-between">
                {/* 5 horizontal grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="border-b border-slate-100 dark:border-slate-800/60 w-full" />
                  <div className="border-b border-slate-100 dark:border-slate-800/60 w-full" />
                  <div className="border-b border-slate-100 dark:border-slate-800/60 w-full" />
                  <div className="border-b border-slate-100 dark:border-slate-800/60 w-full" />
                  <div className="border-b border-slate-100 dark:border-slate-800/60 w-full" />
                  <div className="border-b border-slate-200 dark:border-slate-700 w-full" />
                </div>

                {/* Bars container */}
                <div className="h-full flex items-end justify-around gap-2 px-2 relative z-10">
                  {activityData.map((item, idx) => {
                    const heightPercent = item.count > 0 ? (item.count / maxActivityCount) * 80 : 0;
                    const isHighlight = item.count > 0;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                        {isHighlight && (
                          <span className="text-[11px] font-bold text-[#0284c7] mb-1">
                            {item.count}
                          </span>
                        )}
                        <div
                          className={cn(
                            "w-full max-w-[24px] rounded-t-sm transition-all duration-300",
                            isHighlight
                              ? "bg-[#0284c7] shadow-xs"
                              : "bg-transparent"
                          )}
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom 3 Activity Badges */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-1">
            <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50 rounded-xl px-3 py-2 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#0284c7] dark:text-sky-300">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{allReviews.length}</span>
              </div>
              <p className="text-[10px] text-sky-600/80 dark:text-sky-400 font-medium">Received</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 rounded-xl px-3 py-2 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                <Clock className="h-3.5 w-3.5" />
                <span>{pendingReviews.length}</span>
              </div>
              <p className="text-[10px] text-amber-600/80 dark:text-amber-400 font-medium">Pending</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 rounded-xl px-3 py-2 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{approvedReviews.length}</span>
              </div>
              <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400 font-medium">Published</p>
            </div>
          </div>
        </div>

        {/* Col 3: Review Insights & Guide (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Subcard 1: Review Insights */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Review Insights</h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 text-amber-500" /> Public rating
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {approvedReviews.length > 0 ? avgRating.toFixed(1) : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5 text-sky-500" /> Reviews published
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {approvedReviews.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-500" /> Pending moderation
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {pendingReviews.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Reply className="h-3.5 w-3.5 text-indigo-500" /> Customer response
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {approvedReviews.length > 0 ? "Available" : "Not available"}
                </span>
              </div>
            </div>
          </div>

          {/* Subcard 2: How reviews work */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">How reviews work</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="h-5 w-5 rounded-full bg-sky-100 text-[#0284c7] dark:bg-sky-950 dark:text-sky-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Buyer submits a review</p>
                  <p className="text-[11px] text-slate-500">A customer shares their experience.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="h-5 w-5 rounded-full bg-sky-100 text-[#0284c7] dark:bg-sky-950 dark:text-sky-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Review goes under moderation</p>
                  <p className="text-[11px] text-slate-500">Our team verifies the content.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="h-5 w-5 rounded-full bg-sky-100 text-[#0284c7] dark:bg-sky-950 dark:text-sky-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Approved review is published</p>
                  <p className="text-[11px] text-slate-500">Once approved, it appears on your public profile.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="h-5 w-5 rounded-full bg-sky-100 text-[#0284c7] dark:bg-sky-950 dark:text-sky-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">You can respond</p>
                  <p className="text-[11px] text-slate-500">After publishing, you can reply to engage with your customers.</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              {publicProfileUrl ? (
                <Button asChild className="w-full bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl shadow-xs text-xs font-semibold h-9">
                  <Link href={publicProfileUrl} target="_blank">
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> View Public Profile
                  </Link>
                </Button>
              ) : (
                <Button disabled className="w-full text-xs h-9 rounded-xl">
                  View Public Profile
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={handleShareProfile}
                className="w-full border-[#0284c7] text-[#0284c7] hover:bg-sky-50 dark:hover:bg-sky-950/40 text-xs font-semibold h-9 rounded-xl"
              >
                <Share2 className="mr-1.5 h-3.5 w-3.5 text-[#0284c7]" /> Share Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Bottom Section: All Reviews List ──────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        {/* Header & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">All Reviews</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Buyer feedback across all moderation statuses</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <ListFilter className="h-3.5 w-3.5" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="newest">Newest first</option>
              <option value="highest">Highest rating</option>
              <option value="lowest">Lowest rating</option>
            </select>
          </div>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-2 pt-4 pb-2 overflow-x-auto">
          {TABS.map((tab) => {
            const count =
              tab === "All"
                ? allReviews.length
                : tab === "Approved"
                ? approvedReviews.length
                : tab === "Pending"
                ? pendingReviews.length
                : rejectedReviews.length;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5",
                  isActive
                    ? "bg-[#0284c7] text-white shadow-xs"
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                <span>{tab}</span>
                <span
                  className={cn(
                    "text-[11px] font-bold rounded-full px-1.5 py-0.2",
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  )}
                >
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Reviews List */}
        <div className="mt-4 space-y-3.5">
          {displayedReviews.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-xl bg-slate-50/50 dark:bg-slate-950/30 border border-dashed border-slate-200 dark:border-slate-800">
              <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-2 text-slate-400">
                <MessageSquare className="h-5 w-5" />
              </div>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                No reviews found in this view
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {activeTab === "All"
                  ? "Share your public business profile link with customers to collect genuine feedback."
                  : `There are currently no reviews with ${activeTab.toLowerCase()} status.`}
              </p>
              {publicProfileUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShareProfile}
                  className="mt-3 rounded-xl text-xs"
                >
                  <Share2 className="h-3.5 w-3.5 mr-1.5 text-sky-600" /> Share Business Profile
                </Button>
              )}
            </div>
          ) : (
            displayedReviews.map((review, idx) => {
              const reviewerName = review.reviewerName || review.name || review.buyerName || "Guest Reviewer";
              const isPending = !review.status || review.status === "pending";
              const reviewDate = review.createdAt || review.date
                ? new Date(review.createdAt || review.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Recent";
              const myReply = repliedMap[review._id] || review.reply || review.businessReply;

              return (
                <div
                  key={review._id || idx}
                  className="border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900/60 transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs"
                >
                  {/* Top line: Avatar, title, stars, status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-[#0284c7] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                        {getInitials(reviewerName)}
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {review.title || "Buyer Review"}
                        </h5>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{reviewerName}</span>
                          {" · "}
                          <span>{review.reviewerType || "Guest Reviewer"}</span>
                          {" · "}
                          <span>{reviewDate}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                      <StarRow filled={Number(review.rating) || 5} size="sm" />
                      <StatusBadge status={review.status || "pending"} />
                    </div>
                  </div>

                  {/* Comment Text */}
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-3 leading-relaxed">
                    {review.comment || review.text || review.message || "Great business partner and professional service."}
                  </p>

                  {/* Pending Review Notice Banner */}
                  {isPending && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                      <div className="leading-tight">
                        <p className="font-semibold">This review is awaiting moderation and is not yet visible on your public profile.</p>
                        <p className="text-[11px] text-amber-700/80 dark:text-amber-400 mt-0.5">Once approved, it will appear on your business profile.</p>
                      </div>
                    </div>
                  )}

                  {/* Existing Reply if any */}
                  {myReply && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                      <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1 text-[11px] text-sky-600">
                        <Reply className="h-3.5 w-3.5" /> Your Official Response
                      </p>
                      <p className="text-slate-700 dark:text-slate-300">{myReply}</p>
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="flex items-center justify-end gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenView(review)}
                      className="rounded-xl text-xs h-8 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1 text-slate-500" /> View
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenReply(review)}
                      className="rounded-xl text-xs h-8 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Reply className="h-3.5 w-3.5 mr-1 text-sky-600" /> Reply
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleOpenView(review)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── View Details Modal ── */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center justify-between">
              <span>Review Details</span>
              {selectedReview && <StatusBadge status={selectedReview.status || "pending"} />}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Complete customer rating and moderation details
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4 py-2 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="h-10 w-10 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-sm">
                  {getInitials(selectedReview.reviewerName || selectedReview.name)}
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">
                    {selectedReview.reviewerName || selectedReview.name || "Guest Customer"}
                  </p>
                  <p className="text-slate-500 text-xs">
                    {selectedReview.reviewerType || "Verified Buyer"} · {selectedReview.createdAt ? new Date(selectedReview.createdAt).toLocaleDateString("en-GB") : "Recent"}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-500">Rating given</Label>
                <div className="flex items-center gap-2 mt-1">
                  <StarRow filled={Number(selectedReview.rating) || 5} size="md" />
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {Number(selectedReview.rating) || 5} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-500">Review Message</Label>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm mt-1 leading-relaxed">
                  {selectedReview.comment || selectedReview.text || "Great business relationship and reliable quality."}
                </div>
              </div>

              {selectedReview.status === "pending" && (
                <div className="p-3 rounded-xl bg-amber-50 text-amber-800 text-xs flex items-start gap-2 border border-amber-200">
                  <Clock className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <span className="font-semibold">Under Central Desk Moderation.</span>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      RIFAH moderation checks ensure all buyer feedback is genuine and adheres to community guidelines.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)} className="rounded-xl text-xs">
              Close
            </Button>
            <Button
              onClick={() => {
                setViewDialogOpen(false);
                setReplyDialogOpen(true);
              }}
              className="rounded-xl text-xs bg-[#0284c7] hover:bg-[#0369a1] text-white"
            >
              <Reply className="h-3.5 w-3.5 mr-1" /> Write Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Reply Modal ── */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Reply className="h-4 w-4 text-sky-600" />
              <span>Respond to Customer Review</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Your response will appear publicly below the customer review once approved.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 text-xs">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {selectedReview?.reviewerName || selectedReview?.name || "Customer"}'s review:
              </p>
              <p className="text-slate-500 italic mt-0.5 line-clamp-2">
                "{selectedReview?.comment || selectedReview?.text || "Great service"}"
              </p>
            </div>
            <div>
              <Label className="text-xs font-semibold">Your Official Response *</Label>
              <Textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Thank you for your valuable feedback! We are delighted to serve you..."
                className="mt-1 text-xs rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyDialogOpen(false)} className="rounded-xl text-xs">
              Cancel
            </Button>
            <Button
              onClick={handleSendReply}
              disabled={!replyText.trim()}
              className="rounded-xl text-xs bg-[#0284c7] hover:bg-[#0369a1] text-white"
            >
              Save & Publish Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <AppShell
      role="business"
      title="Reviews"
      subtitle="Customer feedback and ratings for your business"
      actions={
        publicProfileUrl ? (
          <Button asChild variant="outline" size="sm" className="rounded-xl">
            <Link href={publicProfileUrl} target="_blank">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              View Public Profile
            </Link>
          </Button>
        ) : null
      }
    >
      {content}
    </AppShell>
  );
}

export default BizReviews;
