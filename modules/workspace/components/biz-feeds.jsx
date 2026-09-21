"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Heart,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  PlusCircle,
  Image as ImageIcon,
  Upload,
  User,
  X,
  Camera,
  Trash2,
  Building2,
  MapPin,
  Filter,
  Globe,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Badge } from "@shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@shared/components/ui/dialog";
import { Textarea } from "@shared/components/ui/textarea";
import { Label } from "@shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { useAuth } from "@shared/providers/auth-provider";
import { useChapters, useStates, useMyBusiness, usePosts, useCreatePost, useTogglePostLike, useAddPostComment, useDeletePost } from "@shared/hooks/use-rifah-api";
import { postsApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/media";
import { toast } from "sonner";
import { cn } from "@shared/lib/utils";

// Format relative time helper
function formatRelativeTime(dateInput) {
  if (!dateInput) return "Just now";
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "Just now";
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return "Just now";
  }
}

// User Avatar Component with graceful default icon fallback
function UserAvatar({ src, name, className = "h-9 w-9", iconClassName = "h-5 w-5" }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (src && !hasError) {
    return (
      <img
        src={src}
        alt={name || "User"}
        className={cn("rounded-full object-cover border border-border bg-muted shrink-0", className)}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-muted text-muted-foreground flex items-center justify-center border border-border shrink-0 select-none shadow-2xs",
        className
      )}
      title={name || "User"}
    >
      <User className={iconClassName} />
    </div>
  );
}

// Role badge helper for displaying author level in Rifah light theme (Focused view pill)
function RoleBadge({ role }) {
  if (role === "central_admin") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-100 text-sky-700">
        Central Admin
      </span>
    );
  }
  if (role === "state_admin") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700">
        State Admin
      </span>
    );
  }
  if (role === "chapter_admin") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-100 text-teal-700">
        Chapter Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
      Member
    </span>
  );
}

// Single Rifah Feed Post Card (Focused Post View Layout Theme)
function RifahFeedCard({
  post,
  currentUser,
  canDelete,
  onLikeToggle,
  onAddComment,
  onDeletePost,
  onSelectChapter,
  onSelectState,
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [imageErrorMap, setImageErrorMap] = useState({});
  const commentInputRef = useRef(null);

  // Auto-reset imageErrorMap when post data or images change
  useEffect(() => {
    setImageErrorMap({});
  }, [post.id, post._id, post.images, post.updatedAt]);

  const rawImages = Array.isArray(post.images) ? post.images : (post.image ? [post.image] : []);
  const images = rawImages.map((img) => resolveMediaUrl(img)).filter(Boolean);
  const totalImages = images.length;
  const hasMedia = totalImages > 0;

  // Handle double-click on media to like with animated heart pop
  const handleDoubleClick = () => {
    setShowHeartPop(true);
    setTimeout(() => setShowHeartPop(false), 900);
    if (!post.isLiked) {
      onLikeToggle(post.id || post._id);
    }
  };

  const handleNextSlide = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % totalImages);
  };

  const handlePrevSlide = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const handlePostComment = (e) => {
    e?.preventDefault();
    if (!commentInput.trim()) return;
    onAddComment(post.id, commentInput.trim());
    setCommentInput("");
    setShowAllComments(true);
  };

  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Post link copied to clipboard!");
    } else {
      toast.info("Share feature triggered");
    }
  };

  // Caption truncated view
  const isLongCaption = (post.caption || "").length > 160;
  const displayCaption = isExpanded || !isLongCaption
    ? post.caption
    : `${(post.caption || "").slice(0, 160)}...`;

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm hover:shadow-md transition-all duration-300 w-full p-5 sm:p-6 space-y-3.5">
      {/* 1. Author Row & Top Action Buttons (Follow + More Options) */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* User Avatar with dark circular border */}
          <UserAvatar
            src={post.author?.avatar}
            name={post.author?.username || post.author?.name}
            className="h-10 w-10 border border-slate-200"
            iconClassName="h-5 w-5 text-slate-500"
          />

          {/* User Name, Role Badge, Location / Timestamp */}
          <div className="min-w-0 flex flex-col leading-tight">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-slate-900 hover:text-[#00A6F4] transition-colors cursor-pointer truncate">
                {post.author?.username || "user"}
              </span>
              <RoleBadge role={post.createdByRole || post.author?.role || "business"} />
              {post.author?.verified && (
                <BadgeCheck className="h-4 w-4 fill-[#00A6F4] text-white shrink-0" />
              )}
              {post.eventId && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-300">
                  Event
                </span>
              )}
            </div>

            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5 truncate">
              {post.chapter ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectChapter?.(post.chapter);
                  }}
                  className="hover:text-[#00A6F4] hover:underline transition-colors cursor-pointer font-normal"
                >
                  {post.chapter}
                </button>
              ) : post.state ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectState?.(post.state);
                  }}
                  className="hover:text-[#00A6F4] hover:underline transition-colors cursor-pointer font-normal"
                >
                  {post.state}
                </button>
              ) : (
                <span>{post.author?.subtitle || "RIFAH Network"}</span>
              )}
              <span>•</span>
              <span>{formatRelativeTime(post.createdAt || post.author?.timeAgo)}</span>
            </div>
          </div>
        </div>

        {/* Top Right Action: Only Delete Icon (if authorized) */}
        {canDelete && (
          <button
            type="button"
            onClick={() => onDeletePost(post.id || post._id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer shrink-0"
            title="Delete post"
            aria-label="Delete post"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        )}
      </div>

      {/* 2. Post Title (Prominently displayed beneath author row) */}
      {post.title && (
        <h3 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight pt-0.5">
          {post.title}
        </h3>
      )}

      {/* 3. Media Banner (Inset rounded rectangle) */}
      {hasMedia && (
        <div
          onDoubleClick={handleDoubleClick}
          className="relative w-full rounded-2xl overflow-hidden border border-slate-200/70 bg-slate-100 select-none flex items-center justify-center min-h-[260px] max-h-[520px] group cursor-pointer shadow-2xs"
        >
          {images[currentSlide] && !imageErrorMap[currentSlide] ? (
            <>
              {/* Blurred ambient background for non-standard image aspect ratios */}
              <img
                src={images[currentSlide]}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-20 scale-110 pointer-events-none"
              />
              <img
                src={images[currentSlide]}
                alt="Post photo"
                className="relative z-10 w-full h-full object-contain max-h-[520px] drop-shadow-xs transition-transform duration-300 group-hover:scale-[1.01]"
                onError={() => setImageErrorMap((prev) => ({ ...prev, [currentSlide]: true }))}
              />
            </>
          ) : (
            <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center text-slate-400 gap-2 p-8 bg-slate-50">
              <Camera className="h-10 w-10 stroke-[1.5] opacity-50 text-slate-400" />
              <span className="text-xs font-medium">Image unavailable</span>
            </div>
          )}

          {/* Double-Click Heart Pop */}
          {showHeartPop && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-in zoom-in-50 duration-200">
              <Heart className="h-24 w-24 fill-rose-600 text-rose-600 drop-shadow-xl animate-pulse" />
            </div>
          )}

          {/* Carousel Arrows & Pagination (if multiple images) */}
          {totalImages > 1 && (
            <>
              {currentSlide > 0 && (
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition-colors shadow-md z-20 backdrop-blur-sm"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
              {currentSlide < totalImages - 1 && (
                <button
                  type="button"
                  onClick={handleNextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition-colors shadow-md z-20 backdrop-blur-sm"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-slate-900/75 text-[11px] font-semibold text-white backdrop-blur-sm pointer-events-none z-20">
                {currentSlide + 1} / {totalImages}
              </div>
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20 pointer-events-none">
                {images.map((_, idx) => (
                  <span
                    key={idx}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-200",
                      idx === currentSlide ? "w-3.5 bg-[#00A6F4] shadow-xs" : "w-1.5 bg-slate-400/60"
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* 4. Post Caption / Description (Positioned directly below the image) */}
      {post.caption && (
        <div className="text-sm text-slate-700 leading-relaxed break-words pt-1">
          <span>{displayCaption}</span>
          {isLongCaption && !isExpanded && (
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="text-xs text-[#00A6F4] ml-1.5 font-semibold hover:underline cursor-pointer"
            >
              more
            </button>
          )}
          {isExpanded && isLongCaption && (
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-xs text-[#00A6F4] ml-1.5 font-semibold hover:underline cursor-pointer"
            >
              less
            </button>
          )}
        </div>
      )}

      {/* 5. Action Bar (Likes, Comments Count) */}
      <div className="flex items-center gap-6 pt-2 border-t border-slate-100">
        {/* Like Button */}
        <button
          type="button"
          onClick={() => onLikeToggle(post.id || post._id)}
          className="group flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-transform active:scale-110 cursor-pointer"
          aria-label={post.isLiked ? "Unlike post" : "Like post"}
        >
          <Heart
            className={cn(
              "h-4.5 w-4.5 transition-colors",
              post.isLiked
                ? "fill-rose-600 text-rose-600 drop-shadow-xs"
                : "text-slate-500 group-hover:text-slate-800"
            )}
          />
          <span>{post.likesCount || 0}</span>
        </button>

        {/* Comments Count / Toggle */}
        <button
          type="button"
          onClick={() => {
            setShowAllComments((prev) => !prev);
            commentInputRef.current?.focus();
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#00A6F4] transition-colors cursor-pointer"
        >
          <MessageCircle className="h-4.5 w-4.5 text-slate-500" />
          <span>{post.comments?.length || 0}</span>
        </button>
      </div>

      {/* 6. Comments Section (Comments header, comment bubbles & pill comment input) */}
      <div className="pt-2 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 tracking-tight">
            Comments ({post.comments?.length || 0})
          </h4>
          {post.comments?.length > 2 && (
            <button
              type="button"
              onClick={() => setShowAllComments(!showAllComments)}
              className="text-xs text-[#00A6F4] hover:text-[#008fe0] font-semibold hover:underline cursor-pointer"
            >
              {showAllComments ? "Show less" : `View all ${post.comments.length} comments`}
            </button>
          )}
        </div>

        {/* Comments Stream */}
        {post.comments && post.comments.length > 0 && (
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 text-xs no-scrollbar [scrollbar-width:thin]">
            {(showAllComments ? post.comments : post.comments.slice(-2)).map((comment) => (
              <div
                key={comment.id || comment._id || Math.random()}
                className="flex items-start justify-between gap-2.5 p-2.5 rounded-2xl bg-slate-50/90 border border-slate-200/60 shadow-2xs"
              >
                <div className="flex items-start gap-2 min-w-0">
                  <UserAvatar
                    src={resolveMediaUrl(comment.avatar)}
                    name={comment.username || comment.name}
                    className="h-6 w-6 mt-0.5 border border-slate-200 shrink-0"
                    iconClassName="h-3.5 w-3.5 text-slate-400"
                  />
                  <p className="leading-snug break-words">
                    <span className="font-bold mr-1.5 text-slate-900 hover:underline cursor-pointer hover:text-[#00A6F4]">
                      {comment.username || comment.name}
                    </span>
                    <span className="text-slate-700 font-normal">{comment.text}</span>
                  </p>
                </div>
                {(comment.createdAt || comment.timeAgo) && (
                  <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">
                    {formatRelativeTime(comment.createdAt || comment.timeAgo)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Comment Input Bar: Pill format matching the screenshot */}
        <form
          onSubmit={handlePostComment}
          className="flex items-center gap-2 p-1.5 pl-3.5 rounded-full bg-white border border-slate-200 focus-within:border-[#00A6F4] focus-within:ring-2 focus-within:ring-[#00A6F4]/20 shadow-2xs transition-all"
        >
          <UserAvatar
            src={currentUser?.avatar}
            name={currentUser?.username}
            className="h-5 w-5 border border-slate-200 shrink-0"
            iconClassName="h-3 w-3 text-slate-400"
          />
          <input
            ref={commentInputRef}
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 bg-transparent text-xs text-slate-900 placeholder:text-slate-400 outline-none"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!commentInput.trim()}
            className={cn(
              "h-7 px-4 rounded-full font-semibold text-xs transition-all cursor-pointer shrink-0 shadow-xs",
              commentInput.trim()
                ? "bg-[#00A6F4] hover:bg-[#0095dc] text-white"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            )}
          >
            Post
          </Button>
        </form>
      </div>
    </article>
  );
}

const InstagramPostCard = RifahFeedCard;

// Multi-Level Filter Navbar (All, State-wise, Chapter-wise - Inline Navbar Layout)
function FeedFilterBar({
  filterMode,
  setFilterMode,
  selectedState,
  setSelectedState,
  selectedChapter,
  setSelectedChapter,
  searchQuery,
  setSearchQuery,
  availableStates = [],
  availableChapters = [],
  totalPostsCount = 0,
  filteredCount = 0,
  onReset,
  userState = "",
  userChapter = "",
}) {
  const isFiltering =
    filterMode !== "all" ||
    Boolean(selectedState) ||
    Boolean(selectedChapter) ||
    Boolean(searchQuery.trim());

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs p-2.5 sm:px-4 sm:py-3 transition-all text-slate-900">
      {/* Main Inline Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Left Section: Segmented View Switcher & Contextual Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Segmented View Control */}
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => {
                setFilterMode("all");
                setSelectedState("");
                setSelectedChapter("");
              }}
              className={cn(
                "flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                filterMode === "all"
                  ? "bg-white text-slate-900 font-bold shadow-xs border border-slate-200/50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              )}
            >
              <Globe className="h-3.5 w-3.5 shrink-0" />
              <span>All</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterMode("state")}
              className={cn(
                "flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                filterMode === "state"
                  ? "bg-white text-slate-900 font-bold shadow-xs border border-slate-200/50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              )}
            >
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>State</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterMode("chapter")}
              className={cn(
                "flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                filterMode === "chapter"
                  ? "bg-white text-slate-900 font-bold shadow-xs border border-slate-200/50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              )}
            >
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span>Chapter</span>
            </button>
          </div>

          {/* Contextual Selector: State Mode */}
          {filterMode === "state" && (
            <div className="flex items-center gap-1.5">
              <Select
                value={selectedState || "ALL_STATES"}
                onValueChange={(val) => setSelectedState(val === "ALL_STATES" ? "" : val)}
              >
                <SelectTrigger className="h-8.5 text-xs w-[160px] sm:w-[190px] rounded-lg bg-white border border-slate-200 text-slate-800 hover:border-slate-300">
                  <MapPin className="h-3 w-3 mr-1 text-sky-600 shrink-0" />
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent className="max-h-60 bg-white border-slate-200 text-slate-800 shadow-lg">
                  <SelectItem value="ALL_STATES">All States</SelectItem>
                  {availableStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Contextual Selector: Chapter Mode */}
          {filterMode === "chapter" && (
            <div className="flex items-center gap-1.5">
              {availableStates.length > 1 && (
                <Select
                  value={selectedState || "ALL_STATES"}
                  onValueChange={(val) => setSelectedState(val === "ALL_STATES" ? "" : val)}
                >
                  <SelectTrigger className="h-8.5 text-xs w-[130px] sm:w-[150px] rounded-lg bg-white border border-slate-200 text-slate-800 hover:border-slate-300">
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48 bg-white border-slate-200 text-slate-800 shadow-lg">
                    <SelectItem value="ALL_STATES">All States</SelectItem>
                    {availableStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Select
                value={selectedChapter || "ALL_CHAPTERS"}
                onValueChange={(val) => setSelectedChapter(val === "ALL_CHAPTERS" ? "" : val)}
              >
                <SelectTrigger className="h-8.5 text-xs w-[170px] sm:w-[210px] rounded-lg bg-white border border-slate-200 text-slate-800 hover:border-slate-300">
                  <Building2 className="h-3 w-3 mr-1 text-sky-600 shrink-0" />
                  <SelectValue placeholder="Select Chapter" />
                </SelectTrigger>
                <SelectContent className="max-h-60 bg-white border-slate-200 text-slate-800 shadow-lg">
                  <SelectItem value="ALL_CHAPTERS">All Chapters</SelectItem>
                  {availableChapters.map((chapter) => (
                    <SelectItem key={chapter.id || chapter.name} value={chapter.name}>
                      {chapter.name} {chapter.state ? `(${chapter.state})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Quick Shortcuts: My Chapter / My State */}
          {userChapter && (
            <button
              type="button"
              onClick={() => {
                setFilterMode("chapter");
                setSelectedChapter(userChapter);
              }}
              className={cn(
                "hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                filterMode === "chapter" && selectedChapter.toLowerCase() === userChapter.toLowerCase()
                  ? "bg-sky-600 text-white font-semibold shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              )}
              title={`Filter by my chapter (${userChapter})`}
            >
              <Building2 className="h-3 w-3" />
              <span>{userChapter}</span>
            </button>
          )}
          {userState && filterMode !== "chapter" && (
            <button
              type="button"
              onClick={() => {
                setFilterMode("state");
                setSelectedState(userState);
              }}
              className={cn(
                "hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                filterMode === "state" && selectedState.toLowerCase() === userState.toLowerCase()
                  ? "bg-sky-600 text-white font-semibold shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              )}
              title={`Filter by my state (${userState})`}
            >
              <MapPin className="h-3 w-3" />
              <span>{userState}</span>
            </button>
          )}
        </div>

        {/* Right Section: Inline Search Bar, Posts Count & Reset */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Search Bar */}
          <div className="relative w-40 sm:w-52 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search feeds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-7 text-xs h-8.5 rounded-lg bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-sky-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Posts Count Badge */}
          <Badge
            variant="outline"
            className="h-8.5 px-2.5 text-[11px] font-medium text-slate-600 border-slate-200 bg-slate-100 shrink-0 hidden sm:inline-flex items-center"
          >
            {filteredCount} {filteredCount === 1 ? "post" : "posts"}
          </Badge>

          {/* Reset Action */}
          {isFiltering && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8.5 px-2.5 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 font-medium cursor-pointer shrink-0"
              title="Reset all filters"
            >
              <RotateCcw className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Optional Thin Secondary Pill Row: When State Mode is active with available states */}
      {filterMode === "state" && availableStates.length > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider shrink-0 mr-1">
            States:
          </span>
          <button
            type="button"
            onClick={() => setSelectedState("")}
            className={cn(
              "px-2 py-0.5 rounded-md text-[11px] font-medium transition-all shrink-0 cursor-pointer",
              !selectedState ? "bg-sky-600 text-white font-semibold shadow-xs" : "bg-slate-100 hover:bg-slate-200/70 text-slate-600"
            )}
          >
            All States
          </button>
          {availableStates.slice(0, 10).map((state) => {
            const isSelected = selectedState.toLowerCase() === state.toLowerCase();
            return (
              <button
                key={state}
                type="button"
                onClick={() => setSelectedState(isSelected ? "" : state)}
                className={cn(
                  "px-2 py-0.5 rounded-md text-[11px] font-medium transition-all shrink-0 cursor-pointer",
                  isSelected
                    ? "bg-sky-600 text-white font-semibold shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200/70 text-slate-600"
                )}
              >
                {state}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Alias for backwards compatibility
const FeedFilterSidebar = FeedFilterBar;

// Main BizFeeds Component
export function BizFeeds() {
  const { user } = useAuth();
  const { data: businessData } = useMyBusiness();
  const { data: statesData } = useStates();
  const { data: chaptersData } = useChapters();
  const chapters = chaptersData || [];
  const statesList = statesData || [];

  const [posts, setPosts] = useState([]);
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [formPostImageFile, setFormPostImageFile] = useState(null);

  // Form states for creating a new post
  const [formUsername, setFormUsername] = useState("");
  const [formProfilePic, setFormProfilePic] = useState("");
  const [formPostImage, setFormPostImage] = useState("");
  const [formCaption, setFormCaption] = useState("");
  const [formChapter, setFormChapter] = useState("");
  const [formState, setFormState] = useState("");
  const [useUrlInput, setUseUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState("");

  // Feed Filter States ('all' | 'state' | 'chapter')
  const [filterMode, setFilterMode] = useState("all");
  const [selectedState, setSelectedState] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const profilePicInputRef = useRef(null);
  const postImageInputRef = useRef(null);

  // Automatically resolve logged-in user credentials and scope
  const userRole = user?.role || "business";
  const userState = (user?.state || businessData?.state || "").toLowerCase().trim();
  const userChapter = (user?.chapter || businessData?.chapter || "").toLowerCase().trim();
  const userChapterId = String(user?.chapterId || businessData?.chapterId || "");
  const userId = String(user?._id || user?.id || "");
  const currentUsername = (user?.name || user?.email?.split("@")[0] || "").toLowerCase().replace(/\s+/g, "_");

  const resolvedDefaultAvatar = user?.avatar ? resolveMediaUrl(user.avatar) : "";

  // Compute list of unique states available for filtering
  const availableStates = useMemo(() => {
    const stateSet = new Set();
    statesList.forEach((s) => {
      const name = typeof s === "string" ? s : s?.name;
      if (name) stateSet.add(name.trim());
    });
    chapters.forEach((c) => {
      if (c.state) stateSet.add(c.state.trim());
    });
    posts.forEach((p) => {
      if (p.state) stateSet.add(p.state.trim());
    });
    return Array.from(stateSet).filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [statesList, chapters, posts]);

  // Compute list of unique chapters available for filtering
  const availableChapters = useMemo(() => {
    const chapterMap = new Map();
    chapters.forEach((c) => {
      if (c.name) {
        chapterMap.set(c.name.trim(), {
          name: c.name.trim(),
          state: c.state || "",
          id: c._id || c.id || c.name,
        });
      }
    });
    posts.forEach((p) => {
      if (p.chapter && !chapterMap.has(p.chapter.trim())) {
        chapterMap.set(p.chapter.trim(), {
          name: p.chapter.trim(),
          state: p.state || "",
          id: p.chapterId || p.chapter,
        });
      }
    });
    let list = Array.from(chapterMap.values());
    if (filterMode === "chapter" && selectedState && selectedState !== "ALL_STATES") {
      list = list.filter((c) => (c.state || "").toLowerCase() === selectedState.toLowerCase());
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [chapters, posts, filterMode, selectedState]);

  // Handlers for quick interactive filtering
  const handleResetFilter = () => {
    setFilterMode("all");
    setSelectedState("");
    setSelectedChapter("");
    setSearchQuery("");
  };

  const handleSelectState = (stateName) => {
    if (!stateName) return;
    setFilterMode("state");
    setSelectedState(stateName);
    setSelectedChapter("");
  };

  const handleSelectChapter = (chapterName) => {
    if (!chapterName) return;
    setFilterMode("chapter");
    setSelectedChapter(chapterName);
    const match = chapters.find((c) => (c.name || "").toLowerCase() === chapterName.toLowerCase());
    if (match?.state) {
      setSelectedState(match.state);
    }
  };

  // Initialize form when modal opens with user defaults
  useEffect(() => {
    if (isNewPostOpen) {
      if (!formUsername) {
        setFormUsername(user?.name || currentUsername);
      }
      if (!formProfilePic && resolvedDefaultAvatar) {
        setFormProfilePic(resolvedDefaultAvatar);
      }
      setFormChapter(user?.chapter || businessData?.chapter || (chapters[0]?.name || ""));
      setFormState(user?.state || businessData?.state || (chapters[0]?.state || "Maharashtra"));
    }
  }, [isNewPostOpen, user, businessData, currentUsername, resolvedDefaultAvatar, chapters, formUsername, formProfilePic]);

  // Live API query for feed posts — automatically refetches every 10s and on window focus
  const {
    data: apiPosts = [],
    isLoading: isPostsLoading,
    refetch: refetchPosts,
  } = usePosts({
    filterMode,
    chapter: filterMode === "chapter" ? selectedChapter : undefined,
    state: filterMode === "state" ? selectedState : undefined,
    search: searchQuery,
  });

  const createPostMutation = useCreatePost();
  const toggleLikeMutation = useTogglePostLike();
  const addCommentMutation = useAddPostComment();
  const deletePostMutation = useDeletePost();

  // Keep local optimistic state synchronized with apiPosts
  useEffect(() => {
    if (apiPosts && Array.isArray(apiPosts)) {
      setPosts(apiPosts);
    }
  }, [apiPosts]);

  // Profile Picture File Upload Handler
  const handleProfilePicFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormProfilePic(event.target.result);
      toast.success("Profile photo uploaded!");
    };
    reader.readAsDataURL(file);
  };

  // Post Image File Upload Handler with client-side canvas compression for multi-PC Atlas sync
  const handlePostImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    setFormPostImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target.result;
      const img = new Image();
      img.onload = () => {
        const maxDim = 1200;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL("image/jpeg", 0.85);
        setFormPostImage(compressed);
        toast.success("Post image selected!");
      };
      img.onerror = () => {
        setFormPostImage(rawDataUrl);
        toast.success("Post image selected!");
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Live: Toggle Like with instant optimistic feedback + backend sync
  const handleLikeToggle = async (postId) => {
    const targetId = String(postId);
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (String(p.id || p._id) === targetId) {
          const isLiked = !p.isLiked;
          const likesCount = isLiked ? (p.likesCount || 0) + 1 : Math.max(0, (p.likesCount || 0) - 1);
          return { ...p, isLiked, likesCount };
        }
        return p;
      })
    );

    try {
      await toggleLikeMutation.mutateAsync(targetId);
    } catch (err) {
      refetchPosts();
    }
  };

  // Live: Add Comment with instant optimistic feedback + backend sync
  const handleAddComment = async (postId, text) => {
    const targetId = String(postId);
    const tempComment = {
      id: "c-" + Date.now(),
      _id: "c-" + Date.now(),
      authorId: userId,
      username: (formUsername || currentUsername).toLowerCase().replace(/\s+/g, "_"),
      name: formUsername || currentUsername || "Member",
      avatar: formProfilePic || resolvedDefaultAvatar || "",
      text,
      createdAt: new Date().toISOString(),
      timeAgo: "Just now",
    };

    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (String(p.id || p._id) === targetId) {
          return {
            ...p,
            comments: [...(p.comments || []), tempComment],
          };
        }
        return p;
      })
    );

    try {
      await addCommentMutation.mutateAsync({
        id: targetId,
        text,
        authorName: formUsername || currentUsername,
        authorAvatar: formProfilePic || resolvedDefaultAvatar || "",
      });
      toast.success("Comment posted!");
    } catch (err) {
      toast.error("Could not post comment");
      refetchPosts();
    }
  };

  // Live: Delete post with backend sync
  const handleDeletePost = async (postId) => {
    const targetId = String(postId);
    setPosts((prevPosts) => prevPosts.filter((p) => String(p.id || p._id) !== targetId));

    try {
      await deletePostMutation.mutateAsync(targetId);
      toast.success("Post deleted");
    } catch (err) {
      toast.error("Could not delete post");
      refetchPosts();
    }
  };

  // Live: Create and Publish Post across all devices
  const handleCreatePost = async (e) => {
    e.preventDefault();

    let finalPostImage = formPostImage || urlInputValue.trim();

    if (!finalPostImage && !formPostImageFile) {
      toast.error("Please add an image for your post.");
      return;
    }

    if (!formCaption.trim()) {
      toast.error("Please enter a caption for your post.");
      return;
    }

    setIsSubmittingPost(true);

    try {
      // Upload image file if user picked from disk
      if (formPostImageFile) {
        try {
          const uploadRes = await postsApi.uploadImage(formPostImageFile);
          // Prefer compressed dataUrl if available so image syncs seamlessly across all PCs via Atlas
          if (formPostImage && formPostImage.startsWith("data:")) {
            finalPostImage = formPostImage;
          } else if (uploadRes?.data?.dataUrl) {
            finalPostImage = uploadRes.data.dataUrl;
          } else if (uploadRes?.data?.url || uploadRes?.url) {
            finalPostImage = uploadRes?.data?.url || uploadRes?.url;
          }
        } catch (uploadErr) {
          console.warn("Direct upload fallback to payload:", uploadErr);
          if (formPostImage) finalPostImage = formPostImage;
        }
      }

      const username = (formUsername || currentUsername).trim() || "user";
      const targetChapter = formChapter || user?.chapter || businessData?.chapter || "";
      const matchedChapter = chapters.find(
        (c) => (c.name || "").toLowerCase() === targetChapter.toLowerCase()
      );
      const postState = matchedChapter?.state || formState || user?.state || businessData?.state || "Maharashtra";

      await createPostMutation.mutateAsync({
        caption: formCaption.trim(),
        image: finalPostImage,
        images: [finalPostImage],
        chapter: targetChapter,
        chapterId: matchedChapter?._id || user?.chapterId || null,
        state: postState,
        authorName: username,
        authorAvatar: formProfilePic || resolvedDefaultAvatar || "",
      });

      // Reset and close
      setIsNewPostOpen(false);
      setFormPostImage("");
      setFormPostImageFile(null);
      setFormCaption("");
      setUrlInputValue("");
      setUseUrlInput(false);
      toast.success("Your post has been published across all devices!");
    } catch (err) {
      toast.error(err?.message || "Failed to publish post. Please try again.");
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // Active user representation for commenting
  const activeUser = {
    id: userId,
    username: (formUsername || currentUsername).toLowerCase().replace(/\s+/g, "_"),
    avatar: formProfilePic || resolvedDefaultAvatar || null,
    role: userRole,
    state: userState,
    chapter: userChapter,
  };

  // =========================================================================
  // FEED FILTERING: All Feeds by default + State / Chapter Wise Right-Side Filters
  // =========================================================================
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // 1. Text Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const captionMatch = (post.caption || "").toLowerCase().includes(q);
        const authorMatch = (post.author?.username || post.author?.name || "").toLowerCase().includes(q);
        const chapterMatch = (post.chapter || "").toLowerCase().includes(q);
        const stateMatch = (post.state || "").toLowerCase().includes(q);
        if (!captionMatch && !authorMatch && !chapterMatch && !stateMatch) {
          return false;
        }
      }

      // 2. All Mode: Show all feeds
      if (filterMode === "all") {
        return true;
      }

      // 3. State Mode: Filter by selected state
      if (filterMode === "state") {
        if (!selectedState || selectedState === "ALL_STATES") return true;
        const postState = (
          post.state ||
          chapters.find((c) => (c.name || "").toLowerCase() === (post.chapter || "").toLowerCase())?.state ||
          ""
        ).toLowerCase().trim();
        const targetState = selectedState.toLowerCase().trim();
        return (
          postState === targetState ||
          postState.includes(targetState) ||
          targetState.includes(postState)
        );
      }

      // 4. Chapter Mode: Filter by selected chapter
      if (filterMode === "chapter") {
        if (!selectedChapter || selectedChapter === "ALL_CHAPTERS") return true;
        const postChapter = (post.chapter || "").toLowerCase().replace(/\b(chapter|chamber)\b/gi, "").trim();
        const targetChapter = selectedChapter.toLowerCase().replace(/\b(chapter|chamber)\b/gi, "").trim();
        return (
          postChapter === targetChapter ||
          postChapter.includes(targetChapter) ||
          targetChapter.includes(postChapter) ||
          (post.chapterId && String(post.chapterId) === selectedChapter)
        );
      }

      return true;
    });
  }, [posts, filterMode, selectedState, selectedChapter, searchQuery, chapters]);

  // =========================================================================
  // AUTOMATIC DELETION PERMISSIONS: ONLY central_admin & post creator
  // =========================================================================
  const hasDeletePermission = (post) => {
    // 1. Central Admin can delete any post
    if (userRole === "central_admin") {
      return true;
    }

    // 2. Creator of the post can delete their own post
    const postAuthorId = String(post.createdById || post.author?.id || post.author?._id || post.author || "");
    const currentUserId = String(userId || user?._id || user?.id || "");

    const isOwner = Boolean(
      (postAuthorId && currentUserId && postAuthorId === currentUserId) ||
      (post.createdByUsername && currentUsername && post.createdByUsername.toLowerCase() === currentUsername) ||
      (post.author?.username && currentUsername && post.author.username.toLowerCase() === currentUsername)
    );

    return isOwner;
  };

  return (
    <AppShell
      role={userRole === "central_admin" ? "admin" : "business"}
      title="Feeds"
      subtitle="Connect, share business milestones, and explore updates from fellow members"
      actions={
        <Button
          onClick={() => setIsNewPostOpen(true)}
          className="gap-2 font-semibold shadow-md bg-[#00A6F4] hover:bg-[#0096dc] text-white cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" /> Create Post
        </Button>
      }
    >
      <div className="-m-4 md:-m-6 lg:-m-8 p-4 md:p-6 lg:p-8 min-h-[calc(100vh-4rem)] bg-sky-100 text-slate-900 relative">
        {/* Top Inline Filter Navbar */}
        <div className="relative z-10 w-full max-w-4xl mx-auto mb-6">
          <FeedFilterBar
            filterMode={filterMode}
            setFilterMode={setFilterMode}
            selectedState={selectedState}
            setSelectedState={setSelectedState}
            selectedChapter={selectedChapter}
            setSelectedChapter={setSelectedChapter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            availableStates={availableStates}
            availableChapters={availableChapters}
            totalPostsCount={posts.length}
            filteredCount={filteredPosts.length}
            onReset={handleResetFilter}
            userState={userState}
            userChapter={userChapter}
          />
        </div>

        {/* Main Feed Stream Column (Wider Focused Layout) */}
        <div className="relative z-10 w-full max-w-4xl mx-auto space-y-6">
          <main className="w-full space-y-6">
            {isPostsLoading && posts.length === 0 ? (
              <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-12 text-center space-y-3 shadow-xs">
                <Loader2 className="h-8 w-8 animate-spin text-sky-600 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Loading live feeds...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/95 p-10 text-center space-y-4 shadow-xs">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 border border-slate-200">
                  <Camera className="h-8 w-8 text-slate-400 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">No Posts Found</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    {posts.length === 0
                      ? "No posts published in the network yet. Be the first to share an update!"
                      : "No posts match the current filter selection. Try choosing another state/chapter or resetting."}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-2">
                  {posts.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetFilter}
                      className="gap-1.5 text-xs font-semibold cursor-pointer border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Show All Posts
                    </Button>
                  )}
                  <Button
                    onClick={() => setIsNewPostOpen(true)}
                    className="gap-2 font-semibold text-xs cursor-pointer bg-sky-600 hover:bg-sky-500 text-white shadow-xs"
                  >
                    <PlusCircle className="h-4 w-4" /> Create Post
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredPosts.map((post) => (
                  <RifahFeedCard
                    key={post.id || post._id}
                    post={post}
                    currentUser={activeUser}
                    canDelete={hasDeletePermission(post)}
                    onLikeToggle={handleLikeToggle}
                    onAddComment={handleAddComment}
                    onDeletePost={handleDeletePost}
                    onSelectChapter={handleSelectChapter}
                    onSelectState={handleSelectState}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Direct Image & Post Creation Modal */}
      <Dialog open={isNewPostOpen} onOpenChange={setIsNewPostOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <PlusCircle className="h-5 w-5 text-sky-500" /> Create New Post
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreatePost} className="space-y-4 py-2">
            {/* 1. Author Details */}
            <div className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-3">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Post Author & Profile Photo
              </Label>

              <div className="flex items-center gap-3">
                {/* Profile Photo Preview or Default Icon */}
                <div className="relative group">
                  <UserAvatar
                    src={formProfilePic}
                    name={formUsername}
                    className="h-12 w-12 border-2 border-background shadow-xs"
                    iconClassName="h-6 w-6"
                  />
                  {formProfilePic && (
                    <button
                      type="button"
                      onClick={() => setFormProfilePic("")}
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 shadow-xs hover:opacity-90"
                      title="Remove profile picture (use default icon)"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={profilePicInputRef}
                      onChange={handleProfilePicFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => profilePicInputRef.current?.click()}
                      className="h-7 text-xs font-medium"
                    >
                      <Upload className="h-3.5 w-3.5 mr-1" />
                      {formProfilePic ? "Change Photo" : "Add Profile Photo"}
                    </Button>

                    {formProfilePic && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormProfilePic("")}
                        className="h-7 text-xs text-muted-foreground hover:text-destructive px-2"
                      >
                        Default Icon
                      </Button>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {formProfilePic ? "Custom profile photo" : "Default user icon will be used"}
                  </p>
                </div>
              </div>

              {/* Username Input */}
              <div className="space-y-1 pt-1">
                <Label htmlFor="post-username" className="text-xs font-medium">Username</Label>
                <Input
                  id="post-username"
                  type="text"
                  placeholder="e.g. shweta"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  className="text-xs h-8"
                  required
                />
              </div>

              {/* Chapter & State Assignment (if admin or selecting target) */}
              {(userRole === "central_admin" || userRole === "state_admin" || !user?.chapter) && (
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/50">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-muted-foreground" /> Chapter
                    </Label>
                    <Select
                      value={formChapter || (chapters[0]?.name || "")}
                      onValueChange={(val) => {
                        setFormChapter(val);
                        const c = chapters.find((ch) => ch.name === val);
                        if (c?.state) setFormState(c.state);
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select Chapter" />
                      </SelectTrigger>
                      <SelectContent className="max-h-48">
                        {chapters.map((c) => (
                          <SelectItem key={c._id || c.name} value={c.name}>
                            {c.name} ({c.state})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="post-state" className="text-xs font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" /> State
                    </Label>
                    <Input
                      id="post-state"
                      type="text"
                      placeholder="e.g. Maharashtra"
                      value={formState}
                      onChange={(e) => setFormState(e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. Direct Post Image Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Post Image</Label>
                <button
                  type="button"
                  onClick={() => setUseUrlInput(!useUrlInput)}
                  className="text-[11px] text-sky-600 hover:underline font-medium"
                >
                  {useUrlInput ? "Upload directly from device" : "Or paste image URL"}
                </button>
              </div>

              {!useUrlInput ? (
                <div>
                  <input
                    type="file"
                    ref={postImageInputRef}
                    onChange={handlePostImageFileChange}
                    accept="image/*"
                    className="hidden"
                  />

                  {formPostImage ? (
                    <div className="relative aspect-square max-h-56 w-full rounded-xl overflow-hidden border border-border bg-muted group">
                      <img
                        src={formPostImage}
                        alt="Post preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormPostImage("")}
                        className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-1.5 shadow-md transition-colors"
                        title="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => postImageInputRef.current?.click()}
                        className="absolute bottom-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-md px-2.5 py-1 text-xs font-medium transition-colors shadow-md"
                      >
                        Change Photo
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => postImageInputRef.current?.click()}
                      className="border-2 border-dashed border-border hover:border-sky-500/60 rounded-xl p-6 text-center cursor-pointer transition-colors bg-muted/10 hover:bg-muted/30 flex flex-col items-center justify-center gap-2"
                    >
                      <div className="h-10 w-10 rounded-full bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-foreground">Click to upload photo from your device</p>
                        <p className="text-[10px] text-muted-foreground">PNG, JPG, WEBP up to 10MB</p>
                      </div>
                      <Button type="button" variant="secondary" size="sm" className="h-7 text-xs mt-1">
                        <Upload className="h-3.5 w-3.5 mr-1" /> Browse Photo
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={urlInputValue}
                    onChange={(e) => setUrlInputValue(e.target.value)}
                    className="text-xs"
                  />
                  {urlInputValue && (
                    <div className="relative aspect-square max-h-56 w-full rounded-xl overflow-hidden border border-border bg-muted">
                      <img
                        src={urlInputValue}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Caption Textarea */}
            <div className="space-y-1.5">
              <Label htmlFor="post-caption" className="text-xs font-semibold">Caption</Label>
              <Textarea
                id="post-caption"
                rows={3}
                placeholder="Write a caption... (announcements, business milestones, updates)"
                value={formCaption}
                onChange={(e) => setFormCaption(e.target.value)}
                className="resize-none text-xs"
                required
              />
            </div>

            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewPostOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingPost || (!formPostImage && !urlInputValue.trim()) || !formCaption.trim()}
                className="font-semibold"
              >
                {isSubmittingPost ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Publishing...
                  </>
                ) : (
                  "Publish Post"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export default BizFeeds;
