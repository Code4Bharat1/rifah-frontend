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
import { useChapters, useStates, useMyBusiness } from "@shared/hooks/use-rifah-api";
import { resolveMediaUrl } from "@shared/lib/media";
import { toast } from "sonner";
import { cn } from "@shared/lib/utils";

// Local storage key for user-created posts
const STORAGE_KEY = "rifah_user_instagram_feed_v3";

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

// Role badge helper for displaying author level
function RoleBadge({ role }) {
  if (role === "central_admin") {
    return (
      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
        Central Admin
      </span>
    );
  }
  if (role === "state_admin") {
    return (
      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
        State Admin
      </span>
    );
  }
  if (role === "chapter_admin") {
    return (
      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
        Chapter Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-muted text-muted-foreground">
      Member
    </span>
  );
}

// Single Instagram Post Card
function InstagramPostCard({
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
  const commentInputRef = useRef(null);

  const images = Array.isArray(post.images) ? post.images : (post.image ? [post.image] : []);
  const totalImages = images.length;

  // Handle double-click on media to like with animated heart pop
  const handleDoubleClick = () => {
    setShowHeartPop(true);
    setTimeout(() => setShowHeartPop(false), 900);
    if (!post.isLiked) {
      onLikeToggle(post.id);
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

  // Caption truncated view
  const isLongCaption = (post.caption || "").length > 110;
  const displayCaption = isExpanded || !isLongCaption
    ? post.caption
    : `${(post.caption || "").slice(0, 110)}...`;

  return (
    <article className="rounded-xl border border-border bg-card shadow-xs overflow-hidden max-w-[500px] mx-auto w-full transition-shadow hover:shadow-sm">
      {/* 1. Header: Profile Photo & User Name */}
      <header className="flex items-center justify-between px-3.5 py-3 border-b border-border/60">
        <div className="flex items-center gap-3 min-w-0">
          {/* Profile Photo (with default icon fallback) */}
          <div className="relative shrink-0 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
            <UserAvatar
              src={post.author?.avatar}
              name={post.author?.username || post.author?.name}
              className="h-9 w-9 border-2 border-background"
              iconClassName="h-4 w-4"
            />
          </div>

          {/* User Name, Role Badge, Chapter & Time */}
          <div className="min-w-0 flex flex-col leading-tight">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-bold text-foreground hover:underline cursor-pointer truncate">
                {post.author?.username || "user"}
              </span>
              <RoleBadge role={post.createdByRole || post.author?.role || "business"} />
              {post.author?.verified && (
                <BadgeCheck className="h-4 w-4 fill-sky-500 text-background shrink-0" />
              )}
              <span className="text-muted-foreground text-xs font-normal">•</span>
              <span className="text-xs text-muted-foreground">{post.author?.timeAgo || "Just now"}</span>
            </div>

            {/* Chapter / Location subtitle with interactive quick-filtering */}
            {(post.chapter || post.state || post.author?.subtitle) && (
              <div className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                {post.chapter ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectChapter?.(post.chapter);
                    }}
                    className="hover:text-primary hover:underline transition-colors cursor-pointer truncate"
                    title={`Filter by chapter: ${post.chapter}`}
                  >
                    {post.chapter}
                  </button>
                ) : null}
                {post.chapter && post.state && <span>•</span>}
                {post.state ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectState?.(post.state);
                    }}
                    className="hover:text-primary hover:underline transition-colors cursor-pointer truncate"
                    title={`Filter by state: ${post.state}`}
                  >
                    {post.state}
                  </button>
                ) : (
                  !post.chapter && <span>{post.author?.subtitle}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Delete button (automatically controlled by user role & scope) */}
        {canDelete && (
          <button
            onClick={() => onDeletePost(post.id)}
            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors cursor-pointer"
            title="Delete post"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </header>

      {/* 2. Media: Directly uploaded image */}
      <div
        onDoubleClick={handleDoubleClick}
        className="relative w-full aspect-square bg-muted/30 select-none overflow-hidden group cursor-pointer"
      >
        {totalImages > 0 && images[currentSlide] ? (
          <img
            src={images[currentSlide]}
            alt="Post photo"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Camera className="h-10 w-10 stroke-[1.5]" />
            <span className="text-xs">No image provided</span>
          </div>
        )}

        {/* Double-Click Heart Pop */}
        {showHeartPop && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 animate-in zoom-in-50 duration-200">
            <Heart className="h-24 w-24 fill-white text-white drop-shadow-2xl animate-pulse" />
          </div>
        )}

        {/* Carousel Navigation Arrows if multiple images */}
        {totalImages > 1 && (
          <>
            {currentSlide > 0 && (
              <button
                onClick={handlePrevSlide}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/65 hover:bg-black/85 text-white flex items-center justify-center transition-opacity shadow-md z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            {currentSlide < totalImages - 1 && (
              <button
                onClick={handleNextSlide}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/65 hover:bg-black/85 text-white flex items-center justify-center transition-opacity shadow-md z-10"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}

            {/* Pagination Dots */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-200",
                    idx === currentSlide ? "w-3 bg-sky-500 shadow-xs" : "w-1.5 bg-white/70"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 3. Action Bar: Likes and Comments only */}
      <div className="px-3.5 pt-3 pb-1.5 space-y-2">
        <div className="flex items-center gap-4">
          {/* Like Heart Button */}
          <button
            onClick={() => onLikeToggle(post.id)}
            className="group flex items-center gap-1.5 text-foreground hover:opacity-80 transition-transform active:scale-125 cursor-pointer"
            aria-label={post.isLiked ? "Unlike post" : "Like post"}
          >
            <Heart
              className={cn(
                "h-6 w-6 transition-colors",
                post.isLiked ? "fill-rose-600 text-rose-600" : "text-foreground"
              )}
            />
          </button>

          {/* Comment Bubble */}
          <button
            onClick={() => {
              setShowAllComments(true);
              commentInputRef.current?.focus();
            }}
            className="flex items-center gap-1.5 text-foreground hover:opacity-80 transition-opacity cursor-pointer"
            aria-label="Comment"
          >
            <MessageCircle className="h-6 w-6 -rotate-90" />
            <span className="text-xs font-semibold">{post.comments?.length || 0}</span>
          </button>
        </div>

        {/* 4. Likes Count Display (Live) */}
        <div className="text-sm font-semibold text-foreground">
          {post.likesCount === 0 ? (
            <span>Be the first to like this</span>
          ) : (
            <span>{post.likesCount.toLocaleString()} {post.likesCount === 1 ? "like" : "likes"}</span>
          )}
        </div>

        {/* 5. Caption: User Name + Text */}
        <div className="text-sm text-foreground leading-relaxed break-words">
          <span className="font-bold mr-1.5 cursor-pointer hover:underline">
            {post.author?.username || "user"}
          </span>
          <span className="font-normal">{displayCaption}</span>
          {isLongCaption && !isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-xs text-muted-foreground ml-1.5 font-medium hover:text-foreground cursor-pointer"
            >
              more
            </button>
          )}
          {isExpanded && isLongCaption && (
            <button
              onClick={() => setIsExpanded(false)}
              className="text-xs text-muted-foreground ml-1.5 font-medium hover:text-foreground cursor-pointer"
            >
              less
            </button>
          )}
        </div>

        {/* 6. Comments Section */}
        <div className="space-y-1.5 pt-1">
          {post.comments?.length > 1 && !showAllComments && (
            <button
              onClick={() => setShowAllComments(true)}
              className="text-xs text-muted-foreground font-medium hover:text-foreground cursor-pointer"
            >
              View all {post.comments.length} comments
            </button>
          )}

          {/* Comment list */}
          <div className="space-y-2 pt-1">
            {(showAllComments ? post.comments : (post.comments || []).slice(-1)).map((comment) => (
              <div key={comment.id} className="flex items-start justify-between gap-2 text-xs">
                <div className="flex items-start gap-2 min-w-0">
                  <UserAvatar
                    src={comment.avatar}
                    name={comment.username}
                    className="h-5 w-5 mt-0.5 border"
                    iconClassName="h-3 w-3"
                  />
                  <p className="leading-snug break-words">
                    <span className="font-bold mr-1.5 text-foreground hover:underline cursor-pointer">
                      {comment.username}
                    </span>
                    <span className="text-foreground/90 font-normal">{comment.text}</span>
                  </p>
                </div>
                {comment.timeAgo && (
                  <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                    {comment.timeAgo}
                  </span>
                )}
              </div>
            ))}
          </div>

          {showAllComments && post.comments?.length > 2 && (
            <button
              onClick={() => setShowAllComments(false)}
              className="text-[11px] text-muted-foreground hover:text-foreground font-medium pt-1 cursor-pointer"
            >
              Hide comments
            </button>
          )}
        </div>
      </div>

      {/* 7. Working Live 'Add a comment...' Input Bar */}
      <form
        onSubmit={handlePostComment}
        className="flex items-center gap-2 px-3.5 py-2.5 border-t border-border/60 mt-2 bg-muted/20"
      >
        <UserAvatar
          src={currentUser?.avatar}
          name={currentUser?.username}
          className="h-6 w-6 border"
          iconClassName="h-3.5 w-3.5"
        />

        <input
          ref={commentInputRef}
          type="text"
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-hidden focus:outline-hidden"
        />

        <button
          type="submit"
          disabled={!commentInput.trim()}
          className={cn(
            "text-xs font-bold transition-opacity cursor-pointer shrink-0",
            commentInput.trim()
              ? "text-sky-600 hover:text-sky-700 opacity-100"
              : "text-sky-500/40 opacity-0 pointer-events-none"
          )}
        >
          Post
        </button>
      </form>
    </article>
  );
}

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
    <div className="rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-xs p-2 sm:px-3 sm:py-2.5 transition-all">
      {/* Main Inline Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Left Section: Segmented View Switcher & Contextual Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Segmented View Control */}
          <div className="inline-flex items-center bg-muted/60 p-0.5 rounded-xl border border-border/60">
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
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
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
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
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
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
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
                <SelectTrigger className="h-8.5 text-xs w-[160px] sm:w-[190px] rounded-lg bg-background">
                  <MapPin className="h-3 w-3 mr-1 text-primary shrink-0" />
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
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
                  <SelectTrigger className="h-8.5 text-xs w-[130px] sm:w-[150px] rounded-lg bg-background">
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
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
                <SelectTrigger className="h-8.5 text-xs w-[170px] sm:w-[210px] rounded-lg bg-background">
                  <Building2 className="h-3 w-3 mr-1 text-primary shrink-0" />
                  <SelectValue placeholder="Select Chapter" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
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
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted"
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
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted"
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
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search feeds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-7 text-xs h-8.5 rounded-lg bg-background"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Posts Count Badge */}
          <Badge
            variant="outline"
            className="h-8.5 px-2.5 text-[11px] font-medium text-muted-foreground border-border bg-background shrink-0 hidden sm:inline-flex items-center"
          >
            {filteredCount} {filteredCount === 1 ? "post" : "posts"}
          </Badge>

          {/* Reset Action */}
          {isFiltering && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8.5 px-2.5 text-xs text-muted-foreground hover:text-destructive font-medium cursor-pointer shrink-0"
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
        <div className="mt-2 pt-2 border-t border-border/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider shrink-0 mr-1">
            States:
          </span>
          <button
            type="button"
            onClick={() => setSelectedState("")}
            className={cn(
              "px-2 py-0.5 rounded-md text-[11px] font-medium transition-all shrink-0 cursor-pointer",
              !selectedState ? "bg-primary text-primary-foreground font-semibold" : "bg-muted/70 hover:bg-muted text-foreground"
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
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-muted/70 hover:bg-muted text-foreground"
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

  // Load posts from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setPosts(JSON.parse(saved));
      } else {
        setPosts([]);
      }
    } catch {
      setPosts([]);
    }
  }, []);

  // Save changes to localStorage
  const savePosts = (updatedPosts) => {
    setPosts(updatedPosts);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
    } catch {}
  };

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

  // Post Image File Upload Handler
  const handlePostImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormPostImage(event.target.result);
      toast.success("Post image selected!");
    };
    reader.readAsDataURL(file);
  };

  // Live: Toggle Like
  const handleLikeToggle = (postId) => {
    const updated = posts.map((p) => {
      if (p.id === postId) {
        const isLiked = !p.isLiked;
        const likesCount = isLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1);
        return { ...p, isLiked, likesCount };
      }
      return p;
    });
    savePosts(updated);
  };

  // Live: Add Comment
  const handleAddComment = (postId, text) => {
    const newComment = {
      id: "c-" + Date.now(),
      username: formUsername || currentUsername,
      avatar: formProfilePic || resolvedDefaultAvatar || null,
      text,
      timeAgo: "Just now",
    };

    const updated = posts.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [...(p.comments || []), newComment],
        };
      }
      return p;
    });

    savePosts(updated);
    toast.success("Comment posted!");
  };

  // Delete post
  const handleDeletePost = (postId) => {
    const updated = posts.filter((p) => p.id !== postId);
    savePosts(updated);
    toast.success("Post deleted");
  };

  // Live: Create and Publish Post with Scope Tags
  const handleCreatePost = (e) => {
    e.preventDefault();

    const finalPostImage = formPostImage || urlInputValue.trim();

    if (!finalPostImage) {
      toast.error("Please add an image for your post.");
      return;
    }

    if (!formCaption.trim()) {
      toast.error("Please enter a caption for your post.");
      return;
    }

    const username = (formUsername || currentUsername).trim() || "user";
    const formattedUsername = username.toLowerCase().replace(/\s+/g, "_");

    // Resolve chapter and state for this post automatically
    const targetChapter = formChapter || user?.chapter || businessData?.chapter || "";
    const matchedChapter = chapters.find(
      (c) => (c.name || "").toLowerCase() === targetChapter.toLowerCase()
    );
    const postState = matchedChapter?.state || formState || user?.state || businessData?.state || "Maharashtra";

    const newPost = {
      id: "post-" + Date.now(),
      createdById: userId || ("u-" + Date.now()),
      createdByRole: userRole,
      createdByUsername: formattedUsername,
      chapter: targetChapter,
      state: postState,
      author: {
        username: formattedUsername,
        name: username,
        avatar: formProfilePic || null,
        role: userRole,
        verified: (userRole === "central_admin" || userRole === "state_admin" || userRole === "chapter_admin"),
        subtitle: targetChapter ? `${targetChapter} • ${postState}` : postState,
        timeAgo: "Just now",
      },
      images: [finalPostImage],
      caption: formCaption.trim(),
      likesCount: 0,
      isLiked: false,
      comments: [],
      createdAt: new Date().toISOString(),
    };

    const updated = [newPost, ...posts];
    savePosts(updated);

    // Reset and close
    setIsNewPostOpen(false);
    setFormPostImage("");
    setFormCaption("");
    setUrlInputValue("");
    setUseUrlInput(false);
    toast.success("Your post has been published!");
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
  // AUTOMATIC DELETION PERMISSIONS
  // =========================================================================
  const hasDeletePermission = (post) => {
    // 1. Central Admin can delete ALL posts automatically
    if (userRole === "central_admin") {
      return true;
    }

    // 2. Author can always delete their own post
    const isOwner = Boolean(
      (post.createdById && userId && String(post.createdById) === userId) ||
      (post.createdByUsername && currentUsername && post.createdByUsername.toLowerCase() === currentUsername)
    );
    if (isOwner) {
      return true;
    }

    // 3. State Admin can delete any post within their state scope
    if (userRole === "state_admin") {
      if (!userState) return false;

      const stateChapters = chapters
        .filter((c) => (c.state || "").toLowerCase().trim() === userState)
        .map((c) => (c.name || "").toLowerCase().replace(/\b(chapter|chamber)\b/gi, "").trim());

      const postState = (post.state || "").toLowerCase().trim();
      const isSameState = postState && (postState === userState || userState.includes(postState) || postState.includes(userState));

      const postChapterClean = (post.chapter || "").toLowerCase().replace(/\b(chapter|chamber)\b/gi, "").trim();
      const isChapterInState = stateChapters.some(
        (sc) => sc && postChapterClean && (sc === postChapterClean || postChapterClean.includes(sc) || sc.includes(postChapterClean))
      );

      return isSameState || isChapterInState;
    }

    // 4. Chapter Admin can delete any post within their chapter scope
    if (userRole === "chapter_admin") {
      const userChapterClean = userChapter.replace(/\b(chapter|chamber)\b/gi, "").trim();
      if (!userChapterClean) return false;

      const postChapterClean = (post.chapter || "").toLowerCase().replace(/\b(chapter|chamber)\b/gi, "").trim();
      return Boolean(
        (post.chapterId && userChapterId && String(post.chapterId) === userChapterId) ||
        (userChapterClean && postChapterClean && (
          userChapterClean === postChapterClean ||
          postChapterClean.includes(userChapterClean) ||
          userChapterClean.includes(postChapterClean)
        ))
      );
    }

    // 5. Business members can only delete their own posts (handled by isOwner above)
    return false;
  };

  return (
    <AppShell
      role={userRole === "central_admin" ? "admin" : "business"}
      title="Feeds"
      subtitle="Connect, share business milestones, and explore updates from fellow members"
      actions={
        <Button onClick={() => setIsNewPostOpen(true)} className="gap-2 font-semibold shadow-xs">
          <PlusCircle className="h-4 w-4" /> Create Post
        </Button>
      }
    >
      {/* Top Inline Filter Navbar */}
      <div className="w-full max-w-5xl mx-auto mb-6">
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

      {/* Main Feed Stream Column */}
      <div className="max-w-[500px] mx-auto space-y-6">
        <main className="w-full space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center space-y-4 shadow-xs">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted border border-border">
                <Camera className="h-8 w-8 text-muted-foreground stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">No Posts Found</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
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
                    className="gap-1.5 text-xs font-semibold cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Show All Posts
                  </Button>
                )}
                <Button
                  onClick={() => setIsNewPostOpen(true)}
                  className="gap-2 font-semibold text-xs cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4" /> Create Post
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <InstagramPostCard
                  key={post.id}
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
                disabled={(!formPostImage && !urlInputValue.trim()) || !formCaption.trim()}
                className="font-semibold"
              >
                Publish Post
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export default BizFeeds;
