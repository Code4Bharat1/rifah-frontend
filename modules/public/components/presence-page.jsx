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
import { useChapters } from "@shared/hooks/use-rifah-api";
import { cn } from "@shared/lib/utils";

// Comprehensive fallback & international chapters directory
const STATIC_PRESENCE_DATA = [
  // Maharashtra
  { name: "Mumbai Chapter", city: "Mumbai", state: "Maharashtra", region: "West", lead: "Mumbai Chapter Executive", status: "Active", type: "City Chapter", address: "South Mumbai & Suburbs Network", phone: "+91 98200 12345" },
  { name: "Pune Chapter", city: "Pune", state: "Maharashtra", region: "West", lead: "Pune Chapter Secretariat", status: "Active", type: "City Chapter", address: "Camp & Shivaji Nagar Hub", phone: "+91 98220 54321" },
  { name: "Nagpur Chapter", city: "Nagpur", state: "Maharashtra", region: "Central", lead: "Nagpur Chapter Coordinator", status: "Active", type: "City Chapter", address: "Civil Lines & Central Hub", phone: "+91 98230 67890" },
  { name: "Aurangabad Chapter", city: "Aurangabad (Chhatrapati Sambhajinagar)", state: "Maharashtra", region: "West", lead: "Aurangabad Chapter Lead", status: "Active", type: "City Chapter", address: "MIDC Chikalthana Hub", phone: "+91 98240 11223" },
  { name: "Nashik Chapter", city: "Nashik", state: "Maharashtra", region: "West", lead: "Nashik Chapter Coordinator", status: "Active", type: "City Chapter", address: "Ambad & Satpur Network", phone: "+91 98250 99887" },

  // Telangana & Andhra
  { name: "Hyderabad Chapter", city: "Hyderabad", state: "Telangana", region: "South", lead: "Hyderabad Chapter Secretariat", status: "Active", type: "City Chapter", address: "Banjara Hills & HITEC City", phone: "+91 98480 12345" },
  { name: "Nizamabad Chapter", city: "Nizamabad", state: "Telangana", region: "South", lead: "Nizamabad Chapter Lead", status: "Active", type: "City Chapter", address: "Commercial District Hub", phone: "+91 98490 65432" },
  { name: "Vijayawada Chapter", city: "Vijayawada", state: "Andhra Pradesh", region: "South", lead: "Andhra Regional Coordinator", status: "Active", type: "City Chapter", address: "MG Road Commercial Hub", phone: "+91 98495 11223" },

  // Karnataka
  { name: "Bengaluru Chapter", city: "Bengaluru", state: "Karnataka", region: "South", lead: "Bengaluru Chapter Secretariat", status: "Active", type: "City Chapter", address: "Indiranagar & Electronic City", phone: "+91 98800 23456" },
  { name: "Hubli-Dharwad Chapter", city: "Hubli", state: "Karnataka", region: "South", lead: "North Karnataka Lead", status: "Active", type: "City Chapter", address: "Vidyanagar Business Hub", phone: "+91 98810 77665" },
  { name: "Mangaluru Chapter", city: "Mangaluru", state: "Karnataka", region: "South", lead: "Coastal Karnataka Chapter Lead", status: "Active", type: "City Chapter", address: "Hampankatta Commercial Centre", phone: "+91 98820 44556" },

  // Delhi-NCR & North
  { name: "New Delhi Chapter", city: "New Delhi", state: "Delhi", region: "North", lead: "National Capital Region Lead", status: "Active", type: "State / City Hub", address: "Connaught Place & Okhla", phone: "+91 98100 34567" },
  { name: "Noida Chapter", city: "Noida", state: "Uttar Pradesh", region: "North", lead: "NCR Industrial Chapter Lead", status: "Active", type: "City Chapter", address: "Sector 62 & 63 Industrial Zone", phone: "+91 98110 88776" },
  { name: "Lucknow Chapter", city: "Lucknow", state: "Uttar Pradesh", region: "North", lead: "UP State Secretariat", status: "Active", type: "City Chapter", address: "Hazratganj & Gomti Nagar", phone: "+91 98120 55443" },
  { name: "Kanpur Chapter", city: "Kanpur", state: "Uttar Pradesh", region: "North", lead: "Kanpur Chapter Lead", status: "Active", type: "City Chapter", address: "Civil Lines Commercial Hub", phone: "+91 98130 99881" },

  // Gujarat
  { name: "Ahmedabad Chapter", city: "Ahmedabad", state: "Gujarat", region: "West", lead: "Gujarat State Chapter Lead", status: "Active", type: "City Chapter", address: "SG Highway & Ashram Road", phone: "+91 98250 12345" },
  { name: "Surat Chapter", city: "Surat", state: "Gujarat", region: "West", lead: "Surat Textile & Diamond Chapter", status: "Active", type: "City Chapter", address: "Ring Road & Varachha Hub", phone: "+91 98255 43210" },

  // South & East
  { name: "Chennai Chapter", city: "Chennai", state: "Tamil Nadu", region: "South", lead: "Tamil Nadu Secretariat", status: "Active", type: "City Chapter", address: "Anna Salai & Nungambakkam", phone: "+91 98400 12345" },
  { name: "Kochi Chapter", city: "Kochi", state: "Kerala", region: "South", lead: "Kerala State Secretariat", status: "Active", type: "City Chapter", address: "MG Road & Kakkanad Hub", phone: "+91 98460 76543" },
  { name: "Kolkata Chapter", city: "Kolkata", state: "West Bengal", region: "East", lead: "Eastern India Chapter Coordinator", status: "Active", type: "City Chapter", address: "Park Street & Salt Lake Sector V", phone: "+91 98300 98765" },

  // International Chapters
  { name: "Dubai Chapter (UAE)", city: "Dubai", state: "Dubai", country: "United Arab Emirates", region: "International", lead: "GCC Regional Directorate", status: "Active", type: "International Hub", address: "Business Bay & DIFC Network", phone: "+971 4 123 4567" },
  { name: "Riyadh Chapter (Saudi Arabia)", city: "Riyadh", state: "Riyadh Province", country: "Saudi Arabia", region: "International", lead: "Saudi Arabia Chapter Liaison", status: "Active", type: "International Chapter", address: "King Fahd Road Business Center", phone: "+966 11 234 5678" },
  { name: "London Chapter (United Kingdom)", city: "London", state: "Greater London", country: "United Kingdom", region: "International", lead: "UK & European Hub Director", status: "Active", type: "International Chapter", address: "Canary Wharf & Central London", phone: "+44 20 7946 0123" },
];

export function PresencePage() {
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: chaptersData } = useChapters();
  const dbChapters = Array.isArray(chaptersData?.chapters)
    ? chaptersData.chapters
    : Array.isArray(chaptersData)
    ? chaptersData
    : [];

  // Merge DB chapters with static comprehensive registry
  const mergedChapters = useMemo(() => {
    const list = [...STATIC_PRESENCE_DATA];
    const staticNames = new Set(list.map((c) => c.name.toLowerCase()));

    dbChapters.forEach((dbCh) => {
      const cleanName = dbCh.name?.trim();
      if (cleanName && !staticNames.has(cleanName.toLowerCase())) {
        list.push({
          name: cleanName.includes("Chapter") ? cleanName : `${cleanName} Chapter`,
          city: dbCh.city || cleanName.replace(/\s*Chapter\s*/gi, "").trim(),
          state: dbCh.state || "National",
          region: "National",
          lead: dbCh.lead || "Chapter Secretary",
          status: dbCh.status || "Active",
          type: "City Chapter",
          address: "Chapter Secretariat & Business Network",
          businessesCount: dbCh.businessesCount || 0,
        });
      }
    });

    return list;
  }, [dbChapters]);

  const regions = ["All", "West", "South", "North", "Central", "East", "International"];

  const filteredChapters = useMemo(() => {
    return mergedChapters.filter((item) => {
      const matchesRegion =
        selectedRegion === "All" ||
        item.region.toLowerCase() === selectedRegion.toLowerCase();

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        (item.state || "").toLowerCase().includes(q) ||
        (item.country || "").toLowerCase().includes(q) ||
        (item.lead || "").toLowerCase().includes(q);

      return matchesRegion && matchesSearch;
    });
  }, [mergedChapters, selectedRegion, searchQuery]);

  return (
    <PublicLayout>
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-navy to-slate-950 text-white py-14 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="rifah-container relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-5 shadow-inner">
            <Globe className="h-3.5 w-3.5 text-blue-400 animate-spin-slow" />
            <span>National & International Chapter Network</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Our Presence Across India &amp; Global Chapters
          </h1>

          <p className="mt-4 text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            RIFAH Chamber of Commerce &amp; Industry connects ethical entrepreneurs, MSMEs, and professionals through a vibrant network of city chapters and global hubs.
          </p>

          {/* Key Metric Highlights */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">50+</span>
              <p className="text-xs text-slate-400 mt-0.5">City Chapters</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-400">18+</span>
              <p className="text-xs text-slate-400 mt-0.5">States Covered</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">5,000+</span>
              <p className="text-xs text-slate-400 mt-0.5">Member Businesses</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">Global</span>
              <p className="text-xs text-slate-400 mt-0.5">GCC &amp; UK Hubs</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <section className="sticky top-14 md:top-[68px] z-30 border-b border-border bg-surface/95 backdrop-blur py-4 shadow-2xs">
        <div className="rifah-container flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Region Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {regions.map((reg) => {
              const active = selectedRegion === reg;
              return (
                <button
                  key={reg}
                  type="button"
                  onClick={() => setSelectedRegion(reg)}
                  className={cn(
                    "px-3.5 py-1.5 text-xs font-bold rounded-full transition-all whitespace-nowrap cursor-pointer shrink-0",
                    active
                      ? "bg-primary text-primary-foreground shadow-xs font-bold"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  )}
                >
                  {reg === "All" ? "All Chapters" : `${reg} Zone`}
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city, state, chapter..."
              className="h-9 pl-9 pr-3 text-xs rounded-xl bg-background"
            />
          </div>

        </div>
      </section>

      {/* 3. CHAPTERS DIRECTORY GRID */}
      <section className="rifah-container py-8 sm:py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              Active RIFAH Chapters
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Showing {filteredChapters.length} chapter {filteredChapters.length === 1 ? "location" : "locations"}
            </p>
          </div>

          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex rounded-xl text-xs font-semibold gap-1.5">
            <Link href="/register-business">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Join a Chapter</span>
            </Link>
          </Button>
        </div>

        {filteredChapters.length === 0 ? (
          <div className="py-16 text-center rounded-3xl border border-dashed border-border bg-muted/20">
            <MapPin className="h-12 w-12 text-muted-foreground/50 mx-auto" />
            <h3 className="mt-3 text-base font-bold text-foreground">No chapters found</h3>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your search query or zone filter.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedRegion("All");
                setSearchQuery("");
              }}
              className="mt-4 text-xs rounded-xl"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredChapters.map((ch, idx) => {
              const isInternational = ch.region === "International";
              const chapterSlug = ch.name.toLowerCase().replace(/\s+/g, "-");

              return (
                <div
                  key={`${ch.name}-${idx}`}
                  className="group flex flex-col justify-between p-5 rounded-3xl border border-border/90 bg-surface hover:border-primary/40 hover:shadow-lg transition-all duration-200"
                >
                  <div>
                    {/* Top Row: Type & Status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={cn(
                          "text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border",
                          isInternational
                            ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300"
                            : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300"
                        )}
                      >
                        {ch.type || "City Chapter"}
                      </span>

                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Active Chapter
                      </span>
                    </div>

                    {/* Chapter Name & Location */}
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {ch.name}
                    </h3>

                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>
                        {ch.city}, {ch.state || ch.country}
                      </span>
                    </div>

                    {/* Lead / Office Bearers */}
                    <div className="mt-3.5 p-3 rounded-2xl bg-muted/40 border border-border/50 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Lead: <strong className="font-semibold text-foreground">{ch.lead}</strong></span>
                      </div>
                      {ch.address && (
                        <p className="text-[11px] text-muted-foreground pl-5 truncate">
                          {ch.address}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Links */}
                  <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-2">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2.5 text-xs font-semibold text-primary hover:bg-primary/10 gap-1"
                    >
                      <Link href={`/discover?chapter=${encodeURIComponent(ch.city || ch.name)}`}>
                        <span>Explore Businesses</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs font-semibold rounded-xl border-border hover:bg-muted"
                    >
                      <Link href={`/contact?chapter=${encodeURIComponent(ch.name)}`}>
                        <span>Connect</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. CALL TO ACTION - START A CHAPTER */}
      <section className="rifah-container py-8 sm:py-14">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-primary text-white p-8 sm:p-12 shadow-xl text-center sm:text-left">
          <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-3 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-amber-200" /> Expand With Us
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Want to Establish a RIFAH Chapter in Your City?
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-blue-100 leading-relaxed">
                Connect with the RIFAH National Secretariat to bring ethical business networking, leadership meetings, and trade growth to your region.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button asChild size="lg" className="h-11 px-6 text-sm font-bold bg-white text-blue-700 hover:bg-blue-50 rounded-2xl shadow-md">
                <Link href="/contact">
                  <span>Start a Chapter</span>
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-11 px-5 text-sm font-bold text-white border-white/40 hover:bg-white/10 rounded-2xl">
                <Link href="/membership">
                  <span>Membership Benefits</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

export default PresencePage;
