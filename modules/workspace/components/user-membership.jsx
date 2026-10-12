"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  Crown,
  Sparkles,
  Zap,
  Star,
  ShieldCheck,
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Clock,
  Layers,
  HelpCircle,
  Phone,
  MessageSquare,
  Building2,
} from "lucide-react";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Button } from "@shared/components/ui/button";
import { useAuth } from "@shared/providers/auth-provider";
import { userApi } from "@shared/lib/api-services";
import { SUBSCRIBER_TIERS, FEATURE_SPEC_DEFINITIONS } from "@shared/lib/subscription-models";
import { SubscriberModelsTable } from "@shared/components/rifah/subscriber-models-table";
import { useFeatureAccess } from "@shared/hooks/use-feature-access";
import { toast } from "sonner";
import { cn } from "@shared/lib/utils";

export function UserMembership() {
  const { user, refreshUser } = useAuth();
  const { currentTier, planName } = useFeatureAccess();
  const [upgradingTier, setUpgradingTier] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const activePlanId = currentTier?.id || "tier_1";

  const handleSelectTier = async (tier) => {
    if (tier.id === activePlanId) {
      toast.info(`You are currently on ${tier.name}.`);
      return;
    }

    setUpgradingTier(tier.id);
    try {
      // Update user subscriberTier & membershipPlan
      await userApi.updateProfile({
        subscriberTier: tier.name,
        membershipPlan: tier.name,
      });

      if (refreshUser) {
        await refreshUser();
      } else if (typeof window !== "undefined") {
        const stored = localStorage.getItem("rifah_user");
        if (stored) {
          const u = JSON.parse(stored);
          u.subscriberTier = tier.name;
          u.membershipPlan = tier.name;
          localStorage.setItem("rifah_user", JSON.stringify(u));
        }
      }

      toast.success(`Successfully activated ${tier.name}! Your privileges have been updated.`);
      setIsSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err) {
      toast.error(err?.message || "Failed to update membership tier.");
    } finally {
      setUpgradingTier(null);
    }
  };

  return (
    <AppShell
      role="user"
      title="Member Subscription Tiers"
      subtitle="Select or upgrade your personal chamber tier to access advanced networking, chats, and lead enquiries."
    >
      <div className="space-y-8 max-w-6xl mx-auto py-6 px-3 sm:px-6">
        {/* Current Active Plan Banner */}
        <div className="rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-2">
                <Crown className="h-3.5 w-3.5" />
                <span>Active Subscription</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {planName || "Tier I (Free)"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                {currentTier?.summary || "Standard individual chamber member access for business discovery and community interaction."}
              </p>
            </div>

            <div className="flex items-baseline gap-2 bg-white/90 border border-slate-200 px-5 py-3 rounded-2xl shadow-xs shrink-0">
              <span className="text-3xl font-black text-slate-900">
                ₹{currentTier?.costingInr ?? 0}
              </span>
              <span className="text-xs font-medium text-slate-500">/ month</span>
            </div>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h3 className="text-xl font-bold text-slate-900">Choose Your Ideal Member Tier</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Flexible monthly tiers designed for individual members, entrepreneurs, and growing teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {SUBSCRIBER_TIERS.map((tier) => {
              const isCurrent = tier.id === activePlanId;
              const isUpgrading = upgradingTier === tier.id;
              const isFree = tier.costingInr === 0;

              return (
                <div
                  key={tier.id}
                  className={cn(
                    "relative rounded-3xl border-2 p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 bg-white",
                    isCurrent
                      ? "border-blue-600 shadow-md ring-2 ring-blue-600/10"
                      : tier.isPopular
                      ? "border-indigo-400 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 hover:shadow-xs"
                  )}
                >
                  {/* Badges */}
                  {tier.isPopular && !isCurrent && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                      Most Popular
                    </span>
                  )}
                  {isCurrent && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                      Active Plan
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-base font-bold text-slate-900">{tier.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                        {tier.subtitle}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1 my-3">
                      <span className="text-3xl font-black text-slate-950">₹{tier.costingInr}</span>
                      <span className="text-xs text-slate-500 font-medium">/ month</span>
                    </div>

                    <p className="text-xs text-slate-600 mb-4 line-clamp-2">
                      {tier.summary}
                    </p>

                    <div className="border-t border-slate-100 pt-4 mb-6">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Key Inclusions
                      </p>
                      <ul className="space-y-2 text-xs text-slate-700">
                        {tier.bulletPoints?.map((bp, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{bp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="button"
                      disabled={isCurrent || Boolean(upgradingTier)}
                      onClick={() => handleSelectTier(tier)}
                      className={cn(
                        "w-full h-11 rounded-xl font-bold text-xs shadow-xs transition-all",
                        isCurrent
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                          : tier.isPopular
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-slate-900 hover:bg-slate-800 text-white"
                      )}
                    >
                      {isUpgrading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                          <span>Activating...</span>
                        </>
                      ) : isCurrent ? (
                        "Current Active Plan"
                      ) : isFree ? (
                        "Downgrade to Free"
                      ) : (
                        `Upgrade to ${tier.name}`
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Official Rifah Connect Subscriber Models Matrix */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 px-1">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Rifah Connect Subscriber Models Specification
              </h3>
              <p className="text-xs text-slate-500">
                Detailed comparison of monthly entitlements, quotas, and feature access across Tier I, II, III, and IV.
              </p>
            </div>
          </div>

          <SubscriberModelsTable
            currentTierId={activePlanId}
            onSelectTier={handleSelectTier}
          />
        </div>
      </div>
    </AppShell>
  );
}
