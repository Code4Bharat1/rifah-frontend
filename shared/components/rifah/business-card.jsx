import Link from "next/link";
import { ChevronRight, Mail, MapPin, Phone, Star, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { MembershipBadge, Pill, VerificationBadge } from "@shared/components/rifah/badges";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Textarea } from "@shared/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@shared/components/ui/dialog";
import { useAuth } from "@shared/providers/auth-provider";
import { reviewApi } from "@shared/lib/api-services";
import { businessImage, businessLogo, resolveMediaUrl } from "@shared/lib/media";
import { cn } from "@shared/lib/utils";

function Monogram({ business, className }) {
  const [imgError, setImgError] = useState(false);
  const logo = business?.logo ? resolveMediaUrl(business.logo) : "";
  const initial = (business?.name || "B").charAt(0).toUpperCase();

  if (logo && !imgError) {
    return (
      <div className={cn("relative shrink-0 overflow-hidden rounded-xl border border-border bg-surface shadow-xs", className)}>
        <img
          src={logo}
          alt={`${business?.name || "Business"}`}
          loading="lazy"
          width={64}
          height={64}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-800 font-bold shadow-xs select-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100",
        className
      )}
    >
      <span>{initial}</span>
    </div>
  );
}

/** Standard directory card — used in grids on tablet and desktop. */
export function BusinessCard({
  business,
  allowUnsave = false,
  onToggleSave,
}) {
  const { user } = useAuth();
  const bizId = business.slug || business._id || business.id || "";

  const [currentRating, setCurrentRating] = useState(Number(business.rating) || 0);
  const [currentReviewsCount, setCurrentReviewsCount] = useState(business.reviewsCount ?? business.reviews ?? 0);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  useEffect(() => {
    setCurrentRating(Number(business.rating) || 0);
    setCurrentReviewsCount(business.reviewsCount ?? business.reviews ?? 0);
  }, [business.rating, business.reviewsCount, business.reviews]);

  const handleReviewSuccess = (newRatingVal) => {
    const newCount = currentReviewsCount + 1;
    const newAvg = (currentRating * currentReviewsCount + newRatingVal) / newCount;
    setCurrentRating(Number(newAvg.toFixed(1)));
    setCurrentReviewsCount(newCount);
  };

  const tags = [
    ...(business.products || business.productsSummary || []),
    ...(business.services || business.servicesSummary || []),
    ...(business.categories || []),
  ];

  const locationText = [business.industry, business.city].filter(Boolean).join(" · ") || business.category || "Verified Business";

  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-border bg-surface p-4.5 transition-all duration-200 hover:border-primary/40 hover:shadow-md sm:p-5">
      <div className="flex items-start gap-3.5">
        <Monogram business={business} className="h-12 w-12 text-sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/business/${bizId}`}
              className="block truncate text-[15px] font-bold text-foreground transition-colors hover:text-primary min-w-0"
              title={business.name}
            >
              {business.name}
            </Link>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{locationText}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <VerificationBadge status={business.verification} compact />
        <MembershipBadge tier={business.membership} />
      </div>

      {business.tagline ? (
        <p className="mt-3 line-clamp-2 min-h-[36px] text-xs leading-relaxed text-muted-foreground">{business.tagline}</p>
      ) : (
        <div className="min-h-[12px]" />
      )}

      {/* Location & Interactive Star Rating */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {(business.city || business.state) && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            {[business.city, business.state].filter(Boolean).join(", ")}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-foreground">{currentRating.toFixed(1)}</span> ({currentReviewsCount})
        </span>
      </div>

      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.slice(0, 2).map((t, idx) => (
            <Pill key={`${typeof t === "string" ? t : (t?.name || "tag")}-${idx}`} className="bg-muted text-[10px] text-muted-foreground font-normal">
              {typeof t === "string" ? t : (t?.name || "Product")}
            </Pill>
          ))}
        </div>
      )}

      {/* Buttons: View Profile and Write Review */}
      <div className="mt-auto pt-4 space-y-2">
        <Button asChild size="sm" className="w-full font-semibold">
          <Link href={`/business/${bizId}`}>
            View Profile
          </Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsReviewOpen(true)}
          className="w-full gap-1.5 font-semibold text-xs border-amber-300/80 bg-amber-50/60 hover:bg-amber-100/90 text-amber-900 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-800/80 cursor-pointer transition-all shadow-2xs"
        >
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
          <span>Write Review</span>
        </Button>
      </div>

      {/* Review Dialog */}
      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        business={business}
        onReviewSuccess={handleReviewSuccess}
      />
    </article>
  );
}

/** Premium card — larger visual area, cover band, used for featured placements. */
export function PremiumBusinessCard({ business }) {
  const bizId = business.slug || business._id || business.id || "";
  const [currentRating, setCurrentRating] = useState(Number(business.rating) || 0);
  const [currentReviewsCount, setCurrentReviewsCount] = useState(business.reviewsCount ?? business.reviews ?? 0);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  useEffect(() => {
    setCurrentRating(Number(business.rating) || 0);
    setCurrentReviewsCount(business.reviewsCount ?? business.reviews ?? 0);
  }, [business.rating, business.reviewsCount, business.reviews]);

  const handleReviewSuccess = (newRatingVal) => {
    const newCount = currentReviewsCount + 1;
    const newAvg = (currentRating * currentReviewsCount + newRatingVal) / newCount;
    setCurrentRating(Number(newAvg.toFixed(1)));
    setCurrentReviewsCount(newCount);
  };

  const tags = [
    ...(business.products || business.productsSummary || []),
    ...(business.services || business.servicesSummary || []),
    ...(business.categories || []),
  ];

  const [coverErr, setCoverErr] = useState(false);
  const coverUrl = business?.coverImage && !coverErr ? resolveMediaUrl(business.coverImage) : "";
  const locationText = [business.industry, business.city].filter(Boolean).join(" · ") || business.category || "Verified Business";

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xs transition-all duration-200 hover:border-primary/40 hover:shadow-md">
      {/* Official Chamber Navy Cover Header */}
      <div className="relative h-20 overflow-hidden sm:h-24 bg-navy">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt=""
            loading="lazy"
            onError={() => setCoverErr(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-navy via-navy-light to-navy/80" />
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="-mt-9 mb-2 flex items-end justify-between">
          <Monogram business={business} className="h-14 w-14 border-2 border-surface bg-surface text-base shadow-sm" />
        </div>

        <div className="min-w-0">
          <Link
            href={`/business/${bizId}`}
            className="block truncate text-base font-bold text-foreground transition-colors hover:text-primary"
            title={business.name}
          >
            {business.name}
          </Link>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{locationText}</p>
        </div>

        {/* Verification Pill */}
        <div className="mt-2 flex items-center gap-1.5">
          <VerificationBadge status={business.verification} compact />
        </div>

        {/* Tagline / Summary with consistent min-height */}
        {business.tagline ? (
          <p className="mt-2.5 line-clamp-2 min-h-[34px] text-xs leading-relaxed text-muted-foreground">{business.tagline}</p>
        ) : (
          <div className="min-h-[12px]" />
        )}

        {/* Rating Display */}
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-foreground">{currentRating.toFixed(1)}</span> ({currentReviewsCount})
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((t, idx) => (
              <Pill key={`${typeof t === "string" ? t : (t?.name || "tag")}-${idx}`} className="bg-muted text-[10px] text-muted-foreground font-normal">
                {typeof t === "string" ? t : (t?.name || "Product")}
              </Pill>
            ))}
          </div>
        )}

        {/* Action Buttons: View Profile + Write Review */}
        <div className="mt-auto pt-4 space-y-2">
          <Button asChild size="sm" className="w-full font-semibold">
            <Link href={`/business/${bizId}`}>
              View Profile
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsReviewOpen(true)}
            className="w-full gap-1.5 font-semibold text-xs border-amber-300/80 bg-amber-50/60 hover:bg-amber-100/90 text-amber-900 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-800/80 cursor-pointer transition-all shadow-2xs"
          >
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
            <span>Write Review</span>
          </Button>
        </div>

        <ReviewModal
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          business={business}
          onReviewSuccess={handleReviewSuccess}
        />
      </div>
    </article>
  );
}

/** Compact row — the default on mobile lists. */
export function CompactBusinessCard({
  business,
  saved = false,
  onToggleSave,
}) {
  const bizId = business.slug || business._id || business.id || "";

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
      <Monogram business={business} className="h-11 w-11 text-xs" />
      <div className="min-w-0 flex-1">
        <Link
          href={`/business/${bizId}`}
          className="block truncate text-sm font-semibold text-foreground hover:text-primary transition-colors"
        >
          {business.name}
        </Link>
        <p className="truncate text-xs text-muted-foreground">
          {business.industry} · {business.city}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <VerificationBadge status={business.verification} compact />
        </div>
      </div>
    </div>
  );
}
