import Link from "next/link";
import { Bookmark, ChevronRight, MapPin, Star } from "lucide-react";
import { useState } from "react";

import { MembershipBadge, Pill, VerificationBadge } from "@shared/components/rifah/badges";
import { Button } from "@shared/components/ui/button";
import { businessImage, businessLogo, resolveMediaUrl } from "@shared/lib/media";

import { cn } from "@shared/lib/utils";

function Monogram({ business, className }) {
  const logo = business?.logo ? resolveMediaUrl(business.logo) : "";
  const initial = (business?.name || "B").charAt(0).toUpperCase();

  if (logo) {
    return (
      <div className={cn("relative shrink-0 overflow-hidden rounded-2xl border-2 border-surface bg-surface shadow-md ring-1 ring-border/50", className)}>
        <img
          src={logo}
          alt={`${business?.name || "Business"}`}
          loading="lazy"
          width={64}
          height={64}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-2xl border-2 border-surface bg-gradient-to-br from-primary via-primary/90 to-navy text-primary-foreground font-bold shadow-md ring-1 ring-border/50 select-none",
        className
      )}
    >
      <span>{initial}</span>
    </div>
  );
}

/** Standard directory card — used in grids on tablet and desktop. */
export function BusinessCard({ business }) {
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
    <article className="group relative flex h-full flex-col rounded-2xl border border-border bg-surface p-4.5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 sm:p-5">
      <div className="flex items-start gap-3.5">
        <Monogram business={business} className="h-13 w-13 text-base" />
        <div className="min-w-0 flex-1">
          <Link
            href={`/business/${bizId}`}
            className="block truncate text-[15px] font-bold text-foreground transition-colors hover:text-primary"
            title={business.name}
          >
            {business.name}
          </Link>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{locationText}</p>
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
        <VerificationBadge status={business.verification} compact />
        <MembershipBadge tier={business.membership} />
      </div>

      {business.tagline ? (
        <p className="mt-3 line-clamp-2 min-h-[38px] text-xs leading-relaxed text-muted-foreground">{business.tagline}</p>
      ) : (
        <div className="min-h-[12px]" />
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {(business.city || business.state) && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-primary/70" />
            {[business.city, business.state].filter(Boolean).join(", ")}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-warning text-warning" />
          <span className="font-medium text-foreground">{rating}</span> ({reviewsCount})
        </span>
      </div>

      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.slice(0, 2).map((t, idx) => (
            <Pill key={typeof t === "string" ? t : (t?.name || idx)} className="bg-muted/60 text-[10px]">
              {typeof t === "string" ? t : (t?.name || "Product")}
            </Pill>
          ))}
        </div>
      )}

      <div className="mt-auto pt-4">
        <Button asChild size="sm" className="w-full font-semibold shadow-xs transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
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

  const coverUrl = business?.coverImage ? resolveMediaUrl(business.coverImage) : "";
  const locationText = [business.industry, business.city].filter(Boolean).join(" · ") || business.category || "Verified Business";

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
      {/* Cover Header Banner */}
      <div className="relative h-24 overflow-hidden sm:h-26 bg-gradient-to-br from-navy via-slate-900 to-primary/80">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={`${business.name} cover`}
            loading="lazy"
            width={600}
            height={240}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="relative h-full w-full overflow-hidden">
            {/* Elegant Abstract Mesh Overlay */}
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/20 blur-xl transition-transform duration-500 group-hover:scale-125" />
            <div className="absolute -left-6 -bottom-6 h-24 w-24 rounded-full bg-brand/20 blur-lg" />
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:12px_12px]" />
          </div>
        )}

        {/* Top Floating Badge */}
        <div className="absolute right-2.5 top-2.5 z-10 drop-shadow-sm">
          <MembershipBadge tier={business.membership} />
        </div>
      </div>

      {/* Card Content */}
      <div className="relative flex flex-1 flex-col px-4.5 pb-4.5 pt-0">
        {/* Floating Avatar Logo */}
        <div className="relative z-20 -mt-7 mb-2 flex items-center justify-between">
          <Monogram business={business} className="h-14 w-14 text-lg" />
        </div>

        {/* Business Title */}
        <div className="min-w-0">
          <Link
            href={`/business/${bizId}`}
            className="block truncate text-[15px] font-bold tracking-tight text-foreground transition-colors hover:text-primary"
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
          <div className="min-h-[14px]" />
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((t, idx) => (
              <Pill key={typeof t === "string" ? t : (t?.name || idx)} className="bg-muted/70 text-[10px] text-muted-foreground font-medium">
                {typeof t === "string" ? t : (t?.name || "Product")}
              </Pill>
            ))}
          </div>
        )}

        {/* Action Button */}
        <div className="mt-auto pt-4">
          <Button asChild size="sm" className="w-full font-semibold shadow-xs transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
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
