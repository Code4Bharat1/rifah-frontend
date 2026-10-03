"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Megaphone,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar as CalendarIcon,
  Eye,
  ExternalLink,
  ShieldCheck,
  Building2,
  Layers,
  Sparkles,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2,
  Check,
  X,
  Globe,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Textarea } from "@shared/components/ui/textarea";
import { Label } from "@shared/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import { resolveMediaUrl } from "@shared/lib/media";
import {
  useAdminAdvertisements,
  useReviewAdvertisement,
  useDeleteAdvertisement,
  useAdvertisementCalendar,
} from "@shared/hooks/use-rifah-api";
import { useAuth } from "@shared/providers/auth-provider";
import { cn } from "@shared/lib/utils";

const STATUS_MAP = {
  Pending: {
    label: "Needs Verification",
    badge: "bg-amber-600 text-white border-amber-700",
    icon: Clock,
  },
  Approved: {
    label: "Approved & Scheduled",
    badge: "bg-blue-600 text-white border-blue-700",
    icon: CheckCircle2,
  },
  Active: {
    label: "Live on Dashboard",
    badge: "bg-emerald-600 text-white border-emerald-700 animate-pulse",
    icon: Sparkles,
  },
  Queued: {
    label: "Queued",
    badge: "bg-indigo-600 text-white border-indigo-700",
    icon: Layers,
  },
  Completed: {
    label: "Completed",
    badge: "bg-slate-700 text-white border-slate-800",
    icon: CheckCircle2,
  },
  Rejected: {
    label: "Rejected",
    badge: "bg-rose-600 text-white border-rose-700",
    icon: XCircle,
  },
};

export function AdminAdvertisementsDesk({
  expectedRole = "chapter_admin",
  defaultScope = "chapter",
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Deterministic role calculation
  let role = expectedRole;
  if (!role && pathname) {
    if (pathname.startsWith("/state-admin")) role = "state_admin";
    else if (pathname.startsWith("/admin")) role = "admin";
    else role = "chapter_admin";
  }

  const isStateAdmin = role === "state_admin";
  const isCentralAdmin = role === "admin" || role === "central_admin";
  const isChapterAdmin = !isStateAdmin && !isCentralAdmin;

  const appShellRole = isStateAdmin ? "state_admin" : isCentralAdmin ? "admin" : "chapter";
  const scope = defaultScope || (isStateAdmin ? "state" : isCentralAdmin ? "global" : "chapter");

  const pageTitle = isStateAdmin
    ? "State Advertisements Desk"
    : isCentralAdmin
    ? "Central Advertisements Desk"
    : "Advertisements Desk";

  const pageSubtitle = isStateAdmin
    ? `Verify statewide member ads & manage slot queue · ${user?.state || "State Desk"}`
    : isCentralAdmin
    ? "Verify nationwide platform ads & manage slot queue · Central Administration"
    : `Verify member ads & manage slot queue · ${user?.chapter || "Chapter Desk"}`;

  const roleLabel = isStateAdmin ? "State Admin" : isCentralAdmin ? "Central Admin" : "Chapter Admin";

  const { data: adsData, isLoading: loadingAds } = useAdminAdvertisements({
    targetScope: isCentralAdmin ? "all" : scope,
  });
  const ads = Array.isArray(adsData) ? adsData : adsData?.data || [];

  const reviewMutation = useReviewAdvertisement();
  const deleteMutation = useDeleteAdvertisement();

  // Calendar Date State
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const calendarMonth = currentDate.getMonth() + 1;
  const calendarYear = currentDate.getFullYear();

  const { data: calendarSlotsData, isLoading: loadingCalendar } = useAdvertisementCalendar({
    month: calendarMonth,
    year: calendarYear,
    targetScope: scope,
  });
  const calendarSlots = Array.isArray(calendarSlotsData) ? calendarSlotsData : calendarSlotsData?.data || [];

  // Active / Selected Ad for Review
  const [reviewModal, setReviewModal] = useState({
    open: false,
    ad: null,
    action: "APPROVE", // "APPROVE" | "REJECT"
    durationDays: 1, // Default 1 day
    approvedStartDate: "",
    adminRemarks: "",
  });

  // Banner Preview Modal
  const [previewImage, setPreviewImage] = useState(null);

  // Grouped counts
  const pendingAds = ads.filter((a) => a.status === "Pending");
  const activeAd = ads.find((a) => a.status === "Active");
  const queuedAds = ads.filter((a) => a.status === "Queued");
  const completedAds = ads.filter((a) => a.status === "Completed");
  const rejectedAds = ads.filter((a) => a.status === "Rejected");

  const openApproveModal = (ad) => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    let defaultDate = todayStr;
    if (ad.requestedDate) {
      const d = new Date(ad.requestedDate);
      const reqStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      // If requested date is today or future, default to it; if past, default to today
      const reqDate = new Date(ad.requestedDate);
      reqDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      defaultDate = reqDate >= today ? reqStr : todayStr;
    }

    setReviewModal({
      open: true,
      ad,
      action: "APPROVE",
      durationDays: 1,
      approvedStartDate: defaultDate,
      adminRemarks: `Approved for spotlight slot by ${roleLabel}`,
    });
  };

  const openRejectModal = (ad) => {
    setReviewModal({
      open: true,
      ad,
      action: "REJECT",
      durationDays: 1,
      approvedStartDate: "",
      adminRemarks: "",
    });
  };

  const handleConfirmReview = async () => {
    if (!reviewModal.ad) return;

    if (reviewModal.action === "REJECT") {
      const remarks = reviewModal.adminRemarks.trim();
      if (!remarks) {
        toast.error("Please provide a reason or remarks for rejection.");
        return;
      }
      if (remarks.length < 5) {
        toast.error("Rejection remarks must be at least 5 characters.");
        return;
      }
    }

    if (reviewModal.action === "APPROVE") {
      if (!reviewModal.approvedStartDate) {
        toast.error("Please select a slot start date.");
        return;
      }

      const selected = new Date(reviewModal.approvedStartDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const test = new Date(selected);
      test.setHours(0, 0, 0, 0);
      if (test < today) {
        toast.error("Slot start date cannot be in the past.");
        return;
      }

      const duration = parseInt(reviewModal.durationDays, 10);
      if (isNaN(duration) || duration < 1 || duration > 30) {
        toast.error("Slot duration must be between 1 and 30 days.");
        return;
      }
    }

    try {
      await reviewMutation.mutateAsync({
        id: reviewModal.ad._id,
        action: reviewModal.action,
        durationDays: reviewModal.durationDays,
        approvedStartDate: reviewModal.approvedStartDate,
        adminRemarks: reviewModal.adminRemarks.trim(),
      });

      toast.success(
        reviewModal.action === "APPROVE"
          ? `Advertisement approved for ${reviewModal.durationDays} day(s)!`
          : "Advertisement rejected."
      );
      setReviewModal({ open: false, ad: null, action: "APPROVE", durationDays: 1, approvedStartDate: "", adminRemarks: "" });
    } catch (err) {
      toast.error(err?.message || "Failed to submit review");
    }
  };

  // Calendar calculations
  const daysInMonth = new Date(calendarYear, calendarMonth, 0).getDate();
  const firstDayOfWeek = new Date(calendarYear, calendarMonth - 1, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(calendarYear, calendarMonth - 2, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(calendarYear, calendarMonth, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <AppShell
      role={appShellRole}
      title={pageTitle}
      subtitle={pageSubtitle}
    >
      <div className="space-y-6">
        {/* Admin Authority Banner with Clean Professional Enterprise Styling */}
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
          <div
            className={cn(
              "absolute top-0 left-0 right-0 h-1",
              isCentralAdmin
                ? "bg-violet-600"
                : isStateAdmin
                ? "bg-amber-600"
                : "bg-emerald-600"
            )}
          />
          <div className="flex items-start gap-3.5 pt-0.5">
            <div
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white shadow-2xs",
                isCentralAdmin
                  ? "bg-violet-600"
                  : isStateAdmin
                  ? "bg-amber-600"
                  : "bg-emerald-600"
              )}
            >
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-foreground text-sm sm:text-base">
                  {roleLabel} Ad Verification & Scheduling
                </h3>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-bold border",
                    isCentralAdmin
                      ? "bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800"
                      : isStateAdmin
                      ? "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                      : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                  )}
                >
                  {isStateAdmin ? "Statewide Authority" : isCentralAdmin ? "Central Platform Authority" : "Chapter Authority"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
                {isStateAdmin
                  ? "As State Admin, you have full authority to inspect member advertisements, verify compliance, determine the approved running duration (e.g. 1 day), and schedule their spotlight slot across your entire State."
                  : isCentralAdmin
                  ? "As Central Admin, you have authority to review and schedule platform-wide Global advertisements, and oversee state or chapter advertising queues."
                  : "As Chapter Admin, you have full authority to inspect member advertisements, verify compliance, determine the approved running duration (e.g. 1 day), and schedule their spotlight slot for your chapter."}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Row with Luxury Accents */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4.5 shadow-2xs hover:shadow-xs transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>Pending Review</span>
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground flex items-center gap-2">
              <span>{pendingAds.length}</span>
              {pendingAds.length > 0 && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
              )}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Member ads waiting for your decision
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4.5 shadow-2xs hover:shadow-xs transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>Active Spotlight</span>
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-4 w-4 animate-pulse" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {activeAd ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-base sm:text-lg">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                  Running Now
                </span>
              ) : (
                <span className="text-muted-foreground text-sm font-medium">None Active</span>
              )}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground truncate">
              {activeAd ? activeAd.businessName : "Slot open for next in queue"}
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4.5 shadow-2xs hover:shadow-xs transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-500" />
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>Scheduled Queue</span>
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {queuedAds.length}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Approved ads in line for display
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4.5 shadow-2xs hover:shadow-xs transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-500" />
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>Total Managed Ads</span>
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Megaphone className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {ads.length}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Campaigns within your desk scope
            </p>
          </div>
        </div>

        {/* Tabs: Pending Reviews, Active & Queued, All, Calendar */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className="bg-muted/70 p-1 rounded-xl">
            <TabsTrigger value="pending" className="rounded-lg text-xs font-semibold px-4 relative">
              Pending Verification ({pendingAds.length})
              {pendingAds.length > 0 && (
                <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-amber-500" />
              )}
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="rounded-lg text-xs font-semibold px-4">
              Active & Queue ({activeAd ? queuedAds.length + 1 : queuedAds.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="rounded-lg text-xs font-semibold px-4">
              All Campaigns ({ads.length})
            </TabsTrigger>
            <TabsTrigger value="calendar" className="rounded-lg text-xs font-semibold px-4 flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>Calendar</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: PENDING VERIFICATION */}
          <TabsContent value="pending" className="space-y-4">
            {loadingAds ? (
              <div className="rounded-2xl border border-border/60 bg-card p-12 text-center">
                <Loader2 className="h-7 w-7 animate-spin mx-auto text-primary" />
                <p className="mt-3 text-xs text-muted-foreground">Loading pending verifications...</p>
              </div>
            ) : pendingAds.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/80 bg-card/50 p-12 text-center space-y-2">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-foreground text-base">All Caught Up!</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  There are no pending advertisement verifications for your desk right now.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingAds.map((ad) => {
                  const bannerImg = ad.bannerImage ? resolveMediaUrl(ad.bannerImage) : null;

                  return (
                    <div
                      key={ad._id}
                      className="rounded-2xl border border-amber-200/80 dark:border-amber-900/50 bg-card overflow-hidden shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
                    >
                      {/* Banner Visual preview */}
                      <div className="relative aspect-video w-full bg-black/5 dark:bg-black/30 overflow-hidden border-b border-border/40 group">
                        {bannerImg ? (
                          <img
                            src={bannerImg}
                            alt={ad.title}
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-muted-foreground text-xs">
                            No Banner Image
                          </div>
                        )}
                        {bannerImg && (
                          <button
                            type="button"
                            onClick={() => setPreviewImage(bannerImg)}
                            className="absolute bottom-2 right-2 rounded-lg bg-slate-900 border border-slate-700 text-white px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1.5 hover:bg-slate-800 shadow-xs cursor-pointer"
                          >
                            <Eye className="h-3 w-3" />
                            Zoom Banner
                          </button>
                        )}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span className="rounded-full bg-amber-500 text-white px-2.5 py-0.5 text-[10px] font-bold shadow-xs">
                            Pending Review
                          </span>
                          <span className="rounded-full bg-slate-900 text-white px-2 py-0.5 text-[10px] font-bold capitalize border border-slate-700 shadow-xs">
                            {ad.targetScope || "chapter"}
                          </span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-semibold text-primary">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5" />
                              <span>{ad.businessName}</span>
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                              {ad.chapterName} {ad.state ? `• ${ad.state}` : ""}
                            </span>
                          </div>
                          <h4 className="font-bold text-foreground text-sm">
                            {ad.title}
                          </h4>
                          {ad.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {ad.description}
                            </p>
                          )}
                        </div>

                        {/* Schedule & Link */}
                        <div className="rounded-xl bg-muted/40 p-2.5 space-y-1 text-[11px] text-muted-foreground">
                          <div className="flex items-center justify-between">
                            <span>Requested Slot Date:</span>
                            <span className="font-semibold text-foreground">
                              {new Date(ad.requestedDate).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          {ad.linkUrl && (
                            <div className="flex items-center justify-between border-t border-border/40 pt-1">
                              <span>Target Link:</span>
                              <a
                                href={ad.linkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline inline-flex items-center gap-1 font-medium truncate max-w-[200px]"
                              >
                                <span>{ad.linkUrl}</span>
                                <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Review Action Buttons */}
                        <div className="flex items-center justify-end gap-2 border-t border-border/40 pt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openRejectModal(ad)}
                            className="rounded-xl border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs h-8"
                          >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => openApproveModal(ad)}
                            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Verify & Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* TAB 2: ACTIVE & QUEUED ADS */}
          <TabsContent value="scheduled" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Currently Running Active Ad */}
              <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-500/5 dark:bg-emerald-950/20 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="font-bold text-foreground text-sm">
                      Live on Dashboard Right Now
                    </h3>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    Spotlight Active
                  </span>
                </div>

                {activeAd ? (
                  <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-card p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-semibold text-primary">
                          {activeAd.businessName}
                        </span>
                        <h4 className="font-bold text-foreground text-sm">
                          {activeAd.title}
                        </h4>
                        <span className="text-[11px] text-muted-foreground capitalize">
                          Reach: {activeAd.targetScope || "Chapter"}
                        </span>
                      </div>
                      <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                        {activeAd.durationDays} day(s)
                      </span>
                    </div>

                    <div className="rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Running Period:</span>
                        <span className="font-semibold text-foreground">
                          {new Date(activeAd.approvedStartDate).toLocaleDateString()} -{" "}
                          {new Date(activeAd.approvedEndDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border/80 p-8 text-center text-muted-foreground text-xs">
                    No advertisement currently running in this slot.
                  </div>
                )}
              </div>

              {/* Queued Ads */}
              <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-500/5 dark:bg-indigo-950/20 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-indigo-500" />
                    <h3 className="font-bold text-foreground text-sm">
                      Upcoming Slot Queue ({queuedAds.length})
                    </h3>
                  </div>
                  <span className="text-xs text-muted-foreground">Ordered by schedule</span>
                </div>

                {queuedAds.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/80 p-8 text-center text-muted-foreground text-xs">
                    Queue is empty. Approved ads will appear here.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {queuedAds.map((ad, idx) => (
                      <div
                        key={ad._id}
                        className="rounded-xl border border-border/60 bg-card p-3 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="grid h-6 w-6 place-items-center rounded-full bg-indigo-100 dark:bg-indigo-950 font-bold text-[11px] text-indigo-600">
                            #{idx + 1}
                          </span>
                          <div>
                            <div className="font-semibold text-foreground">{ad.title}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {ad.businessName} • {ad.targetScope || "Chapter"}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[11px] text-muted-foreground block">Starts:</span>
                          <span className="font-semibold text-foreground text-[11px]">
                            {new Date(ad.approvedStartDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: ALL CAMPAIGNS */}
          <TabsContent value="all" className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground font-semibold">
                    <tr>
                      <th className="px-4 py-3">Business</th>
                      <th className="px-4 py-3">Title & Scope</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Requested / Slot</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {ads.map((ad) => {
                      const statusInfo = STATUS_MAP[ad.status] || STATUS_MAP.Pending;

                      return (
                        <tr key={ad._id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-semibold text-foreground">
                            {ad.businessName}
                            <span className="block text-[11px] text-muted-foreground font-normal">
                              {ad.chapterName}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-foreground block max-w-xs truncate">
                              {ad.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                              {ad.targetScope || "Chapter"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border",
                                statusInfo.badge
                              )}
                            >
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {ad.approvedStartDate
                              ? `${new Date(ad.approvedStartDate).toLocaleDateString()} (${ad.durationDays}d)`
                              : new Date(ad.requestedDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {ad.status === "Pending" ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openRejectModal(ad)}
                                  className="h-7 px-2 text-xs text-rose-600"
                                >
                                  Reject
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => openApproveModal(ad)}
                                  className="h-7 px-2 text-xs bg-emerald-600 text-white"
                                >
                                  Verify
                                </Button>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-[11px]">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: CALENDAR */}
          <TabsContent value="calendar" className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-foreground text-base">
                    {monthNames[calendarMonth - 1]} {calendarYear} —{" "}
                    <span className="capitalize text-primary">{scope} Slot Schedule</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Advertisements schedule for {roleLabel}. Campaigns in your desk scope display with full details.
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-lg">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-lg">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-xs font-bold text-muted-foreground py-1">
                    {day}
                  </div>
                ))}

                {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="h-24 rounded-xl bg-muted/20 opacity-30" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const dateObj = new Date(calendarYear, calendarMonth - 1, dayNum);

                  const matchingSlot = calendarSlots.find((slot) => {
                    const start = new Date(slot.date);
                    const end = slot.endDate ? new Date(slot.endDate) : start;
                    start.setHours(0, 0, 0, 0);
                    end.setHours(23, 59, 59, 999);
                    return dateObj >= start && dateObj <= end;
                  });

                  const isBooked = Boolean(matchingSlot);
                  const isMasked = matchingSlot?.id?.startsWith("masked-");

                  return (
                    <div
                      key={`cal-${dayNum}`}
                      className={cn(
                        "h-24 rounded-xl border p-2 flex flex-col justify-between text-left transition-all",
                        isBooked
                          ? isMasked
                            ? "border-rose-300/80 bg-rose-500/10 dark:bg-rose-950/20"
                            : "border-blue-400/80 bg-blue-500/10 dark:bg-blue-950/30"
                          : "border-border/60 bg-card shadow-2xs"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{dayNum}</span>
                        {isBooked ? (
                          <span
                            className={cn(
                              "rounded-full text-[9px] px-1.5 py-0.2 font-bold",
                              isMasked
                                ? "bg-rose-500/20 text-rose-700 dark:text-rose-400"
                                : "bg-blue-500 text-white"
                            )}
                          >
                            {isMasked ? "Other Slot" : "Your Slot"}
                          </span>
                        ) : (
                          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            Open
                          </span>
                        )}
                      </div>

                      <div className="mt-1">
                        {isBooked && (
                          <div
                            className={cn(
                              "text-[10px] font-semibold line-clamp-2",
                              isMasked
                                ? "text-rose-700 dark:text-rose-400 font-medium"
                                : "text-blue-700 dark:text-blue-300"
                            )}
                          >
                            {matchingSlot.title}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* APPROVE / REJECT MODAL */}
      <Dialog
        open={reviewModal.open}
        onOpenChange={(open) => !open && setReviewModal((prev) => ({ ...prev, open: false }))}
      >
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              {reviewModal.action === "APPROVE" ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span>Verify & Schedule Advertisement</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-rose-600" />
                  <span>Reject Advertisement Submission</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {reviewModal.ad?.title} ({reviewModal.ad?.businessName})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* LIVE PREVIEW OF THE MEMBER ADVERTISEMENT */}
            {reviewModal.ad && (
              <div className="rounded-xl border border-border/70 bg-gradient-to-r from-card via-card/80 to-muted/30 p-3 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-primary" /> Member Dashboard Preview
                  </span>
                  <span className="text-[10px] text-muted-foreground capitalize font-semibold">
                    Target: {reviewModal.ad.targetScope || "Chapter"}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  {reviewModal.ad.bannerImage && (
                    <div className="sm:col-span-5 relative rounded-lg overflow-hidden aspect-video bg-black/10 border border-border/50">
                      <img
                        src={resolveMediaUrl(reviewModal.ad.bannerImage)}
                        alt="Ad Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className={cn(reviewModal.ad.bannerImage ? "sm:col-span-7" : "sm:col-span-12", "space-y-1")}>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3 w-3 text-primary shrink-0" />
                      <span className="text-xs font-semibold text-primary truncate">
                        {reviewModal.ad.businessName}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-foreground line-clamp-1">
                      {reviewModal.ad.title}
                    </div>
                    {reviewModal.ad.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {reviewModal.ad.description}
                      </p>
                    )}
                    {reviewModal.ad.linkUrl && (
                      <div className="pt-0.5">
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <ExternalLink className="h-2.5 w-2.5" /> Destination Link Attached
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {reviewModal.action === "APPROVE" && (
              <>
                {/* QUICK START DATE SELECTOR */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Start Schedule *</Label>
                  {(() => {
                    const today = new Date();
                    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
                    let reqStr = "";
                    if (reviewModal.ad?.requestedDate) {
                      const d = new Date(reviewModal.ad.requestedDate);
                      reqStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                    }

                    return (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant={reviewModal.approvedStartDate === todayStr ? "default" : "outline"}
                            size="sm"
                            onClick={() => setReviewModal((prev) => ({ ...prev, approvedStartDate: todayStr }))}
                            className={cn(
                              "text-xs h-7 rounded-lg",
                              reviewModal.approvedStartDate === todayStr ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                            )}
                          >
                            <Sparkles className="h-3.5 w-3.5 mr-1" />
                            Go Live Today ({todayStr})
                          </Button>

                          {reqStr && reqStr !== todayStr && (
                            <Button
                              type="button"
                              variant={reviewModal.approvedStartDate === reqStr ? "default" : "outline"}
                              size="sm"
                              onClick={() => setReviewModal((prev) => ({ ...prev, approvedStartDate: reqStr }))}
                              className={cn(
                                "text-xs h-7 rounded-lg",
                                reviewModal.approvedStartDate === reqStr ? "bg-indigo-600 hover:bg-indigo-700 text-white" : ""
                              )}
                            >
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              Requested Date ({reqStr})
                            </Button>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Input
                            type="date"
                            value={reviewModal.approvedStartDate}
                            min={todayStr}
                            onChange={(e) =>
                              setReviewModal((prev) => ({ ...prev, approvedStartDate: e.target.value }))
                            }
                            className="text-xs"
                          />
                        </div>

                        {/* Visual Live status explanation */}
                        {reviewModal.approvedStartDate === todayStr ? (
                          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                            <span>
                              <strong>Live Immediately:</strong> This advertisement will activate and be visible on member dashboards today.
                            </span>
                          </div>
                        ) : (
                          <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/30 p-2.5 text-xs text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
                            <Clock className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                            <span>
                              <strong>Scheduled Slot:</strong> This advertisement will remain queued and automatically go live on <strong>{reviewModal.approvedStartDate}</strong>.
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Approved Duration (Days) *</Label>
                  <Select
                    value={String(reviewModal.durationDays)}
                    onValueChange={(val) =>
                      setReviewModal((prev) => ({ ...prev, durationDays: parseInt(val, 10) }))
                    }
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select running duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Day (Standard Spotlight)</SelectItem>
                      <SelectItem value="2">2 Days</SelectItem>
                      <SelectItem value="3">3 Days</SelectItem>
                      <SelectItem value="7">7 Days (1 Week)</SelectItem>
                      <SelectItem value="14">14 Days (2 Weeks)</SelectItem>
                      <SelectItem value="30">30 Days (1 Month)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">
                    Administrator sets duration as per policy (default is 1 day).
                  </p>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">
                  {reviewModal.action === "APPROVE"
                    ? "Admin Remarks (Optional)"
                    : "Reason for Rejection *"}
                </Label>
                {reviewModal.action === "APPROVE" && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setReviewModal((prev) => ({ ...prev, adminRemarks: `Approved for spotlight slot by ${roleLabel}` }))}
                      className="text-[10px] text-primary hover:underline cursor-pointer"
                    >
                      + Standard
                    </button>
                    <span className="text-muted-foreground text-[10px]">·</span>
                    <button
                      type="button"
                      onClick={() => setReviewModal((prev) => ({ ...prev, adminRemarks: `Verified and approved for display.` }))}
                      className="text-[10px] text-primary hover:underline cursor-pointer"
                    >
                      + Verified
                    </button>
                  </div>
                )}
              </div>
              <Textarea
                placeholder={
                  reviewModal.action === "APPROVE"
                    ? "Remarks or instructions for the business owner"
                    : "e.g. Please update banner text to include clear contact details / offer details"
                }
                value={reviewModal.adminRemarks}
                onChange={(e) =>
                  setReviewModal((prev) => ({ ...prev, adminRemarks: e.target.value }))
                }
                rows={3}
                required={reviewModal.action === "REJECT"}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReviewModal((prev) => ({ ...prev, open: false }))}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={reviewMutation.isPending}
              onClick={handleConfirmReview}
              className={cn(
                "text-xs text-white",
                reviewModal.action === "APPROVE"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              )}
            >
              {reviewMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : reviewModal.action === "APPROVE" ? (
                "Confirm Approval"
              ) : (
                "Confirm Rejection"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* BANNER ZOOM PREVIEW DIALOG */}
      <Dialog open={Boolean(previewImage)} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="sm:max-w-[700px] p-2">
          <div className="relative rounded-xl overflow-hidden aspect-video bg-black">
            {previewImage && (
              <img
                src={previewImage}
                alt="Banner Zoom Preview"
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

// Wrapper for Chapter Admin Desk
export function ChapterAdminAdvertisements() {
  return <AdminAdvertisementsDesk expectedRole="chapter_admin" defaultScope="chapter" />;
}

// Wrapper for State Admin Desk
export function StateAdminAdvertisements() {
  return <AdminAdvertisementsDesk expectedRole="state_admin" defaultScope="state" />;
}

// Wrapper for Central Admin Desk
export function CentralAdminAdvertisements() {
  return <AdminAdvertisementsDesk expectedRole="admin" defaultScope="global" />;
}

export default AdminAdvertisementsDesk;
