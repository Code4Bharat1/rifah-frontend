"use client";
import {
  ArrowLeft, PlayCircle, Play, FileText, CheckCircle2, Download,
  Video, Loader2, ChevronLeft, ChevronRight, Award, BookOpen, Trophy, X, ExternalLink, Star,
  Lock, ShieldCheck, CreditCard, Sparkles, Check
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Progress } from "@shared/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@shared/components/ui/dialog";
import { useCourse } from "@shared/hooks/use-rifah-api";
import { courseApi, paymentApi } from "@shared/lib/api-services";
import { useAuth } from "@shared/providers/auth-provider";
import { resolveMediaUrl } from "@shared/lib/media";
import { cn } from "@shared/lib/utils";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const SCOPE_LABELS = {
  central: { label: "🏛️ Central HQ", color: "bg-violet-100 text-violet-700 border-violet-200" },
  state: { label: "📍 State Training", color: "bg-blue-100 text-blue-700 border-blue-200" },
  chapter: { label: "🤝 My Chapter", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  centre: { label: "🏛️ Central HQ", color: "bg-violet-100 text-violet-700 border-violet-200" },
  business: { label: "🏢 Business Community", color: "bg-amber-100 text-amber-700 border-amber-200" },
};

function getScopeTag(course) {
  const s = (course?.scope || course?.visibilityScope || "").toLowerCase();
  if (s === "business" && course?.businessId?.name) {
    return {
      label: `🏢 ${course.businessId.name}`,
      color: "bg-amber-100 text-amber-700 border-amber-200",
    };
  }
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

// ── Premium Paywall Card for Locked / Paid Courses
function CoursePaywallCard({ course, totalContents, chaptersCount, price, onEnroll, isEnrolling }) {
  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-violet-500/30 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 sm:p-8 flex flex-col justify-between shadow-2xl text-white">
      {/* Ambient background decoration */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-600/15 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Badge */}
      <div className="relative z-10 flex items-center justify-between gap-3 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-sm">
          <Lock className="h-3.5 w-3.5 text-amber-400" /> Premium Paid Course
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">
            ₹{price.toLocaleString("en-IN")}
          </span>
          <span className="text-xs font-medium text-slate-300">one-time</span>
        </div>
      </div>

      {/* Center Body */}
      <div className="relative z-10 my-auto py-2 space-y-2">
        <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight line-clamp-1 drop-shadow-xs">
          Unlock Full Course Access
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 max-w-xl">
          {course.description || "Enroll today to get lifetime access to all lessons, curriculum resources, and earn a verified completion certificate."}
        </p>

        {/* Feature badges row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-xs text-slate-200">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 backdrop-blur-xs">
            <Video className="h-4 w-4 text-violet-400 shrink-0" />
            <span className="truncate">{totalContents} Lessons ({chaptersCount} Modules)</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 backdrop-blur-xs">
            <Award className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="truncate">Official Certificate</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 backdrop-blur-xs col-span-2 sm:col-span-1">
            <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0" />
            <span className="truncate">Lifetime Access</span>
          </div>
        </div>
      </div>

      {/* Bottom CTA & Trust strip */}
      <div className="relative z-10 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Secured via Razorpay • UPI, Cards & NetBanking</span>
        </div>

        <Button
          onClick={onEnroll}
          disabled={isEnrolling}
          className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all text-sm gap-2"
        >
          {isEnrolling ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Processing…
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" /> Enroll Now • ₹{price.toLocaleString("en-IN")}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export function BizCourseDetail() {
  const { id } = useParams();
  const { data: courseResp, isLoading, refetch } = useCourse(id);
  const { user } = useAuth();
  const [activeContent, setActiveContent] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [marking, setMarking] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState(false);

  // ── Checkout & Enrollment States
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);

  // ── Correct data unwrapping: API returns { success, data: { course, progress, certificate } }
  const course = courseResp?.data?.course || courseResp?.course || courseResp?.data || courseResp;
  const progressData = courseResp?.data?.progress || courseResp?.progress;
  const certificate = courseResp?.data?.certificate || courseResp?.certificate;

  // ── Paid & Enrollment calculations
  const isPaid = Boolean(course?.isPaid);
  const price = Number(course?.price || 0);
  const isEnrolled = Boolean(course?.isEnrolled);
  const isPaywallActive = isPaid && !isEnrolled;

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

  // ── Star / Save for later state
  const [isStarred, setIsStarred] = useState(false);

  useEffect(() => {
    if (course?._id) {
      const idStr = String(course._id);
      try {
        const stored = JSON.parse(localStorage.getItem("rifah_saved_course_ids") || "[]");
        if (stored.includes(idStr) || course.progress?.isStarred) {
          setIsStarred(true);
        }
      } catch (e) {}
    }
  }, [course]);

  const handleToggleStar = async () => {
    if (!course?._id) return;
    const idStr = String(course._id);
    const nextState = !isStarred;
    setIsStarred(nextState);

    try {
      const stored = JSON.parse(localStorage.getItem("rifah_saved_course_ids") || "[]");
      const nextList = nextState
        ? Array.from(new Set([...stored, idStr]))
        : stored.filter(id => id !== idStr);
      localStorage.setItem("rifah_saved_course_ids", JSON.stringify(nextList));
    } catch (e) {}

    toast.success(nextState ? "Course saved for later!" : "Course removed from Saved");

    try {
      await courseApi.toggleStar(course._id);
    } catch (err) {}
  };

  // ── Auto-select first content if course is accessible
  useEffect(() => {
    if (allContents.length > 0 && !activeContent && !isPaywallActive) {
      setActiveContent(allContents[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course, isPaywallActive]);

  const activeIndex = activeContent
    ? allContents.findIndex(c => String(c._id) === String(activeContent._id))
    : -1;
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < allContents.length - 1;

  // ── Initiate Razorpay Checkout Flow
  const handleStartPayment = async () => {
    if (isEnrolling) return;
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error("Failed to load Razorpay payment gateway. Please check your internet connection.");
      return;
    }

    setIsEnrolling(true);
    try {
      const orderRes = await paymentApi.createOrder({
        courseId: course._id,
        amount: price,
        currency: "INR",
        itemType: "Course",
        description: `Course Enrollment: ${course.title}`,
      });

      const orderData = orderRes?.data || orderRes;
      if (!orderData?.orderId) {
        throw new Error(orderRes?.message || "Failed to initialize payment order.");
      }

      const options = {
        key: orderData.keyId || "rzp_test_TTykh9OVkLKNHl",
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "RIFAH LMS",
        description: `Course: ${course.title}`,
        order_id: orderData.orderId,
        prefill: {
          name: user?.name || user?.ownerName || "",
          email: user?.email || "",
          contact: user?.phone || user?.mobile || "",
        },
        theme: {
          color: "#7c3aed",
        },
        handler: async function (response) {
          try {
            toast.loading("Verifying enrollment payment...", { id: "course-enroll" });
            await paymentApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: price,
              currency: "INR",
              itemType: "Course",
              courseId: course._id,
              description: `Course Enrollment: ${course.title}`,
            });

            toast.dismiss("course-enroll");
            toast.success("🎉 Enrollment successful! Course content is now unlocked.", { duration: 6000 });
            setEnrollModalOpen(false);
            const refetched = await refetch();
            const refetchedCourse = refetched?.data?.course || refetched?.data;
            const updatedContents = [];
            (refetchedCourse?.chapters || []).forEach(ch => {
              if (Array.isArray(ch.contents)) updatedContents.push(...ch.contents);
            });
            if (updatedContents.length > 0) {
              setActiveContent(updatedContents[0]);
            }
          } catch (vErr) {
            toast.dismiss("course-enroll");
            toast.error(vErr.message || "Payment verification failed. Please contact support.");
          } finally {
            setIsEnrolling(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsEnrolling(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.message || "Failed to start payment.");
      setIsEnrolling(false);
    }
  };

  const handleMarkWatched = async (contentId) => {
    if (isPaywallActive) {
      toast.error("Please enroll in this course to track progress.");
      return;
    }
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

  const handleViewCertificate = async () => {
    let targetUrl = certificate?.pdfUrl || certificate?.fileUrl || certificate?.url;
    if (targetUrl) {
      window.open(resolveMediaUrl(targetUrl), "_blank");
      return;
    }
    try {
      const res = await courseApi.getCertificates({ courseId: course._id });
      const certs = res?.data || res;
      const certList = Array.isArray(certs) ? certs : (Array.isArray(certs?.data) ? certs.data : []);
      const target = certList.find(c => String(c.courseId?._id || c.courseId) === String(course._id)) || certList[0];
      targetUrl = target?.pdfUrl || target?.fileUrl || target?.url;
      if (targetUrl) {
        window.open(resolveMediaUrl(targetUrl), "_blank");
        return;
      }
    } catch {
      // fallback to HTML certificate preview
    }

    const recipientName = courseResp?.data?.business?.owner?.name || courseResp?.data?.business?.contactPerson || courseResp?.data?.business?.name || "Member";
    const bName = courseResp?.data?.business?.name || "";
    const q = new URLSearchParams({
      type: "completion",
      name: recipientName,
      course: course.title || "Course",
      business: bName,
      chapter: course.chapter || "",
      scope: course.scope || "centre",
      state: course.state || "",
      modules: String(course.chapters?.length || 1),
      accent: "#00875a",
      autoprint: "false",
    });
    window.open(`/certificate.html?${q.toString()}`, "_blank");
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

        {/* Pricing & Enrollment Status */}
        {isPaid ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:border-violet-800 dark:text-violet-300 px-2.5 py-0.5 text-xs font-bold shadow-2xs">
            💳 Paid Course • ₹{price.toLocaleString("en-IN")}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-semibold">
            🎁 Free Course
          </span>
        )}

        {isPaid && isEnrolled && (
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300 px-2.5 py-0.5 text-xs font-semibold">
            <CheckCircle2 className="h-3 w-3" /> Enrolled
          </span>
        )}

        {isCompleted && (
          <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
            <Trophy className="h-3 w-3" /> Completed
          </span>
        )}

        {isPaywallActive && (
          <Button
            size="sm"
            onClick={() => setEnrollModalOpen(true)}
            className="h-8 text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-xs px-3.5 gap-1.5"
          >
            <Lock className="h-3.5 w-3.5" /> Enroll Now (₹{price.toLocaleString("en-IN")})
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleStar}
          className={cn(
            "ml-auto text-xs gap-1.5 h-8 font-medium transition-all",
            isStarred
              ? "bg-amber-50 text-amber-600 border-amber-300 hover:bg-amber-100 dark:bg-amber-950/40 dark:border-amber-800"
              : "text-muted-foreground hover:text-amber-500 hover:border-amber-300"
          )}
        >
          <Star className={cn("h-3.5 w-3.5", isStarred ? "fill-amber-400 text-amber-500" : "")} />
          <span>{isStarred ? "Starred / Saved" : "Save for later"}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT: Player + Info */}
        <div className="lg:col-span-2 space-y-4">

          {/* Paywall or Video / PDF Player */}
          {(() => {
            if (isPaywallActive) {
              return (
                <CoursePaywallCard
                  course={course}
                  totalContents={totalContents}
                  chaptersCount={chapters.length}
                  price={price}
                  onEnroll={() => setEnrollModalOpen(true)}
                  isEnrolling={isEnrolling}
                />
              );
            }

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
          {!isPaywallActive && allContents.length > 1 && (
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

          {/* Active content info or Paywall description */}
          {activeContent && !isPaywallActive ? (
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
          ) : isPaywallActive ? (
            <Panel>
              <div className="p-4 sm:p-5 flex items-center justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <Lock className="h-4 w-4 text-amber-500" />
                    <span>Course Content Locked</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Enroll now for ₹{price.toLocaleString("en-IN")} to unlock full access to all {totalContents} lessons and download your verified completion certificate.
                  </p>
                </div>
                <Button
                  onClick={() => setEnrollModalOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-9"
                >
                  <CreditCard className="h-3.5 w-3.5 mr-1.5" /> Enroll for ₹{price.toLocaleString("en-IN")}
                </Button>
              </div>
            </Panel>
          ) : null}

          {/* 🎓 Certificate celebration card */}
          {(isCompleted || certificate) && (
            <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-surface p-5 sm:p-6 shadow-lg">
              {/* decorative sparkles */}
              <div className="absolute top-0 right-0 text-6xl opacity-10 select-none pointer-events-none pr-4 pt-2">🏆</div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <Award className="h-7 w-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-lg leading-tight flex items-center gap-2">
                      <span>🎉 Course Completed!</span>
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">Verified</span>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Your official Certificate of Completion is ready.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
                  <Button
                    variant="outline"
                    className="rounded-xl font-semibold border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 gap-1.5 shadow-2xs"
                    onClick={handleViewCertificate}
                  >
                    <ExternalLink className="h-4 w-4" /> View / Print
                  </Button>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md gap-1.5"
                    onClick={handleDownloadCertificate}
                    disabled={downloadingCert}
                  >
                    {downloadingCert
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Download className="h-4 w-4" />}
                    Download PDF
                  </Button>
                </div>
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
                <span className="text-2xl font-bold text-primary">{isPaywallActive ? "0%" : `${progressPercent}%`}</span>
                <span className="text-xs text-muted-foreground">
                  {isPaywallActive ? "Locked" : `${completedCount} / ${totalContents} lessons`}
                </span>
              </div>
              <Progress value={isPaywallActive ? 0 : progressPercent} className="h-2.5 rounded-full" />

              {isPaywallActive ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 p-3 text-center">
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center justify-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" /> Enrollment Required
                  </p>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-400 mt-0.5">
                    Enroll to track lesson progress & earn your certificate.
                  </p>
                </div>
              ) : isCompleted && !certificate ? (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center">
                  <p className="text-xs font-medium text-emerald-700">
                    🎓 Certificate earned! Download it above.
                  </p>
                </div>
              ) : !isCompleted && totalContents > 0 ? (
                <p className="text-xs text-muted-foreground text-center mt-3">
                  {totalContents - completedCount} lesson{totalContents - completedCount !== 1 ? "s" : ""} remaining
                </p>
              ) : null}
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
                            const isLocked = isPaywallActive || Boolean(item.isLocked);
                            return (
                              <button
                                key={item._id || index}
                                onClick={() => {
                                  if (isLocked) {
                                    setEnrollModalOpen(true);
                                    return;
                                  }
                                  setActiveContent(item);
                                  setShowPdfModal(false);
                                }}
                                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                                  isActive && !isLocked
                                    ? "bg-primary/8 border-l-2 border-primary"
                                    : "border-l-2 border-transparent hover:bg-muted/50"
                                }`}
                              >
                                <div className={`shrink-0 rounded-full flex items-center justify-center w-6 h-6 text-xs font-bold ${
                                  isDone
                                    ? "bg-emerald-100 text-emerald-600"
                                    : isLocked
                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                                    : isActive
                                    ? "bg-primary/15 text-primary"
                                    : "bg-muted text-muted-foreground"
                                }`}>
                                  {isDone ? (
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  ) : isLocked ? (
                                    <Lock className="h-3 w-3" />
                                  ) : (
                                    <Play className="h-2.5 w-2.5 fill-current ml-0.5" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs font-medium leading-tight truncate ${isActive && !isLocked ? "text-primary" : "text-foreground"}`}>
                                    {chapIdx + 1}.{index + 1} {item.title}
                                  </p>
                                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                                    {isLocked ? (
                                      <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                                        <Lock className="h-2.5 w-2.5" /> Locked
                                      </span>
                                    ) : (
                                      <>
                                        <PlayCircle className="h-2.5 w-2.5" />
                                        <span>Lesson</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                {isLocked && (
                                  <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded px-1.5 py-0.5">
                                    Locked
                                  </span>
                                )}
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
                    const isLocked = isPaywallActive || Boolean(item.isLocked);
                    return (
                      <button
                        key={item._id || index}
                        onClick={() => {
                          if (isLocked) {
                            setEnrollModalOpen(true);
                            return;
                          }
                          setActiveContent(item);
                          setShowPdfModal(false);
                        }}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                          isActive && !isLocked
                            ? "bg-primary/8 border-l-2 border-primary"
                            : "border-l-2 border-transparent hover:bg-muted/50"
                        }`}
                      >
                        <div className={`shrink-0 rounded-full flex items-center justify-center w-6 h-6 text-xs ${
                          isDone
                            ? "bg-emerald-100 text-emerald-600"
                            : isLocked
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                            : isActive
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {isDone ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : isLocked ? (
                            <Lock className="h-3 w-3" />
                          ) : (
                            <Play className="h-2.5 w-2.5 fill-current ml-0.5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium leading-tight truncate ${isActive && !isLocked ? "text-primary" : "text-foreground"}`}>
                            {index + 1}. {item.title}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                            {isLocked ? (
                              <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                                <Lock className="h-2.5 w-2.5" /> Locked
                              </span>
                            ) : (
                              <>
                                <PlayCircle className="h-2.5 w-2.5" />
                                <span>Lesson</span>
                              </>
                            )}
                          </div>
                        </div>
                        {isLocked && (
                          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded px-1.5 py-0.5">
                            Locked
                          </span>
                        )}
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

      {/* ── MODAL: Course Enrollment Checkout ── */}
      <Dialog open={enrollModalOpen} onOpenChange={setEnrollModalOpen}>
        <DialogContent className="max-w-md sm:max-w-lg p-0 overflow-hidden rounded-2xl">
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white border-b border-white/10">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Lock className="h-3.5 w-3.5" /> Course Enrollment
            </div>
            <h3 className="text-xl font-bold leading-snug">{course.title}</h3>
            <p className="text-xs text-slate-300 mt-1 line-clamp-2">{course.description}</p>
          </div>

          <div className="p-6 space-y-4">
            {/* What's included */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">What's included in your enrollment:</h4>
              <div className="space-y-2 text-sm text-foreground">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Full curriculum: <strong>{totalContents} lessons</strong> across <strong>{chapters.length} chapters</strong></span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>High-definition video lessons and downloadable course materials</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Verified <strong>RIFAH Certificate of Completion</strong> upon graduation</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Full lifetime access for your business profile</span>
                </div>
              </div>
            </div>

            {/* Pricing summary box */}
            <div className="rounded-xl border bg-muted/40 p-4 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Course Fee</span>
                <span>₹{price.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Taxes & Gateway Fee</span>
                <span className="text-emerald-600 font-medium">Included</span>
              </div>
              <div className="pt-2 border-t flex justify-between font-bold text-base text-foreground">
                <span>Total Amount</span>
                <span className="text-primary font-black text-lg">₹{price.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Learner Info */}
            <div className="text-xs text-muted-foreground bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
              <div>
                Enrolling as <strong className="text-foreground">{user?.name || "Business Member"}</strong> ({user?.email || "Account Holder"})
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-0 flex gap-2 sm:gap-3">
            <Button variant="outline" onClick={() => setEnrollModalOpen(false)} disabled={isEnrolling}>
              Cancel
            </Button>
            <Button
              onClick={handleStartPayment}
              disabled={isEnrolling}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold gap-2 shadow-md"
            >
              {isEnrolling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Preparing Payment…
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" /> Pay & Unlock Now (₹{price.toLocaleString("en-IN")})
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
