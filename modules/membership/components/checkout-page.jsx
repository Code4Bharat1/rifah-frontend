"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, CreditCard, Landmark, Lock, Smartphone, Loader2 } from "lucide-react";
import { useState } from "react";

import { PublicLayout } from "@shared/components/rifah/public-layout";
import { Panel, SectionHeader, Steps } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Checkbox } from "@shared/components/ui/checkbox";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@shared/components/ui/radio-group";
import { useMembershipPlans, useMyBusiness } from "@shared/hooks/use-rifah-api";
import { membershipApi, paymentApi } from "@shared/lib/api-services";
import { cn } from "@shared/lib/utils";

const steps = ["Plan", "Billing", "Payment", "Confirmation"];

const methods = [
  { id: "razorpay", label: "Razorpay Secure Gateway", note: "UPI, Cards, Netbanking, Wallets", icon: Smartphone },
];

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function Checkout() {
  const searchParams = useSearchParams();
  const planParam = searchParams?.get("plan") || "premium";

  const { data: business } = useMyBusiness();
  const { data: plansData } = useMembershipPlans();
  const plans = plansData 
    ? Object.entries(plansData)
        .map(([id, p]) => ({ id, ...p }))
        .filter(p => p.price > 0)
    : [];

  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(planParam);
  const [method, setMethod] = useState("razorpay");
  const [loading, setLoading] = useState(false);
  const [invoiceId, setInvoiceId] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [legalName, setLegalName] = useState("");

  const active = plans.find((p) => p.id === selected) || plans[0] || {
    id: "premium",
    name: "Premium",
    price: 12999,
  };

  const handleConfirmAndPay = async () => {
    // Check if user is logged in
    const token = typeof window !== "undefined" ? localStorage.getItem("rifah_access_token") : null;
    if (!token) {
      alert("Please log in to upgrade your membership.");
      window.location.href = `/login?redirect=/membership/checkout?plan=${selected}`;
      return;
    }

    setLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load Razorpay SDK. Please check your internet connection.");
        setLoading(false);
        return;
      }

      // Step 1: Create Razorpay Order
      const orderRes = await paymentApi.createOrder({
        amount: active.price,
        planId: selected,
        itemType: "Membership",
        description: `${active.name} Membership Subscription`,
      });

      const orderData = orderRes?.data || orderRes;
      if (!orderData?.orderId) {
        throw new Error(orderRes?.message || "Could not create payment order");
      }

      // Step 2: Open Razorpay Payment Gateway Modal
      const options = {
        key: orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TTykh9OVkLKNHl",
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "RIFAH Chamber of Commerce",
        description: `${active.name} Membership Subscription`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            setLoading(true);
            // Step 3: Verify Payment & Upgrade Membership on Backend
            const verifyRes = await paymentApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: selected,
              businessId: business?._id,
              amount: active.price,
              itemType: "Membership",
              description: `${active.name} Membership Subscription`,
              billingEmail: billingEmail || business?.email || "",
              businessName: legalName || business?.name || "",
            });

            const resultData = verifyRes?.data || verifyRes;
            const invoiceNum = resultData?.payment?.invoiceNumber || orderData.invoiceNumber || `INV-${Date.now().toString().slice(-4)}`;
            setInvoiceId(invoiceNum);
            setStep(3);
          } catch (err) {
            console.error("Verification error:", err);
            alert(err.message || "Payment verification failed.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: legalName || business?.name || "",
          email: billingEmail || business?.email || "",
        },
        theme: {
          color: "#0F2942",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp) {
        alert(resp.error?.description || "Payment failed.");
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      console.error("Checkout error:", err);
      if (err.status === 401 || err.message?.includes("Authentication token")) {
        alert("Your session has expired. Please log in to complete your membership upgrade.");
        window.location.href = `/login?redirect=/membership/checkout?plan=${selected}`;
      } else {
        alert(err.message || "Failed to process plan checkout. Ensure you are signed in as a business owner.");
      }
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="rifah-container py-6 sm:py-10">
        <div className="mx-auto max-w-3xl">
          <SectionHeader
            title="Membership checkout"
            description="Upgrade or activate your RIFAH Chamber of Commerce subscription."
          />
          <div className="mt-5">
            <Steps steps={steps} current={step} />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-4">
              {step === 0 && (
                <Panel title="Select membership tier">
                  <RadioGroup value={selected} onValueChange={setSelected} className="space-y-2.5">
                    {plans.map((p) => (
                      <label
                        key={p.id}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                          selected === p.id ? "border-primary bg-primary-soft" : "border-border hover:bg-muted/60"
                        )}
                      >
                        <RadioGroupItem value={p.id} className="mt-0.5" />
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-baseline justify-between gap-2">
                            <span className="text-sm font-semibold">{p.name}</span>
                            <span className="text-sm font-semibold">
                              ₹ {p.price?.toLocaleString("en-IN")} / year
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
                      <Input
                        id="legal"
                        value={legalName}
                        onChange={(e) => setLegalName(e.target.value)}
                        placeholder="As per registration certificate"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="gst">GST / Tax registration number</Label>
                      <Input id="gst" placeholder="27AAAAA0000A1Z5" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="bemail">Billing email</Label>
                      <Input
                        id="bemail"
                        type="email"
                        value={billingEmail}
                        onChange={(e) => setBillingEmail(e.target.value)}
                        placeholder="rs9940806@gmail.com"
                      />
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
                      <Input id="bpin" placeholder="PIN code" />
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
                          method === m.id ? "border-primary bg-primary-soft" : "border-border hover:bg-muted/60"
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
                        <Input id="cardno" inputMode="numeric" placeholder="4111 2222 3333 4444" />
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
                    <Lock className="h-3.5 w-3.5" /> 256-bit encrypted chamber payment gateway.
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
                      Invoice {invoiceId || "INV-4821"} has been generated. Your business profile now reflects the {active.name} tier and priority lead routing rules apply from today.
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
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      if (step === 0) window.location.href = "/membership";
                      else setStep((s) => s - 1);
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    size="lg"
                    className="sm:min-w-48"
                    disabled={loading}
                    onClick={() => {
                      if (step === 2) handleConfirmAndPay();
                      else setStep((s) => s + 1);
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                      </>
                    ) : step === 2 ? (
                      "Confirm and pay"
                    ) : (
                      "Continue"
                    )}
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
                    <dd className="font-medium">1 Year</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd className="font-medium">₹ {active.price?.toLocaleString("en-IN")}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-border pt-2.5">
                    <dt className="font-semibold">Total</dt>
                    <dd className="font-bold">₹ {active.price?.toLocaleString("en-IN")}</dd>
                  </div>
                </dl>
                <ul className="mt-4 space-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
                  {active.features?.map((f, i) => (
                    <li key={i}>• {f}</li>
                  ))}
                </ul>
              </Panel>
            </aside>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

export { Checkout as CheckoutPage };
export default Checkout;
