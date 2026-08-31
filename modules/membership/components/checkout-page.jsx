"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, CreditCard, Landmark, Lock, Smartphone } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { PublicLayout } from "@shared/components/rifah/public-layout";
import { Panel, SectionHeader, Steps } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Checkbox } from "@shared/components/ui/checkbox";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@shared/components/ui/radio-group";
import { membershipPlans } from "@shared/lib/mock-data";
import { cn } from "@shared/lib/utils";

const searchSchema = z.object({
  plan: z.string().optional().default("premium"),
});

const steps = ["Plan", "Billing", "Payment", "Confirmation"];

const methods = [
  { id: "card", label: "Card", note: "Visa, Mastercard, RuPay", icon: CreditCard },
  { id: "upi", label: "UPI", note: "Pay from any UPI app", icon: Smartphone },
  { id: "bank", label: "Bank transfer", note: "NEFT / RTGS with reference", icon: Landmark },
];

function Checkout() {
  const { plan } = Object.fromEntries(useSearchParams() ? useSearchParams().entries() : []);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(plan);
  const [method, setMethod] = useState("card");
  const active = membershipPlans.find((p) => p.id === selected) ?? membershipPlans[2];

  return (
    <PublicLayout>
      <div className="rifah-container py-6 sm:py-10">
        <div className="mx-auto max-w-3xl">
          <SectionHeader
            title="Membership checkout"
            description="Prototype flow — no payment is processed and all amounts are placeholders."
          />
          <div className="mt-5">
            <Steps steps={steps} current={step} />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-4">
              {step === 0 && (
                <Panel title="Select membership tier">
                  <RadioGroup value={selected} onValueChange={setSelected} className="space-y-2.5">
                    {membershipPlans.map((p) => (
                      <label
                        key={p.id}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                          selected === p.id ? "border-primary bg-primary-soft" : "border-border hover:bg-muted/60",
                        )}
                      >
                        <RadioGroupItem value={p.id} className="mt-0.5" />
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-baseline justify-between gap-2">
                            <span className="text-sm font-semibold">{p.name}</span>
                            <span className="text-sm font-semibold">
                              {p.price}
                              {p.period && (
                                <span className="ml-1 text-xs font-normal text-muted-foreground">{p.period}</span>
                              )}
                            </span>
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">{p.summary}</span>
                        </span>
                      </label>
                    ))}
                  </RadioGroup>
                </Panel>
              )}

              {step === 1 && (
                <Panel title="Billing details">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="legal">Registered business name</Label>
                      <Input id="legal" placeholder="As per registration certificate" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="gst">Tax registration number</Label>
                      <Input id="gst" placeholder="Optional" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="bemail">Billing email</Label>
                      <Input id="bemail" type="email" placeholder="accounts@example.com" />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="baddr">Billing address</Label>
                      <Input id="baddr" placeholder="Street, area" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="bcity">City</Label>
                      <Input id="bcity" placeholder="City" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="bpin">Postal code</Label>
                      <Input id="bpin" placeholder="PIN" />
                    </div>
                  </div>
                </Panel>
              )}

              {step === 2 && (
                <Panel title="Payment method">
                  <RadioGroup value={method} onValueChange={setMethod} className="space-y-2.5">
                    {methods.map((m) => (
                      <label
                        key={m.id}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors",
                          method === m.id ? "border-primary bg-primary-soft" : "border-border hover:bg-muted/60",
                        )}
                      >
                        <RadioGroupItem value={m.id} />
                        <m.icon className="h-4 w-4 shrink-0 text-primary" />
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold">{m.label}</span>
                          <span className="block text-xs text-muted-foreground">{m.note}</span>
                        </span>
                      </label>
                    ))}
                  </RadioGroup>

                  {method === "card" && (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor="cardno">Card number</Label>
                        <Input id="cardno" inputMode="numeric" placeholder="0000 0000 0000 0000" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="exp">Expiry</Label>
                        <Input id="exp" placeholder="MM / YY" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" inputMode="numeric" placeholder="123" />
                      </div>
                    </div>
                  )}

                  <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="h-3.5 w-3.5" /> Prototype only — no card data is captured or transmitted.
                  </p>
                  <label className="mt-3 flex items-start gap-2.5 text-sm">
                    <Checkbox className="mt-0.5" defaultChecked />
                    <span>Enable annual auto-renewal reminders from the RIFAH membership desk.</span>
                  </label>
                </Panel>
              )}

              {step === 3 && (
                <Panel title="Membership confirmed">
                  <div className="text-center sm:text-left">
                    <span className="inline-grid h-12 w-12 place-items-center rounded-full bg-success-soft text-success">
                      <CheckCircle2 className="h-6 w-6" />
                    </span>
                    <h2 className="mt-3 text-lg font-bold tracking-tight">
                      {active.name} membership activated
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Invoice INV-4821 has been generated. Your business profile now reflects the {active.name} tier and
                      priority lead routing rules apply from today.
                    </p>
                    <div className="mt-5 grid gap-2 sm:max-w-xs">
                      <Button asChild>
                        <Link href="/biz">Go to business dashboard</Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href="/biz/membership">View membership & invoices</Link>
                      </Button>
                    </div>
                  </div>
                </Panel>
              )}

              {step < 3 && (
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                  <Button asChild variant="ghost">
                    {step === 0 ? <Link href="/membership">Back to plans</Link> : <button onClick={() => setStep((s) => s - 1)}>Back</button>}
                  </Button>
                  <Button size="lg" className="sm:min-w-48" onClick={() => setStep((s) => s + 1)}>
                    {step === 2 ? "Confirm and pay" : "Continue"}
                  </Button>
                </div>
              )}
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <Panel title="Order summary">
                <dl className="space-y-2.5 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Plan</dt>
                    <dd className="font-semibold">{active.name}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Term</dt>
                    <dd className="font-medium">{active.period || "One-time"}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd className="font-medium">{active.price}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Tax</dt>
                    <dd className="font-medium">As applicable</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-border pt-2.5">
                    <dt className="font-semibold">Total</dt>
                    <dd className="font-bold">{active.price}</dd>
                  </div>
                </dl>
                <ul className="mt-4 space-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
                  <li>{active.visibility}</li>
                  <li>{active.products}</li>
                  <li>{active.leads}</li>
                </ul>
              </Panel>
            </aside>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}


const CheckoutPage = Checkout;

export { CheckoutPage };
export default CheckoutPage;
