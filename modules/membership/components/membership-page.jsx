"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Minus,
  Star,
  Building2,
  Globe,
  HelpCircle,
  FileText,
  CreditCard,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

import { PublicLayout } from "@shared/components/rifah/public-layout";
import { Panel, SectionHeader } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { useMembershipPlans } from "@shared/hooks/use-rifah-api";
import { cn } from "@shared/lib/utils";
import { ChamberMembershipTiers } from "@shared/components/rifah/chamber-membership-tiers";
import { PolicyDialog } from "@shared/components/rifah/policy-dialog";

const POLICY_ITEMS = [
  {
    key: "faqs",
    title: "Frequently Asked Questions",
    shortTitle: "FAQs",
    description: "Verification process, lead routing, tier upgrades, and member benefits.",
    icon: HelpCircle,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 border-emerald-200/80 dark:bg-emerald-950/40 dark:border-emerald-800",
    badge: "Common Questions",
  },
  {
    key: "terms",
    title: "Terms & Conditions",
    shortTitle: "Terms",
    description: "Chamber terms of service, governance, code of ethics, and liability limits.",
    icon: FileText,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 border-blue-200/80 dark:bg-blue-950/40 dark:border-blue-800",
    badge: "Legal Charter",
  },
  {
    key: "payment",
    title: "Payment Policy",
    shortTitle: "Payment",
    description: "Annual subscription billing, 18% GST invoices, grace period, and payment modes.",
    icon: CreditCard,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 border-amber-200/80 dark:bg-amber-950/40 dark:border-amber-800",
    badge: "Billing & GST",
  },
  {
    key: "membership",
    title: "Membership Policy",
    shortTitle: "Membership",
    description: "Tier classifications, chapter rights, directory listings, and member conduct.",
    icon: ShieldCheck,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 border-purple-200/80 dark:bg-purple-950/40 dark:border-purple-800",
    badge: "Rules & Rights",
  },
];

function MembershipPage() {
  const { data: plansData } = useMembershipPlans();
  const [currency, setCurrency] = useState("INR");
  const [activePolicy, setActivePolicy] = useState(null);
  const isIntl = currency === "USD";

  return (
    <PublicLayout>
      <div className="rifah-container py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <SectionHeader
            title="Membership plans"
            description="Membership determines directory visibility, catalogue capacity and how early your business sees matched buyer enquiries."
          />

          {/* Region / Currency Switcher */}
          <div className="flex items-center gap-1 rounded-xl border border-border/80 bg-muted/50 p-1 self-start sm:self-auto shrink-0 shadow-2xs">
            <button
              type="button"
              onClick={() => setCurrency("INR")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                !isIntl
                  ? "bg-white dark:bg-slate-900 text-primary shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Building2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>₹ INR (National)</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrency("USD")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                isIntl
                  ? "bg-white dark:bg-slate-900 text-primary shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Globe className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>$ USD (International)</span>
            </button>
          </div>
        </div>

        <div className="mt-8">
          <ChamberMembershipTiers
            plansData={plansData}
            currency={currency}
            showHeader={false}
          />
        </div>

        {/* Chamber Policies & FAQs Section with interactive modal dialog */}
        <div className="mt-12 scroll-mt-24" id="faqs">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-border/80 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Chamber Policies &amp; FAQs
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Click any document below to view detailed questions, code of ethics, payment terms, or membership rules in a popup dialog.
              </p>
            </div>
            <span className="text-xs font-medium text-muted-foreground self-start sm:self-auto">
              4 Official Documents
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {POLICY_ITEMS.map((item) => {
              const ItemIcon = item.icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActivePolicy(item.key)}
                  className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className={cn("grid h-11 w-11 place-items-center rounded-xl border shadow-xs transition-transform group-hover:scale-105", item.bg)}>
                        <ItemIcon className={cn("h-5 w-5", item.color)} />
                      </div>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="mt-4 text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <span>Open Dialog</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Global Policy Dialog */}
        <PolicyDialog
          openKey={activePolicy}
          onClose={() => setActivePolicy(null)}
        />
      </div>
    </PublicLayout>
  );
}

export { MembershipPage };
export default MembershipPage;
