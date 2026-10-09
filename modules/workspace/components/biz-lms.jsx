"use client";
import {
  GraduationCap, PlayCircle, CheckCircle2, ChevronRight,
  Search, Award, Download, Loader2, BookOpen, Trophy, X, Star, Bookmark,
  Plus, Edit, Trash2, Eye, EyeOff, FileText, Video, Layers, AlertTriangle,
  FolderPlus, Sparkles, MoreHorizontal, ArrowLeft, ExternalLink, AlertCircle
} from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { AppShell } from "@shared/components/rifah/app-shell";
import { StatCard, Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Progress } from "@shared/components/ui/progress";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Textarea } from "@shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { SearchableFilterSelect } from "@shared/components/rifah/searchable-filter-select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@shared/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@shared/components/ui/dialog";
import { useCourses, useCategories } from "@shared/hooks/use-rifah-api";
import { courseApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/media";
import { cn } from "@shared/lib/utils";
import { getMainCategories, getSubCategoriesFor } from "@shared/lib/categories-data";

// ── Scope config
const SCOPES = [
  { key: "all", label: "All Courses" },
  { key: "business", label: "🏢 Business Community", match: ["business"] },
  { key: "central", label: "🏛️ Central HQ", match: ["central", "centre"] },
  { key: "state", label: "📍 State", match: ["state"] },
  { key: "chapter", label: "🤝 Chapter", match: ["chapter"] },
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
  if (!prog) return { percent: 0, completed: 0, total: 0, status: "notstarted" };

  const chapters = course?.chapters || [];
  let total = course?.contents?.length || 0;
  chapters.forEach(ch => { total += ch.contents?.length || 0; });

  const completed = prog.completedContents?.length || 0;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const status = prog.isCompleted ? "completed" : completed > 0 ? "inprogress" : "notstarted";

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
      const list = Array.isArray(certs) ? certs : (Array.isArray(certs?.data) ? certs.data : []);
      const target = list.find(c => String(c.courseId?._id || c.courseId) === String(course._id)) || list[0];
      certUrl = target?.pdfUrl || target?.fileUrl || target?.url;
    }

    if (certUrl) {
      const cleanTitle = (course.title || "Course").replace(/[^a-zA-Z0-9_-]/g, "_");
      await triggerCertificateDownload(resolveMediaUrl(certUrl), `${cleanTitle}_Certificate.pdf`);
    } else {
      toast.error("Certificate is being generated. Please try again in a moment.");
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
  const scopeBadgeCls = SCOPE_BADGE[scopeStr] || "bg-slate-100 text-slate-600 border-slate-200";
  const isBusiness = scopeStr === "business";
  const businessName = course?.businessId?.name || "Member Business";
  const scopeLabel = isBusiness ? `🏢 ${businessName}` : (SCOPE_LABEL[scopeStr] || "📚 Training");
  const chapters = course?.chapters || [];
  const isCompleted = status === "completed";
  const isStarted = status === "inprogress";
  const isPaid = Boolean(course?.isPaid);
  const price = Number(course?.price || 0);
  const isEnrolled = Boolean(course?.isEnrolled);

  return (
    <div className="group flex flex-col rounded-2xl border bg-card overflow-hidden shadow-xs hover:shadow-md hover:border-primary/30 transition-all duration-200">
      {/* Cover gradient bar */}
      <div className={`h-1.5 w-full ${
        isCompleted
          ? "bg-gradient-to-r from-emerald-400 to-teal-500"
          : isStarted
          ? "bg-gradient-to-r from-blue-400 to-indigo-500"
          : isPaid
          ? "bg-gradient-to-r from-violet-500 to-purple-600"
          : "bg-gradient-to-r from-slate-200 to-slate-300"
      }`} />

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
              <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 text-[11px] font-semibold max-w-[140px] truncate" title={course.category}>
                {course.category}
              </span>
            )}
            {course.subcategory && (
              <span className="inline-flex items-center rounded-full border border-border/80 bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground max-w-[120px] truncate" title={course.subcategory}>
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
            title={isSaved ? "Starred / Saved for later (Click to remove)" : "Save for later"}
            className={cn(
              "shrink-0 h-7 w-7 rounded-full flex items-center justify-center border transition-all cursor-pointer",
              isSaved
                ? "bg-amber-50 text-amber-500 border-amber-300 shadow-2xs dark:bg-amber-950/40 dark:border-amber-700"
                : "bg-muted/40 text-slate-400 border-slate-200 hover:text-amber-500 hover:border-amber-200 hover:bg-amber-50/50"
            )}
            aria-label={isSaved ? "Remove from Starred / Saved for later" : "Star / Save for later"}
          >
            <Star
              className={cn(
                "h-3.5 w-3.5 transition-transform active:scale-125",
                isSaved ? "fill-amber-400 text-amber-500" : ""
              )}
            />
          </button>
        </div>

        <h3 className="font-bold text-base line-clamp-2 mb-2 leading-snug">{course.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {course.description || "No description provided."}
        </p>

        {/* Progress or meta stats */}
        <div className="pt-3 border-t space-y-2 mt-auto">
          {total > 0 && (
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5 font-medium">
                <span>{completed} of {total} lessons completed</span>
                <span className="font-bold text-foreground">{percent}%</span>
              </div>
              <Progress value={percent} className="h-1.5" />
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <span>{chapters.length > 0 ? `${chapters.length} chapter${chapters.length > 1 ? "s" : ""}` : `${total} lesson${total !== 1 ? "s" : ""}`}</span>
            {course.createdBy?.name && (
              <span className="truncate max-w-[150px]">By {course.createdBy.name}</span>
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
              {certLoading
                ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                : <Download className="h-3.5 w-3.5 mr-1.5" />}
              Certificate
            </Button>
          </>
        ) : isPaid && !isEnrolled ? (
          <Button asChild className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-sm font-semibold" size="sm">
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
    if (!certUrl) { toast.error("Certificate URL not found"); return; }
    setCertLoading(true);
    const cleanTitle = courseTitle.replace(/[^a-zA-Z0-9_-]/g, "_");
    await triggerCertificateDownload(resolveMediaUrl(certUrl), `${cleanTitle}_Certificate.pdf`);
    setCertLoading(false);
  };

  return (
    <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow">
          <Award className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-amber-900 line-clamp-2 leading-snug">{courseTitle}</p>
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
          Issued: {new Date(cert.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      )}
      <Button
        size="sm"
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white mt-1"
        onClick={handleDownload}
        disabled={certLoading}
      >
        {certLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
        Download Certificate
      </Button>
    </div>
  );
}

// ── Main Component
export function BizLms() {
  const { data: coursesData, isLoading, refetch: refetchCourses } = useCourses();
  const { data: myCoursesData, isLoading: isLoadingMyCourses, refetch: refetchMyCourses } = useCourses({ myCourses: true });
  const { data: categoriesData } = useCategories();

  const courses = Array.isArray(coursesData?.data)
    ? coursesData.data
    : Array.isArray(coursesData) ? coursesData : [];

  const myCourses = Array.isArray(myCoursesData?.data)
    ? myCoursesData.data
    : Array.isArray(myCoursesData) ? myCoursesData : [];

  const allCategories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.categories || []);
  const mainCategories = useMemo(() => {
    const dbMain = allCategories.filter((c) => !c.parent).map((c) => c.name);
    const staticMain = getMainCategories();
    const unique = Array.from(new Set([...dbMain, ...staticMain])).filter(Boolean);
    return unique.sort().map((name) => ({ name, value: name, label: name }));
  }, [allCategories]);

  const [activeTab, setActiveTab] = useState("courses"); // "courses" | "my-courses" | "certificates"
  const [searchTerm, setSearchTerm] = useState("");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [feeFilter, setFeeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subcategoryFilter, setSubcategoryFilter] = useState("all");

  // ── Creator Studio & Drill-Down State (Level 1 / 2)
  const [activeMyCourseId, setActiveMyCourseId] = useState(null);
  const [activeChapterIdx, setActiveChapterIdx] = useState(null);

  // ── Course Creator Modal States
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("all");
  const [newSubcategory, setNewSubcategory] = useState("all");
  const [stagedChapters, setStagedChapters] = useState([]);
  const [newChapTitle, setNewChapTitle] = useState("");
  const [activeStagedChapIdx, setActiveStagedChapIdx] = useState(0);
  const [stagedLessonTitle, setStagedLessonTitle] = useState("");
  const [stagedLessonType, setStagedLessonType] = useState("video");
  const [stagedFile, setStagedFile] = useState(null);
  const [stagedUrl, setStagedUrl] = useState("");
  const [isUploadingStaged, setIsUploadingStaged] = useState(false);
  const [savingCourse, setSavingCourse] = useState(false);

  // ── Specific Field-by-Field Validation Error States
  const [createErrors, setCreateErrors] = useState({});
  const [stagedLessonError, setStagedLessonError] = useState("");
  const [editErrors, setEditErrors] = useState({});
  const [inPlaceChapError, setInPlaceChapError] = useState("");
  const [inPlaceLessonError, setInPlaceLessonError] = useState("");

  const clearCreateError = (field) => {
    if (createErrors[field]) {
      setCreateErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // ── Edit Course Metadata
  const [courseToEdit, setCourseToEdit] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("all");
  const [editSubcategory, setEditSubcategory] = useState("all");
  const [savingEditInfo, setSavingEditInfo] = useState(false);

  // ── In-Place Chapter & Lesson Modals for Drilled-Down Course
  const [isAddChapterOpen, setIsAddChapterOpen] = useState(false);
  const [editingChapterIdx, setEditingChapterIdx] = useState(null);
  const [chapInputTitle, setChapInputTitle] = useState("");
  const [chapInputDesc, setChapInputDesc] = useState("");
  const [savingChapterInPlace, setSavingChapterInPlace] = useState(false);

  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [lessonInputTitle, setLessonInputTitle] = useState("");
  const [lessonInputType, setLessonInputType] = useState("video");
  const [lessonInputFile, setLessonInputFile] = useState(null);
  const [lessonInputUrl, setLessonInputUrl] = useState("");
  const [isUploadingLesson, setIsUploadingLesson] = useState(false);
  const [savingLessonInPlace, setSavingLessonInPlace] = useState(false);

  // ── Delete Confirmation
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deletingCourse, setDeletingCourse] = useState(false);

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
      const serverStarredIds = courses.filter(c => c.isStarred).map(c => String(c._id));
      if (serverStarredIds.length > 0) {
        setSavedCourseIds(prev => {
          const merged = Array.from(new Set([...prev, ...serverStarredIds]));
          if (typeof window !== "undefined") {
            try { localStorage.setItem("rifah_saved_course_ids", JSON.stringify(merged)); } catch (e) {}
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
      ? savedCourseIds.filter(id => id !== idStr)
      : [...savedCourseIds, idStr];

    setSavedCourseIds(nextSaved);
    if (typeof window !== "undefined") {
      try { localStorage.setItem("rifah_saved_course_ids", JSON.stringify(nextSaved)); } catch (e) {}
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
    if (trimmed === "" || trimmed === "all" || trimmed.toLowerCase() === "all categories") {
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

    const cat = allCategories.find((c) => c.name === trimmed || c._id === trimmed || (c.slug && c.slug === trimmed.toLowerCase()));
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
      .map(s => String(s || "").trim())
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
  const availableSubcategoriesForNew = getSubcategories(newCategory);
  const availableSubcategoriesForEdit = getSubcategories(editCategory);

  const certificates = courses.filter(c => c?.progress?.isCompleted);

  const refetchAll = () => {
    refetchCourses();
    refetchMyCourses();
  };

  // Currently active drilled-down course in Creator Studio
  const activeMyCourse = myCourses.find(c => String(c._id) === String(activeMyCourseId)) || null;

  // ── Creator Modal Handlers
  const handleOpenCreateModal = () => {
    setNewTitle("");
    setNewDescription("");
    setNewCategory("All Categories");
    setNewSubcategory("all");
    setStagedChapters([
      { title: "Chapter 1: Overview & Introduction", description: "", order: 1, contents: [] }
    ]);
    setNewChapTitle("");
    setActiveStagedChapIdx(0);
    setStagedLessonTitle("");
    setStagedLessonType("video");
    setStagedFile(null);
    setStagedUrl("");
    setCreateErrors({});
    setStagedLessonError("");
    setIsCreating(true);
  };

  const handleAddStagedChapter = () => {
    if (!newChapTitle.trim()) {
      setCreateErrors(prev => ({ ...prev, newChapter: "Please enter a chapter title before adding." }));
      return toast.error("Please enter a chapter title");
    }
    clearCreateError("newChapter");
    clearCreateError("chapters");

    const newCh = {
      title: newChapTitle.trim(),
      description: "",
      order: stagedChapters.length + 1,
      contents: [],
    };
    setStagedChapters([...stagedChapters, newCh]);
    setActiveStagedChapIdx(stagedChapters.length);
    setNewChapTitle("");
    toast.success("Chapter added to draft");
  };

  const handleRemoveStagedChapter = (idxToRemove) => {
    const updated = stagedChapters.filter((_, idx) => idx !== idxToRemove).map((ch, idx) => ({
      ...ch,
      order: idx + 1
    }));
    setStagedChapters(updated);
    if (activeStagedChapIdx === idxToRemove) {
      setActiveStagedChapIdx(updated.length > 0 ? 0 : null);
    } else if (activeStagedChapIdx > idxToRemove) {
      setActiveStagedChapIdx(activeStagedChapIdx - 1);
    }
  };

  const handleAddStagedLesson = async (e) => {
    if (e) e.preventDefault();
    setStagedLessonError("");

    if (activeStagedChapIdx === null || !stagedChapters[activeStagedChapIdx]) {
      setStagedLessonError("Please select a chapter first.");
      return toast.error("Please select a chapter first.");
    }
    if (!stagedLessonTitle.trim()) {
      setStagedLessonError("Lesson title is required.");
      return toast.error("Please enter a title for this lesson.");
    }
    if (stagedLessonType === "pdf" && !stagedFile) {
      setStagedLessonError("Please upload a PDF document.");
      return toast.error("Please upload a PDF document.");
    }
    if (stagedLessonType === "video" && !stagedFile && !stagedUrl.trim()) {
      setStagedLessonError("Please upload a video file or enter a video URL.");
      return toast.error("Please upload a video or enter a video URL.");
    }

    let fileUrl = stagedUrl.trim();
    if (stagedFile) {
      setIsUploadingStaged(true);
      try {
        const uploadRes = await courseApi.uploadContent(stagedFile);
        fileUrl = uploadRes?.data?.url || uploadRes?.url;
        if (!fileUrl) throw new Error("Upload did not return a valid file URL.");
      } catch (err) {
        setStagedLessonError(err.message || "Failed to upload file");
        toast.error(err.message || "Failed to upload file");
        setIsUploadingStaged(false);
        return;
      } finally {
        setIsUploadingStaged(false);
      }
    }

    if (!fileUrl) {
      setStagedLessonError("Please upload a file or enter a direct media URL.");
      return toast.error("Please upload a file or enter a direct media URL.");
    }

    const newLesson = {
      title: stagedLessonTitle.trim(),
      type: stagedLessonType,
      url: fileUrl,
      order: (stagedChapters[activeStagedChapIdx].contents?.length || 0) + 1,
    };

    const updated = [...stagedChapters];
    updated[activeStagedChapIdx] = {
      ...updated[activeStagedChapIdx],
      contents: [...(updated[activeStagedChapIdx].contents || []), newLesson]
    };

    setStagedChapters(updated);
    setStagedLessonTitle("");
    setStagedFile(null);
    setStagedUrl("");
    setStagedLessonError("");
    clearCreateError("curriculum");
    clearCreateError(`chapter_${activeStagedChapIdx}`);
    toast.success(`Lesson added to ${updated[activeStagedChapIdx].title}`);
  };

  const handleRemoveStagedLesson = (chapIdx, lessonIdx) => {
    const updated = [...stagedChapters];
    const updatedContents = updated[chapIdx].contents
      .filter((_, idx) => idx !== lessonIdx)
      .map((item, idx) => ({ ...item, order: idx + 1 }));
    updated[chapIdx] = { ...updated[chapIdx], contents: updatedContents };
    setStagedChapters(updated);
  };

  // ── Validation & Submission
  const handleFinalSaveCourse = async (shouldPublish = false) => {
    const errs = {};

    // 1. Title validation
    if (!newTitle.trim()) {
      errs.title = "Course Title is required.";
    } else if (newTitle.trim().length < 3) {
      errs.title = "Course Title must be at least 3 characters long.";
    }

    // 2. Category validation (Allows "All Categories" or any specific category)
    if (!newCategory || !newCategory.trim()) {
      errs.category = "Course Category is required.";
    }

    // 3. Description validation
    if (!newDescription.trim()) {
      errs.description = "Course Description is required.";
    } else if (newDescription.trim().length < 10) {
      errs.description = "Please provide at least 10 characters describing this course.";
    }

    // 4. Chapters validation
    if (stagedChapters.length === 0) {
      errs.chapters = "Please add at least 1 chapter to your course.";
    }

    // 5. Lessons check
    let totalLessonsCount = 0;
    stagedChapters.forEach((ch, idx) => {
      const count = ch.contents?.length || 0;
      totalLessonsCount += count;
      if (shouldPublish && count === 0) {
        errs[`chapter_${idx}`] = `Chapter ${idx + 1} ("${ch.title}") has no lessons. Attach at least 1 lesson before publishing.`;
      }
    });

    if (shouldPublish && totalLessonsCount === 0) {
      errs.curriculum = "Cannot publish an empty course. Please attach at least 1 video or PDF lesson.";
    }

    if (Object.keys(errs).length > 0) {
      setCreateErrors(errs);
      const firstErrorMsg = Object.values(errs)[0];
      toast.error(firstErrorMsg);
      return;
    }

    setSavingCourse(true);
    setCreateErrors({});
    try {
      const finalCategory = newCategory === "all" || newCategory.toLowerCase() === "all categories" ? "All Categories" : newCategory.trim();
      const finalSubcategory = newSubcategory && newSubcategory !== "all" ? newSubcategory.trim() : "";
      const payload = {
        title: newTitle.trim(),
        description: newDescription.trim(),
        category: finalCategory,
        subcategory: finalSubcategory,
        chapters: stagedChapters,
        status: shouldPublish ? "published" : "draft",
        isActive: shouldPublish,
      };

      await courseApi.create(payload);
      toast.success(shouldPublish ? "Course published successfully for member businesses!" : "Course draft saved!");
      setIsCreating(false);
      refetchAll();
    } catch (err) {
      toast.error(err.message || "Failed to create course.");
    } finally {
      setSavingCourse(false);
    }
  };

  // ── Edit Course Metadata Handlers
  const handleOpenEditCourse = (course) => {
    setCourseToEdit(course);
    setEditTitle(course.title || "");
    setEditDescription(course.description || "");
    setEditCategory(course.category || "All Categories");
    setEditSubcategory(course.subcategory || "all");
    setEditErrors({});
  };

  const handleSaveCourseInfo = async (e) => {
    if (e) e.preventDefault();
    const errs = {};

    if (!editTitle.trim()) {
      errs.title = "Course Title is required.";
    } else if (editTitle.trim().length < 3) {
      errs.title = "Course Title must be at least 3 characters long.";
    }

    if (!editCategory || !editCategory.trim()) {
      errs.category = "Course Category is required.";
    }

    if (!editDescription.trim()) {
      errs.description = "Course Description is required.";
    }

    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      toast.error(Object.values(errs)[0]);
      return;
    }

    setSavingEditInfo(true);
    setEditErrors({});
    try {
      const finalCategory = editCategory === "all" || editCategory.toLowerCase() === "all categories" ? "All Categories" : editCategory.trim();
      const finalSubcategory = editSubcategory && editSubcategory !== "all" ? editSubcategory.trim() : "";
      await courseApi.update(courseToEdit._id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        category: finalCategory,
        subcategory: finalSubcategory,
      });
      toast.success("Course details updated");
      setCourseToEdit(null);
      refetchAll();
    } catch (err) {
      toast.error(err.message || "Failed to update course");
    } finally {
      setSavingEditInfo(false);
    }
  };

  // ── Toggle Publish Status
  const toggleCourseStatus = async (course) => {
    try {
      const currentIsActive = course.isActive || course.status === "published";
      const nextActive = !currentIsActive;

      let totalItems = 0;
      (course.chapters || []).forEach(ch => { totalItems += (ch.contents?.length || 0); });
      totalItems += (course.contents?.length || 0);

      if (nextActive && totalItems === 0) {
        toast.error("Cannot publish an empty course. Please attach at least 1 lesson first.");
        return;
      }

      await courseApi.update(course._id, {
        isActive: nextActive,
        status: nextActive ? "published" : "draft",
      });
      toast.success(nextActive ? "Course published to community!" : "Course moved to draft");
      refetchAll();
    } catch {
      toast.error("Failed to update status");
    }
  };

  // ── Delete Course Handler
  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    setDeletingCourse(true);
    try {
      await courseApi.delete(courseToDelete._id);
      toast.success("Course deleted successfully");
      if (activeMyCourseId === courseToDelete._id) {
        setActiveMyCourseId(null);
        setActiveChapterIdx(null);
      }
      setCourseToDelete(null);
      refetchAll();
    } catch (err) {
      toast.error(err.message || "Failed to delete course");
    } finally {
      setDeletingCourse(false);
    }
  };

  // ── In-Place Chapter Management
  const handleOpenInPlaceChapter = (idx = null) => {
    if (idx !== null && activeMyCourse?.chapters?.[idx]) {
      setEditingChapterIdx(idx);
      setChapInputTitle(activeMyCourse.chapters[idx].title || "");
      setChapInputDesc(activeMyCourse.chapters[idx].description || "");
    } else {
      setEditingChapterIdx(null);
      setChapInputTitle("");
      setChapInputDesc("");
    }
    setInPlaceChapError("");
    setIsAddChapterOpen(true);
  };

  const handleSaveInPlaceChapter = async (e) => {
    if (e) e.preventDefault();
    if (!chapInputTitle.trim()) {
      setInPlaceChapError("Chapter title is required.");
      toast.error("Chapter title is required.");
      return;
    }
    if (!activeMyCourse) return;

    setSavingChapterInPlace(true);
    setInPlaceChapError("");
    try {
      let updatedChapters = [...(activeMyCourse.chapters || [])];
      if (editingChapterIdx !== null) {
        updatedChapters[editingChapterIdx] = {
          ...updatedChapters[editingChapterIdx],
          title: chapInputTitle.trim(),
          description: chapInputDesc.trim(),
        };
      } else {
        updatedChapters.push({
          title: chapInputTitle.trim(),
          description: chapInputDesc.trim(),
          order: updatedChapters.length + 1,
          contents: [],
        });
      }

      await courseApi.update(activeMyCourse._id, { chapters: updatedChapters });
      toast.success(editingChapterIdx !== null ? "Chapter updated" : "Chapter added");
      setIsAddChapterOpen(false);
      refetchAll();
    } catch (err) {
      toast.error(err.message || "Failed to save chapter");
    } finally {
      setSavingChapterInPlace(false);
    }
  };

  const handleDeleteInPlaceChapter = async (chapIdx) => {
    if (!activeMyCourse) return;
    try {
      const updated = activeMyCourse.chapters
        .filter((_, idx) => idx !== chapIdx)
        .map((ch, idx) => ({ ...ch, order: idx + 1 }));

      await courseApi.update(activeMyCourse._id, { chapters: updated });
      toast.success("Chapter removed");
      refetchAll();
    } catch (err) {
      toast.error(err.message || "Failed to remove chapter");
    }
  };

  // ── In-Place Lesson Management
  const handleOpenInPlaceLesson = (chapIdx) => {
    setActiveChapterIdx(chapIdx);
    setLessonInputTitle("");
    setLessonInputType("video");
    setLessonInputFile(null);
    setLessonInputUrl("");
    setInPlaceLessonError("");
    setIsAddLessonOpen(true);
  };

  const handleSaveInPlaceLesson = async (e) => {
    if (e) e.preventDefault();
    if (!lessonInputTitle.trim()) {
      setInPlaceLessonError("Lesson title is required.");
      toast.error("Lesson title is required.");
      return;
    }
    if (lessonInputType === "pdf" && !lessonInputFile) {
      setInPlaceLessonError("Please upload a PDF document.");
      toast.error("Please upload a PDF document.");
      return;
    }
    if (lessonInputType === "video" && !lessonInputFile && !lessonInputUrl.trim()) {
      setInPlaceLessonError("Please upload a video file or enter a video URL.");
      toast.error("Please upload a video file or enter a video URL.");
      return;
    }
    if (!activeMyCourse || activeChapterIdx === null) return;

    let fileUrl = lessonInputUrl.trim();
    if (lessonInputFile) {
      setIsUploadingLesson(true);
      try {
        const uploadRes = await courseApi.uploadContent(lessonInputFile);
        fileUrl = uploadRes?.data?.url || uploadRes?.url;
        if (!fileUrl) throw new Error("Upload did not return a valid URL.");
      } catch (err) {
        setInPlaceLessonError(err.message || "Failed to upload file");
        setIsUploadingLesson(false);
        return;
      } finally {
        setIsUploadingLesson(false);
      }
    }

    if (!fileUrl) {
      setInPlaceLessonError("Please upload a file or enter a media URL.");
      return;
    }

    setSavingLessonInPlace(true);
    setInPlaceLessonError("");
    try {
      const updatedChapters = [...(activeMyCourse.chapters || [])];
      const targetChap = updatedChapters[activeChapterIdx];
      const newLesson = {
        title: lessonInputTitle.trim(),
        type: lessonInputType,
        url: fileUrl,
        order: (targetChap.contents?.length || 0) + 1,
      };

      updatedChapters[activeChapterIdx] = {
        ...targetChap,
        contents: [...(targetChap.contents || []), newLesson],
      };

      await courseApi.update(activeMyCourse._id, { chapters: updatedChapters });
      toast.success("Lesson added successfully");
      setIsAddLessonOpen(false);
      refetchAll();
    } catch (err) {
      toast.error(err.message || "Failed to add lesson");
    } finally {
      setSavingLessonInPlace(false);
    }
  };

  const handleDeleteInPlaceLesson = async (chapIdx, lessonIdx) => {
    if (!activeMyCourse) return;
    try {
      const updatedChapters = [...(activeMyCourse.chapters || [])];
      const targetChap = updatedChapters[chapIdx];
      const updatedContents = targetChap.contents
        .filter((_, idx) => idx !== lessonIdx)
        .map((item, idx) => ({ ...item, order: idx + 1 }));

      updatedChapters[chapIdx] = { ...targetChap, contents: updatedContents };

      await courseApi.update(activeMyCourse._id, { chapters: updatedChapters });
      toast.success("Lesson deleted");
      refetchAll();
    } catch (err) {
      toast.error(err.message || "Failed to delete lesson");
    }
  };

  // ── Filter Learning Catalog courses
  const filteredCatalog = courses.filter(course => {
    const q = searchTerm.toLowerCase();
    if (q) {
      const inTitle = course.title?.toLowerCase().includes(q);
      const inDesc = course.description?.toLowerCase().includes(q);
      const inCat = course.category?.toLowerCase().includes(q);
      const inSub = course.subcategory?.toLowerCase().includes(q);
      if (!inTitle && !inDesc && !inCat && !inSub) return false;
    }
    if (scopeFilter !== "all") {
      const scopeDef = SCOPES.find(s => s.key === scopeFilter);
      if (scopeDef?.match && !scopeDef.match.includes(getScopeStr(course))) return false;
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
      if ((course.category || "").trim().toLowerCase() !== categoryFilter.trim().toLowerCase()) return false;
    }
    if (subcategoryFilter !== "all") {
      if ((course.subcategory || "").trim().toLowerCase() !== subcategoryFilter.trim().toLowerCase()) return false;
    }
    return true;
  });

  const completedCount = courses.filter(c => c?.progress?.isCompleted).length;
  const inProgressCount = courses.filter(c => {
    const { status } = getCourseProgress(c);
    return status === "inprogress";
  }).length;
  const savedCount = courses.filter(c => isCourseSaved(c)).length;

  return (
    <AppShell
      role="business"
      title="Learning Center & Creator Studio"
      subtitle="Learn from RIFAH courses or create and publish training courses for other businesses"
    >
      <div className="space-y-6">

        {/* ── Top Navigation Tabs */}
        <div className="flex gap-1 border-b overflow-x-auto no-scrollbar">
          <button
            onClick={() => { setActiveTab("courses"); setActiveMyCourseId(null); }}
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
            onClick={() => setActiveTab("my-courses")}
            className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
              activeTab === "my-courses"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-4 w-4 inline -mt-0.5 text-amber-500" />
            My Published Courses
            {myCourses.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 leading-none">
                {myCourses.length}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab("certificates"); setActiveMyCourseId(null); }}
            className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
              activeTab === "certificates"
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Award className="h-4 w-4 inline -mt-0.5" />
            My Certificates
            {completedCount > 0 && (
              <span className="ml-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 leading-none">
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
                  { label: "Total Courses", value: courses.length, icon: BookOpen, color: "text-primary bg-primary/10" },
                  { label: "In Progress", value: inProgressCount, icon: PlayCircle, color: "text-blue-600 bg-blue-100" },
                  { label: "Completed", value: completedCount, icon: Trophy, color: "text-emerald-600 bg-emerald-100" },
                  { label: "Saved for Later", value: savedCount, icon: Star, color: "text-amber-600 bg-amber-100" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="rounded-2xl border bg-card px-4 py-4 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
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
                    onChange={e => setSearchTerm(e.target.value)}
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
                    options={mainCategories.map((c) => ({ value: c.name, label: c.name }))}
                    className="h-10 text-xs rounded-xl bg-background border"
                  />
                </div>

                <div className="w-full sm:w-[190px] shrink-0">
                  <SearchableFilterSelect
                    value={subcategoryFilter}
                    onValueChange={setSubcategoryFilter}
                    placeholder={categoryFilter === "all" ? "Select Category First" : "All Subcategories"}
                    searchPlaceholder="Search subcategory..."
                    allLabel="All Subcategories"
                    options={availableSubcategories.map((sc) => ({ value: sc.name, label: sc.name }))}
                    disabled={categoryFilter === "all" || availableSubcategories.length === 0}
                    className="h-10 text-xs rounded-xl bg-background border"
                  />
                </div>
              </div>

              {/* Scope, Fee & Status Pills */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                <div className="flex gap-1.5 flex-wrap items-center">
                  <span className="text-[11px] font-semibold text-muted-foreground mr-1">Scope:</span>
                  {SCOPES.map(s => (
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
                  <span className="text-[11px] font-semibold text-muted-foreground mr-1">Pricing:</span>
                  {FEE_FILTERS.map(f => (
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
                  <span className="text-[11px] font-semibold text-muted-foreground mr-1">Status:</span>
                  {STATUS_FILTERS.map(s => {
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
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold leading-tight ${
                            isSelected ? "bg-amber-400 text-slate-900" : "bg-amber-100 text-amber-800"
                          }`}>
                            {savedCount}
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {(categoryFilter !== "all" || subcategoryFilter !== "all" || scopeFilter !== "all" || statusFilter !== "all" || feeFilter !== "all" || searchTerm) && (
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
                {(courses.length > 0 || statusFilter !== "all" || feeFilter !== "all") && (
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => {
                    setSearchTerm(""); setScopeFilter("all"); setStatusFilter("all"); setFeeFilter("all");
                  }}>
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCatalog.map(course => (
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
        {/* TAB 2: MY PUBLISHED COURSES (CREATOR STUDIO - FULL CRUD)                 */}
        {/* ========================================================================= */}
        {activeTab === "my-courses" && (
          <div className="space-y-6">

            {/* Breadcrumb if drilled-down */}
            {activeMyCourse && (
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium border-b pb-3">
                <button
                  onClick={() => { setActiveMyCourseId(null); setActiveChapterIdx(null); }}
                  className="text-primary hover:underline flex items-center gap-1 font-semibold"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to My Courses
                </button>
                <span className="text-muted-foreground">/</span>
                <span className="text-foreground font-bold truncate max-w-[300px]">
                  {activeMyCourse.title}
                </span>
              </div>
            )}

            {/* ── Drill-down View: Chapters & Lessons Manager ── */}
            {activeMyCourse ? (
              <div className="space-y-6">
                {/* Course Header Banner */}
                <div className="p-5 rounded-2xl border bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        activeMyCourse.isActive || activeMyCourse.status === "published"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {activeMyCourse.isActive || activeMyCourse.status === "published" ? "● Published" : "○ Draft"}
                      </span>
                      {activeMyCourse.category && (
                        <span className="inline-flex items-center rounded-full border bg-muted px-2 py-0.5 text-xs text-muted-foreground font-medium">
                          {activeMyCourse.category}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-foreground">{activeMyCourse.title}</h2>
                    <p className="text-xs text-muted-foreground">{activeMyCourse.description || "No description provided."}</p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleCourseStatus(activeMyCourse)}
                    >
                      {activeMyCourse.isActive || activeMyCourse.status === "published" ? (
                        <><EyeOff className="h-3.5 w-3.5 mr-1.5" /> Unpublish</>
                      ) : (
                        <><Eye className="h-3.5 w-3.5 mr-1.5" /> Publish</>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleOpenInPlaceChapter(null)}
                    >
                      <Plus className="h-4 w-4 mr-1.5" /> Add Chapter
                    </Button>
                  </div>
                </div>

                {/* Chapters & Lessons Listing */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    Chapters & Lessons Curriculum
                  </h3>

                  {(activeMyCourse.chapters || []).length === 0 ? (
                    <div className="p-8 text-center rounded-2xl border border-dashed bg-card space-y-3">
                      <FolderPlus className="h-10 w-10 text-muted-foreground mx-auto" />
                      <h4 className="font-semibold text-sm">No chapters added yet</h4>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Add your first chapter to start attaching video lessons and PDF documents.
                      </p>
                      <Button size="sm" onClick={() => handleOpenInPlaceChapter(null)}>
                        <Plus className="h-4 w-4 mr-1.5" /> Add Chapter
                      </Button>
                    </div>
                  ) : (
                    activeMyCourse.chapters.map((chap, cIdx) => (
                      <div key={chap._id || cIdx} className="rounded-2xl border bg-card overflow-hidden shadow-2xs">
                        <div className="p-4 bg-muted/30 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-primary tracking-wider uppercase bg-primary/10 px-2 py-0.5 rounded-full inline-block mb-1">
                              Chapter {cIdx + 1}
                            </span>
                            <h4 className="font-bold text-sm text-foreground truncate">{chap.title}</h4>
                            {chap.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{chap.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                            <Button
                              size="xs"
                              className="h-8 text-xs rounded-xl shadow-2xs"
                              onClick={() => handleOpenInPlaceLesson(cIdx)}
                            >
                              <Plus className="h-3.5 w-3.5 mr-1" /> Add Lesson
                            </Button>
                            <button
                              type="button"
                              onClick={() => handleOpenInPlaceChapter(cIdx)}
                              title="Edit Chapter"
                              className="h-8 w-8 rounded-xl border bg-background hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition shadow-2xs cursor-pointer"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteInPlaceChapter(cIdx)}
                              title="Delete Chapter"
                              className="h-8 w-8 rounded-xl border border-transparent hover:border-destructive/20 hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center transition shadow-2xs cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Lessons in this chapter */}
                        <div className="p-4 space-y-2">
                          {(chap.contents || []).length === 0 ? (
                            <p className="text-xs text-muted-foreground italic py-2">
                              No lessons in this chapter yet. Click &quot;Add Lesson&quot; to upload a video or PDF.
                            </p>
                          ) : (
                            chap.contents.map((lesson, lIdx) => (
                              <div
                                key={lesson._id || lIdx}
                                className="group flex items-center justify-between gap-3 p-3 rounded-xl border bg-card hover:bg-muted/30 hover:border-primary/20 transition shadow-2xs"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                                    lesson.type === "video"
                                      ? "bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-800"
                                      : "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800"
                                  }`}>
                                    {lesson.type === "video" ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-xs text-foreground truncate">{lesson.title}</p>
                                    <span className="text-[10px] font-mono text-muted-foreground uppercase">
                                      {lesson.type === "video" ? "🎥 Video Lesson" : "📄 PDF Document"}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {lesson.url && (
                                    <a
                                      href={resolveMediaUrl(lesson.url)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="h-7 px-2.5 rounded-lg border bg-background hover:bg-muted text-xs text-primary font-medium flex items-center gap-1 transition"
                                    >
                                      <ExternalLink className="h-3 w-3" /> Preview
                                    </a>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteInPlaceLesson(cIdx, lIdx)}
                                    className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition cursor-pointer"
                                    title="Delete Lesson"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* ── Course Studio Overview (Cards List) ── */
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <StatCard
                    label="My Courses Created"
                    value={String(myCourses.length)}
                    icon={GraduationCap}
                    tone="primary"
                  />
                  <StatCard
                    label="Published to Community"
                    value={String(myCourses.filter(c => c.isActive || c.status === "published").length)}
                    tone="success"
                  />
                  <StatCard
                    label="Drafts"
                    value={String(myCourses.filter(c => !c.isActive && c.status !== "published").length)}
                    tone="warning"
                  />
                </div>

                {/* Header & Create Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Course Studio</h2>
                    <p className="text-xs text-muted-foreground">
                      Create and publish courses that will be visible to all other RIFAH member businesses.
                    </p>
                  </div>

                  <Button onClick={handleOpenCreateModal} className="w-full sm:w-auto shadow-sm">
                    <Plus className="mr-2 h-4 w-4" /> Create Course
                  </Button>
                </div>

                {/* Courses List */}
                {isLoadingMyCourses ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-sm">Loading your courses…</p>
                  </div>
                ) : myCourses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed p-12 text-center bg-card space-y-3">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">You haven&apos;t created any courses yet</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      Share your industry expertise! Publish training videos and study guides for the RIFAH community.
                    </p>
                    <Button onClick={handleOpenCreateModal} className="mt-2">
                      <Plus className="mr-2 h-4 w-4" /> Create Your First Course
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {myCourses.map(course => {
                      const isPublished = course.isActive || course.status === "published";
                      const totalLessons = (course.chapters || []).reduce((acc, ch) => acc + (ch.contents?.length || 0), 0) + (course.contents?.length || 0);

                      return (
                        <div
                          key={course._id}
                          className="flex flex-col rounded-2xl border bg-card overflow-hidden shadow-xs hover:shadow-md transition"
                        >
                          <div className={`h-1.5 w-full ${isPublished ? "bg-emerald-500" : "bg-amber-400"}`} />

                          <div className="p-5 flex-1 flex flex-col">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                                isPublished
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}>
                                {isPublished ? "● Published" : "○ Draft"}
                              </span>

                              {course.category && (
                                <span className="inline-flex items-center rounded-full border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground truncate max-w-[140px]">
                                  {course.category}
                                </span>
                              )}
                            </div>

                            <h3 className="font-bold text-base line-clamp-2 mb-1.5 leading-snug">{course.title}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1">
                              {course.description || "No description provided."}
                            </p>

                            <div className="pt-3 border-t text-xs text-muted-foreground flex items-center justify-between">
                              <span>{(course.chapters || []).length} Chapters</span>
                              <span>{totalLessons} Lessons</span>
                            </div>
                          </div>

                          {/* Action Toolbar */}
                          <div className="px-5 pb-5 pt-0 flex items-center gap-2">
                            <Button
                              size="sm"
                              className="flex-1 shadow-2xs font-semibold text-xs h-9 rounded-xl"
                              onClick={() => {
                                setActiveMyCourseId(course._id);
                                setActiveChapterIdx(null);
                              }}
                            >
                              <Layers className="h-3.5 w-3.5 mr-1.5 text-primary-foreground/90" />
                              Manage Content
                            </Button>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditCourse(course)}
                                title="Edit course information"
                                className="h-9 w-9 rounded-xl border bg-background hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition shadow-2xs cursor-pointer"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => toggleCourseStatus(course)}
                                title={isPublished ? "Unpublish course (move to draft)" : "Publish course to community"}
                                className={cn(
                                  "h-9 w-9 rounded-xl border flex items-center justify-center transition shadow-2xs cursor-pointer",
                                  isPublished
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-800"
                                    : "bg-muted/60 text-muted-foreground border-border hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200"
                                )}
                              >
                                {isPublished ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                              </button>

                              <button
                                type="button"
                                onClick={() => setCourseToDelete(course)}
                                title="Delete course"
                                className="h-9 w-9 rounded-xl border border-transparent hover:border-destructive/20 hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center transition shadow-2xs cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CERTIFICATES TAB                                                  */}
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
                  Complete any course to earn your verified certificate of completion.
                </p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setActiveTab("courses")}>
                  <BookOpen className="h-4 w-4 mr-2" /> Browse Courses
                </Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  You have earned <span className="font-semibold text-foreground">{certificates.length}</span> certificate{certificates.length !== 1 ? "s" : ""}.
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {certificates.map(course => (
                    <CertCard
                      key={course._id}
                      cert={{
                        ...(course.certificate || {}),
                        courseId: { title: course.title, scope: course.scope || course.visibilityScope },
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

      {/* ========================================================================= */}
      {/* MODAL: ALL-IN-ONE COURSE CREATOR WITH FIELD-LEVEL VALIDATION              */}
      {/* ========================================================================= */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-amber-500" /> Create New Course
            </DialogTitle>
            <DialogDescription>
              Provide basic course details and attach chapters with video or PDF lessons.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* 1. Basic Info */}
            <div className="space-y-3 p-4 rounded-xl bg-muted/30 border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">1. Course Details</h4>
              
              {/* Course Title */}
              <div>
                <Label htmlFor="create-title" className="flex items-center justify-between">
                  <span>Course Title <span className="text-destructive">*</span></span>
                  {createErrors.title && (
                    <span className="text-[11px] font-semibold text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {createErrors.title}
                    </span>
                  )}
                </Label>
                <Input
                  id="create-title"
                  placeholder="e.g., Export Compliance Fundamentals for MSMEs"
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    clearCreateError("title");
                  }}
                  className={cn("mt-1", createErrors.title && "border-destructive focus-visible:ring-destructive")}
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="create-desc" className="flex items-center justify-between">
                  <span>Course Description <span className="text-destructive">*</span></span>
                  {createErrors.description && (
                    <span className="text-[11px] font-semibold text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {createErrors.description}
                    </span>
                  )}
                </Label>
                <Textarea
                  id="create-desc"
                  placeholder="Briefly describe what businesses will learn from this course (minimum 10 characters)..."
                  value={newDescription}
                  onChange={(e) => {
                    setNewDescription(e.target.value);
                    clearCreateError("description");
                  }}
                  className={cn("mt-1 resize-none h-20", createErrors.description && "border-destructive focus-visible:ring-destructive")}
                />
              </div>

              {/* Category & Subcategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="flex items-center justify-between">
                    <span>Category <span className="text-destructive">*</span></span>
                    {createErrors.category && (
                      <span className="text-[10px] font-semibold text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Required
                      </span>
                    )}
                  </Label>
                  <div className={cn("mt-1 rounded-xl", createErrors.category && "ring-1 ring-destructive rounded-xl")}>
                    <SearchableFilterSelect
                      value={newCategory}
                      onValueChange={(val) => {
                        setNewCategory(val);
                        setNewSubcategory("all");
                        clearCreateError("category");
                      }}
                      placeholder="Select Category"
                      searchPlaceholder="Search category..."
                      allLabel="All Categories"
                      options={[
                        { value: "All Categories", label: "🌐 All Categories (Universal)" },
                        ...mainCategories.map((c) => ({ value: c.name, label: c.name }))
                      ]}
                      className={cn("h-9 text-xs", createErrors.category && "border-destructive")}
                    />
                  </div>
                </div>

                <div>
                  <Label className="flex items-center justify-between">
                    <span>Subcategory <span className="text-muted-foreground text-xs font-normal">(Optional)</span></span>
                  </Label>
                  <div className="mt-1">
                    <SearchableFilterSelect
                      value={newSubcategory}
                      onValueChange={(val) => {
                        setNewSubcategory(val);
                        clearCreateError("subcategory");
                      }}
                      placeholder={
                        availableSubcategoriesForNew.length === 0
                          ? "No subcategories available"
                          : "Select Subcategory (Optional)"
                      }
                      searchPlaceholder="Search subcategory..."
                      allLabel="All / None (Optional)"
                      options={availableSubcategoriesForNew.map((sc) => ({ value: sc.name, label: sc.name }))}
                      disabled={availableSubcategoriesForNew.length === 0}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Chapters & Lessons Builder */}
            <div className="space-y-4 p-4 rounded-xl bg-muted/30 border">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    2. Curriculum (Chapters & Lessons) <span className="text-destructive">*</span>
                  </h4>
                  {createErrors.chapters && (
                    <p className="text-[11px] font-semibold text-destructive mt-0.5 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {createErrors.chapters}
                    </p>
                  )}
                  {createErrors.curriculum && (
                    <p className="text-[11px] font-semibold text-destructive mt-0.5 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {createErrors.curriculum}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{stagedChapters.length} Chapter{stagedChapters.length !== 1 ? "s" : ""}</span>
              </div>

              {/* Add Chapter Input */}
              <div className="space-y-1">
                <div className="flex gap-2">
                  <Input
                    placeholder="New Chapter Title (e.g. Chapter 2: Key Guidelines)"
                    value={newChapTitle}
                    onChange={(e) => {
                      setNewChapTitle(e.target.value);
                      clearCreateError("newChapter");
                    }}
                    className={cn("h-9 text-xs", createErrors.newChapter && "border-destructive")}
                  />
                  <Button size="sm" type="button" onClick={handleAddStagedChapter}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Chapter
                  </Button>
                </div>
                {createErrors.newChapter && (
                  <p className="text-[11px] font-semibold text-destructive">{createErrors.newChapter}</p>
                )}
              </div>

              {/* Chapter Tabs */}
              {stagedChapters.length > 0 && (
                <div className="space-y-3">
                  <div className="flex gap-1.5 overflow-x-auto pb-1 border-b">
                    {stagedChapters.map((ch, idx) => {
                      const hasChapterError = Boolean(createErrors[`chapter_${idx}`]);
                      return (
                        <div
                          key={idx}
                          onClick={() => setActiveStagedChapIdx(idx)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition flex items-center gap-1.5 shrink-0 ${
                            activeStagedChapIdx === idx
                              ? "bg-primary text-primary-foreground border-primary"
                              : hasChapterError
                              ? "bg-destructive/10 text-destructive border-destructive/50"
                              : "bg-background text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          <span>Chapter {idx + 1}</span>
                          {ch.contents?.length > 0 && (
                            <span className="text-[10px] opacity-80">({ch.contents.length})</span>
                          )}
                          {stagedChapters.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleRemoveStagedChapter(idx); }}
                              className="hover:text-destructive rounded-full p-0.5 ml-1"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Active Chapter Details & Lessons */}
                  {activeStagedChapIdx !== null && stagedChapters[activeStagedChapIdx] && (
                    <div className="p-3 bg-background rounded-xl border space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-xs text-foreground">
                          {stagedChapters[activeStagedChapIdx].title}
                        </p>
                        {createErrors[`chapter_${activeStagedChapIdx}`] && (
                          <span className="text-[11px] font-semibold text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> No lessons attached yet
                          </span>
                        )}
                      </div>

                      {/* Staged Lessons in this Chapter */}
                      {(stagedChapters[activeStagedChapIdx].contents || []).length > 0 ? (
                        <div className="space-y-1.5">
                          {stagedChapters[activeStagedChapIdx].contents.map((lesson, lIdx) => (
                            <div
                              key={lIdx}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-card border shadow-2xs text-xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                  lesson.type === "video" ? "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400" : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                                }`}>
                                  {lesson.type === "video" ? <Video className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                                </div>
                                <div className="min-w-0">
                                  <span className="font-semibold text-foreground truncate block">{lesson.title}</span>
                                  <span className="text-[10px] text-muted-foreground font-mono uppercase">
                                    {lesson.type === "video" ? "🎥 Video" : "📄 PDF"}
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveStagedLesson(activeStagedChapIdx, lIdx)}
                                className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition cursor-pointer"
                                title="Remove Lesson"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg border border-dashed text-center text-xs text-muted-foreground">
                          No lessons attached to this chapter. Use the form below to attach a video or PDF document.
                        </div>
                      )}

                      {/* Add Lesson Form */}
                      <div className="pt-2 border-t space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-semibold">Attach Lesson to this Chapter</Label>
                          {stagedLessonError && (
                            <span className="text-[11px] font-semibold text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> {stagedLessonError}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <Input
                            placeholder="Lesson Title *"
                            value={stagedLessonTitle}
                            onChange={(e) => {
                              setStagedLessonTitle(e.target.value);
                              if (stagedLessonError) setStagedLessonError("");
                            }}
                            className={cn("h-8 text-xs sm:col-span-2", stagedLessonError && !stagedLessonTitle && "border-destructive")}
                          />
                          <Select
                            value={stagedLessonType}
                            onValueChange={(val) => {
                              setStagedLessonType(val);
                              setStagedFile(null);
                              setStagedUrl("");
                              if (stagedLessonError) setStagedLessonError("");
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Lesson Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="video">🎥 Video Lesson</SelectItem>
                              <SelectItem value="pdf">📄 PDF Document</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* File Upload or Media URL */}
                        {stagedLessonType === "pdf" ? (
                          <div className="space-y-2">
                            {stagedFile ? (
                              <div className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/30 text-xs">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                                    <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-emerald-950 dark:text-emerald-100 truncate">{stagedFile.name}</p>
                                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                                      {(stagedFile.size / (1024 * 1024)).toFixed(2)} MB • PDF Attached Ready
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <label className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer underline px-1.5 py-0.5">
                                    Replace
                                    <input
                                      type="file"
                                      accept=".pdf,application/pdf"
                                      className="hidden"
                                      onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                          setStagedFile(e.target.files[0]);
                                          if (stagedLessonError) setStagedLessonError("");
                                        }
                                      }}
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => setStagedFile(null)}
                                    className="text-muted-foreground hover:text-destructive p-1 rounded-md transition"
                                    title="Remove File"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <label className={cn(
                                "flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 border-dashed bg-muted/20 hover:bg-muted/40 cursor-pointer transition text-center",
                                stagedLessonError && !stagedFile && "border-destructive bg-destructive/5"
                              )}>
                                <FileText className="h-5 w-5 text-emerald-600" />
                                <span className="text-xs font-semibold text-foreground">Click to upload PDF Document</span>
                                <span className="text-[10px] text-muted-foreground">Select PDF file up to 20MB</span>
                                <input
                                  type="file"
                                  accept=".pdf,application/pdf"
                                  className="hidden"
                                  onChange={(e) => {
                                    setStagedFile(e.target.files?.[0] || null);
                                    if (stagedLessonError) setStagedLessonError("");
                                  }}
                                />
                              </label>
                            )}

                            <div className="flex justify-end">
                              <Button
                                type="button"
                                size="sm"
                                className="h-8 text-xs"
                                disabled={isUploadingStaged}
                                onClick={handleAddStagedLesson}
                              >
                                {isUploadingStaged ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                                Add PDF Lesson
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row gap-2 items-center">
                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e) => {
                                setStagedFile(e.target.files?.[0] || null);
                                if (stagedLessonError) setStagedLessonError("");
                              }}
                              className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-primary/10 file:text-primary file:cursor-pointer flex-1 w-full"
                            />
                            <span className="text-xs text-muted-foreground">or</span>
                            <Input
                              placeholder="Direct Video URL (https://...)"
                              value={stagedUrl}
                              onChange={(e) => {
                                setStagedUrl(e.target.value);
                                if (stagedLessonError) setStagedLessonError("");
                              }}
                              className="h-8 text-xs flex-1 w-full"
                            />
                            <Button
                              type="button"
                              size="sm"
                              className="h-8 text-xs w-full sm:w-auto"
                              disabled={isUploadingStaged}
                              onClick={handleAddStagedLesson}
                            >
                              {isUploadingStaged ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                              Add Video
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsCreating(false)} disabled={savingCourse}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={() => handleFinalSaveCourse(false)} disabled={savingCourse}>
              {savingCourse ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
              Save as Draft
            </Button>
            <Button onClick={() => handleFinalSaveCourse(true)} disabled={savingCourse}>
              {savingCourse ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Sparkles className="h-4 w-4 mr-1.5" />}
              Publish Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: EDIT COURSE METADATA WITH VALIDATION                              */}
      {/* ========================================================================= */}
      <Dialog open={Boolean(courseToEdit)} onOpenChange={(open) => { if (!open) setCourseToEdit(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Course Details</DialogTitle>
            <DialogDescription>Update the title, category, or description of your course.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCourseInfo} className="space-y-3 py-2">
            <div>
              <Label htmlFor="edit-title" className="flex items-center justify-between">
                <span>Course Title <span className="text-destructive">*</span></span>
                {editErrors.title && (
                  <span className="text-[11px] font-semibold text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {editErrors.title}
                  </span>
                )}
              </Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => {
                  setEditTitle(e.target.value);
                  if (editErrors.title) setEditErrors(prev => ({ ...prev, title: undefined }));
                }}
                className={cn("mt-1", editErrors.title && "border-destructive")}
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-desc" className="flex items-center justify-between">
                <span>Description <span className="text-destructive">*</span></span>
                {editErrors.description && (
                  <span className="text-[11px] font-semibold text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {editErrors.description}
                  </span>
                )}
              </Label>
              <Textarea
                id="edit-desc"
                value={editDescription}
                onChange={(e) => {
                  setEditDescription(e.target.value);
                  if (editErrors.description) setEditErrors(prev => ({ ...prev, description: undefined }));
                }}
                className={cn("mt-1 resize-none h-20", editErrors.description && "border-destructive")}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="flex items-center justify-between">
                  <span>Category <span className="text-destructive">*</span></span>
                  {editErrors.category && (
                    <span className="text-[10px] font-semibold text-destructive">Required</span>
                  )}
                </Label>
                <div className={cn("mt-1 rounded-xl", editErrors.category && "ring-1 ring-destructive")}>
                  <SearchableFilterSelect
                    value={editCategory}
                    onValueChange={(val) => {
                      setEditCategory(val);
                      setEditSubcategory("all");
                      if (editErrors.category) setEditErrors(prev => ({ ...prev, category: undefined }));
                    }}
                    placeholder="Category"
                    searchPlaceholder="Search..."
                    allLabel="All Categories"
                    options={[
                      { value: "All Categories", label: "🌐 All Categories (Universal)" },
                      ...mainCategories.map((c) => ({ value: c.name, label: c.name }))
                    ]}
                    className={cn("h-9 text-xs", editErrors.category && "border-destructive")}
                  />
                </div>
              </div>
              <div>
                <Label className="flex items-center justify-between">
                  <span>Subcategory <span className="text-muted-foreground text-xs font-normal">(Optional)</span></span>
                </Label>
                <div className="mt-1">
                  <SearchableFilterSelect
                    value={editSubcategory}
                    onValueChange={(val) => {
                      setEditSubcategory(val);
                      if (editErrors.subcategory) setEditErrors(prev => ({ ...prev, subcategory: undefined }));
                    }}
                    placeholder={
                      availableSubcategoriesForEdit.length === 0
                        ? "No subcategories available"
                        : "Select Subcategory (Optional)"
                    }
                    searchPlaceholder="Search..."
                    allLabel="All / None (Optional)"
                    options={availableSubcategoriesForEdit.map((sc) => ({ value: sc.name, label: sc.name }))}
                    disabled={availableSubcategoriesForEdit.length === 0}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setCourseToEdit(null)} disabled={savingEditInfo}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingEditInfo}>
                {savingEditInfo ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT IN-PLACE CHAPTER WITH VALIDATION                        */}
      {/* ========================================================================= */}
      <Dialog open={isAddChapterOpen} onOpenChange={setIsAddChapterOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingChapterIdx !== null ? "Edit Chapter" : "Add Chapter"}</DialogTitle>
            <DialogDescription>
              {editingChapterIdx !== null ? "Update the chapter details." : "Add a new chapter to your course."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveInPlaceChapter} className="space-y-3 py-2">
            <div>
              <Label htmlFor="chap-title" className="flex items-center justify-between">
                <span>Chapter Title <span className="text-destructive">*</span></span>
                {inPlaceChapError && (
                  <span className="text-[11px] font-semibold text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {inPlaceChapError}
                  </span>
                )}
              </Label>
              <Input
                id="chap-title"
                placeholder="e.g., Chapter 2: Operational Workflows"
                value={chapInputTitle}
                onChange={(e) => {
                  setChapInputTitle(e.target.value);
                  if (inPlaceChapError) setInPlaceChapError("");
                }}
                className={cn("mt-1", inPlaceChapError && "border-destructive")}
                required
              />
            </div>
            <div>
              <Label htmlFor="chap-desc">Chapter Description (Optional)</Label>
              <Textarea
                id="chap-desc"
                placeholder="Brief outline of this chapter..."
                value={chapInputDesc}
                onChange={(e) => setChapInputDesc(e.target.value)}
                className="mt-1 resize-none h-20"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddChapterOpen(false)} disabled={savingChapterInPlace}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingChapterInPlace}>
                {savingChapterInPlace ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                {editingChapterIdx !== null ? "Save Chapter" : "Add Chapter"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: ADD IN-PLACE LESSON WITH VALIDATION                                */}
      {/* ========================================================================= */}
      <Dialog open={isAddLessonOpen} onOpenChange={setIsAddLessonOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Lesson</DialogTitle>
            <DialogDescription>Upload a video or PDF document for this chapter.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveInPlaceLesson} className="space-y-3 py-2">
            <div>
              <Label htmlFor="lesson-title" className="flex items-center justify-between">
                <span>Lesson Title <span className="text-destructive">*</span></span>
                {inPlaceLessonError && !lessonInputTitle.trim() && (
                  <span className="text-[11px] font-semibold text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Required
                  </span>
                )}
              </Label>
              <Input
                id="lesson-title"
                placeholder="e.g., 1.1 Overview & Best Practices"
                value={lessonInputTitle}
                onChange={(e) => {
                  setLessonInputTitle(e.target.value);
                  if (inPlaceLessonError) setInPlaceLessonError("");
                }}
                className={cn("mt-1", inPlaceLessonError && !lessonInputTitle.trim() && "border-destructive")}
                required
              />
            </div>

            <div>
              <Label>Lesson Type</Label>
              <Select
                value={lessonInputType}
                onValueChange={(val) => {
                  setLessonInputType(val);
                  setLessonInputFile(null);
                  setLessonInputUrl("");
                  if (inPlaceLessonError) setInPlaceLessonError("");
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">🎥 Video Lesson (MP4 / WebM)</SelectItem>
                  <SelectItem value="pdf">📄 PDF Document</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {lessonInputType === "pdf" ? (
              <div className="space-y-2">
                <Label className="flex items-center justify-between">
                  <span>Upload PDF Document <span className="text-destructive">*</span></span>
                  {inPlaceLessonError && lessonInputTitle.trim() && !lessonInputFile && (
                    <span className="text-[11px] font-semibold text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> PDF File required
                    </span>
                  )}
                </Label>
                {lessonInputFile ? (
                  <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/30 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-emerald-950 dark:text-emerald-100 truncate">{lessonInputFile.name}</p>
                        <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                          {(lessonInputFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to Attach
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <label className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer underline px-1.5 py-0.5">
                        Replace
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              setLessonInputFile(e.target.files[0]);
                              if (inPlaceLessonError) setInPlaceLessonError("");
                            }
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setLessonInputFile(null)}
                        className="text-muted-foreground hover:text-destructive p-1 rounded-md transition"
                        title="Remove File"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className={cn(
                    "flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl border-2 border-dashed bg-muted/20 hover:bg-muted/40 cursor-pointer transition text-center",
                    inPlaceLessonError && !lessonInputFile && "border-destructive bg-destructive/5"
                  )}>
                    <FileText className="h-6 w-6 text-emerald-600" />
                    <span className="text-xs font-semibold text-foreground">Click to upload PDF Document</span>
                    <span className="text-[10px] text-muted-foreground">Select PDF file up to 20MB (Direct URL removed for PDF)</span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        setLessonInputFile(e.target.files?.[0] || null);
                        if (inPlaceLessonError) setInPlaceLessonError("");
                      }}
                    />
                  </label>
                )}
              </div>
            ) : (
              <>
                <div>
                  <Label>Upload Video File</Label>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      setLessonInputFile(e.target.files?.[0] || null);
                      if (inPlaceLessonError) setInPlaceLessonError("");
                    }}
                    className="mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label htmlFor="lesson-url">Or Direct Video URL (YouTube / Vimeo / MP4)</Label>
                  <Input
                    id="lesson-url"
                    placeholder="https://..."
                    value={lessonInputUrl}
                    onChange={(e) => {
                      setLessonInputUrl(e.target.value);
                      if (inPlaceLessonError) setInPlaceLessonError("");
                    }}
                    className="mt-1"
                  />
                </div>
              </>
            )}

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddLessonOpen(false)} disabled={savingLessonInPlace || isUploadingLesson}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingLessonInPlace || isUploadingLesson}>
                {savingLessonInPlace || isUploadingLesson ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                Attach Lesson
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: DELETE COURSE CONFIRMATION                                         */}
      {/* ========================================================================= */}
      <Dialog open={Boolean(courseToDelete)} onOpenChange={(open) => { if (!open) setCourseToDelete(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Delete Course
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete &quot;{courseToDelete?.title}&quot;? All chapters and attached lessons will be removed.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button variant="outline" onClick={() => setCourseToDelete(null)} disabled={deletingCourse}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCourse} disabled={deletingCourse}>
              {deletingCourse ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Trash2 className="h-4 w-4 mr-1.5" />}
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
