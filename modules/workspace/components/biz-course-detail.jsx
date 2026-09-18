"use client";
import { ArrowLeft, PlayCircle, FileText, CheckCircle2, Download, Video, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Progress } from "@shared/components/ui/progress";
import { useCourse } from "@shared/hooks/use-rifah-api";
import { courseApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/media";

export function BizCourseDetail() {
  const { id } = useParams();
  const { data: courseResp, isLoading, refetch } = useCourse(id);
  const [activeContent, setActiveContent] = useState(null);
  const [marking, setMarking] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState(false);

  const course = courseResp?.data || courseResp;
  
  if (isLoading) {
    return (
      <AppShell role="business" title="Loading Course..." backTo="/biz/lms">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  if (!course) {
    return (
      <AppShell role="business" title="Course Not Found" backTo="/biz/lms">
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <h3 className="text-lg font-semibold text-foreground">Course Unavailable</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mb-4">
            The course you are looking for does not exist or you do not have permission to view it.
          </p>
          <Button asChild>
            <Link href="/biz/lms">Return to Courses</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  // Find progress if available
  const progressData = courseResp?.progress;
  const isCompleted = progressData?.isCompleted;
  const completedIds = progressData?.completedContents || [];
  
  const chapters = course.chapters || [];

  // Aggregate all lessons across chapters + legacy flat contents
  const allContents = [];
  if (chapters.length > 0) {
    chapters.forEach(ch => {
      if (Array.isArray(ch.contents)) {
        allContents.push(...ch.contents);
      }
    });
  }
  if (Array.isArray(course.contents)) {
    allContents.push(...course.contents);
  }

  const totalContents = allContents.length;
  const completedCount = completedIds.length;
  const progressPercent = totalContents === 0 ? 0 : Math.round((completedCount / totalContents) * 100);

  // Set first content as active initially if none selected
  if (allContents.length > 0 && !activeContent) {
    setActiveContent(allContents[0]);
  }

  const handleMarkWatched = async (contentId) => {
    if (completedIds.includes(contentId)) return;
    setMarking(true);
    try {
      await courseApi.markWatched(course._id, contentId);
      toast.success("Marked as completed!");
      refetch();
    } catch (err) {
      toast.error("Failed to mark as completed");
    } finally {
      setMarking(false);
    }
  };

  const handleDownloadCertificate = async () => {
    setDownloadingCert(true);
    try {
      const res = await courseApi.getCertificates({ courseId: course._id });
      const certs = res.data || res;
      const certList = Array.isArray(certs) ? certs : (Array.isArray(certs?.data) ? certs.data : []);
      const targetCert = certList.find(c => String(c.courseId?._id || c.courseId) === String(course._id)) || certList[0];
      const certUrl = targetCert?.pdfUrl || targetCert?.fileUrl || targetCert?.url;
      if (certUrl) {
        window.open(resolveMediaUrl(certUrl), "_blank");
      } else {
        toast.error("Certificate generation is in progress. Please try again in a moment.");
      }
    } catch (err) {
      toast.error("Failed to download certificate");
    } finally {
      setDownloadingCert(false);
    }
  };

  return (
    <AppShell 
      role="business" 
      title={course.title} 
      subtitle="Course Module" 
      backTo="/biz/lms"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Area (Video/PDF Player) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl overflow-hidden border bg-black aspect-video flex items-center justify-center relative shadow-sm">
            {activeContent ? (() => {
              const contentType = activeContent.type || activeContent.contentType || "video";
              const mediaUrl = activeContent.url || activeContent.fileUrl || "";
              
              if (contentType === "video") {
                return (
                  <video 
                    controls 
                    className="w-full h-full"
                    src={resolveMediaUrl(mediaUrl)}
                    onEnded={() => handleMarkWatched(activeContent._id)}
                  >
                    Your browser does not support HTML video.
                  </video>
                );
              }

              if (contentType === "pdf") {
                return (
                  <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-500 p-4">
                    <FileText className="h-16 w-16 mb-4 text-slate-300" />
                    <p className="font-medium text-slate-700">PDF Document Material</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">Click below to open and study the document.</p>
                    <Button 
                      variant="outline" 
                      onClick={() => window.open(resolveMediaUrl(mediaUrl), '_blank')}
                    >
                      Open PDF in new tab
                    </Button>
                  </div>
                );
              }

              return <div className="text-white">Unsupported content type</div>;
            })() : (
              <div className="text-white/50">No content selected</div>
            )}
          </div>

          {activeContent && (
            <Panel>
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold">{activeContent.title}</h2>
                    <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                      {activeContent.description}
                    </p>
                  </div>
                  {!completedIds.includes(activeContent._id) ? (
                    <Button 
                      onClick={() => handleMarkWatched(activeContent._id)}
                      disabled={marking}
                    >
                      {marking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                      Mark as Completed
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 text-success font-medium bg-success/10 px-3 py-1.5 rounded-full text-sm">
                      <CheckCircle2 className="h-4 w-4" /> Completed
                    </div>
                  )}
                </div>
              </div>
            </Panel>
          )}
        </div>

        {/* Sidebar: Course Index & Progress */}
        <div className="space-y-6">
          <Panel title="Course Progress">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{progressPercent}% Completed</span>
                <span className="text-xs text-muted-foreground">{completedCount} of {totalContents}</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              
              {isCompleted && (
                <div className="mt-6 rounded-lg border border-success/30 bg-success/5 p-4 text-center">
                  <div className="mx-auto bg-success/20 w-12 h-12 rounded-full flex items-center justify-center mb-3 text-success">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-success mb-1">Course Completed!</h4>
                  <p className="text-xs text-muted-foreground mb-4">You have successfully completed all modules in this course.</p>
                  <Button 
                    className="w-full bg-success hover:bg-success/90 text-white" 
                    onClick={handleDownloadCertificate}
                    disabled={downloadingCert}
                  >
                    {downloadingCert ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                    Download Certificate
                  </Button>
                </div>
              )}
            </div>
          </Panel>

          <Panel title="Course Curriculum" className="overflow-hidden">
            <div className="max-h-[520px] overflow-y-auto no-scrollbar">
              {chapters.length > 0 ? (
                <div className="divide-y">
                  {chapters.map((chapter, chapIdx) => {
                    const chapterContents = chapter.contents || [];
                    return (
                      <div key={chapIdx} className="border-b last:border-b-0">
                        <div className="bg-muted/30 px-4 py-2 text-xs font-bold text-foreground flex items-center justify-between">
                          <span>Chapter {chapIdx + 1}: {chapter.title}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">{chapterContents.length} items</span>
                        </div>
                        <div className="divide-y">
                          {chapterContents.map((item, index) => {
                            const isCompletedItem = completedIds.includes(item._id);
                            const isActive = activeContent?._id === item._id;

                            return (
                              <button
                                key={item._id || index}
                                onClick={() => setActiveContent(item)}
                                className={`w-full text-left p-3.5 hover:bg-muted transition-colors flex items-start gap-3 ${
                                  isActive ? 'bg-primary/5 border-l-2 border-primary' : 'border-l-2 border-transparent'
                                }`}
                              >
                                <div className={`mt-0.5 shrink-0 ${isCompletedItem ? 'text-success' : 'text-muted-foreground'}`}>
                                  {isCompletedItem ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                  ) : (
                                    (item.type === 'video' || item.contentType === 'video') ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs font-medium leading-tight mb-0.5 ${isActive ? 'text-primary' : 'text-foreground'}`}>
                                    {chapIdx + 1}.{index + 1} {item.title}
                                  </p>
                                  <div className="flex items-center text-[10px] text-muted-foreground">
                                    <span className="capitalize">{item.type || item.contentType || 'material'}</span>
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
                    const isCompletedItem = completedIds.includes(item._id);
                    const isActive = activeContent?._id === item._id;

                    return (
                      <button
                        key={item._id || index}
                        onClick={() => setActiveContent(item)}
                        className={`w-full text-left p-3.5 hover:bg-muted transition-colors flex items-start gap-3 ${
                          isActive ? 'bg-primary/5 border-l-2 border-primary' : 'border-l-2 border-transparent'
                        }`}
                      >
                        <div className={`mt-0.5 shrink-0 ${isCompletedItem ? 'text-success' : 'text-muted-foreground'}`}>
                          {isCompletedItem ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            (item.type === 'video' || item.contentType === 'video') ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium leading-tight mb-0.5 ${isActive ? 'text-primary' : 'text-foreground'}`}>
                            {index + 1}. {item.title}
                          </p>
                          <div className="flex items-center text-[10px] text-muted-foreground">
                            <span className="capitalize">{item.type || item.contentType || 'material'}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No contents added to this course yet.
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
