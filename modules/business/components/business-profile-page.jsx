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
  CheckCircle2,
  Copy,
  Check,
  Smartphone,
} from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@shared/providers/auth-provider";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@shared/components/ui/dialog";

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

  const queryClient = useQueryClient();
  const { user } = useAuth();
  const ownerId = business?.owner?._id || business?.owner;
  const isMyOwnBusiness = Boolean(user?._id && ownerId && String(user._id) === String(ownerId));
  const messageUrl = ownerId
    ? (user?.role === "business"
        ? `/biz/messages?userId=${ownerId}&name=${encodeURIComponent(business?.name || "")}`
        : `/me/messages?userId=${ownerId}&name=${encodeURIComponent(business?.name || "")}`)
    : "/me/messages";

  const [saved, setSaved] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewBody, setReviewBody] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.href;
    }
    return "";
  };

  const handleCopyLink = async () => {
    try {
      const url = getShareUrl();
      if (!url) return;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Profile link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Copy failed:", err);
      toast.error("Failed to copy link");
    }
  };

  const handleNativeShare = async () => {
    const url = getShareUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${business?.name || "Business"} | RIFAH Chamber of Commerce`,
          text: `Check out ${business?.name || "this business"} on RIFAH Chamber of Commerce:`,
          url,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Native share error:", err);
        }
      }
    }
  };

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
  
  const rawReviews = reviewsData?.reviews || reviewsData?.data?.reviews || reviewsData?.data || reviewsData || [];
  const reviews = Array.isArray(rawReviews) ? rawReviews : [];
  const totalReviews = reviews.length;

  const avgRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / totalReviews).toFixed(1)
    : (business.rating || 5.0).toFixed(1);

  const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => Math.round(r.rating || 5) === stars).length;
    const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : (stars === 5 ? 100 : 0);
    return { stars, pct, count };
  });

  const related = (relatedData?.businesses || []).filter((b) => b._id !== business._id);

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
    if (!user) {
      alert("Please log in to submit a review.");
      window.location.href = `/login?redirect=/business/${business.slug || business._id}`;
      return;
    }
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
      queryClient.invalidateQueries({ queryKey: ["reviews", business._id] });
      queryClient.invalidateQueries({ queryKey: ["business", businessId] });
      queryClient.invalidateQueries({ queryKey: ["business", business.slug] });
      setTimeout(() => setReviewSuccess(false), 5000);
    } catch (err) {
      alert(err.message || "Failed to submit review.");
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
                  { icon: Star, label: "Rating", value: `${avgRating} (${totalReviews})` },
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShareOpen(true)}
                    aria-label="Share business profile"
                    title="Share business profile"
                  >
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
                <Panel title="Reviews & Ratings" description="Verified chamber member experiences and buyer feedback">
                  <div className="grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)]">
                    <div className="text-center sm:text-left">
                      <p className="text-4xl font-bold tracking-tight text-foreground">{avgRating}</p>
                      <div className="mt-1 flex justify-center gap-0.5 sm:justify-start">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4",
                              i < Math.round(Number(avgRating)) ? "fill-warning text-warning" : "text-muted"
                            )}
                          />
                        ))}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      {ratingBreakdown.map((r) => (
                        <div key={r.stars} className="flex items-center gap-2 text-xs">
                          <span className="w-8 shrink-0 text-muted-foreground">{r.stars}★</span>
                          <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-warning transition-all" style={{ width: `${r.pct}%` }} />
                          </div>
                          <span className="w-8 shrink-0 text-muted-foreground text-right">{r.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Panel>

                {reviews.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <h3 className="mt-3 text-sm font-semibold text-foreground">No reviews yet</h3>
                    <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                      Be the first to share your experience with {business.name}. Your verified review will appear right here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((r) => (
                      <article key={r._id || r.id} className="rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-xs transition-colors hover:border-primary/20">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary font-bold text-sm uppercase shadow-xs">
                              {(r.authorName || r.author?.name || "M")[0]}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="truncate text-sm font-semibold text-foreground">
                                  {r.authorName || r.author?.name || "Verified Member"}
                                </p>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {r.authorRole || "Chamber Member"} • {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Recent"}
                              </p>
                            </div>
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
                        {r.title && <h3 className="mt-3 text-sm font-semibold text-foreground">{r.title}</h3>}
                        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{r.body}</p>
                      </article>
                    ))}
                  </div>
                )}

                <Panel title="Write a review" description="Share your feedback with other chamber members">
                  {reviewSuccess ? (
                    <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Thank you! Your review has been published and is now visible on this profile.</span>
                    </div>
                  ) : !user ? (
                    <div className="rounded-xl border border-dashed border-border p-6 text-center">
                      <p className="text-sm font-medium text-foreground">Have you worked with {business.name}?</p>
                      <p className="mt-1 text-xs text-muted-foreground">Please log in to submit a verified member review.</p>
                      <Button asChild size="sm" className="mt-3">
                        <Link href={`/login?redirect=/business/${business.slug || business._id}`}>
                          Log in to Review
                        </Link>
                      </Button>
                    </div>
                  ) : isMyOwnBusiness ? (
                    <div className="rounded-xl bg-muted/40 p-4 border border-border/60 text-xs text-muted-foreground">
                      💡 This is your own business profile. Reviews submitted by other verified chamber members and buyers will appear above.
                    </div>
                  ) : (
                    <form onSubmit={handleReviewSubmit} className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-foreground">Your Rating</label>
                        <div className="mt-1 flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setReviewRating(num)}
                              aria-label={`Rate ${num} of 5`}
                              className={cn(
                                "grid h-10 w-10 place-items-center rounded-lg border transition-all",
                                reviewRating >= num
                                  ? "border-warning bg-warning/10 text-warning"
                                  : "border-border text-muted-foreground hover:border-border/80"
                              )}
                            >
                              <Star className={cn("h-5 w-5", reviewRating >= num ? "fill-warning text-warning" : "")} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground">Review Title (Optional)</label>
                        <input
                          type="text"
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          placeholder="e.g. Excellent service, timely delivery & responsive team"
                          className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground">Review Comments</label>
                        <textarea
                          value={reviewBody}
                          onChange={(e) => setReviewBody(e.target.value)}
                          required
                          rows={3}
                          placeholder="Write your experience with this business..."
                          className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <Button type="submit" disabled={reviewSubmitting}>
                        {reviewSubmitting ? "Publishing review..." : "Submit review"}
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

      {/* Share Business Profile Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-2xl bg-surface border border-border shadow-2xl">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Share2 className="h-4 w-4" />
              </div>
              Share Business Profile
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Share <strong className="text-foreground">{business.name}</strong> with your network, clients, or partners.
            </DialogDescription>
          </DialogHeader>

          {/* Business Preview card */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-muted/40 border border-border mt-1">
            <img
              src={logoUrl}
              alt={business.name}
              className="h-12 w-12 rounded-xl object-cover border border-border shrink-0 shadow-xs"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-sm truncate text-foreground">{business.name}</h4>
              <p className="text-xs text-muted-foreground truncate">
                {business.tagline || business.industry || "RIFAH Member"}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                {business.city && <span>{business.city}, {business.state}</span>}
                {avgRating && (
                  <span className="flex items-center gap-0.5 text-amber-500 font-medium">
                    ★ {avgRating}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Social share options */}
          <div className="mt-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
              Share directly via
            </p>
            <div className="grid grid-cols-4 gap-2.5">
              {/* WhatsApp (Official Logo) */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Check out *${business.name}* on RIFAH Chamber of Commerce:\n${getShareUrl()}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:border-[#25D366]/50 hover:bg-[#25D366]/5 transition group text-center"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#25D366] flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <span className="text-xs font-medium text-foreground">WhatsApp</span>
              </a>

              {/* LinkedIn (Official Logo) */}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrl())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:border-[#0A66C2]/50 hover:bg-[#0A66C2]/5 transition group text-center"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#0A66C2] flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25a1.66 1.66 0 0 0-1.67 1.66c0 .92.75 1.67 1.67 1.67s1.67-.75 1.67-1.67c0-.91-.75-1.66-1.67-1.66Z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-foreground">LinkedIn</span>
              </a>

              {/* X / Twitter (Official Logo) */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `Check out ${business.name} on RIFAH Chamber of Commerce!`
                )}&url=${encodeURIComponent(getShareUrl())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:border-black/50 dark:hover:border-white/50 hover:bg-black/5 dark:hover:bg-white/5 transition group text-center"
              >
                <div className="w-11 h-11 rounded-2xl bg-black dark:bg-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4 text-white dark:text-black fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-foreground">X / Twitter</span>
              </a>

              {/* Gmail / Email (Official 4-Color Logo) */}
              <a
                href={`mailto:?subject=${encodeURIComponent(`${business.name} on RIFAH Chamber of Commerce`)}&body=${encodeURIComponent(
                  `Hello,\n\nI wanted to share this business profile with you:\n\n${business.name}\n${getShareUrl()}`
                )}`}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:border-rose-500/50 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition group text-center"
              >
                <div className="w-11 h-11 rounded-2xl bg-muted/80 border border-border flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M1.5 6.5v11a2 2 0 0 0 2 2h3v-9.5l-5-3.5z" />
                    <path fill="#34A853" d="M22.5 6.5v11a2 2 0 0 1-2 2h-3v-9.5l5-3.5z" />
                    <path fill="#EA4335" d="M17.5 4.5l-5.5 4-5.5-4h-3a2 2 0 0 0-2 2v.5l10.5 7.5 10.5-7.5V6.5a2 2 0 0 0-2-2h-3z" />
                    <path fill="#FBBC05" d="M6.5 10v9.5h11V10l-5.5 4z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-foreground">Email</span>
              </a>
            </div>
          </div>

          {/* Direct Copy link */}
          <div className="mt-3 space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Profile Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={getShareUrl()}
                onFocus={(e) => e.target.select()}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-border bg-muted/30 text-foreground font-mono select-all outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button
                type="button"
                onClick={handleCopyLink}
                className={cn(
                  "gap-1.5 text-xs font-semibold shrink-0 transition-all rounded-xl",
                  copied ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                )}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy Link
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Device Share Option */}
          {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
            <div className="mt-2 pt-3 border-t border-border">
              <Button
                variant="outline"
                className="w-full gap-2 text-xs font-medium rounded-xl"
                onClick={handleNativeShare}
              >
                <Smartphone className="h-3.5 w-3.5" /> Share via phone / other apps
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}

export { BusinessProfile as BusinessProfilePage };
export default BusinessProfile;
