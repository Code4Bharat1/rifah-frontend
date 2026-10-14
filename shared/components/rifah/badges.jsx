import { AlertCircle, BadgeCheck, Clock, Crown, ShieldX, Star } from "lucide-react";



import { cn } from "@shared/lib/utils";

export function Pill({
  children,
  tone = "neutral",
  className,
  icon,
}




) {
  const tones = {
    neutral: "bg-muted text-muted-foreground border-border",
    primary: "bg-primary-soft text-primary border-primary/25",
    brand: "bg-brand-soft text-brand border-brand/25",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
    danger: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
    navy: "bg-navy text-white border-navy",
  };
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

const verificationMap = {
  verified: { label: "Verified", tone: "success", icon: <BadgeCheck className="h-3.5 w-3.5" /> },
  pending: { label: "Verification pending", tone: "warning", icon: <Clock className="h-3.5 w-3.5" /> },
  under_review: { label: "Under Review", tone: "warning", icon: <Clock className="h-3.5 w-3.5" /> },
  correction: { label: "Correction required", tone: "warning", icon: <AlertCircle className="h-3.5 w-3.5" /> },
  correction_requested: { label: "Changes Required", tone: "warning", icon: <AlertCircle className="h-3.5 w-3.5" /> },
  changes_required: { label: "Changes Required", tone: "warning", icon: <AlertCircle className="h-3.5 w-3.5" /> },
  rejected: { label: "Rejected", tone: "danger", icon: <ShieldX className="h-3.5 w-3.5" /> },
  unverified: { label: "Not verified", tone: "neutral", icon: <ShieldX className="h-3.5 w-3.5" /> },
};

export function VerificationBadge({ status, level, compact = false, business = null }) {
  let raw = status || level;
  if (business && isSubscriberTier(business) && !isChamberMember(business)) {
    raw = "unverified";
  }
  const normalizedStatus = typeof raw === "string" ? raw.toLowerCase() : "unverified";
  const v = verificationMap[normalizedStatus] || {
    label: raw || "Not verified",
    tone: "neutral",
    icon: <ShieldX className="h-3.5 w-3.5" />,
  };
  return (
    <Pill tone={v.tone} icon={v.icon}>
      {compact && (normalizedStatus === "verified" || normalizedStatus === "approved") ? "Verified" : v.label}
    </Pill>
  );
}

export function MembershipBadge({ tier }) {
  if (!tier) return <Pill tone="neutral">Free member</Pill>;
  
  const rawStr = tier.toString().trim();
  const cleanTier = rawStr.replace(/\s+member$/i, "").trim().toLowerCase();

  // New tiers — Silver / Gold / Platinum / Diamond
  if (cleanTier === "silver")
    return <Pill tone="neutral" icon={<Star className="h-3.5 w-3.5" />}>Silver member</Pill>;
  if (cleanTier === "gold")
    return (
      <Pill tone="warning" icon={<Star className="h-3.5 w-3.5" />}>
        Gold member
      </Pill>
    );
  if (cleanTier === "platinum")
    return (
      <Pill tone="brand" icon={<Crown className="h-3.5 w-3.5" />}>
        Platinum member
      </Pill>
    );
  if (cleanTier === "diamond")
    return (
      <Pill tone="navy" icon={<Crown className="h-3.5 w-3.5" />}>
        Diamond member
      </Pill>
    );

  // Legacy tiers — backwards compat
  if (cleanTier === "free") return <Pill tone="neutral">Free member</Pill>;
  if (cleanTier === "basic") return <Pill tone="primary">Basic member</Pill>;
  if (cleanTier === "premium")
    return (
      <Pill tone="brand" icon={<Star className="h-3.5 w-3.5" />}>
        Premium member
      </Pill>
    );
  if (cleanTier === "enterprise")
    return (
      <Pill tone="navy" icon={<Crown className="h-3.5 w-3.5" />}>
        Enterprise member
      </Pill>
    );
  
  // Fallback for custom dynamic plans
  const capitalized = rawStr.replace(/\s+member$/i, "").trim();
  return (
    <Pill tone="primary" icon={<Star className="h-3.5 w-3.5" />}>
      {capitalized} member
    </Pill>
  );
}

/**
 * Checks if a business is on a Subscriber Tier (Tier 1 Free, Tier 2 Starter, Tier 3 Growth, Tier 4 Enterprise).
 * Per RIFAH Feature Matrix Row 19: Subscriber tiers NEVER include business verification.
 */
export function isSubscriberTier(business) {
  if (!business) return false;
  const subTier = String(
    business.subscriberTier ||
    business.subscriber_tier ||
    business.subscriptionTier ||
    business.planId ||
    ""
  ).trim().toLowerCase();

  if (
    subTier === "tier_1" || subTier === "tier_2" || subTier === "tier_3" || subTier === "tier_4" ||
    subTier === "tier-1" || subTier === "tier-2" || subTier === "tier-3" || subTier === "tier-4" ||
    subTier === "tier 1" || subTier === "tier 2" || subTier === "tier 3" || subTier === "tier 4" ||
    subTier.startsWith("tier_") || subTier.startsWith("tier-") || subTier.startsWith("tier ") ||
    subTier === "free" || subTier === "starter" || subTier === "growth" || subTier === "enterprise"
  ) {
    return true;
  }

  const raw = String(
    business.membership ||
    business.membershipTier ||
    business.chamberMembership ||
    business.membershipPlan ||
    ""
  ).trim().toLowerCase();

  if (
    raw.includes("tier ") ||
    raw.includes("tier_") ||
    raw.includes("tier-") ||
    raw.includes("tier i") ||
    raw.includes("tier ii") ||
    raw.includes("tier iii") ||
    raw.includes("tier iv") ||
    raw === "free" ||
    raw === "starter" ||
    raw === "growth" ||
    raw === "free member" ||
    raw.includes("(free)") ||
    raw.includes("(starter)") ||
    raw.includes("(growth)") ||
    raw.includes("(enterprise)") ||
    !raw
  ) {
    return true;
  }

  return false;
}

/**
 * Checks if a business has an active Chamber Membership (Silver, Gold, Platinum, Diamond).
 * Note: Subscriber tiers (Tier I, II, III, IV / Enterprise) are NOT chamber memberships.
 */
export function isChamberMember(business) {
  if (!business) return false;
  const raw = String(
    business.membership ||
    business.membershipTier ||
    business.chamberMembership ||
    business.membershipPlan ||
    ""
  ).trim().toLowerCase();

  if (
    !raw ||
    raw === "free" ||
    raw === "unregistered" ||
    raw.includes("tier ") ||
    raw.includes("tier_") ||
    raw.includes("tier-") ||
    raw.includes("tier i") ||
    raw.includes("tier ii") ||
    raw.includes("tier iii") ||
    raw.includes("tier iv") ||
    raw === "starter" ||
    raw === "growth"
  ) {
    return false;
  }

  return (
    raw.includes("silver") ||
    raw.includes("gold") ||
    raw.includes("platinum") ||
    raw.includes("diamond")
  );
}

/**
 * Checks if a business has an active paid Subscriber Tier (Tier 2, Tier 3, Tier 4, or legacy paid tier).
 */
export function isPaidSubscriber(business) {
  if (!business) return false;
  const subTier = String(
    business.subscriberTier ||
    business.subscriber_tier ||
    business.subscriptionTier ||
    business.planId ||
    ""
  ).trim().toLowerCase();

  if (
    subTier === "tier_2" ||
    subTier === "tier_3" ||
    subTier === "tier_4" ||
    subTier === "tier-2" ||
    subTier === "tier-3" ||
    subTier === "tier-4" ||
    subTier === "tier 2" ||
    subTier === "tier 3" ||
    subTier === "tier 4" ||
    subTier.includes("tier ii") ||
    subTier.includes("tier iii") ||
    subTier.includes("tier iv")
  ) {
    return true;
  }

  // Legacy paid membership plans that bundled subscription
  const mem = String(business.membership || "").toLowerCase();
  if (mem.includes("enterprise") || mem.includes("premium")) {
    return true;
  }

  return false;
}

/**
 * Checks if a business is verified and approved.
 * Per RIFAH Feature Matrix Row 19: Subscriber tiers (Tier 1/2/3/4) NEVER have business verification.
 */
export function isVerifiedBusiness(business) {
  if (!business) return false;
  // Subscriber tiers (Tier 1/2/3/4) NEVER have verification
  if (isSubscriberTier(business) && !isChamberMember(business)) {
    return false;
  }
  const v = String(business.verification || "").toLowerCase();
  const s = String(business.status || "").toLowerCase();
  const isVerified = v === "verified" || v === "approved" || business.isVerified === true;
  const isNotEligible =
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
  return isVerified && !isNotEligible;
}

/**
 * Rule: The 2 Tags ([Verified] and [Premium member]) are ONLY shown for Members + Subscribers.
 * Must be verified, hold Chamber Membership, AND have an active Subscriber Tier.
 */
export function isMemberAndSubscriber(business) {
  if (!business) return false;
  return isVerifiedBusiness(business) && isChamberMember(business) && isPaidSubscriber(business);
}

/**
 * Renders the 2 Tags for businesses that are BOTH Members + Subscribers:
 * 1. [✔ Verified] (Green pill)
 * 2. [☆ Premium member] (Rose/Brand pill) or specific tier ([👑 Diamond member], [👑 Platinum member])
 */
export function MemberSubscriberBadges({ business, compact = true, className }) {
  if (!isMemberAndSubscriber(business)) {
    return null;
  }

  const rawMem = String(business?.membership || "").toLowerCase();
  const isDiamond = rawMem.includes("diamond");
  const isPlatinum = rawMem.includes("platinum");

  return (
    <div className={cn("inline-flex flex-wrap items-center gap-1.5", className)}>
      <VerificationBadge status="verified" compact={compact} />
      {isDiamond ? (
        <MembershipBadge tier="Diamond" />
      ) : isPlatinum ? (
        <MembershipBadge tier="Platinum" />
      ) : (
        <Pill tone="brand" icon={<Star className="h-3.5 w-3.5" />}>
          Premium member
        </Pill>
      )}
    </div>
  );
}


const statusTone = {
  New: "primary",
  "In Progress": "warning",
  Responded: "primary",
  Won: "success",
  Closed: "neutral",
  Rejected: "danger",
  Active: "success",
  Paid: "success",
  Pending: "warning",
  Processing: "warning",
  Failed: "danger",
  Refunded: "neutral",
  Cancelled: "neutral",
  Expired: "danger",
  Suspended: "danger",
  Draft: "neutral",
  Approved: "success",
  Upcoming: "primary",
  Past: "neutral",
  Forming: "warning",
  Planned: "warning",
  High: "danger",
  Medium: "warning",
  Low: "neutral",
  Escalated: "warning",
  Delivered: "success",
};

export function StatusBadge({ status }) {
  return <Pill tone={statusTone[status] ?? "neutral"}>{status}</Pill>;
}

export function VisaStatusBadge({ status }) {
  const tones = {
    Pending: "warning",
    "In Progress": "primary",
    Approved: "brand",
    Delivered: "success",
    Rejected: "danger",
  };
  return <Pill tone={tones[status] ?? "neutral"}>{status || "Pending"}</Pill>;
}

