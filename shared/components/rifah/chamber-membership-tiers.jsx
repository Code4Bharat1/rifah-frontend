"use client";

import React from "react";
import Link from "next/link";
import {
  Crown,
  Diamond,
  Building2,
  Shield,
  Check,
  X,
  Headphones,
  MessageSquare,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { cn } from "@shared/lib/utils";

/**
 * Per-plan visual config — Silver, Gold, Platinum, Diamond.
 * Icon, color palette, CTA style, highlight pill.
 * Content (name, price, features) comes from the backend.
 */
const TIER_STYLE_CONFIG = {
  silver: {
    icon: Shield,
    iconBoxBg:
      "bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
    buttonVariant: "outline",
    buttonClass:
      "border-slate-400 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200",
    highlight: false,
    accentColor: "text-slate-500",
    durationLabel: "1-Year",
  },
  gold: {
    icon: Building2,
    iconBoxBg:
      "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40",
    buttonVariant: "outline",
    buttonClass:
      "border-amber-500 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40",
    highlight: false,
    accentColor: "text-amber-600",
    durationLabel: "2-Year",
  },
  platinum: {
    icon: Crown,
    iconBoxBg:
      "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40",
    buttonVariant: "default",
    buttonClass: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold",
    highlight: true,
    badgeText: "Recommended",
    accentColor: "text-blue-600",
    durationLabel: "10-Year",
  },
  diamond: {
    icon: Sparkles,
    iconBoxBg:
      "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40",
    buttonVariant: "outline",
    buttonClass:
      "border-purple-600 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40",
    highlight: false,
    accentColor: "text-purple-600",
    durationLabel: "25-Year",
  },
  // Legacy aliases for backwards-compat
  free: {
    icon: Shield,
    iconBoxBg:
      "bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/40",
    buttonVariant: "outline",
    buttonClass:
      "border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100",
    highlight: false,
    accentColor: "text-sky-600",
  },
  basic: {
    icon: Building2,
    iconBoxBg:
      "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40",
    buttonVariant: "outline",
    buttonClass:
      "border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40",
    highlight: false,
    accentColor: "text-blue-600",
  },
  premium: {
    icon: Crown,
    iconBoxBg:
      "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40",
    buttonVariant: "default",
    buttonClass: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold",
    highlight: true,
    badgeText: "Most Popular",
    accentColor: "text-amber-600",
  },
  enterprise: {
    icon: Diamond,
    iconBoxBg:
      "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40",
    buttonVariant: "outline",
    buttonClass:
      "border-purple-600 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40",
    highlight: false,
    accentColor: "text-purple-600",
  },
};

/** Fallback style for any unknown planId returned by the backend */
const DEFAULT_STYLE = {
  icon: Building2,
  iconBoxBg:
    "bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700",
  buttonVariant: "outline",
  buttonClass: "border-slate-400 text-slate-700 dark:text-slate-300 hover:bg-slate-50",
  highlight: false,
  accentColor: "text-slate-600",
};

/**
 * Format a numeric price to locale string with currency symbol.
 */
function formatPrice(amount, isIntl) {
  const num = Number(amount ?? 0);
  if (isNaN(num)) return isIntl ? "$—" : "₹—";
  if (num === 0) return isIntl ? "$0" : "₹0";
  return isIntl
    ? `$${num.toLocaleString("en-US")}`
    : `₹${num.toLocaleString("en-IN")}`;
}

/** Compute GST amount (18%) on base price. Always INR-only for Indian plans. */
function computeGst(price, gstRate = 18) {
  const base = Number(price) || 0;
  return Math.round(base * gstRate / 100);
}

/**
 * Skeleton card shown while plansData is loading.
 */
function TierCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-border/60 bg-card p-4 animate-pulse">
      <div className="w-9 h-9 rounded-xl bg-muted mb-2.5" />
      <div className="h-4 w-2/3 rounded bg-muted mb-1.5" />
      <div className="h-3 w-1/2 rounded bg-muted mb-4" />
      <div className="h-6 w-3/4 rounded bg-muted mb-4" />
      <div className="space-y-2 pt-2.5 border-t border-border/50">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-3 rounded bg-muted" style={{ width: `${65 + i * 5}%` }} />
        ))}
      </div>
      <div className="mt-4 h-9 rounded-xl bg-muted" />
    </div>
  );
}

/**
 * ChamberMembershipTiers
 *
 * Props:
 *  - plansData: object keyed by planId from `/api/v1/memberships/plans`
 *               e.g. { silver: { name, price, priceUsd, summary, features[], missingFeatures[], durationYears, gstRate }, ... }
 *  - currentTier: string planId of the user's active plan (highlights "Current Plan")
 *  - currency: "INR" | "USD"
 *  - onSelectPlan: optional callback (tier) => void  (if omitted, CTA navigates to checkout)
 *  - showHeader: boolean — show title/subtitle block above cards
 *  - className: extra class on root element
 */
export function ChamberMembershipTiers({
  currentTier = "",
  plansData = null,
  currency = "INR",
  onSelectPlan,
  showHeader = true,
  className,
}) {
  const isIntl = currency === "USD";
  const isLoading = plansData === null;

  // Convert plansData map → ordered array using preferred display order.
  const DISPLAY_ORDER = ["silver", "gold", "platinum", "diamond", "free", "basic", "premium", "enterprise"];
  const plans = React.useMemo(() => {
    if (!plansData) return [];
    const ordered = DISPLAY_ORDER.filter((id) => plansData[id]).map((id) => ({
      id,
      ...plansData[id],
    }));
    const extra = Object.keys(plansData)
      .filter((id) => !DISPLAY_ORDER.includes(id))
      .map((id) => ({ id, ...plansData[id] }));
    return [...ordered, ...extra];
  }, [plansData]);

  return (
    <div className={cn("w-full flex flex-col gap-4", className)}>
      {/* ── Header ─────────────────────────────────────────── */}
      {showHeader && (
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-amber-100/90 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-2xs">
            <Crown className="h-5 w-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground tracking-tight leading-tight">
              Chamber Membership Tiers
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
              Select the right plan to match your business growth &amp; chamber networking needs. All prices + 18% GST.
            </p>
          </div>
        </div>
      )}

      {/* ── Cards Grid ──────────────────────────────────────── */}
      <div
        className={cn(
          "grid gap-3 pt-3.5",
          isLoading
            ? "grid-cols-2 lg:grid-cols-4"
            : plans.length <= 2
            ? "grid-cols-1 sm:grid-cols-2"
            : plans.length === 3
            ? "grid-cols-1 sm:grid-cols-3"
            : "grid-cols-2 lg:grid-cols-4"
        )}
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <TierCardSkeleton key={i} />)
          : plans.map((plan) => {
              const style = TIER_STYLE_CONFIG[plan.id] ?? DEFAULT_STYLE;
              const isCurrent =
                String(currentTier || "").toLowerCase() === plan.id.toLowerCase();
              const IconComponent = style.icon;

              const basePrice = isIntl ? plan.priceUsd : plan.price;
              const displayPrice = formatPrice(basePrice, isIntl);

              // GST note — only for INR plans
              const gstRate = plan.gstRate || 18;
              const gstAmt = !isIntl ? computeGst(plan.price, gstRate) : null;
              const totalWithGst = !isIntl ? (plan.price || 0) + (gstAmt || 0) : null;

              // Duration label
              const durationYears = plan.durationYears;
              const durationLabel =
                style.durationLabel ||
                (durationYears
                  ? durationYears === 1
                    ? "1-Year"
                    : `${durationYears}-Year`
                  : "1-Year");

              // Button label
              const ctaLabel = isCurrent
                ? `Renew ${plan.name}`
                : plan.id === "free"
                ? "Get Started"
                : `Select ${plan.name}`;

              return (
                <div
                  key={plan.id}
                  className={cn(
                    "relative flex flex-col rounded-2xl bg-card p-4 transition-all duration-200",
                    style.highlight
                      ? "border-2 border-blue-600 dark:border-blue-500 shadow-lg shadow-blue-500/10"
                      : isCurrent
                      ? "border-2 border-emerald-500/80 dark:border-emerald-600 shadow-md"
                      : "border border-border/80 hover:border-border hover:shadow-sm"
                  )}
                >
                  {/* Floating badge */}
                  {style.highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-[10px] font-bold text-white shadow-xs tracking-wide whitespace-nowrap z-10">
                      {style.badgeText ?? "Recommended"}
                    </div>
                  )}
                  {isCurrent && !style.highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-3 py-0.5 text-[10px] font-bold text-white shadow-xs tracking-wide whitespace-nowrap z-10">
                      Current Plan
                    </div>
                  )}

                  {/* Card body */}
                  <div className="flex-1">
                    {/* Icon + Duration tag */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center",
                          style.iconBoxBg
                        )}
                      >
                        <IconComponent className="h-4.5 w-4.5" />
                      </div>
                      {durationYears && (
                        <span className={cn(
                          "text-[9px] font-bold px-2 py-0.5 rounded-full border",
                          plan.id === "platinum"
                            ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300"
                            : plan.id === "diamond"
                            ? "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300"
                            : plan.id === "gold"
                            ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300"
                            : "bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                        )}>
                          {durationLabel}
                        </span>
                      )}
                    </div>

                    {/* Name & summary */}
                    <h3 className="text-base font-bold text-foreground tracking-tight leading-tight">
                      {plan.name}
                    </h3>
                    {plan.summary && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                        {plan.summary}
                      </p>
                    )}

                    {/* Price */}
                    <div className="mt-2 mb-1 flex items-baseline gap-1">
                      <span className="text-xl font-extrabold text-foreground tracking-tight">
                        {displayPrice}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {isIntl ? "/ membership" : `/ ${durationLabel.replace("-Year", " yr")}`}
                      </span>
                    </div>

                    {/* GST note — INR only */}
                    {!isIntl && gstAmt != null && plan.price > 0 && (
                      <p className="text-[10px] text-muted-foreground mb-3 leading-tight">
                        + ₹{gstAmt.toLocaleString("en-IN")} GST (18%) ={" "}
                        <span className="font-semibold text-foreground">
                          ₹{totalWithGst.toLocaleString("en-IN")} total
                        </span>
                      </p>
                    )}

                    {/* Included Features */}
                    {plan.features && plan.features.length > 0 && (
                      <ul className={cn("space-y-1.5 pt-2.5 border-t border-border/60", (!isIntl && gstAmt != null && plan.price > 0) ? "" : "mt-3")}>
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400 stroke-[2.6]" />
                            <span className="text-[11px] leading-tight text-slate-700 dark:text-slate-200 font-medium">
                              {feat}
                            </span>
                          </li>
                        ))}

                        {/* Missing / excluded features — crossed out */}
                        {plan.missingFeatures && plan.missingFeatures.length > 0 &&
                          plan.missingFeatures.map((feat, idx) => (
                            <li key={`miss-${idx}`} className="flex items-start gap-2 opacity-40">
                              <X className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-500 stroke-[2.6]" />
                              <span className="text-[11px] leading-tight text-slate-500 dark:text-slate-400 line-through">
                                {feat}
                              </span>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>

                  {/* CTA Button */}
                  <div className="mt-4">
                    {onSelectPlan ? (
                      <Button
                        type="button"
                        onClick={() => onSelectPlan(plan)}
                        variant={style.buttonVariant}
                        className={cn(
                          "w-full rounded-xl h-9 text-[11px] font-semibold gap-1 transition-colors cursor-pointer",
                          style.buttonClass
                        )}
                      >
                        {ctaLabel}
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    ) : (
                      <Button
                        asChild
                        variant={style.buttonVariant}
                        className={cn(
                          "w-full rounded-xl h-9 text-[11px] font-semibold gap-1 transition-colors cursor-pointer",
                          style.buttonClass
                        )}
                      >
                        <Link
                          href={`/membership/checkout?plan=${plan.id}${
                            isIntl ? "&currency=USD" : ""
                          }`}
                        >
                          {ctaLabel}
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
      </div>

      {/* ── Help + Trust Footer ─────────────────────────────── */}
      {!isLoading && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-border/70 bg-sky-50/40 dark:bg-slate-900/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Headphones className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block leading-tight">
                Need help choosing?
              </span>
              <span className="text-[11px] text-muted-foreground leading-tight">
                Our team will help you find the right plan.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>
                <strong className="font-semibold text-foreground">10,000+</strong> businesses
              </span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <ShieldCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>Trusted worldwide</span>
            </div>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-300 dark:border-slate-700 bg-card hover:bg-muted text-foreground font-semibold text-[11px] gap-1.5 h-8 px-3 shadow-2xs shrink-0"
            >
              <Link href="/contact">
                <MessageSquare className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                Contact Secretariat
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
