"use client";
import {
  GraduationCap,
  PlayCircle,
  CheckCircle2,
  ChevronRight,
  Search,
  Award,
  Download,
  Loader2,
  BookOpen,
  Trophy,
  X,
  Star,
} from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { SearchableFilterSelect } from "@shared/components/rifah/searchable-filter-select";
import { useCourses, useCategories } from "@shared/hooks/use-rifah-api";
import { courseApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/media";
import { cn } from "@shared/lib/utils";
import {
  getMainCategories,
  getSubCategoriesFor,
} from "@shared/lib/categories-data";

// ── Scope config
const SCOPES = [
  { key: "all", label: "All Courses" },
  { key: "business", label: "🏢 Business Community", match: ["business"] },
  { key: "central", label: "🏛️ Central HQ", match: ["central", "centre"] },
];

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "inprogress", label: "⏳ In Progress" },
  { key: "completed", label: "🎓 Completed" },
  { key: "notstarted", label: "New" },
  { key: "saved", label: "⭐ Starred / Saved" },
];

const FEE_FILTERS = [
  { key: "all", label: "All Pricing" },
  { key: "free", label: "🎁 Free Only" },
  { key: "paid", label: "💳 Paid Only" },
];

const SCOPE_BADGE = {
  central: "bg-violet-100 text-violet-700 border-violet-200",
  centre: "bg-violet-100 text-violet-700 border-violet-200",
  state: "bg-blue-100 text-blue-700 border-blue-200",
  chapter: "bg-emerald-100 text-emerald-700 border-emerald-200",
  business: "bg-amber-100 text-amber-700 border-amber-200",
};

const SCOPE_LABEL = {
  central: "🏛️ Central HQ",
  centre: "🏛️ Central HQ",
  state: "📍 State",
  chapter: "🤝 Chapter",
  business: "🏢 Business Community",
};

function getScopeStr(course) {
  return (course?.scope || course?.visibilityScope || "").toLowerCase();
}

function getCourseProgress(course) {
  const prog = course?.progress;
  if (!prog)
    return { percent: 0, completed: 0, total: 0, status: "notstarted" };

  const chapters = course?.chapters || [];
  let total = course?.contents?.length || 0;
  chapters.forEach((ch) => {
    total += ch.contents?.length || 0;
  });

  const completed = prog.completedContents?.length || 0;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const status = prog.isCompleted
    ? "completed"
    : completed > 0
      ? "inprogress"
      : "notstarted";

  return { percent, completed, total, status };
}

// ── Direct certificate download helper
async function triggerCertificateDownload(url, filename) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Fetch failed");
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    toast.success("Certificate downloaded!");
  } catch {
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// ── Certificate download
async function downloadCert(course, setLoading) {
  setLoading(true);
  try {
    let certUrl = course?.certificate?.pdfUrl || course?.certificate?.fileUrl;
    if (!certUrl) {
      const res = await courseApi.getCertificates({ courseId: course._id });
      const certs = res?.data || res;
      const list = Array.isArray(certs)
        ? certs
        : Array.isArray(certs?.data)
          ? certs.data
          : [];
      const target =
        list.find(
          (c) => String(c.courseId?._id || c.courseId) === String(course._id),
        ) || list[0];
      certUrl = target?.pdfUrl || target?.fileUrl || target?.url;
    }

    if (certUrl) {
      const cleanTitle = (course.title || "Course").replace(
        /[^a-zA-Z0-9_-]/g,
        "_",
      );
      await triggerCertificateDownload(
        resolveMediaUrl(certUrl),
        `${cleanTitle}_Certificate.pdf`,
      );
    } else {
      toast.error(
        "Certificate is being generated. Please try again in a moment.",
      );
    }
  } catch {
    toast.error("Failed to download certificate");
  } finally {
    setLoading(false);
  }
}

// ── Course card for Learning Catalog
function CourseCard({ course, isSaved, onToggleSave }) {
  const [certLoading, setCertLoading] = useState(false);
  const { percent, completed, total, status } = getCourseProgress(course);
  const scopeStr = getScopeStr(course);
  const scopeBadgeCls =
    SCOPE_BADGE[scopeStr] || "bg-slate-100 text-slate-600 border-slate-200";
  const isBusiness = scopeStr === "business";
  const businessName = course?.businessId?.name || "Member Business";
  const scopeLabel = isBusiness
    ? `🏢 ${businessName}`
    : SCOPE_LABEL[scopeStr] || "📚 Training";
  const chapters = course?.chapters || [];
  const isCompleted = status === "completed";
  const isStarted = status === "inprogress";
  const isPaid = Boolean(course?.isPaid);
  const price = Number(course?.price || 0);
  const isEnrolled = Boolean(course?.isEnrolled);

  return (
    <div className="group flex flex-col rounded-2xl border bg-card overflow-hidden shadow-xs hover:shadow-md hover:border-primary/30 transition-all duration-200">
      {/* Cover gradient bar */}
      <div
        className={`h-1.5 w-full ${
          isCompleted
            ? "bg-gradient-to-r from-emerald-400 to-teal-500"
            : isStarted
              ? "bg-gradient-to-r from-blue-400 to-indigo-500"
              : isPaid
                ? "bg-gradient-to-r from-violet-500 to-purple-600"
                : "bg-gradient-to-r from-slate-200 to-slate-300"
        }`}
      />

      <div className="p-5 flex-1 flex flex-col">
        {/* Scope + status badges on left, Star / Save button on right */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold max-w-[200px] truncate ${scopeBadgeCls}`}
              title={scopeLabel}
            >
              {scopeLabel}
            </span>

            {/* Fee badge */}
            {isPaid ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:border-violet-800 dark:text-violet-300 px-2 py-0.5 text-[11px] font-bold shadow-2xs">
                💳 ₹{price.toLocaleString("en-IN")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 px-2 py-0.5 text-[11px] font-semibold">
                🎁 Free
              </span>
            )}

            {isPaid && isEnrolled && (
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300 px-2 py-0.5 text-[11px] font-semibold">
                <CheckCircle2 className="h-3 w-3" /> Enrolled
              </span>
            )}

            {course.category && (
              <span
                className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 text-[11px] font-semibold max-w-[140px] truncate"
                title={course.category}
              >
                {course.category}
              </span>
            )}
            {course.subcategory && (
              <span
                className="inline-flex items-center rounded-full border border-border/80 bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground max-w-[120px] truncate"
                title={course.subcategory}
              >
                {course.subcategory}
              </span>
            )}
            {isCompleted && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" /> Completed
              </span>
            )}
            {isStarted && (
              <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600">
                In Progress
              </span>
            )}
          </div>

          {/* Star / Save for Later toggle button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSave?.(course._id || course.id);
            }}
            title={
              isSaved
                ? "Starred / Saved for later (Click to remove)"
                : "Save for later"
            }
            className={cn(
              "shrink-0 h-7 w-7 rounded-full flex items-center justify-center border transition-all cursor-pointer",
              isSaved
                ? "bg-amber-50 text-amber-500 border-amber-300 shadow-2xs dark:bg-amber-950/40 dark:border-amber-700"
                : "bg-muted/40 text-slate-400 border-slate-200 hover:text-amber-500 hover:border-amber-200 hover:bg-amber-50/50",
            )}
            aria-label={
              isSaved
                ? "Remove from Starred / Saved for later"
                : "Star / Save for later"
            }
          >
            <Star
              className={cn(
                "h-3.5 w-3.5 transition-transform active:scale-125",
                isSaved ? "fill-amber-400 text-amber-500" : "",
              )}
            />
          </button>
        </div>

        <h3 className="font-bold text-base line-clamp-2 mb-2 leading-snug">
          {course.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {course.description || "No description provided."}
        </p>

        {/* Progress or meta stats */}
        <div className="pt-3 border-t space-y-2 mt-auto">
          {total > 0 && (
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5 font-medium">
                <span>
                  {completed} of {total} lessons completed
                </span>
                <span className="font-bold text-foreground">{percent}%</span>
              </div>
              <Progress value={percent} className="h-1.5" />
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <span>
              {chapters.length > 0
                ? `${chapters.length} chapter${chapters.length > 1 ? "s" : ""}`
                : `${total} lesson${total !== 1 ? "s" : ""}`}
            </span>
            {course.createdBy?.name && (
              <span className="truncate max-w-[150px]">
                By {course.createdBy.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="px-5 pb-5 pt-0 flex gap-2">
        {isCompleted ? (
          <>
            <Button asChild variant="outline" className="flex-1" size="sm">
              <Link href={`/biz/lms/${course._id}`}>
                <PlayCircle className="h-3.5 w-3.5 mr-1.5" /> Review
              </Link>
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
              onClick={() => downloadCert(course, setCertLoading)}
              disabled={certLoading}
            >
              {certLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <Download className="h-3.5 w-3.5 mr-1.5" />
              )}
              Certificate
            </Button>
          </>
        ) : isPaid && !isEnrolled ? (
          <Button
            asChild
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-sm font-semibold"
            size="sm"
          >
            <Link href={`/biz/lms/${course._id}`}>
              Enroll for ₹{price.toLocaleString("en-IN")}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        ) : (
          <Button asChild className="w-full" size="sm">
            <Link href={`/biz/lms/${course._id}`}>
              {isStarted ? "Continue Course" : "Start Course"}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Certificate gallery card
function CertCard({ cert }) {
  const [certLoading, setCertLoading] = useState(false);
  const courseTitle = cert?.courseId?.title || cert?.courseTitle || "Course";
  const scopeStr = (cert?.courseId?.scope || "").toLowerCase();
  const scopeLabel = SCOPE_LABEL[scopeStr] || "📚 Training";
  const certUrl = cert?.pdfUrl || cert?.fileUrl || cert?.url;

  const handleDownload = async () => {
    if (!certUrl) {
      toast.error("Certificate URL not found");
      return;
    }
    setCertLoading(true);
    const cleanTitle = courseTitle.replace(/[^a-zA-Z0-9_-]/g, "_");
    await triggerCertificateDownload(
      resolveMediaUrl(certUrl),
      `${cleanTitle}_Certificate.pdf`,
    );
    setCertLoading(false);
  };

  return (
    <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow">
          <Award className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-amber-900 line-clamp-2 leading-snug">
            {courseTitle}
          </p>
          <p className="text-[11px] text-amber-700 mt-0.5">{scopeLabel}</p>
        </div>
      </div>
      {cert.certificateNumber && (
        <p className="text-[10px] font-mono text-amber-600 bg-amber-100 px-2 py-1 rounded-md">
          #{cert.certificateNumber}
        </p>
      )}
      {cert.createdAt && (
        <p className="text-[11px] text-muted-foreground">
          Issued:{" "}
          {new Date(cert.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      )}
      <Button
        size="sm"
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white mt-1"
        onClick={handleDownload}
        disabled={certLoading}
      >
        {certLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        Download Certificate
      </Button>
    </div>
  );
}

// ── Main Component
export function BizLms() {
  const {
    data: coursesData,
    isLoading,
    refetch: refetchCourses,
  } = useCourses();
  const { data: categoriesData } = useCategories();
  const courses = Array.isArray(coursesData?.data)
    ? coursesData.data
    : Array.isArray(coursesData)
      ? coursesData
      : [];

  const allCategories = Array.isArray(categoriesData)
    ? categoriesData
    : categoriesData?.categories || [];
  const mainCategories = useMemo(() => {
    const dbMain = allCategories.filter((c) => !c.parent).map((c) => c.name);
    const staticMain = getMainCategories();
    const unique = Array.from(new Set([...dbMain, ...staticMain])).filter(
      Boolean,
    );
    return unique.sort().map((name) => ({ name, value: name, label: name }));
  }, [allCategories]);

  const [activeTab, setActiveTab] = useState("courses");
  const [searchTerm, setSearchTerm] = useState("");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [feeFilter, setFeeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subcategoryFilter, setSubcategoryFilter] = useState("all");

  // ── Starred / Saved courses state
  const [savedCourseIds, setSavedCourseIds] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("rifah_saved_course_ids");
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    if (courses.length > 0) {
      const serverStarredIds = courses
        .filter((c) => c.isStarred)
        .map((c) => String(c._id));
      if (serverStarredIds.length > 0) {
        setSavedCourseIds((prev) => {
          const merged = Array.from(new Set([...prev, ...serverStarredIds]));
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(
                "rifah_saved_course_ids",
                JSON.stringify(merged),
              );
            } catch (e) {}
          }
          return merged;
        });
      }
    }
  }, [courses]);

  const handleToggleStar = async (courseId) => {
    const idStr = String(courseId);
    const wasSaved = savedCourseIds.includes(idStr);
    const nextSaved = wasSaved
      ? savedCourseIds.filter((id) => id !== idStr)
      : [...savedCourseIds, idStr];

    setSavedCourseIds(nextSaved);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "rifah_saved_course_ids",
          JSON.stringify(nextSaved),
        );
      } catch (e) {}
    }
    toast.success(wasSaved ? "Removed from Starred" : "Course Starred!");

    try {
      await courseApi.toggleStar(courseId);
    } catch {
      // optimistic update
    }
  };

  const isCourseSaved = (course) => {
    const idStr = String(course._id || course.id);
    return savedCourseIds.includes(idStr) || Boolean(course.isStarred);
  };

  // Subcategories helper: strictly returns specific subcategories belonging to the selected category
  const getSubcategories = (catNameOrId) => {
    if (!catNameOrId) return [];
    const trimmed = String(catNameOrId).trim();
    if (
      trimmed === "" ||
      trimmed === "all" ||
      trimmed.toLowerCase() === "all categories"
    ) {
      // General high-level business topics for "All Categories" (Universal)
      return [
        { name: "General Business & Operations" },
        { name: "Leadership & Team Strategy" },
        { name: "Sales, Marketing & Branding" },
        { name: "Finance, Taxation & Accounting" },
        { name: "Human Resources & Talent Management" },
        { name: "Digital Tools & AI Productivity" },
        { name: "Compliance, Ethics & Business Law" },
      ];
    }

    const cat = allCategories.find(
      (c) =>
        c.name === trimmed ||
        c._id === trimmed ||
        (c.slug && c.slug === trimmed.toLowerCase()),
    );
    const targetName = (cat?.name || trimmed).trim().toLowerCase();
    const targetId = cat?._id ? String(cat._id) : "";

    // 1. Check database subcategories where parent matches this specific category
    const dbSubs = allCategories
      .filter((c) => {
        if (!c.parent) return false;
        const p = String(c.parent).trim().toLowerCase();
        return p === targetName || (targetId && String(c.parent) === targetId);
      })
      .map((c) => c.name);

    // 2. Fetch specific subcategories from the standardized taxonomy
    const staticSubs = getSubCategoriesFor(targetName) || [];

    // Combine and deduplicate specifically for this category
    const combined = Array.from(new Set([...dbSubs, ...staticSubs]))
      .map((s) => String(s || "").trim())
      .filter(Boolean);

    if (combined.length === 0) {
      return [
        { name: "General" },
        { name: "Fundamentals" },
        { name: "Advanced Training" },
      ];
    }

    return combined.map((name) => ({ name, value: name, label: name }));
  };

  const availableSubcategories = getSubcategories(categoryFilter);
  const certificates = courses.filter((c) => c?.progress?.isCompleted);

  // ── Filter Learning Catalog courses
  const filteredCatalog = courses.filter((course) => {
    const q = searchTerm.toLowerCase();
    if (q) {
      const inTitle = course.title?.toLowerCase().includes(q);
      const inDesc = course.description?.toLowerCase().includes(q);
      const inCat = course.category?.toLowerCase().includes(q);
      const inSub = course.subcategory?.toLowerCase().includes(q);
      if (!inTitle && !inDesc && !inCat && !inSub) return false;
    }
    if (scopeFilter !== "all") {
      const scopeDef = SCOPES.find((s) => s.key === scopeFilter);
      if (scopeDef?.match && !scopeDef.match.includes(getScopeStr(course)))
        return false;
    }
    if (statusFilter !== "all") {
      if (statusFilter === "saved") {
        if (!isCourseSaved(course)) return false;
      } else {
        const { status } = getCourseProgress(course);
        if (status !== statusFilter) return false;
      }
    }
    if (feeFilter !== "all") {
      if (feeFilter === "free" && course.isPaid) return false;
      if (feeFilter === "paid" && !course.isPaid) return false;
    }
    if (categoryFilter !== "all") {
      if (
        (course.category || "").trim().toLowerCase() !==
        categoryFilter.trim().toLowerCase()
      )
        return false;
    }
    if (subcategoryFilter !== "all") {
      if (
        (course.subcategory || "").trim().toLowerCase() !==
        subcategoryFilter.trim().toLowerCase()
      )
        return false;
    }
    return true;
  });

  const completedCount = courses.filter((c) => c?.progress?.isCompleted).length;
  const inProgressCount = courses.filter((c) => {
    const { status } = getCourseProgress(c);
    return status === "inprogress";
  }).length;
  const savedCount = courses.filter((c) => isCourseSaved(c)).length;

  return (
    <AppShell
      role="business"
      title="Learning Center"
      subtitle="Explore official RIFAH training courses and earn accredited skill certificates"
    >
      <div className="space-y-6">
        {/* ── Top Navigation Tabs */}
        <div className="flex gap-1 border-b overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("courses")}
            className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
              activeTab === "courses"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="h-4 w-4 inline -mt-0.5" />
            Browse Courses
          </button>

          <button
            onClick={() => setActiveTab("certificates")}
            className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
              activeTab === "certificates"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Award className="h-4 w-4 inline -mt-0.5" />
            My Certificates
            {completedCount > 0 && (
              <span className="ml-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 leading-none">
                {completedCount}
              </span>
            )}
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: BROWSE COURSES (LEARNER CATALOG)                                  */}
        {/* ========================================================================= */}
        {activeTab === "courses" && (
          <div className="space-y-5">
            {/* Stats row */}
            {!isLoading && courses.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  {
                    label: "Total Courses",
                    value: courses.length,
                    icon: BookOpen,
                    color: "text-primary bg-primary/10",
                  },
                  {
                    label: "In Progress",
                    value: inProgressCount,
                    icon: PlayCircle,
                    color: "text-blue-600 bg-blue-100",
                  },
                  {
                    label: "Completed",
                    value: completedCount,
                    icon: Trophy,
                    color: "text-emerald-600 bg-emerald-100",
                  },
                  {
                    label: "Saved for Later",
                    value: savedCount,
                    icon: Star,
                    color: "text-amber-600 bg-amber-100",
                  },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div
                    key={label}
                    className="rounded-2xl border bg-card px-4 py-4 flex items-center gap-3"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-xl font-bold leading-tight">{value}</p>
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Search + Scope + Category filters */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search courses by title, topic, or category…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition shadow-2xs"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="w-full sm:w-[200px] shrink-0">
                  <SearchableFilterSelect
                    value={categoryFilter}
                    onValueChange={(val) => {
                      setCategoryFilter(val);
                      setSubcategoryFilter("all");
                    }}
                    placeholder="All Categories"
                    searchPlaceholder="Search category..."
                    allLabel="🌐 All Categories"
                    options={mainCategories.map((c) => ({
                      value: c.name,
                      label: c.name,
                    }))}
                    className="h-10 text-xs rounded-xl bg-background border"
                  />
                </div>

                <div className="w-full sm:w-[190px] shrink-0">
                  <SearchableFilterSelect
                    value={subcategoryFilter}
                    onValueChange={setSubcategoryFilter}
                    placeholder={
                      categoryFilter === "all"
                        ? "Select Category First"
                        : "All Subcategories"
                    }
                    searchPlaceholder="Search subcategory..."
                    allLabel="All Subcategories"
                    options={availableSubcategories.map((sc) => ({
                      value: sc.name,
                      label: sc.name,
                    }))}
                    disabled={
                      categoryFilter === "all" ||
                      availableSubcategories.length === 0
                    }
                    className="h-10 text-xs rounded-xl bg-background border"
                  />
                </div>
              </div>

              {/* Scope, Fee & Status Pills */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                <div className="flex gap-1.5 flex-wrap items-center">
                  <span className="text-[11px] font-semibold text-muted-foreground mr-1">
                    Scope:
                  </span>
                  {SCOPES.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setScopeFilter(s.key)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                        scopeFilter === s.key
                          ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                          : "bg-background text-muted-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-1.5 flex-wrap items-center">
                  <span className="text-[11px] font-semibold text-muted-foreground mr-1">
                    Pricing:
                  </span>
                  {FEE_FILTERS.map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setFeeFilter(f.key)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                        feeFilter === f.key
                          ? "bg-violet-600 text-white border-violet-600 shadow-2xs"
                          : "bg-background text-muted-foreground border-border hover:border-violet-300"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-1.5 flex-wrap items-center">
                  <span className="text-[11px] font-semibold text-muted-foreground mr-1">
                    Status:
                  </span>
                  {STATUS_FILTERS.map((s) => {
                    const isSelected = statusFilter === s.key;
                    return (
                      <button
                        key={s.key}
                        onClick={() => setStatusFilter(s.key)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all inline-flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-foreground text-background border-foreground shadow-2xs"
                            : "bg-background text-muted-foreground border-border hover:border-foreground/30"
                        }`}
                      >
                        <span>{s.label}</span>
                        {s.key === "saved" && savedCount > 0 && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold leading-tight ${
                              isSelected
                                ? "bg-amber-400 text-slate-900"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {savedCount}
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {(categoryFilter !== "all" ||
                    subcategoryFilter !== "all" ||
                    scopeFilter !== "all" ||
                    statusFilter !== "all" ||
                    feeFilter !== "all" ||
                    searchTerm) && (
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryFilter("all");
                        setSubcategoryFilter("all");
                        setScopeFilter("all");
                        setStatusFilter("all");
                        setFeeFilter("all");
                        setSearchTerm("");
                      }}
                      className="ml-2 text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                    >
                      <X className="h-3 w-3" /> Reset Filters
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Courses Grid */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm">Loading courses…</p>
              </div>
            ) : filteredCatalog.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border rounded-2xl">
                <div className="bg-muted p-5 rounded-full mb-4">
                  {statusFilter === "saved" ? (
                    <Star className="h-10 w-10 text-amber-500 fill-amber-100" />
                  ) : (
                    <GraduationCap className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {statusFilter === "saved"
                    ? "No Starred Courses Yet"
                    : courses.length === 0
                      ? "No Courses Available"
                      : "No Courses Found"}
                </h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                  {statusFilter === "saved"
                    ? "Click the star icon on any course card to bookmark it for later."
                    : "Try adjusting your search or filters."}
                </p>
                {(courses.length > 0 ||
                  statusFilter !== "all" ||
                  feeFilter !== "all") && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setSearchTerm("");
                      setScopeFilter("all");
                      setStatusFilter("all");
                      setFeeFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCatalog.map((course) => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    isSaved={isCourseSaved(course)}
                    onToggleSave={() => handleToggleStar(course._id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CERTIFICATES TAB                                                  */}
        {/* ========================================================================= */}
        {activeTab === "certificates" && (
          <div className="space-y-5">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : certificates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border rounded-2xl">
                <div className="bg-amber-50 p-5 rounded-full mb-4 border-2 border-amber-200">
                  <Award className="h-10 w-10 text-amber-400" />
                </div>
                <h3 className="text-base font-semibold">No Certificates Yet</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                  Complete any course to earn your verified certificate of
                  completion.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setActiveTab("courses")}
                >
                  <BookOpen className="h-4 w-4 mr-2" /> Browse Courses
                </Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  You have earned{" "}
                  <span className="font-semibold text-foreground">
                    {certificates.length}
                  </span>{" "}
                  certificate{certificates.length !== 1 ? "s" : ""}.
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {certificates.map((course) => (
                    <CertCard
                      key={course._id}
                      cert={{
                        ...(course.certificate || {}),
                        courseId: {
                          title: course.title,
                          scope: course.scope || course.visibilityScope,
                        },
                        courseTitle: course.title,
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

