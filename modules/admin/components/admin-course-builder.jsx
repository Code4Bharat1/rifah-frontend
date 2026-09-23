"use client";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit, 
  Loader2, 
  PlayCircle, 
  FileText, 
  Video, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  FolderPlus, 
  Layers, 
  BookOpen,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Textarea } from "@shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { useCourse, useCategories } from "@shared/hooks/use-rifah-api";
import { courseApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/api-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@shared/components/ui/dialog";

export function AdminCourseBuilder({ role = "admin" }) {
  const { id } = useParams();
  const router = useRouter();
  const { data: courseResp, isLoading, refetch } = useCourse(id);

  const courseData = courseResp?.data?.course || courseResp?.course || courseResp?.data || courseResp;

  // Chapter Modals
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [editingChapterIndex, setEditingChapterIndex] = useState(null);
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterDescription, setChapterDescription] = useState("");
  const [savingChapter, setSavingChapter] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState(null);

  // Lesson / Content Modals
  const [activeChapterIndexForLesson, setActiveChapterIndexForLesson] = useState(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonType, setLessonType] = useState("video"); // 'video' | 'pdf'
  const [selectedFile, setSelectedFile] = useState(null);
  const [customMediaUrl, setCustomMediaUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingLesson, setIsSavingLesson] = useState(false);

  const { data: categoriesData } = useCategories();
  const allCategories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.categories || []);
  const mainCategories = allCategories.filter((c) => !c.parent);

  // Course Edit & Delete Modals
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editScope, setEditScope] = useState("centre");
  const [editCategory, setEditCategory] = useState("all");
  const [editSubcategory, setEditSubcategory] = useState("all");
  const [savingCourse, setSavingCourse] = useState(false);
  const [isDeleteCourseOpen, setIsDeleteCourseOpen] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState(false);

  // Robust subcategory extractor matching parent name or parent id with trimming and case-insensitivity
  const getSubcategories = (catNameOrId) => {
    if (!catNameOrId || catNameOrId === "all") return [];
    const cat = allCategories.find((c) => c.name === catNameOrId || c._id === catNameOrId);
    const targetName = (cat?.name || catNameOrId).trim().toLowerCase();
    const targetId = cat?._id ? String(cat._id) : "";
    return allCategories.filter((c) => {
      if (!c.parent) return false;
      const p = String(c.parent).trim().toLowerCase();
      return p === targetName || (targetId && String(c.parent) === targetId);
    });
  };

  const availableSubcategoriesForEdit = getSubcategories(editCategory);

  // Collapsed Chapters State
  const [collapsedChapters, setCollapsedChapters] = useState({});

  if (isLoading) {
    return (
      <AppShell role={role} title="Loading Course..." backTo={`/${role === 'admin' ? 'admin' : role === 'state_admin' ? 'state-admin' : 'chapter-admin'}/lms`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  if (!courseData || !courseData._id) {
    return (
      <AppShell role={role} title="Course Not Found" backTo={`/${role === 'admin' ? 'admin' : role === 'state_admin' ? 'state-admin' : 'chapter-admin'}/lms`}>
        <div className="p-12 text-center">
          <p className="text-muted-foreground mb-4">The requested course could not be found.</p>
          <Button asChild>
            <Link href={`/${role === 'admin' ? 'admin' : role === 'state_admin' ? 'state-admin' : 'chapter-admin'}/lms`}>
              Back to LMS Courses
            </Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const chapters = Array.isArray(courseData.chapters) ? courseData.chapters : [];
  
  // Aggregate stats
  let totalVideos = 0;
  let totalPdfs = 0;
  chapters.forEach(ch => {
    (ch.contents || []).forEach(item => {
      if (item.type === "video") totalVideos++;
      if (item.type === "pdf") totalPdfs++;
    });
  });
  // Also count legacy flat contents if any
  (courseData.contents || []).forEach(item => {
    if (item.type === "video") totalVideos++;
    if (item.type === "pdf") totalPdfs++;
  });
  const totalLessons = totalVideos + totalPdfs;
  const isPublished = courseData.isActive || courseData.status === "published";

  const backUrl = `/${role === 'admin' ? 'admin' : role === 'state_admin' ? 'state-admin' : 'chapter-admin'}/lms`;

  const toggleChapterCollapse = (idx) => {
    setCollapsedChapters(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // --- Course Level Actions ---
  const handleOpenEditCourse = () => {
    setEditTitle(courseData.title || "");
    setEditDescription(courseData.description || "");
    setEditScope(courseData.scope || courseData.visibilityScope || "centre");
    setEditCategory(courseData.category || "all");
    setEditSubcategory(courseData.subcategory || "all");
    setIsEditCourseOpen(true);
  };

  const handleSaveCourseMetadata = async (e) => {
    if (e) e.preventDefault();
    if (!editTitle.trim()) return toast.error("Course title is required.");
    setSavingCourse(true);
    try {
      await courseApi.update(courseData._id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        category: editCategory === "all" ? "" : editCategory,
        subcategory: editSubcategory === "all" ? "" : editSubcategory,
        scope: editScope,
        visibilityScope: editScope,
      });
      toast.success("Course details updated");
      setIsEditCourseOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to update course");
    } finally {
      setSavingCourse(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!isPublished && totalLessons === 0) {
      toast.error("Please add at least 1 chapter with content before publishing.");
      return;
    }
    try {
      const nextStatus = !isPublished;
      await courseApi.update(courseData._id, {
        isActive: nextStatus,
        status: nextStatus ? "published" : "draft"
      });
      toast.success(nextStatus ? "Course published!" : "Course moved to draft");
      refetch();
    } catch (err) {
      toast.error("Failed to update course status");
    }
  };

  const handleDeleteCourse = async () => {
    setDeletingCourse(true);
    try {
      await courseApi.delete(courseData._id);
      toast.success("Course deleted successfully");
      router.push(backUrl);
    } catch (err) {
      toast.error(err.message || "Failed to delete course");
      setDeletingCourse(false);
    }
  };

  // --- Chapter Actions ---
  const handleOpenChapterModal = (index = null) => {
    if (index !== null && chapters[index]) {
      setEditingChapterIndex(index);
      setChapterTitle(chapters[index].title || "");
      setChapterDescription(chapters[index].description || "");
    } else {
      setEditingChapterIndex(null);
      setChapterTitle("");
      setChapterDescription("");
    }
    setIsChapterModalOpen(true);
  };

  const handleSaveChapter = async (e) => {
    if (e) e.preventDefault();
    if (!chapterTitle.trim()) return toast.error("Chapter title is required.");

    setSavingChapter(true);
    try {
      let updatedChapters = [...chapters];
      if (editingChapterIndex !== null) {
        // Edit existing
        updatedChapters[editingChapterIndex] = {
          ...updatedChapters[editingChapterIndex],
          title: chapterTitle.trim(),
          description: chapterDescription.trim(),
        };
      } else {
        // Add new
        updatedChapters.push({
          title: chapterTitle.trim(),
          description: chapterDescription.trim(),
          order: updatedChapters.length + 1,
          contents: [],
        });
      }

      await courseApi.update(courseData._id, { chapters: updatedChapters });
      toast.success(editingChapterIndex !== null ? "Chapter updated" : "Chapter created");
      setIsChapterModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to save chapter");
    } finally {
      setSavingChapter(false);
    }
  };

  const handleDeleteChapter = async () => {
    if (chapterToDelete === null) return;
    try {
      const updatedChapters = chapters
        .filter((_, idx) => idx !== chapterToDelete)
        .map((ch, idx) => ({ ...ch, order: idx + 1 }));

      await courseApi.update(courseData._id, { chapters: updatedChapters });
      toast.success("Chapter deleted");
      setChapterToDelete(null);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to delete chapter");
    }
  };

  // --- Lesson (Video/PDF) Actions ---
  const handleOpenAddLesson = (chapterIndex) => {
    setActiveChapterIndexForLesson(chapterIndex);
    setLessonTitle("");
    setLessonType("video");
    setSelectedFile(null);
    setCustomMediaUrl("");
  };

  const handleAddLesson = async (e) => {
    if (e) e.preventDefault();
    if (!lessonTitle.trim()) return toast.error("Lesson title is required.");

    let fileUrl = customMediaUrl.trim();

    if (selectedFile) {
      setIsUploading(true);
      try {
        const uploadRes = await courseApi.uploadContent(selectedFile);
        fileUrl = uploadRes?.data?.url || uploadRes?.url;
        if (!fileUrl) throw new Error("Upload did not return a valid file URL.");
      } catch (err) {
        toast.error(err.message || "Failed to upload file");
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    if (!fileUrl) {
      return toast.error("Please select a file to upload or enter a direct media URL.");
    }

    setIsSavingLesson(true);
    try {
      const targetChapter = chapters[activeChapterIndexForLesson];
      const existingContents = targetChapter.contents || [];

      const newContent = {
        title: lessonTitle.trim(),
        type: lessonType,
        url: fileUrl,
        order: existingContents.length + 1,
      };

      const updatedChapters = [...chapters];
      updatedChapters[activeChapterIndexForLesson] = {
        ...targetChapter,
        contents: [...existingContents, newContent],
      };

      await courseApi.update(courseData._id, { chapters: updatedChapters });
      toast.success("Lesson added successfully");
      setActiveChapterIndexForLesson(null);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to add lesson");
    } finally {
      setIsSavingLesson(false);
    }
  };

  const handleDeleteLesson = async (chapterIndex, lessonIndex) => {
    try {
      const targetChapter = chapters[chapterIndex];
      const updatedContents = (targetChapter.contents || [])
        .filter((_, idx) => idx !== lessonIndex)
        .map((item, idx) => ({ ...item, order: idx + 1 }));

      const updatedChapters = [...chapters];
      updatedChapters[chapterIndex] = {
        ...targetChapter,
        contents: updatedContents,
      };

      await courseApi.update(courseData._id, { chapters: updatedChapters });
      toast.success("Lesson removed");
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to remove lesson");
    }
  };

  return (
    <AppShell role={role} title="Course Curriculum Builder" subtitle={courseData.title} backTo={backUrl}>
      <div className="space-y-6 max-w-5xl mx-auto">
        
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl border bg-card shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                {courseData.scope || courseData.visibilityScope || "Centre"} Scope
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${isPublished ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning-foreground'}`}>
                {isPublished ? 'Published' : 'Draft'}
              </span>
              {courseData.category && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  {courseData.category}
                </span>
              )}
              {courseData.subcategory && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  {courseData.subcategory}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-foreground">{courseData.title}</h1>
            <p className="text-sm text-muted-foreground line-clamp-2">{courseData.description || "No description provided."}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleOpenEditCourse}>
              <Edit className="h-4 w-4 mr-1.5" /> Edit Info
            </Button>
            <Button 
              variant={isPublished ? "secondary" : "default"} 
              size="sm" 
              onClick={handleTogglePublish}
            >
              {isPublished ? (
                <><EyeOff className="h-4 w-4 mr-1.5" /> Move to Draft</>
              ) : (
                <><Eye className="h-4 w-4 mr-1.5" /> Publish Course</>
              )}
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setIsDeleteCourseOpen(true)}>
              <Trash2 className="h-4 w-4 mr-1.5" /> Delete
            </Button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total Chapters" value={String(chapters.length)} icon={Layers} tone="primary" />
          <StatCard label="Total Lessons" value={String(totalLessons)} icon={BookOpen} tone="neutral" />
          <StatCard label="Video Lessons" value={String(totalVideos)} icon={Video} tone="info" />
          <StatCard label="PDF Handouts" value={String(totalPdfs)} icon={FileText} tone="warning" />
        </div>

        {/* Chapters & Curriculum Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" /> Curriculum Chapters ({chapters.length})
              </h2>
              <p className="text-xs text-muted-foreground">Create chapters, then upload video lessons and PDF study materials inside each chapter.</p>
            </div>
            <Button onClick={() => handleOpenChapterModal()}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Chapter
            </Button>
          </div>

          {chapters.length === 0 ? (
            <div className="rounded-xl border border-dashed p-12 text-center bg-card/50">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                <FolderPlus className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">No Chapters Created Yet</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-sm mx-auto">
                Step 2 of your course is to create chapters. Once created, you can upload videos and PDFs into each chapter.
              </p>
              <Button onClick={() => handleOpenChapterModal()}>
                <Plus className="h-4 w-4 mr-1.5" /> Create First Chapter
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {chapters.map((chapter, chapIdx) => {
                const isCollapsed = collapsedChapters[chapIdx];
                const chapterContents = chapter.contents || [];

                return (
                  <div key={chapIdx} className="rounded-xl border bg-card shadow-xs overflow-hidden transition-all">
                    {/* Chapter Header */}
                    <div className="p-4 bg-muted/20 border-b flex items-center justify-between gap-3">
                      <div 
                        className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                        onClick={() => toggleChapterCollapse(chapIdx)}
                      >
                        <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-md bg-primary text-primary-foreground text-xs font-bold">
                          #{chapIdx + 1}
                        </span>
                        <div className="min-w-0">
                          <h3 className="font-bold text-base text-foreground truncate">{chapter.title}</h3>
                          {chapter.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{chapter.description}</p>
                          )}
                        </div>
                        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded flex-shrink-0">
                          {chapterContents.length} items
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleOpenAddLesson(chapIdx)}
                          className="h-8 text-xs font-medium"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" /> Add Content
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => handleOpenChapterModal(chapIdx)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Rename Chapter"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => setChapterToDelete(chapIdx)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          title="Delete Chapter"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => toggleChapterCollapse(chapIdx)}
                          className="h-8 w-8 text-muted-foreground"
                        >
                          {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Chapter Body (Contents list) */}
                    {!isCollapsed && (
                      <div className="p-4 space-y-2">
                        {chapterContents.length === 0 ? (
                          <div className="py-6 text-center text-xs text-muted-foreground border border-dashed rounded-lg bg-muted/10">
                            No videos or PDFs added to this chapter yet.{" "}
                            <button 
                              onClick={() => handleOpenAddLesson(chapIdx)} 
                              className="text-primary font-semibold hover:underline"
                            >
                              Upload content now
                            </button>
                          </div>
                        ) : (
                          <div className="divide-y rounded-lg border bg-background">
                            {chapterContents.map((lesson, lessonIdx) => {
                              const isVid = lesson.type === "video";
                              return (
                                <div key={lessonIdx} className="p-3 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-xs font-medium text-muted-foreground flex-shrink-0 w-6 text-center">
                                      {chapIdx + 1}.{lessonIdx + 1}
                                    </span>
                                    <div className="flex-shrink-0">
                                      {isVid ? (
                                        <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 text-xs font-semibold">
                                          <Video className="h-3.5 w-3.5" /> Video
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 text-xs font-semibold">
                                          <FileText className="h-3.5 w-3.5" /> PDF
                                        </span>
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-semibold text-sm truncate">{lesson.title}</p>
                                      {lesson.url && (
                                        <a 
                                          href={resolveMediaUrl(lesson.url)} 
                                          target="_blank" 
                                          rel="noreferrer" 
                                          className="text-xs text-primary hover:underline inline-flex items-center gap-1 truncate max-w-[320px]"
                                        >
                                          Preview Material <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                        </a>
                                      )}
                                    </div>
                                  </div>

                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    onClick={() => handleDeleteLesson(chapIdx, lessonIdx)}
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                                    title="Delete Lesson"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL: Add / Edit Chapter --- */}
      <Dialog open={isChapterModalOpen} onOpenChange={setIsChapterModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <form onSubmit={handleSaveChapter}>
            <DialogHeader>
              <DialogTitle>{editingChapterIndex !== null ? "Edit Chapter" : "Add New Chapter"}</DialogTitle>
              <DialogDescription>
                Define a chapter topic (e.g. Chapter 1: Introduction to Marketing).
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-1.5">
                <Label>Chapter Title</Label>
                <Input 
                  required 
                  value={chapterTitle} 
                  onChange={(e) => setChapterTitle(e.target.value)} 
                  placeholder="e.g. Chapter 1: Fundamentals & Planning" 
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Chapter Overview (Optional)</Label>
                <Textarea 
                  value={chapterDescription} 
                  onChange={(e) => setChapterDescription(e.target.value)} 
                  placeholder="Brief summary of what this chapter covers..." 
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsChapterModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={savingChapter}>
                {savingChapter ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingChapterIndex !== null ? "Save Changes" : "Create Chapter"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- MODAL: Add Lesson (Video/PDF) to Chapter --- */}
      <Dialog open={activeChapterIndexForLesson !== null} onOpenChange={(open) => !open && setActiveChapterIndexForLesson(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleAddLesson}>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                <DialogTitle>Add Content to Chapter {activeChapterIndexForLesson !== null ? activeChapterIndexForLesson + 1 : ""}</DialogTitle>
              </div>
              <DialogDescription>
                Upload a video lecture or PDF document for this chapter.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label>Lesson Title</Label>
                  <Input 
                    required 
                    value={lessonTitle} 
                    onChange={(e) => setLessonTitle(e.target.value)} 
                    placeholder="e.g. Video 1: Strategic Planning" 
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <Select value={lessonType} onValueChange={setLessonType}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">🎬 Video</SelectItem>
                      <SelectItem value="pdf">📄 PDF Doc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* File Upload Picker */}
              <div className="space-y-1.5">
                <Label>
                  Upload {lessonType === "video" ? "Video File (.mp4, .webm, .mov)" : "PDF Document (.pdf)"}
                </Label>
                <Input 
                  type="file" 
                  accept={lessonType === "video" ? "video/*" : "application/pdf"} 
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="h-10 text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-primary/10 file:text-primary"
                />
                {selectedFile && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
              </div>

              {/* Direct Media URL Fallback */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Or Direct Media URL (Optional)</Label>
                <Input 
                  value={customMediaUrl} 
                  onChange={(e) => setCustomMediaUrl(e.target.value)} 
                  placeholder="https://..." 
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setActiveChapterIndexForLesson(null)}>Cancel</Button>
              <Button type="submit" disabled={isUploading || isSavingLesson}>
                {isUploading ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Uploading File...</>
                ) : isSavingLesson ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</>
                ) : (
                  <><Plus className="h-4 w-4 mr-1.5" /> Attach to Chapter</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- MODAL: Delete Chapter Confirmation --- */}
      <Dialog open={chapterToDelete !== null} onOpenChange={(open) => !open && setChapterToDelete(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle>Delete Chapter?</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Are you sure you want to delete this chapter? All attached videos and PDF materials inside this chapter will also be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChapterToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteChapter}>Delete Chapter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL: Edit Course Metadata --- */}
      <Dialog open={isEditCourseOpen} onOpenChange={setIsEditCourseOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleSaveCourseMetadata}>
            <DialogHeader>
              <DialogTitle>Edit Course Info</DialogTitle>
              <DialogDescription>Update the title, description, or visibility scope.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input required value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Category</Label>
                  <Select value={editCategory} onValueChange={(val) => {
                    setEditCategory(val);
                    setEditSubcategory("all");
                  }}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">🌐 All Categories</SelectItem>
                      {mainCategories.map((c) => (
                        <SelectItem key={c._id || c.name} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Subcategory</Label>
                  <Select 
                    value={editSubcategory} 
                    onValueChange={setEditSubcategory}
                    disabled={editCategory === "all" || availableSubcategoriesForEdit.length === 0}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder={editCategory === "all" ? "Select Category First" : "Select Subcategory"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subcategories</SelectItem>
                      {availableSubcategoriesForEdit.map((sc) => (
                        <SelectItem key={sc._id || sc.name} value={sc.name}>
                          {sc.name}
                        </SelectItem>
                      ))}
                      {editSubcategory && editSubcategory !== "all" && !availableSubcategoriesForEdit.some(sc => sc.name.toLowerCase() === editSubcategory.toLowerCase()) && (
                        <SelectItem value={editSubcategory}>{editSubcategory}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditCourseOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={savingCourse}>
                {savingCourse ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- MODAL: Delete Course Confirmation --- */}
      <Dialog open={isDeleteCourseOpen} onOpenChange={setIsDeleteCourseOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle>Delete Entire Course?</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Are you sure you want to permanently delete <strong>{courseData.title}</strong>? All chapters, videos, PDFs, and progress will be erased.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteCourseOpen(false)} disabled={deletingCourse}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteCourse} disabled={deletingCourse}>
              {deletingCourse ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Delete Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </AppShell>
  );
}

export default AdminCourseBuilder;
