"use client";

// Event Gallery — one folder per event, shared by the admin and the business-panel
// Operations Centres. Who sees which folder is decided by the backend from the event's
// visibility scope (central / state / chapter); who may upload is the event's assigned
// media team.
import { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  Film,
  Globe2,
  ImageIcon,
  Loader2,
  MapPin,
  MapPinned,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@shared/components/ui/dialog";
import { galleryApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/media";
import { useChapters, useStates } from "@shared/hooks/use-rifah-api";
import { useAuth } from "@shared/providers/auth-provider";

const SCOPE_META = {
  global: { label: "Central", icon: Globe2, className: "bg-blue-500/10 text-blue-500 border-blue-500/30" },
  state: { label: "State", icon: MapPin, className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" },
  chapter: { label: "Chapter", icon: MapPinned, className: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30" },
};

function ScopeTag({ scope }) {
  const meta = SCOPE_META[scope] || SCOPE_META.global;
  return (
    <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase border ${meta.className}`}>
      <meta.icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}

function formatEventDate(value) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function EventGallery() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [openEventId, setOpenEventId] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Search controls. `search` is what the user is typing; `filters` is what we query with,
  // so every keystroke does not fire a request.
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ q: "", from: "", to: "", state: "All", chapter: "All", scope: "all" });
  const [draft, setDraft] = useState({ from: "", to: "", state: "All", chapter: "All", scope: "all" });

  const { data: statesData } = useStates();
  const { data: chaptersData } = useChapters();

  // useStates() yields rows keyed `state` (not `name`); keep the guards loose and always
  // end up with a de-duplicated list of plain strings, since a Select item must not
  // receive an object or an empty value.
  const toName = (row, ...keys) => {
    if (typeof row === "string") return row.trim();
    for (const key of keys) {
      const value = row?.[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
    return "";
  };
  const uniqueSorted = (list) => Array.from(new Set(list.filter(Boolean))).sort((a, b) => a.localeCompare(b));

  const states = useMemo(
    () => uniqueSorted((Array.isArray(statesData) ? statesData : []).map((s) => toName(s, "state", "name"))),
    [statesData]
  );
  const chapters = useMemo(() => {
    const list = Array.isArray(chaptersData) ? chaptersData : [];
    // Chapters cascade off the chosen state, matching the rest of the app.
    const scoped =
      draft.state && draft.state !== "All"
        ? list.filter((c) => toName(c, "state") === draft.state)
        : list;
    return uniqueSorted(scoped.map((c) => toName(c, "name", "chapter")));
  }, [chaptersData, draft.state]);

  const { data: foldersRes, isLoading: loadingFolders } = useQuery({
    queryKey: ["gallery", "folders", filters],
    queryFn: () => galleryApi.listFolders({ ...filters, limit: 60 }),
  });
  const folders = foldersRes?.data || [];

  const { data: folderRes, isLoading: loadingFolder } = useQuery({
    queryKey: ["gallery", "folder", openEventId],
    queryFn: () => galleryApi.getFolder(openEventId),
    enabled: Boolean(openEventId),
  });
  const folder = folderRes?.data || null;

  const applyFilters = () => setFilters({ ...draft, q: search.trim() });
  const resetFilters = () => {
    const cleared = { from: "", to: "", state: "All", chapter: "All", scope: "all" };
    setDraft(cleared);
    setSearch("");
    setFilters({ ...cleared, q: "" });
  };

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (files.length === 0) return;

    try {
      setUploading(true);
      const res = await galleryApi.addMedia(openEventId, files);
      toast.success(res?.message || "Added to the gallery");
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    } catch (err) {
      toast.error(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (mediaId) => {
    try {
      await galleryApi.removeMedia(mediaId);
      toast.success("Removed from the gallery");
      setLightbox(null);
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    } catch (err) {
      toast.error(err?.message || "Could not remove this item");
    }
  };

  // ─── Inside one event's folder ──────────────────────────────────────────────
  if (openEventId) {
    return (
      <div className="space-y-5">
        <Button variant="ghost" size="sm" className="gap-2 -ml-2" onClick={() => setOpenEventId(null)}>
          <ArrowLeft className="h-4 w-4" /> All event folders
        </Button>

        {loadingFolder || !folder ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <ScopeTag scope={folder.event.scope} />
                    <span className="text-xs text-muted-foreground">{folder.event.status}</span>
                  </div>
                  <h2 className="text-lg font-bold text-foreground">{folder.event.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatEventDate(folder.event.date)} {folder.event.time ? `· ${folder.event.time}` : ""}
                    </span>
                    {folder.event.venue && <span>{folder.event.venue}</span>}
                    <span className="inline-flex items-center gap-1.5">
                      <MapPinned className="h-3.5 w-3.5" />
                      {folder.event.chapter}
                      {folder.event.state ? ` · ${folder.event.state}` : ""}
                    </span>
                  </p>
                </div>

                {folder.canUpload && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={handleUpload}
                    />
                    <Button className="gap-2" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {uploading ? "Uploading..." : "Add photos / videos"}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {folder.media.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-2xl bg-muted/20">
                <Camera className="h-10 w-10 text-muted-foreground mb-4 opacity-40" />
                <h3 className="text-base font-bold text-foreground">Nothing here yet</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  {folder.canUpload
                    ? "You are on the media team for this event — add the first photos or videos."
                    : "The media team has not posted photos or videos from this event yet."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {folder.media.map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => setLightbox(item)}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted/30 hover:border-primary/50 transition-colors"
                  >
                    {item.type === "video" ? (
                      <>
                        <video src={resolveMediaUrl(item.url)} className="h-full w-full object-cover" muted preload="metadata" />
                        <span className="absolute inset-0 grid place-items-center bg-black/30">
                          <Film className="h-7 w-7 text-white drop-shadow" />
                        </span>
                      </>
                    ) : (
                      <img
                        src={resolveMediaUrl(item.url)}
                        alt={item.caption || "Event photo"}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    )}
                    {item.caption && (
                      <span className="absolute inset-x-0 bottom-0 truncate bg-linear-to-t from-black/70 to-transparent px-2 py-1.5 text-left text-[11px] text-white">
                        {item.caption}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        <Dialog open={Boolean(lightbox)} onOpenChange={(open) => !open && setLightbox(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-sm">{lightbox?.caption || "Event media"}</DialogTitle>
            </DialogHeader>
            {lightbox && (
              <div className="space-y-3">
                {lightbox.type === "video" ? (
                  <video src={resolveMediaUrl(lightbox.url)} controls className="w-full rounded-lg max-h-[65vh]" />
                ) : (
                  <img
                    src={resolveMediaUrl(lightbox.url)}
                    alt={lightbox.caption || "Event photo"}
                    className="w-full rounded-lg object-contain max-h-[65vh]"
                  />
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Posted by {lightbox.uploadedBy?.name || "Media team"}</span>
                  {(user?.role === "central_admin" ||
                    user?.role === "state_admin" ||
                    user?.role === "chapter_admin" ||
                    String(lightbox.uploadedBy?._id || lightbox.uploadedBy) === String(user?._id || user?.id)) && (
                    <Button variant="ghost" size="sm" className="gap-1.5 text-red-500 hover:text-red-600" onClick={() => handleDelete(lightbox._id)}>
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ─── Folder index ───────────────────────────────────────────────────────────
  const hasActiveFilters =
    filters.q || filters.from || filters.to || filters.state !== "All" || filters.chapter !== "All" || filters.scope !== "all";

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="gallery-search"
              placeholder="Search events by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className="pl-9"
            />
          </div>
          <Button onClick={applyFilters} className="gap-2">
            <Search className="h-4 w-4" /> Search
          </Button>
          {hasActiveFilters && (
            <Button variant="outline" onClick={resetFilters} className="gap-2">
              <X className="h-4 w-4" /> Clear
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          <div className="space-y-1">
            <label htmlFor="gallery-from" className="text-[11px] font-semibold text-muted-foreground">From date</label>
            <Input
              id="gallery-from"
              type="date"
              value={draft.from}
              onChange={(e) => setDraft((p) => ({ ...p, from: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="gallery-to" className="text-[11px] font-semibold text-muted-foreground">To date</label>
            <Input
              id="gallery-to"
              type="date"
              value={draft.to}
              onChange={(e) => setDraft((p) => ({ ...p, to: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground">Level</label>
            <Select value={draft.scope} onValueChange={(v) => setDraft((p) => ({ ...p, scope: v }))}>
              <SelectTrigger id="gallery-scope"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                <SelectItem value="central">Central</SelectItem>
                <SelectItem value="state">State</SelectItem>
                <SelectItem value="chapter">Chapter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground">State</label>
            <Select
              value={draft.state}
              onValueChange={(v) => setDraft((p) => ({ ...p, state: v, chapter: "All" }))}
            >
              <SelectTrigger id="gallery-state"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-64">
                <SelectItem value="All">All states</SelectItem>
                {states.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground">Chapter</label>
            <Select value={draft.chapter} onValueChange={(v) => setDraft((p) => ({ ...p, chapter: v }))}>
              <SelectTrigger id="gallery-chapter"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-64">
                <SelectItem value="All">All chapters</SelectItem>
                {chapters.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {loadingFolders ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : folders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-2xl bg-muted/20">
          <ImageIcon className="h-10 w-10 text-muted-foreground mb-4 opacity-40" />
          <h3 className="text-base font-bold text-foreground">No event galleries found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            {hasActiveFilters
              ? "Try widening your search — a different date range, state or level."
              : "Once a media team posts photos from an event, its folder will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map((f) => (
            <button
              key={f.eventId}
              type="button"
              onClick={() => setOpenEventId(f.eventId)}
              className="group overflow-hidden rounded-2xl border border-border bg-card text-left shadow-xs hover:border-primary/50 hover:shadow-md transition-all"
            >
              <div className="relative aspect-video bg-muted/40 overflow-hidden">
                {f.coverImage ? (
                  <img
                    src={resolveMediaUrl(f.coverImage)}
                    alt={f.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <span className="grid h-full w-full place-items-center">
                    <Camera className="h-8 w-8 text-muted-foreground opacity-40" />
                  </span>
                )}
                <span className="absolute top-2 left-2">
                  <ScopeTag scope={f.scope} />
                </span>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-sm text-foreground line-clamp-2">{f.title}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                  {formatEventDate(f.date)}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <MapPinned className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">
                    {f.chapter}
                    {f.state ? ` · ${f.state}` : ""}
                  </span>
                </p>
                <div className="flex items-center gap-3 pt-1 text-[11px] font-semibold text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <ImageIcon className="h-3.5 w-3.5" /> {f.photoCount}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Film className="h-3.5 w-3.5" /> {f.videoCount}
                  </span>
                  {f.canUpload && f.mediaCount === 0 && (
                    <span className="ml-auto text-primary">Ready to upload</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default EventGallery;
