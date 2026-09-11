"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Factory,
  FlaskConical,
  HardHat,
  Handshake,
  Laptop,
  MessageSquare,
  Package,
  Search,
  ShieldCheck,
  Ship,
  Target,
  Truck,
} from "lucide-react";
import { useState } from "react";

import { Pill } from "@shared/components/rifah/badges";
import { PremiumBusinessCard } from "@shared/components/rifah/business-card";
import { PublicLayout } from "@shared/components/rifah/public-layout";
import { MoreLink, SectionHeader } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { eventImage, resolveMediaUrl } from "@shared/lib/media";
import { cn } from "@shared/lib/utils";
import {
  useBusinesses,
  useCatalogue,
  useEvents,
  useMembershipPlans,
} from "@shared/hooks/use-rifah-api";

const topCategories = [
  { label: "Manufacturing", icon: Factory },
  { label: "Trading & Export", icon: Ship },
  { label: "Information Technology", icon: Laptop },
  { label: "Logistics", icon: Truck },
  { label: "Construction", icon: HardHat },
  { label: "Chemicals", icon: FlaskConical },
];

function HeroSearch({ compact = false }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/discover?search=${encodeURIComponent(q)}`);
      }}
      className={
        compact
          ? "flex gap-2 text-foreground"
          : "flex flex-col gap-2 rounded-2xl border border-white/20 bg-surface/95 backdrop-blur p-2 text-foreground shadow-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/40 focus-within:shadow-2xl sm:flex-row sm:items-center"
      }
      role="search"
    >
      <label htmlFor="hero-search" className="sr-only">
        Search businesses, products or services
      </label>
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="hero-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search businesses, products or services"
          className="h-12 border-0 bg-transparent pl-9 text-foreground placeholder:text-muted-foreground shadow-none focus-visible:ring-0"
        />
      </div>
      <Button type="submit" size="lg" className="shrink-0 transition-transform duration-200 hover:scale-105 active:scale-95 shadow-md">
        Search
      </Button>
    </form>
  );
}

function HomePage() {
  const { data: businessesData } = useBusinesses({ featured: "true", limit: 4 });
  const { data: catalogueData } = useCatalogue({ limit: 4 });
  const { data: eventsData } = useEvents({ status: "Upcoming", limit: 3 });
  const { data: plansData } = useMembershipPlans();

  const featured = Array.isArray(businessesData)
    ? businessesData
    : (businessesData?.businesses || businessesData?.data || []);
  const catalogueList = Array.isArray(catalogueData)
    ? catalogueData
    : (catalogueData?.items || catalogueData?.data || []);
  const upcoming = Array.isArray(eventsData)
    ? eventsData
    : (eventsData?.events || eventsData?.data || []);
  const plans = plansData
    ? (Array.isArray(plansData)
        ? plansData
        : typeof plansData === "object"
          ? Object.entries(plansData).map(([id, p]) => ({ id, ...p }))
          : [])
    : [];

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy py-12 md:py-16 lg:py-20 text-navy-foreground border-b border-navy-foreground/10">
        {/* Subtle executive background grid */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="rifah-container relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="max-w-2xl">
            <Pill tone="brand" className="border-brand/30 bg-brand/15 text-brand-foreground text-xs px-3 py-1 font-medium">
              RIFAH Chamber of Commerce & Industry
            </Pill>
            
            <h1 className="mt-4 text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-5xl">
              Connect. Discover. Grow.
            </h1>
            
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 md:text-base">
              RIFAH Connect is the chamber's digital business network — discover verified suppliers and service
              providers, publish your catalogue, and connect through structured trade enquiries.
            </p>
            
            <div className="mt-6">
              <HeroSearch />
            </div>
            
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs">
                <Link href="/discover" className="gap-2">
                  Discover Businesses <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-slate-700 bg-slate-900/60 text-white hover:bg-slate-800 hover:text-white font-semibold">
                <Link href="/register-business">Join RIFAH</Link>
              </Button>
            </div>
            
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-300">
              <li className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Chamber-Verified Businesses
              </li>
              <li className="inline-flex items-center gap-2">
                <Target className="h-4 w-4 text-sky-400" /> Routed Trade Enquiries
              </li>
              <li className="inline-flex items-center gap-2">
                <Handshake className="h-4 w-4 text-amber-400" /> Pan-India Regional Chapters
              </li>
            </ul>
          </div>

          <div className="hidden lg:block">
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 backdrop-blur-sm shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                How trade flows on RIFAH Connect
              </p>
              <ol className="mt-4 space-y-3">
                {[
                  { icon: Search, t: "Buyer searches the directory", d: "Filter by industry, product, location and chapter." },
                  { icon: Building2, t: "Explores business profiles", d: "Verified catalogues, certifications and memberships." },
                  { icon: Target, t: "Submits structured enquiry", d: "Enquiry automatically routed to verified suppliers." },
                  { icon: MessageSquare, t: "Direct negotiation & deal closure", d: "In-platform messaging keeps a verified audit record." },
                ].map((s, idx) => (
                  <li
                    key={s.t}
                    className="flex gap-3.5 rounded-xl border border-slate-800/80 bg-slate-950/40 p-3.5 transition-colors hover:border-slate-700 hover:bg-slate-800/40"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-100">{s.t}</p>
                      <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="rifah-container py-10 md:py-14">
        <SectionHeader
          title="Browse by Industry Category"
          description="Key sectors represented across RIFAH Chamber members."
          action={<MoreLink href="/discover">View all categories</MoreLink>}
        />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {topCategories.map((c) => (
            <Link
              key={c.label}
              href={`/discover?industry=${encodeURIComponent(c.label)}`}
              className="group flex min-h-[104px] flex-col justify-between rounded-2xl border border-border bg-surface p-4 transition-all hover:border-primary/40 hover:shadow-sm"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-muted text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <c.icon className="h-4.5 w-4.5" />
              </span>
              <span className="mt-3 text-xs font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured businesses (only shown when verified businesses exist) */}
      {featured.length > 0 && (
        <section className="border-t border-border bg-muted/20 py-10 md:py-14">
          <div className="rifah-container">
            <SectionHeader
              title="Featured Member Enterprises"
              description="Verified businesses with active commercial catalogues on RIFAH Connect."
              action={<MoreLink href="/discover">Explore directory</MoreLink>}
            />
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featured.slice(0, 4).map((b) => (
                <div key={b._id || b.slug} className="flex h-full flex-col">
                  <PremiumBusinessCard business={b} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products & services (only shown when catalogue items exist) */}
      {catalogueList.length > 0 && (
        <section className="rifah-container py-10 md:py-14">
          <SectionHeader
            title="Featured Products & Services"
            description="Verified offerings published directly by member businesses."
            action={<MoreLink href="/catalogue">Browse catalogue</MoreLink>}
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {catalogueList.slice(0, 4).map((item) => {
              const biz = item.business;
              const itemImg = item.images && item.images.length > 0 ? resolveMediaUrl(item.images[0]) : null;
              return (
                <article
                  key={item._id || item.slug}
                  className="group flex flex-col justify-between rounded-2xl border border-border bg-surface p-4.5 transition-all hover:border-primary/40 hover:shadow-sm"
                >
                  <div>
                    {itemImg ? (
                      <div className="mb-3 h-32 w-full overflow-hidden rounded-xl bg-muted border border-border">
                        <img
                          src={itemImg}
                          alt={item.name}
                          loading="lazy"
                          onError={(ev) => {
                            ev.currentTarget.parentElement.style.display = "none";
                          }}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-muted text-primary mb-3">
                        <Package className="h-4.5 w-4.5" />
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <Pill tone={item.type === "Product" ? "primary" : "neutral"}>{item.type}</Pill>
                    </div>
                    <h3 className="mt-2.5 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">{item.name}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                    <p className="mt-2 text-xs font-medium text-muted-foreground">
                      {biz?.name} {item.city ? `· ${item.city}` : ""}
                    </p>
                  </div>
                  <Button asChild size="sm" variant="outline" className="mt-4 w-full">
                    <Link href={`/enquiry/new?category=${encodeURIComponent(item.category || "")}`}>
                      Send Enquiry
                    </Link>
                  </Button>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Events (only shown when upcoming events exist) */}
      {upcoming.length > 0 && (
        <section className="border-t border-border bg-muted/20 py-10 md:py-14">
          <div className="rifah-container">
            <SectionHeader
              title="Chamber Events & Clinics"
              description="Upcoming chapter meetings, networking sessions, and business workshops."
              action={<MoreLink href="/events">All events</MoreLink>}
            />
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {upcoming.map((e) => (
                <article
                  key={e._id || e.slug}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:border-primary/40 hover:shadow-sm"
                >
                  <div>
                    <div className="relative h-36 overflow-hidden bg-muted">
                      <img
                        src={e.coverImage ? resolveMediaUrl(e.coverImage) : eventImage}
                        alt={`${e.title} — RIFAH event`}
                        loading="lazy"
                        width={1024}
                        height={640}
                        onError={(ev) => {
                          ev.currentTarget.src = eventImage;
                        }}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute left-3 top-3">
                        <Pill tone="navy" className="bg-navy text-white text-[10px] font-semibold">
                          {e.mode}
                        </Pill>
                      </div>
                    </div>
                    <div className="p-4.5">
                      <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                        <CalendarDays className="h-3.5 w-3.5" /> {e.date} · {e.time}
                      </p>
                      <h3 className="mt-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">{e.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {e.venue}{e.city ? ` · ${e.city}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="p-4.5 pt-0">
                    <Button asChild size="sm" variant="outline" className="w-full">
                      <Link href={`/events/${e._id || e.slug}`}>
                        View Event Details
                      </Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Membership preview */}
      <section className="rifah-container py-10 md:py-16">
        <SectionHeader
          title="RIFAH Membership Plans"
          description="Select the membership tier tailored to your enterprise's growth stage."
          action={<MoreLink href="/membership">Compare all features</MoreLink>}
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((p) => {
            const isFeatured = p.id === "premium";
            return (
              <article
                key={p.id}
                className={cn(
                  "flex flex-col justify-between rounded-2xl border p-5 transition-all hover:shadow-sm",
                  isFeatured
                    ? "border-primary bg-primary-soft/20 ring-1 ring-primary/30"
                    : "border-border bg-surface"
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-foreground">{p.name}</h3>
                    {isFeatured && <Pill tone="brand">Most Popular</Pill>}
                  </div>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                    ₹ {p.price?.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-muted-foreground">Annual subscription</p>
                  <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                    {p.features?.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary font-bold">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button asChild variant={isFeatured ? "default" : "outline"} className="mt-6 w-full font-semibold">
                  <Link href={`/membership/checkout?plan=${p.id}`}>
                    Select {p.name}
                  </Link>
                </Button>
              </article>
            );
          })}
        </div>
      </section>
    </PublicLayout>
  );
}

export { HomePage };
export default HomePage;
