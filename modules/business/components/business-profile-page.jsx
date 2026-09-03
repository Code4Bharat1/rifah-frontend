"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Award,
  Bookmark,
  Building2,
  Clock,
  Globe,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Send,
  Share2,
  Star,
  Users,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@shared/providers/auth-provider";

import { MembershipBadge, Pill, VerificationBadge } from "@shared/components/rifah/badges";
import { PublicLayout } from "@shared/components/rifah/public-layout";
import { FieldRow, Panel, SectionHeader } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/components/ui/tabs";
import { SkeletonCard } from "@shared/components/rifah/empty-state";
import { businessGallery, businessImage } from "@shared/lib/media";
import { resolveMediaUrl } from "@shared/lib/api-client";
import {
  useBusinessDetail,
  useBusinessCatalogue,
  useBusinessReviews,
  useBusinesses,
} from "@shared/hooks/use-rifah-api";
import { reviewApi, userApi } from "@shared/lib/api-services";
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

  const { data: business, isLoading } = useBusinessDetail(businessId);
  const { data: catalogueItems } = useBusinessCatalogue(business?._id);
  const { data: reviewsData } = useBusinessReviews(business?._id);
  const { data: relatedData } = useBusinesses({
    industry: business?.industry,
    limit: 3,
  });

  const { user } = useAuth();
  const ownerId = business?.owner?._id || business?.owner;
  const isMyOwnBusiness = Boolean(user?._id && ownerId && String(user._id) === String(ownerId));
  const messageUrl = ownerId
    ? (user?.role === "business"
        ? `/biz/messages?userId=${ownerId}&name=${encodeURIComponent(business?.name || "")}`
        : `/me/messages?userId=${ownerId}&name=${encodeURIComponent(business?.name || "")}`)
    : "/me/messages";

  const [saved, setSaved] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewBody, setReviewBody] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="rifah-container py-12">
          <SkeletonCard />
        </div>
      </PublicLayout>
    );
  }

  if (!business) return <BusinessNotFound />;

  const products = (catalogueItems || []).filter((i) => i.type === "Product");
  const services = (catalogueItems || []).filter((i) => i.type === "Service");
  const reviews = reviewsData?.reviews || [];
  const related = (relatedData?.businesses || []).filter((b) => b._id !== business._id);

  const ratingBreakdown = [
    { stars: 5, pct: 70 },
    { stars: 4, pct: 20 },
    { stars: 3, pct: 7 },
    { stars: 2, pct: 2 },
    { stars: 1, pct: 1 },
  ];

  const handleToggleSave = async () => {
    try {
      setSaved((s) => !s);
      await userApi.toggleSaveBusiness(business._id);
    } catch (err) {
      console.error("Save business error:", err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewBody.trim()) return;
    setReviewSubmitting(true);
    try {
      await reviewApi.submit({
        businessId: business._id,
        rating: reviewRating,
        title: reviewTitle,
        body: reviewBody,
      });
      setReviewSuccess(true);
      setReviewBody("");
      setReviewTitle("");
    } catch (err) {
      alert(err.message || "Failed to submit review. Please ensure you are logged in.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const isValidImage = (url) => typeof url === "string" && (url.startsWith("/uploads/") || url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("/images/"));

  const coverUrl = isValidImage(business.coverImage) ? resolveMediaUrl(business.coverImage) : resolveMediaUrl(businessImage(business));
  const logoUrl = isValidImage(business.logo) ? resolveMediaUrl(business.logo) : resolveMediaUrl(businessImage(business));

  return (
    <PublicLayout>
      {/* Cover + identity */}
      <div className="h-28 overflow-hidden sm:h-40 lg:h-52">
        <img
          src={coverUrl}
          alt={`${business.name} facility`}
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
                  src={logoUrl}
                  alt={`${business.name} logo`}
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
                  { icon: Users, label: "Team size", value: business.employees || "10–50" },
                  { icon: Star, label: "Rating", value: `${(business.rating || 5.0).toFixed(1)} (${business.reviewsCount || reviews.length})` },
                ].map((s) => (
                  <div key={s.label} className="min-w-0">
                    <dt className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      <s.icon className="h-3.5 w-3.5" /> {s.label}
                    </dt>
                    <dd className="mt-0.5 truncate text-sm font-semibold">{s.value}</dd>
                  </div>
                ))}
              </dl>

              {/* Primary action */}
              <div className="mt-5 grid gap-2 sm:flex sm:items-center">
                <Button asChild size="lg" className="sm:min-w-48">
                  <Link href={`/enquiry/new?business=${business._id || business.slug}`}>
                    <Send className="h-4 w-4" /> Send enquiry
                  </Link>
                </Button>
                {!isMyOwnBusiness && (
                  <Button asChild size="lg" variant="secondary" className="gap-2">
                    <Link href={messageUrl}>
                      <MessageSquare className="h-4 w-4" /> Message
                    </Link>
                  </Button>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleToggleSave}
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
                <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
                <TabsTrigger value="services">Services ({services.length})</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                <TabsTrigger value="info">Business info</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-4 space-y-4">
                <Panel title="About the business">
                  <p className="text-sm leading-relaxed text-muted-foreground">{business.about}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {business.categories?.map((c) => (
                      <Pill key={c} tone="primary">
                        {c}
                      </Pill>
                    ))}
                  </div>
                </Panel>
                {business.certifications?.length > 0 && (
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
                <Panel title="Products" description={`${products.length} published`}>
                  {products.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      This business has not published standalone products yet.
                    </p>
                  ) : (
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {products.map((p) => (
                        <li key={p._id || p.slug} className="rounded-xl border border-border p-4 overflow-hidden">
                          {p.images && p.images.length > 0 ? (
                            <div className="relative mb-3 h-32 w-full overflow-hidden rounded-lg bg-muted border border-border">
                              <img
                                src={resolveMediaUrl(p.images[0])}
                                alt={p.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-soft text-primary">
                              <Package className="h-4 w-4" />
                            </span>
                          )}
                          <p className="mt-2 text-sm font-semibold">{p.name}</p>
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
                          <p className="mt-2 text-xs font-medium text-foreground">{p.price || "On Request"}</p>
                          <Button asChild size="sm" variant="outline" className="mt-3">
                            <Link href={`/enquiry/new?category=${encodeURIComponent(p.category)}`}>
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
                <Panel title="Services" description={`${services.length} published`}>
                  {services.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No standalone services listed.
                    </p>
                  ) : (
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {services.map((s) => (
                        <li key={s._id || s.slug} className="rounded-xl border border-border p-4 overflow-hidden">
                          {s.images && s.images.length > 0 ? (
                            <div className="relative mb-3 h-32 w-full overflow-hidden rounded-lg bg-muted border border-border">
                              <img
                                src={resolveMediaUrl(s.images[0])}
                                alt={s.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-primary">
                              <Wrench className="h-4 w-4" />
                            </span>
                          )}
                          <p className="mt-2 text-sm font-semibold">{s.name}</p>
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{s.description}</p>
                          <Button asChild size="sm" variant="outline" className="mt-3">
                            <Link href={`/enquiry/new?category=${encodeURIComponent(s.category)}`}>
                              Enquire
                            </Link>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>
              </TabsContent>

              <TabsContent value="gallery" className="mt-4">
                <Panel title="Gallery" description="Facility and product imagery">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {(business.gallery && business.gallery.length > 0
                      ? business.gallery.map((g) => resolveMediaUrl(g))
                      : businessGallery(business)
                    ).map((src, i) => (
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
                  <dl className="mt-2">
                    <FieldRow label="Address" value={`${business.address || ""}, ${business.city}, ${business.state}`} />
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
                      <p className="text-4xl font-bold tracking-tight">{(business.rating || 5.0).toFixed(1)}</p>
                      <div className="mt-1 flex justify-center gap-0.5 sm:justify-start">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4",
                              i < Math.round(business.rating || 5) ? "fill-warning text-warning" : "text-muted"
                            )}
                          />
                        ))}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{business.reviewsCount || reviews.length} reviews</p>
                    </div>
                    <div className="space-y-1.5">
                      {ratingBreakdown.map((r) => (
                        <div key={r.stars} className="flex items-center gap-2 text-xs">
                          <span className="w-8 shrink-0 text-muted-foreground">{r.stars}★</span>
                          <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-warning" style={{ width: `${r.pct}%` }} />
                          </div>
                          <span className="w-8 shrink-0 text-muted-foreground">{r.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Panel>

                <div className="space-y-3">
                  {reviews.map((r) => (
                    <article key={r._id || r.id} className="rounded-2xl border border-border bg-surface p-4">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{r.authorName || r.author?.name || "Verified Buyer"}</p>
                          <p className="truncate text-xs text-muted-foreground">{r.authorRole || "Member Buyer"}</p>
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
                      {r.title && <h3 className="mt-2.5 text-sm font-semibold">{r.title}</h3>}
                      <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
                    </article>
                  ))}
                </div>

                <Panel title="Write a review">
                  {reviewSuccess ? (
                    <p className="text-sm font-semibold text-success">
                      Thank you! Your review has been submitted and is pending secretariat moderation.
                    </p>
                  ) : (
                    <form onSubmit={handleReviewSubmit} className="space-y-3">
                      <div>
                        <label className="text-xs font-medium">Select Rating</label>
                        <div className="mt-1 flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setReviewRating(num)}
                              aria-label={`Rate ${num} of 5`}
                              className={cn(
                                "grid h-10 w-10 place-items-center rounded-lg border",
                                reviewRating >= num ? "border-warning bg-warning/10" : "border-border"
                              )}
                            >
                              <Star className={cn("h-5 w-5", reviewRating >= num ? "fill-warning text-warning" : "text-muted-foreground")} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <input
                          type="text"
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          placeholder="Review title (e.g. Excellent quality & fast turnaround)"
                          className="w-full rounded-lg border border-border bg-transparent p-2 text-sm"
                        />
                      </div>
                      <div>
                        <textarea
                          value={reviewBody}
                          onChange={(e) => setReviewBody(e.target.value)}
                          required
                          rows={3}
                          placeholder="Write your review here..."
                          className="w-full rounded-lg border border-border bg-transparent p-2 text-sm"
                        />
                      </div>
                      <Button type="submit" disabled={reviewSubmitting}>
                        {reviewSubmitting ? "Submitting..." : "Submit review"}
                      </Button>
                    </form>
                  )}
                </Panel>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sticky side rail */}
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
                  <span className="font-medium">{business.founded || "2020"}</span>
                </li>
              </ul>
            </Panel>
            <Panel title="Response profile">
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Typical response</span>
                  <span className="font-medium">Within 1 working day</span>
                </li>
              </ul>
              <Button asChild className="mt-4 w-full">
                <Link href={`/enquiry/new?business=${business._id || business.slug}`}>
                  Send enquiry
                </Link>
              </Button>
              {!isMyOwnBusiness && (
                <Button asChild variant="outline" className="mt-2 w-full gap-2">
                  <Link href={messageUrl}>
                    <MessageSquare className="h-4 w-4" /> Message directly
                  </Link>
                </Button>
              )}
            </Panel>
          </aside>
        </div>

        <section className="py-10">
          <SectionHeader title={`Similar businesses in ${business.industry}`} />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {related.map((b) => (
              <Link
                key={b._id || b.slug}
                href={`/business/${b.slug || b._id}`}
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
    </PublicLayout>
  );
}

export { BusinessProfile as BusinessProfilePage };
export default BusinessProfile;
