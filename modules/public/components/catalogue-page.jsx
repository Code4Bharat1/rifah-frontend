"use client";
import Link from "next/link";
import { Package, Search, Send, SlidersHorizontal, Wrench } from "lucide-react";
import { useState } from "react";

import { Pill, VerificationBadge } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { PublicLayout } from "@shared/components/rifah/public-layout";
import { SectionHeader } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@shared/components/ui/tabs";
import { cities } from "@shared/lib/mock-data";
import { useCatalogue } from "@shared/hooks/use-rifah-api";
import { cn } from "@shared/lib/utils";
import { resolveMediaUrl } from "@shared/lib/api-client";

function CataloguePage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [city, setCity] = useState("All locations");
  const [openFilters, setOpenFilters] = useState(false);

  const { data: catalogueData, isLoading } = useCatalogue({
    search: query || undefined,
    type: type === "all" ? undefined : type,
    city: city === "All locations" ? undefined : city,
  });

  const results = Array.isArray(catalogueData)
    ? catalogueData
    : (catalogueData?.items || []);

  return (
    <PublicLayout>
      <div className="rifah-container py-6 sm:py-10">
        <SectionHeader
          title="Products & services catalogue"
          description="Offerings published by RIFAH member businesses. Send an enquiry and the chamber routes it to the supplier."
        />

        <div className="mt-5 space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search offerings, e.g. corrugated boxes"
              aria-label="Search catalogue"
              className="h-12 pl-10"
            />
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:flex">
            <Tabs value={type} onValueChange={(v) => setType(v)} className="min-w-0">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="Product">Products</TabsTrigger>
                <TabsTrigger value="Service">Services</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              variant="outline"
              className="shrink-0 sm:hidden"
              onClick={() => setOpenFilters((o) => !o)}
              aria-expanded={openFilters}
            >
              <SlidersHorizontal className="h-4 w-4" /> Location
            </Button>
            <div className={cn("col-span-2 sm:block", openFilters ? "block" : "hidden")}>
              <div className="flex flex-wrap gap-1.5">
                {["All locations", ...cities.slice(0, 6)].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCity(c)}
                    aria-pressed={city === c}
                    className={cn(
                      "rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors",
                      city === c ? "border-primary bg-primary-soft text-primary" : "hover:bg-muted"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground" role="status">
          {results.length} offering{results.length === 1 ? "" : "s"} shown
        </p>

        {results.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={Package}
              title="No offerings found"
              description="Try adjusting your keywords or location filter."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery("");
                    setType("all");
                    setCity("All locations");
                  }}
                >
                  Reset filters
                </Button>
              }
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((item) => {
              const biz = item.business;
              const hasImage = item.images && item.images.length > 0;
              return (
                <article
                  key={item._id || item.slug}
                  className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-4 transition-all hover:border-primary/40 hover:shadow-card overflow-hidden"
                >
                  <div>
                    {hasImage && (
                      <div className="relative mb-3 h-36 w-full overflow-hidden rounded-xl bg-muted border border-border">
                        <img
                          src={resolveMediaUrl(item.images[0])}
                          alt={item.name}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-primary">
                        {item.type === "Product" ? <Package className="h-5 w-5" /> : <Wrench className="h-5 w-5" />}
                      </span>
                      <Pill tone={item.type === "Product" ? "primary" : "neutral"}>{item.type}</Pill>
                    </div>
                    <h2 className="mt-3 text-base font-semibold leading-snug">{item.name}</h2>
                    <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{item.price || "On Request"}</span>
                      {item.moq && (
                        <>
                          <span>·</span>
                          <span>MOQ: {item.moq}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 border-t border-border pt-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/business/${biz?.slug || biz?._id || ""}`}
                          className="truncate text-xs font-semibold hover:underline"
                        >
                          {biz?.name}
                        </Link>
                        <p className="text-[11px] text-muted-foreground">
                          {item.city} · {biz?.chapter}
                        </p>
                      </div>
                      {biz?.verification === "verified" && <VerificationBadge level="verified" compact />}
                    </div>
                    <Button asChild size="sm" className="mt-3 w-full">
                      <Link href={`/enquiry/new?category=${encodeURIComponent(item.category)}`}>
                        <Send className="h-3.5 w-3.5" /> Enquire about this
                      </Link>
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

export { CataloguePage };
export default CataloguePage;
