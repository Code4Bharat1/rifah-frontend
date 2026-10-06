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

        {/* Feature Matrix Breakdown */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">Detailed Tier Comparison Matrix</h3>
          <p className="text-xs text-slate-500 mb-6">
            Compare monthly entitlements across lead unlocks, enquiries, direct messaging, and community access.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">
                  <th className="py-3 px-4 font-bold text-slate-700">Feature</th>
                  <th className="py-3 px-3 font-bold text-slate-700 text-center">Tier I (Free)</th>
                  <th className="py-3 px-3 font-bold text-slate-700 text-center">Tier II (₹50)</th>
                  <th className="py-3 px-3 font-bold text-slate-700 text-center">Tier III (₹100)</th>
                  <th className="py-3 px-3 font-bold text-slate-700 text-center">Tier IV (₹200)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {FEATURE_SPEC_DEFINITIONS.slice(0, 15).map((f) => {
                  const t1 = SUBSCRIBER_TIERS[0].features[f.key];
                  const t2 = SUBSCRIBER_TIERS[1].features[f.key];
                  const t3 = SUBSCRIBER_TIERS[2].features[f.key];
                  const t4 = SUBSCRIBER_TIERS[3].features[f.key];

                  const renderVal = (val) => {
                    if (val === true) return <Check className="h-4 w-4 text-emerald-600 mx-auto" />;
                    if (val === false || val === "None") return <span className="text-slate-400">None</span>;
                    return <span className="font-semibold text-slate-800">{String(val)}</span>;
                  };

                  return (
                    <tr key={f.key} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 font-medium text-slate-800">
                        {f.label}
                      </td>
                      <td className="py-2.5 px-3 text-center">{renderVal(t1)}</td>
                      <td className="py-2.5 px-3 text-center">{renderVal(t2)}</td>
                      <td className="py-2.5 px-3 text-center">{renderVal(t3)}</td>
                      <td className="py-2.5 px-3 text-center">{renderVal(t4)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
