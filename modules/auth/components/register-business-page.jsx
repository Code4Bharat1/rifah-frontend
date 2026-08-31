"use client";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Upload } from "lucide-react";
import { useState } from "react";

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
import { chapters, cities, industries, membershipPlans } from "@shared/lib/mock-data";
import { cn } from "@shared/lib/utils";

const steps = ["Business", "Contact", "Catalogue", "Documents", "Membership"];

const docs = [
  "Business registration certificate",
  "Tax registration document",
  "Authorised signatory ID",
  "Chamber declaration form",
];

function RegisterBusiness() {
  const [step, setStep] = useState(0);
  const [tier, setTier] = useState("premium");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <PublicLayout>
        <div className="rifah-container flex min-h-[70vh] items-center justify-center py-10">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-warning-soft text-warning">
              <ShieldCheck className="h-7 w-7" />
            </span>
            <h1 className="mt-4 text-xl font-bold tracking-tight">Submitted for RIFAH verification</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Application REG-1188 is now with the secretariat. Verification usually completes within a few working days.
              You can already prepare your catalogue in the business workspace — the listing goes public once approved.
            </p>
            <ol className="mt-5 space-y-2 text-left text-sm">
              {["Application received", "Document review by secretariat", "Verification decision", "Listing published"].map(
                (s, i) => (
                  <li key={s} className="flex items-center gap-2.5 rounded-xl border border-border p-3">
                    <span
                      className={cn(
                        "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold",
                        i === 0 ? "bg-success text-primary-foreground" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {i === 0 ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                    </span>
                    <span className={i === 0 ? "font-medium" : "text-muted-foreground"}>{s}</span>
                  </li>
                ),
              )}
            </ol>
            <div className="mt-6 grid gap-2">
              <Button asChild>
                <Link href="/biz">Open business workspace</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/discover">Browse the directory</Link>
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
            title="List your business with RIFAH"
            description="Five short steps. Verification by the chamber secretariat happens after submission."
          />
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
              <Panel title="Business details">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="bname">Business name</Label>
                    <Input id="bname" required placeholder="Registered name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="btype">Business type</Label>
                    <Select>
                      <SelectTrigger id="btype">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Proprietorship", "Partnership", "LLP", "Private Limited", "Public Limited"].map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bind">Industry</Label>
                    <Select>
                      <SelectTrigger id="bind">
                        <SelectValue placeholder="Select" />
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
                    <Label htmlFor="byear">Year established</Label>
                    <Input id="byear" inputMode="numeric" placeholder="e.g. 2014" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bemp">Team size</Label>
                    <Select>
                      <SelectTrigger id="bemp">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {["1–10", "11–50", "51–200", "200+"].map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="babout">About the business</Label>
                    <Textarea id="babout" rows={4} placeholder="Capabilities, sectors served, differentiators." />
                  </div>
                </div>
              </Panel>
            )}

            {step === 1 && (
              <Panel title="Contact & location">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="cperson">Contact person</Label>
                    <Input id="cperson" placeholder="Authorised representative" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cdesig">Designation</Label>
                    <Input id="cdesig" placeholder="e.g. Director" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bphone">Phone</Label>
                    <Input id="bphone" type="tel" placeholder="Business number" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bmail">Email</Label>
                    <Input id="bmail" type="email" placeholder="info@example.com" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="baddress">Address</Label>
                    <Input id="baddress" placeholder="Street, area" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bcity">City</Label>
                    <Select>
                      <SelectTrigger id="bcity">
                        <SelectValue placeholder="Select" />
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
                  <div className="space-y-1.5">
                    <Label htmlFor="bchapter">RIFAH chapter</Label>
                    <Select>
                      <SelectTrigger id="bchapter">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {chapters.map((c) => (
                          <SelectItem key={c.name} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Panel>
            )}

            {step === 2 && (
              <Panel title="First catalogue entries" description="You can add more later in the workspace.">
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="grid gap-3 rounded-xl border border-border p-3 sm:grid-cols-[minmax(0,1fr)_140px]">
                      <div className="space-y-1.5">
                        <Label htmlFor={`item-${n}`}>Item {n}</Label>
                        <Input id={`item-${n}`} placeholder="Product or service name" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`type-${n}`}>Type</Label>
                        <Select>
                          <SelectTrigger id={`type-${n}`}>
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Product">Product</SelectItem>
                            <SelectItem value="Service">Service</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {step === 3 && (
              <Panel title="Verification documents" description="Reviewed by the RIFAH secretariat before publishing.">
                <ul className="space-y-2.5">
                  {docs.map((d) => (
                    <li
                      key={d}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border p-3"
                    >
                      <span className="min-w-0 text-sm font-medium">{d}</span>
                      <Button type="button" variant="outline" size="sm" className="shrink-0">
                        <Upload className="h-4 w-4" /> Upload
                      </Button>
                    </li>
                  ))}
                </ul>
                <label className="mt-4 flex items-start gap-2.5 text-sm">
                  <Checkbox required className="mt-0.5" />
                  <span>I confirm the uploaded documents are accurate and belong to this business.</span>
                </label>
              </Panel>
            )}

            {step === 4 && (
              <Panel title="Choose a membership tier">
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {membershipPlans.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setTier(p.id)}
                      aria-pressed={tier === p.id}
                      className={cn(
                        "rounded-xl border p-4 text-left transition-colors",
                        tier === p.id ? "border-primary bg-primary-soft" : "border-border hover:bg-muted/60",
                      )}
                    >
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-semibold">{p.name}</span>
                        <span className="text-sm font-semibold">{p.price}</span>
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">{p.summary}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Paid tiers move to checkout after verification is approved. The free listing publishes immediately once
                  approved.
                </p>
              </Panel>
            )}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
              {step === 0 ? (
                <Button asChild type="button" variant="ghost">
                  <Link href="/">Cancel</Link>
                </Button>
              ) : (
                <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}>
                  Back
                </Button>
              )}
              <Button type="submit" size="lg" className="sm:min-w-52">
                {step === steps.length - 1 ? "Submit for verification" : "Continue"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PublicLayout>
  );
}


const RegisterBusinessPage = RegisterBusiness;

export { RegisterBusinessPage };
export default RegisterBusinessPage;
