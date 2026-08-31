"use client";
import Link from "next/link";
import { Package, Search, Send, SlidersHorizontal, Wrench } from "lucide-react";
import { useMemo, useState } from "react";

import { Pill, VerificationBadge } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { PublicLayout } from "@shared/components/rifah/public-layout";
import { SectionHeader } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@shared/components/ui/tabs";
import { catalogue, cities, getBusiness } from "@shared/lib/mock-data";
import { cn } from "@shared/lib/utils";

function CataloguePage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [city, setCity] = useState("All locations");
  const [openFilters, setOpenFilters] = useState(false);

  const results = useMemo(
    () =>
      catalogue.filter((item) => {
        const q = query.trim().toLowerCase();
        const matchesQuery =
          !q ||
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q);
        const matchesType = type === "all" || item.type === type;
        const matchesCity = city === "All locations" || item.city === city;
        return matchesQuery && matchesType && matchesCity;
      }),
    [query, type, city],
  );

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
            <Tabs value={type} onValueChange={(v) => setType(v )} className="min-w-0">
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
                      city === c ? "border-primary bg-primary-soft text-primary" : "hover:bg-muted",
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
              title="No offerings match these filters"
              description="Try a broader search term or clear the location filter."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery("");
                    setType("all");
                    setCity("All locations");
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          </div>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((item) => {
              const biz = getBusiness(item.businessId);
              return (
                <li key={item.id} className="flex flex-col rounded-2xl border border-border bg-surface p-4">
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                        item.type === "Product" ? "bg-primary-soft text-primary" : "bg-accent text-accent-foreground",
                      )}
                      aria-hidden
                    >
                      {item.type === "Product" ? <Package className="h-5 w-5" /> : <Wrench className="h-5 w-5" />}
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold">{item.name}</h3>
                      <p className="truncate text-xs text-muted-foreground">{item.category}</p>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Pill>{item.type}</Pill>
                    <Pill>{item.city}</Pill>
                    {item.moq && <Pill>MOQ {item.moq}</Pill>}
                  </div>
                  {biz && (
                    <div className="mt-3 border-t border-border pt-3">
                      <Link href={`/business/${biz.id }`}
                        className="text-sm font-semibold hover:text-primary"
                      >
                        {biz.name}
                      </Link>
                      <div className="mt-1">
                        <VerificationBadge status={biz.verification} compact />
                      </div>
                    </div>
                  )}
                  <div className="mt-3 flex flex-1 items-end">
                    <Button asChild size="sm" className="w-full">
                      <Link href={`/enquiry/new?business=custom`}>
                        <Send className="h-4 w-4" /> Enquire
                      </Link>
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </PublicLayout>
  );
}


export { CataloguePage };
export default CataloguePage;
