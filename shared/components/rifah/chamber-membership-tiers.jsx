"use client";

import React from "react";
import Link from "next/link";
import {
  Crown,
  Diamond,
  Building2,
  Shield,
  Check,
  Headphones,
  MessageSquare,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Star,
} from "lucide-react";
import { cn } from "@shared/lib/utils";
import { useMembershipPlans } from "@shared/hooks/use-rifah-api";

/**
 * Visual styling configuration for all Chamber Membership Tiers
 */
const TIER_STYLE_CONFIG = {
  silver: {
    icon: Crown,
    cardBg: "bg-white dark:bg-slate-900",
    circleGradient:
      "bg-gradient-to-b from-slate-200 via-slate-400 to-slate-500 shadow-md shadow-slate-400/25 ring-4 ring-slate-100 dark:ring-slate-800",
    iconColor: "text-white",
    cardBorder:
      "border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg",
    durationPill:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    durationLabel: "1 Year Validity",
    waveColor: "text-slate-100/90 dark:text-slate-800/40",
    buttonClass:
      "border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs",
    buttonText: "Select Silver",
    highlight: false,
  },
  gold: {
    icon: Crown,
    cardBg: "bg-[#fffdf9] dark:bg-slate-900",
    circleGradient:
      "bg-gradient-to-b from-amber-300 via-amber-500 to-amber-600 shadow-md shadow-amber-500/25 ring-4 ring-amber-50 dark:ring-amber-950/40",
    iconColor: "text-white",
    cardBorder:
      "border border-amber-200/90 dark:border-amber-900/40 hover:border-amber-300 dark:hover:border-amber-800 hover:shadow-lg",
    durationPill:
      "bg-amber-100/80 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    durationLabel: "2 Years Validity",
    waveColor: "text-amber-100/50 dark:text-amber-950/30",
    buttonClass:
      "border border-amber-500/90 dark:border-amber-500 bg-white dark:bg-slate-900 text-amber-800 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 shadow-2xs",
    buttonText: "Select Gold",
    highlight: false,
  },
  platinum: {
    icon: Crown,
    cardBg: "bg-[#f8faff] dark:bg-slate-900",
    circleGradient:
      "bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 shadow-md shadow-blue-500/25 ring-4 ring-blue-50 dark:ring-blue-950/40",
    iconColor: "text-white",
    cardBorder:
      "border-2 border-blue-600 dark:border-blue-500 shadow-xl shadow-blue-500/15 hover:shadow-2xl hover:shadow-blue-500/20",
    durationPill:
      "bg-blue-100/80 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
    durationLabel: "10 Years Validity",
    waveColor: "text-blue-100/60 dark:text-blue-950/30",
    buttonClass:
      "bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/30",
    buttonText: "Select Platinum",
    highlight: true,
    badgeText: "Most Popular",
  },
  diamond: {
    icon: Diamond,
    cardBg: "bg-[#fcfaff] dark:bg-slate-900",
    circleGradient:
      "bg-gradient-to-b from-purple-400 via-purple-500 to-violet-600 shadow-md shadow-purple-500/25 ring-4 ring-purple-50 dark:ring-purple-950/40",
    iconColor: "text-white",
    cardBorder:
      "border border-purple-200/90 dark:border-purple-900/40 hover:border-purple-300 dark:hover:border-purple-800 hover:shadow-lg",
    durationPill:
      "bg-purple-100/80 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300",
    durationLabel: "25 Years Validity",
    waveColor: "text-purple-100/50 dark:text-purple-950/30",
    buttonClass:
      "border border-purple-500 dark:border-purple-400 bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 shadow-2xs",
    buttonText: "Select Diamond",
    highlight: false,
  },
  // Legacy aliases
  free: {
    icon: Shield,
    cardBg: "bg-white dark:bg-slate-900",
    circleGradient:
      "bg-gradient-to-b from-slate-200 to-slate-400 shadow-md text-white ring-4 ring-slate-100",
    iconColor: "text-white",
    cardBorder: "border border-border",
    durationPill: "bg-slate-100 text-slate-700",
    durationLabel: "Standard",
    waveColor: "text-slate-100",
    buttonClass: "border border-border bg-card hover:bg-muted text-foreground",
    buttonText: "Get Started",
    highlight: false,
  },
  basic: {
    icon: Building2,
    cardBg: "bg-[#fffdf9] dark:bg-slate-900",
    circleGradient:
      "bg-gradient-to-b from-amber-300 to-amber-500 shadow-md text-white ring-4 ring-amber-50",
    iconColor: "text-white",
    cardBorder: "border border-amber-200",
    durationPill: "bg-amber-100 text-amber-800",
    durationLabel: "2 Years Validity",
    waveColor: "text-amber-100/50",
    buttonClass: "border border-amber-600 bg-card text-amber-700",
    buttonText: "Select Basic",
    highlight: false,
  },
  premium: {
    icon: Crown,
    cardBg: "bg-[#f8faff] dark:bg-slate-900",
    circleGradient:
      "bg-gradient-to-b from-blue-400 to-blue-600 shadow-md text-white ring-4 ring-blue-50",
    iconColor: "text-white",
    cardBorder: "border-2 border-blue-600 shadow-xl shadow-blue-500/15",
    durationPill: "bg-blue-100 text-blue-800",
    durationLabel: "10 Years Validity",
    waveColor: "text-blue-100/60",
    buttonClass: "bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/30",
    buttonText: "Select Premium",
    highlight: true,
    badgeText: "Most Popular",
  },
  enterprise: {
    icon: Diamond,
    cardBg: "bg-[#fcfaff] dark:bg-slate-900",
    circleGradient:
      "bg-gradient-to-b from-purple-400 to-violet-600 shadow-md text-white ring-4 ring-purple-50",
    iconColor: "text-white",
    cardBorder: "border border-purple-200",
    durationPill: "bg-purple-100 text-purple-800",
    durationLabel: "25 Years Validity",
    waveColor: "text-purple-100/50",
    buttonClass: "border border-purple-500 bg-card text-purple-700",
    buttonText: "Select Enterprise",
    highlight: false,
  },
};

const DYNAMIC_PALETTES = [
  {
    icon: Crown,
    cardBg: "bg-white dark:bg-slate-900",
    circleGradient:
      "bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 shadow-md shadow-emerald-500/25 ring-4 ring-emerald-50 dark:ring-emerald-950/40",
    iconColor: "text-white",
    cardBorder:
      "border border-emerald-200/90 dark:border-emerald-900/40 hover:border-emerald-300 dark:hover:border-emerald-800 hover:shadow-lg",
    durationPill: "bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    waveColor: "text-emerald-100/50 dark:text-emerald-950/30",
    buttonClass:
      "border border-emerald-500 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 shadow-2xs",
  },
  {
    icon: Sparkles,
    cardBg: "bg-white dark:bg-slate-900",
    circleGradient:
      "bg-gradient-to-b from-indigo-400 via-indigo-500 to-indigo-600 shadow-md shadow-indigo-500/25 ring-4 ring-indigo-50 dark:ring-indigo-950/40",
    iconColor: "text-white",
    cardBorder:
      "border border-indigo-200/90 dark:border-indigo-900/40 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-lg",
    durationPill: "bg-indigo-100/80 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300",
    waveColor: "text-indigo-100/50 dark:text-indigo-950/30",
    buttonClass:
      "border border-indigo-500 bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 shadow-2xs",
  },
  {
    icon: Diamond,
    cardBg: "bg-white dark:bg-slate-900",
    circleGradient:
      "bg-gradient-to-b from-rose-400 via-rose-500 to-rose-600 shadow-md shadow-rose-500/25 ring-4 ring-rose-50 dark:ring-rose-950/40",
    iconColor: "text-white",
    cardBorder:
      "border border-rose-200/90 dark:border-rose-900/40 hover:border-rose-300 dark:hover:border-rose-800 hover:shadow-lg",
    durationPill: "bg-rose-100/80 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
    waveColor: "text-rose-100/50 dark:text-rose-950/30",
    buttonClass:
      "border border-rose-500 bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 shadow-2xs",
  },
  {
    icon: Star,
    cardBg: "bg-white dark:bg-slate-900",
    circleGradient:
      "bg-gradient-to-b from-cyan-400 via-cyan-500 to-sky-600 shadow-md shadow-cyan-500/25 ring-4 ring-cyan-50 dark:ring-cyan-950/40",
    iconColor: "text-white",
    cardBorder:
      "border border-cyan-200/90 dark:border-cyan-900/40 hover:border-cyan-300 dark:hover:border-cyan-800 hover:shadow-lg",
    durationPill: "bg-cyan-100/80 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300",
    waveColor: "text-cyan-100/50 dark:text-cyan-950/30",
    buttonClass:
      "border border-cyan-500 bg-white dark:bg-slate-900 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 shadow-2xs",
  },
];

const DEFAULT_STYLE = TIER_STYLE_CONFIG.silver;

function getPlanStyle(plan, index = 0) {
  const key = String(plan?.id || plan?.planId || "").toLowerCase();
  const nameKey = String(plan?.name || "").toLowerCase();
  if (TIER_STYLE_CONFIG[key]) return TIER_STYLE_CONFIG[key];
  if (TIER_STYLE_CONFIG[nameKey]) return TIER_STYLE_CONFIG[nameKey];
  return DYNAMIC_PALETTES[index % DYNAMIC_PALETTES.length] || DEFAULT_STYLE;
}

/**
 * Bottom flowing wave decoration SVG component
 */
function WaveDecoration({ className }) {
  return (
    <svg
      className={cn(
        "absolute bottom-0 left-0 right-0 w-full h-36 pointer-events-none select-none",
        className
      )}
      viewBox="0 0 320 140"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0,80 C90,120 180,40 320,85 L320,140 L0,140 Z"
        fill="currentColor"
        className="opacity-40"
      />
      <path
        d="M0,50 C110,105 210,15 320,60 L320,140 L0,140 Z"
        fill="currentColor"
        className="opacity-70"
      />
    </svg>
  );
}

/**
 * Format price helper
 */
function formatPrice(amount, isIntl) {
  const num = Number(amount ?? 0);
  if (isNaN(num)) return isIntl ? "$—" : "₹—";
  if (num === 0) return isIntl ? "$0" : "₹0";
  return isIntl
    ? `$${num.toLocaleString("en-US")}`
    : `₹${num.toLocaleString("en-IN")}`;
}

/**
 * Compute GST helper
 */
function computeGst(price, gstRate = 18) {
  const base = Number(price) || 0;
  return Math.round((base * gstRate) / 100);
}

/**
 * ChamberMembershipTiers
 *
 * Renders official dynamic RIFAH membership cards
 * Matching the user's visual specification without clutter.
 */
export function ChamberMembershipTiers({
  currentTier = "",
  plansData = null,
  currency = "INR",
  onSelectPlan,
  showHeader = true,
  showFooter = true,
  showInactive = false,
  renderCardFooter = null,
  className,
}) {
  const isIntl = currency === "USD";
  const { data: fetchedPlansData } = useMembershipPlans();
  const effectivePlansData = plansData ?? fetchedPlansData;

  // Convert plansData map → ordered array using preferred display order.
  const plans = React.useMemo(() => {
    const source = Array.isArray(effectivePlansData)
      ? effectivePlansData.map((plan) => ({ id: plan.id || plan.planId, ...plan }))
      : Object.entries(effectivePlansData || {}).map(([id, plan]) => ({ id, ...plan }));

    return source
      .filter((plan) => plan.id && (showInactive ? true : plan.isActive !== false))
      .sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0));
  }, [effectivePlansData, showInactive]);

  return (
    <div className={cn("w-full flex flex-col gap-6", className)}>
      {/* ── Header ─────────────────────────────────────────── */}
      {showHeader && (
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-amber-100/90 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-2xs">
            <Crown className="h-5 w-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight leading-tight">
              Chamber Membership Tiers
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Select the right plan to match your business growth &amp; chamber networking needs. Applicable taxes are shown for each plan.
            </p>
          </div>
        </div>
      )}

      {/* ── Cards Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-6">
        {plans.map((plan, index) => {
          const style = getPlanStyle(plan, index);
          const isRecommended = Boolean(plan.isRecommended);
          const isCurrent =
            String(currentTier || "").toLowerCase() === plan.id.toLowerCase();
          const IconComponent = style.icon || Crown;

          const basePrice = isIntl ? plan.priceUsd : plan.price;
          const displayPrice = formatPrice(basePrice, isIntl);

          // GST calculation
          const gstRate = Number(plan.gstRate ?? 0);
          const gstAmt = !isIntl ? computeGst(plan.price, gstRate) : null;

          // Duration label
          const durationYears = Number(plan.durationYears) || 1;
          const durationLabel = durationYears === 1 ? "1 Year Validity" : `${durationYears} Years Validity`;

          // Button label
          const isActionSelect = Boolean(onSelectPlan);
          const ctaLabel = isCurrent
            ? isActionSelect
              ? "Selected"
              : `Renew ${plan.name}`
            : `Select ${plan.name}`;

          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col items-center justify-between rounded-3xl p-5 sm:p-6 pt-9 pb-7 text-center transition-all duration-300 min-h-[440px]",
                style.cardBg || "bg-white dark:bg-slate-900",
                style.cardBorder,
                isCurrent && "ring-2 ring-emerald-500 border-emerald-500 shadow-xl",
                isRecommended && !isCurrent && "shadow-xl shadow-blue-500/10"
              )}
            >
              {/* Floating Badge for Most Popular or Selected */}
              {isRecommended && !isCurrent && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3.5 py-1 text-xs font-bold text-white shadow-md tracking-wide whitespace-nowrap z-30 flex items-center gap-1.5">
                  <Crown className="h-3.5 w-3.5 fill-white stroke-[1.5]" />
                  <span>{style.badgeText ?? "Recommended"}</span>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-3.5 py-1 text-xs font-bold text-white shadow-md tracking-wide whitespace-nowrap z-30 flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                  <span>Current Plan</span>
                </div>
              )}
              {plan.isActive === false && (
                <div className="absolute top-3 right-3 rounded-full bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 z-30">
                  Inactive
                </div>
              )}

              {/* Wave Decoration at bottom behind button (clipped inside this inner layer) */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                <WaveDecoration className={style.waveColor} />
              </div>

              {/* Card Main Body */}
              <div className="relative z-10 w-full flex flex-col items-center flex-1">
                {/* 3D Gradient Icon Badge */}
                <div
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center mb-3.5 transition-transform hover:scale-105",
                    style.circleGradient
                  )}
                >
                  <IconComponent className={cn("h-7 w-7", style.iconColor)} />
                </div>

                {/* Plan Name */}
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {plan.name}
                </h3>

                {/* Duration Tag */}
                <div className="mt-2 mb-3">
                  <span
                    className={cn(
                      "inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap",
                      style.durationPill
                    )}
                  >
                    {durationLabel}
                  </span>
                </div>

                {/* Large Bold Price */}
                <div className="mt-1 flex items-baseline justify-center gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight whitespace-nowrap">
                    {displayPrice}
                  </span>
                </div>

                {/* GST / Tax subtext */}
                {!isIntl && gstAmt != null && plan.price > 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 whitespace-nowrap">
                    + ₹{gstAmt.toLocaleString("en-IN")} GST ({gstRate}%)
                  </p>
                ) : isIntl ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 whitespace-nowrap">
                    + {gstRate}% Tax / GST
                  </p>
                ) : null}

                {/* Plan summary */}
                {plan.summary && (
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2 px-1">
                    {plan.summary}
                  </p>
                )}

                {/* Plan features preview */}
                {Array.isArray(plan.features) && plan.features.length > 0 && (
                  <ul className="mt-3.5 space-y-1.5 w-full text-left px-1">
                    {plan.features.slice(0, 3).map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-tight line-clamp-1">{f}</span>
                      </li>
                    ))}
                    {plan.features.length > 3 && (
                      <li className="text-[11px] font-medium text-muted-foreground pl-5">
                        +{plan.features.length - 3} more benefits
                      </li>
                    )}
                  </ul>
                )}
              </div>

              {/* Bottom CTA Button or Custom Card Footer */}
              <div className="relative z-10 w-full mt-6">
                {renderCardFooter ? (
                  renderCardFooter(plan)
                ) : onSelectPlan ? (
                  <button
                    type="button"
                    onClick={() => onSelectPlan(plan)}
                    className={cn(
                      "w-full rounded-full h-11 px-4 text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs select-none",
                      isCurrent
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25"
                        : style.buttonClass
                    )}
                  >
                    <span className="whitespace-nowrap">{ctaLabel}</span>
                    {isCurrent ? (
                      <Check className="h-4 w-4 shrink-0 stroke-[2.5]" />
                    ) : (
                      <ArrowRight className="h-4 w-4 shrink-0 stroke-[2.2]" />
                    )}
                  </button>
                ) : (
                  <Link
                    href={`/membership/checkout?plan=${plan.id}${
                      isIntl ? "&currency=USD" : ""
                    }`}
                    className={cn(
                      "w-full rounded-full h-11 px-4 text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs select-none",
                      style.buttonClass
                    )}
                  >
                    <span className="whitespace-nowrap">{ctaLabel}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 stroke-[2.2]" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Help + Trust Footer ─────────────────────────────── */}
      {showFooter && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-border/70 bg-sky-50/40 dark:bg-slate-900/50 px-4 py-3 mt-2">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Headphones className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block leading-tight">
                Need help choosing?
              </span>
              <span className="text-[11px] text-muted-foreground leading-tight">
                Our chamber secretariat will help you find the right membership plan.
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
              <span>Trusted nationwide</span>
            </div>

            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-foreground font-semibold text-[11px] h-8 px-3 shadow-2xs shrink-0 transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>Contact Secretariat</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChamberMembershipTiers;
