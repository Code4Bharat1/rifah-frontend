"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Search,
  SlidersHorizontal,
  X,
  Package,
  Tag,
  Wrench,
  Sparkles,
  MapPin,
  ArrowRight,
  CheckCircle2,
  BadgeCheck,
  Globe,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { CATEGORIES_DATA, getMainCategories, getSubCategoriesFor } from "@shared/lib/categories-data";
import { INTERNATIONAL_COUNTRIES_AND_CITIES } from "@shared/lib/international-countries-cities";

import { BusinessCard, CompactBusinessCard } from "@shared/components/rifah/business-card";
import { EmptyState, SkeletonCard } from "@shared/components/rifah/empty-state";
import { Pill, VerificationBadge } from "@shared/components/rifah/badges";
import { PublicLayout } from "@shared/components/rifah/public-layout";
import { SearchableFilterSelect } from "@shared/components/rifah/searchable-filter-select";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Checkbox } from "@shared/components/ui/checkbox";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@shared/components/ui/sheet";
import { useBusinesses, useChapters, useCategories, useCatalogue } from "@shared/hooks/use-rifah-api";
import { cn } from "@shared/lib/utils";
import { resolveMediaUrl } from "@shared/lib/api-client";

const membershipLevels = ["Silver", "Gold", "Platinum", "Diamond"];

function DiscoverPage() {
  const searchParams = useSearchParams();
  const search = Object.fromEntries(searchParams ? searchParams.entries() : []);
  const router = useRouter();
  const [query, setQuery] = useState(search.q || search.search || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [displayCount, setDisplayCount] = useState(18);
  const searchContainerRef = useRef(null);
  const filterScrollRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const windowScrollPosRef = useRef(0);
  const isNavigatingFilterRef = useRef(false);
  const t = useTranslations("Discover");

  // Prevent automatic browser scroll-to-top on route query updates
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // Listing Type: "businesses" (default) | "offerings" (Products & Services merged)
  const isOfferingsView = search.type === "offerings" || search.type === "Product" || search.type === "Service";

  // Restore scroll position and reset pagination on parameter change
  useEffect(() => {
    setDisplayCount(18);

    // If a filter navigation just occurred, lock the window scroll position
    if (isNavigatingFilterRef.current && typeof window !== "undefined") {
      const targetY = windowScrollPosRef.current;
      window.scrollTo({ top: targetY, behavior: "instant" });
      requestAnimationFrame(() => {
        window.scrollTo({ top: targetY, behavior: "instant" });
      });
      setTimeout(() => {
        window.scrollTo({ top: targetY, behavior: "instant" });
        isNavigatingFilterRef.current = false;
      }, 60);
    }

    if (filterScrollRef.current && scrollPositionRef.current > 0) {
      const targetSidebarY = scrollPositionRef.current;
      requestAnimationFrame(() => {
        if (filterScrollRef.current) {
          filterScrollRef.current.scrollTop = targetSidebarY;
        }
      });
      setTimeout(() => {
        if (filterScrollRef.current) {
          filterScrollRef.current.scrollTop = targetSidebarY;
        }
      }, 50);
    }
  }, [searchParams]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keep query input in sync with URL search params
  const currentSearchTerm = search.q || search.search || "";
  useEffect(() => {
    setQuery(currentSearchTerm);
  }, [currentSearchTerm]);

  // Auto-search (debounce) when user stops typing
  useEffect(() => {
    if (query === currentSearchTerm) return; // No change
    
    const timer = setTimeout(() => {
      setParam({ search: query || undefined, q: undefined });
    }, 500); // 500ms delay
    
    return () => clearTimeout(timer);
  }, [query, currentSearchTerm]);

  // 1. Fetch Businesses (Discover directory strictly requires verified businesses)
  const { data: businessesData, isLoading: isBusinessesLoading } = useBusinesses(
    {
      search: search.q || search.search,
      industry: search.industry,
      subCategory: search.subCategory,
      state: search.state,
      chapter: search.chapter,
      membership: search.membership,
      verified: "true",
      sort: search.sort,
      region: search.region,
      country: search.country,
    },
    { enabled: !isOfferingsView }
  );

  // 2. Fetch Merged Catalogue (Products & Services) with full filtering
  const { data: catalogueData, isLoading: isCatalogueLoading } = useCatalogue(
    {
      search: search.q || search.search || undefined,
      industry: search.industry,
      subCategory: search.subCategory,
      state: search.state,
      chapter: search.chapter,
      region: search.region,
      country: search.country,
    },
    { enabled: isOfferingsView }
  );

  const internationalCountries = React.useMemo(
    () => Object.keys(INTERNATIONAL_COUNTRIES_AND_CITIES).sort(),
    []
  );

  const { data: chaptersData } = useChapters();
  const chaptersList = Array.isArray(chaptersData?.chapters)
    ? chaptersData.chapters
    : Array.isArray(chaptersData)
    ? chaptersData
    : [];

  const states = Array.from(
    new Set(chaptersList.map((ch) => (ch.state || "").trim()).filter(Boolean))
  ).sort();

  const chaptersForSelectedState = search.state
    ? chaptersList.filter(
        (ch) => (ch.state || "").trim().toLowerCase() === search.state.trim().toLowerCase()
      )
    : chaptersList;

  const { data: categoriesData } = useCategories();
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const allMainCategories = React.useMemo(() => {
    const dbMain = categories.filter((c) => !c.parent).map((c) => c.name);
    const staticMain = getMainCategories();
    return Array.from(new Set([...dbMain, ...staticMain]));
  }, [categories]);

  const filteredSubCategories = React.useMemo(() => {
    if (!search.industry || search.industry === "all") return [];
    const chosenCat = search.industry.trim();
    const dbSubs = categories
      .filter((c) => c.parent && c.parent.trim().toLowerCase() === chosenCat.toLowerCase())
      .map((c) => c.name);
    const staticSubs = getSubCategoriesFor(chosenCat) || [];
    return Array.from(new Set([...dbSubs, ...staticSubs]));
  }, [categories, search.industry]);

  // Filter businesses: strictly verified members only, exclude pending/rejected/suspended
  const businessResults = (
    Array.isArray(businessesData)
      ? businessesData
      : businessesData?.businesses || []
  ).filter((b) => {
    const v = String(b.verification || "").toLowerCase();
    const s = String(b.status || "").toLowerCase();
    const isVerified = v === "verified" || v === "approved" || b.isVerified === true;
    const isPendingOrRejected =
      v === "rejected" ||
      v === "pending" ||
      v === "under_review" ||
      v === "unverified" ||
      v === "correction_requested" ||
      s === "rejected" ||
      s === "pending" ||
      s === "pending verification" ||
      s === "pending_verification" ||
      s === "suspended" ||
      s === "draft";
    if (!isVerified || isPendingOrRejected) return false;

    // Region filter
    if (search.region === "international") {
      const isIntl =
        b.region === "international" ||
        b.currency === "USD" ||
        (b.country && b.country.toLowerCase() !== "india") ||
        (b.state && b.state.toLowerCase() === "international");
      if (!isIntl) return false;
    } else if (search.region === "national") {
      const isIntl =
        b.region === "international" ||
        b.currency === "USD" ||
        (b.country && b.country.toLowerCase() !== "india") ||
        (b.state && b.state.toLowerCase() === "international");
      if (isIntl) return false;
    }

    // Country filter
    if (search.country && search.country !== "all") {
      const c = `${b.country || ""} ${b.state || ""}`.toLowerCase();
      if (!c.includes(search.country.toLowerCase())) return false;
    }

    // Membership level filter (with legacy alias mapping)
    if (search.membership && search.membership !== "all") {
      const bMem = String(b.membership || "free").toLowerCase();
      const targetMem = search.membership.toLowerCase();
      const directMatch = bMem.includes(targetMem);
      const aliasMatch =
        (targetMem === "silver" && bMem.includes("basic")) ||
        (targetMem === "gold" && bMem.includes("premium")) ||
        (targetMem === "diamond" && bMem.includes("enterprise"));
      if (!directMatch && !aliasMatch) return false;
    }

    return true;
  });

  // Filter catalogue items: only from active and verified businesses
  const catalogueResults = (
    Array.isArray(catalogueData)
      ? catalogueData
      : catalogueData?.items || []
  ).filter((item) => {
    if (!item.business) return true;
    const b = item.business;
    const v = String(b.verification || "").toLowerCase();
    const s = String(b.status || "").toLowerCase();
    if (
      v === "rejected" ||
      v === "pending" ||
      v === "under_review" ||
      v === "unverified" ||
      s === "rejected" ||
      s === "suspended"
    ) {
      return false;
    }

    // Region filter for catalogue item
    if (search.region === "international") {
      const isIntl =
        b.region === "international" ||
        b.currency === "USD" ||
        (b.country && b.country.toLowerCase() !== "india") ||
        (b.state && b.state.toLowerCase() === "international");
      if (!isIntl) return false;
    } else if (search.region === "national") {
      const isIntl =
        b.region === "international" ||
        b.currency === "USD" ||
        (b.country && b.country.toLowerCase() !== "india") ||
        (b.state && b.state.toLowerCase() === "international");
      if (isIntl) return false;
    }

    // Country filter
    if (search.country && search.country !== "all") {
      const c = `${b.country || ""} ${b.state || ""}`.toLowerCase();
      if (!c.includes(search.country.toLowerCase())) return false;
    }

    return true;
  });

  const results = isOfferingsView ? catalogueResults : businessResults;
  const isLoading = isOfferingsView ? isCatalogueLoading : isBusinessesLoading;

  // Scaled for 10k/50k users: Windowed card slicing to keep browser DOM light & fast
  const visibleBusinesses = React.useMemo(() => businessResults.slice(0, displayCount), [businessResults, displayCount]);
  const visibleCatalogue = React.useMemo(() => catalogueResults.slice(0, displayCount), [catalogueResults, displayCount]);

  const searchSuggestions = React.useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return { categories: [], subCategories: [], businesses: [], catalogue: [], hasAny: false };

    // 1. Matching Categories (max 4)
    const matchingCats = allMainCategories
      .filter((cat) => cat.toLowerCase().includes(q))
      .slice(0, 4);

    // 2. Matching Sub-categories (max 6)
    const matchingSubs = [];
    for (const [parentCat, subs] of Object.entries(CATEGORIES_DATA)) {
      for (const sub of subs) {
        if (sub.toLowerCase().includes(q)) {
          matchingSubs.push({ name: sub, parent: parentCat });
          if (matchingSubs.length >= 6) break;
        }
      }
      if (matchingSubs.length >= 6) break;
    }

    // 3. Matching Businesses (max 4)
    const matchingBiz = businessResults
      .filter(
        (b) =>
          (b.name || "").toLowerCase().includes(q) ||
          (b.industry || "").toLowerCase().includes(q) ||
          (b.tagline || "").toLowerCase().includes(q)
      )
      .slice(0, 4);

    // 4. Matching Products & Services (max 4)
    const matchingCat = catalogueResults
      .filter(
        (c) =>
          (c.name || "").toLowerCase().includes(q) ||
          (c.category || "").toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q)
      )
      .slice(0, 4);

    return {
      categories: matchingCats,
      subCategories: matchingSubs,
      businesses: matchingBiz,
      catalogue: matchingCat,
      hasAny: matchingCats.length > 0 || matchingSubs.length > 0 || matchingBiz.length > 0 || matchingCat.length > 0,
    };
  }, [query, allMainCategories, businessResults, catalogueResults]);

  const setParam = (patch) => {
    if (typeof window !== "undefined") {
      const currentWinY = window.scrollY || window.pageYOffset || 0;
      windowScrollPosRef.current = currentWinY;
      isNavigatingFilterRef.current = true;
    }
    if (filterScrollRef.current) {
      scrollPositionRef.current = filterScrollRef.current.scrollTop;
    }
    const current = new URLSearchParams(searchParams ? searchParams.toString() : "");
    Object.entries(patch).forEach(([key, val]) => {
      if (val === undefined || val === null || val === "" || val === "All" || val === "all" || val === "businesses") {
        current.delete(key);
      } else {
        current.set(key, String(val));
      }
    });
    const qs = current.toString();
    const newUrl = qs ? `/discover?${qs}` : "/discover";

    router.replace(newUrl, { scroll: false });

    if (typeof window !== "undefined" && windowScrollPosRef.current > 0) {
      const lockY = windowScrollPosRef.current;
      window.scrollTo({ top: lockY, behavior: "instant" });
      requestAnimationFrame(() => {
        window.scrollTo({ top: lockY, behavior: "instant" });
      });
      setTimeout(() => {
        window.scrollTo({ top: lockY, behavior: "instant" });
      }, 30);
      setTimeout(() => {
        window.scrollTo({ top: lockY, behavior: "instant" });
      }, 100);
    }
  };

  const resetFilters = () => {
    if (typeof window !== "undefined") {
      const currentWinY = window.scrollY || window.pageYOffset || 0;
      windowScrollPosRef.current = currentWinY;
      isNavigatingFilterRef.current = true;
    }
    if (filterScrollRef.current) {
      scrollPositionRef.current = filterScrollRef.current.scrollTop;
    }
    router.replace("/discover", { scroll: false });
    if (typeof window !== "undefined" && windowScrollPosRef.current > 0) {
      const lockY = windowScrollPosRef.current;
      window.scrollTo({ top: lockY, behavior: "instant" });
      requestAnimationFrame(() => {
        window.scrollTo({ top: lockY, behavior: "instant" });
      });
      setTimeout(() => {
        window.scrollTo({ top: lockY, behavior: "instant" });
      }, 30);
    }
  };

  const activeChips = [
    isOfferingsView && {
      label: "Listing: Products & Services",
      clear: () => setParam({ type: undefined }),
    },
    search.region && {
      label: search.region === "international" ? "Region: International (Global)" : "Region: National (India)",
      clear: () => setParam({ region: undefined, country: undefined }),
    },
    search.country && {
      label: `Country: ${search.country}`,
      clear: () => setParam({ country: undefined }),
    },
    search.industry && {
      label: `Industry: ${search.industry}`,
      clear: () => setParam({ industry: undefined, subCategory: undefined }),
    },
    search.subCategory && {
      label: `Sub-category: ${search.subCategory}`,
      clear: () => setParam({ subCategory: undefined }),
    },
    search.state && { label: search.state, clear: () => setParam({ state: undefined }) },
    search.chapter && { label: search.chapter, clear: () => setParam({ chapter: undefined }) },
    search.membership && { label: search.membership, clear: () => setParam({ membership: undefined }) },
    search.verified && { label: t("verifiedOnly"), clear: () => setParam({ verified: undefined }) },
  ].filter(Boolean);

  const filters = (
    <div className="space-y-4">
      {/* 1. Clear All Filters at First Top */}
      <div>
        <Button
          variant="outline"
          className="w-full h-8.5 rounded-xl text-xs font-semibold hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
          onClick={resetFilters}
        >
          {t("clearAllFilters")}
        </Button>
      </div>

      {/* 2. Membership Level Filter at Top */}
      {!isOfferingsView && (
        <fieldset>
          <Label className="font-semibold text-xs text-foreground uppercase tracking-wider">
            {t("membershipLevel")}
          </Label>
          <div className="mt-2.5 space-y-2">
            {membershipLevels.map((lvl) => {
              const isChecked = (search.membership || "").toLowerCase() === lvl.toLowerCase();
              return (
                <label key={lvl} className="flex items-center gap-2.5 text-sm py-1 cursor-pointer select-none">
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={(c) => setParam({ membership: c ? lvl : undefined })}
                  />
                  <span className={cn("text-xs font-medium", isChecked ? "text-primary font-bold" : "text-foreground")}>
                    {lvl}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* 3. Listing Type Filter (Businesses vs Products & Services) */}
      <div>
        <Label htmlFor="f-type" className="font-semibold text-xs text-foreground uppercase tracking-wider">
          Listing Type
        </Label>
        <Select
          value={isOfferingsView ? "offerings" : "businesses"}
          onValueChange={(v) => setParam({ type: v === "businesses" ? undefined : "offerings" })}
        >
          <SelectTrigger id="f-type" className="mt-1.5 h-10 rounded-xl bg-background font-medium">
            <SelectValue placeholder="Businesses (Members)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="businesses">Businesses</SelectItem>
            <SelectItem value="offerings">Products &amp; Services</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 4. Industry */}
      <div>
        <Label htmlFor="f-industry" className="font-semibold text-xs text-foreground uppercase tracking-wider">
          {t("industry")}
        </Label>
        <SearchableFilterSelect
          id="f-industry"
          value={search.industry || "all"}
          onValueChange={(v) => setParam({ industry: v === "all" ? undefined : v, subCategory: undefined })}
          placeholder={t("allIndustries")}
          searchPlaceholder="Search industry category..."
          allLabel={t("allIndustries")}
          options={allMainCategories}
          className="mt-1.5 h-10 rounded-xl bg-background"
        />
      </div>

      {/* 5. Sub-Category */}
      <div>
        <Label htmlFor="f-subcategory" className="font-semibold text-xs text-foreground uppercase tracking-wider">
          Sub Category
        </Label>
        <SearchableFilterSelect
          id="f-subcategory"
          value={search.subCategory || "all"}
          onValueChange={(v) => setParam({ subCategory: v === "all" ? undefined : v })}
          placeholder={search.industry ? "All sub-categories" : "Select industry first"}
          searchPlaceholder="Search sub category..."
          allLabel="All Sub-categories"
          options={filteredSubCategories}
          disabled={!search.industry || search.industry === "all"}
          className="mt-1.5 h-10 rounded-xl bg-background"
        />
        {search.industry && search.industry !== "all" && (
          <p className="mt-1 text-[10px] text-muted-foreground">
            {filteredSubCategories.length} sub-categories for {search.industry}
          </p>
        )}
      </div>

      {/* 6. Region (National vs International Scope) */}
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="f-region" className="font-semibold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-primary" />
            Region / Scope
          </Label>
          {search.region === "international" && (
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 px-1.5 py-0.5 rounded-md">
              Global
            </span>
          )}
        </div>
        <Select
          value={search.region || "all"}
          onValueChange={(v) => {
            const nextReg = v === "all" ? undefined : v;
            setParam({
              region: nextReg,
              country: undefined,
              state: nextReg === "international" ? undefined : search.state,
              chapter: nextReg === "international" ? undefined : search.chapter,
            });
          }}
        >
          <SelectTrigger id="f-region" className="mt-1.5 h-10 rounded-xl bg-background font-medium">
            <SelectValue placeholder="All Regions (India & Global)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions (National &amp; Global)</SelectItem>
            <SelectItem value="national">National (India)</SelectItem>
            <SelectItem value="international">International (Global) 🌐</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 6.1. International Country Filter (Shown when International Region is selected) */}
      {search.region === "international" && (
        <div className="animate-in fade-in slide-in-from-top-1">
          <Label htmlFor="f-country" className="font-semibold text-xs text-foreground uppercase tracking-wider">
            International Country
          </Label>
          <SearchableFilterSelect
            id="f-country"
            value={search.country || "all"}
            onValueChange={(v) => setParam({ country: v === "all" ? undefined : v })}
            placeholder="All International Countries"
            searchPlaceholder="Search country (e.g. UAE, UK, USA)..."
            allLabel="All International Countries"
            options={internationalCountries}
            className="mt-1.5 h-10 rounded-xl bg-background font-medium"
          />
        </div>
      )}

      {/* 7. State (Shown for National or All Regions) */}
      {search.region !== "international" && (
        <div>
          <Label htmlFor="f-state" className="font-semibold text-xs text-foreground uppercase tracking-wider">
            {t("state")}
          </Label>
          <Select
            value={search.state || "all"}
            onValueChange={(v) => {
              const nextState = v === "all" ? undefined : v;
              const chapterStillValid =
                !search.chapter ||
                chaptersList.some(
                  (ch) =>
                    ch.name === search.chapter &&
                    (!nextState || (ch.state || "").trim().toLowerCase() === nextState.trim().toLowerCase())
                );
              setParam({ state: nextState, chapter: chapterStillValid ? search.chapter : undefined });
            }}
          >
            <SelectTrigger id="f-state" className="mt-1.5 h-10 rounded-xl bg-background">
              <SelectValue placeholder={t("allStates")} />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="all">{t("allStates")}</SelectItem>
              {states.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* 8. Chapter (Shown for National or All Regions) */}
      {search.region !== "international" && (
        <div>
          <Label htmlFor="f-chapter" className="font-semibold text-xs text-foreground uppercase tracking-wider">
            {t("chapter")}
          </Label>
          <Select
            value={search.chapter || "all"}
            onValueChange={(v) => setParam({ chapter: v === "all" ? undefined : v })}
          >
            <SelectTrigger id="f-chapter" className="mt-1.5 h-10 rounded-xl bg-background">
              <SelectValue placeholder={t("allChapters")} />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="all">{t("allChapters")}</SelectItem>
              {chaptersForSelectedState.map((ch) => (
                <SelectItem key={ch._id || ch.name} value={ch.name}>
                  {ch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* 8. Verified Directory Badge */}
      {!isOfferingsView && (
        <div className="pt-1">
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 p-2.5 text-emerald-800 dark:text-emerald-300">
            <BadgeCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold leading-none">Verified Directory</p>
              <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5 leading-tight">
                Only chamber-verified member enterprises are listed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <PublicLayout>
      <div className="border-b border-border bg-surface">
        <div className="rifah-container py-8 lg:py-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl">
              Discover Businesses &amp; Offerings
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm sm:text-base text-muted-foreground">
              Search verified RIFAH member businesses, products, services, and industrial capabilities across all chapters.
            </p>
          </div>

          {/* Search Bar Form */}
          <form
            className="mt-5 flex gap-2 relative z-30"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              setShowSuggestions(false);
              setParam({ q: query || undefined });
            }}
          >
            <div className="relative min-w-0 flex-1" ref={searchContainerRef}>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder={
                  isOfferingsView
                    ? "Search products & services by item name, material, keyword, category..."
                    : "Search businesses, products, services, categories (e.g. IT, Manufacturing, Solar)..."
                }
                className="h-12 pl-10 pr-8 rounded-2xl bg-background text-sm shadow-xs"
                aria-label={t("searchPlaceholder")}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setParam({ q: undefined });
                    setShowSuggestions(false);
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Autocomplete Suggestions Popup */}
              {showSuggestions && query.trim() && searchSuggestions.hasAny && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-96 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-2 divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in slide-in-from-top-2">
                  {/* Category Matches */}
                  {searchSuggestions.categories.length > 0 && (
                    <div className="pb-2">
                      <p className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Categories ({searchSuggestions.categories.length})
                      </p>
                      {searchSuggestions.categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setParam({ industry: cat, subCategory: undefined, q: undefined });
                            setQuery("");
                            setShowSuggestions(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-left text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5 text-primary" />
                            {cat}
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full font-bold">
                            Filter Industry
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Sub-Category Matches */}
                  {searchSuggestions.subCategories.length > 0 && (
                    <div className="py-2">
                      <p className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Sub-Categories ({searchSuggestions.subCategories.length})
                      </p>
                      {searchSuggestions.subCategories.map((sub) => (
                        <button
                          key={`${sub.parent}-${sub.name}`}
                          type="button"
                          onClick={() => {
                            setParam({ industry: sub.parent, subCategory: sub.name, q: undefined });
                            setQuery("");
                            setShowSuggestions(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/30 text-left text-xs transition-colors"
                        >
                          <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Tag className="h-3.5 w-3.5 text-blue-500" />
                            {sub.name}
                          </span>
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium truncate max-w-[200px]">
                            in {sub.parent}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Business Matches */}
                  {searchSuggestions.businesses.length > 0 && (
                    <div className="py-2">
                      <p className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Businesses ({searchSuggestions.businesses.length})
                      </p>
                      {searchSuggestions.businesses.map((b) => (
                        <Link
                          key={b._id || b.id}
                          href={`/business/${b.slug || b._id || b.id}`}
                          onClick={() => setShowSuggestions(false)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left text-xs transition-colors"
                        >
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {b.name}
                            </span>
                            {b.tagline && (
                              <span className="text-[11px] text-muted-foreground line-clamp-1">
                                {b.tagline}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-semibold text-primary px-2 py-0.5 rounded-md bg-primary/10">
                            {b.industry || b.city || "View"}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Products & Services Matches */}
                  {searchSuggestions.catalogue && searchSuggestions.catalogue.length > 0 && (
                    <div className="pt-2">
                      <p className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Products &amp; Services ({searchSuggestions.catalogue.length})
                      </p>
                      {searchSuggestions.catalogue.map((c) => (
                        <button
                          key={c._id || c.slug}
                          type="button"
                          onClick={() => {
                            setParam({ type: "offerings", q: c.name });
                            setQuery(c.name);
                            setShowSuggestions(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-left text-xs transition-colors"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="font-bold text-slate-900 dark:text-white block truncate">
                              {c.name}
                            </span>
                            <span className="text-[11px] text-muted-foreground line-clamp-1">
                              {c.business?.name ? `${c.business.name} · ` : ""}{c.category || c.type}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md bg-emerald-100/70 dark:bg-emerald-900/50 shrink-0">
                            {c.price || c.type}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <Button type="submit" className="shrink-0 h-12 px-6 rounded-2xl font-bold">
              {t("searchButton")}
            </Button>
          </form>

          {/* MAIN MERGED TABS (NO EMOJIS - CLEAN ICONS WITH LIVE COUNTS) */}
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setParam({ type: undefined })}
              className={cn(
                "px-5 py-2.5 text-xs sm:text-sm font-bold rounded-2xl transition-all flex items-center gap-2 cursor-pointer shadow-xs",
                !isOfferingsView
                  ? "bg-primary text-primary-foreground shadow-sm font-extrabold"
                  : "bg-background border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Building2 className="h-4 w-4" />
              <span>Businesses</span>
              <span className={cn("text-[11px] px-1.5 py-0.2 rounded-full font-bold", !isOfferingsView ? "bg-white/25 text-white" : "bg-muted text-muted-foreground")}>
                {businessResults.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setParam({ type: "offerings" })}
              className={cn(
                "px-5 py-2.5 text-xs sm:text-sm font-bold rounded-2xl transition-all flex items-center gap-2 cursor-pointer shadow-xs",
                isOfferingsView
                  ? "bg-primary text-primary-foreground shadow-sm font-extrabold"
                  : "bg-background border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Package className="h-4 w-4" />
              <span>Products &amp; Services</span>
              <span className={cn("text-[11px] px-1.5 py-0.2 rounded-full font-bold", isOfferingsView ? "bg-white/25 text-white" : "bg-muted text-muted-foreground")}>
                {catalogueResults.length}
              </span>
            </button>
          </div>

          {/* Mobile filter chips + bottom sheet */}
          <div className="mt-3.5 flex items-center gap-2 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="shrink-0 rounded-xl">
                  <SlidersHorizontal className="h-4 w-4 mr-1" /> {t("filters")}
                  {activeChips.length > 0 && (
                    <span className="ml-1.5 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground font-bold">
                      {activeChips.length}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl">
                <SheetHeader>
                  <SheetTitle className="text-left">{t("filters")}</SheetTitle>
                </SheetHeader>
                <div className="pt-4">{filters}</div>
              </SheetContent>
            </Sheet>

            <div className="-mx-4 flex flex-1 gap-2 overflow-x-auto px-4 no-scrollbar">
              <button
                type="button"
                onClick={() => setParam({ type: undefined })}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1 text-xs font-semibold flex items-center gap-1.5",
                  !isOfferingsView ? "border-primary bg-primary-soft text-primary font-bold" : "border-border"
                )}
              >
                <span>Businesses</span>
                <span className="text-[10px] opacity-80">({businessResults.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setParam({ type: "offerings" })}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1 text-xs font-semibold flex items-center gap-1.5",
                  isOfferingsView ? "border-primary bg-primary-soft text-primary font-bold" : "border-border"
                )}
              >
                <span>Products &amp; Services</span>
                <span className="text-[10px] opacity-80">({catalogueResults.length})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rifah-container grid gap-6 py-6 lg:grid-cols-[268px_minmax(0,1fr)] items-start">
        {/* Left Filters Sidebar */}
        <aside className="hidden lg:block self-start sticky top-20 z-20">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col max-h-[calc(100vh-5.5rem)] overflow-hidden">
            <header className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-3 shrink-0 bg-white dark:bg-slate-900 z-10">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t("filters")}
                </h3>
              </div>
              {activeChips.length > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                >
                  Reset ({activeChips.length})
                </button>
              )}
            </header>
            <div
              ref={filterScrollRef}
              onScroll={(e) => {
                scrollPositionRef.current = e.currentTarget.scrollTop;
              }}
              className="p-3.5 sm:p-4 overflow-y-auto overscroll-contain flex-1 custom-scrollbar pb-8"
            >
              {filters}
            </div>
          </div>
        </aside>

        {/* Results Area */}
        <div className="min-w-0">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span className="text-foreground font-bold">{results.length}</span>{" "}
              {isOfferingsView
                ? `${results.length === 1 ? "offering" : "products & services"} found`
                : t("businessesFound")}
            </div>
            <Select
              value={search.sort ?? "recommended"}
              onValueChange={(v) => setParam({ sort: v })}
            >
              <SelectTrigger className="w-[168px] rounded-xl" aria-label="Sort results">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="featured">Featured first</SelectItem>
                <SelectItem value="rating">Highest rated</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {activeChips.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {activeChips.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={c.clear}
                  className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary-soft px-3 py-1 text-xs font-semibold text-primary"
                >
                  {c.label}
                  <X className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : results.length === 0 ? (
            <div className="space-y-4">
              {!isOfferingsView && catalogueResults.length > 0 && (
                <div className="mt-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        Found {catalogueResults.length} matching Products &amp; Services!
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Products and services are available matching your search or filters.
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setParam({ type: "offerings" })}
                    className="h-9 px-4 rounded-xl text-xs font-bold shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    View Products &amp; Services ({catalogueResults.length})
                  </Button>
                </div>
              )}

              {isOfferingsView && businessResults.length > 0 && (
                <div className="mt-4 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        Found {businessResults.length} matching Businesses!
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Verified member businesses are available matching your search or filters.
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setParam({ type: undefined })}
                    className="h-9 px-4 rounded-xl text-xs font-bold shrink-0"
                  >
                    View Businesses ({businessResults.length})
                  </Button>
                </div>
              )}

              <EmptyState
                className="mt-6"
                icon={isOfferingsView ? Package : Building2}
                title={isOfferingsView ? "No products or services match these filters" : "No businesses match these filters"}
                description={
                  isOfferingsView
                    ? "Try searching with different keywords or clearing active filters to browse all catalogue items."
                    : "Try widening the location or industry filter, or search for a product or service instead."
                }
                action={
                  <Button variant="outline" onClick={resetFilters} className="rounded-xl">
                    Reset filters
                  </Button>
                }
              />
            </div>
          ) : isOfferingsView ? (
            /* PRODUCTS & SERVICES CATALOGUE GRID (MERGED) */
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleCatalogue.map((item) => {
                const biz = item.business;
                const hasImage = item.images && item.images.length > 0;
                return (
                  <article
                    key={item._id || item.slug}
                    className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-4.5 transition-all hover:border-primary/40 hover:shadow-md overflow-hidden group"
                  >
                    <div>
                      {hasImage ? (
                        <div className="relative mb-3 h-40 w-full overflow-hidden rounded-xl bg-muted border border-border">
                          <img
                            src={resolveMediaUrl(item.images[0])}
                            alt={item.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.style.display = "none";
                            }}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="relative mb-3.5 h-24 w-full rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border border-border flex items-center justify-center text-muted-foreground">
                          {item.type === "Product" ? (
                            <Package className="h-8 w-8 text-primary/70" />
                          ) : (
                            <Wrench className="h-8 w-8 text-primary/70" />
                          )}
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-2">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                          {item.type === "Product" ? <Package className="h-4.5 w-4.5" /> : <Wrench className="h-4.5 w-4.5" />}
                        </span>
                        <Pill tone={item.type === "Product" ? "primary" : "neutral"}>{item.type}</Pill>
                      </div>

                      <h3 className="mt-2.5 text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                        {item.name}
                      </h3>

                      {item.description && (
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {item.description}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
                        <span className="font-extrabold text-foreground">{item.price || "Price on request"}</span>
                        {item.moq && (
                          <>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-muted-foreground">MOQ: {item.moq}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 border-t border-border pt-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            href={`/business/${biz?.slug || biz?._id || ""}`}
                            className="truncate text-xs font-bold text-foreground hover:text-primary hover:underline block"
                          >
                            {biz?.name || "Member Business"}
                          </Link>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {item.city || biz?.city || "National"} · {biz?.chapter || "RIFAH"}
                          </p>
                        </div>
                        <Button asChild size="sm" variant="ghost" className="h-7 text-xs font-semibold px-2 shrink-0">
                          <Link href={`/business/${biz?.slug || biz?._id || ""}`}>
                            <span>View</span>
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            /* BUSINESSES MEMBERS GRID */
            <>
              {/* Mobile: compact rows */}
              <div className="mt-4 space-y-3 sm:hidden">
                {visibleBusinesses.map((b) => (
                  <CompactBusinessCard key={b._id || b.slug} business={b} />
                ))}
              </div>
              {/* Tablet/desktop: card grid */}
              <div className="mt-4 hidden gap-4 sm:grid sm:grid-cols-2 xl:grid-cols-3">
                {visibleBusinesses.map((b) => (
                  <BusinessCard key={b._id || b.slug} business={b} />
                ))}
              </div>
            </>
          )}

          {/* Scaled for 10k/50k users: Windowed batch pagination */}
          {results.length > displayCount && (
            <div className="mt-8 flex justify-center pb-8">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setDisplayCount((prev) => prev + 18)}
                className="rounded-2xl border-primary/30 px-8 py-3 text-sm font-semibold hover:bg-primary/5 transition-all shadow-xs"
              >
                Load more results ({results.length - displayCount} remaining)
              </Button>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}

export { DiscoverPage };
export default DiscoverPage;
