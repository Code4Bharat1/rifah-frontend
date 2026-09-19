"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { resolveMediaUrl } from "@shared/lib/media";
import { roleApi, stateApi, chapterApi } from "@shared/lib/api-services";
import { PublicLayout } from "@shared/components/rifah/public-layout";
import { Award, Building2, ShieldCheck, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { Button } from "@shared/components/ui/button";

export function MembersDirectoryPage() {
  const [levelFilter, setLevelFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [chapterFilter, setChapterFilter] = useState("all");

  const queryParams = {
    ...(levelFilter !== "all" && { level: levelFilter }),
    ...(stateFilter !== "all" && { state: stateFilter }),
    ...(chapterFilter !== "all" && { chapterId: chapterFilter }),
  };

  const { data: resp, isLoading: rolesLoading } = useQuery({
    queryKey: ["public-roles", queryParams],
    queryFn: () => roleApi.getPublic(queryParams),
    keepPreviousData: true,
  });

  const { data: statesRes } = useQuery({
    queryKey: ["public-states"],
    queryFn: () => stateApi.list(),
  });

  const { data: chaptersRes } = useQuery({
    queryKey: ["public-chapters"],
    queryFn: () => chapterApi.list(),
  });

  const roles = resp?.data || resp || [];
  const states = statesRes?.data || [];
  const chapters = chaptersRes?.data || [];

  const getLevelBadge = (level) => {
    switch (level) {
      case "Central":
        return <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider border border-amber-200 shadow-sm">Central</span>;
      case "State":
        return <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider border border-blue-200 shadow-sm">State</span>;
      case "Chapter":
        return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-200 shadow-sm">Chapter</span>;
      default:
        return null;
    }
  };

  return (
    <PublicLayout>
      <section className="relative overflow-hidden pt-16 pb-28 text-white flex items-center justify-center min-h-[320px]">
        {/* Premium Image Background with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/images/hero-building-bright.jpg')] bg-cover bg-center bg-no-repeat opacity-50 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-900/90 to-cyan-900/90"></div>
          {/* Subtle grid on top of image */}
          <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-10"></div>
        </div>

        <div className="rifah-container relative z-10 text-center max-w-3xl mx-auto mt-8">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 shadow-xl hover:bg-white/15 transition-all">
            <Award className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">Chamber Leadership</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 text-white drop-shadow-lg">
            Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">Leaders</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-50 font-medium max-w-2xl mx-auto drop-shadow-md">
            Discover the driving force behind RIFAH Chamber of Commerce & Industry across the nation.
          </p>
        </div>
      </section>

      <section className="py-12 bg-muted/30 min-h-[600px]">
        <div className="rifah-container">

          <div className="mb-10 bg-background p-4 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row items-center gap-4 max-w-4xl mx-auto -mt-20 relative z-20">
            <div className="flex-1 w-full">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block px-1">Hierarchy Level</label>
              <Select value={levelFilter} onValueChange={(val) => {
                setLevelFilter(val);
                setStateFilter("all");
                setChapterFilter("all");
              }}>
                <SelectTrigger className="w-full bg-muted/30 border-none h-11 rounded-xl font-medium">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Central">Central (National)</SelectItem>
                  <SelectItem value="State">State Level</SelectItem>
                  <SelectItem value="Chapter">Chapter Level</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-px h-12 bg-border hidden md:block"></div>

            <div className="flex-1 w-full opacity-100 transition-opacity">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block px-1">State</label>
              <Select value={stateFilter} onValueChange={setStateFilter} disabled={levelFilter === "Central" || levelFilter === "Chapter"}>
                <SelectTrigger className="w-full bg-muted/30 border-none h-11 rounded-xl font-medium">
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {states.map(s => (
                    <SelectItem key={s.state} value={s.state}>{s.state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-px h-12 bg-border hidden md:block"></div>

            <div className="flex-1 w-full opacity-100 transition-opacity">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block px-1">Chapter</label>
              <Select value={chapterFilter} onValueChange={setChapterFilter} disabled={levelFilter === "Central" || levelFilter === "State"}>
                <SelectTrigger className="w-full bg-muted/30 border-none h-11 rounded-xl font-medium">
                  <SelectValue placeholder="All Chapters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Chapters</SelectItem>
                  {chapters.map(c => (
                    <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {rolesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 rounded-3xl bg-muted/40 animate-pulse border border-border shadow-sm" />
              ))}
            </div>
          ) : roles.length === 0 ? (
            <div className="text-center py-20 px-4 bg-background rounded-3xl border border-border shadow-sm max-w-3xl mx-auto">
              <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center text-primary mx-auto mb-6">
                <ShieldCheck className="h-10 w-10 opacity-40" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">No Leaders Found</h3>
              <p className="text-muted-foreground mt-3 max-w-md mx-auto text-lg">Try adjusting your filters to discover the leadership directory.</p>
              <Button variant="outline" className="mt-8 rounded-full px-8" onClick={() => {
                setLevelFilter("all");
                setStateFilter("all");
                setChapterFilter("all");
              }}>Clear Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {roles.map(role => {
                const user = role.userId;
                const business = role.businessId;
                const avatarUrl = user?.avatar ? resolveMediaUrl(user.avatar) : null;

                return (
                  <div key={role._id} className="group relative h-full bg-background rounded-3xl border border-border/50 text-center hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2 flex flex-col overflow-hidden isolate shadow-sm">
                    
                    {/* Full width portrait image container */}
                    <div className="relative w-full aspect-square bg-muted/40 overflow-hidden flex-shrink-0 border-b border-border/20">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={user?.name}
                          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/20 text-primary/60 flex items-center justify-center text-[70px] font-black transition-transform duration-700 group-hover:scale-105">
                          {user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                      
                      {/* Gentle shadow overlay inside image for depth */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none"></div>

                      {/* Level Badge overlaid on top left */}
                      <div className="absolute top-3 left-3 z-20 shadow-sm">
                        {getLevelBadge(role.level)}
                      </div>
                    </div>

                    {/* Card Content Area */}
                    <div className="relative p-5 bg-background z-10 flex flex-col items-center flex-grow">
                      <h3 className="text-[1.15rem] font-extrabold text-foreground w-full mb-1 tracking-tight truncate">{user?.name}</h3>
                      
                      <p className="text-[11px] font-bold text-primary tracking-wider uppercase px-3 py-1 bg-primary/5 rounded-full border border-primary/10 mb-4 mt-0.5 inline-block">
                        {role.role}
                      </p>

                      <div className="flex gap-1.5 w-full justify-center flex-wrap mb-4">
                        {role.level === "State" && role.state && (
                          <div className="flex items-center justify-center text-[10px] uppercase tracking-widest text-muted-foreground font-bold bg-muted/60 px-2.5 py-1 rounded-md">
                            <MapPin className="h-2.5 w-2.5 mr-1 text-primary/60" /> {role.state}
                          </div>
                        )}
                        {role.level === "Chapter" && role.chapterId && (
                          <div className="flex items-center justify-center text-[10px] uppercase tracking-widest text-muted-foreground font-bold bg-muted/60 px-2.5 py-1 rounded-md">
                            <MapPin className="h-2.5 w-2.5 mr-1 text-primary/60" /> {role.chapterId.name || "Chapter"}
                          </div>
                        )}
                      </div>

                      {(business?.name || user?.organization) && (
                        <div className="mt-auto flex flex-col items-center justify-center gap-1 w-full text-foreground/80 pt-3 border-t border-border/40">
                          <Building2 className="h-3.5 w-3.5 text-primary/40" />
                          <span className="text-xs font-semibold truncate w-full text-center">
                            {business?.name || user?.organization}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
