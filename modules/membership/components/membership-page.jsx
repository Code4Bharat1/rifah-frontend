"use client";
import Link from "next/link";
import { Check, Minus, Star } from "lucide-react";

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

const comparison = [
  { label: "Directory listing", values: ["Standard", "Improved ranking", "Featured placement", "Top-tier placement"] },
  { label: "Products & services", values: ["Up to 3", "Up to 15", "Unlimited", "Unlimited, multi-catalogue"] },
  { label: "Lead routing", values: ["Limited", "Standard", "Priority", "Dedicated rules"] },
  { label: "Verified badge", values: [false, true, true, true] },
  { label: "Enquiry inbox", values: [false, true, true, true] },
  { label: "Analytics", values: [false, "Basic", "Full", "Full + exports"] },
  { label: "Gallery & certifications", values: [false, false, true, true] },
  { label: "Team accounts", values: [false, false, false, true] },
  { label: "Chamber liaison", values: [false, false, false, true] },
];

const faqs = [
  {
    q: "How does RIFAH verification work?",
    a: "Businesses submit registration and compliance documents in the workspace. The RIFAH secretariat reviews them and either approves the listing, requests a correction, or rejects it with a reason.",
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

function Cell({ value }) {
  if (value === true) return <Check className="mx-auto h-4 w-4 text-success" aria-label="Included" />;
  if (value === false) return <Minus className="mx-auto h-4 w-4 text-muted-foreground" aria-label="Not included" />;
  return <span className="text-sm">{value}</span>;
}

function MembershipPage() {
  const { data: plansData } = useMembershipPlans();
  const plans = plansData ? Object.entries(plansData).map(([id, p]) => ({ id, ...p })) : [];

  return (
    <PublicLayout>
      <div className="rifah-container py-6 sm:py-10">
        <SectionHeader
          title="Membership plans"
          description="Membership determines directory visibility, catalogue capacity and how early your business sees matched buyer enquiries."
        />

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={cn(
                "flex flex-col rounded-2xl border bg-surface p-5",
                plan.id === "premium" ? "border-primary shadow-elevated ring-1 ring-primary/20" : "border-border"
              )}
            >
              {plan.id === "premium" && (
                <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
                  <Star className="h-3 w-3" /> Most chosen
                </span>
              )}
              <h2 className="text-base font-bold tracking-tight">{plan.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{plan.summary || `Annual ${plan.name} chamber membership`}</p>
              <p className="mt-4 text-2xl font-bold tracking-tight">
                ₹ {plan.price?.toLocaleString("en-IN")}
                <span className="ml-1 text-xs font-medium text-muted-foreground">/ year</span>
              </p>
              <ul className="mt-4 flex-1 space-y-2">
                {plan.features?.map((f, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className="mt-5"
                variant={plan.id === "premium" ? "default" : "outline"}
                size="lg"
              >
                <Link href={`/membership/checkout?plan=${plan.id}`}>
                  {plan.id === "free" ? "Start free listing" : `Choose ${plan.name}`}
                </Link>
              </Button>
            </article>
          ))}
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
