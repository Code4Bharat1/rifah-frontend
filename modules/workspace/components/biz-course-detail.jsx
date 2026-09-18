"use client";
import {
  ArrowLeft, PlayCircle, Play, FileText, CheckCircle2, Download,
  Video, Loader2, ChevronLeft, ChevronRight, Award, BookOpen, Trophy, X
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Progress } from "@shared/components/ui/progress";
import { useCourse } from "@shared/hooks/use-rifah-api";
import { courseApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/media";

const SCOPE_LABELS = {
  central: { label: "🏛️ Central HQ", color: "bg-violet-100 text-violet-700 border-violet-200" },
  state: { label: "📍 State Training", color: "bg-blue-100 text-blue-700 border-blue-200" },
  chapter: { label: "🤝 My Chapter", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  centre: { label: "🏛️ Central HQ", color: "bg-violet-100 text-violet-700 border-violet-200" },
};

function getScopeTag(course) {
  const s = (course?.scope || course?.visibilityScope || "").toLowerCase();
  return SCOPE_LABELS[s] || { label: "📚 Training", color: "bg-slate-100 text-slate-600 border-slate-200" };
}

// ── Stylish PDF Document Card (Shown in player area)
function PdfDocumentCard({ activeContent, onOpen }) {
  const [downloading, setDownloading] = useState(false);
  const mediaUrl = activeContent?.url || activeContent?.fileUrl || "";
  const pdfUrl = resolveMediaUrl(mediaUrl);

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (!pdfUrl) return;
    setDownloading(true);
    try {
      const cleanTitle = (activeContent.title || "Document").replace(/[^a-zA-Z0-9_-]/g, "_");
      const filename = `${cleanTitle}.pdf`;
      const res = await fetch(pdfUrl);
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
      toast.success("Document downloaded!");
    } catch {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.setAttribute("download", `${activeContent.title || "Document"}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      onClick={onOpen}
      className="group relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 flex flex-col items-center justify-center text-center shadow-xl cursor-pointer hover:border-primary/60 transition-all duration-300"
    >
      {/* Ambient glow */}
      <div className="absolute w-44 h-44 bg-primary/20 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/30 transition-colors" />

      {/* Document Icon Badge */}
      <div className="relative z-10 w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-white mb-4 group-hover:scale-105 group-hover:bg-primary group-hover:border-primary transition-all duration-300 shadow-lg">
        <FileText className="h-10 w-10 text-white/90 group-hover:text-white" />
      </div>

      {/* Title & Metadata */}
      <div className="relative z-10 max-w-md space-y-1.5 mb-5">
        <h3 className="text-xl font-bold text-white leading-snug line-clamp-1 group-hover:text-primary-foreground transition-colors">
          {activeContent.title || "Course Document"}
        </h3>
        <p className="text-xs text-slate-300/80 font-medium tracking-wide">
          Course Material • Click to Read Full Document
        </p>
      </div>

      {/* Interactive Action Buttons */}
      <div className="relative z-10 flex items-center gap-3">
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 shadow-lg shadow-primary/25 rounded-xl gap-2"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
        >
          <Play className="h-4 w-4 fill-current" /> Read Document
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-xl gap-2 backdrop-blur-sm"
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download
        </Button>
      </div>
    </div>
  );
}

// ── Clean In-App PDF Pop-up Modal (Full original content)
function PdfModalViewer({ activeContent, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const mediaUrl = activeContent?.url || activeContent?.fileUrl || "";
  const pdfUrl = resolveMediaUrl(mediaUrl);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleDownload = async () => {
    if (!pdfUrl) return;
    setDownloading(true);
    try {
      const cleanTitle = (activeContent.title || "Document").replace(/[^a-zA-Z0-9_-]/g, "_");
      const filename = `${cleanTitle}.pdf`;
      const res = await fetch(pdfUrl);
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
      toast.success("Document downloaded!");
    } catch {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.setAttribute("download", `${activeContent.title || "Document"}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl border shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Top Bar ── */}
        <div className="px-5 py-3.5 bg-card border-b flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-foreground truncate leading-snug">
                {activeContent.title || "Document"}
              </h3>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Course Study Document
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs gap-1.5 rounded-lg"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">Download</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
              onClick={onClose}
              title="Close (Esc)"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* ── Modal Body: Original PDF Content ── */}
        <div className="w-full flex-1 relative bg-slate-900 flex flex-col overflow-hidden">
          <iframe
            src={`${pdfUrl}#toolbar=1`}
            className="w-full h-full border-0"
            title={activeContent.title || "PDF Viewer"}
          />
        </div>
      </div>
    </div>
  );
}

export function BizCourseDetail() {
  const { id } = useParams();
  const { data: courseResp, isLoading, refetch } = useCourse(id);
  const [activeContent, setActiveContent] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [marking, setMarking] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState(false);

  // ── Correct data unwrapping: API returns { success, data: { course, progress, certificate } }
  const course = courseResp?.data?.course || courseResp?.course || courseResp?.data || courseResp;
  const progressData = courseResp?.data?.progress || courseResp?.progress;
  const certificate = courseResp?.data?.certificate || courseResp?.certificate;

  // ── Aggregate all lessons
  const chapters = course?.chapters || [];
  const allContents = [];
  chapters.forEach(ch => {
    if (Array.isArray(ch.contents)) allContents.push(...ch.contents);
  });
  if (Array.isArray(course?.contents)) allContents.push(...course.contents);

  // ── Progress calculations
  const completedIds = (progressData?.completedContents || []).map(c => String(c.contentId || c));
  const isCompleted = progressData?.isCompleted === true;
  const totalContents = allContents.length;
  const completedCount = completedIds.length;
  const progressPercent = totalContents === 0 ? 0 : Math.round((completedCount / totalContents) * 100);

  // ── Auto-select first content
  useEffect(() => {
    if (allContents.length > 0 && !activeContent) {
      setActiveContent(allContents[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course]);

  const activeIndex = activeContent
    ? allContents.findIndex(c => String(c._id) === String(activeContent._id))
    : -1;
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < allContents.length - 1;

  const handleMarkWatched = async (contentId) => {
    if (!contentId || completedIds.includes(String(contentId))) return;
    setMarking(true);
    try {
      await courseApi.markWatched(course._id, contentId);
      toast.success("Marked as completed!");
      refetch();
    } catch {
      toast.error("Failed to mark as completed");
    } finally {
      setMarking(false);
    }
  };

  const handleDownloadCertificate = async () => {
    setDownloadingCert(true);
    try {
      let targetUrl = certificate?.pdfUrl || certificate?.fileUrl || certificate?.url;
      if (!targetUrl) {
        const res = await courseApi.getCertificates({ courseId: course._id });
        const certs = res?.data || res;
        const certList = Array.isArray(certs) ? certs : (Array.isArray(certs?.data) ? certs.data : []);
        const target = certList.find(c => String(c.courseId?._id || c.courseId) === String(course._id)) || certList[0];
        targetUrl = target?.pdfUrl || target?.fileUrl || target?.url;
      }

      if (!targetUrl) {
        toast.error("Certificate is being generated. Please try again in a moment.");
        return;
      }

      const cleanTitle = (course.title || "Course").replace(/[^a-zA-Z0-9_-]/g, "_");
      const filename = `${cleanTitle}_Certificate.pdf`;
      const fullUrl = resolveMediaUrl(targetUrl);

      // Perform direct download without navigating away
      try {
        const res = await fetch(fullUrl);
        if (!res.ok) throw new Error("Direct fetch failed");
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
        link.href = fullUrl;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch {
      toast.error("Failed to download certificate");
    } finally {
      setDownloadingCert(false);
    }
  };

  // ── Loading
  if (isLoading) {
    return (
      <AppShell role="business" title="Loading Course..." backTo="/biz/lms">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  // ── Not found
  if (!course || (!course.title && !course._id)) {
    return (
      <AppShell role="business" title="Course Not Found" backTo="/biz/lms">
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <h3 className="text-lg font-semibold">Course Unavailable</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mb-4">
            This course does not exist or you do not have permission to view it.
          </p>
          <Button asChild><Link href="/biz/lms">Return to Courses</Link></Button>
        </div>
      </AppShell>
    );
  }

  const scopeTag = getScopeTag(course);

  return (
    <AppShell
      role="business"
      title={course.title || "Course"}
      subtitle="Course Module"
      backTo="/biz/lms"
    >
      {/* ── Course header */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground hover:text-foreground">
          <Link href="/biz/lms">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Courses
          </Link>
        </Button>
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${scopeTag.color}`}>
          {scopeTag.label}
        </span>
        {isCompleted && (
          <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
            <Trophy className="h-3 w-3" /> Completed
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT: Player + Info */}
        <div className="lg:col-span-2 space-y-4">

          {/* Video / PDF Player */}
          {(() => {
            const isPdf = activeContent && (activeContent.type === "pdf" || activeContent.contentType === "pdf");
            const contentType = activeContent ? (activeContent.type || activeContent.contentType || "video") : null;
            const mediaUrl = activeContent ? (activeContent.url || activeContent.fileUrl || "") : "";

            if (!activeContent) {
              return (
                <div className="rounded-2xl border bg-black aspect-video flex flex-col items-center justify-center gap-3 text-white/40 shadow-lg">
                  <PlayCircle className="h-16 w-16" />
                  <p className="text-sm">Select a lesson to start</p>
                </div>
              );
            }

            if (isPdf) {
              return (
                <PdfDocumentCard
                  activeContent={activeContent}
                  onOpen={() => {
                    setShowPdfModal(true);
                    handleMarkWatched(activeContent._id);
                  }}
                />
              );
            }

            if (contentType === "video") {
              return (
                <div className="rounded-2xl overflow-hidden border bg-black aspect-video flex items-center justify-center relative shadow-lg">
                  <video
                    key={activeContent._id}
                    controls
                    className="w-full h-full object-contain"
                    src={resolveMediaUrl(mediaUrl)}
                    onEnded={() => handleMarkWatched(activeContent._id)}
                  >
                    Your browser does not support HTML video.
                  </video>
                </div>
              );
            }

            return (
              <div className="rounded-2xl border bg-black aspect-video flex items-center justify-center text-white/50 text-sm">
                Unsupported content type
              </div>
            );
          })()}

          {/* Prev / Next navigation */}
          {allContents.length > 1 && (
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                size="sm"
                disabled={!hasPrev}
                onClick={() => {
                  setActiveContent(allContents[activeIndex - 1]);
                  setShowPdfModal(false);
                }}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                {activeIndex + 1} / {allContents.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasNext}
                onClick={() => {
                  setActiveContent(allContents[activeIndex + 1]);
                  setShowPdfModal(false);
                }}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}

          {/* Active content info */}
          {activeContent && (
            <Panel>
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold leading-tight">{activeContent.title}</h2>
                    {activeContent.description && (
                      <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                        {activeContent.description}
                      </p>
                    )}
                  </div>
                  {completedIds.includes(String(activeContent._id)) && (
                    <div className="shrink-0 flex items-center gap-1.5 text-emerald-600 font-medium bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-sm">
                      <CheckCircle2 className="h-4 w-4" /> Completed
                    </div>
                  )}
                </div>
              </div>
            </Panel>
          )}

          {/* 🎓 Certificate celebration card */}
          {(isCompleted || certificate) && (
            <div className="relative overflow-hidden rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-6 shadow-lg">
              {/* decorative sparkles */}
              <div className="absolute top-0 right-0 text-6xl opacity-10 select-none pointer-events-none pr-4 pt-2">🏆</div>
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                  <Award className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-amber-900 text-lg leading-tight">🎉 Course Completed!</h3>
                  <p className="text-sm text-amber-700 mt-0.5">
                    Your certificate of completion is ready to download.
                  </p>
                </div>
                <Button
                  className="shrink-0 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md"
                  onClick={handleDownloadCertificate}
                  disabled={downloadingCert}
                >
                  {downloadingCert
                    ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    : <Download className="h-4 w-4 mr-2" />}
                  Download Certificate
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Sidebar */}
        <div className="space-y-5">

          {/* Progress card */}
          <Panel>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">Course Progress</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-primary">{progressPercent}%</span>
                <span className="text-xs text-muted-foreground">{completedCount} / {totalContents} lessons</span>
              </div>
              <Progress value={progressPercent} className="h-2.5 rounded-full" />

              {isCompleted && !certificate && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center">
                  <p className="text-xs font-medium text-emerald-700">
                    🎓 Certificate earned! Download it above.
                  </p>
                </div>
              )}

              {!isCompleted && totalContents > 0 && (
                <p className="text-xs text-muted-foreground text-center mt-3">
                  {totalContents - completedCount} lesson{totalContents - completedCount !== 1 ? "s" : ""} remaining
                </p>
              )}
            </div>
          </Panel>

          {/* Curriculum */}
          <Panel className="overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-sm">Course Curriculum</span>
              <span className="ml-auto text-xs text-muted-foreground">{totalContents} lessons</span>
            </div>
            <div className="max-h-[560px] overflow-y-auto no-scrollbar">
              {chapters.length > 0 ? (
                <div className="divide-y">
                  {chapters.map((chapter, chapIdx) => {
                    const chapterContents = chapter.contents || [];
                    return (
                      <div key={chapIdx}>
                        <div className="bg-muted/40 px-4 py-2.5 flex items-center justify-between sticky top-0 z-10">
                          <span className="text-[11px] font-bold text-foreground uppercase tracking-wide">
                            Chapter {chapIdx + 1}: {chapter.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{chapterContents.length} lessons</span>
                        </div>
                        <div className="divide-y">
                          {chapterContents.map((item, index) => {
                            const isDone = completedIds.includes(String(item._id));
                            const isActive = String(activeContent?._id) === String(item._id);
                            return (
                              <button
                                key={item._id || index}
                                onClick={() => {
                                  setActiveContent(item);
                                  setShowPdfModal(false);
                                }}
                                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                                  isActive
                                    ? "bg-primary/8 border-l-2 border-primary"
                                    : "border-l-2 border-transparent hover:bg-muted/50"
                                }`}
                              >
                                <div className={`shrink-0 rounded-full flex items-center justify-center w-6 h-6 text-xs font-bold ${
                                  isDone
                                    ? "bg-emerald-100 text-emerald-600"
                                    : isActive
                                    ? "bg-primary/15 text-primary"
                                    : "bg-muted text-muted-foreground"
                                }`}>
                                  {isDone ? (
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  ) : (
                                    <Play className="h-2.5 w-2.5 fill-current ml-0.5" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs font-medium leading-tight truncate ${isActive ? "text-primary" : "text-foreground"}`}>
                                    {chapIdx + 1}.{index + 1} {item.title}
                                  </p>
                                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                                    <PlayCircle className="h-2.5 w-2.5" />
                                    <span>Lesson</span>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : allContents.length > 0 ? (
                <div className="divide-y">
                  {allContents.map((item, index) => {
                    const isDone = completedIds.includes(String(item._id));
                    const isActive = String(activeContent?._id) === String(item._id);
                    return (
                      <button
                        key={item._id || index}
                        onClick={() => {
                          setActiveContent(item);
                          setShowPdfModal(false);
                        }}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                          isActive
                            ? "bg-primary/8 border-l-2 border-primary"
                            : "border-l-2 border-transparent hover:bg-muted/50"
                        }`}
                      >
                        <div className={`shrink-0 rounded-full flex items-center justify-center w-6 h-6 text-xs ${
                          isDone
                            ? "bg-emerald-100 text-emerald-600"
                            : isActive
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {isDone ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <Play className="h-2.5 w-2.5 fill-current ml-0.5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium leading-tight truncate ${isActive ? "text-primary" : "text-foreground"}`}>
                            {index + 1}. {item.title}
                          </p>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                            <PlayCircle className="h-2.5 w-2.5" />
                            <span>Lesson</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  No contents added to this course yet.
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>

      {/* ── In-App PDF Pop-up Modal (Full Original Content) ── */}
      {showPdfModal && activeContent && (
        <PdfModalViewer
          activeContent={activeContent}
          onClose={() => setShowPdfModal(false)}
        />
      )}
    </AppShell>
  );
}
