"use client";

import React from "react";
import Link from "next/link";
import { Check, X, Crown, ArrowRight, Sparkles, Zap, ShieldCheck, Info } from "lucide-react";
import { cn } from "@shared/lib/utils";
import { SUBSCRIBER_TIERS, FEATURE_SPEC_DEFINITIONS } from "@shared/lib/subscription-models";
import { Button } from "@shared/components/ui/button";

/**
 * SubscriberModelsTable
 *
 * Implements the exact "Rifah Connect Subscriber Models" comparison matrix
 * matching the user specification table across Tier I, Tier II, Tier III, and Tier IV.
 */
export function SubscriberModelsTable({
  currentTierId = "",
  onSelectTier,
  showActionButtons = true,
  className,
}) {
  const renderCellContent = (val, featureKey) => {
    // Boolean checks
    if (val === true) {
      return (
        <span className="inline-flex items-center justify-center text-emerald-600 font-black text-sm">
          ✓
        </span>
      );
    }
    if (val === false || val === "None") {
      return (
        <span className="inline-flex items-center justify-center text-slate-400 font-bold text-sm">
          ✕
        </span>
      );
    }

    // Number zero or chat "0"
    if (val === "0" || val === 0) {
      return (
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          0
        </span>
      );
    }

    // Text values
    const s = String(val);
    if (s.toLowerCase() === "unlimited") {
      return (
        <span className="font-bold text-blue-600 dark:text-blue-400 underline decoration-blue-300 underline-offset-2">
          Unlimited
        </span>
      );
    }
    if (s.toLowerCase() === "accessible") {
      return <span className="font-semibold text-emerald-700 dark:text-emerald-400">Accessible</span>;
    }
    if (s.toLowerCase() === "available") {
      return <span className="font-semibold text-emerald-700 dark:text-emerald-400">Available</span>;
    }
    if (s.toLowerCase() === "free content") {
      return <span className="font-semibold text-teal-700 dark:text-teal-400">Free Content</span>;
    }
    if (s.toLowerCase() === "selected") {
      return <span className="font-semibold text-blue-700 dark:text-blue-400">Selected</span>;
    }
    if (s.toLowerCase() === "full") {
      return <span className="font-bold text-purple-700 dark:text-purple-400">Full</span>;
    }
    if (s.toLowerCase().includes("all members must purchase subscriptions") || s.toLowerCase().startsWith("multiple")) {
      return (
        <div className="flex flex-col items-center gap-1 text-[11px] leading-tight text-purple-700 dark:text-purple-300 font-bold px-1">
          <span>Multiple Members</span>
          <span className="text-[10px] font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800 text-center">
            Per-member subscription required
          </span>
        </div>
      );
    }

    return <span className="font-semibold text-slate-800 dark:text-slate-200">{s}</span>;
  };

  return (
    <div className={cn("w-full flex flex-col rounded-2xl border border-slate-300 dark:border-slate-800 overflow-hidden shadow-sm bg-white dark:bg-slate-900", className)}>
      {/* Top Banner Notice for Chamber Members */}
      <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-600 shrink-0" />
          <span>
            <strong>Chamber Membership &amp; Subscriptions:</strong> Verified Chamber members receive <strong>Tier I (Free)</strong> by default. Under <strong>Tier IV (Enterprise)</strong>, multiple member registrations are permitted under a single membership, but <strong>all members have to purchase their subscriptions</strong>.
          </span>
        </div>
      </div>

      {/* Main Table Wrapper */}
      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse text-xs sm:text-sm text-center select-text min-w-[650px]">
          {/* Main Brand Title Row */}
          <thead>
            <tr className="bg-[#0A2540] text-white">
              <th
                colSpan={5}
                className="py-3 px-4 text-center font-black text-base sm:text-lg tracking-wide uppercase border-b border-[#1A385C]"
              >
                Rifah Connect Subscriber Models
              </th>
            </tr>
            {/* Column Headers */}
            <tr className="bg-[#0F2D52] text-white border-b border-[#1A385C]">
              <th className="py-3 px-4 text-left font-bold w-[32%] text-white tracking-wide border-r border-[#1A385C]/60">
                Features
              </th>
              {SUBSCRIBER_TIERS.map((tier) => {
                const isCurrent = currentTierId === tier.id;
                return (
                  <th
                    key={tier.id}
                    className={cn(
                      "py-3 px-3 text-center font-bold w-[17%] border-r last:border-r-0 border-[#1A385C]/60 tracking-wide transition-colors",
                      isCurrent && "bg-[#163E70]"
                    )}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-extrabold">{tier.name}</span>
                      {tier.isPopular && (
                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                          ★ Most Popular
                        </span>
                      )}
                      {isCurrent && (
                        <span className="rounded-full bg-emerald-500/30 text-emerald-300 px-2 py-0.2 text-[10px] font-bold border border-emerald-400/40">
                          Current Plan
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {FEATURE_SPEC_DEFINITIONS.map((def, idx) => {
              const isEven = idx % 2 === 0;
              const isHighlight = def.isHighlight;

              return (
                <tr
                  key={def.key}
                  className={cn(
                    "transition-colors hover:bg-blue-50/40 dark:hover:bg-slate-800/50",
                    isEven ? "bg-[#f8f9fa] dark:bg-slate-900/60" : "bg-white dark:bg-slate-900"
                  )}
                >
                  {/* Feature Label Column */}
                  <td
                    className={cn(
                      "py-2.5 px-4 text-left font-semibold border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100",
                      isHighlight && "text-rose-600 dark:text-rose-400 font-bold"
                    )}
                  >
                    {def.label}
                  </td>

                  {/* 4 Tier Columns */}
                  {SUBSCRIBER_TIERS.map((tier) => {
                    const rawVal = tier.features[def.key];
                    const isCurrent = currentTierId === tier.id;

                    return (
                      <td
                        key={tier.id}
                        className={cn(
                          "py-2.5 px-3 border-r last:border-r-0 border-slate-200 dark:border-slate-800 transition-colors",
                          isCurrent && "bg-blue-50/30 dark:bg-slate-800/30"
                        )}
                      >
                        {renderCellContent(rawVal, def.key)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>

          {/* Optional Action / Proceed Row at Footer */}
          {showActionButtons && (
            <tfoot>
              <tr className="bg-slate-100/80 dark:bg-slate-800/90 border-t-2 border-slate-300 dark:border-slate-700">
                <td className="py-3 px-4 font-bold text-left text-slate-700 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800">
                  Select Subscription Plan
                </td>
                {SUBSCRIBER_TIERS.map((tier) => {
                  const isCurrent = currentTierId === tier.id;
                  const isFree = tier.costingInr === 0;

                  return (
                    <td
                      key={tier.id}
                      className={cn(
                        "py-3 px-3 text-center border-r last:border-r-0 border-slate-200 dark:border-slate-800",
                        isCurrent && "bg-blue-50/30 dark:bg-slate-800/40"
                      )}
                    >
                      {onSelectTier ? (
                        <button
                          type="button"
                          onClick={() => onSelectTier(tier)}
                          disabled={isCurrent}
                          className={cn(
                            "w-full rounded-xl py-1.5 px-3 text-xs font-bold transition-all shadow-2xs cursor-pointer",
                            isCurrent
                              ? "bg-slate-200 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-400"
                              : tier.isPopular
                              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                              : "border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50"
                          )}
                        >
                          {isCurrent ? "Active" : isFree ? "Free Tier" : `Upgrade`}
                        </button>
                      ) : (
                        <Link
                          href={`/membership/checkout?plan=${tier.id}`}
                          className={cn(
                            "w-full inline-flex items-center justify-center rounded-xl py-1.5 px-3 text-xs font-bold transition-all shadow-2xs",
                            isCurrent
                              ? "bg-emerald-600 text-white"
                              : tier.isPopular
                              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                              : "border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50"
                          )}
                        >
                          {isCurrent ? "Current" : isFree ? "Select Free" : `Choose`}
                        </Link>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

export default SubscriberModelsTable;
