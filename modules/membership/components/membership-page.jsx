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
import { membershipPlans } from "@shared/lib/mock-data";
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
  {
    q: "Is this prototype showing real pricing?",
    a: "No. All fees and amounts in this prototype are placeholders so the chamber can confirm commercial terms before build.",
  },
];

function Cell({ value }) {
  if (value === true) return <Check className="mx-auto h-4 w-4 text-success" aria-label="Included" />;
  if (value === false) return <Minus className="mx-auto h-4 w-4 text-muted-foreground" aria-label="Not included" />;
  return <span className="text-sm">{value}</span>;
}

function MembershipPage() {
  return (
    <PublicLayout>
      <div className="rifah-container py-6 sm:py-10">
        <SectionHeader
          title="Membership plans"
          description="Membership determines directory visibility, catalogue capacity and how early your business sees matched buyer enquiries."
        />

        {/* Mobile: stacked cards. Desktop: 4-up */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {membershipPlans.map((plan) => (
            <article
              key={plan.id}
              className={cn(
                "flex flex-col rounded-2xl border bg-surface p-5",
                plan.highlight ? "border-primary shadow-elevated ring-1 ring-primary/20" : "border-border",
              )}
            >
              {plan.highlight && (
                <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
                  <Star className="h-3 w-3" /> Most chosen
                </span>
              )}
              <h2 className="text-base font-bold tracking-tight">{plan.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{plan.summary}</p>
              <p className="mt-4 text-2xl font-bold tracking-tight">
                {plan.price}
                {plan.period && <span className="ml-1 text-xs font-medium text-muted-foreground">{plan.period}</span>}
              </p>
              <ul className="mt-4 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className="mt-5"
                variant={plan.highlight ? "default" : "outline"}
                size="lg"
              >
                <Link href={`/membership/checkout?plan=custom`}>
                  {plan.id === "free" ? "Start free listing" : plan.id === "enterprise" ? "Talk to RIFAH" : `Choose ${plan.name}`}
                </Link>
              </Button>
            </article>
          ))}
        </div>

        <div className="mt-8">
          <Panel title="Detailed comparison" description="Scroll horizontally on smaller screens.">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Benefit
                    </th>
                    {membershipPlans.map((p) => (
                      <th key={p.id} className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row) => (
                    <tr key={row.label} className="border-b border-border/70 last:border-0">
                      <th scope="row" className="px-3 py-3 text-left font-medium">
                        {row.label}
                      </th>
                      {row.values.map((v, i) => (
                        <td key={i} className="px-3 py-3 text-center text-muted-foreground">
                          <Cell value={v} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Panel title="Frequently asked questions">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem key={f.q} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-sm">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Panel>
          <Panel title="Need help choosing?">
            <p className="text-sm text-muted-foreground">
              The membership desk can review your sector, region and enquiry volume and recommend a tier.
            </p>
            <div className="mt-4 grid gap-2">
              <Button asChild>
                <Link href="/register-business">List my business</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contact">Contact membership desk</Link>
              </Button>
            </div>
          </Panel>
        </div>
      </div>
    </PublicLayout>
  );
}


export { MembershipPage };
export default MembershipPage;
