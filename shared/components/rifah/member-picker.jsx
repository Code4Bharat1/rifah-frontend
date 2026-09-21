"use client";
import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  ChevronsUpDown,
  Search,
  Building2,
  MapPin,
  User,
  Loader2,
  X,
  Sparkles,
  Briefcase,
} from "lucide-react";

import { Label } from "@shared/components/ui/label";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/components/ui/popover";
import { cn } from "@shared/lib/utils";
import { useChapters } from "@shared/hooks/use-rifah-api";
import { businessApi } from "@shared/lib/api-services";

function getInitials(name = "") {
  if (!name) return "MB";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

const AVATAR_PALETTES = [
  "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
  "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
  "bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
  "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
  "bg-teal-50 text-teal-700 border-teal-200/80 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800",
  "bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800",
  "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
];

function getAvatarColor(name = "") {
  if (!name) return AVATAR_PALETTES[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
}

/**
 * Cascading Searchable State -> Chapter -> Member picker used across Networking features
 * (One to One meetings, Thank You Notes, Referrals) to select a fellow RIFAH member.
 * Supports interactive search in all 3 fields: State, Chapter, and Member.
 */
export function MemberPicker({
  value = null,
  onChange,
  excludeBusinessId,
  idPrefix = "member-picker",
  disabled = false,
}) {
  const { data: chaptersData, isLoading: chaptersLoading } = useChapters();
  const chapters = Array.isArray(chaptersData) ? chaptersData : [];

  // Extract distinct sorted states from chapters
  const states = useMemo(
    () => Array.from(new Set(chapters.map((c) => (c.state || "").trim()).filter(Boolean))).sort(),
    [chapters]
  );

  const [selectedState, setSelectedState] = useState("");
  const [selectedChapterName, setSelectedChapterName] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);

  // Popover open states
  const [stateOpen, setStateOpen] = useState(false);
  const [chapterOpen, setChapterOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);

  // Search input values
  const [stateSearch, setStateSearch] = useState("");
  const [chapterSearch, setChapterSearch] = useState("");
  const [memberSearch, setMemberSearch] = useState("");

  // Sync external value
  useEffect(() => {
    if (!value) {
      setSelectedMember(null);
    } else if (value._id !== selectedMember?._id) {
      setSelectedMember(value);
      if (value.state && !selectedState) setSelectedState(value.state);
      if (value.chapter && !selectedChapterName) setSelectedChapterName(value.chapter);
    }
  }, [value]);

  // Chapters filtered by selected state
  const chaptersForState = useMemo(
    () =>
      selectedState
        ? chapters.filter((c) => (c.state || "").trim().toLowerCase() === selectedState.trim().toLowerCase())
        : chapters,
    [chapters, selectedState]
  );

  // Filtered states for dropdown search
  const filteredStates = useMemo(() => {
    const q = stateSearch.trim().toLowerCase();
    if (!q) return states;
    return states.filter((s) => s.toLowerCase().includes(q));
  }, [states, stateSearch]);

  // Filtered chapters for dropdown search
  const filteredChapters = useMemo(() => {
    const q = chapterSearch.trim().toLowerCase();
    if (!q) return chaptersForState;
    return chaptersForState.filter((c) => (c.name || "").toLowerCase().includes(q));
  }, [chaptersForState, chapterSearch]);

  // Fetch members for the selected chapter
  const { data: chapterMembersData, isLoading: chapterMembersLoading } = useQuery({
    queryKey: ["networking-chapter-members", selectedChapterName],
    queryFn: async () => {
      const res = await businessApi.list({ chapter: selectedChapterName, limit: 200 });
      return res?.data || res || [];
    },
    enabled: Boolean(selectedChapterName),
  });

  // Global search query for members if no chapter is selected or if user is searching broadly
  const isGlobalSearchActive = !selectedChapterName && memberSearch.trim().length >= 2;
  const { data: globalMembersData, isLoading: globalMembersLoading } = useQuery({
    queryKey: ["networking-global-members", memberSearch.trim()],
    queryFn: async () => {
      const res = await businessApi.list({ search: memberSearch.trim(), limit: 30 });
      return res?.data || res || [];
    },
    enabled: isGlobalSearchActive,
  });

  // Combine and filter members
  const rawMembersList = selectedChapterName
    ? Array.isArray(chapterMembersData)
      ? chapterMembersData
      : []
    : Array.isArray(globalMembersData)
      ? globalMembersData
      : [];

  const eligibleMembers = useMemo(() => {
    return rawMembersList.filter((b) => String(b._id) !== String(excludeBusinessId));
  }, [rawMembersList, excludeBusinessId]);

  // Client-side search within chapter members
  const displayedMembers = useMemo(() => {
    if (!selectedChapterName) return eligibleMembers;
    const q = memberSearch.trim().toLowerCase();
    if (!q) return eligibleMembers;
    return eligibleMembers.filter((m) => {
      const name = (m.name || "").toLowerCase();
      const contact = (m.contactPerson || "").toLowerCase();
      const industry = (m.industry || "").toLowerCase();
      const city = (m.city || "").toLowerCase();
      return name.includes(q) || contact.includes(q) || industry.includes(q) || city.includes(q);
    });
  }, [eligibleMembers, memberSearch, selectedChapterName]);

  const isMembersLoading = selectedChapterName ? chapterMembersLoading : globalMembersLoading;

  const handleSelectState = (st) => {
    setSelectedState(st);
    setSelectedChapterName("");
    setSelectedMember(null);
    onChange(null);
    setStateOpen(false);
    setStateSearch("");
  };

  const handleClearState = (e) => {
    e.stopPropagation();
    setSelectedState("");
    setSelectedChapterName("");
    setSelectedMember(null);
    onChange(null);
  };

  const handleSelectChapter = (chName) => {
    setSelectedChapterName(chName);
    setSelectedMember(null);
    onChange(null);
    setChapterOpen(false);
    setChapterSearch("");
  };

  const handleClearChapter = (e) => {
    e.stopPropagation();
    setSelectedChapterName("");
    setSelectedMember(null);
    onChange(null);
  };

  const handleSelectMember = (member) => {
    setSelectedMember(member);
    if (member.state && !selectedState) {
      setSelectedState(member.state);
    }
    if (member.chapter && !selectedChapterName) {
      setSelectedChapterName(member.chapter);
    }
    onChange(member);
    setMemberOpen(false);
    setMemberSearch("");
  };

  const handleClearMember = (e) => {
    e.stopPropagation();
    setSelectedMember(null);
    onChange(null);
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {/* 1. STATE SELECTOR (SEARCHABLE) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor={`${idPrefix}-state`} className="text-xs font-medium text-foreground">
              State *
            </Label>
            {selectedState && !disabled && (
              <button
                type="button"
                onClick={handleClearState}
                className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-0.5"
              >
                Clear
              </button>
            )}
          </div>
          <Popover open={stateOpen} onOpenChange={setStateOpen}>
            <PopoverTrigger asChild>
              <Button
                id={`${idPrefix}-state`}
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={stateOpen}
                disabled={disabled || chaptersLoading}
                className={cn(
                  "h-10 w-full justify-between font-normal bg-background px-3",
                  !selectedState && "text-muted-foreground"
                )}
              >
                <span className="truncate flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  {selectedState || "Select state"}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  {selectedState && !disabled && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={handleClearState}
                      className="p-0.5 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="z-[70] w-[calc(100vw-2rem)] sm:w-[280px] p-0 shadow-lg border-border"
              align="start"
            >
              <div className="p-2 border-b border-border bg-muted/30">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search state..."
                    value={stateSearch}
                    onChange={(e) => setStateSearch(e.target.value)}
                    className="h-8 pl-8 pr-7 text-xs bg-background"
                    autoFocus
                  />
                  {stateSearch && (
                    <button
                      type="button"
                      onClick={() => setStateSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto p-1 text-sm">
                {filteredStates.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    No states matching "{stateSearch}"
                  </div>
                ) : (
                  filteredStates.map((st) => {
                    const isSelected = selectedState.toLowerCase() === st.toLowerCase();
                    return (
                      <div
                        key={st}
                        onClick={() => handleSelectState(st)}
                        className={cn(
                          "flex items-center justify-between px-2.5 py-2 rounded-md cursor-pointer text-xs transition-colors",
                          isSelected
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-muted text-foreground"
                        )}
                      >
                        <span className="truncate">{st}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                      </div>
                    );
                  })
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* 2. CHAPTER SELECTOR (SEARCHABLE) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor={`${idPrefix}-chapter`} className="text-xs font-medium text-foreground">
              Chapter *
            </Label>
            {selectedChapterName && !disabled && (
              <button
                type="button"
                onClick={handleClearChapter}
                className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-0.5"
              >
                Clear
              </button>
            )}
          </div>
          <Popover open={chapterOpen} onOpenChange={setChapterOpen}>
            <PopoverTrigger asChild>
              <Button
                id={`${idPrefix}-chapter`}
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={chapterOpen}
                disabled={disabled || !selectedState}
                className={cn(
                  "h-10 w-full justify-between font-normal bg-background px-3",
                  !selectedChapterName && "text-muted-foreground"
                )}
              >
                <span className="truncate flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  {selectedChapterName || (selectedState ? "Select chapter" : "Select a state first")}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  {selectedChapterName && !disabled && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={handleClearChapter}
                      className="p-0.5 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="z-[70] w-[calc(100vw-2rem)] sm:w-[300px] p-0 shadow-lg border-border"
              align="start"
            >
              <div className="p-2 border-b border-border bg-muted/30">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search chapter..."
                    value={chapterSearch}
                    onChange={(e) => setChapterSearch(e.target.value)}
                    className="h-8 pl-8 pr-7 text-xs bg-background"
                    autoFocus
                  />
                  {chapterSearch && (
                    <button
                      type="button"
                      onClick={() => setChapterSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto p-1 text-sm">
                {filteredChapters.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    No chapters found {selectedState ? `in ${selectedState}` : ""}
                  </div>
                ) : (
                  filteredChapters.map((c) => {
                    const isSelected = selectedChapterName.toLowerCase() === (c.name || "").toLowerCase();
                    return (
                      <div
                        key={c._id || c.name}
                        onClick={() => handleSelectChapter(c.name)}
                        className={cn(
                          "flex items-center justify-between px-2.5 py-2 rounded-md cursor-pointer text-xs transition-colors",
                          isSelected
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-muted text-foreground"
                        )}
                      >
                        <div className="truncate">
                          <span className="font-medium">{c.name}</span>
                          {c.state && (
                            <span className="text-[11px] text-muted-foreground ml-1.5 opacity-75">
                              · {c.state}
                            </span>
                          )}
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                      </div>
                    );
                  })
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* 3. MEMBER SELECTOR (SEARCHABLE) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor={`${idPrefix}-member`} className="text-xs font-medium text-foreground">
            Member *
          </Label>
          {selectedMember && !disabled && (
            <button
              type="button"
              onClick={handleClearMember}
              className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-0.5"
            >
              Clear
            </button>
          )}
        </div>
        <Popover open={memberOpen} onOpenChange={setMemberOpen}>
          <PopoverTrigger asChild>
            <Button
              id={`${idPrefix}-member`}
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={memberOpen}
              disabled={disabled}
              className={cn(
                "h-auto min-h-12 w-full justify-between font-normal bg-background px-3 py-2 text-left transition-colors",
                !selectedMember && "text-muted-foreground"
              )}
            >
              {selectedMember ? (
                <div className="flex items-center gap-3 truncate min-w-0 pr-2">
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border",
                      getAvatarColor(selectedMember.name)
                    )}
                  >
                    {getInitials(selectedMember.name)}
                  </div>
                  <div className="truncate min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate leading-snug">
                      {selectedMember.name}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate leading-snug mt-0.5">
                      {selectedMember.contactPerson && (
                        <span className="inline-flex items-center gap-1 font-medium text-foreground/80 truncate">
                          <User className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                          <span className="truncate">{selectedMember.contactPerson}</span>
                        </span>
                      )}
                      {selectedMember.contactPerson && (selectedMember.chapter || selectedMember.industry) && (
                        <span className="text-muted-foreground/40">•</span>
                      )}
                      {selectedMember.chapter ? (
                        <span className="inline-flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                          <span className="truncate">{selectedMember.chapter}</span>
                        </span>
                      ) : selectedMember.industry ? (
                        <span className="inline-flex items-center gap-1 truncate">
                          <Briefcase className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                          <span className="truncate">{selectedMember.industry}</span>
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                <span className="truncate flex items-center gap-2 text-xs">
                  <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  {selectedChapterName
                    ? "Select or search member..."
                    : "Search member by name or pick state & chapter above..."}
                </span>
              )}
              <div className="flex items-center gap-1 shrink-0">
                {selectedMember && !disabled && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={handleClearMember}
                    className="p-0.5 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </span>
                )}
                <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="z-[70] w-[calc(100vw-2rem)] sm:w-[480px] p-0 shadow-xl border-border"
            align="start"
          >
            {/* Search Bar */}
            <div className="p-3 border-b border-border bg-muted/20">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={
                    selectedChapterName
                      ? `Search members in ${selectedChapterName}...`
                      : "Type member or business name to search across chapters..."
                  }
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="h-9 pl-9 pr-8 text-xs bg-background"
                  autoFocus
                />
                {memberSearch && (
                  <button
                    type="button"
                    onClick={() => setMemberSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-sm"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
                <span className="flex items-center gap-1.5 truncate">
                  {selectedChapterName ? (
                    <>
                      <MapPin className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                      <span className="truncate">
                        Showing chapter: <strong className="font-semibold text-foreground">{selectedChapterName}</strong>
                      </span>
                    </>
                  ) : (
                    <>
                      <Search className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                      <span>Global member search</span>
                    </>
                  )}
                </span>
                {displayedMembers.length > 0 && (
                  <span className="shrink-0 font-medium bg-muted px-2 py-0.5 rounded-full border border-border/40 text-[10px]">
                    {displayedMembers.length} {displayedMembers.length === 1 ? "member" : "members"}
                  </span>
                )}
              </div>
            </div>

            {/* Members List */}
            <div className="max-h-76 overflow-y-auto p-2 space-y-1.5">
              {isMembersLoading ? (
                <div className="py-8 flex flex-col items-center justify-center text-xs text-muted-foreground gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span>Loading members...</span>
                </div>
              ) : !selectedChapterName && !memberSearch.trim() ? (
                <div className="py-7 px-4 text-center text-xs text-muted-foreground space-y-1.5">
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-1">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <p className="font-semibold text-foreground">Search Any RIFAH Member</p>
                  <p className="text-[11px] leading-relaxed max-w-[280px] mx-auto text-muted-foreground">
                    Type a member or business name above, or select a <strong>State</strong> and{" "}
                    <strong>Chapter</strong> above to browse.
                  </p>
                </div>
              ) : displayedMembers.length === 0 ? (
                <div className="py-8 px-4 text-center text-xs text-muted-foreground space-y-1">
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center mx-auto mb-1.5 text-muted-foreground">
                    <User className="h-4 w-4" />
                  </div>
                  <p className="font-semibold text-foreground">No members found</p>
                  <p className="text-[11px]">
                    {memberSearch
                      ? `No matches for "${memberSearch}".`
                      : "No registered members found in this chapter."}
                  </p>
                </div>
              ) : (
                displayedMembers.map((m) => {
                  const isSelected = selectedMember && String(selectedMember._id) === String(m._id);
                  return (
                    <div
                      key={m._id}
                      onClick={() => handleSelectMember(m)}
                      className={cn(
                        "group flex items-center justify-between gap-3 p-2.5 rounded-xl cursor-pointer transition-all border",
                        isSelected
                          ? "bg-primary/10 border-primary/30 text-primary shadow-xs"
                          : "border-transparent hover:bg-muted/70 hover:border-border/50 text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={cn(
                            "h-9.5 w-9.5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border transition-transform group-hover:scale-105",
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-xs"
                              : getAvatarColor(m.name)
                          )}
                        >
                          {getInitials(m.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-semibold truncate leading-tight text-foreground">
                            {m.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground mt-1">
                            {m.contactPerson && (
                              <span className="inline-flex items-center gap-1 font-medium text-foreground/85 truncate">
                                <User className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                                <span className="truncate">{m.contactPerson}</span>
                              </span>
                            )}
                            {m.contactPerson && m.chapter && (
                              <span className="text-muted-foreground/30 text-[10px]">•</span>
                            )}
                            {m.chapter && (
                              <span className="inline-flex items-center gap-1 truncate text-muted-foreground">
                                <MapPin className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                                <span className="truncate">
                                  {m.chapter}
                                  {m.state ? ` (${m.state})` : ""}
                                </span>
                              </span>
                            )}
                          </div>
                          {m.industry && (
                            <div className="mt-1.5 flex items-center">
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-secondary/80 text-secondary-foreground px-2 py-0.5 rounded-md border border-border/40">
                                <Briefcase className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                                <span className="truncate">{m.industry}</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0 ml-2 shadow-xs">
                          <Check className="h-3 w-3 stroke-[2.5]" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
