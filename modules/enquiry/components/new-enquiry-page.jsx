"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Info, Send } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { VerificationBadge } from "@shared/components/rifah/badges";
import { PublicLayout } from "@shared/components/rifah/public-layout";
import { Panel, SectionHeader, Steps } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Checkbox } from "@shared/components/ui/checkbox";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import { Textarea } from "@shared/components/ui/textarea";
import { cities, getBusiness, industries } from "@shared/lib/mock-data";

const searchSchema = z.object({
  business: z.string().optional(),
});

const steps = ["Requirement", "Details", "Contact", "Review"];

function NewEnquiry() {
  const { business } = Object.fromEntries(useSearchParams() ? useSearchParams().entries() : []);
  const router = useRouter();
  const target = business ? getBusiness(business) : undefined;
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <PublicLayout>
        <div className="rifah-container flex min-h-[70vh] items-center justify-center py-10">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success-soft text-success">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <h1 className="mt-4 text-xl font-bold tracking-tight">Enquiry submitted</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Reference <span className="font-semibold text-foreground">ENQ-2058</span> has been created. RIFAH will route
              it to matching verified members{target ? ` including ${target.name}` : ""}. Responses appear in your
              enquiry inbox.
            </p>
            <div className="mt-6 grid gap-2">
              <Button asChild>
                <Link href="/me/enquiries">Track my enquiries</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/discover">Keep browsing the directory</Link>
              </Button>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="rifah-container py-6 sm:py-10">
        <div className="mx-auto max-w-2xl">
          <SectionHeader
            title="Post a sourcing enquiry"
            description="RIFAH matches your requirement to member businesses by category, capability and region."
          />

          {target && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary-soft p-4">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0 text-sm">
                <p className="font-semibold">Directed to {target.name}</p>
                <p className="mt-0.5 text-muted-foreground">
                  {target.industry} · {target.city}
                </p>
                <div className="mt-1.5">
                  <VerificationBadge status={target.verification} compact />
                </div>
              </div>
            </div>
          )}

          <div className="mt-5">
            <Steps steps={steps} current={step} />
          </div>

          <form
            className="mt-5 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (step < steps.length - 1) setStep((s) => s + 1);
              else setSubmitted(true);
            }}
          >
            {step === 0 && (
              <Panel title="What do you need?">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="title">Requirement title</Label>
                    <Input id="title" placeholder="e.g. Machined brackets for assembly line" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((i) => (
                          <SelectItem key={i} value={i}>
                            {i}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="description">Requirement description</Label>
                    <Textarea
                      id="description"
                      rows={5}
                      placeholder="Specifications, drawings availability, quality expectations, delivery terms."
                    />
                    <p className="text-xs text-muted-foreground">
                      Clear specifications get faster and more comparable responses.
                    </p>
                  </div>
                </div>
              </Panel>
            )}

            {step === 1 && (
              <Panel title="Quantity, budget and timeline">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="qty">Quantity / volume</Label>
                    <Input id="qty" placeholder="e.g. 5,000 units" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="budget">Indicative budget</Label>
                    <Input id="budget" placeholder="Optional" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="by">Required by</Label>
                    <Input id="by" type="date" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="loc">Delivery location</Label>
                    <Select>
                      <SelectTrigger id="loc">
                        <SelectValue placeholder="Select a city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="file">Attachments</Label>
                    <div className="grid h-24 place-items-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">
                      Drop drawings or specification files here (prototype placeholder)
                    </div>
                  </div>
                </div>
              </Panel>
            )}

            {step === 2 && (
              <Panel title="How should members reach you?">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" placeholder="Your name" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="org">Organisation</Label>
                    <Input id="org" placeholder="Company name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="tel" placeholder="Mobile number" />
                  </div>
                  <div className="sm:col-span-2 space-y-3 rounded-xl border border-border p-3">
                    <label className="flex items-start gap-2.5 text-sm">
                      <Checkbox defaultChecked className="mt-0.5" />
                      <span>
                        Share my contact details with matched member businesses only.
                      </span>
                    </label>
                    <label className="flex items-start gap-2.5 text-sm">
                      <Checkbox className="mt-0.5" />
                      <span>Also list this enquiry on the open RIFAH lead board.</span>
                    </label>
                  </div>
                </div>
              </Panel>
            )}

            {step === 3 && (
              <Panel title="Review and submit" description="Prototype summary — field values are illustrative.">
                <dl className="divide-y divide-border text-sm">
                  {[
                    ["Requirement", "Machined brackets for assembly line"],
                    ["Category", "Precision Engineering"],
                    ["Quantity", "5,000 units"],
                    ["Required by", "30 Oct 2026"],
                    ["Delivery location", "Mumbai"],
                    ["Directed to", target ? target.name : "All matching members"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-3 py-2.5">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="text-right font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
                <label className="mt-4 flex items-start gap-2.5 text-sm">
                  <Checkbox required className="mt-0.5" />
                  <span>
                    I confirm this enquiry is genuine and agree to the RIFAH Connect enquiry guidelines.
                  </span>
                </label>
              </Panel>
            )}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => (step === 0 ? router.push("/discover") : setStep((s) => s - 1))}
              >
                {step === 0 ? "Cancel" : "Back"}
              </Button>
              <Button type="submit" size="lg" className="sm:min-w-48">
                {step === steps.length - 1 ? (
                  <>
                    <Send className="h-4 w-4" /> Submit enquiry
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PublicLayout>
  );
}


const NewEnquiryPage = NewEnquiry;

export { NewEnquiryPage };
export default NewEnquiryPage;
