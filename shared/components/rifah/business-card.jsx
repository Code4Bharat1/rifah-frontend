import Link from "next/link";
import { ChevronRight, Mail, MapPin, Phone, Star } from "lucide-react";
import { useState } from "react";

import { MembershipBadge, Pill, VerificationBadge } from "@shared/components/rifah/badges";
import { Button } from "@shared/components/ui/button";
import { useAuth } from "@shared/providers/auth-provider";
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
  const phone = business.phone || business.owner?.phone || "";
  const email = business.email || business.owner?.email || "";
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

      {/* Businessman Contact Info */}
      {(phone || email) && (
        <div className="mt-3 flex flex-col gap-1.5 rounded-xl border border-border/60 bg-muted/30 p-2.5 text-xs text-muted-foreground">
          {phone && (
            <a
              href={`tel:${phone}`}
              onClick={(e) => e.stopPropagation()}
              className="group/link inline-flex items-center gap-2 truncate transition-colors hover:text-primary"
              title={`Call: ${phone}`}
            >
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                <Phone className="h-3 w-3" />
              </span>
              <span className="truncate font-medium text-foreground/90 group-hover/link:text-primary">{phone}</span>
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              onClick={(e) => e.stopPropagation()}
              className="group/link inline-flex items-center gap-2 truncate transition-colors hover:text-primary"
              title={`Email: ${email}`}
            >
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                <Mail className="h-3 w-3" />
              </span>
              <span className="truncate font-medium text-foreground/90 group-hover/link:text-primary">{email}</span>
            </a>
          )}
        </div>
      )}

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
  const phone = business.phone || business.owner?.phone || "";
  const email = business.email || business.owner?.email || "";
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

        {/* Businessman Contact Info */}
        {(phone || email) && (
          <div className="mt-2.5 flex flex-col gap-1.5 rounded-xl border border-border/60 bg-muted/30 p-2.5 text-xs text-muted-foreground">
            {phone && (
              <a
                href={`tel:${phone}`}
                onClick={(e) => e.stopPropagation()}
                className="group/link inline-flex items-center gap-2 truncate transition-colors hover:text-primary"
                title={`Call: ${phone}`}
              >
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                  <Phone className="h-3 w-3" />
                </span>
                <span className="truncate font-medium text-foreground/90 group-hover/link:text-primary">{phone}</span>
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                onClick={(e) => e.stopPropagation()}
                className="group/link inline-flex items-center gap-2 truncate transition-colors hover:text-primary"
                title={`Email: ${email}`}
              >
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                  <Mail className="h-3 w-3" />
                </span>
                <span className="truncate font-medium text-foreground/90 group-hover/link:text-primary">{email}</span>
              </a>
            )}
          </div>
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
  const phone = business.phone || business.owner?.phone || "";
  const email = business.email || business.owner?.email || "";

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
        {(phone || email) && (
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
            {phone && (
              <a
                href={`tel:${phone}`}
                className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                title={`Call: ${phone}`}
              >
                <Phone className="h-3 w-3 text-primary/70" />
                <span>{phone}</span>
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                title={`Email: ${email}`}
              >
                <Mail className="h-3 w-3 text-primary/70" />
                <span className="truncate max-w-[160px]">{email}</span>
              </a>
            )}
          </div>
        )}
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <VerificationBadge status={business.verification} compact />
        </div>
      </div>
    </div>
  );
}
