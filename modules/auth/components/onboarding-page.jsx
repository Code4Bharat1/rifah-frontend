"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UserRound,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  FileText,
  MapPin,
  Briefcase,
  CreditCard,
} from "lucide-react";

import { RifahLogo } from "@shared/components/rifah/brand";
import { PublicLayout } from "@shared/components/rifah/public-layout";
import { Panel, Steps } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Textarea } from "@shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import { cities, industries } from "@shared/lib/mock-data";
import { useAuth } from "@shared/providers/auth-provider";
import { useChapters, useMembershipPlans } from "@shared/hooks/use-rifah-api";
import { cn } from "@shared/lib/utils";

const businessSteps = ["Business", "Contact", "Account", "Tax & Verification", "Membership"];

export function OnboardingPage() {
  const router = useRouter();
  const { user, completeOnboarding, loading: authLoading } = useAuth();
  const { data: chaptersData } = useChapters();
  const { data: plansData } = useMembershipPlans();

  const chapters = chaptersData || [];
  const plans = plansData ? Object.entries(plansData).map(([id, p]) => ({ id, ...p })) : [];

  // Account Type Choice: "choice", "customer", or "business_owner"
  const [role, setRole] = useState("business_owner");
  const [step, setStep] = useState(0); // For business 5-stage wizard

  // Shared / Buyer fields
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerCity, setBuyerCity] = useState("Mumbai");
  const [buyerChapter, setBuyerChapter] = useState("Mumbai Chapter");
  const [buyerOrg, setBuyerOrg] = useState("");
  const [buyerSourcingInterest, setBuyerSourcingInterest] = useState("Manufacturing");
  const [buyerPassword, setBuyerPassword] = useState("");
  const [buyerConfirmPassword, setBuyerConfirmPassword] = useState("");

  // Business Owner 5-Stage Form Data
  const [bizData, setBizData] = useState({
    businessName: "",
    businessType: "Proprietorship",
    industry: "Manufacturing",
    founded: "2018",
    employees: "11–50",
    about: "",
    contactPerson: "",
    phone: "",
    address: "",
    city: "Mumbai",
    state: "Maharashtra",
    chapter: "Mumbai Chapter",
    taxId: "",
    panNumber: "",
    password: "",
    confirmPassword: "",
    membershipTier: "premium",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Pre-fill fields from Google User if available
  useEffect(() => {
    if (user) {
      if (user.name) {
        setBuyerName(user.name);
        setBizData((prev) => ({ ...prev, contactPerson: prev.contactPerson || user.name }));
      }
      if (user.phone) {
        setBuyerPhone(user.phone);
        setBizData((prev) => ({ ...prev, phone: prev.phone || user.phone }));
      }
      if (user.city) {
        setBuyerCity(user.city);
        setBizData((prev) => ({ ...prev, city: prev.city || user.city }));
      }
      if (user.chapter) {
        setBuyerChapter(user.chapter);
        setBizData((prev) => ({ ...prev, chapter: prev.chapter || user.chapter }));
      }
    }
  }, [user]);

  // Buyer Form Submit Handler
  const handleBuyerSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!buyerPhone || buyerPhone.trim().length < 5) {
      setError("Please provide a valid contact phone number.");
      return;
    }
    if (!buyerPassword || buyerPassword.length < 6) {
      setError("Account password must be at least 6 characters.");
      return;
    }
    if (buyerPassword !== buyerConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await completeOnboarding({
        role: "customer",
        contactPerson: buyerName,
        phone: buyerPhone,
        city: buyerCity,
        chapter: buyerChapter,
        organization: buyerOrg,
        sourcingInterest: buyerSourcingInterest,
        password: buyerPassword,
      });

      setSubmitted(true);
      setTimeout(() => {
        router.push("/me");
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to complete buyer setup. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Step Validation for Business 5-Stage Wizard
  const validateCurrentStep = () => {
    setError("");
    if (step === 0) {
      if (!bizData.businessName || bizData.businessName.trim().length < 2) {
        setError("Please enter your registered Business Name.");
        return false;
      }
    } else if (step === 1) {
      if (!bizData.phone || bizData.phone.trim().length < 5) {
        setError("Please enter a valid business contact phone number.");
        return false;
      }
    } else if (step === 2) {
      if (!bizData.password || bizData.password.length < 6) {
        setError("Password must be at least 6 characters.");
        return false;
      }
      if (bizData.password !== bizData.confirmPassword) {
        setError("Passwords do not match.");
        return false;
      }
    }
    return true;
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (validateCurrentStep()) {
      if (step < businessSteps.length - 1) {
        setStep((s) => s + 1);
      } else {
        handleFinalBusinessSubmit();
      }
    }
  };

  const handlePrevStep = () => {
    setError("");
    if (step > 0) setStep((s) => s - 1);
  };

  // Business Final Submit Handler
  const handleFinalBusinessSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      await completeOnboarding({
        role: "business_owner",
        businessName: bizData.businessName,
        businessType: bizData.businessType,
        industry: bizData.industry,
        founded: bizData.founded,
        employees: bizData.employees,
        about: bizData.about,
        contactPerson: bizData.contactPerson || user?.name || "",
        phone: bizData.phone,
        address: bizData.address,
        city: bizData.city,
        state: bizData.state || "Maharashtra",
        chapter: bizData.chapter,
        taxId: bizData.taxId,
        membershipTier: bizData.membershipTier,
        password: bizData.password,
      });

      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Failed to submit business registration. Please check fields.");
    } finally {
      setSubmitting(false);
    }
  };

  // Success Screen After Submission
  if (submitted) {
    return (
      <PublicLayout bare>
        <div className="min-h-screen bg-muted/20 py-12 px-4 flex items-center justify-center">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success-soft text-success">
              <CheckCircle2 className="h-9 w-9" />
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">
              {role === "business_owner" ? "Business Profile Registered!" : "Profile Setup Complete!"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {role === "business_owner"
                ? "Your enterprise profile has been registered and submitted for RIFAH Secretariat verification. You can now access your workspace, manage catalogue items, and respond to buyer leads."
                : "Your buyer account is now fully active. You can start exploring suppliers, posting RFQs, and requesting quotations."}
            </p>

            {role === "business_owner" && (
              <ol className="mt-6 space-y-2 text-left text-xs sm:text-sm">
                {[
                  "Application received & account activated",
                  "Document & GST review by Secretariat",
                  "Verified supplier badge assigned",
                  "Priority listing published in Directory",
                ].map((s, i) => (
                  <li key={s} className="flex items-center gap-2.5 rounded-xl border border-border p-3">
                    <span
                      className={cn(
                        "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold",
                        i === 0 ? "bg-success text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {i === 0 ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                    </span>
                    <span className={i === 0 ? "font-semibold text-foreground" : "text-muted-foreground"}>
                      {s}
                    </span>
                  </li>
                ))}
              </ol>
            )}

            <div className="mt-6 grid gap-2.5">
              <Button asChild size="lg" className="w-full font-semibold">
                <Link href={role === "business_owner" ? "/biz" : "/me"}>
                  {role === "business_owner" ? "Open Business Workspace" : "Go to Buyer Dashboard"}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link href="/discover">Browse RIFAH Directory</Link>
              </Button>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout bare>
      <div className="min-h-screen bg-muted/20 py-8 px-4 sm:py-12 sm:px-6">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="text-center">
            <div className="inline-block">
              <RifahLogo className="h-10" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              Complete Your RIFAH Onboarding
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Welcome to the RIFAH Chamber network. Finish setting up your account profile.
            </p>
          </div>

          {/* Account Role Selector Card */}
          <div className="mt-8 rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs">
            <Label className="text-sm font-semibold text-foreground">Select Account Type:</Label>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setRole("business_owner");
                  setError("");
                }}
                className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
                  role === "business_owner"
                    ? "border-primary bg-primary-soft/40 shadow-xs ring-2 ring-primary/20"
                    : "border-border bg-surface hover:border-primary/40 hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
                    <Building2 className="h-5 w-5" />
                  </span>
                  {role === "business_owner" && <CheckCircle2 className="h-5 w-5 text-primary" />}
                </div>
                <span className="mt-3 font-semibold text-sm text-foreground">Business Owner / Supplier</span>
                <span className="mt-1 text-xs text-muted-foreground">
                  List your enterprise in the directory, showcase products, and receive verified buyer RFQs.
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole("customer");
                  setError("");
                }}
                className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
                  role === "customer"
                    ? "border-primary bg-primary-soft/40 shadow-xs ring-2 ring-primary/20"
                    : "border-border bg-surface hover:border-primary/40 hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
                    <UserRound className="h-5 w-5" />
                  </span>
                  {role === "customer" && <CheckCircle2 className="h-5 w-5 text-primary" />}
                </div>
                <span className="mt-3 font-semibold text-sm text-foreground">Buyer / Sourcing</span>
                <span className="mt-1 text-xs text-muted-foreground">
                  Post requirements, source verified materials, and request supplier quotations.
                </span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ========================================================== */}
          {/* PATHWAY A: BUYER ONBOARDING (Fast 1-Screen Setup)           */}
          {/* ========================================================== */}
          {role === "customer" && (
            <form onSubmit={handleBuyerSubmit} className="mt-6 rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">Buyer Account Details</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Set up your sourcing profile to submit requirements to suppliers.
                </p>
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary-soft/30 p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm font-semibold text-foreground">Google Account Verified</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Logged in with: <span className="font-semibold text-foreground">{user?.email || "Google Account"}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="buyer-name">Full Name *</Label>
                  <Input
                    id="buyer-name"
                    required
                    placeholder="Your Full Name"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="buyer-phone">Phone Number *</Label>
                  <Input
                    id="buyer-phone"
                    type="tel"
                    required
                    placeholder="+91 98200 00000"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="buyer-sourcing">Primary Sourcing Interest</Label>
                <Select value={buyerSourcingInterest} onValueChange={setBuyerSourcingInterest}>
                  <SelectTrigger id="buyer-sourcing">
                    <SelectValue placeholder="Select primary industry you source from" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((ind) => (
                      <SelectItem key={ind} value={ind}>
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="buyer-city">City</Label>
                  <Select value={buyerCity} onValueChange={setBuyerCity}>
                    <SelectTrigger id="buyer-city">
                      <SelectValue placeholder="Select city" />
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
                  <Label htmlFor="buyer-chapter">RIFAH Chapter</Label>
                  <Select value={buyerChapter} onValueChange={setBuyerChapter}>
                    <SelectTrigger id="buyer-chapter">
                      <SelectValue placeholder="Select chapter" />
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

              <div className="space-y-1.5">
                <Label htmlFor="buyer-org">Organisation / Enterprise (Optional)</Label>
                <Input
                  id="buyer-org"
                  placeholder="e.g. Apex Trading Corp"
                  value={buyerOrg}
                  onChange={(e) => setBuyerOrg(e.target.value)}
                />
              </div>

              {/* Password Setup */}
              <div className="pt-4 border-t border-border space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Lock className="h-4 w-4 text-primary" /> Set Account Password
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Setting a password allows you to log in with your email & password or continue using Google OAuth anytime.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="buyer-pass">New Password *</Label>
                    <Input
                      id="buyer-pass"
                      type="password"
                      required
                      placeholder="Min 6 characters"
                      value={buyerPassword}
                      onChange={(e) => setBuyerPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="buyer-confirm-pass">Confirm Password *</Label>
                    <Input
                      id="buyer-confirm-pass"
                      type="password"
                      required
                      placeholder="Repeat password"
                      value={buyerConfirmPassword}
                      onChange={(e) => setBuyerConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Profile & Setting Password...
                  </>
                ) : (
                  <>
                    Complete Setup & Enter Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* ========================================================== */}
          {/* PATHWAY B: BUSINESS OWNER 5-STAGE WIZARD                   */}
          {/* ========================================================== */}
          {role === "business_owner" && (
            <div className="mt-6">
              {/* Steps Progress Indicator */}
              <div className="mb-6">
                <Steps steps={businessSteps} current={step} />
              </div>

              <form onSubmit={handleNextStep} className="space-y-6">
                {/* STAGE 1: BUSINESS DETAILS */}
                {step === 0 && (
                  <Panel title="Stage 1: Business Profile" description="Provide your registered enterprise identity and operational overview.">
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="b-name">Registered Business / Enterprise Name *</Label>
                        <Input
                          id="b-name"
                          required
                          placeholder="e.g. Paramount Polychem Industries Pvt Ltd"
                          value={bizData.businessName}
                          onChange={(e) => setBizData({ ...bizData, businessName: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="b-type">Business Constitution</Label>
                          <Select
                            value={bizData.businessType}
                            onValueChange={(v) => setBizData({ ...bizData, businessType: v })}
                          >
                            <SelectTrigger id="b-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {["Proprietorship", "Partnership", "Private Limited", "LLP", "Public Limited", "Trust / NGO"].map(
                                (t) => (
                                  <SelectItem key={t} value={t}>
                                    {t}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="b-ind">Industry Sector</Label>
                          <Select
                            value={bizData.industry}
                            onValueChange={(v) => setBizData({ ...bizData, industry: v })}
                          >
                            <SelectTrigger id="b-ind">
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent>
                              {industries.map((ind) => (
                                <SelectItem key={ind} value={ind}>
                                  {ind}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="b-founded">Year Founded</Label>
                          <Input
                            id="b-founded"
                            placeholder="e.g. 2016"
                            value={bizData.founded}
                            onChange={(e) => setBizData({ ...bizData, founded: e.target.value })}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="b-employees">Employee Count</Label>
                          <Select
                            value={bizData.employees}
                            onValueChange={(v) => setBizData({ ...bizData, employees: v })}
                          >
                            <SelectTrigger id="b-employees">
                              <SelectValue placeholder="Select count" />
                            </SelectTrigger>
                            <SelectContent>
                              {["1–10", "11–50", "51–200", "200+"].map((cnt) => (
                                <SelectItem key={cnt} value={cnt}>
                                  {cnt} employees
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="b-about">About Enterprise & Capabilities</Label>
                        <Textarea
                          id="b-about"
                          rows={3}
                          placeholder="Describe your manufacturing capacity, products offered, and key client sectors..."
                          value={bizData.about}
                          onChange={(e) => setBizData({ ...bizData, about: e.target.value })}
                        />
                      </div>
                    </div>
                  </Panel>
                )}

                {/* STAGE 2: CONTACT & LOCATION */}
                {step === 1 && (
                  <Panel title="Stage 2: Contact & Location" description="Operational location and authorised contact details.">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="b-person">Authorised Contact Person *</Label>
                          <Input
                            id="b-person"
                            required
                            placeholder="e.g. Farooq Ahmed"
                            value={bizData.contactPerson}
                            onChange={(e) => setBizData({ ...bizData, contactPerson: e.target.value })}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="b-phone">Business Phone Number *</Label>
                          <Input
                            id="b-phone"
                            type="tel"
                            required
                            placeholder="+91 98200 00000"
                            value={bizData.phone}
                            onChange={(e) => setBizData({ ...bizData, phone: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="b-addr">Registered Office / Factory Address</Label>
                        <Input
                          id="b-addr"
                          placeholder="Plot No. 42, MIDC Industrial Area"
                          value={bizData.address}
                          onChange={(e) => setBizData({ ...bizData, address: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="b-city">City</Label>
                          <Select
                            value={bizData.city}
                            onValueChange={(v) => setBizData({ ...bizData, city: v })}
                          >
                            <SelectTrigger id="b-city">
                              <SelectValue placeholder="Select city" />
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
                          <Label htmlFor="b-chap">RIFAH Chapter</Label>
                          <Select
                            value={bizData.chapter}
                            onValueChange={(v) => setBizData({ ...bizData, chapter: v })}
                          >
                            <SelectTrigger id="b-chap">
                              <SelectValue placeholder="Select chapter" />
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
                    </div>
                  </Panel>
                )}

                {/* STAGE 3: ACCOUNT & PASSWORD */}
                {step === 2 && (
                  <Panel title="Stage 3: Account & Dual-Login Password" description="Create a password so you can access your account via Email & Password anytime.">
                    <div className="space-y-4">
                      <div className="rounded-xl border border-primary/20 bg-primary-soft/30 p-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                          <span className="text-sm font-semibold text-foreground">Google Account Verified</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Logged in with: <span className="font-semibold text-foreground">{user?.email || "Google Account"}</span>
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="b-pass">Account Password *</Label>
                          <Input
                            id="b-pass"
                            type="password"
                            required
                            placeholder="Minimum 6 characters"
                            value={bizData.password}
                            onChange={(e) => setBizData({ ...bizData, password: e.target.value })}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="b-cpass">Confirm Password *</Label>
                          <Input
                            id="b-cpass"
                            type="password"
                            required
                            placeholder="Repeat password"
                            value={bizData.confirmPassword}
                            onChange={(e) => setBizData({ ...bizData, confirmPassword: e.target.value })}
                          />
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        💡 Setting this password lets you sign in with your email & password or 1-click Google OAuth anytime.
                      </p>
                    </div>
                  </Panel>
                )}

                {/* STAGE 4: TAX & VERIFICATION */}
                {step === 3 && (
                  <Panel title="Stage 4: Tax & Verification" description="Enterprise identification for Secretariat verification and buyer trust.">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="b-gst">GSTIN / Tax ID Number</Label>
                          <Input
                            id="b-gst"
                            placeholder="e.g. 27AAAAA0000A1Z5"
                            value={bizData.taxId}
                            onChange={(e) => setBizData({ ...bizData, taxId: e.target.value })}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="b-pan">PAN / Registration Number (Optional)</Label>
                          <Input
                            id="b-pan"
                            placeholder="e.g. ABCDE1234F"
                            value={bizData.panNumber}
                            onChange={(e) => setBizData({ ...bizData, panNumber: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="rounded-xl border border-warning/30 bg-warning-soft/20 p-4">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-5 w-5 text-warning shrink-0" />
                          <span className="text-sm font-semibold text-foreground">Secretariat Verification Review</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Your profile will be queued for RIFAH Secretariat verification upon submission. Verified suppliers receive 4x more buyer lead engagements and priority search badges.
                        </p>
                      </div>
                    </div>
                  </Panel>
                )}

                {/* STAGE 5: MEMBERSHIP PLAN */}
                {step === 4 && (
                  <Panel title="Stage 5: Choose Membership Plan" description="Select the RIFAH Chamber tier for directory placement and lead matching.">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {plans.map((p) => {
                        const isSelected = bizData.membershipTier.toLowerCase() === p.id.toLowerCase();
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setBizData({ ...bizData, membershipTier: p.id })}
                            className={cn(
                              "rounded-xl border p-4 text-left transition-all relative",
                              isSelected
                                ? "border-primary bg-primary-soft/50 ring-2 ring-primary/20 shadow-xs"
                                : "border-border bg-surface hover:bg-muted/40 hover:border-primary/40"
                            )}
                          >
                            {p.id === "premium" && (
                              <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                Recommended
                              </span>
                            )}
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="text-sm font-bold text-foreground">{p.name}</span>
                              <span className="text-sm font-bold text-primary">
                                {p.price === 0 ? "Free" : `₹ ${p.price?.toLocaleString("en-IN")}`}
                              </span>
                            </div>
                            <span className="mt-1.5 block text-xs text-muted-foreground">{p.summary}</span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-4 text-xs text-muted-foreground">
                      Listing is published in the directory upon secretariat review. You can upgrade plans anytime from your workspace.
                    </p>
                  </Panel>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  {step > 0 ? (
                    <Button type="button" variant="outline" onClick={handlePrevStep}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                  ) : (
                    <div />
                  )}

                  <Button type="submit" size="lg" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Finalizing Business Profile...
                      </>
                    ) : step < businessSteps.length - 1 ? (
                      <>
                        Next Stage <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Complete Registration & Enter Workspace <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}

export default OnboardingPage;
