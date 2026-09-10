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
      <section className="hero-navy text-navy-foreground relative overflow-hidden">
        {/* Ambient Animated Glow Orbs */}
        <div className="pointer-events-none absolute -top-24 -left-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-pulse-slow" />
        <div className="pointer-events-none absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-brand/20 blur-3xl animate-float-slow" />

        <div className="rifah-container relative z-10 grid gap-8 py-8 md:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div className="max-w-2xl">
            <div className="animate-fade-in-up [animation-delay:100ms]">
              <Pill tone="brand" className="bg-brand text-brand-foreground shadow-sm">
                RIFAH Chamber of Commerce & Industry
              </Pill>
            </div>
            <h1 className="mt-3 text-[28px] font-bold leading-[1.15] tracking-tight sm:text-4xl lg:text-[52px] animate-fade-in-up [animation-delay:200ms]">
              Connect. Discover. Grow.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-navy-foreground/75 md:text-base animate-fade-in-up [animation-delay:300ms]">
              RIFAH Connect is the chamber's digital business network — find verified suppliers and service
              providers, publish your own business catalogue, and turn enquiries into qualified leads.
            </p>
            <div className="mt-5 animate-fade-in-up [animation-delay:400ms]">
              <HeroSearch />
            </div>
            <div className="mt-4 flex flex-wrap gap-2 animate-fade-in-up [animation-delay:500ms]">
              <Button asChild size="lg" className="shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95">
                <Link href="/discover">
                  Discover businesses <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="brand" className="shadow-lg shadow-brand/25 transition-transform duration-200 hover:scale-105 active:scale-95">
                <Link href="/register-business">Join RIFAH</Link>
              </Button>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-navy-foreground/70 animate-fade-in-up [animation-delay:600ms]">
              <li className="inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-white cursor-default group">
                <ShieldCheck className="h-4 w-4 text-emerald-400 transition-transform duration-300 group-hover:scale-125" /> Chamber-verified businesses
              </li>
              <li className="inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-white cursor-default group">
                <Target className="h-4 w-4 text-sky-400 transition-transform duration-300 group-hover:scale-125" /> Routed lead generation
              </li>
              <li className="inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-white cursor-default group">
                <Handshake className="h-4 w-4 text-amber-400 transition-transform duration-300 group-hover:scale-125" /> Chapters across regions
              </li>
            </ul>
          </div>

          <div className="hidden lg:block animate-fade-in-up [animation-delay:350ms]">
            <div className="rounded-3xl border border-navy-foreground/15 bg-navy-foreground/5 p-5 backdrop-blur-md shadow-2xl transition-all duration-300 hover:border-navy-foreground/25">
              <p className="text-xs font-semibold uppercase tracking-wider text-navy-foreground/60 flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                How a requirement moves through RIFAH Connect
              </p>
              <ol className="mt-4 space-y-3">
                {[
                  { icon: Search, t: "Buyer searches the directory", d: "Filter by industry, product, location and chapter." },
                  { icon: Building2, t: "Opens a business profile", d: "Catalogue, certifications and membership level." },
                  { icon: Target, t: "Submits a structured enquiry", d: "Routed to matching member businesses." },
                  { icon: MessageSquare, t: "Businesses respond and negotiate", d: "In-platform messaging keeps a record." },
                ].map((s) => (
                  <li
                    key={s.t}
                    className="group flex gap-3 rounded-xl bg-navy-foreground/5 p-3 transition-all duration-300 hover:translate-x-2 hover:bg-navy-foreground/10 hover:shadow-md cursor-default"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <s.icon className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold transition-colors duration-200 group-hover:text-white">{s.t}</p>
                      <p className="text-xs text-navy-foreground/65">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="rifah-container py-8 md:py-12">
        <SectionHeader
          title="Browse by category"
          description="Sector groupings maintained by the RIFAH secretariat."
          action={<MoreLink href="/discover">All categories</MoreLink>}
        />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {topCategories.map((c) => (
            <Link
              key={c.label}
              href={`/discover?industry=${encodeURIComponent(c.label)}`}
              className="group flex min-h-[96px] flex-col justify-between rounded-2xl border border-border bg-surface p-3.5 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:bg-primary-soft/25 hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:shadow-md">
                <c.icon className="h-4.5 w-4.5 transition-transform duration-300" />
              </span>
              <span className="mt-2 text-sm font-semibold leading-snug transition-colors duration-200 group-hover:text-primary">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured businesses */}
      <section className="rifah-container py-2 md:py-6">
        <SectionHeader
          title="Featured businesses"
          description="Premium and enterprise members with enhanced presentation."
          action={<MoreLink href="/discover" />}
        />
        <div className="mt-4 -mx-4 flex snap-x gap-3 overflow-x-auto px-4 no-scrollbar md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 xl:grid-cols-4">
          {featured.slice(0, 4).map((b) => (
            <div key={b._id || b.slug} className="flex h-full w-[80vw] shrink-0 snap-start flex-col sm:w-[60vw] md:w-auto">
              <PremiumBusinessCard business={b} />
            </div>
          ))}
        </div>
      </section>

      {/* Products & services */}
      <section className="rifah-container py-8 md:py-12">
        <SectionHeader
          title="Discover products & services"
          description="Catalogue entries published by member businesses."
          action={<MoreLink href="/catalogue" />}
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {catalogueList.slice(0, 4).map((item) => {
            const biz = item.business;
            const itemImg = item.images && item.images.length > 0 ? resolveMediaUrl(item.images[0]) : null;
            return (
              <article
                key={item._id || item.slug}
                className="group flex flex-col rounded-2xl border border-border bg-surface p-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40"
              >
                {itemImg ? (
                  <div className="mb-3 h-28 w-full overflow-hidden rounded-xl bg-muted">
                    <img
                      src={itemImg}
                      alt={item.name}
                      loading="lazy"
                      onError={(ev) => {
                        ev.currentTarget.parentElement.style.display = "none";
                      }}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-primary transition-transform duration-300 group-hover:scale-110">
                    <Package className="h-4.5 w-4.5" />
                  </span>
                )}
                <div className="mt-3 flex items-center gap-2">
                  <Pill tone={item.type === "Product" ? "primary" : "neutral"}>{item.type}</Pill>
                </div>
                <h3 className="mt-2 text-sm font-semibold leading-snug transition-colors duration-200 group-hover:text-primary">{item.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
                <p className="mt-2 text-xs font-medium text-muted-foreground">
                  {biz?.name} · {item.city}
                </p>
                <Button asChild size="sm" variant="outline" className="mt-4 transition-all duration-200 group-hover:border-primary group-hover:bg-primary group-hover:text-white shadow-sm">
                  <Link href={`/enquiry/new?category=${encodeURIComponent(item.category || "")}`}>
                    Enquire
                  </Link>
                </Button>
              </article>
            );
          })}
        </div>
      </section>

      {/* Events */}
      <section className="rifah-container py-8 md:py-12">
        <SectionHeader
          title="Upcoming RIFAH events"
          description="Chapter meets, clinics and forums open to members."
          action={<MoreLink href="/events" />}
        />
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {upcoming.map((e) => (
            <article
              key={e._id || e.slug}
              className="group overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40"
            >
              <div className="relative h-28 overflow-hidden bg-muted">
                <img
                  src={e.coverImage ? resolveMediaUrl(e.coverImage) : eventImage}
                  alt={`${e.title} — RIFAH event`}
                  loading="lazy"
                  width={1024}
                  height={640}
                  onError={(ev) => {
                    ev.currentTarget.src = eventImage;
                  }}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-end p-4">
                  <Pill tone="navy" className="bg-surface text-navy shadow-sm transition-transform duration-300 group-hover:scale-105">
                    {e.mode}
                  </Pill>
                </div>
              </div>
              <div className="p-4">
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <CalendarDays className="h-3.5 w-3.5" /> {e.date} · {e.time}
                </p>
                <h3 className="mt-1.5 text-sm font-semibold leading-snug transition-colors duration-200 group-hover:text-primary">{e.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {e.venue}{e.city ? ` · ${e.city}` : ""}
                </p>
                <Button asChild size="sm" variant="outline" className="mt-3 w-full transition-all duration-200 group-hover:border-primary group-hover:bg-primary group-hover:text-white shadow-sm">
                  <Link href={`/events/${e._id || e.slug}`}>
                    View event
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Membership preview */}
      <section className="rifah-container py-8 md:py-12">
        <SectionHeader
          title="Membership that fits your business"
          description="Free listings through to enterprise membership."
          action={<MoreLink href="/membership">Compare plans</MoreLink>}
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((p) => (
            <article
              key={p.id}
              className={
                p.id === "premium"
                  ? "group rounded-2xl border-2 border-brand bg-surface p-5 shadow-lg shadow-brand/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand/20 relative"
                  : "group rounded-2xl border border-border bg-surface p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/40"
              }
            >
              {p.id === "premium" && <Pill tone="brand">Most chosen</Pill>}
              <h3 className="mt-2 text-base font-semibold">{p.name}</h3>
              <p className="mt-1 text-2xl font-bold tracking-tight">₹ {p.price?.toLocaleString("en-IN")}</p>
              <p className="text-xs text-muted-foreground">Annual subscription</p>
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                {p.features?.map((feat, i) => (
                  <li key={i}>• {feat}</li>
                ))}
              </ul>
              <Button asChild variant={p.id === "premium" ? "brand" : "outline"} className="mt-4 w-full transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] shadow-sm">
                <Link href={`/membership/checkout?plan=${p.id}`}>
                  Choose plan
                </Link>
              </Button>
            </article>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}

export { HomePage };
export default HomePage;
