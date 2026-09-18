"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { resolveMediaUrl } from "@shared/lib/media";
import { roleApi, stateApi, chapterApi } from "@shared/lib/api-services";
import { PublicLayout } from "@shared/components/rifah/public-layout";
import { Award, Building2, ShieldCheck, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";

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
      <section className="bg-navy py-16 md:py-24 text-navy-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="rifah-container relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6 shadow-xl">
            <Award className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">Chamber Leadership</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white drop-shadow-sm">
            Meet the Leaders
          </h1>
          <p className="text-lg md:text-xl text-white/80 font-medium">
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
                    <SelectItem key={s._id} value={s.name}>{s.name}</SelectItem>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {roles.map(role => {
                const user = role.userId;
                const business = role.businessId;
                const avatarUrl = user?.avatar ? resolveMediaUrl(user.avatar) : null;
                
                return (
                  <div key={role._id} className="group relative bg-background rounded-3xl border border-border p-8 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col items-center overflow-hidden">
                    
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/40 to-primary"></div>

                    <div className="relative mb-6">
                      {avatarUrl ? (
                        <img 
                          src={avatarUrl} 
                          alt={user?.name} 
                          className="w-28 h-28 rounded-full object-cover border-4 border-background shadow-lg bg-muted relative z-10"
                        />
                      ) : (
                        <div className="w-28 h-28 rounded-full bg-primary/10 text-primary flex items-center justify-center text-4xl font-bold shadow-lg border-4 border-background relative z-10">
                          {user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                      <div className="absolute -bottom-4 inset-x-0 flex justify-center z-20">
                         {getLevelBadge(role.level)}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-foreground truncate w-full mb-1 mt-2">{user?.name}</h3>
                    
                    <p className="text-sm font-bold text-primary px-4 py-1.5 bg-primary/5 rounded-full border border-primary/10 mb-4 inline-block">
                      {role.role}
                    </p>

                    {role.level === "State" && role.state && (
                      <div className="flex items-center text-xs text-muted-foreground mb-4 font-medium bg-muted/50 px-3 py-1.5 rounded-lg border border-border/50">
                        <MapPin className="h-3.5 w-3.5 mr-1.5" /> {role.state}
                      </div>
                    )}
                    {role.level === "Chapter" && role.chapterId && (
                      <div className="flex items-center text-xs text-muted-foreground mb-4 font-medium bg-muted/50 px-3 py-1.5 rounded-lg border border-border/50">
                        <MapPin className="h-3.5 w-3.5 mr-1.5" /> {role.chapterId.name || "Chapter"}
                      </div>
                    )}
                    
                    {(business?.name || user?.organization) && (
                      <div className="mt-auto flex items-center justify-center gap-2 w-full text-muted-foreground bg-muted/30 p-3 rounded-xl border border-border/50">
                        <Building2 className="h-4 w-4 shrink-0 text-primary/60" />
                        <span className="text-sm font-semibold truncate">
                          {business?.name || user?.organization}
                        </span>
                      </div>
                    )}
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
