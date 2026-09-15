"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  Search,
  Building2,
  User,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@shared/components/ui/dialog";
import { useAdminReviews } from "@shared/hooks/use-rifah-api";
import { reviewApi } from "@shared/lib/api-services";
import { cn } from "@shared/lib/utils";

export function AdminReviews() {
  const { data: reviewsData, refetch, isLoading } = useAdminReviews();
  const reviews = Array.isArray(reviewsData) ? reviewsData : reviewsData?.reviews || [];

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModal, setDeleteModal] = useState({ open: false, review: null });
  const [deleteAllModal, setDeleteAllModal] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const stats = useMemo(() => {
    return {
      total: reviews.length,
      pending: reviews.filter((r) => r.status === "pending").length,
      approved: reviews.filter((r) => r.status === "approved").length,
      rejected: reviews.filter((r) => r.status === "rejected").length,
    };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      if (!matchesStatus) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const title = (r.title || "").toLowerCase();
      const body = (r.body || "").toLowerCase();
      const author = (r.authorName || r.author?.name || "").toLowerCase();
      const bizName = (r.business?.name || "").toLowerCase();
      return title.includes(q) || body.includes(q) || author.includes(q) || bizName.includes(q);
    });
  }, [reviews, statusFilter, searchQuery]);

  const handleModerate = async (id, status) => {
    setProcessingId(id);
    try {
      await reviewApi.moderate(id, { status });
      const actionName = status === "approved" ? "approved" : status === "rejected" ? "rejected" : "moved to pending";
      toast.success(`Review ${actionName} successfully`);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to update review status.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.review) return;
    const id = deleteModal.review._id || deleteModal.review.id;
    setIsDeleting(true);
    try {
      await reviewApi.delete(id);
      toast.success("Review deleted permanently");
      setDeleteModal({ open: false, review: null });
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to delete review.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    setIsDeletingAll(true);
    try {
      const params = statusFilter !== "all" ? { status: statusFilter } : {};
      const res = await reviewApi.deleteAll(params);
      const count = res?.data?.deletedCount ?? res?.deletedCount;
      toast.success(
        typeof count === "number"
          ? `Successfully deleted ${count} review(s)`
          : "All selected reviews deleted successfully"
      );
      setDeleteAllModal(false);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to delete all reviews.");
    } finally {
      setIsDeletingAll(false);
    }
  };

  const getStatusPill = (status) => {
    switch (status) {
      case "approved":
        return <Pill tone="success">Approved</Pill>;
      case "rejected":
        return <Pill tone="danger">Rejected</Pill>;
      default:
        return <Pill tone="warning">Pending</Pill>;
    }
  };

  const filterTabs = [
    { id: "all", label: "All Reviews", count: stats.total },
    { id: "approved", label: "Approved", count: stats.approved },
    { id: "rejected", label: "Rejected", count: stats.rejected },
  ];

  return (
    <AppShell
      role="admin"
      title="Review moderation"
      subtitle="Verify customer feedback, manage publication status, and remove improper reviews"
    >
      <div className="space-y-4">
        {/* Top KPI statistics */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard label="Total Reviews" value={String(stats.total)} icon={MessageSquare} tone="primary" />
          <StatCard label="Approved / Live" value={String(stats.approved)} tone="success" />
          <StatCard label="Rejected" value={String(stats.rejected)} tone="destructive" />
        </div>

        <Panel title="Reviews Management">
          <div className="space-y-4">
            {/* 1. Search Box on Top */}
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reviews by content, author, business name..."
                className="h-10 pl-10 text-sm"
              />
            </div>

            {/* 2. Filter Tabs Underneath Search + Delete All button */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {filterTabs.map((tab) => {
                  const isActive = statusFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setStatusFilter(tab.id)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors border cursor-pointer",
                        isActive
                          ? "bg-primary text-primary-foreground border-primary shadow-sm font-bold"
                          : "bg-surface text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-bold",
                          isActive
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Delete All Button */}
              <Button
                variant="outline"
                size="sm"
                className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5 h-9 text-xs font-semibold ml-auto"
                disabled={reviews.length === 0 || isDeletingAll}
                onClick={() => setDeleteAllModal(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete All {statusFilter !== "all" ? `(${statusFilter})` : `(${reviews.length})`}
              </Button>
            </div>

            {/* 3. Reviews list */}
            {isLoading ? (
              <div className="py-12 text-center text-sm text-muted-foreground animate-pulse">
                Loading reviews from server...
              </div>
            ) : filteredReviews.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title={
                  searchQuery
                    ? "No matching reviews found"
                    : statusFilter === "all"
                    ? "Queue is clear"
                    : `No ${statusFilter} reviews`
                }
                description={
                  searchQuery
                    ? "Try adjusting your search terms or filter selection."
                    : `Reviews with "${statusFilter}" status will show up here.`
                }
              />
            ) : (
              <ul className="space-y-3">
                {filteredReviews.map((r) => {
                  const reviewId = r._id || r.id;
                  const isBusy = processingId === reviewId;
                  const bizName = r.business?.name || "Business";
                  const bizSlug = r.business?.slug;

                  return (
                    <li
                      key={reviewId}
                      className="rounded-xl border border-border p-4 bg-surface transition-colors hover:border-primary/30"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {bizSlug ? (
                              <Link
                                href={`/businesses/${bizSlug}`}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                              >
                                <Building2 className="h-3.5 w-3.5" />
                                {bizName}
                              </Link>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                <Building2 className="h-3.5 w-3.5" />
                                {bizName}
                              </span>
                            )}
                            <span className="text-muted-foreground text-xs">•</span>
                            <h4 className="text-sm font-semibold text-foreground">
                              {r.title || "Customer Review"}
                            </h4>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {r.authorName || r.author?.name || "Anonymous Buyer"}
                            </span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(r.createdAt).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          {/* Rating stars */}
                          <div className="flex items-center gap-0.5 text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={cn(
                                  "h-3.5 w-3.5",
                                  star <= (r.rating || 0)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-muted-foreground/30"
                                )}
                              />
                            ))}
                            <span className="ml-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                              {r.rating} / 5
                            </span>
                          </div>

                          {getStatusPill(r.status)}
                        </div>
                      </div>

                      {/* Review body */}
                      <p className="mt-3 text-sm text-foreground/90 leading-relaxed bg-surface-muted/50 p-3 rounded-lg border border-border/50">
                        {r.body}
                      </p>

                      {/* Action buttons: Left shows current state / primary, Right shows alternate action, Far Right Delete */}
                      <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
                        {r.status === "approved" && (
                          <>
                            {/* Left: Approved (Active) */}
                            <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold bg-emerald-600 text-white shadow-sm">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Approved
                            </span>

                            {/* Right: Reject (Clickable) */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-amber-500/40 text-amber-700 hover:bg-amber-500/10 hover:text-amber-800 dark:text-amber-400 dark:border-amber-500/40 gap-1.5 h-8 text-xs font-medium"
                              disabled={isBusy}
                              onClick={() => handleModerate(reviewId, "rejected")}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Reject
                            </Button>
                          </>
                        )}

                        {r.status === "rejected" && (
                          <>
                            {/* Left: Rejected (Active) */}
                            <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold bg-rose-600 text-white shadow-sm">
                              <XCircle className="h-3.5 w-3.5" />
                              Rejected
                            </span>

                            {/* Right: Approve (Clickable) */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-emerald-600/40 text-emerald-700 hover:bg-emerald-500/10 hover:text-emerald-800 dark:text-emerald-400 dark:border-emerald-500/40 gap-1.5 h-8 text-xs font-medium"
                              disabled={isBusy}
                              onClick={() => handleModerate(reviewId, "approved")}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Approve
                            </Button>
                          </>
                        )}

                        {r.status !== "approved" && r.status !== "rejected" && (
                          <>
                            {/* Pending State: Left Approve, Right Reject */}
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-8 text-xs font-medium"
                              disabled={isBusy}
                              onClick={() => handleModerate(reviewId, "approved")}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Approve
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="border-amber-500/40 text-amber-700 hover:bg-amber-500/10 hover:text-amber-800 dark:text-amber-400 dark:border-amber-500/40 gap-1.5 h-8 text-xs font-medium"
                              disabled={isBusy}
                              onClick={() => handleModerate(reviewId, "rejected")}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Reject
                            </Button>
                          </>
                        )}

                        {/* Delete Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5 h-8 text-xs sm:ml-auto"
                          disabled={isBusy}
                          onClick={() => setDeleteModal({ open: true, review: r })}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Panel>
      </div>

      {/* Permanent Delete Confirmation Dialog */}
      <Dialog
        open={deleteModal.open}
        onOpenChange={(open) => !open && setDeleteModal({ open: false, review: null })}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Permanently Delete Review?
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 pt-2 text-sm text-muted-foreground">
                <p>
                  Are you sure you want to delete this review by{" "}
                  <strong className="text-foreground">
                    {deleteModal.review?.authorName || deleteModal.review?.author?.name || "the buyer"}
                  </strong>
                  ?
                </p>
                {deleteModal.review?.body && (
                  <p className="rounded-md border p-2.5 text-xs italic text-muted-foreground bg-surface-muted/50 line-clamp-3">
                    "{deleteModal.review.body}"
                  </p>
                )}
                <p className="text-xs text-destructive font-medium">
                  This action is permanent and cannot be undone. The business's rating and review count will be recalculated.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteModal({ open: false, review: null })}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete All Confirmation Dialog */}
      <Dialog
        open={deleteAllModal}
        onOpenChange={(open) => !open && setDeleteAllModal(false)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete All Reviews?
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 pt-2 text-sm text-muted-foreground">
                <p>
                  Are you sure you want to permanently delete{" "}
                  <strong className="text-destructive font-semibold">
                    {statusFilter !== "all" ? `all ${statusFilter} ` : "all "}
                    ({statusFilter !== "all" ? stats[statusFilter] || filteredReviews.length : reviews.length}) reviews
                  </strong>
                  ?
                </p>
                <p className="text-xs text-destructive font-medium">
                  This action is irreversible. All selected customer feedback and ratings will be wiped out, and business ratings will be recalculated.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteAllModal(false)}
              disabled={isDeletingAll}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAll}
              disabled={isDeletingAll}
              className="gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              {isDeletingAll ? "Deleting..." : "Yes, Delete All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export default AdminReviews;
