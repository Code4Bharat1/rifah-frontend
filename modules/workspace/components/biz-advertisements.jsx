"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Megaphone,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Trash2,
  ExternalLink,
  Upload,
  CheckCircle2,
  AlertCircle,
  XCircle,
  HelpCircle,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Eye,
  Info,
  Globe,
  MapPin,
  Building2,
  Filter,
  ArrowRight,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@shared/components/ui/alert-dialog";
import { resolveMediaUrl } from "@shared/lib/media";
import {
  useMyBusiness,
  useMyAdvertisements,
  useAdvertisementCalendar,
  useCreateAdvertisement,
  useDeleteAdvertisement,
} from "@shared/hooks/use-rifah-api";
import { cn } from "@shared/lib/utils";

const STATUS_CONFIG = {
  Pending: {
    label: "Under Verification",
    color: "bg-amber-600 text-white border-amber-700",
    icon: Clock,
  },
  Approved: {
    label: "Approved & Scheduled",
    color: "bg-blue-600 text-white border-blue-700",
    icon: CheckCircle2,
  },
  Active: {
    label: "Live on Dashboard",
    color: "bg-emerald-600 text-white border-emerald-700 animate-pulse",
    icon: Sparkles,
  },
  Queued: {
    label: "In Queue for Slot",
    color: "bg-indigo-600 text-white border-indigo-700",
    icon: Layers,
  },
  Completed: {
    label: "Completed",
    color: "bg-slate-700 text-white border-slate-800",
    icon: CheckCircle2,
  },
  Rejected: {
    label: "Rejected by Administrator",
    color: "bg-rose-600 text-white border-rose-700",
    icon: XCircle,
  },
};

const SCOPE_META = {
  chapter: {
    label: "Chapter",
    icon: MapPin,
    reviewer: "Central Admin",
    badgeClass: "bg-emerald-700 text-white border-emerald-800",
  },
  state: {
    label: "State",
    icon: MapPin,
    reviewer: "Central Admin",
    badgeClass: "bg-amber-700 text-white border-amber-800",
  },
  global: {
    label: "Global Platform",
    icon: Globe,
    reviewer: "Central Admin",
    badgeClass: "bg-sky-700 text-white border-sky-800",
  },
};

export function BizAdvertisements() {
  const { data: business } = useMyBusiness();
  const { data: adsData, isLoading: loadingAds } = useMyAdvertisements();
  const ads = Array.isArray(adsData) ? adsData : adsData?.data || [];

  // Selected Scope for calendar and creation: 'chapter' | 'state' | 'global'
  const [selectedScope, setSelectedScope] = useState("chapter");

  // Calendar Date State
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const calendarMonth = currentDate.getMonth() + 1; // 1-indexed
  const calendarYear = currentDate.getFullYear();

  const { data: calendarSlotsData, isLoading: loadingCalendar } = useAdvertisementCalendar({
    month: calendarMonth,
    year: calendarYear,
    targetScope: selectedScope,
  });
  const calendarSlots = Array.isArray(calendarSlotsData) ? calendarSlotsData : calendarSlotsData?.data || [];

  const createAdMutation = useCreateAdvertisement();
  const deleteAdMutation = useDeleteAdvertisement();

  // Create Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    linkUrl: "",
    requestedDate: "",
    targetScope: "chapter",
  });
  const [formErrors, setFormErrors] = useState({});
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Status Filter for campaign list
  const [statusFilter, setStatusFilter] = useState("all");

  // Stats calculation
  const totalAds = ads.length;
  const activeAd = ads.find((a) => a.status === "Active");
  const queuedAds = ads.filter((a) => a.status === "Queued");
  const pendingAds = ads.filter((a) => a.status === "Pending");
  const completedAds = ads.filter((a) => a.status === "Completed");
  const rejectedAds = ads.filter((a) => a.status === "Rejected");

  const filteredAds = statusFilter === "all" ? ads : ads.filter((a) => a.status === statusFilter);

  // Handle file select with validation
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid file format. Please upload JPG, PNG, or WEBP image only.");
        setFormErrors((prev) => ({ ...prev, banner: "Allowed formats: JPG, PNG, WEBP" }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image file size must be less than 5MB.");
        setFormErrors((prev) => ({ ...prev, banner: "File size exceeds 5MB limit" }));
        return;
      }
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next.banner;
        return next;
      });
    }
  };

  const handleOpenCreateWithDate = (dateStr) => {
    setFormData((prev) => ({
      ...prev,
      requestedDate: dateStr,
      targetScope: selectedScope,
    }));
    setFormErrors({});
    setCreateModalOpen(true);
  };

  const handleSubmitAd = async (e) => {
    e.preventDefault();
    const errors = {};

    const cleanTitle = formData.title.trim();
    if (!cleanTitle) {
      errors.title = "Please enter an advertisement title.";
    } else if (cleanTitle.length < 3) {
      errors.title = "Title must be at least 3 characters long.";
    } else if (cleanTitle.length > 100) {
      errors.title = "Title cannot exceed 100 characters.";
    }

    if (formData.description && formData.description.trim().length > 300) {
      errors.description = "Description cannot exceed 300 characters.";
    }

    const cleanLink = formData.linkUrl.trim();
    if (cleanLink) {
      const isValid = /^https?:\/\/.+/i.test(cleanLink) || cleanLink.startsWith("/") || /^wa\.me\/.+/i.test(cleanLink);
      if (!isValid) {
        errors.linkUrl = "Destination link must start with https://, http://, or /";
      }
    }

    const scope = formData.targetScope || selectedScope || "chapter";
    if (scope === "chapter" && !business?.chapter && !business?.chapterId) {
      errors.targetScope = "Your business is not assigned to a chapter.";
    }
    if (scope === "state" && !business?.state) {
      errors.targetScope = "Your business is not assigned to a state.";
    }

    if (formData.requestedDate) {
      const selected = new Date(formData.requestedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const test = new Date(selected);
      test.setHours(0, 0, 0, 0);
      if (test < today) {
        errors.requestedDate = "Requested slot date cannot be in the past.";
      }
    }

    if (!bannerFile) {
      errors.banner = "Please select and upload a banner image.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return;
    }

    try {
      const data = new FormData();
      data.append("title", cleanTitle);
      data.append("description", formData.description.trim());
      data.append("linkUrl", cleanLink);
      data.append("targetScope", scope);
      if (formData.requestedDate) {
        data.append("requestedDate", formData.requestedDate);
      }
      data.append("banner", bannerFile);

      await createAdMutation.mutateAsync(data);
      const reviewer = SCOPE_META[scope]?.reviewer || "Administrator";
      toast.success(`Advertisement submitted to ${reviewer} for verification!`);
      setCreateModalOpen(false);
      setFormData({
        title: "",
        description: "",
        linkUrl: "",
        requestedDate: "",
        targetScope: "chapter",
      });
      setFormErrors({});
      setBannerFile(null);
      setBannerPreview("");
    } catch (err) {
      toast.error(err?.message || "Failed to submit advertisement");
    }
  };

  const handleDeleteAd = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAdMutation.mutateAsync(deleteTarget._id);
      toast.success("Advertisement removed");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.message || "Failed to remove advertisement");
    }
  };

  // Calendar calculations
  const daysInMonth = new Date(calendarYear, calendarMonth, 0).getDate();
  const firstDayOfWeek = new Date(calendarYear, calendarMonth - 1, 1).getDay(); // 0 is Sunday

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
      role="business"
      title="Advertisement Manager"
      subtitle="Promote your enterprise across Chapter, State, or Global RIFAH Connect networks"
      actions={
        <Button
          onClick={() => {
            setFormData((prev) => ({ ...prev, targetScope: selectedScope }));
            setCreateModalOpen(true);
          }}
          className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs shadow-xs"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Book Advertisement
        </Button>
      }
    >
      <div className="space-y-6">
        {/* STATS OVERVIEW WITH LUXURY ACCENTS */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4.5 shadow-2xs hover:shadow-xs transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500" />
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Total Campaigns</span>
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Megaphone className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">{totalAds}</div>
            <p className="mt-1 text-[11px] text-muted-foreground">Lifetime submissions</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4.5 shadow-2xs hover:shadow-xs transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Currently Live</span>
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-4 w-4 animate-pulse" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <span>{activeAd ? 1 : 0}</span>
              {activeAd && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
              )}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {activeAd ? "Active on member dashboards" : "No active ad running today"}
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4.5 shadow-2xs hover:shadow-xs transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-500" />
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Queued for Slot</span>
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
              {queuedAds.length}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Approved, waiting for slot</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4.5 shadow-2xs hover:shadow-xs transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Under Review</span>
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {pendingAds.length}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Awaiting admin review</p>
          </div>
        </div>

        {/* TABS: MY ADS & BOOKING CALENDAR */}
        <Tabs defaultValue="my-ads" className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <TabsList className="bg-muted/70 p-1 rounded-xl border border-border/40">
              <TabsTrigger value="my-ads" className="rounded-lg text-xs font-semibold">
                My Advertisements ({ads.length})
              </TabsTrigger>
              <TabsTrigger value="calendar" className="rounded-lg text-xs font-semibold flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>Booking Calendar</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>
                3-Tier Network: <strong>Chapter</strong> • <strong>State</strong> • <strong>Global</strong>
              </span>
            </div>
          </div>

          {/* TAB 1: MY ADVERTISEMENTS LIST */}
          <TabsContent value="my-ads" className="space-y-4">
            {/* Filter chips bar */}
            {ads.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-muted-foreground font-semibold flex items-center gap-1 mr-1 text-[11px]">
                  <Filter className="h-3 w-3" /> Filter:
                </span>
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                    statusFilter === "all"
                      ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                      : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  All ({ads.length})
                </button>
                {activeAd && (
                  <button
                    type="button"
                    onClick={() => setStatusFilter("Active")}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1",
                      statusFilter === "Active"
                        ? "bg-emerald-600 text-white shadow-2xs font-semibold"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200"
                    )}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Live (1)
                  </button>
                )}
                {queuedAds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setStatusFilter("Queued")}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                      statusFilter === "Queued"
                        ? "bg-indigo-600 text-white shadow-2xs font-semibold"
                        : "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 hover:bg-indigo-200"
                    )}
                  >
                    Queued ({queuedAds.length})
                  </button>
                )}
                {pendingAds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setStatusFilter("Pending")}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                      statusFilter === "Pending"
                        ? "bg-amber-600 text-white shadow-2xs font-semibold"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 hover:bg-amber-200"
                    )}
                  >
                    Under Review ({pendingAds.length})
                  </button>
                )}
                {completedAds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setStatusFilter("Completed")}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                      statusFilter === "Completed"
                        ? "bg-slate-700 text-white shadow-2xs font-semibold"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    Completed ({completedAds.length})
                  </button>
                )}
                {rejectedAds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setStatusFilter("Rejected")}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                      statusFilter === "Rejected"
                        ? "bg-rose-600 text-white shadow-2xs font-semibold"
                        : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 hover:bg-rose-200"
                    )}
                  >
                    Rejected ({rejectedAds.length})
                  </button>
                )}
              </div>
            )}

            {loadingAds ? (
              <div className="grid place-items-center py-16 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-xs font-medium">Loading your advertisements...</p>
              </div>
            ) : filteredAds.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/80 bg-card p-12 text-center space-y-3">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Megaphone className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-foreground text-sm">
                    {statusFilter === "all"
                      ? "No advertisements created yet"
                      : `No advertisements in '${statusFilter}' status`}
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {statusFilter === "all"
                      ? "Promote your products and services to members in your chapter, across your state, or nationwide!"
                      : "Try selecting another filter or create a new advertisement campaign."}
                  </p>
                </div>
                {statusFilter === "all" ? (
                  <Button
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, targetScope: selectedScope }));
                      setCreateModalOpen(true);
                    }}
                    className="rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Create Your First Ad
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setStatusFilter("all")}
                    className="rounded-xl text-xs"
                  >
                    Clear Filter
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
                {filteredAds.map((ad) => {
                  const statusInfo = STATUS_CONFIG[ad.status] || STATUS_CONFIG.Pending;
                  const StatusIcon = statusInfo.icon;
                  const scopeInfo = SCOPE_META[ad.targetScope] || SCOPE_META.chapter;
                  const ScopeIcon = scopeInfo.icon;
                  const bannerImg = ad.bannerImage ? resolveMediaUrl(ad.bannerImage) : null;

                  return (
                    <div
                      key={ad._id}
                      className="group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-card overflow-hidden shadow-2xs hover:shadow-md hover:border-primary/40 transition-all duration-300"
                    >
                      {/* Top banner visual */}
                      <div className="relative aspect-video w-full bg-muted/40 overflow-hidden border-b border-border/50">
                        {bannerImg ? (
                          <img
                            src={bannerImg}
                            alt={ad.title}
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-muted-foreground text-xs">
                            No Banner Image
                          </div>
                        )}
                        {/* Top Banner Badges - 100% Solid & Non-overlapping */}
                        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-1.5 pointer-events-none z-10">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border shadow-sm pointer-events-auto",
                                scopeInfo.badgeClass
                              )}
                            >
                              <ScopeIcon className="h-3 w-3 shrink-0" />
                              <span>{scopeInfo.label}</span>
                            </span>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border shadow-sm pointer-events-auto",
                                statusInfo.color
                              )}
                            >
                              <StatusIcon className="h-3 w-3 shrink-0" />
                              <span>
                                {ad.status === "Pending" ? "Under Review" : statusInfo.label}
                              </span>
                            </span>
                          </div>
                          {ad.queuePosition > 0 && ad.status === "Queued" && (
                            <span className="shrink-0 rounded-md bg-slate-950 text-white border border-slate-700 px-2 py-0.5 text-[10px] font-bold shadow-sm pointer-events-auto">
                              Queue #{ad.queuePosition}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                            <ScopeIcon className="h-3 w-3 text-primary shrink-0" />
                            <span>Target:</span>
                            <span className="font-semibold text-foreground truncate">
                              {ad.targetScope === "global"
                                ? "Platform-wide (All Members)"
                                : ad.targetScope === "state"
                                ? `Statewide (${ad.state || "State"})`
                                : `Chapter (${ad.chapterName || "Own Chapter"})`}
                            </span>
                          </div>
                          <h4 className="font-bold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">
                            {ad.title}
                          </h4>
                          {ad.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {ad.description}
                            </p>
                          )}
                        </div>

                        {/* Dates & Schedule */}
                        <div className="space-y-1.5 rounded-xl bg-muted/40 p-2.5 text-[11px] text-muted-foreground border border-border/40">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" /> Requested Slot:
                            </span>
                            <span className="font-semibold text-foreground">
                              {new Date(ad.requestedDate).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          {ad.approvedStartDate && (
                            <div className="flex items-center justify-between border-t border-border/40 pt-1.5">
                              <span className="flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-emerald-500" /> Approved Period:
                              </span>
                              <span className="font-semibold text-foreground">
                                {new Date(ad.approvedStartDate).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                })}{" "}
                                -{" "}
                                {new Date(ad.approvedEndDate).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                })}{" "}
                                ({ad.durationDays} {ad.durationDays === 1 ? "day" : "days"})
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Admin Remarks on Rejection / Feedback */}
                        {ad.adminRemarks && (
                          <div
                            className={cn(
                              "rounded-xl p-2.5 text-xs flex items-start gap-2",
                              ad.status === "Rejected"
                                ? "bg-rose-50 text-rose-900 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900"
                                : "bg-blue-50 text-blue-900 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900"
                            )}
                          >
                            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold block text-[11px] uppercase tracking-wider">
                                {scopeInfo.reviewer} Note:
                              </span>
                              <span className="text-[11px] leading-tight">{ad.adminRemarks}</span>
                            </div>
                          </div>
                        )}

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between border-t border-border/40 pt-2 text-xs">
                          {ad.linkUrl ? (
                            <a
                              href={ad.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
                            >
                              <span>Destination Link</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">Internal Profile</span>
                          )}

                          {["Pending", "Rejected"].includes(ad.status) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteTarget(ad)}
                              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 h-7 px-2 text-xs"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* TAB 2: PRIVACY-MASKED BOOKING CALENDAR */}
          <TabsContent value="calendar" className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-2xs space-y-4">
              {/* SCOPE SELECTOR PILLS FOR CALENDAR */}
              <div className="flex items-center justify-between gap-3 flex-wrap border-b border-border/40 pb-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-foreground">Select Audience Scope Calendar:</span>
                  <p className="text-[11px] text-muted-foreground">
                    Each reach level has its own independent slots. Checking availability for:
                  </p>
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/40">
                  <button
                    type="button"
                    onClick={() => setSelectedScope("chapter")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all",
                      selectedScope === "chapter"
                        ? "bg-background text-emerald-600 dark:text-emerald-400 shadow-xs border border-border/60"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    <span>My Chapter ({business?.chapter || "Local"})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedScope("state")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all",
                      selectedScope === "state"
                        ? "bg-background text-amber-600 dark:text-amber-400 shadow-xs border border-border/60"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    <span>My State ({business?.state || "State"})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedScope("global")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all",
                      selectedScope === "global"
                        ? "bg-background text-sky-600 dark:text-sky-400 shadow-xs border border-border/60"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span>Global Platform</span>
                  </button>
                </div>
              </div>

              {/* Calendar Month Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-foreground text-base">
                    {monthNames[calendarMonth - 1]} {calendarYear} —{" "}
                    <span className="capitalize text-primary">{selectedScope} Slot Calendar</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedScope === "chapter"
                      ? `Slots for ${business?.chapter || "your chapter"} members. Reviewed by Chapter Admin.`
                      : selectedScope === "state"
                      ? `Slots for ${business?.state || "your state"} members. Reviewed by State Admin.`
                      : "Nationwide slots for all members. Reviewed by Central Admin."}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={prevMonth}
                    className="h-8 w-8 rounded-lg"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextMonth}
                    className="h-8 w-8 rounded-lg"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Privacy Legend */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap border-y border-border/40 py-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-md bg-emerald-600 border border-emerald-700" />
                  <span>Available Slot</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-md bg-rose-600 border border-rose-700" />
                  <span>Booked already (Unavailable in {selectedScope})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-md bg-indigo-600 border border-indigo-700" />
                  <span>Your Campaign</span>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 text-center">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-xs font-bold text-muted-foreground py-1">
                    {day}
                  </div>
                ))}

                {/* Empty slots for first day offset */}
                {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="h-24 rounded-xl bg-muted/20 opacity-30" />
                ))}

                {/* Days of Month */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const dateObj = new Date(calendarYear, calendarMonth - 1, dayNum);
                  const monthStr = String(calendarMonth).padStart(2, "0");
                  const dayStr = String(dayNum).padStart(2, "0");
                  const dateString = `${calendarYear}-${monthStr}-${dayStr}`;

                  // Find slot for this day
                  const matchingSlot = calendarSlots.find((slot) => {
                    const start = new Date(slot.date);
                    const end = slot.endDate ? new Date(slot.endDate) : start;
                    start.setHours(0, 0, 0, 0);
                    end.setHours(23, 59, 59, 999);
                    return dateObj >= start && dateObj <= end;
                  });

                  const isPast = dateObj < new Date(new Date().setHours(0, 0, 0, 0));
                  const isMine = matchingSlot?.isMine;
                  const isBooked = Boolean(matchingSlot && !matchingSlot.isAvailable);

                  return (
                    <div
                      key={`day-${dayNum}`}
                      className={cn(
                        "h-24 rounded-xl border p-2 flex flex-col justify-between text-left transition-all duration-200",
                        isPast
                          ? "border-border/30 bg-muted/20 opacity-50 cursor-not-allowed"
                          : isMine
                          ? "border-indigo-400/80 bg-indigo-500/10 dark:bg-indigo-950/30"
                          : isBooked
                          ? "border-rose-300/80 bg-rose-500/10 dark:bg-rose-950/20 cursor-not-allowed"
                          : "border-border/60 bg-card hover:border-emerald-500/60 hover:bg-emerald-500/5 cursor-pointer shadow-2xs"
                      )}
                      onClick={() => {
                        if (!isPast && !isBooked) {
                          handleOpenCreateWithDate(dateString);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "text-xs font-bold",
                            isPast ? "text-muted-foreground" : "text-foreground"
                          )}
                        >
                          {dayNum}
                        </span>
                        {isMine ? (
                          <span className="rounded-full bg-indigo-500 text-white text-[9px] px-1.5 py-0.2 font-bold">
                            You
                          </span>
                        ) : isBooked ? (
                          <span className="rounded-full bg-rose-600 text-white text-[9px] px-1.5 py-0.2 font-bold shadow-xs">
                            Locked
                          </span>
                        ) : !isPast ? (
                          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            Open
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-1">
                        {isMine ? (
                          <div className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 line-clamp-2">
                            {matchingSlot.title}
                          </div>
                        ) : isBooked ? (
                          <div className="text-[10px] font-medium text-rose-700 dark:text-rose-400">
                            Booked already
                          </div>
                        ) : !isPast ? (
                          <div className="text-[10px] text-muted-foreground group-hover:text-emerald-600">
                            + Click to book
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* CREATE AD MODAL */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
              <Megaphone className="h-5 w-5" />
              <DialogTitle className="text-lg font-bold">Book Advertisement Slot</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Choose your audience reach and submit your advertisement banner for verification.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitAd} className="space-y-4 pt-2">
            {/* SCOPE SELECTION CARDS */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Select Audience Reach (All Scopes Verified by Central Admin) *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, targetScope: "chapter" })}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all",
                    formData.targetScope === "chapter"
                      ? "border-emerald-500 bg-emerald-500/10 text-foreground ring-1 ring-emerald-500/50"
                      : "border-border/60 hover:border-border bg-card text-muted-foreground"
                  )}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-700 dark:text-emerald-400">
                    <MapPin className="h-3.5 w-3.5" />
                    Own Chapter
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-tight">
                    {business?.chapter || "Chapter"} members. Verified by <strong>Central Admin</strong>.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, targetScope: "state" })}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all",
                    formData.targetScope === "state"
                      ? "border-amber-500 bg-amber-500/10 text-foreground ring-1 ring-amber-500/50"
                      : "border-border/60 hover:border-border bg-card text-muted-foreground"
                  )}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-amber-700 dark:text-amber-400">
                    <MapPin className="h-3.5 w-3.5" />
                    Statewide
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-tight">
                    All {business?.state || "State"} chapters. Verified by <strong>Central Admin</strong>.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, targetScope: "global" })}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all",
                    formData.targetScope === "global"
                      ? "border-sky-500 bg-sky-500/10 text-foreground ring-1 ring-sky-500/50"
                      : "border-border/60 hover:border-border bg-card text-muted-foreground"
                  )}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-sky-700 dark:text-sky-400">
                    <Globe className="h-3.5 w-3.5" />
                    Global Platform
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-tight">
                    All members nationwide. Verified by <strong>Central Admin</strong>.
                  </p>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Campaign Title *</Label>
                <span className={cn("text-[10px]", formData.title.length > 90 ? "text-amber-500 font-semibold" : "text-muted-foreground")}>
                  {formData.title.length}/100
                </span>
              </div>
              <Input
                placeholder="e.g. Special 20% discount on B2B packaging solutions"
                value={formData.title}
                maxLength={100}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (formErrors.title) {
                    setFormErrors((prev) => {
                      const next = { ...prev };
                      delete next.title;
                      return next;
                    });
                  }
                }}
                required
                className={cn("text-xs", formErrors.title && "border-rose-500 focus-visible:ring-rose-500")}
              />
              {formErrors.title && (
                <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {formErrors.title}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Description / Offer Details</Label>
                <span className={cn("text-[10px]", formData.description.length > 270 ? "text-amber-500 font-semibold" : "text-muted-foreground")}>
                  {formData.description.length}/300
                </span>
              </div>
              <Textarea
                placeholder="Short, compelling highlight of your offer or value proposition (1-2 sentences)"
                value={formData.description}
                maxLength={300}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (formErrors.description) {
                    setFormErrors((prev) => {
                      const next = { ...prev };
                      delete next.description;
                      return next;
                    });
                  }
                }}
                rows={2}
                className={cn("text-xs", formErrors.description && "border-rose-500 focus-visible:ring-rose-500")}
              />
              {formErrors.description && (
                <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {formErrors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Target Destination Link (URL)</Label>
                <Input
                  type="text"
                  placeholder="https://yourwebsite.com or /business/slug"
                  value={formData.linkUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, linkUrl: e.target.value });
                    if (formErrors.linkUrl) {
                      setFormErrors((prev) => {
                        const next = { ...prev };
                        delete next.linkUrl;
                        return next;
                      });
                    }
                  }}
                  className={cn("text-xs", formErrors.linkUrl && "border-rose-500 focus-visible:ring-rose-500")}
                />
                {formErrors.linkUrl && (
                  <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {formErrors.linkUrl}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Preferred Start Date</Label>
                <Input
                  type="date"
                  value={formData.requestedDate}
                  min={(() => {
                    const d = new Date();
                    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                  })()}
                  onChange={(e) => {
                    setFormData({ ...formData, requestedDate: e.target.value });
                    if (formErrors.requestedDate) {
                      setFormErrors((prev) => {
                        const next = { ...prev };
                        delete next.requestedDate;
                        return next;
                      });
                    }
                  }}
                  className={cn("text-xs", formErrors.requestedDate && "border-rose-500 focus-visible:ring-rose-500")}
                />
                {formErrors.requestedDate && (
                  <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {formErrors.requestedDate}
                  </p>
                )}
              </div>
            </div>

            {/* Banner Image Upload */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Banner Image * (Recommended 16:9 ratio)</Label>
                <span className="text-[10px] text-muted-foreground">Max 5MB (PNG/JPG/WEBP)</span>
              </div>
              <div className={cn(
                "rounded-xl border border-dashed p-4 text-center space-y-2 bg-muted/20 transition-all",
                formErrors.banner ? "border-rose-500 bg-rose-50/10" : "border-border"
              )}>
                {bannerPreview ? (
                  <div className="relative rounded-lg overflow-hidden aspect-video max-h-40 mx-auto border border-border/60">
                    <img
                      src={bannerPreview}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setBannerFile(null);
                        setBannerPreview("");
                      }}
                      className="absolute top-2 right-2 text-xs h-7 bg-card border border-border shadow-xs hover:bg-muted text-foreground"
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                    <label className="cursor-pointer text-xs font-semibold text-primary hover:underline block">
                      Choose banner image file
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      PNG, JPG, or WEBP up to 5MB
                    </p>
                  </div>
                )}
              </div>
              {formErrors.banner && (
                <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {formErrors.banner}
                </p>
              )}
            </div>

            {/* LIVE AD PREVIEW MOCKUP */}
            {(formData.title || bannerPreview) && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-primary" /> Live Member Preview Mockup
                  </span>
                  <span className="text-[10px] text-muted-foreground">How it renders on /biz</span>
                </div>
                <div className="rounded-xl border border-primary/30 bg-gradient-to-r from-card/90 via-card/70 to-background/80 p-3 shadow-inner space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary/20 text-primary border border-primary/30 px-2 py-0.2 text-[10px] font-bold">
                      {SCOPE_META[formData.targetScope || selectedScope]?.label} Spotlight
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      {business?.name || "Your Enterprise"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                    {bannerPreview ? (
                      <div className="sm:col-span-5 relative rounded-lg overflow-hidden aspect-video max-h-24 bg-black/10 border border-border/50">
                        <img src={bannerPreview} alt="Live preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="sm:col-span-5 rounded-lg border border-dashed border-border/60 aspect-video max-h-24 grid place-items-center text-[10px] text-muted-foreground">
                        Banner Preview
                      </div>
                    )}
                    <div className="sm:col-span-7 space-y-1">
                      <div className="text-xs font-bold text-foreground line-clamp-1">
                        {formData.title || "Your Campaign Headline Here"}
                      </div>
                      <div className="text-[11px] text-muted-foreground line-clamp-2">
                        {formData.description || "Your offer or value proposition description will be featured here."}
                      </div>
                      <div className="pt-0.5">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 text-white text-[10px] font-semibold px-2 py-0.5 shadow-2xs">
                          Explore Showcase <ExternalLink className="h-2.5 w-2.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-xl bg-muted/40 border border-border/40 p-2.5 text-xs text-muted-foreground flex items-start gap-2">
              <Info className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
              <span>
                Your <strong>{SCOPE_META[formData.targetScope || selectedScope]?.reviewer}</strong> will review and verify your advertisement, schedule your duration, and activate your slot.
              </span>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createAdMutation.isPending}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {createAdMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Submitting...
                  </>
                ) : (
                  `Submit for ${SCOPE_META[formData.targetScope || selectedScope]?.reviewer} Review`
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CANCEL / DELETE CONFIRMATION */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">
              Cancel Advertisement Submission?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to cancel &apos;{deleteTarget?.title}&apos;? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Keep Campaign</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAd}
              disabled={deleteAdMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs"
            >
              {deleteAdMutation.isPending ? "Removing..." : "Yes, Cancel Submission"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

export default BizAdvertisements;
