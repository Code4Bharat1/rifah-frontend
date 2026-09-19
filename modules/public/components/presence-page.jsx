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
import { useStates } from "@shared/hooks/use-rifah-api";
import { cn } from "@shared/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@shared/components/ui/dialog";

export function PresencePage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: statesData } = useStates();
  const statesList = Array.isArray(statesData) ? statesData : [];

  const filteredStates = useMemo(() => {
    return statesList.filter((item) => {
      const q = searchQuery.trim().toLowerCase();
      const profileName = item.profile?.name?.toLowerCase() || item.state.toLowerCase();
      const matchesSearch =
        !q ||
        profileName.includes(q) ||
        (item.profile?.address || "").toLowerCase().includes(q) ||
        (item.admin?.name || "").toLowerCase().includes(q);

      return matchesSearch;
    });
  }, [statesList, searchQuery]);

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

      {/* 2. SEARCH CONTROLS */}
      <section className="sticky top-14 md:top-[68px] z-30 border-b border-border bg-surface/95 backdrop-blur py-4 shadow-2xs">
        <div className="rifah-container flex justify-center">
          {/* Quick Search */}
          <div className="relative w-full max-w-md shrink-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search states, address, admin..."
              className="h-10 pl-9 pr-3 rounded-full bg-background border-border/50 shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* 3. STATES DIRECTORY GRID */}
      <section className="rifah-container py-8 sm:py-12 min-h-[500px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              Active State Secretariats
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Showing {filteredStates.length} states
            </p>
          </div>
        </div>

        {filteredStates.length === 0 ? (
          <div className="py-16 text-center rounded-3xl border border-dashed border-border bg-muted/20">
            <MapPin className="h-12 w-12 text-muted-foreground/50 mx-auto" />
            <h3 className="mt-3 text-base font-bold text-foreground">No states found</h3>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your search query.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredStates.map((st, idx) => {
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
                        src={imageUrl}
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

    </PublicLayout>
  );
}

export default PresencePage;
