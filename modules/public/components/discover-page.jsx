"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Search, SlidersHorizontal, X, Package, Tag } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { CATEGORIES_DATA, getMainCategories, getSubCategoriesFor } from "@shared/lib/categories-data";

import { BusinessCard, CompactBusinessCard } from "@shared/components/rifah/business-card";
import { EmptyState, SkeletonCard } from "@shared/components/rifah/empty-state";
import { PublicLayout } from "@shared/components/rifah/public-layout";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Checkbox } from "@shared/components/ui/checkbox";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@shared/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@shared/components/ui/sheet";
import { industries } from "@shared/lib/mock-data";
import { useBusinesses, useChapters, useCategories } from "@shared/hooks/use-rifah-api";
import { cn } from "@shared/lib/utils";

const membershipLevels = ["Free", "Basic", "Premium", "Enterprise"];

function DiscoverPage() {
  const searchParams = useSearchParams();
  const search = Object.fromEntries(searchParams ? searchParams.entries() : []);
  const router = useRouter();
  const [query, setQuery] = useState(search.q || search.search || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);
  const t = useTranslations("Discover");

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

  const { data: businessesData, isLoading } = useBusinesses({
    search: search.q || search.search,
    industry: search.industry,
    subCategory: search.subCategory,
    state: search.state,
    chapter: search.chapter,
    membership: search.membership,
    verified: search.verified,
    sort: search.sort,
  });

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

  const results = Array.isArray(businessesData)
    ? businessesData
    : (businessesData?.businesses || []);

  const searchSuggestions = React.useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return { categories: [], subCategories: [], businesses: [], hasAny: false };

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
    const matchingBiz = results
      .filter(
        (b) =>
          (b.name || "").toLowerCase().includes(q) ||
          (b.industry || "").toLowerCase().includes(q) ||
          (b.tagline || "").toLowerCase().includes(q)
      )
      .slice(0, 4);

    return {
      categories: matchingCats,
      subCategories: matchingSubs,
      businesses: matchingBiz,
      hasAny: matchingCats.length > 0 || matchingSubs.length > 0 || matchingBiz.length > 0,
    };
  }, [query, allMainCategories, results]);

  const setParam = (patch) => {
    const current = new URLSearchParams(searchParams ? searchParams.toString() : "");
    Object.entries(patch).forEach(([key, val]) => {
      if (val === undefined || val === null || val === "" || val === "All" || val === "all") {
        current.delete(key);
      } else {
        current.set(key, String(val));
      }
    });
    const qs = current.toString();
    router.push(qs ? `/discover?${qs}` : "/discover", { scroll: false });
  };

  const activeChips = [
    search.industry && { label: `Industry: ${search.industry}`, clear: () => setParam({ industry: undefined, subCategory: undefined }) },
    search.subCategory && { label: `Sub-category: ${search.subCategory}`, clear: () => setParam({ subCategory: undefined }) },
    search.state && { label: search.state, clear: () => setParam({ state: undefined }) },
    search.chapter && { label: search.chapter, clear: () => setParam({ chapter: undefined }) },
    search.membership && { label: search.membership, clear: () => setParam({ membership: undefined }) },
    search.verified && { label: t("verifiedOnly"), clear: () => setParam({ verified: undefined }) },
  ].filter(Boolean);

  const filters = (
    <div className="space-y-5">
      <div>
        <Label htmlFor="f-industry" className="font-semibold text-xs text-foreground uppercase tracking-wider">{t("industry")}</Label>
        <Select
          value={search.industry || "all"}
          onValueChange={(v) => setParam({ industry: v === "all" ? undefined : v, subCategory: undefined })}
        >
          <SelectTrigger id="f-industry" className="mt-1.5 h-10 rounded-xl bg-background">
            <SelectValue placeholder={t("allIndustries")} />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="all">{t("allIndustries")}</SelectItem>
            {allMainCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="f-subcategory" className="font-semibold text-xs text-foreground uppercase tracking-wider">Sub Category</Label>
        <Select
          value={search.subCategory || "all"}
          onValueChange={(v) => setParam({ subCategory: v === "all" ? undefined : v })}
          disabled={!search.industry || search.industry === "all"}
        >
          <SelectTrigger id="f-subcategory" className="mt-1.5 h-10 rounded-xl bg-background">
            <SelectValue placeholder={search.industry ? "All sub-categories" : "Select industry first"} />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="all">All sub-categories</SelectItem>
            {filteredSubCategories.map((sub) => (
              <SelectItem key={sub} value={sub}>
                {sub}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {search.industry && search.industry !== "all" && (
          <p className="mt-1 text-[10px] text-muted-foreground">
            {filteredSubCategories.length} sub-categories for {search.industry}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="f-state" className="font-semibold text-xs text-foreground uppercase tracking-wider">{t("state")}</Label>
        <Select
          value={search.state || "all"}
          onValueChange={(v) => {
            const nextState = v === "all" ? undefined : v;
            const chapterStillValid = !search.chapter || chaptersList.some(
              (ch) => ch.name === search.chapter && (!nextState || (ch.state || "").trim().toLowerCase() === nextState.trim().toLowerCase())
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
      <div>
        <Label htmlFor="f-chapter" className="font-semibold text-xs text-foreground uppercase tracking-wider">{t("chapter")}</Label>
        <Select value={search.chapter || "all"} onValueChange={(v) => setParam({ chapter: v === "all" ? undefined : v })}>
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
      <fieldset>
        <Label className="font-semibold text-xs text-foreground uppercase tracking-wider">{t("membershipLevel")}</Label>
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
      <div className="pt-1">
        <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
          <Checkbox
            checked={search.verified === "true" || search.verified === true}
            onCheckedChange={(c) => setParam({ verified: c ? "true" : undefined })}
          />
          <span className={cn("text-xs font-medium", (search.verified === "true" || search.verified === true) ? "text-primary font-bold" : "text-foreground")}>
            {t("verifiedOnly")}
          </span>
        </label>
      </div>
      <Button
        variant="outline"
        className="w-full h-9 rounded-xl text-xs font-semibold"
        onClick={() => router.push("/discover")}
      >
        {t("clearAllFilters")}
      </Button>
    </div>
  );

  return (
    <PublicLayout>
      <div className="border-b border-border bg-surface">
        <div className="rifah-container py-8 lg:py-12">
          <h1 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">{t("title")}</h1>
          <p className="mt-2 max-w-2xl text-base text-muted-foreground">{t("subtitle")}</p>
          <form
            className="mt-4 flex gap-2 relative z-30"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              setShowSuggestions(false);
              setParam({ q: query || undefined });
            }}
          >
            <div className="relative min-w-0 flex-1" ref={searchContainerRef}>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search businesses, categories (e.g. IT, Manufacturing), or sub-categories (e.g. Web, CNC, Solar)..."
                className="h-11 pl-9 pr-8"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                    <div className="pt-2">
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
                </div>
              )}
            </div>
            <Button type="submit" className="shrink-0">
              {t("searchButton")}
            </Button>
          </form>

          {/* Mobile filter chips + bottom sheet */}
          <div className="mt-3 flex items-center gap-2 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="shrink-0">
                  <SlidersHorizontal className="h-4 w-4" /> {t("filters")}
                  {activeChips.length > 0 && (
                    <span className="ml-1 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
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
              {["Manufacturing", "Logistics", "Textiles"].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setParam({ industry: search.industry === i ? undefined : i })}
                  className={cn(
                    "shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-semibold",
                    search.industry === i && "border-primary bg-primary-soft text-primary",
                  )}
                >
                  {i}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setParam({ verified: search.verified ? undefined : true })}
                className={cn(
                  "shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-semibold",
                  search.verified && "border-primary bg-primary-soft text-primary",
                )}
              >
                {t("verified")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rifah-container grid gap-6 py-6 lg:grid-cols-[268px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <Panel title={t("filters")} className="sticky top-24">
            {filters}
          </Panel>
        </aside>

        <div className="min-w-0">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span className="text-foreground">{results.length}</span> {t("businessesFound")}
            </div>
            <Select
              value={search.sort ?? "recommended"}
              onValueChange={(v) => setParam({ sort: v })}
            >
              <SelectTrigger className="w-[168px]" aria-label="Sort results">
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
            <EmptyState
              className="mt-6"
              icon={Building2}
              title="No businesses match these filters"
              description="Try widening the location or industry filter, or search for a product or service instead."
              action={
                <Button variant="outline" onClick={() => router.push("/discover")}>
                  Reset filters
                </Button>
              }
            />
          ) : (
            <>
              {/* Mobile: compact rows */}
              <div className="mt-4 space-y-3 sm:hidden">
                {results.map((b) => (
                  <CompactBusinessCard key={b._id || b.slug} business={b} />
                ))}
              </div>
              {/* Tablet/desktop: card grid */}
              <div className="mt-4 hidden gap-4 sm:grid sm:grid-cols-2 xl:grid-cols-3">
                {results.map((b) => (
                  <BusinessCard key={b._id || b.slug} business={b} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}

export { DiscoverPage };
export default DiscoverPage;
