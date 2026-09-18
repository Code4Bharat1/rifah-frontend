"use client";
import {
  GraduationCap, PlayCircle, CheckCircle2, ChevronRight,
  Search, Award, Download, Loader2, BookOpen, Trophy, X
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Button } from "@shared/components/ui/button";
import { Progress } from "@shared/components/ui/progress";
import { useCourses } from "@shared/hooks/use-rifah-api";
import { courseApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/media";

// ── Scope config
const SCOPES = [
  { key: "all", label: "All Courses" },
  { key: "central", label: "🏛️ Central HQ", match: ["central", "centre"] },
  { key: "state", label: "📍 State", match: ["state"] },
  { key: "chapter", label: "🤝 Chapter", match: ["chapter"] },
];

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "inprogress", label: "⏳ In Progress" },
  { key: "completed", label: "🎓 Completed" },
  { key: "notstarted", label: "New" },
];

const SCOPE_BADGE = {
  central: "bg-violet-100 text-violet-700 border-violet-200",
  centre: "bg-violet-100 text-violet-700 border-violet-200",
  state: "bg-blue-100 text-blue-700 border-blue-200",
  chapter: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const SCOPE_LABEL = {
  central: "🏛️ Central HQ",
  centre: "🏛️ Central HQ",
  state: "📍 State",
  chapter: "🤝 Chapter",
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

// ── Certificate download
async function downloadCert(course, setLoading) {
  setLoading(true);
  try {
    const certUrl = course?.certificate?.pdfUrl || course?.certificate?.fileUrl;
    if (certUrl) {
      window.open(resolveMediaUrl(certUrl), "_blank");
      return;
    }
    const res = await courseApi.getCertificates({ courseId: course._id });
    const certs = res?.data || res;
    const list = Array.isArray(certs) ? certs : (Array.isArray(certs?.data) ? certs.data : []);
    const target = list.find(c => String(c.courseId?._id || c.courseId) === String(course._id)) || list[0];
    const url = target?.pdfUrl || target?.fileUrl || target?.url;
    if (url) {
      window.open(resolveMediaUrl(url), "_blank");
    } else {
      toast.error("Certificate is being generated. Please try again in a moment.");
    }
  } catch {
    toast.error("Failed to download certificate");
  } finally {
    setLoading(false);
  }
}

// ── Course card
function CourseCard({ course }) {
  const [certLoading, setCertLoading] = useState(false);
  const { percent, completed, total, status } = getCourseProgress(course);
  const scopeStr = getScopeStr(course);
  const scopeBadgeCls = SCOPE_BADGE[scopeStr] || "bg-slate-100 text-slate-600 border-slate-200";
  const scopeLabel = SCOPE_LABEL[scopeStr] || "📚 Training";
  const chapters = course?.chapters || [];
  const isCompleted = status === "completed";
  const isStarted = status === "inprogress";

  return (
    <div className="group flex flex-col rounded-2xl border bg-card overflow-hidden shadow-xs hover:shadow-md hover:border-primary/30 transition-all duration-200">
      {/* Cover gradient bar */}
      <div className={`h-1.5 w-full ${
        isCompleted
          ? "bg-gradient-to-r from-emerald-400 to-teal-500"
          : isStarted
          ? "bg-gradient-to-r from-blue-400 to-indigo-500"
          : "bg-gradient-to-r from-slate-200 to-slate-300"
      }`} />

      <div className="p-5 flex-1 flex flex-col">
        {/* Scope + status badges */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${scopeBadgeCls}`}>
            {scopeLabel}
          </span>
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

        <h3 className="font-bold text-base line-clamp-2 mb-2 leading-snug">{course.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {course.description || "No description provided."}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
          {chapters.length > 0 && (
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {chapters.length} Chapters
            </span>
          )}
          <span className="flex items-center gap-1">
            <PlayCircle className="h-3.5 w-3.5" />
            {total} Lessons
          </span>
          {completed > 0 && (
            <span className="flex items-center gap-1 text-emerald-600 font-medium ml-auto">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {completed}/{total}
            </span>
          )}
        </div>

        {/* Progress bar (only if started) */}
        {(isStarted || isCompleted) && (
          <div className="mb-4">
            <div className="flex justify-between text-[11px] mb-1 text-muted-foreground">
              <span>{percent}% complete</span>
            </div>
            <Progress
              value={percent}
              className={`h-1.5 rounded-full ${isCompleted ? "[&>div]:bg-emerald-500" : "[&>div]:bg-blue-500"}`}
            />
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="px-5 pb-5 flex gap-2">
        {isCompleted ? (
          <>
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={`/biz/lms/${course._id}`}>
                <BookOpen className="h-3.5 w-3.5 mr-1.5" /> Review
              </Link>
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              onClick={() => downloadCert(course, setCertLoading)}
              disabled={certLoading}
            >
              {certLoading
                ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                : <Download className="h-3.5 w-3.5 mr-1.5" />}
              Certificate
            </Button>
          </>
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

  const handleDownload = () => {
    if (!certUrl) { toast.error("Certificate URL not found"); return; }
    setCertLoading(true);
    window.open(resolveMediaUrl(certUrl), "_blank");
    setTimeout(() => setCertLoading(false), 1000);
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

// ── Main component
export function BizLms() {
  const { data: coursesData, isLoading } = useCourses();
  const courses = Array.isArray(coursesData?.data)
    ? coursesData.data
    : Array.isArray(coursesData) ? coursesData : [];

  const [activeTab, setActiveTab] = useState("courses"); // "courses" | "certificates"
  const [searchTerm, setSearchTerm] = useState("");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // ── Derive certificates from completed courses
  const certificates = courses.filter(c => c?.progress?.isCompleted);

  // ── Filter courses
  const filtered = courses.filter(course => {
    const q = searchTerm.toLowerCase();
    if (q && !course.title?.toLowerCase().includes(q) && !course.description?.toLowerCase().includes(q)) {
      return false;
    }
    if (scopeFilter !== "all") {
      const scopeDef = SCOPES.find(s => s.key === scopeFilter);
      if (scopeDef?.match && !scopeDef.match.includes(getScopeStr(course))) return false;
    }
    if (statusFilter !== "all") {
      const { status } = getCourseProgress(course);
      if (status !== statusFilter) return false;
    }
    return true;
  });

  const completedCount = courses.filter(c => c?.progress?.isCompleted).length;
  const inProgressCount = courses.filter(c => {
    const { status } = getCourseProgress(c);
    return status === "inprogress";
  }).length;

  return (
    <AppShell
      role="business"
      title="Learning Center"
      subtitle="Access training materials and courses provided by RIFAH"
    >
      <div className="space-y-6">

        {/* ── Stats row */}
        {!isLoading && courses.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Courses", value: courses.length, icon: BookOpen, color: "text-primary bg-primary/10" },
              { label: "In Progress", value: inProgressCount, icon: PlayCircle, color: "text-blue-600 bg-blue-100" },
              { label: "Completed", value: completedCount, icon: Trophy, color: "text-emerald-600 bg-emerald-100" },
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

        {/* ── Top navigation tabs */}
        <div className="flex gap-1 border-b">
          <button
            onClick={() => setActiveTab("courses")}
            className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === "courses"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="h-4 w-4 inline mr-1.5 -mt-0.5" />
            Browse Courses
          </button>
          <button
            onClick={() => setActiveTab("certificates")}
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

        {/* ── COURSES TAB */}
        {activeTab === "courses" && (
          <div className="space-y-5">

            {/* Search + Scope filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search courses…"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 text-sm border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
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

              {/* Scope pills */}
              <div className="flex gap-2 flex-wrap">
                {SCOPES.map(s => (
                  <button
                    key={s.key}
                    onClick={() => setScopeFilter(s.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      scopeFilter === s.key
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Status pills */}
              <div className="flex gap-2 flex-wrap">
                {STATUS_FILTERS.map(s => (
                  <button
                    key={s.key}
                    onClick={() => setStatusFilter(s.key)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                      statusFilter === s.key
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background text-muted-foreground border-border hover:border-foreground/30"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm">Loading courses…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border rounded-2xl">
                <div className="bg-muted p-5 rounded-full mb-4">
                  <GraduationCap className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {courses.length === 0 ? "No Courses Available" : "No Courses Found"}
                </h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                  {courses.length === 0
                    ? "There are currently no training materials assigned to your business. Check back later."
                    : "Try adjusting your search or filters."}
                </p>
                {courses.length > 0 && (
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => {
                    setSearchTerm(""); setScopeFilter("all"); setStatusFilter("all");
                  }}>
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map(course => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CERTIFICATES TAB */}
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
                  Complete a course to earn your certificate of completion.
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
    </AppShell>
  );
}
