"use client";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
  Award,
  Bookmark,
  Building2,
  Clock,
  Globe,
  Mail,
  MapPin,
  Package,
  Phone,
  Send,
  Share2,
  Star,
  Users,
  Wrench,
} from "lucide-react";
import { useState } from "react";

import { MembershipBadge, Pill, VerificationBadge } from "@shared/components/rifah/badges";
import { PublicLayout } from "@shared/components/rifah/public-layout";
import { FieldRow, Panel, SectionHeader } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/components/ui/tabs";
import { businessGallery, businessImage } from "@shared/lib/media";
import { businesses, reviews } from "@shared/lib/mock-data";
import { cn } from "@shared/lib/utils";

function BusinessNotFound() {
  return (
    <PublicLayout>
      <div className="rifah-container py-16 text-center">
        <h1 className="text-2xl font-bold">Business unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This business profile may have been suspended or is awaiting RIFAH verification.
        </p>
        <Button asChild className="mt-6">
          <Link href="/discover">Back to directory</Link>
        </Button>
      </div>
    </PublicLayout>
  );
}

function BusinessProfile() {
  const params = useParams();
  const businessId = params?.businessId;
  const business = businesses.find((b) => b.id === businessId) || businesses[0];
  if (!business) return <BusinessNotFound />;
  const [saved, setSaved] = useState(false);
  const related = businesses.filter((b) => b.industry === business.industry && b.id !== business.id).slice(0, 3);
  const initials = business.name.split(" ").slice(0, 2).map((w) => w[0]).join("");
  const ratingBreakdown = [
    { stars: 5, pct: 62 },
    { stars: 4, pct: 24 },
    { stars: 3, pct: 9 },
    { stars: 2, pct: 3 },
    { stars: 1, pct: 2 },
  ];

  return (
    <PublicLayout>
      {/* Cover + identity */}
      <div className="h-28 overflow-hidden sm:h-40 lg:h-52">
        <img
          src={businessImage(business)}
          alt={`${business.name} — ${business.industry} facility`}
          width={1024}
          height={640}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="rifah-container">
        <div className="-mt-10 grid gap-4 sm:-mt-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <img
                  src={businessImage(business)}
                  alt={`${business.name} logo placeholder`}
                  loading="lazy"
                  width={1024}
                  height={640}
                  className="h-16 w-16 shrink-0 rounded-2xl border-4 border-surface object-cover sm:h-20 sm:w-20"
                />
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-bold leading-tight tracking-tight sm:text-2xl lg:text-3xl">
                    {business.name}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">{business.tagline}</p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <VerificationBadge status={business.verification} />
                    <MembershipBadge tier={business.membership} />
                    <Pill>{business.chapter}</Pill>
                  </div>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 sm:grid-cols-4">
                {[
                  { icon: Building2, label: "Industry", value: business.industry },
                  { icon: MapPin, label: "Location", value: `${business.city}, ${business.state}` },
                  { icon: Users, label: "Team size", value: business.employees },
                  { icon: Star, label: "Rating", value: `${business.rating.toFixed(1)} (${business.reviews})` },
                ].map((s) => (
                  <div key={s.label} className="min-w-0">
                    <dt className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      <s.icon className="h-3.5 w-3.5" /> {s.label}
                    </dt>
                    <dd className="mt-0.5 truncate text-sm font-semibold">{s.value}</dd>
                  </div>
                ))}
              </dl>

              {/* Primary action is unmistakably dominant */}
              <div className="mt-5 grid gap-2 sm:flex sm:items-center">
                <Button asChild size="lg" className="sm:min-w-52">
                  <Link href={`/enquiry/new?business=custom`}>
                    <Send className="h-4 w-4" /> Send enquiry
                  </Link>
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="lg" className="flex-1 sm:flex-none">
                    <Phone className="h-4 w-4" /> Contact
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setSaved((s) => !s)}
                    aria-pressed={saved}
                    className="flex-1 sm:flex-none"
                  >
                    <Bookmark className={cn("h-4 w-4", saved && "fill-primary text-primary")} />
                    {saved ? "Saved" : "Save"}
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Share business profile">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Profile sections */}
            <Tabs defaultValue="about" className="mt-4">
              <TabsList className="w-full justify-start overflow-x-auto no-scrollbar">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                <TabsTrigger value="info">Business info</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-4 space-y-4">
                <Panel title="About the business">
                  <p className="text-sm leading-relaxed text-muted-foreground">{business.about}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {business.categories.map((c) => (
                      <Pill key={c} tone="primary">
                        {c}
                      </Pill>
                    ))}
                  </div>
                </Panel>
                {business.certifications.length > 0 && (
                  <Panel title="Certifications">
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {business.certifications.map((c) => (
                        <li key={c} className="flex items-center gap-2 rounded-xl border border-border p-3 text-sm">
                          <Award className="h-4 w-4 shrink-0 text-primary" /> {c}
                        </li>
                      ))}
                    </ul>
                  </Panel>
                )}
              </TabsContent>

              <TabsContent value="products" className="mt-4">
                <Panel title="Products" description={`${business.products.length} published`}>
                  {business.products.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      This business has not published products yet. Its offering is service-based.
                    </p>
                  ) : (
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {business.products.map((p) => (
                        <li key={p} className="rounded-xl border border-border p-4">
                          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-soft text-primary">
                            <Package className="h-4 w-4" />
                          </span>
                          <p className="mt-2 text-sm font-semibold">{p}</p>
                          <Button asChild size="sm" variant="outline" className="mt-3">
                            <Link href={`/enquiry/new?business=custom`}>
                              Enquire
                            </Link>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>
              </TabsContent>

              <TabsContent value="services" className="mt-4">
                <Panel title="Services" description={`${business.services.length} published`}>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {business.services.map((s) => (
                      <li key={s} className="rounded-xl border border-border p-4">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-primary">
                          <Wrench className="h-4 w-4" />
                        </span>
                        <p className="mt-2 text-sm font-semibold">{s}</p>
                        <Button asChild size="sm" variant="outline" className="mt-3">
                          <Link href={`/enquiry/new?business=custom`}>
                            Enquire
                          </Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </Panel>
              </TabsContent>

              <TabsContent value="gallery" className="mt-4">
                <Panel title="Gallery" description="Facility and product imagery placeholders">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {businessGallery(business).map((src, i) => (
                      <img
                        key={`${src}-${i}`}
                        src={src}
                        alt={`${business.name} gallery image ${i + 1}`}
                        loading="lazy"
                        width={1024}
                        height={640}
                        className="aspect-[4/3] w-full rounded-xl border border-border object-cover"
                      />
                    ))}
                  </div>
                </Panel>
              </TabsContent>

              <TabsContent value="info" className="mt-4 space-y-4">
                <Panel title="Business information">
                  <dl>
                    <FieldRow label="Business type" value={business.businessType} />
                    <FieldRow label="Established" value={business.founded} />
                    <FieldRow label="Industry" value={business.industry} />
                    <FieldRow label="RIFAH chapter" value={business.chapter} />
                    <FieldRow label="Membership" value={<MembershipBadge tier={business.membership} />} />
                    <FieldRow label="Verification" value={<VerificationBadge status={business.verification} />} />
                    <FieldRow
                      label="Business hours"
                      value={
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-muted-foreground" /> {business.hours}
                        </span>
                      }
                    />
                  </dl>
                </Panel>
                <Panel title="Location & contact">
                  <div className="grid h-40 place-items-center rounded-xl border border-dashed border-border bg-muted text-xs text-muted-foreground">
                    Map placeholder — location pin configured by the business
                  </div>
                  <dl className="mt-4">
                    <FieldRow label="Address" value={`${business.address}, ${business.city}, ${business.state}`} />
                    <FieldRow
                      label="Phone"
                      value={
                        <span className="inline-flex items-center gap-1.5">
                          <Phone className="h-4 w-4 text-muted-foreground" /> {business.phone}
                        </span>
                      }
                    />
                    <FieldRow
                      label="Email"
                      value={
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="h-4 w-4 text-muted-foreground" /> {business.email}
                        </span>
                      }
                    />
                    <FieldRow
                      label="Website"
                      value={
                        <span className="inline-flex items-center gap-1.5">
                          <Globe className="h-4 w-4 text-muted-foreground" /> {business.website}
                        </span>
                      }
                    />
                  </dl>
                </Panel>
              </TabsContent>

              <TabsContent value="reviews" className="mt-4 space-y-4">
                <Panel title="Reviews" description="Buyer reviews are moderated by RIFAH before publishing">
                  <div className="grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)]">
                    <div className="text-center sm:text-left">
                      <p className="text-4xl font-bold tracking-tight">{business.rating.toFixed(1)}</p>
                      <div className="mt-1 flex justify-center gap-0.5 sm:justify-start">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4",
                              i < Math.round(business.rating) ? "fill-warning text-warning" : "text-muted",
                            )}
                          />
                        ))}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{business.reviews} reviews</p>
                    </div>
                    <div className="space-y-1.5">
                      {ratingBreakdown.map((r) => (
                        <div key={r.stars} className="flex items-center gap-2 text-xs">
                          <span className="w-8 shrink-0 text-muted-foreground">{r.stars}★</span>
                          <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-warning" style={{ width: `${r.pct}%` }} />
                          </div>
                          <span className="w-8 shrink-0 text-right text-muted-foreground">{r.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Panel>
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <article key={r.id} className="rounded-2xl border border-border bg-surface p-4">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{r.author}</p>
                          <p className="truncate text-xs text-muted-foreground">{r.role}</p>
                        </div>
                        <div className="flex shrink-0 gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn("h-3.5 w-3.5", i < r.rating ? "fill-warning text-warning" : "text-muted")}
                            />
                          ))}
                        </div>
                      </div>
                      <h3 className="mt-2.5 text-sm font-semibold">{r.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{r.date}</p>
                    </article>
                  ))}
                </div>
                <Panel title="Write a review">
                  <div className="space-y-3">
                    <div className="flex gap-1.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          aria-label={`Rate ${i + 1} of 5`}
                          className="grid h-11 w-11 place-items-center rounded-lg border border-border hover:border-warning"
                        >
                          <Star className="h-5 w-5 text-warning" />
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Reviews are submitted for RIFAH moderation and published once approved.
                    </p>
                    <Button variant="outline">Continue to review form</Button>
                  </div>
                </Panel>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sticky side rail on desktop */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Panel title="Membership & trust">
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Membership</span>
                  <MembershipBadge tier={business.membership} />
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Verification</span>
                  <VerificationBadge status={business.verification} compact />
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Chapter</span>
                  <span className="font-medium">{business.chapter}</span>
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Member since</span>
                  <span className="font-medium">{business.founded}</span>
                </li>
              </ul>
            </Panel>
            <Panel title="Response profile">
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Typical response</span>
                  <span className="font-medium">Within 1 working day</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Enquiries handled</span>
                  <span className="font-medium">Placeholder</span>
                </li>
              </ul>
              <Button asChild className="mt-4 w-full">
                <Link href={`/enquiry/new?business=custom`}>
                  Send enquiry
                </Link>
              </Button>
            </Panel>
          </aside>
        </div>

        <section className="py-10">
          <SectionHeader title={`Similar businesses in ${business.industry}`} />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {related.map((b) => (
              <Link
                key={b.id}
                href={`/business/${b.id }`}
                className="rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-primary/40"
              >
                <p className="text-sm font-semibold">{b.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {b.industry} · {b.city}
                </p>
                <div className="mt-2">
                  <VerificationBadge status={b.verification} compact />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Mobile sticky enquiry bar */}
      <div className="fixed inset-x-0 bottom-[56px] z-30 border-t border-border bg-surface/95 p-3 backdrop-blur md:hidden">
        <Button asChild size="lg" className="w-full">
          <Link href={`/enquiry/new?business=custom`}>
            <Send className="h-4 w-4" /> Send enquiry to {business.name.split(" ")[0]}
          </Link>
        </Button>
      </div>
    </PublicLayout>
  );
}


const BusinessProfilePage = BusinessProfile;

export { BusinessProfilePage };
export default BusinessProfilePage;
