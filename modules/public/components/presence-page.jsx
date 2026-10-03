"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  MapPin,
  Building2,
  Users,
  Globe,
  Sparkles,
  Search,
  X,
  ArrowRight,
  Phone,
  Mail,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { PublicLayout } from "@shared/components/rifah/public-layout";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { useStates, useChapters } from "@shared/hooks/use-rifah-api";
import { resolveMediaUrl } from "@shared/lib/api-client";
import { cn } from "@shared/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@shared/components/ui/dialog";

export function PresencePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "all" | "states" | "chapters"

  const { data: statesData } = useStates();
  const statesList = Array.isArray(statesData) ? statesData : [];

  const { data: chaptersData } = useChapters();
  const chaptersList = useMemo(() => {
    if (Array.isArray(chaptersData)) return chaptersData;
    if (Array.isArray(chaptersData?.chapters)) return chaptersData.chapters;
    return [];
  }, [chaptersData]);

  const filteredStates = useMemo(() => {
    return statesList.filter((item) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      
      const stateName = (item.state || "").toLowerCase();
      const profileName = (item.profile?.name || "").toLowerCase();
      const address = (item.profile?.address || "").toLowerCase();
      const adminName = (item.admin?.name || "").toLowerCase();

      return (
        stateName.includes(q) ||
        profileName.includes(q) ||
        address.includes(q) ||
        adminName.includes(q)
      );
    });
  }, [statesList, searchQuery]);

  const filteredChapters = useMemo(() => {
    return chaptersList.filter((ch) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;

      const name = (ch.name || "").toLowerCase();
      const city = (ch.city || "").toLowerCase();
      const state = (ch.state || "").toLowerCase();
      const lead = (ch.lead || "").toLowerCase();
      const adminName = (ch.chapterAdmin?.name || "").toLowerCase();

      return (
        name.includes(q) ||
        city.includes(q) ||
        state.includes(q) ||
        lead.includes(q) ||
        adminName.includes(q)
      );
    });
  }, [chaptersList, searchQuery]);

  const showStates = activeTab === "all" || activeTab === "states";
  const showChapters = activeTab === "all" || activeTab === "chapters";
  const totalResults = filteredStates.length + filteredChapters.length;

  return (
    <PublicLayout>
      {/* 1. PREMIUM HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-14 sm:py-20 border-b border-white/5">
        {/* Premium Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-950 to-slate-950 pointer-events-none" />
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.04] pointer-events-none" />

        <div className="rifah-container relative z-10 text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight animate-[fadeInUp_0.8s_ease-out]">
            Our Presence
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed animate-[fadeInUp_0.8s_ease-out_0.2s_both]">
            Connecting ethical entrepreneurs and professionals through a vibrant network of city chapters and state secretariats.
          </p>
        </div>
      </section>

      {/* 2. SEARCH CONTROLS & FILTER TABS (Filters and Search Kept Close on Left) */}
      <section className="sticky top-14 md:top-[68px] z-30 border-b border-border bg-surface/95 backdrop-blur py-3 sm:py-3.5 shadow-2xs">
        <div className="rifah-container flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-3 sm:gap-4">
          {/* Filter Tabs (Left Side) */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-muted/70 border border-border/60 shadow-2xs shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={cn(
                "px-3.5 py-1 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer",
                activeTab === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/60"
              )}
            >
              All ({totalResults})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("states")}
              className={cn(
                "px-3.5 py-1 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer",
                activeTab === "states"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/60"
              )}
            >
              States ({filteredStates.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("chapters")}
              className={cn(
                "px-3.5 py-1 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer",
                activeTab === "chapters"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/60"
              )}
            >
              Chapters ({filteredChapters.length})
            </button>
          </div>

          {/* Quick Search with Clear Button (Right Side) */}
          <div className="relative w-full sm:w-80 md:w-96 shrink-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === "states"
                  ? "Search states, address, admin..."
                  : activeTab === "chapters"
                    ? "Search chapters, cities, lead..."
                    : "Search states, chapters, cities, admin..."
              }
              className="h-10 pl-9 pr-9 rounded-full bg-background border-border/60 shadow-xs focus-visible:ring-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* GLOBAL EMPTY STATE (When search yields 0 matches in total) */}
      {totalResults === 0 && searchQuery && (
        <section className="rifah-container py-16 sm:py-20 text-center">
          <div className="max-w-md mx-auto py-12 px-6 rounded-3xl border border-dashed border-border bg-muted/20">
            <MapPin className="h-12 w-12 text-muted-foreground/40 mx-auto" />
            <h3 className="mt-3 text-base font-bold text-foreground">No matches found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              No states or chapters found matching &ldquo;{searchQuery}&rdquo;.
            </p>
            <Button variant="outline" size="sm" onClick={() => setSearchQuery("")} className="mt-4 text-xs">
              Clear Search
            </Button>
          </div>
        </section>
      )}

      {/* 3. STATES DIRECTORY GRID */}
      {showStates && (filteredStates.length > 0 || (activeTab === "states" && !totalResults)) && (
        <section className="rifah-container py-8 sm:py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                State-Level RIFAH Presence
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Showing {filteredStates.length} {filteredStates.length === 1 ? "state" : "states"}
              </p>
            </div>
          </div>

          {filteredStates.length === 0 ? (
            <div className="py-12 text-center rounded-3xl border border-dashed border-border bg-muted/20">
              <MapPin className="h-10 w-10 text-muted-foreground/50 mx-auto" />
              <h3 className="mt-3 text-sm font-bold text-foreground">No states found</h3>
              <p className="text-xs text-muted-foreground mt-1">Try switching to the Chapters tab or adjusting your query.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredStates.map((st) => {
                const profile = st.profile || {};
                const imageUrl = profile.image || null;
                
                return (
                  <Link 
                    href={`/presence/${st.state}`}
                    key={st.state}
                    className="group relative h-full bg-background rounded-2xl border border-border/50 text-center hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-1.5 flex flex-col overflow-hidden isolate shadow-sm cursor-pointer"
                  >
                    <div className="relative w-full aspect-square sm:aspect-[4/5] bg-muted/40 overflow-hidden flex-shrink-0 border-b border-border/20">
                      {imageUrl ? (
                        <img
                          src={resolveMediaUrl(imageUrl)}
                          alt={st.state}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/20 text-primary/60 flex items-center justify-center text-4xl font-black transition-transform duration-700 group-hover:scale-105">
                          {st.state.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none"></div>
                    </div>

                    <div className="relative p-4 sm:p-5 bg-background z-10 flex flex-col flex-grow items-start text-left">
                      <h3 className="text-lg sm:text-xl font-extrabold text-foreground w-full mb-1 tracking-tight truncate text-primary">{profile.name || st.state}</h3>
                      
                      {profile.phone && (
                         <div className="flex items-center text-xs font-medium text-muted-foreground mt-1.5">
                           <Phone className="h-3.5 w-3.5 mr-1.5 text-primary" /> {profile.phone}
                         </div>
                      )}
                      {profile.email && (
                         <div className="flex items-center text-xs font-medium text-muted-foreground mt-1 truncate w-full">
                           <Mail className="h-3.5 w-3.5 mr-1.5 text-primary shrink-0" /> <span className="truncate">{profile.email}</span>
                         </div>
                      )}
                      {profile.address && (
                         <div className="flex items-start text-xs font-medium text-muted-foreground mt-1 line-clamp-2">
                           <MapPin className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-primary shrink-0" /> {profile.address}
                         </div>
                      )}

                      <div className="w-full mt-auto pt-4 border-t border-border/40 flex justify-between items-center">
                         <span className="text-xs font-bold text-muted-foreground">{st.chaptersCount} Chapters</span>
                         <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:bg-primary/5 px-2">View Details <ArrowRight className="h-3 w-3 ml-1"/></Button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* 4. CHAPTERS DIRECTORY GRID */}
      {showChapters && (filteredChapters.length > 0 || (activeTab === "chapters" && !totalResults)) && (
        <section className={cn("rifah-container pb-14 sm:pb-20 pt-8 sm:pt-12", showStates && filteredStates.length > 0 && "border-t border-border/60")}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-primary mb-2">
                City & District Chapters
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                Chapter-Level RIFAH Presence
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Showing {filteredChapters.length} {filteredChapters.length === 1 ? "chapter" : "chapters"} across India
              </p>
            </div>
          </div>

          {filteredChapters.length === 0 ? (
            <div className="py-12 text-center rounded-3xl border border-dashed border-border bg-muted/20">
              <Building2 className="h-10 w-10 text-muted-foreground/50 mx-auto" />
              <h3 className="mt-3 text-sm font-bold text-foreground">No chapters found</h3>
              <p className="text-xs text-muted-foreground mt-1">Try switching to the States tab or adjusting your query.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredChapters.map((ch) => {
                const statusColor =
                  ch.status === "Active"
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : ch.status === "Forming"
                      ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      : "bg-muted text-muted-foreground border-border";

                return (
                  <div
                    key={ch._id || ch.name}
                    className="group relative flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs hover:border-primary/50 hover:shadow-md transition-all duration-300"
                  >
                    <div>
                      {/* Top Row: Icon & Status Badge */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-2xs", statusColor)}>
                          {ch.status || "Active"}
                        </span>
                      </div>

                      {/* Chapter Name & Location */}
                      <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                        {ch.name}
                      </h3>
                      <div className="flex items-center text-xs text-muted-foreground mt-1 gap-1">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{ch.city ? `${ch.city}, ` : ""}{ch.state}</span>
                      </div>

                      {/* Chapter Secretary / Lead */}
                      {(ch.chapterAdmin?.name || ch.lead) && (
                        <div className="flex items-center text-xs text-muted-foreground mt-2.5 gap-1.5 pt-2.5 border-t border-border/40">
                          <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">
                            <strong className="text-foreground/80 font-semibold">Lead:</strong> {ch.chapterAdmin?.name || ch.lead}
                          </span>
                        </div>
                      )}

                      {/* Contact Phone / Email if available */}
                      {ch.chapterAdmin?.phone && (
                        <div className="flex items-center text-xs text-muted-foreground mt-1 gap-1.5">
                          <Phone className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                          <span>{ch.chapterAdmin.phone}</span>
                        </div>
                      )}
                      {ch.chapterAdmin?.email && (
                        <div className="flex items-center text-xs text-muted-foreground mt-1 gap-1.5 truncate">
                          <Mail className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                          <span className="truncate">{ch.chapterAdmin.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Card Bottom: Metrics & Action */}
                    <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        <span>{ch.businessesCount || 0} Businesses</span>
                      </div>

                      <Link
                        href={`/discover?chapter=${encodeURIComponent(ch.name)}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        <span>Explore</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

    </PublicLayout>
  );
}

export default PresencePage;
