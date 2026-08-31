"use client";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Upload, Loader2, AlertCircle } from "lucide-react";
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
import { cities, industries } from "@shared/lib/mock-data";
import { useChapters, useMembershipPlans } from "@shared/hooks/use-rifah-api";
import { useAuth } from "@shared/providers/auth-provider";
import { cn } from "@shared/lib/utils";

const steps = ["Business", "Contact", "Account", "Membership"];

function RegisterBusiness() {
  const { registerBusiness } = useAuth();
  const { data: chaptersData } = useChapters();
  const { data: plansData } = useMembershipPlans();

  const chapters = chaptersData || [];
  const plans = plansData ? Object.entries(plansData).map(([id, p]) => ({ id, ...p })) : [];

  const [step, setStep] = useState(0);
  const [tier, setTier] = useState("premium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "Proprietorship",
    industry: "Manufacturing",
    founded: "2018",
    employees: "11–50",
    about: "",
    contactPerson: "",
    phone: "",
    email: "",
    password: "",
    address: "",
    city: "Mumbai",
    chapter: "Mumbai Chapter",
  });

  const handleFinalSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      await registerBusiness({
        name: formData.contactPerson || formData.businessName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        businessName: formData.businessName,
        industry: formData.industry,
        businessType: formData.businessType,
        city: formData.city,
        state: "Maharashtra",
        address: formData.address,
        chapter: formData.chapter,
        membership: tier,
        about: formData.about,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Failed to complete registration. Please check fields.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <PublicLayout>
        <div className="rifah-container flex min-h-[70vh] items-center justify-center py-10">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-warning-soft text-warning">
              <ShieldCheck className="h-7 w-7" />
            </span>
            <h1 className="mt-4 text-xl font-bold tracking-tight">Business Registered Successfully</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your business profile has been created and submitted for RIFAH secretariat verification.
              You can now access your workspace to manage catalogue items and upload documents.
            </p>
            <ol className="mt-5 space-y-2 text-left text-sm">
              {["Application received", "Document review by secretariat", "Verification decision", "Listing published"].map(
                (s, i) => (
                  <li key={s} className="flex items-center gap-2.5 rounded-xl border border-border p-3">
                    <span
                      className={cn(
                        "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold",
                        i === 0 ? "bg-success text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {i === 0 ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                    </span>
                    <span className={i === 0 ? "font-medium" : "text-muted-foreground"}>{s}</span>
                  </li>
                )
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
            description="Four short steps. Join the chamber network to receive verified buyer leads."
          />
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
              <Panel title="Business details">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="bname">Business name *</Label>
                    <Input
                      id="bname"
                      required
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      placeholder="Registered enterprise name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="btype">Business type</Label>
                    <Select
                      value={formData.businessType}
                      onValueChange={(v) => setFormData({ ...formData, businessType: v })}
                    >
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
                    <Select
                      value={formData.industry}
                      onValueChange={(v) => setFormData({ ...formData, industry: v })}
                    >
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
                    <Input
                      id="byear"
                      inputMode="numeric"
                      value={formData.founded}
                      onChange={(e) => setFormData({ ...formData, founded: e.target.value })}
                      placeholder="e.g. 2014"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bemp">Team size</Label>
                    <Select
                      value={formData.employees}
                      onValueChange={(v) => setFormData({ ...formData, employees: v })}
                    >
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
                    <Textarea
                      id="babout"
                      rows={3}
                      value={formData.about}
                      onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                      placeholder="Capabilities, products manufactured, sectors served."
                    />
                  </div>
                </div>
              </Panel>
            )}

            {step === 1 && (
              <Panel title="Contact & location">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="cperson">Contact person *</Label>
                    <Input
                      id="cperson"
                      required
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      placeholder="Authorised representative"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bphone">Phone *</Label>
                    <Input
                      id="bphone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Mobile number"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="baddress">Address</Label>
                    <Input
                      id="baddress"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Street, area"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bcity">City</Label>
                    <Select
                      value={formData.city}
                      onValueChange={(v) => setFormData({ ...formData, city: v })}
                    >
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
                    <Select
                      value={formData.chapter}
                      onValueChange={(v) => setFormData({ ...formData, chapter: v })}
                    >
                      <SelectTrigger id="bchapter">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {chapters.map((c) => (
                          <SelectItem key={c._id || c.name} value={c.name}>
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
              <Panel title="Owner Login Account">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-email">Account Email *</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="owner@company.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-pass">Account Password *</Label>
                    <Input
                      id="reg-pass"
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Minimum 6 characters"
                    />
                  </div>
                </div>
              </Panel>
            )}

            {step === 3 && (
              <Panel title="Choose a membership tier">
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {plans.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setTier(p.id)}
                      aria-pressed={tier === p.id}
                      className={cn(
                        "rounded-xl border p-4 text-left transition-colors",
                        tier === p.id ? "border-primary bg-primary-soft" : "border-border hover:bg-muted/60"
                      )}
                    >
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-semibold">{p.name}</span>
                        <span className="text-sm font-semibold">₹ {p.price?.toLocaleString("en-IN")}</span>
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">{p.summary}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  The listing is activated in the directory upon secretariat review.
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
              <Button type="submit" size="lg" className="sm:min-w-52" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : step === steps.length - 1 ? (
                  "Complete registration"
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

export { RegisterBusiness as RegisterBusinessPage };
export default RegisterBusiness;
