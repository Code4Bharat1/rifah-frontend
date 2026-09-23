"use client";
import { 
  GraduationCap, 
  Plus, 
  Trash2, 
  Edit, 
  Loader2, 
  Eye, 
  EyeOff,
  MoreHorizontal,
  FileText,
  Video,
  Layers,
  ChevronRight,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  FolderPlus,
  X
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Textarea } from "@shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { useCourses, useCategories } from "@shared/hooks/use-rifah-api";
import { courseApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/api-client";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@shared/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@shared/components/ui/dialog";

function AdminLms({ role = "admin" }) {
  // Navigation / Drill-Down States
  // Level 1: Course Library (activeCourseId === null)
  // Level 2: Chapters View (activeCourseId !== null && activeChapterIdx === null)
  // Level 3: Lessons View (activeCourseId !== null && activeChapterIdx !== null)
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [activeChapterIdx, setActiveChapterIdx] = useState(null);

  // All-in-One Course Creator Modal States
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [stagedChapters, setStagedChapters] = useState([]);
  
  // Staged Chapter & Lesson additions inside Creator Modal
  const [newChapTitle, setNewChapTitle] = useState("");
  const [activeStagedChapIdx, setActiveStagedChapIdx] = useState(null);
  const [stagedLessonTitle, setStagedLessonTitle] = useState("");
  const [stagedLessonType, setStagedLessonType] = useState("video");
  const [stagedFile, setStagedFile] = useState(null);
  const [stagedUrl, setStagedUrl] = useState("");
  const [isUploadingStaged, setIsUploadingStaged] = useState(false);
  const [savingCourse, setSavingCourse] = useState(false);

  // In-Place Chapter Modals (Level 2)
  const [isAddChapterOpen, setIsAddChapterOpen] = useState(false);
  const [editingChapterIdx, setEditingChapterIdx] = useState(null);
  const [chapInputTitle, setChapInputTitle] = useState("");
  const [chapInputDesc, setChapInputDesc] = useState("");
  const [savingChapterInPlace, setSavingChapterInPlace] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState(null);

  // In-Place Lesson Modal (Level 3)
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [lessonInputTitle, setLessonInputTitle] = useState("");
  const [lessonInputType, setLessonInputType] = useState("video");
  const [lessonInputFile, setLessonInputFile] = useState(null);
  const [lessonInputUrl, setLessonInputUrl] = useState("");
  const [isUploadingLesson, setIsUploadingLesson] = useState(false);
  const [savingLessonInPlace, setSavingLessonInPlace] = useState(false);

  // Category states for Creator Modal
  const [newCategory, setNewCategory] = useState("all");
  const [newSubcategory, setNewSubcategory] = useState("all");

  // Category states for Edit Modal
  const [editCategory, setEditCategory] = useState("all");
  const [editSubcategory, setEditSubcategory] = useState("all");

  // Filter state for Admin Course Library
  const [adminCategoryFilter, setAdminCategoryFilter] = useState("all");
  const [adminSubcategoryFilter, setAdminSubcategoryFilter] = useState("all");

  // Delete Course Confirmation
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deletingCourse, setDeletingCourse] = useState(false);

  // Edit Course Metadata
  const [courseToEdit, setCourseToEdit] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingEditInfo, setSavingEditInfo] = useState(false);

  const { data: coursesData, refetch } = useCourses();
  const { data: categoriesData } = useCategories();
  const courses = Array.isArray(coursesData?.data) ? coursesData.data : (Array.isArray(coursesData) ? coursesData : []);
  const allCategories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.categories || []);
  const mainCategories = allCategories.filter((c) => !c.parent);

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

  const availableSubcategoriesForNew = getSubcategories(newCategory);
  const availableSubcategoriesForEdit = getSubcategories(editCategory);
  const availableSubcategoriesForFilter = getSubcategories(adminCategoryFilter);

  const activeCourse = courses.find((c) => c._id === activeCourseId) || null;
  const activeChapter = (activeCourse && activeChapterIdx !== null) ? activeCourse.chapters?.[activeChapterIdx] : null;

  // Auto-derive scope strictly from the logged-in role
  const derivedScope = role === "chapter_admin" ? "chapter" : role === "state_admin" ? "state" : "centre";

  // --- Handlers: All-in-One Creation Modal ---
  const handleOpenCreateModal = () => {
    setNewTitle("");
    setNewDescription("");
    setNewCategory("all");
    setNewSubcategory("all");
    setStagedChapters([
      { title: "Chapter 1: Introduction & Fundamentals", description: "", order: 1, contents: [] }
    ]);
    setNewChapTitle("");
    setActiveStagedChapIdx(0);
    setIsCreating(true);
  };

  const handleAddStagedChapter = () => {
    if (!newChapTitle.trim()) {
      return toast.error("Please enter a chapter title");
    }
    const newCh = {
      title: newChapTitle.trim(),
      description: "",
      order: stagedChapters.length + 1,
      contents: [],
    };
    setStagedChapters([...stagedChapters, newCh]);
    setActiveStagedChapIdx(stagedChapters.length);
    setNewChapTitle("");
    toast.success("Chapter added to course draft");
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
    if (activeStagedChapIdx === null) return toast.error("Select a chapter first.");
    if (!stagedLessonTitle.trim()) return toast.error("Lesson title is required.");

    let fileUrl = stagedUrl.trim();
    if (stagedFile) {
      setIsUploadingStaged(true);
      try {
        const uploadRes = await courseApi.uploadContent(stagedFile);
        fileUrl = uploadRes?.data?.url || uploadRes?.url;
        if (!fileUrl) throw new Error("Upload did not return a valid file URL.");
      } catch (err) {
        toast.error(err.message || "Failed to upload file");
        setIsUploadingStaged(false);
        return;
      } finally {
        setIsUploadingStaged(false);
      }
    }

    if (!fileUrl) {
      return toast.error("Please select a file to upload or provide a direct media URL.");
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
    toast.success("Lesson attached to " + updated[activeStagedChapIdx].title);
  };

  const handleRemoveStagedLesson = (chapIdx, lessonIdx) => {
    const updated = [...stagedChapters];
    const updatedContents = updated[chapIdx].contents
      .filter((_, idx) => idx !== lessonIdx)
      .map((item, idx) => ({ ...item, order: idx + 1 }));
    
    updated[chapIdx] = {
      ...updated[chapIdx],
      contents: updatedContents
    };
    setStagedChapters(updated);
  };

  const handleFinalSaveCourse = async (shouldPublish = false) => {
    if (!newTitle.trim()) return toast.error("Course title is required.");
    
    let totalLessonsCount = 0;
    stagedChapters.forEach(ch => {
      totalLessonsCount += (ch.contents?.length || 0);
    });

    if (shouldPublish && totalLessonsCount === 0) {
      return toast.error("Please add at least 1 lesson before publishing the course.");
    }

    setSavingCourse(true);
    try {
      const payload = {
        title: newTitle.trim(),
        description: newDescription.trim(),
        category: newCategory === "all" ? "" : newCategory,
        subcategory: newSubcategory === "all" ? "" : newSubcategory,
        scope: derivedScope,
        visibilityScope: derivedScope,
        chapters: stagedChapters,
        status: shouldPublish ? "published" : "draft",
        isActive: shouldPublish,
      };

      await courseApi.create(payload);
      toast.success(shouldPublish ? "Course published successfully!" : "Course saved as draft!");
      setIsCreating(false);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to create course.");
    } finally {
      setSavingCourse(false);
    }
  };

  // --- Handlers: Level 2 In-Place Chapters ---
  const handleOpenInPlaceChapter = (idx = null) => {
    if (idx !== null && activeCourse?.chapters?.[idx]) {
      setEditingChapterIdx(idx);
      setChapInputTitle(activeCourse.chapters[idx].title || "");
      setChapInputDesc(activeCourse.chapters[idx].description || "");
    } else {
      setEditingChapterIdx(null);
      setChapInputTitle("");
      setChapInputDesc("");
    }
    setIsAddChapterOpen(true);
  };

  const handleSaveInPlaceChapter = async (e) => {
    if (e) e.preventDefault();
    if (!chapInputTitle.trim()) return toast.error("Chapter title is required.");

    setSavingChapterInPlace(true);
    try {
      const chapters = [...(activeCourse.chapters || [])];
      if (editingChapterIdx !== null) {
        chapters[editingChapterIdx] = {
          ...chapters[editingChapterIdx],
          title: chapInputTitle.trim(),
          description: chapInputDesc.trim(),
        };
      } else {
        chapters.push({
          title: chapInputTitle.trim(),
          description: chapInputDesc.trim(),
          order: chapters.length + 1,
          contents: [],
        });
      }

      await courseApi.update(activeCourse._id, { chapters });
      toast.success(editingChapterIdx !== null ? "Chapter updated" : "Chapter added");
      setIsAddChapterOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to save chapter");
    } finally {
      setSavingChapterInPlace(false);
    }
  };

  const handleDeleteInPlaceChapter = async () => {
    if (chapterToDelete === null || !activeCourse) return;
    try {
      const chapters = (activeCourse.chapters || [])
        .filter((_, idx) => idx !== chapterToDelete)
        .map((ch, idx) => ({ ...ch, order: idx + 1 }));

      await courseApi.update(activeCourse._id, { chapters });
      toast.success("Chapter deleted");
      setChapterToDelete(null);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to delete chapter");
    }
  };

  // --- Handlers: Level 3 In-Place Lessons ---
  const handleOpenAddLesson = () => {
    setLessonInputTitle("");
    setLessonInputType("video");
    setLessonInputFile(null);
    setLessonInputUrl("");
    setIsAddLessonOpen(true);
  };

  const handleSaveInPlaceLesson = async (e) => {
    if (e) e.preventDefault();
    if (!lessonInputTitle.trim()) return toast.error("Lesson title is required.");

    let fileUrl = lessonInputUrl.trim();
    if (lessonInputFile) {
      setIsUploadingLesson(true);
      try {
        const uploadRes = await courseApi.uploadContent(lessonInputFile);
        fileUrl = uploadRes?.data?.url || uploadRes?.url;
        if (!fileUrl) throw new Error("Upload did not return a valid file URL.");
      } catch (err) {
        toast.error(err.message || "Upload failed");
        setIsUploadingLesson(false);
        return;
      } finally {
        setIsUploadingLesson(false);
      }
    }

    if (!fileUrl) {
      return toast.error("Please upload a file or enter a direct media URL.");
    }

    setSavingLessonInPlace(true);
    try {
      const chapters = [...(activeCourse.chapters || [])];
      const targetChap = chapters[activeChapterIdx];
      const newLesson = {
        title: lessonInputTitle.trim(),
        type: lessonInputType,
        url: fileUrl,
        order: (targetChap.contents?.length || 0) + 1,
      };

      chapters[activeChapterIdx] = {
        ...targetChap,
        contents: [...(targetChap.contents || []), newLesson],
      };

      await courseApi.update(activeCourse._id, { chapters });
      toast.success("Lesson added successfully");
      setIsAddLessonOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to add lesson");
    } finally {
      setSavingLessonInPlace(false);
    }
  };

  const handleDeleteInPlaceLesson = async (lessonIdx) => {
    try {
      const chapters = [...(activeCourse.chapters || [])];
      const targetChap = chapters[activeChapterIdx];
      const updatedContents = (targetChap.contents || [])
        .filter((_, idx) => idx !== lessonIdx)
        .map((item, idx) => ({ ...item, order: idx + 1 }));

      chapters[activeChapterIdx] = {
        ...targetChap,
        contents: updatedContents,
      };

      await courseApi.update(activeCourse._id, { chapters });
      toast.success("Lesson removed");
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to remove lesson");
    }
  };

  // --- Handlers: Edit & Delete Course ---
  const handleOpenEditCourse = (course) => {
    setCourseToEdit(course);
    setEditTitle(course.title || "");
    setEditDescription(course.description || "");
    setEditCategory(course.category || "all");
    setEditSubcategory(course.subcategory || "all");
  };

  const handleSaveCourseInfo = async (e) => {
    if (e) e.preventDefault();
    if (!editTitle.trim()) return toast.error("Course title is required.");
    setSavingEditInfo(true);
    try {
      await courseApi.update(courseToEdit._id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        category: editCategory === "all" ? "" : editCategory,
        subcategory: editSubcategory === "all" ? "" : editSubcategory,
      });
      toast.success("Course details updated");
      setCourseToEdit(null);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to update course");
    } finally {
      setSavingEditInfo(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    setDeletingCourse(true);
    try {
      await courseApi.delete(courseToDelete._id);
      toast.success("Course deleted permanently");
      if (activeCourseId === courseToDelete._id) {
        setActiveCourseId(null);
        setActiveChapterIdx(null);
      }
      setCourseToDelete(null);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to delete course");
    } finally {
      setDeletingCourse(false);
    }
  };

  const toggleCourseStatus = async (course) => {
    try {
      const currentIsActive = course.isActive || course.status === "published";
      const nextActive = !currentIsActive;

      // Validate: don't allow publish if 0 lessons
      let totalItems = 0;
      (course.chapters || []).forEach(ch => {
        totalItems += (ch.contents?.length || 0);
      });
      totalItems += (course.contents?.length || 0);

      if (nextActive && totalItems === 0) {
        toast.error("Please add at least 1 lesson before publishing this course.");
        return;
      }

      await courseApi.update(course._id, {
        isActive: nextActive,
        status: nextActive ? "published" : "draft",
      });
      toast.success(nextActive ? "Course published" : "Course moved to draft");
      refetch();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <AppShell role={role} title="Learning Management System" subtitle="Create courses, organize chapters, and attach materials">
      <div className="space-y-6">

        {/* --- Interactive Breadcrumb Navigation Bar --- */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/20 px-4 py-2.5 rounded-lg border">
          <button 
            onClick={() => { setActiveCourseId(null); setActiveChapterIdx(null); }}
            className={`hover:text-primary transition-colors flex items-center gap-1 ${!activeCourseId ? 'text-foreground font-bold' : ''}`}
          >
            <GraduationCap className="h-4 w-4" /> Course Library
          </button>
          
          {activeCourse && (
            <>
              <span className="text-muted-foreground/60">/</span>
              <button 
                onClick={() => setActiveChapterIdx(null)}
                className={`hover:text-primary transition-colors truncate max-w-[200px] ${activeChapterIdx === null ? 'text-foreground font-bold' : ''}`}
              >
                {activeCourse.title}
              </button>
            </>
          )}

          {activeCourse && activeChapterIdx !== null && activeChapter && (
            <>
              <span className="text-muted-foreground/60">/</span>
              <span className="text-foreground font-bold truncate max-w-[220px]">
                Chapter {activeChapterIdx + 1}: {activeChapter.title}
              </span>
            </>
          )}
        </div>

        {/* ========================================================================= */}
        {/* LEVEL 1: COURSE LIBRARY (CARD GRID)                                       */}
        {/* ========================================================================= */}
        {activeCourseId === null && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard label="Total Courses" value={String(courses.length)} icon={GraduationCap} tone="primary" />
              <StatCard label="Published" value={String(courses.filter(c => c.isActive || c.status === 'published').length)} tone="success" />
              <StatCard label="Drafts" value={String(courses.filter(c => !c.isActive && c.status !== 'published').length)} tone="warning" />
              <StatCard label="In Progress" value={String(courses.filter(c => (c.chapters?.length || 0) === 0).length)} tone="neutral" />
            </div>

            {/* Header & Create Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-foreground">Course Library</h2>
                <p className="text-xs text-muted-foreground">Click on any course card to explore chapters, videos, and study materials.</p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                {mainCategories.length > 0 && (
                  <>
                    <Select value={adminCategoryFilter} onValueChange={(val) => {
                      setAdminCategoryFilter(val);
                      setAdminSubcategoryFilter("all");
                    }}>
                      <SelectTrigger className="h-9 text-xs w-[170px]">
                        <SelectValue placeholder="All Categories" />
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

                    {adminCategoryFilter !== "all" && availableSubcategoriesForFilter.length > 0 && (
                      <Select value={adminSubcategoryFilter} onValueChange={setAdminSubcategoryFilter}>
                        <SelectTrigger className="h-9 text-xs w-[170px]">
                          <SelectValue placeholder="All Subcategories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Subcategories</SelectItem>
                          {availableSubcategoriesForFilter.map((sc) => (
                            <SelectItem key={sc._id || sc.name} value={sc.name}>
                              {sc.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </>
                )}

                <Button onClick={handleOpenCreateModal}>
                  <Plus className="mr-2 h-4 w-4" /> Create Course
                </Button>
              </div>
            </div>

            {/* Courses Card Grid */}
            {courses.filter(c => {
              if (adminCategoryFilter !== "all") {
                if ((c.category || "").trim().toLowerCase() !== adminCategoryFilter.trim().toLowerCase()) return false;
              }
              if (adminSubcategoryFilter !== "all") {
                if ((c.subcategory || "").trim().toLowerCase() !== adminSubcategoryFilter.trim().toLowerCase()) return false;
              }
              return true;
            }).length === 0 ? (
              <div className="rounded-xl border border-dashed p-12 text-center bg-card">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-foreground">No Courses Found</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-sm mx-auto">
                  {adminCategoryFilter !== "all" 
                    ? `No courses found under "${adminCategoryFilter}${adminSubcategoryFilter !== "all" ? ` → ${adminSubcategoryFilter}` : ""}".`
                    : "Click the button below to create your course, set up chapters, and upload video lectures and PDFs."}
                </p>
                <Button onClick={handleOpenCreateModal}>
                  <Plus className="mr-2 h-4 w-4" /> Create Course
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {courses
                  .filter(c => {
                    if (adminCategoryFilter !== "all") {
                      if ((c.category || "").trim().toLowerCase() !== adminCategoryFilter.trim().toLowerCase()) return false;
                    }
                    if (adminSubcategoryFilter !== "all") {
                      if ((c.subcategory || "").trim().toLowerCase() !== adminSubcategoryFilter.trim().toLowerCase()) return false;
                    }
                    return true;
                  })
                  .map((course) => {
                  const isPub = course.isActive || course.status === "published";
                  const chapters = course.chapters || [];
                  let vids = 0;
                  let pdfs = 0;
                  chapters.forEach(ch => {
                    (ch.contents || []).forEach(item => {
                      if (item.type === "video") vids++;
                      if (item.type === "pdf") pdfs++;
                    });
                  });
                  (course.contents || []).forEach(item => {
                    if (item.type === "video") vids++;
                    if (item.type === "pdf") pdfs++;
                  });

                  return (
                    <div 
                      key={course._id} 
                      className="group relative flex flex-col rounded-xl border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200 overflow-hidden"
                    >
                      {/* Top Bar of Card */}
                      <div className="p-4 pb-3 flex items-center justify-between gap-2 border-b bg-muted/10">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="capitalize px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                            {course.scope || course.visibilityScope || "Centre"}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isPub ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning-foreground'}`}>
                            {isPub ? 'Published' : 'Draft'}
                          </span>
                          {course.category && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 max-w-[130px] truncate" title={course.category}>
                              {course.category}
                            </span>
                          )}
                          {course.subcategory && (
                            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground max-w-[110px] truncate" title={course.subcategory}>
                              {course.subcategory}
                            </span>
                          )}
                        </div>

                        {/* 3-Dots Quick Actions Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => { setActiveCourseId(course._id); setActiveChapterIdx(null); }}>
                              <Layers className="mr-2 h-4 w-4 text-primary" /> View Chapters ({chapters.length})
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenEditCourse(course)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleCourseStatus(course)}>
                              {isPub ? (
                                <><EyeOff className="mr-2 h-4 w-4" /> Move to Draft</>
                              ) : (
                                <><Eye className="mr-2 h-4 w-4" /> Publish</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive focus:bg-destructive/10" 
                              onClick={() => setCourseToDelete(course)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Course
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Card Body (Click drills down to Chapters) */}
                      <div 
                        onClick={() => { setActiveCourseId(course._id); setActiveChapterIdx(null); }}
                        className="p-5 flex-1 flex flex-col justify-between cursor-pointer space-y-4"
                      >
                        <div className="space-y-1.5">
                          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {course.title}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {course.description || "No overview description provided."}
                          </p>
                        </div>

                        {/* Stats Badges */}
                        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground pt-2">
                          <span className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded font-medium text-foreground">
                            <Layers className="h-3.5 w-3.5 text-primary" /> {chapters.length} Chapters
                          </span>
                          <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-medium">
                            <Video className="h-3.5 w-3.5" /> {vids} Videos
                          </span>
                          <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded font-medium">
                            <FileText className="h-3.5 w-3.5" /> {pdfs} PDFs
                          </span>
                        </div>
                      </div>

                      {/* Card Footer Button */}
                      <div className="p-4 pt-0">
                        <Button 
                          onClick={() => { setActiveCourseId(course._id); setActiveChapterIdx(null); }}
                          variant="outline" 
                          className="w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all text-xs h-9"
                        >
                          <span>Explore Chapters</span>
                          <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* LEVEL 2: CHAPTERS VIEW (CLICKED A COURSE)                                 */}
        {/* ========================================================================= */}
        {activeCourseId !== null && activeChapterIdx === null && activeCourse && (
          <div className="space-y-6">
            {/* Course Overview Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl border bg-card shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                    {activeCourse.scope || "Centre"} Scope
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${activeCourse.isActive ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning-foreground'}`}>
                    {activeCourse.isActive ? 'Published' : 'Draft'}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">{activeCourse.title}</h1>
                <p className="text-xs text-muted-foreground max-w-2xl">{activeCourse.description || "No description provided."}</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => handleOpenEditCourse(activeCourse)}>
                  <Edit className="h-4 w-4 mr-1.5" /> Edit Info
                </Button>
                <Button 
                  variant={activeCourse.isActive ? "secondary" : "default"} 
                  size="sm" 
                  onClick={() => toggleCourseStatus(activeCourse)}
                >
                  {activeCourse.isActive ? <><EyeOff className="h-4 w-4 mr-1.5" /> Move to Draft</> : <><Eye className="h-4 w-4 mr-1.5" /> Publish</>}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive hover:bg-destructive/10" 
                  onClick={() => setCourseToDelete(activeCourse)}
                >
                  <Trash2 className="h-4 w-4 mr-1.5" /> Delete Course
                </Button>
              </div>
            </div>

            {/* Chapters Header & List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" /> Chapters ({activeCourse.chapters?.length || 0})
                  </h2>
                  <p className="text-xs text-muted-foreground">Click on any chapter to view and manage its video lectures and PDF documents.</p>
                </div>
                <Button onClick={() => handleOpenInPlaceChapter()}>
                  <Plus className="h-4 w-4 mr-1.5" /> Add Chapter
                </Button>
              </div>

              {(activeCourse.chapters || []).length === 0 ? (
                <div className="rounded-xl border border-dashed p-10 text-center bg-card">
                  <FolderPlus className="h-8 w-8 mx-auto text-primary mb-2" />
                  <h3 className="text-base font-semibold">No Chapters Yet</h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">Click below to create Chapter 1 for this course.</p>
                  <Button onClick={() => handleOpenInPlaceChapter()}>
                    <Plus className="h-4 w-4 mr-1.5" /> Add Chapter 1
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeCourse.chapters.map((chapter, idx) => {
                    const chapterContents = chapter.contents || [];
                    const vidCount = chapterContents.filter(c => c.type === "video").length;
                    const pdfCount = chapterContents.filter(c => c.type === "pdf").length;

                    return (
                      <div 
                        key={idx}
                        className="group rounded-xl border bg-card hover:border-primary/50 hover:shadow-sm transition-all overflow-hidden flex flex-col justify-between"
                      >
                        <div className="p-4 border-b bg-muted/10 flex items-center justify-between">
                          <span className="flex items-center justify-center px-2 py-0.5 rounded bg-primary text-primary-foreground text-xs font-bold">
                            Chapter {idx + 1}
                          </span>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              onClick={(e) => { e.stopPropagation(); handleOpenInPlaceChapter(idx); }}
                              title="Rename Chapter"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={(e) => { e.stopPropagation(); setChapterToDelete(idx); }}
                              title="Delete Chapter"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Chapter Body (Clickable to Level 3) */}
                        <div 
                          onClick={() => setActiveChapterIdx(idx)}
                          className="p-5 flex-1 cursor-pointer space-y-3"
                        >
                          <div>
                            <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                              {chapter.title}
                            </h3>
                            {chapter.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{chapter.description}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                            <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-medium inline-flex items-center gap-1">
                              <Video className="h-3 w-3" /> {vidCount} Videos
                            </span>
                            <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded font-medium inline-flex items-center gap-1">
                              <FileText className="h-3 w-3" /> {pdfCount} PDFs
                            </span>
                          </div>
                        </div>

                        <div className="p-4 pt-0">
                          <Button 
                            onClick={() => setActiveChapterIdx(idx)}
                            variant="outline" 
                            className="w-full justify-between text-xs h-8 group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                          >
                            <span>Open Chapter Lessons</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* LEVEL 3: LESSONS VIEW (CLICKED A CHAPTER)                                  */}
        {/* ========================================================================= */}
        {activeCourseId !== null && activeChapterIdx !== null && activeCourse && activeChapter && (
          <div className="space-y-6">
            {/* Chapter Header Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl border bg-card shadow-xs">
              <div className="space-y-1">
                <button 
                  onClick={() => setActiveChapterIdx(null)}
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1 mb-1 font-medium"
                >
                  <ArrowLeft className="h-3 w-3" /> Back to Chapters
                </button>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-primary text-primary-foreground text-xs font-bold">
                    Chapter {activeChapterIdx + 1}
                  </span>
                  <h1 className="text-xl font-bold text-foreground">{activeChapter.title}</h1>
                </div>
                {activeChapter.description && (
                  <p className="text-xs text-muted-foreground">{activeChapter.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={handleOpenAddLesson}>
                  <Plus className="h-4 w-4 mr-1.5" /> Add Video / PDF
                </Button>
              </div>
            </div>

            {/* Lessons List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground">
                  Learning Materials & Lessons ({(activeChapter.contents || []).length})
                </h2>
              </div>

              {(activeChapter.contents || []).length === 0 ? (
                <div className="rounded-xl border border-dashed p-10 text-center bg-card">
                  <Video className="h-8 w-8 mx-auto text-primary mb-2" />
                  <h3 className="text-base font-semibold">No Lessons in this Chapter</h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">Upload your video lectures and PDF documents for Chapter {activeChapterIdx + 1}.</p>
                  <Button onClick={handleOpenAddLesson}>
                    <Plus className="h-4 w-4 mr-1.5" /> Upload First Lesson
                  </Button>
                </div>
              ) : (
                <div className="divide-y rounded-xl border bg-card shadow-xs">
                  {activeChapter.contents.map((lesson, lessonIdx) => {
                    const isVid = lesson.type === "video";
                    return (
                      <div key={lessonIdx} className="p-4 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-bold text-muted-foreground">
                            {lessonIdx + 1}
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
                                View / Play Material <ExternalLink className="h-3 w-3 flex-shrink-0" />
                              </a>
                            )}
                          </div>
                        </div>

                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => handleDeleteInPlaceLesson(lessonIdx)}
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
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODAL: VERTICAL ALL-IN-ONE COURSE CREATOR                                  */}
      {/* ========================================================================= */}
      <Dialog 
        open={isCreating} 
        onOpenChange={(open) => {
          if (!open) {
            // Accidental close protection
            if (newTitle.trim() || stagedChapters.length > 1 || (stagedChapters[0]?.contents?.length || 0) > 0) {
              if (confirm("You have unsaved course progress. Are you sure you want to close?")) {
                setIsCreating(false);
              }
            } else {
              setIsCreating(false);
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl w-[94vw] max-h-[90vh] h-[90vh] p-0 flex flex-col gap-0 rounded-2xl sm:rounded-3xl border shadow-2xl bg-card overflow-hidden no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Top Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-foreground">Create Course</h2>
                  <span className="capitalize px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary">
                    {derivedScope} Scope
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Fill course details, create chapters, and attach video/PDF lessons.
                </p>
              </div>
            </div>
          </div>

          {/* Scrollable Vertical Body (Top-to-Bottom Flow with no-scrollbar) */}
          <div className="flex-1 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-6 space-y-6">
            {/* Section 1: Course Information */}
            <div className="rounded-xl border bg-muted/10 p-4 space-y-3.5 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">1. Course Information</h3>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Course Title</Label>
                <Input 
                  required 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  placeholder="e.g. Sales Mastery & Lead Generation" 
                  className="h-10 text-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Description / What Members Will Learn</Label>
                <Textarea 
                  rows={3} 
                  value={newDescription} 
                  onChange={(e) => setNewDescription(e.target.value)} 
                  placeholder="What will members learn from this course?..."
                  className="text-xs leading-relaxed resize-none"
                />
              </div>

              {/* Business Category & Subcategory Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Target Business Category</Label>
                  <Select value={newCategory} onValueChange={(val) => {
                    setNewCategory(val);
                    setNewSubcategory("all");
                  }}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">🌐 All Categories (General Course)</SelectItem>
                      {mainCategories.map((c) => (
                        <SelectItem key={c._id || c.name} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Target Subcategory</Label>
                  <Select 
                    value={newSubcategory} 
                    onValueChange={setNewSubcategory}
                    disabled={newCategory === "all" || availableSubcategoriesForNew.length === 0}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder={newCategory === "all" ? "Select Category First" : "Select Subcategory"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subcategories</SelectItem>
                      {availableSubcategoriesForNew.map((sc) => (
                        <SelectItem key={sc._id || sc.name} value={sc.name}>
                          {sc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 2: Chapters & Content Builder */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  2. Chapters & Learning Materials ({stagedChapters.length})
                </h3>
              </div>

              {/* Quick Add Chapter Bar */}
              <div className="flex items-center gap-2">
                <Input 
                  value={newChapTitle} 
                  onChange={(e) => setNewChapTitle(e.target.value)} 
                  placeholder="Enter next chapter title (e.g. Chapter 2: Sales Closing)" 
                  className="h-9 text-xs"
                />
                <Button type="button" size="sm" onClick={handleAddStagedChapter} className="h-9 shrink-0 text-xs">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Chapter
                </Button>
              </div>

              {/* Vertically Stacked Chapters List */}
              <div className="space-y-4">
                {stagedChapters.map((chapter, chapIdx) => {
                  const isSelected = activeStagedChapIdx === chapIdx;
                  const contents = chapter.contents || [];

                  return (
                    <div 
                      key={chapIdx} 
                      className={`rounded-xl border transition-all ${isSelected ? 'border-primary/60 bg-primary/2 shadow-xs' : 'bg-card'}`}
                    >
                      {/* Chapter Bar Header */}
                      <div 
                        className="p-3.5 flex items-center justify-between cursor-pointer border-b bg-muted/10 rounded-t-xl"
                        onClick={() => setActiveStagedChapIdx(chapIdx)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-primary text-primary-foreground text-xs font-bold">
                            #{chapIdx + 1}
                          </span>
                          <span className="font-semibold text-sm text-foreground">{chapter.title}</span>
                          <span className="text-xs text-muted-foreground">({contents.length} items)</span>
                        </div>

                        <div className="flex items-center gap-1">
                          {stagedChapters.length > 1 && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={(e) => { e.stopPropagation(); handleRemoveStagedChapter(chapIdx); }}
                              title="Remove Chapter"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Inside Chapter: Attached Lessons & Inline Uploader */}
                      <div className="p-4 space-y-3">
                        {contents.length > 0 ? (
                          <div className="divide-y rounded-lg border bg-background">
                            {contents.map((lesson, lessonIdx) => (
                              <div key={lessonIdx} className="p-2.5 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  {lesson.type === "video" ? (
                                    <span className="text-blue-500 font-semibold flex items-center gap-1">
                                      <Video className="h-3.5 w-3.5" /> Video:
                                    </span>
                                  ) : (
                                    <span className="text-amber-500 font-semibold flex items-center gap-1">
                                      <FileText className="h-3.5 w-3.5" /> PDF:
                                    </span>
                                  )}
                                  <span className="font-medium text-foreground">{lesson.title}</span>
                                </div>
                                <button 
                                  type="button" 
                                  onClick={() => handleRemoveStagedLesson(chapIdx, lessonIdx)}
                                  className="text-muted-foreground hover:text-destructive p-1"
                                  title="Remove lesson"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">No lessons attached to Chapter {chapIdx + 1} yet.</p>
                        )}

                        {/* Inline Lesson Upload Form */}
                        <div className="bg-muted/30 p-3 rounded-lg border space-y-2">
                          <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                            <Plus className="h-3.5 w-3.5 text-primary" /> Attach Lesson to Chapter {chapIdx + 1}
                          </p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="sm:col-span-2">
                              <Input 
                                value={activeStagedChapIdx === chapIdx ? stagedLessonTitle : ""} 
                                onChange={(e) => {
                                  setActiveStagedChapIdx(chapIdx);
                                  setStagedLessonTitle(e.target.value);
                                }} 
                                placeholder="Lesson Title (e.g. Video 1: Getting Started)" 
                                className="h-8 text-xs"
                              />
                            </div>
                            <div>
                              <Select 
                                value={stagedLessonType} 
                                onValueChange={(val) => {
                                  setActiveStagedChapIdx(chapIdx);
                                  setStagedLessonType(val);
                                }}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="video">🎬 Video</SelectItem>
                                  <SelectItem value="pdf">📄 PDF Doc</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-center gap-2">
                            <Input 
                              type="file" 
                              accept={stagedLessonType === "video" ? "video/*" : "application/pdf"} 
                              onChange={(e) => {
                                setActiveStagedChapIdx(chapIdx);
                                setStagedFile(e.target.files?.[0] || null);
                              }}
                              className="h-8 text-xs file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-xs file:bg-primary/10 file:text-primary flex-1"
                            />
                            <Button 
                              type="button" 
                              size="sm" 
                              onClick={() => {
                                setActiveStagedChapIdx(chapIdx);
                                handleAddStagedLesson();
                              }}
                              disabled={isUploadingStaged}
                              className="h-8 text-xs shrink-0 w-full sm:w-auto"
                            >
                              {isUploadingStaged && activeStagedChapIdx === chapIdx ? (
                                <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Uploading...</>
                              ) : (
                                <><Plus className="h-3 w-3 mr-1" /> Attach Lesson</>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20 shrink-0">
            <div className="text-xs text-muted-foreground flex items-center gap-3">
              <span><strong>{stagedChapters.length}</strong> Chapters</span>
              <span>•</span>
              <span>
                <strong>
                  {stagedChapters.reduce((acc, ch) => acc + (ch.contents?.length || 0), 0)}
                </strong> Lessons
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => handleFinalSaveCourse(false)}
                disabled={savingCourse || isUploadingStaged}
              >
                {savingCourse ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                Save as Draft
              </Button>
              <Button 
                type="button" 
                onClick={() => handleFinalSaveCourse(true)}
                disabled={savingCourse || isUploadingStaged}
              >
                {savingCourse ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                Create & Publish Course
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- MODAL: Add / Edit Chapter in Place (Level 2) --- */}
      <Dialog open={isAddChapterOpen} onOpenChange={setIsAddChapterOpen}>
        <DialogContent className="sm:max-w-[420px] no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <form onSubmit={handleSaveInPlaceChapter}>
            <DialogHeader>
              <DialogTitle>{editingChapterIdx !== null ? "Rename Chapter" : "Add New Chapter"}</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-3">
              <div className="space-y-1.5">
                <Label>Chapter Title</Label>
                <Input 
                  required 
                  value={chapInputTitle} 
                  onChange={(e) => setChapInputTitle(e.target.value)} 
                  placeholder="e.g. Chapter 2: Sales Closing Strategies" 
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Overview (Optional)</Label>
                <Textarea 
                  value={chapInputDesc} 
                  onChange={(e) => setChapInputDesc(e.target.value)} 
                  placeholder="Brief description of this chapter..." 
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddChapterOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={savingChapterInPlace}>
                {savingChapterInPlace ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Save Chapter
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- MODAL: Add Lesson in Place (Level 3) --- */}
      <Dialog open={isAddLessonOpen} onOpenChange={setIsAddLessonOpen}>
        <DialogContent className="sm:max-w-[480px] no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <form onSubmit={handleSaveInPlaceLesson}>
            <DialogHeader>
              <DialogTitle>Add Lesson to Chapter {activeChapterIdx !== null ? activeChapterIdx + 1 : ""}</DialogTitle>
              <DialogDescription>Upload a video lecture or PDF document.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 space-y-1">
                  <Label>Lesson Title</Label>
                  <Input 
                    required 
                    value={lessonInputTitle} 
                    onChange={(e) => setLessonInputTitle(e.target.value)} 
                    placeholder="e.g. Video 1: Master Strategy" 
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Type</Label>
                  <Select value={lessonInputType} onValueChange={setLessonInputType}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">🎬 Video</SelectItem>
                      <SelectItem value="pdf">📄 PDF Doc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>
                  Upload {lessonInputType === "video" ? "Video (.mp4, .webm, .mov)" : "PDF Document (.pdf)"}
                </Label>
                <Input 
                  type="file" 
                  accept={lessonInputType === "video" ? "video/*" : "application/pdf"} 
                  onChange={(e) => setLessonInputFile(e.target.files?.[0] || null)}
                  className="h-9 text-xs file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-xs file:bg-primary/10 file:text-primary"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Or Direct Media URL</Label>
                <Input 
                  value={lessonInputUrl} 
                  onChange={(e) => setLessonInputUrl(e.target.value)} 
                  placeholder="https://..." 
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddLessonOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isUploadingLesson || savingLessonInPlace}>
                {isUploadingLesson ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Uploading...</>
                ) : savingLessonInPlace ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</>
                ) : (
                  <><Plus className="h-4 w-4 mr-1.5" /> Attach Lesson</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- MODAL: Delete Chapter Confirmation --- */}
      <Dialog open={chapterToDelete !== null} onOpenChange={(open) => !open && setChapterToDelete(null)}>
        <DialogContent className="sm:max-w-[400px] no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle>Delete Chapter?</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Are you sure? All attached videos and PDF materials inside this chapter will also be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChapterToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteInPlaceChapter}>Delete Chapter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL: Edit Course Metadata --- */}
      <Dialog open={Boolean(courseToEdit)} onOpenChange={(open) => !open && setCourseToEdit(null)}>
        <DialogContent className="sm:max-w-[460px] no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <form onSubmit={handleSaveCourseInfo}>
            <DialogHeader>
              <DialogTitle>Edit Course Info</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-3">
              <div className="space-y-1.5">
                <Label>Course Title</Label>
                <Input required value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Category</Label>
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
                  <Label className="text-xs">Subcategory</Label>
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
              <Button type="button" variant="outline" onClick={() => setCourseToEdit(null)}>Cancel</Button>
              <Button type="submit" disabled={savingEditInfo}>
                {savingEditInfo ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- MODAL: Delete Entire Course Confirmation --- */}
      <Dialog open={Boolean(courseToDelete)} onOpenChange={(open) => !open && setCourseToDelete(null)}>
        <DialogContent className="sm:max-w-[420px] no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              <DialogTitle>Delete Entire Course?</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Are you sure you want to permanently delete <strong>{courseToDelete?.title}</strong>? All chapters, videos, and PDFs inside it will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCourseToDelete(null)} disabled={deletingCourse}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteCourse} disabled={deletingCourse}>
              {deletingCourse ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Delete Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </AppShell>
  );
}

export { AdminLms };
export default AdminLms;
