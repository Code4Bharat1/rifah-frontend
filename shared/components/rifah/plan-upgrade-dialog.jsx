"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Lock,
  Sparkles,
  Check,
  X,
  Shield,
  ArrowRight,
  Globe,
  IndianRupee,
  DollarSign,
  Crown,
  Zap,
  Building2,
  Users,
  Diamond,
} from "lucide-react";
import { Dialog, DialogContent } from "@shared/components/ui/dialog";
import { Button } from "@shared/components/ui/button";
import { cn } from "@shared/lib/utils";
import {
  SUBSCRIBER_TIERS,
  BUSINESS_CHAMBER_TIERS,
} from "@shared/lib/subscription-models";
import { workspacePrefix, homePath } from "@shared/lib/workspace";
import { useAuth } from "@shared/providers/auth-provider";

const formatNumber = (num) => {
  if (num === undefined || num === null) return "0";
  return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const BUSINESS_STYLE = {
  silver: {
    icon: Crown,
    circleGradient: "bg-gradient-to-b from-slate-300 via-slate-400 to-slate-500 shadow-md",
    cardBorder: "border-slate-200 dark:border-slate-800",
    buttonClass: "border border-slate-300 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-50",
  },
  gold: {
    icon: Crown,
    circleGradient: "bg-gradient-to-b from-amber-400 via-amber-500 to-yellow-600 shadow-md",
    cardBorder: "border-amber-200 dark:border-amber-900/40",
    buttonClass: "border border-amber-500 bg-white dark:bg-slate-900 text-amber-800 dark:text-amber-300 hover:bg-amber-50",
  },
  platinum: {
    icon: Crown,
    circleGradient: "bg-gradient-to-b from-blue-500 via-indigo-500 to-blue-600 shadow-md",
    cardBorder: "border-2 border-blue-600 shadow-xl shadow-blue-500/15",
    buttonClass: "bg-blue-600 hover:bg-blue-700 text-white font-bold",
  },
  diamond: {
    icon: Diamond,
    circleGradient: "bg-gradient-to-b from-purple-400 via-purple-500 to-violet-600 shadow-md",
    cardBorder: "border-purple-200 dark:border-purple-900/40",
    buttonClass: "border border-purple-500 bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 hover:bg-purple-50",
  },
};

const SUBSCRIBER_STYLE = {
  tier_1: {
    icon: Shield,
    circleGradient: "bg-gradient-to-b from-slate-300 via-slate-400 to-slate-500 shadow-md",
    cardBorder: "border-slate-200 dark:border-slate-800",
    buttonClass: "border border-slate-300 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-50",
  },
  tier_2: {
    icon: Building2,
    circleGradient: "bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 shadow-md",
    cardBorder: "border-emerald-200 dark:border-emerald-900/40",
    buttonClass: "border border-emerald-500 bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50",
  },
  tier_3: {
    icon: Crown,
    circleGradient: "bg-gradient-to-b from-blue-500 via-indigo-500 to-blue-600 shadow-md",
    cardBorder: "border-2 border-blue-600 shadow-xl shadow-blue-500/15",
    buttonClass: "bg-blue-600 hover:bg-blue-700 text-white font-bold",
  },
  tier_4: {
    icon: Diamond,
    circleGradient: "bg-gradient-to-b from-purple-400 via-purple-500 to-violet-600 shadow-md",
    cardBorder: "border-purple-200 dark:border-purple-900/40",
    buttonClass: "border border-purple-500 bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 hover:bg-purple-50",
  },
};

export function PlanUpgradeDialog({
  isOpen,
  onClose,
  featureName = "This feature",
  requiredTier = "Tier II (Starter)",
  defaultCategory = "user",
}) {
  const { user } = useAuth();
  const [currency, setCurrency] = useState("INR"); // "INR" | "USD"
  const [activeCategory, setActiveCategory] = useState(defaultCategory); // "user" | "business"
  const isIntl = currency === "USD";

  const isBusiness = activeCategory === "business";
  const plans = isBusiness ? BUSINESS_CHAMBER_TIERS : SUBSCRIBER_TIERS;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[96vw] sm:max-w-6xl max-h-[92vh] overflow-y-auto no-scrollbar p-0 rounded-2xl sm:rounded-3xl border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-br from-blue-50 via-indigo-50/40 to-transparent dark:from-blue-950/30 dark:via-indigo-950/10 dark:to-transparent border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold mb-1.5">
                  <Sparkles className="h-3 w-3" />
                  <span>Premium Feature Locked</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  Upgrade Plan to Unlock {featureName}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Unlock access starting from <strong>{requiredTier}</strong> and grow your network.
                </p>
              </div>
            </div>

            {/* Currency Selector */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-background/80 border border-border shrink-0 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setCurrency("INR")}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  !isIntl
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <IndianRupee className="h-3.5 w-3.5" />
                <span>INR (₹)</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  isIntl
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <DollarSign className="h-3.5 w-3.5" />
                <span>USD ($)</span>
              </button>
            </div>
          </div>

          {/* Category Switcher Tabs */}
          <div className="mt-5 flex items-center p-1 rounded-2xl bg-muted/80 border border-border max-w-sm">
            <button
              type="button"
              onClick={() => setActiveCategory("business")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                isBusiness
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Business Chamber</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory("user")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                !isBusiness
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Users className="h-3.5 w-3.5" />
              <span>User Subscription</span>
            </button>
          </div>
        </div>

        {/* Content Body - Uniform 4 Card Grid */}
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => {
              const styleMap = isBusiness ? BUSINESS_STYLE : SUBSCRIBER_STYLE;
              const style = styleMap[plan.id] || styleMap.silver || styleMap.tier_1;
              const IconComponent = style.icon || Crown;
              const isRecommended = plan.isPopular;

              const basePrice = isIntl ? plan.costingUsd : plan.costingInr;
              const displayPrice = isIntl
                ? `$${formatNumber(basePrice)}`
                : `₹${formatNumber(basePrice)}`;

              const taxText = isBusiness
                ? isIntl
                  ? `+ $${formatNumber(plan.gstUsd || Math.round(plan.costingUsd * 0.18))} GST (18%)`
                  : `+ ₹${formatNumber(plan.gstInr || Math.round(plan.costingInr * 0.18))} GST (18%)`
                : "/month";

              return (
                <div
                  key={plan.id}
                  className={cn(
                    "relative p-5 rounded-3xl border transition-all flex flex-col justify-between bg-card",
                    style.cardBorder,
                    isRecommended && "shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/20"
                  )}
                >
                  {isRecommended && (
                    <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-b-lg shadow-xs flex items-center gap-1 z-10">
                      <Crown className="h-2.5 w-2.5 fill-white" />
                      <span>{plan.badgeText || "Most Popular"}</span>
                    </div>
                  )}

                  <div>
                    {/* Centered Top Icon */}
                    <div className="flex flex-col items-center text-center mt-1 mb-2">
                      <div className={cn("h-12 w-12 rounded-full flex items-center justify-center shrink-0 mb-2", style.circleGradient)}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="text-base font-black text-foreground">
                        {plan.name}
                      </h4>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground mt-1">
                        {plan.badge}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="text-center my-3 pb-2 border-b border-border/60">
                      <div className="text-2xl font-black text-foreground">
                        {displayPrice}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-medium mt-0.5">
                        {taxText}
                      </div>
                      <div className="text-[10px] text-muted-foreground/80 mt-0.5">
                        {plan.subtitle}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-2 text-xs py-2">
                      {isBusiness ? (
                        plan.bulletPoints?.map((bullet, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-muted-foreground">
                            <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="text-[11px] text-foreground/90">{bullet}</span>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground border-b border-border/40 pb-1">
                            <span>Posts</span>
                            <span className="font-bold text-foreground">{plan.features.feed_posting}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground border-b border-border/40 pb-1">
                            <span>Direct Chat</span>
                            <span className="font-bold text-foreground">{plan.features.chat}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground border-b border-border/40 pb-1">
                            <span>Lead Unlock</span>
                            <span className="font-bold text-foreground">{plan.features.lead_unlock}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>Catalogue</span>
                            <span className="font-bold text-foreground">{plan.features.product_listing}</span>
                          </div>
                        </>
                      )}

                      {/* Read More Link */}
                      <Link
                        href={`/membership`}
                        onClick={onClose}
                        className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 pt-1 text-left cursor-pointer"
                      >
                        <span>Read all features & details</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>

                  <Link
                    href={
                      plan.id === "tier_1" || plan.costingInr === 0
                        ? homePath(user)
                        : `/membership/checkout?plan=${plan.id}&category=${activeCategory}&currency=${currency}`
                    }
                    onClick={onClose}
                    className={cn(
                      "mt-4 w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs",
                      style.buttonClass
                    )}
                  >
                    <span>{plan.id === "tier_1" ? "Active Free" : "Proceed to Checkout"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 bg-muted/40 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-600" />
            <span>Official Chamber &amp; Connect verification with instant activation.</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
