import Link from "next/link";
import { Bookmark, ChevronRight, MapPin, Send, Star } from "lucide-react";

import { MembershipBadge, Pill, VerificationBadge } from "@shared/components/rifah/badges";
import { Button } from "@shared/components/ui/button";
import { businessImage } from "@shared/lib/media";

import { cn } from "@shared/lib/utils";

function Monogram({ business, className }) {
  return (
    <img
      src={businessImage(business)}
      alt={`${business.name} — ${business.industry}`}
      loading="lazy"
      width={1024}
      height={640}
      className={cn("shrink-0 rounded-xl border border-border object-cover", className)}
    />
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

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-primary/40 sm:p-5">
      <div className="flex items-start gap-3">
        <Monogram business={business} className="h-12 w-12 text-sm" />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <Link
              href={`/business/${bizId}`}
              className="min-w-0 text-[15px] font-semibold leading-snug hover:text-primary"
            >
              {business.name}
            </Link>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{business.industry}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <VerificationBadge status={business.verification} compact />
        <MembershipBadge tier={business.membership} />
      </div>

      {business.tagline && (
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{business.tagline}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {(business.city || business.state) && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {[business.city, business.state].filter(Boolean).join(", ")}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Star className="h-3.5 w-3.5 text-warning" />
          {rating} ({reviewsCount})
        </span>
      </div>

      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.slice(0, 2).map((t, idx) => (
            <Pill key={typeof t === "string" ? t : (t?.name || idx)}>
              {typeof t === "string" ? t : (t?.name || "Product")}
            </Pill>
          ))}
        </div>
      )}

      <div className="mt-auto flex gap-2 pt-4">
        <Button asChild size="sm" className="flex-1">
          <Link href={`/enquiry/new?business=${encodeURIComponent(bizId)}`}>
            <Send className="h-4 w-4" /> Send enquiry
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href={`/business/${bizId}`}>
            View
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

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="relative h-24 overflow-hidden sm:h-28">
        <img
          src={businessImage(business)}
          alt={`${business.name} facility`}
          loading="lazy"
          width={1024}
          height={640}
          className="h-full w-full object-cover"
        />
        <div className="absolute right-3 top-3">
          <MembershipBadge tier={business.membership} />
        </div>
      </div>
      <div className="-mt-7 flex flex-1 flex-col px-4 pb-4 sm:px-5 sm:pb-5">
        <Monogram business={business} className="h-14 w-14 border-4 border-surface text-base" />
        <div className="mt-2.5 flex min-w-0 items-center gap-2">
          <Link
            href={`/business/${bizId}`}
            className="truncate text-base font-semibold hover:text-primary"
          >
            {business.name}
          </Link>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {business.industry} · {business.city}
        </p>
        <div className="mt-2.5">
          <VerificationBadge status={business.verification} compact />
        </div>
        {business.tagline && (
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{business.tagline}</p>
        )}
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((t, idx) => (
              <Pill key={typeof t === "string" ? t : (t?.name || idx)}>
                {typeof t === "string" ? t : (t?.name || "Product")}
              </Pill>
            ))}
          </div>
        )}
        <div className="mt-auto flex gap-2 pt-4">
          <Button asChild size="sm" className="flex-1">
            <Link href={`/enquiry/new?business=${encodeURIComponent(bizId)}`}>
              Send enquiry
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/business/${bizId}`}>
              Profile
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
