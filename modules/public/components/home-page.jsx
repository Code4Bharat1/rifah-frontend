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
  FileText,
  CheckCircle2,
  Send,
  Loader2,
  Phone,
  Mail,
  User,
  MapPin,
  Share2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Pill } from "@shared/components/rifah/badges";
import { PremiumBusinessCard } from "@shared/components/rifah/business-card";
import { PublicLayout } from "@shared/components/rifah/public-layout";
import { MoreLink, SectionHeader } from "@shared/components/rifah/ui-bits";
import { ChamberMembershipTiers } from "@shared/components/rifah/chamber-membership-tiers";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { PhoneInput } from "@shared/components/ui/phone-input";
import { EventShareModal } from "@shared/components/rifah/event-share-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@shared/components/ui/dialog";
import { enquiryApi } from "@shared/lib/api-services";
import { eventImage, resolveMediaUrl } from "@shared/lib/media";
import { cn } from "@shared/lib/utils";
import { getEventStatus, getEventStatusConfig } from "@shared/lib/event-utils";
import {
  useBusinesses,
  useCatalogue,
  useEvents,
  useMembershipPlans,
  usePublicStateRevenue,
} from "@shared/hooks/use-rifah-api";
import { cities } from "@shared/lib/mock-data";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

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
  const { data: businessesData } = useBusinesses({ featured: "true", verified: "true", limit: 8 });
  const { data: catalogueData } = useCatalogue({ limit: 4 });
  const { data: eventsData } = useEvents({ status: "Upcoming", limit: 3 });
  const { data: plansData } = useMembershipPlans();
  const { data: stateRevenueData } = usePublicStateRevenue();
  const stateRevenue = (Array.isArray(stateRevenueData) ? stateRevenueData : [])
    .filter(
      (s) =>
        s?.state &&
        typeof s.state === "string" &&
        s.state.trim().toLowerCase() !== "unassigned" &&
        s.state.trim().toLowerCase() !== "unknown" &&
        s.state.trim().toLowerCase() !== "null"
    )
    .map((s) => ({
      ...s,
      state: s.state
        .trim()
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" "),
    }));

  const featured = (
    Array.isArray(businessesData)
      ? businessesData
      : (businessesData?.businesses || businessesData?.data || [])
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
    return isVerified && !isPendingOrRejected;
  });
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

  const [sharingEvent, setSharingEvent] = useState(null);

  // Home Page RFQ Modal State
  const [rfqOpen, setRfqOpen] = useState(false);
  const [rfqSubmitting, setRfqSubmitting] = useState(false);
  const [rfqSuccess, setRfqSuccess] = useState(false);
  const [rfqError, setRfqError] = useState("");
  const [rfqForm, setRfqForm] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    category: "Manufacturing",
    title: "",
    quantity: "",
    location: "",
    description: "",
  });

  const handleRfqSubmit = async (e) => {
    e.preventDefault();
    setRfqError("");
    setRfqSubmitting(true);
    try {
      await enquiryApi.create({
        targetType: "all",
        title: rfqForm.title.trim(),
        category: rfqForm.category || "Manufacturing",
        quantity: rfqForm.quantity.trim() || "Flexible",
        location: rfqForm.location.trim() || "Mumbai",
        requiredBy: "Flexible",
        description: rfqForm.description.trim(),
        guestName: rfqForm.guestName.trim(),
        guestEmail: rfqForm.guestEmail.trim(),
        guestPhone: rfqForm.guestPhone.trim(),
      });
      setRfqSuccess(true);
      setRfqForm({
        guestName: "",
        guestEmail: "",
        guestPhone: "",
        category: "Manufacturing",
        title: "",
        quantity: "",
        location: "",
        description: "",
      });
      toast.success("RFQ broadcasted to verified chamber businesses!");
    } catch (err) {
      setRfqError(err?.message || "Failed to submit RFQ. Please check your details and try again.");
    } finally {
      setRfqSubmitting(false);
    }
  };

  const handleRfqClose = (open) => {
    setRfqOpen(open);
    if (!open) {
      setTimeout(() => {
        setRfqSuccess(false);
        setRfqError("");
      }, 300);
    }
  };

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
              <Button
                size="lg"
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold gap-2 shadow-xs transition-all cursor-pointer"
                onClick={() => setRfqOpen(true)}
              >
                <FileText className="h-4 w-4" /> Post RFQ
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

      {/* State-wise business generated (builds trust & encourages new members to join) */}
      {stateRevenue.length > 0 && (
        <section className="border-t border-border bg-muted/20 py-10 md:py-14">
          <div className="rifah-container">
            <SectionHeader
              title="Business Generated Across States"
              description="Real business value RIFAH members have generated for each other through referrals and one-to-one introductions."
            />
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {stateRevenue.slice(0, 6).map((s) => (
                <div key={s.state} className="rounded-2xl border border-border bg-surface p-4.5">
                  <p className="text-sm font-semibold text-foreground">{s.state}</p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-primary">
                    {currencyFormatter.format(s.totalBusinessGenerated)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {s.transactionCount} {s.transactionCount === 1 ? "deal" : "deals"} closed among members
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
              title="Upcoming Events and Activities"
              description="Upcoming chapter meetings, networking sessions, and business workshops."
              action={<MoreLink href="/events">Explore All Events</MoreLink>}
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
                      <div className="absolute left-3 top-3 flex items-center gap-1.5 flex-wrap">
                        {(() => {
                          const status = getEventStatus(e);
                          const cfg = getEventStatusConfig(status);
                          return (
                            <Pill tone={cfg.tone} className={cfg.className}>
                              {cfg.dot && <span className="w-1.5 h-1.5 rounded-full bg-white inline-block mr-1" />}
                              {cfg.label}
                            </Pill>
                          );
                        })()}
                        <Pill tone="navy" className="bg-navy text-white text-[10px] font-semibold">
                          {e.mode}
                        </Pill>
                      </div>
                    </div>
                    <div className="p-4.5">
                      <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                        <CalendarDays className="h-3.5 w-3.5" /> {(() => {
                          if (!e.date) return "";
                          const d = new Date(e.date);
                          return isNaN(d.getTime()) 
                            ? e.date 
                            : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-");
                        })()} · {e.time}
                      </p>
                      <h3 className="mt-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">{e.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {[e.city, e.state].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>
                  <div className="p-4.5 pt-0 flex items-center gap-2">
                    <Button asChild size="sm" variant="outline" className="flex-1 rounded-xl">
                      <Link href={`/events/${e._id || e.slug}`}>
                        View Event Details
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setSharingEvent(e)}
                      className="rounded-xl h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:border-primary/50 shrink-0"
                      title="Share Event"
                      aria-label={`Share ${e.title}`}
                    >
                      <Share2 className="h-4 w-4" />
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
        <div className="mt-6">
          <ChamberMembershipTiers
            plansData={plansData}
            showHeader={false}
          />
        </div>
      </section>

      {/* Home Page RFQ Modal */}
      <Dialog open={rfqOpen} onOpenChange={handleRfqClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Request for Quotation (RFQ)
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
              Broadcast your commercial sourcing requirement to verified suppliers and businesses across the chamber network.
            </DialogDescription>
          </DialogHeader>

          {rfqSuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base sm:text-lg font-bold text-foreground">RFQ Broadcasted Successfully!</h4>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                  Your sourcing enquiry has been registered. Verified chamber businesses matching your requirement will review your details and contact you directly.
                </p>
              </div>
              <div className="pt-2">
                <Button className="w-full sm:w-auto" onClick={() => handleRfqClose(false)}>
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRfqSubmit} className="space-y-3 pt-1">
              {rfqError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                  {rfqError}
                </div>
              )}

              {/* Guest Contact Information */}
              <div className="rounded-xl border border-border bg-surface-raised p-3 space-y-2.5">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-primary" />
                  Your Contact Information (Directly shared with suppliers)
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] sm:text-xs font-medium text-foreground mb-1">
                      Full Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Patil"
                      value={rfqForm.guestName}
                      onChange={(e) => setRfqForm((prev) => ({ ...prev, guestName: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] sm:text-xs font-medium text-foreground mb-1">
                      Phone / WhatsApp <span className="text-destructive">*</span>
                    </label>
                    <PhoneInput
                      required
                      placeholder="98765 43210"
                      value={rfqForm.guestPhone}
                      onChange={(e) => setRfqForm((prev) => ({ ...prev, guestPhone: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-medium text-foreground mb-1">
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={rfqForm.guestEmail}
                    onChange={(e) => setRfqForm((prev) => ({ ...prev, guestEmail: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Requirement Details */}
              <div className="space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] sm:text-xs font-medium text-foreground mb-1">
                      Industry Category <span className="text-destructive">*</span>
                    </label>
                    <select
                      required
                      value={rfqForm.category}
                      onChange={(e) => setRfqForm((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-surface px-2.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Trading & Export">Trading & Export</option>
                      <option value="Food & Spices">Food & Spices / FMCG</option>
                      <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
                      <option value="Construction & Real Estate">Construction</option>
                      <option value="Chemicals & Materials">Chemicals & Materials</option>
                      <option value="Healthcare & Pharma">Healthcare & Pharma</option>
                      <option value="Security & SOC">Security & SOC</option>
                      <option value="General Products & Services">General Products & Services</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] sm:text-xs font-medium text-foreground mb-1">
                      Target City / Location <span className="text-destructive">*</span>
                    </label>
                    <select
                      required
                      value={rfqForm.location}
                      onChange={(e) => setRfqForm((prev) => ({ ...prev, location: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-surface px-2.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select City</option>
                      {cities.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="All India / Pan India">All India / Pan India</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] sm:text-xs font-medium text-foreground mb-1">
                      Requirement Title <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Need 500 Hydraulic Valves"
                      value={rfqForm.title}
                      onChange={(e) => setRfqForm((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] sm:text-xs font-medium text-foreground mb-1">
                      Quantity / Volume <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 500 pcs / 10 tons / Flexible"
                      value={rfqForm.quantity}
                      onChange={(e) => setRfqForm((prev) => ({ ...prev, quantity: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-medium text-foreground mb-1">
                    Specifications & Details <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Describe material grade, sizes, standards, certification required, or delivery urgency..."
                    value={rfqForm.description}
                    onChange={(e) => setRfqForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRfqClose(false)}
                  disabled={rfqSubmitting}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={rfqSubmitting}
                  className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90"
                >
                  {rfqSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Broadcasting RFQ...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit & Broadcast RFQ
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <EventShareModal
        event={sharingEvent}
        open={Boolean(sharingEvent)}
        onOpenChange={(open) => {
          if (!open) setSharingEvent(null);
        }}
      />
    </PublicLayout>
  );
}

export { HomePage };
export default HomePage;
