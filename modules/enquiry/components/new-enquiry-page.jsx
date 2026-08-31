"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Info, Send, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";

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
import { cities, industries } from "@shared/lib/mock-data";
import { useBusinessDetail } from "@shared/hooks/use-rifah-api";
import { enquiryApi } from "@shared/lib/api-services";
import { useAuth } from "@shared/providers/auth-provider";

const steps = ["Requirement", "Details", "Contact", "Review"];

function NewEnquiry() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessParam = searchParams?.get("business") || "";
  const categoryParam = searchParams?.get("category") || "";

  const { user } = useAuth();
  const { data: targetBusiness } = useBusinessDetail(businessParam !== "custom" ? businessParam : "");

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdEnquiry, setCreatedEnquiry] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    category: categoryParam || "Manufacturing",
    description: "",
    quantity: "100 Units",
    budget: "",
    requiredBy: "",
    city: "Mumbai",
    buyerName: user?.name || "",
    buyerEmail: user?.email || "",
    buyerPhone: user?.phone || "",
    buyerOrg: user?.organization || "",
  });

  const handleFinalSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await enquiryApi.create({
        title: formData.title,
        category: formData.category,
        description: formData.description,
        quantity: formData.quantity,
        budget: formData.budget,
        requiredBy: formData.requiredBy ? new Date(formData.requiredBy) : undefined,
        city: formData.city,
        buyerName: formData.buyerName || user?.name || "Buyer",
        buyerEmail: formData.buyerEmail || user?.email || "buyer@example.com",
        buyerPhone: formData.buyerPhone,
        targetBusinessId: targetBusiness?._id || undefined,
      });
      setCreatedEnquiry(res?.data);
    } catch (err) {
      setError(err.message || "Failed to submit enquiry. Please ensure all required fields are filled.");
    } finally {
      setLoading(false);
    }
  };

  if (createdEnquiry) {
    return (
      <PublicLayout>
        <div className="rifah-container flex min-h-[70vh] items-center justify-center py-10">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success-soft text-success">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <h1 className="mt-4 text-xl font-bold tracking-tight">Enquiry submitted</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your sourcing requirement has been recorded in the chamber network. Matched verified members will review and quote.
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

          {targetBusiness && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary-soft p-4">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0 text-sm">
                <p className="font-semibold">Directed to {targetBusiness.name}</p>
                <p className="mt-0.5 text-muted-foreground">
                  {targetBusiness.industry} · {targetBusiness.city}
                </p>
                <div className="mt-1.5">
                  <VerificationBadge status={targetBusiness.verification} compact />
                </div>
              </div>
            </div>
          )}

          <div className="mt-5">
            <Steps steps={steps} current={step} />
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form
            className="mt-5 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (step < steps.length - 1) {
                setStep((s) => s + 1);
              } else {
                handleFinalSubmit();
              }
            }}
          >
            {step === 0 && (
              <Panel title="What do you need?">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="title">Requirement title *</Label>
                    <Input
                      id="title"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Machined brackets for assembly line"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => setFormData({ ...formData, category: v })}
                    >
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
                    <Label htmlFor="description">Requirement description *</Label>
                    <Textarea
                      id="description"
                      rows={5}
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Specifications, volume, tolerances, quality expectations, delivery terms."
                    />
                  </div>
                </div>
              </Panel>
            )}

            {step === 1 && (
              <Panel title="Quantity, budget and timeline">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="qty">Quantity / volume *</Label>
                    <Input
                      id="qty"
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="e.g. 5,000 units"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="budget">Indicative budget</Label>
                    <Input
                      id="budget"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      placeholder="e.g. ₹ 2,50,000"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="by">Required by date</Label>
                    <Input
                      id="by"
                      type="date"
                      value={formData.requiredBy}
                      onChange={(e) => setFormData({ ...formData, requiredBy: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="loc">Delivery location</Label>
                    <Select
                      value={formData.city}
                      onValueChange={(v) => setFormData({ ...formData, city: v })}
                    >
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
                </div>
              </Panel>
            )}

            {step === 2 && (
              <Panel title="Contact Information">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full name *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.buyerName}
                      onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="org">Organisation</Label>
                    <Input
                      id="org"
                      value={formData.buyerOrg}
                      onChange={(e) => setFormData({ ...formData, buyerOrg: e.target.value })}
                      placeholder="Company name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.buyerEmail}
                      onChange={(e) => setFormData({ ...formData, buyerEmail: e.target.value })}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.buyerPhone}
                      onChange={(e) => setFormData({ ...formData, buyerPhone: e.target.value })}
                      placeholder="Mobile number"
                    />
                  </div>
                </div>
              </Panel>
            )}

            {step === 3 && (
              <Panel title="Review and submit">
                <dl className="divide-y divide-border text-sm">
                  {[
                    ["Requirement", formData.title],
                    ["Category", formData.category],
                    ["Quantity", formData.quantity],
                    ["Budget", formData.budget || "Not specified"],
                    ["Delivery location", formData.city],
                    ["Directed to", targetBusiness ? targetBusiness.name : "All matching members"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-3 py-2.5">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="text-right font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
                <label className="mt-4 flex items-start gap-2.5 text-sm">
                  <Checkbox required defaultChecked className="mt-0.5" />
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
              <Button type="submit" size="lg" className="sm:min-w-48" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : step === steps.length - 1 ? (
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

export { NewEnquiry as NewEnquiryPage };
export default NewEnquiry;
