"use client";

import React from "react";
import Link from "next/link";
import {
  Crown,
  Diamond,
  Building2,
  Shield,
  Check,
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
    buttonText: "Proceed",
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
    buttonText: "Proceed",
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
    buttonText: "Proceed",
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
    buttonText: "Proceed",
    highlight: false,
  },
  tier_1: {
    icon: Shield,
    cardBg: "bg-white dark:bg-slate-900",
    circleGradient:
      "bg-gradient-to-b from-slate-200 via-slate-400 to-slate-500 shadow-md shadow-slate-400/25 ring-4 ring-slate-100 dark:ring-slate-800",
    iconColor: "text-white",
    cardBorder:
      "border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg",
    durationPill:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    durationLabel: "1 Month Validity",
    waveColor: "text-slate-100/90 dark:text-slate-800/40",
    buttonClass:
      "border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs",
    buttonText: "Proceed",
    highlight: false,
  },
  tier_2: {
    icon: Building2,
    cardBg: "bg-[#fffdf9] dark:bg-slate-900",
    circleGradient:
      "bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 shadow-md shadow-emerald-500/25 ring-4 ring-emerald-50 dark:ring-emerald-950/40",
    iconColor: "text-white",
    cardBorder:
      "border border-emerald-200/90 dark:border-emerald-900/40 hover:border-emerald-300 dark:hover:border-emerald-800 hover:shadow-lg",
    durationPill:
      "bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    durationLabel: "1 Month Validity",
    waveColor: "text-emerald-100/50 dark:text-emerald-950/30",
    buttonClass:
      "border border-emerald-500/90 dark:border-emerald-500 bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 shadow-2xs",
    buttonText: "Proceed",
    highlight: false,
  },
  tier_3: {
    icon: Crown,
    cardBg: "bg-[#f8faff] dark:bg-slate-900",
    circleGradient:
      "bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 shadow-md shadow-blue-500/25 ring-4 ring-blue-50 dark:ring-blue-950/40",
    iconColor: "text-white",
    cardBorder:
      "border-2 border-blue-600 dark:border-blue-500 shadow-xl shadow-blue-500/15 hover:shadow-2xl hover:shadow-blue-500/20",
    durationPill:
      "bg-blue-100/80 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
    durationLabel: "1 Month Validity",
    waveColor: "text-blue-100/60 dark:text-blue-950/30",
    buttonClass:
      "bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/30",
    buttonText: "Proceed",
    highlight: true,
    badgeText: "Most Popular",
  },
  tier_4: {
    icon: Diamond,
    cardBg: "bg-[#fcfaff] dark:bg-slate-900",
    circleGradient:
      "bg-gradient-to-b from-purple-400 via-purple-500 to-violet-600 shadow-md shadow-purple-500/25 ring-4 ring-purple-50 dark:ring-purple-950/40",
    iconColor: "text-white",
    cardBorder:
      "border border-purple-200/90 dark:border-purple-900/40 hover:border-purple-300 dark:hover:border-purple-800 hover:shadow-lg",
    durationPill:
      "bg-purple-100/80 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300",
    durationLabel: "1 Month Validity",
    waveColor: "text-purple-100/50 dark:text-purple-950/30",
    buttonClass:
      "border border-purple-500 dark:border-purple-400 bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 shadow-2xs",
    buttonText: "Proceed",
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
    buttonText: "Proceed",
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
    buttonText: "Proceed",
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
    buttonText: "Proceed",
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
    buttonText: "Proceed",
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
 * Fallback defaults for Chamber Business Plans
 */
export const DEFAULT_BUSINESS_PLANS = {
  silver: {
    id: "silver",
    planId: "silver",
    name: "Silver",
    price: 3000,
    priceUsd: 39,
    durationYears: 1,
    gstRate: 18,
    category: "business",
    displayOrder: 1,
    isRecommended: false,
    summary: "1-Year Verified Chamber Membership",
    features: [
      "Directory listing with Verified Chamber Badge",
      "Up to 15 matched buyer lead enquiries / mo",
      "Standard catalogue listing (up to 5 items)",
      "Chamber community & chapter networking access",
    ],
  },
  gold: {
    id: "gold",
    planId: "gold",
    name: "Gold",
    price: 5000,
    priceUsd: 65,
    durationYears: 2,
    gstRate: 18,
    category: "business",
    displayOrder: 2,
    isRecommended: false,
    summary: "2-Year Chamber Access & Direct Messaging",
    features: [
      "Directory listing with Verified Chamber Badge",
      "Up to 35 matched buyer lead enquiries / mo",
      "Expanded catalogue listing (up to 15 items)",
      "Direct B2B buyer messaging",
      "Priority RFQ & high-value lead routing",
    ],
  },
  platinum: {
    id: "platinum",
    planId: "platinum",
    name: "Platinum",
    price: 25000,
    priceUsd: 325,
    durationYears: 10,
    gstRate: 18,
    category: "business",
    displayOrder: 3,
    isRecommended: true,
    summary: "10-Year Enterprise Patronage (Recommended)",
    features: [
      "Featured placement across Directory & Homepage",
      "Unlimited matched buyer lead enquiries",
      "Full commercial product & service catalogue",
      "Direct B2B buyer messaging",
      "Priority RFQ & high-value lead routing",
      "4 Annual Chamber Summit & Networking delegate passes",
      "Secretariat & Trade Advisory Desk",
    ],
  },
  diamond: {
    id: "diamond",
    planId: "diamond",
    name: "Diamond",
    price: 50000,
    priceUsd: 650,
    durationYears: 25,
    gstRate: 18,
    category: "business",
    displayOrder: 4,
    isRecommended: false,
    summary: "25-Year Prestige Chamber Patronage",
    features: [
      "All Platinum features included",
      "25-Year Lifetime chamber patronage",
      "Unlimited verified buyer lead enquiries",
      "Full commercial product & service catalogue",
      "Direct B2B buyer messaging",
      "Priority RFQ & high-value lead routing",
      "VIP Delegate passes for national & regional summits",
      "Dedicated Secretariat Trade Advisory Desk",
      "Global Chapter & International Network Access",
      "Custom exhibition pavilion & sponsor showcase",
    ],
  },
};

/**
 * Fallback defaults for Subscriber / Member Plans (Monthly)
 */
export const DEFAULT_USER_PLANS = {
  tier_1: {
    id: "tier_1",
    planId: "tier_1",
    name: "Tier I (Free)",
    price: 0,
    priceUsd: 0,
    durationYears: 0,
    durationMonths: 1,
    gstRate: 0,
    category: "user",
    displayOrder: 5,
    isRecommended: false,
    summary: "Essential access to Rifah Connect directory and basic networking.",
    features: [
      "Directory listing on RIFAH Connect",
      "Basic business presence",
      "2 Inquiries/month",
      "1 Lead unlock/month",
    ],
  },
  tier_2: {
    id: "tier_2",
    planId: "tier_2",
    name: "Tier II (Starter)",
    price: 50,
    priceUsd: 1,
    durationYears: 0,
    durationMonths: 1,
    gstRate: 0,
    category: "user",
    displayOrder: 6,
    isRecommended: false,
    summary: "Starter monthly subscription with direct chat and post feeds.",
    features: [
      "5 Feed posts/month",
      "5 Direct chats",
      "10 Inquiries/month",
      "5 Lead unlocks/month",
      "5 Catalogue products",
    ],
  },
  tier_3: {
    id: "tier_3",
    planId: "tier_3",
    name: "Tier III (Growth)",
    price: 100,
    priceUsd: 2,
    durationYears: 0,
    durationMonths: 1,
    gstRate: 0,
    category: "user",
    displayOrder: 7,
    isRecommended: true,
    summary: "Most popular monthly plan for active business lead generation.",
    features: [
      "10 Feed posts/month",
      "15 Direct chats",
      "30 Inquiries/month",
      "15 Lead unlocks/month",
      "10 Catalogue products",
      "Featured business visibility",
    ],
  },
  tier_4: {
    id: "tier_4",
    planId: "tier_4",
    name: "Tier IV (Enterprise)",
    price: 200,
    priceUsd: 4,
    durationYears: 0,
    durationMonths: 1,
    gstRate: 0,
    category: "user",
    displayOrder: 8,
    isRecommended: false,
    summary: "Complete scale for business teams with unlimited chats and leads.",
    features: [
      "20 Feed posts/month",
      "Unlimited Direct chats",
      "Unlimited Inquiries",
      "Unlimited Lead unlocks",
      "Unlimited Catalogue products",
      "Featured business visibility",
      "5 Team member seats",
    ],
  },
};

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
  defaultCategory = "business",
  showCategoryToggle = true,
  onSelectPlan,
  showHeader = true,
  showFooter = true,
  showInactive = false,
  showTheory = true,
  showSummary = true,
  showFeatures = true,
  renderCardFooter = null,
  className,
}) {
  const isIntl = currency === "USD";
  const [selectedCategory, setSelectedCategory] = React.useState(defaultCategory || "business");
  
  React.useEffect(() => {
    if (defaultCategory) {
      setSelectedCategory(defaultCategory);
    }
  }, [defaultCategory]);

  const { data: fetchedPlansData } = useMembershipPlans();
  const effectivePlansData = plansData ?? fetchedPlansData;
  const hasTheory = Boolean(showTheory && (showSummary || showFeatures));

  // Merge backend data with full fallback list to ensure all 8 plans are always accessible
  const allMergedPlans = React.useMemo(() => {
    const rawMap = {};

    // 1. Seed fallback business tiers
    Object.entries(DEFAULT_BUSINESS_PLANS).forEach(([key, plan]) => {
      rawMap[key.toLowerCase()] = { ...plan };
    });

    // 2. Seed fallback user tiers
    Object.entries(DEFAULT_USER_PLANS).forEach(([key, plan]) => {
      rawMap[key.toLowerCase()] = { ...plan };
    });

    // 3. Override with live server data
    if (effectivePlansData) {
      const sourceList = Array.isArray(effectivePlansData)
        ? effectivePlansData.map((p) => ({ id: p.id || p.planId, ...p }))
        : Object.entries(effectivePlansData).map(([id, p]) => ({ id: p?.id || p?.planId || id, ...p }));

      sourceList.forEach((p) => {
        const idKey = String(p.id || p.planId || "").toLowerCase();
        if (idKey) {
          rawMap[idKey] = {
            ...(rawMap[idKey] || {}),
            ...p,
            id: idKey,
            planId: idKey,
          };
        }
      });
    }

    return Object.values(rawMap);
  }, [effectivePlansData]);

  // Filter and sort plans based on active tab category
  const filteredPlans = React.useMemo(() => {
    const CANONICAL_ORDER = {
      silver: 1,
      gold: 2,
      platinum: 3,
      diamond: 4,
      tier_1: 5,
      tier_2: 6,
      tier_3: 7,
      tier_4: 8,
      free: 0,
      basic: 1,
      premium: 3,
      enterprise: 4,
    };

    return allMergedPlans
      .filter((plan) => {
        if (!plan.id) return false;
        if (!showInactive && plan.isActive === false) return false;

        const idKey = String(plan.id || "").toLowerCase();
        // Exclude legacy "free", "basic", "premium", "enterprise" alias plans
        if (["free", "basic", "premium", "enterprise"].includes(idKey)) return false;

        const isUserTier = idKey.startsWith("tier_");

        if (selectedCategory === "business") {
          return !isUserTier;
        }
        if (selectedCategory === "user") {
          return isUserTier;
        }
        return true;
      })
      .sort((a, b) => {
        const idA = String(a.id || a.planId || a.name || "").toLowerCase();
        const idB = String(b.id || b.planId || b.name || "").toLowerCase();
        const orderA =
          a.displayOrder !== undefined && a.displayOrder !== null && Number(a.displayOrder) > 0
            ? Number(a.displayOrder)
            : CANONICAL_ORDER[idA] ?? 99;
        const orderB =
          b.displayOrder !== undefined && b.displayOrder !== null && Number(b.displayOrder) > 0
            ? Number(b.displayOrder)
            : CANONICAL_ORDER[idB] ?? 99;
        if (orderA !== orderB) return orderA - orderB;
        return (Number(a.price) || 0) - (Number(b.price) || 0);
      });
  }, [allMergedPlans, selectedCategory, showInactive]);

  return (
    <div className={cn("w-full flex flex-col gap-6", className)}>
      {/* ── Header ─────────────────────────────────────────── */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-amber-100/90 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-2xs">
              <Crown className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground tracking-tight leading-tight">
                RIFAH Membership &amp; Subscription Plans
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Select the right plan to match your business growth &amp; networking needs. Applicable taxes are shown for each plan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Category Switcher Tab Bar (Business Multi-Year vs Member Monthly) ── */}
      {showCategoryToggle && (
        <div className="flex items-center justify-center pt-1">
          <div className="inline-flex items-center rounded-2xl border border-border/80 bg-muted/60 p-1.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setSelectedCategory("business")}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                selectedCategory === "business"
                  ? "bg-white dark:bg-slate-900 text-foreground shadow-xs font-bold ring-1 ring-border/50"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Building2 className="h-4 w-4 text-amber-500" />
              <span>Business Chamber Membership</span>
              <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                Multi-Year
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("user")}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                selectedCategory === "user"
                  ? "bg-white dark:bg-slate-900 text-foreground shadow-xs font-bold ring-1 ring-border/50"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Shield className="h-4 w-4 text-blue-500" />
              <span>Member / User Plans</span>
              <span className="rounded-full bg-blue-100 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:text-blue-300">
                1 Month
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ── Cards Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-3">
        {filteredPlans.map((plan, index) => {
          const style = getPlanStyle(plan, index);
          const isRecommended = Boolean(plan.isRecommended ?? style.highlight);
          const isCurrent =
            String(currentTier || "").toLowerCase() === plan.id.toLowerCase();
          const IconComponent = style.icon || Crown;

          const basePrice = isIntl ? plan.priceUsd : plan.price;
          const displayPrice = formatPrice(basePrice, isIntl);

          // GST calculation
          const gstRate = Number(plan.gstRate ?? 0);
          const gstAmt = !isIntl ? computeGst(plan.price, gstRate) : null;

          // Duration label - user plans are strictly 1 month validity, chamber plans are multi-year
          const isUserPlan = String(plan.id || "").toLowerCase().startsWith("tier_");
          const durationYears = Number(plan.durationYears) || 0;
          let durationLabel = style.durationLabel;
          if (isUserPlan) {
            durationLabel = "1 Month Validity";
          } else if (durationYears > 0) {
            durationLabel = durationYears === 1 ? "1 Year Validity" : `${durationYears} Years Validity`;
          }

          // Button label
          const isActionSelect = Boolean(onSelectPlan);
          let ctaLabel = style.buttonText || "Proceed";
          if (isCurrent) {
            ctaLabel = isActionSelect ? "Current Plan" : `Renew ${plan.name}`;
          } else if (plan.price === 0 || plan.id === "tier_1") {
            ctaLabel = "Select Free Plan";
          }

          return (
            <div
              key={plan.id}
              className={cn(
                "membership-tier-card relative flex flex-col items-center justify-between rounded-2xl sm:rounded-3xl p-4 sm:p-5 pt-7 sm:pt-8 pb-5 sm:pb-6 text-center transition-all duration-300 w-full min-w-0 will-change-transform will-change-opacity",
                hasTheory ? "min-h-[380px] sm:min-h-[410px]" : "min-h-[260px] sm:min-h-[280px]",
                style.cardBg || "bg-white dark:bg-slate-900",
                style.cardBorder,
                isCurrent && "ring-2 ring-emerald-500 border-emerald-500 shadow-xl",
                isRecommended && !isCurrent && "shadow-xl shadow-blue-500/10 animate-platinum-glow hover:-translate-y-2 hover:scale-[1.01]",
                !isRecommended && "hover:-translate-y-1 hover:shadow-lg"
              )}
            >
              {/* Floating Badge for Most Popular or Selected */}
              {isRecommended && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-[11px] font-bold text-white shadow-md tracking-wide whitespace-nowrap z-30 flex items-center gap-1.5">
                  <Crown className="h-3 w-3 fill-white stroke-[1.5]" />
                  <span>{style.badgeText ?? "Recommended"}</span>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-3 py-0.5 text-[11px] font-bold text-white shadow-md tracking-wide whitespace-nowrap z-30 flex items-center gap-1.5">
                  <Check className="h-3 w-3 stroke-[3]" />
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
                    "w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-transform hover:scale-105",
                    style.circleGradient
                  )}
                >
                  <IconComponent className={cn("h-6 w-6", style.iconColor)} />
                </div>

                {/* Plan Name */}
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {plan.name}
                </h3>

                {/* Duration Tag */}
                <div className="mt-1.5 mb-2.5">
                  <span
                    className={cn(
                      "inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wide whitespace-nowrap",
                      style.durationPill
                    )}
                  >
                    {durationLabel}
                  </span>
                </div>

                {/* Large Bold Price */}
                <div className="mt-1 flex items-baseline justify-center gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight whitespace-nowrap">
                    {displayPrice}
                  </span>
                  {isUserPlan && plan.price > 0 && (
                    <span className="text-xs text-muted-foreground font-semibold">/ mo</span>
                  )}
                </div>

                {/* GST / Tax subtext */}
                {!isIntl && gstAmt != null && plan.price > 0 && !isUserPlan ? (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 whitespace-nowrap">
                    + ₹{gstAmt.toLocaleString("en-IN")} GST ({gstRate}%)
                  </p>
                ) : isIntl && !isUserPlan && plan.price > 0 ? (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 whitespace-nowrap">
                    + {gstRate}% Tax / GST
                  </p>
                ) : null}

                {/* Plan summary */}
                {hasTheory && showSummary && plan.summary && (
                  <p className="mt-2 text-[11px] text-muted-foreground line-clamp-2 px-1 leading-snug">
                    {plan.summary}
                  </p>
                )}

                {/* Plan features preview */}
                {hasTheory && showFeatures && Array.isArray(plan.features) && plan.features.length > 0 && (
                  <ul className="mt-3 space-y-1.5 w-full text-left px-1">
                    {plan.features.slice(0, 4).map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-tight line-clamp-1">{f}</span>
                      </li>
                    ))}
                    {plan.features.length > 4 && (
                      <li className="text-[11px] font-medium text-muted-foreground pl-5">
                        +{plan.features.length - 4} more benefits
                      </li>
                    )}
                  </ul>
                )}
              </div>

              {/* Bottom CTA Button or Custom Card Footer */}
              <div className="relative z-10 w-full mt-5">
                {renderCardFooter ? (
                  renderCardFooter(plan)
                ) : onSelectPlan ? (
                  <button
                    type="button"
                    onClick={() => onSelectPlan(plan)}
                    className={cn(
                      "membership-proceed-btn magnetic-btn w-full rounded-full h-10 px-4 text-xs font-bold inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs select-none group",
                      isCurrent
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25"
                        : style.buttonClass
                    )}
                  >
                    <span className="whitespace-nowrap tracking-wide">{ctaLabel}</span>
                    {isCurrent ? (
                      <Check className="h-3.5 w-3.5 shrink-0 stroke-[2.5]" />
                    ) : (
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 stroke-[2.2] transition-transform duration-200 group-hover:translate-x-1" />
                    )}
                  </button>
                ) : (
                  <Link
                    href={`/membership/checkout?plan=${plan.id}${
                      isIntl ? "&currency=USD" : ""
                    }`}
                    className={cn(
                      "membership-proceed-btn magnetic-btn w-full rounded-full h-10 px-4 text-xs font-bold inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs select-none group",
                      style.buttonClass
                    )}
                  >
                    <span className="whitespace-nowrap tracking-wide">{ctaLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 stroke-[2.2] transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ChamberMembershipTiers;
