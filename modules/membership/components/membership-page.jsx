"use client";
import { useState } from "react";
import Link from "next/link";
import { Check, Minus, Star, Building2, Globe } from "lucide-react";

import { PublicLayout } from "@shared/components/rifah/public-layout";
import { Panel, SectionHeader } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@shared/components/ui/accordion";
import { useMembershipPlans } from "@shared/hooks/use-rifah-api";
import { cn } from "@shared/lib/utils";

import { ChamberMembershipTiers } from "@shared/components/rifah/chamber-membership-tiers";

const faqs = [
  {
    q: "How does RIFAH verification work?",
    a: "Businesses submit registration and compliance documents in the workspace. The RIFAH central admin reviews them and either approves the listing, requests a correction, or rejects it with a reason.",
  },
  {
    q: "How are leads routed to members?",
    a: "Buyer enquiries are matched by category, capability and region. Premium and Enterprise members receive matched leads first, and Enterprise groups can define custom allocation rules across units.",
  },
  {
    q: "Can a membership be upgraded mid-term?",
    a: "Yes. Upgrades take effect immediately and the remaining term of the existing plan is accounted for on the invoice.",
  },
];

function MembershipPage() {
  const { data: plansData } = useMembershipPlans();
  const [currency, setCurrency] = useState("INR");
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

        <div className="mt-10">
          <SectionHeader title="Frequently asked questions" />
          <Accordion type="single" collapsible className="mt-4">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm font-semibold">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </PublicLayout>
  );
}

export { MembershipPage };
export default MembershipPage;
