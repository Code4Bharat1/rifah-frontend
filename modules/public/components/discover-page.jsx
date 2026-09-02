"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

import { BusinessCard, CompactBusinessCard } from "@shared/components/rifah/business-card";
import { EmptyState, SkeletonCard } from "@shared/components/rifah/empty-state";
import { PublicLayout } from "@shared/components/rifah/public-layout";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Checkbox } from "@shared/components/ui/checkbox";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@shared/components/ui/sheet";
import { cities, industries } from "@shared/lib/mock-data";
import { useBusinesses, useChapters } from "@shared/hooks/use-rifah-api";
import { cn } from "@shared/lib/utils";

const membershipLevels = ["Free", "Basic", "Premium", "Enterprise"];

function DiscoverPage() {
  const searchParams = useSearchParams();
  const search = Object.fromEntries(searchParams ? searchParams.entries() : []);
  const router = useRouter();
  const [query, setQuery] = useState(search.q || search.search || "");

  const { data: businessesData, isLoading } = useBusinesses({
    search: search.q || search.search,
    industry: search.industry,
    city: search.city,
    chapter: search.chapter,
    membership: search.membership,
    verified: search.verified,
  });

  const { data: chaptersData } = useChapters();
  const chaptersList = chaptersData || [];

  const results = Array.isArray(businessesData)
    ? businessesData
    : (businessesData?.businesses || []);

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
    search.industry && { label: search.industry, clear: () => setParam({ industry: undefined }) },
    search.city && { label: search.city, clear: () => setParam({ city: undefined }) },
    search.chapter && { label: search.chapter, clear: () => setParam({ chapter: undefined }) },
    search.membership && { label: `${search.membership} member`, clear: () => setParam({ membership: undefined }) },
    search.verified && { label: "Verified only", clear: () => setParam({ verified: undefined }) },
  ].filter(Boolean);

  const filters = (
    <div className="space-y-5">
      <div>
        <Label htmlFor="f-industry">Industry</Label>
        <Select value={search.industry ?? "all"} onValueChange={(v) => setParam({ industry: v === "all" ? undefined : v })}>
          <SelectTrigger id="f-industry" className="mt-1.5">
            <SelectValue placeholder="All industries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All industries</SelectItem>
            {industries.map((i) => (
              <SelectItem key={i} value={i}>
                {i}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="f-city">City</Label>
        <Select value={search.city ?? "all"} onValueChange={(v) => setParam({ city: v === "all" ? undefined : v })}>
          <SelectTrigger id="f-city" className="mt-1.5">
            <SelectValue placeholder="All cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cities</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="f-chapter">RIFAH chapter</Label>
        <Select value={search.chapter ?? "all"} onValueChange={(v) => setParam({ chapter: v === "all" ? undefined : v })}>
          <SelectTrigger id="f-chapter" className="mt-1.5">
            <SelectValue placeholder="All chapters" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All chapters</SelectItem>
            {chaptersList.map((c) => (
              <SelectItem key={c._id || c.name} value={c.name}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <fieldset>
        <legend className="text-sm font-medium">Membership level</legend>
        <div className="mt-2 space-y-2">
          {membershipLevels.map((m) => (
            <label key={m} className="flex min-h-9 items-center gap-2.5 text-sm">
              <Checkbox
                checked={search.membership === m}
                onCheckedChange={(c) => setParam({ membership: c ? m : undefined })}
              />
              {m}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex min-h-11 items-center gap-2.5 text-sm font-medium">
        <Checkbox checked={!!search.verified} onCheckedChange={(c) => setParam({ verified: c ? true : undefined })} />
        Verified businesses only
      </label>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => router.push("/discover")}
      >
        Clear all filters
      </Button>
    </div>
  );

  return (
    <PublicLayout>
      <div className="border-b border-border bg-surface">
        <div className="rifah-container py-5 md:py-8">
          <h1 className="text-xl font-bold tracking-tight md:text-3xl">Discover businesses</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search verified RIFAH member businesses by industry, product, service, location or chapter.
          </p>
          <form
            className="mt-4 flex gap-2"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              setParam({ q: query || undefined });
            }}
          >
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search businesses, products or services"
                className="h-11 pl-9"
                aria-label="Search businesses, products or services"
              />
            </div>
            <Button type="submit" className="shrink-0">
              Search
            </Button>
          </form>

          {/* Mobile filter chips + bottom sheet */}
          <div className="mt-3 flex items-center gap-2 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="shrink-0">
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                  {activeChips.length > 0 && (
                    <span className="ml-1 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
                      {activeChips.length}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl">
                <SheetHeader>
                  <SheetTitle className="text-left">Filter businesses</SheetTitle>
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
                Verified
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rifah-container grid gap-6 py-6 lg:grid-cols-[268px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <Panel title="Filters" className="sticky top-24">
            {filters}
          </Panel>
        </aside>

        <div className="min-w-0">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{results.length}</span> businesses found
            </p>
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
