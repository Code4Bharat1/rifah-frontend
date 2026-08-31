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
import { eventImage } from "@shared/lib/media";
import { businesses, catalogue, events, membershipPlans } from "@shared/lib/mock-data";

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
        navigate({ to: "/discover", search: { q } });
      }}
      className={
        compact
          ? "flex gap-2"
          : "flex flex-col gap-2 rounded-2xl border border-border bg-surface p-2 sm:flex-row sm:items-center"
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
          className="h-12 border-0 bg-transparent pl-9 shadow-none focus-visible:ring-0"
        />
      </div>
      <Button type="submit" size="lg" className="shrink-0">
        Search
      </Button>
    </form>
  );
}

function HomePage() {
  const featured = businesses.filter((b) => b.featured);
  const upcoming = events.filter((e) => e.status === "Upcoming").slice(0, 3);

  return (
    <PublicLayout>
      {/* Hero — deliberately compact on mobile so business content is reachable immediately */}
      <section className="hero-navy text-navy-foreground">
        <div className="rifah-container grid gap-8 py-8 md:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div className="max-w-2xl">
            <Pill tone="brand" className="bg-brand text-brand-foreground">
              RIFAH Chamber of Commerce & Industry
            </Pill>
            <h1 className="mt-3 text-[28px] font-bold leading-[1.15] tracking-tight sm:text-4xl lg:text-[52px]">
              Connect. Discover. Grow.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-navy-foreground/75 md:text-base">
              RIFAH Connect is the chamber's digital business network — find verified suppliers and service
              providers, publish your own business catalogue, and turn enquiries into qualified leads.
            </p>
            <div className="mt-5">
              <HeroSearch />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="lg">
                <Link href="/discover">
                  Discover businesses <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="brand">
                <Link href="/register-business">Join RIFAH</Link>
              </Button>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-navy-foreground/70">
              <li className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> Chamber-verified businesses
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Target className="h-4 w-4" /> Routed lead generation
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Handshake className="h-4 w-4" /> Chapters across regions
              </li>
            </ul>
          </div>

          <div className="hidden lg:block">
            <div className="rounded-3xl border border-navy-foreground/15 bg-navy-foreground/5 p-5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wider text-navy-foreground/60">
                How a requirement moves through RIFAH Connect
              </p>
              <ol className="mt-4 space-y-3">
                {[
                  { icon: Search, t: "Buyer searches the directory", d: "Filter by industry, product, location and chapter." },
                  { icon: Building2, t: "Opens a business profile", d: "Catalogue, certifications and membership level." },
                  { icon: Target, t: "Submits a structured enquiry", d: "Routed to matching member businesses." },
                  { icon: MessageSquare, t: "Businesses respond and negotiate", d: "In-platform messaging keeps a record." },
                ].map((s) => (
                  <li key={s.t} className="flex gap-3 rounded-xl bg-navy-foreground/5 p-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                      <s.icon className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{s.t}</p>
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
            <Link key={c.label}
              href={`/discover?industry=${encodeURIComponent(c.label)}`}
              className="flex min-h-[92px] flex-col justify-between rounded-2xl border border-border bg-surface p-3.5 transition-colors hover:border-primary/40 hover:bg-primary-soft/40"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary">
                <c.icon className="h-4.5 w-4.5" />
              </span>
              <span className="mt-2 text-sm font-semibold leading-snug">{c.label}</span>
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
            <div key={b.id} className="w-[80vw] shrink-0 snap-start sm:w-[60vw] md:w-auto">
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
          {catalogue.slice(0, 4).map((item) => {
            const biz = businesses.find((b) => b.id === item.businessId);
            return (
              <article key={item.id} className="flex flex-col rounded-2xl border border-border bg-surface p-4">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-primary">
                  <Package className="h-4.5 w-4.5" />
                </span>
                <div className="mt-3 flex items-center gap-2">
                  <Pill tone={item.type === "Product" ? "primary" : "neutral"}>{item.type}</Pill>
                </div>
                <h3 className="mt-2 text-sm font-semibold leading-snug">{item.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
                <p className="mt-2 text-xs font-medium text-muted-foreground">
                  {biz?.name} · {item.city}
                </p>
                <Button asChild size="sm" variant="outline" className="mt-4">
                  <Link href={`/enquiry/new?business=custom`}>
                    Enquire
                  </Link>
                </Button>
              </article>
            );
          })}
        </div>
      </section>

      {/* Why RIFAH */}
      <section className="border-y border-border bg-surface py-10 md:py-16">
        <div className="rifah-container">
          <SectionHeader
            title="Why businesses join RIFAH Connect"
            description="A chamber-governed network, not an open marketplace."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: Building2, t: "Digital business presence", d: "A structured profile with catalogue, certifications and contact details that works as a mini-website." },
              { icon: Target, t: "Lead generation", d: "Buyer requirements are routed to relevant member businesses by category, location and membership level." },
              { icon: ShieldCheck, t: "Verification and trust", d: "Chamber verification badges and membership levels give buyers a basis for confidence." },
              { icon: Handshake, t: "Chapters and networking", d: "Regional chapters and units organise events, introductions and sector working groups." },
            ].map((f) => (
              <div key={f.t} className="rounded-2xl border border-border bg-background p-5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy text-navy-foreground">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 text-base font-semibold">{f.t}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
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
            <article key={e.id} className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="relative h-24 overflow-hidden">
                <img
                  src={eventImage}
                  alt={`${e.title} — RIFAH event`}
                  loading="lazy"
                  width={1024}
                  height={640}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-end p-4">
                  <Pill tone="navy" className="bg-surface text-navy">
                    {e.mode}
                  </Pill>
                </div>
              </div>
              <div className="p-4">
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <CalendarDays className="h-3.5 w-3.5" /> {e.date} · {e.time}
                </p>
                <h3 className="mt-1.5 text-sm font-semibold leading-snug">{e.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {e.venue} · {e.city}
                </p>
                <Button asChild size="sm" variant="outline" className="mt-3 w-full">
                  <Link href={`/events/${e.id }`}>
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
          description="Free listings through to enterprise membership. Pricing shown as placeholders."
          action={<MoreLink href="/membership">Compare plans</MoreLink>}
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {membershipPlans.map((p) => (
            <article
              key={p.id}
              className={
                p.highlight
                  ? "rounded-2xl border-2 border-brand bg-surface p-5"
                  : "rounded-2xl border border-border bg-surface p-5"
              }
            >
              {p.highlight && <Pill tone="brand">Most chosen</Pill>}
              <h3 className="mt-2 text-base font-semibold">{p.name}</h3>
              <p className="mt-1 text-2xl font-bold tracking-tight">{p.price}</p>
              {p.period && <p className="text-xs text-muted-foreground">{p.period}</p>}
              <p className="mt-2 text-sm text-muted-foreground">{p.summary}</p>
              <Button asChild variant={p.highlight ? "brand" : "outline"} className="mt-4 w-full">
                <Link href={`/membership/checkout?plan=custom`}>
                  Choose plan
                </Link>
              </Button>
            </article>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="rifah-container pb-4 md:pb-10">
        <div className="grid gap-4 rounded-3xl bg-navy p-6 text-navy-foreground md:grid-cols-[1.4fr_auto] md:items-center md:p-10">
          <div>
            <h2 className="text-xl font-bold tracking-tight md:text-3xl">Grow your business with RIFAH</h2>
            <p className="mt-2 max-w-xl text-sm text-navy-foreground/75">
              Register your business, complete verification and start receiving buyer enquiries through the
              chamber network.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="lg" variant="brand">
              <Link href="/register-business">Register business</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent text-navy-foreground">
              <Link href="/contact">Talk to RIFAH</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}


export { HomePage };
export default HomePage;
