import Link from "next/link";
import { Bookmark, ChevronRight, MapPin, Star } from "lucide-react";
import { useState } from "react";

import { MembershipBadge, Pill, VerificationBadge } from "@shared/components/rifah/badges";
import { Button } from "@shared/components/ui/button";
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
  const bizId = business.slug || business._id || business.id || "";
  const rating = (Number(business.rating) || 0).toFixed(1);
  const reviewsCount = business.reviewsCount ?? business.reviews ?? 0;
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
            {allowUnsave && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onToggleSave) onToggleSave(business);
                }}
                aria-label={`Remove ${business.name} from saved`}
                title="Remove from saved"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all cursor-pointer"
              >
                <Bookmark className="h-4 w-4 fill-current transition-transform active:scale-90" />
              </button>
            )}
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

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {(business.city || business.state) && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            {[business.city, business.state].filter(Boolean).join(", ")}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="font-medium text-foreground">{rating}</span> ({reviewsCount})
        </span>
      </div>

      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.slice(0, 2).map((t, idx) => (
            <Pill key={typeof t === "string" ? t : (t?.name || idx)} className="bg-muted text-[10px] text-muted-foreground font-normal">
              {typeof t === "string" ? t : (t?.name || "Product")}
            </Pill>
          ))}
        </div>
      )}

      <div className="mt-auto pt-4">
        <Button asChild size="sm" className="w-full">
          <Link href={`/business/${bizId}`}>
            View Profile
          </Link>
        </Button>
      </div>
    </article>
  );
}

/** Premium card — larger visual area, cover band, used for featured placements. */
export function PremiumBusinessCard({ business }) {
  const bizId = business.slug || business._id || business.id || "";
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
            alt={`${business.name} cover`}
            loading="lazy"
            width={600}
            height={240}
            onError={() => setCoverErr(true)}
            className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="relative h-full w-full opacity-30">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:12px_12px]" />
          </div>
        )}

        {/* Top Floating Badge */}
        <div className="absolute right-2.5 top-2.5 z-10">
          <MembershipBadge tier={business.membership} />
        </div>
      </div>

      {/* Card Content */}
      <div className="relative flex flex-1 flex-col px-4 pb-4 pt-0">
        {/* Floating Avatar Logo */}
        <div className="relative z-20 -mt-6 mb-2">
          <Monogram business={business} className="h-12 w-12 border-2 border-surface text-base shadow-xs" />
        </div>

        {/* Business Title */}
        <div className="min-w-0">
          <Link
            href={`/business/${bizId}`}
            className="block truncate text-[15px] font-semibold text-foreground transition-colors hover:text-primary"
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

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((t, idx) => (
              <Pill key={typeof t === "string" ? t : (t?.name || idx)} className="bg-muted text-[10px] text-muted-foreground font-normal">
                {typeof t === "string" ? t : (t?.name || "Product")}
              </Pill>
            ))}
          </div>
        )}

        {/* Action Button */}
        <div className="mt-auto pt-4">
          <Button asChild size="sm" className="w-full">
            <Link href={`/business/${bizId}`}>
              View Profile
            </Link>
          </Button>
        </div>
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
      <Link
        href={`/business/${bizId}`}
        className="min-w-0 flex-1"
      >
        <p className="truncate text-sm font-semibold">{business.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {business.industry} · {business.city}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <VerificationBadge status={business.verification} compact />
        </div>
      </Link>
      {onToggleSave ? (
        <button
          type="button"
          onClick={onToggleSave}
          aria-label={saved ? `Remove ${business.name} from saved` : `Save ${business.name}`}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
        >
          <Bookmark className={cn("h-5 w-5", saved && "fill-primary text-primary")} />
        </button>
      ) : (
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
      )}
    </div>
  );
}
