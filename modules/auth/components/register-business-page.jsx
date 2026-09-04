"use client";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Upload, Loader2, AlertCircle, RotateCcw, Shield, Mail, Sparkles, Building2, Zap, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";

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
  SelectGroup,
  SelectLabel
} from "@shared/components/ui/select";
import { Textarea } from "@shared/components/ui/textarea";
import { cities, industries } from "@shared/lib/mock-data";
import { useChapters, useMembershipPlans, useCategories } from "@shared/hooks/use-rifah-api";
import { useAuth } from "@shared/providers/auth-provider";
import { authApi, paymentApi, businessApi } from "@shared/lib/api-services";
import { cn } from "@shared/lib/utils";

const steps = ["Business", "Contact", "Account", "Membership"];

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

function RegisterBusiness() {
  const { registerBusiness } = useAuth();
  const { data: chaptersData } = useChapters();
  const { data: plansData } = useMembershipPlans();

  const chapters = chaptersData || [];
  const plans = plansData ? Object.entries(plansData).map(([id, p]) => ({ id, ...p })) : [];
  
  const { data: categoriesData } = useCategories();
  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  const mainCategories = categories.filter(c => !c.parent);
  const subCategories = categories.filter(c => c.parent);

  const [step, setStep] = useState(0);
  const [tier, setTier] = useState("premium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(false);

  // GST Verification States (Step 1)
  const [gstVerifying, setGstVerifying] = useState(false);
  const [gstVerified, setGstVerified] = useState(false);
  const [gstData, setGstData] = useState(null);
  const [gstSuccessMsg, setGstSuccessMsg] = useState("");
  const [gstErrorMsg, setGstErrorMsg] = useState("");

  // OTP Verification States (Forgot Password theme)
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(150);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifiedToken, setVerifiedToken] = useState(null);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const otpInputRefs = useRef([]);

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
    taxId: "",
    address: "",
    city: "Mumbai",
    chapter: "Mumbai Chapter",
  });

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  useEffect(() => {
    let interval;
    if (otpSent && !emailVerified && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, emailVerified, otpTimer]);

  const handleOtpDigitChange = (index, value) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length > 1) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        if (cleaned[i]) {
          newDigits[i] = cleaned[i];
        }
      }
      setOtpDigits(newDigits);
      const nextIndex = Math.min(cleaned.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleaned.slice(-1);
    setOtpDigits(newDigits);

    if (cleaned && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleSendOtp = async () => {
    if (!formData.email || !formData.email.includes("@")) {
      setError("Please enter a valid email address first.");
      return;
    }
    setError("");
    setOtpError("");
    setOtpSuccess("");
    setOtpSending(true);
    try {
      const res = await authApi.sendRegisterOtp(formData.email.trim());
      setOtpSent(true);
      setOtpTimer(150);
      setOtpDigits(["", "", "", "", "", ""]);
      setOtpSuccess(res?.message || "Verification code sent to your email.");
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      setError(err.message || "Failed to send verification code. Please check your email.");
    } finally {
      setOtpSending(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpError("");
    setOtpSuccess("");
    setOtpSending(true);
    try {
      const res = await authApi.sendRegisterOtp(formData.email.trim());
      setOtpSuccess(res?.message || "A fresh verification code has been sent.");
      setOtpDigits(["", "", "", "", "", ""]);
      setOtpTimer(150);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      setOtpError(err.message || "Failed to resend code.");
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const code = otpDigits.join("");
    if (code.length !== 6) {
      setOtpError("Please enter all 6 digits.");
      return;
    }
    setOtpError("");
    setOtpVerifying(true);
    try {
      const res = await authApi.verifyRegisterOtp(formData.email.trim(), code);
      const token = res.data?.verifiedToken || res?.verifiedToken;
      setVerifiedToken(token);
      setEmailVerified(true);
      setOtpSuccess("Email verified successfully! Now set your account password.");
    } catch (err) {
      setOtpError(err.message || "Invalid or expired verification code.");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleVerifyGst = async (customGstin) => {
    const targetGst = (customGstin || formData.taxId || "").trim().toUpperCase();
    if (!targetGst) {
      setGstErrorMsg("Please enter a 15-character GSTIN first.");
      return;
    }
    if (targetGst.length !== 15) {
      setGstErrorMsg("GSTIN must be exactly 15 characters long.");
      return;
    }

    setGstErrorMsg("");
    setGstSuccessMsg("");
    setGstVerifying(true);
    try {
      const res = await businessApi.verifyGst(targetGst);
      const data = res?.data || res;
      if (data && (data.isValid || data.valid || data.status === "Active" || data.taxpayerStatus === "Active")) {
        setGstVerified(true);
        setGstData(data);

        // Instantly populate form fields directly from verified GST records
        const fetchedName = data.businessName || data.tradeName || data.legalName || "";
        setFormData((prev) => ({
          ...prev,
          businessName: fetchedName || prev.businessName,
          businessType: data.businessType || prev.businessType,
          founded: data.founded ? String(data.founded) : prev.founded,
          address: data.address || prev.address,
          city: data.city || prev.city,
          chapter: chapters.some((c) => c.name === `${data.city} Chapter`)
            ? `${data.city} Chapter`
            : prev.chapter,
        }));

        setGstSuccessMsg(
          fetchedName
            ? `GSTIN Verified! Details loaded for "${fetchedName}".`
            : "GSTIN Verified successfully (Active Taxpayer)."
        );
      } else {
        setGstVerified(false);
        setGstErrorMsg(data?.message || "Invalid GSTIN or inactive taxpayer.");
      }
    } catch (err) {
      setGstVerified(false);
      setGstErrorMsg(err.message || "Failed to verify GSTIN. Please check the number.");
    } finally {
      setGstVerifying(false);
    }
  };

  const handleFinalSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const selectedPlan = plans.find((p) => p.id === tier) || {
        id: tier,
        name: tier.charAt(0).toUpperCase() + tier.slice(1),
        price: tier === "free" ? 0 : tier === "basic" ? 4999 : tier === "enterprise" ? 29999 : 12999,
      };

      const isPaid = selectedPlan.price > 0;

      // If Paid Plan selected, preload Razorpay script first
      if (isPaid) {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          setError("Failed to load Razorpay payment gateway. Please check your internet connection.");
          setLoading(false);
          return;
        }
      }

      // Step 1: Register the business & user account
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
        taxId: (formData.taxId || "").trim().toUpperCase(),
        verifiedToken,
      });

      // If Free Plan, finish directly
      if (!isPaid) {
        setSubmitted(true);
        return;
      }

      // Step 2: For Paid Plan, fetch newly registered business ID
      let bizId = null;
      try {
        const myBizRes = await businessApi.getMyBusiness();
        bizId = myBizRes?.data?._id || myBizRes?._id;
      } catch (err) {}

      // Step 3: Create Razorpay Order
      const orderRes = await paymentApi.createOrder({
        amount: selectedPlan.price,
        planId: tier,
        itemType: "Membership",
        description: `${selectedPlan.name} Membership Subscription`,
      });

      const orderData = orderRes?.data || orderRes;
      if (!orderData?.orderId) {
        setSubmitted(true);
        return;
      }

      // Step 4: Open Razorpay Payment Gateway Modal
      const options = {
        key: orderData.keyId || "rzp_test_TTykh9OVkLKNHl",
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "RIFAH Chamber of Commerce",
        description: `${selectedPlan.name} Membership Subscription`,
        order_id: orderData.orderId,
        prefill: {
          name: formData.contactPerson || formData.businessName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#0F2942",
        },
        handler: async function (response) {
          try {
            setLoading(true);
            await paymentApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: tier,
              businessId: bizId,
              amount: selectedPlan.price,
              itemType: "Membership",
              description: `${selectedPlan.name} Membership Subscription`,
              billingEmail: formData.email,
              businessName: formData.businessName,
            });
            setPaidSuccess(true);
          } catch (err) {
            console.error("Payment verification error:", err);
          } finally {
            setLoading(false);
            setSubmitted(true);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setSubmitted(true);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      setError(err.message || "Failed to complete registration. Please check fields.");
      setLoading(false);
    }
  };

  if (submitted) {
    const selectedPlan = plans.find((p) => p.id === tier) || { name: tier };
    return (
      <PublicLayout>
        <div className="rifah-container flex min-h-[70vh] items-center justify-center py-10">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 text-center">
            <span className={cn(
              "mx-auto grid h-14 w-14 place-items-center rounded-full",
              paidSuccess ? "bg-emerald-100 text-emerald-600" : "bg-warning-soft text-warning"
            )}>
              {paidSuccess ? <CheckCircle2 className="h-7 w-7" /> : <ShieldCheck className="h-7 w-7" />}
            </span>
            <h1 className="mt-4 text-xl font-bold tracking-tight">
              {paidSuccess
                ? `Business Registered & ${selectedPlan.name} Membership Activated!`
                : "Business Registered Successfully"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {paidSuccess
                ? "Your membership payment was processed successfully. An official GST Tax invoice has been dispatched to your email."
                : "Your business profile has been created and submitted for RIFAH secretariat verification. You can now access your workspace."}
            </p>
            <ol className="mt-5 space-y-2 text-left text-sm">
              {[
                paidSuccess ? "Membership payment confirmed" : "Application received",
                "Document review by secretariat",
                "Verification decision",
                "Listing published on directory",
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
                  <span className={i === 0 ? "font-medium" : "text-muted-foreground"}>{s}</span>
                </li>
              ))}
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
              setError("");

              // Validation for Step 0 (Business details)
              if (step === 0) {
                const gst = (formData.taxId || "").trim().toUpperCase();
                if (!gst) {
                  setError("GSTIN / GST Number is mandatory. Please enter your 15-character GST number.");
                  return;
                }
                if (gst.length !== 15) {
                  setError("Please enter a complete 15-character GST Number (GSTIN).");
                  return;
                }
                const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
                if (!gstRegex.test(gst)) {
                  setError("Invalid GSTIN format. Example format: 27AAAAA0000A1Z5 (15 characters).");
                  return;
                }
                if (!gstVerified) {
                  setError("Please click 'Verify GSTIN' to verify your tax identifier before proceeding.");
                  return;
                }
                if (!formData.businessName || formData.businessName.trim().length < 2) {
                  setError("Business name is required. You can auto-fetch it from GST records or enter it manually.");
                  return;
                }
              }

              // Validation for Step 2 (Account)
              if (step === 2) {
                if (!formData.email || !formData.email.includes("@")) {
                  setError("Please provide a valid account email.");
                  return;
                }
                if (!emailVerified) {
                  if (!otpSent) {
                    handleSendOtp();
                    return;
                  }
                  setError("Please enter the 6-digit verification code sent to your email.");
                  return;
                }
                if (!formData.password || formData.password.length < 6) {
                  setError("Please enter an account password with at least 6 characters.");
                  return;
                }
              }

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
                  {/* Two-Stage GSTIN Verification & Auto-Fetch Section */}
                  <div className="space-y-2 sm:col-span-2 rounded-xl border border-border/80 bg-muted/20 p-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="bgst" className="font-semibold text-sm">
                          GSTIN / GST Number <span className="text-destructive">*</span>
                        </Label>
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary uppercase">
                          Mandatory
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {(formData.taxId || "").length}/15
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="bgst"
                          required
                          maxLength={15}
                          value={formData.taxId}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                            setFormData({ ...formData, taxId: val });
                            setGstVerified(false);
                            setGstData(null);
                            setGstSuccessMsg("");
                            setGstErrorMsg("");
                            setError("");
                          }}
                          placeholder="e.g. 27AAACT2727Q1ZW"
                          className="font-mono uppercase tracking-wider text-sm h-10 pr-8"
                        />
                        {gstVerified && (
                          <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                        )}
                      </div>

                      {gstVerified ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-semibold shrink-0 gap-1.5 h-10"
                        >
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          Verified
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => handleVerifyGst()}
                          disabled={gstVerifying || (formData.taxId || "").length !== 15}
                          className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 h-10 shadow-sm transition-all"
                        >
                          {gstVerifying ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-4 w-4" />
                              Verify GSTIN
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Enter official 15-character Goods and Services Tax Identification Number (GSTIN) and click Verify.
                    </p>

                    {/* Error message */}
                    {gstErrorMsg && (
                      <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive animate-in fade-in-50">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{gstErrorMsg}</span>
                      </div>
                    )}

                    {/* Verified Status Card (Details are auto-populated directly) */}
                    {gstVerified && (
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/20 p-3 shadow-2xs space-y-1.5 animate-in fade-in-50 duration-300">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            GSTIN Verified
                          </span>
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            Status: {gstData?.taxpayerStatus || gstData?.status || "Active Taxpayer"}
                          </span>
                        </div>
                        {(gstData?.businessName || gstData?.legalName || gstData?.tradeName) && (
                          <p className="text-xs font-semibold text-foreground">
                            {gstData.businessName || gstData.legalName || gstData.tradeName}
                            {gstData.state && <span className="font-normal text-muted-foreground"> • {gstData.state}</span>}
                            {gstData.businessType && <span className="font-normal text-muted-foreground"> • {gstData.businessType}</span>}
                          </p>
                        )}
                        {gstSuccessMsg && (
                          <div className="text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 font-medium pt-0.5 border-t border-emerald-500/15 mt-1.5">
                            <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            <span>{gstSuccessMsg}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

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
                        {mainCategories.length > 0 ? (
                          <>
                            {mainCategories.map(mc => {
                              const subs = subCategories.filter(sc => sc.parent === mc.name);
                              return (
                                <SelectGroup key={mc.name}>
                                  <SelectLabel className="font-semibold text-primary">{mc.name}</SelectLabel>
                                  <SelectItem value={mc.name} className="italic text-muted-foreground ml-2">General {mc.name}</SelectItem>
                                  {subs.map(sc => (
                                    <SelectItem key={sc.name} value={sc.name} className="ml-4">{sc.name}</SelectItem>
                                  ))}
                                </SelectGroup>
                              );
                            })}
                          </>
                        ) : (
                          industries.map((i) => (
                            <SelectItem key={i} value={i}>
                              {i}
                            </SelectItem>
                          ))
                        )}
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
                <div className="space-y-5">
                  {/* Account Email Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="reg-email">Account Email *</Label>
                      {emailVerified && (
                        <button
                          type="button"
                          onClick={() => {
                            setEmailVerified(false);
                            setOtpSent(false);
                            setVerifiedToken(null);
                            setOtpDigits(["", "", "", "", "", ""]);
                            setOtpError("");
                            setOtpSuccess("");
                          }}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          Change Email
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="reg-email"
                        type="email"
                        required
                        disabled={emailVerified || otpSending}
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          setOtpError("");
                          setOtpSuccess("");
                          setError("");
                        }}
                        placeholder="owner@company.com"
                        className={cn(
                          "h-11",
                          emailVerified
                            ? "border-emerald-500 bg-emerald-50/50 text-emerald-950 font-medium pr-28"
                            : !otpSent
                            ? "pr-32"
                            : ""
                        )}
                      />
                      {emailVerified ? (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Verified</span>
                        </div>
                      ) : (
                        !otpSent && (
                          <Button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={otpSending || !formData.email || !formData.email.includes("@")}
                            size="sm"
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-3 text-xs bg-[#0060df] hover:bg-[#0051bd] text-white rounded-lg font-semibold flex items-center gap-1.5"
                          >
                            {otpSending ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending...
                              </>
                            ) : (
                              <>
                                <Mail className="h-3.5 w-3.5" />
                                <span>Send OTP</span>
                              </>
                            )}
                          </Button>
                        )
                      )}
                    </div>
                    {!emailVerified && !otpSent && (
                      <p className="text-xs text-muted-foreground">
                        We will send a 6-digit verification code to confirm this email.
                      </p>
                    )}
                  </div>

                  {/* Step 2: 6-Digit Verification Code Box (Matching Forgot Password Theme) */}
                  {otpSent && !emailVerified && (
                    <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-5 space-y-4 shadow-sm animate-in fade-in duration-200">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-bold text-[#0f172a]">
                            6-Digit Verification Code
                          </Label>
                          <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={otpSending}
                            className="text-xs font-semibold text-[#0060df] hover:underline flex items-center gap-1.5 transition-colors disabled:opacity-50"
                          >
                            <span>Resend code</span>
                            <RotateCcw className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">
                          Enter the code sent to <strong className="text-slate-800">{formData.email}</strong>
                        </p>

                        {/* 6 Individual Digit Input Boxes */}
                        <div className="flex items-center justify-between gap-2 sm:gap-2.5 my-3">
                          {otpDigits.map((digit, idx) => (
                            <input
                              key={idx}
                              ref={(el) => (otpInputRefs.current[idx] = el)}
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={1}
                              autoComplete="off"
                              value={digit}
                              onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              onPaste={(e) => {
                                e.preventDefault();
                                const pasteData = e.clipboardData.getData("text").replace(/\D/g, "");
                                if (pasteData) {
                                  handleOtpDigitChange(idx, pasteData);
                                }
                              }}
                              className={`h-16 w-11 sm:w-14 rounded-2xl border text-center text-2xl font-bold transition-all outline-none bg-white ${
                                digit
                                  ? "border-slate-300 text-slate-900 shadow-sm"
                                  : "border-slate-200 text-slate-900"
                              } focus:border-[#0060df] focus:ring-4 focus:ring-blue-100/70`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Timer Notice matching reference design */}
                      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 my-2">
                        <Shield className="h-3.5 w-3.5 text-[#0060df]" />
                        <span>
                          Enter the code within{" "}
                          <span className="font-bold text-[#C90000]">{formatTimer(otpTimer)}</span> minutes
                        </span>
                      </div>

                      {otpError && (
                        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span>{otpError}</span>
                        </div>
                      )}

                      {otpSuccess && (
                        <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-2.5 text-xs text-emerald-800">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                          <span>{otpSuccess}</span>
                        </div>
                      )}

                      <Button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={otpVerifying || otpDigits.join("").length !== 6}
                        className="w-full h-11 rounded-xl bg-[#0060df] hover:bg-[#0051bd] text-white font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
                      >
                        {otpVerifying ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Verifying Code...
                          </>
                        ) : (
                          "Verify Code"
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Password Field - Revealed after email verification */}
                  {emailVerified && (
                    <div className="space-y-2 animate-in fade-in duration-300 pt-1">
                      <Label htmlFor="reg-pass">Account Password *</Label>
                      <Input
                        id="reg-pass"
                        type="password"
                        required
                        autoFocus
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({ ...formData, password: e.target.value });
                          setError("");
                        }}
                        placeholder="Minimum 6 characters"
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        Create a secure password with at least 6 characters. You will use this password to log in.
                      </p>
                    </div>
                  )}
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
                        tier === p.id ? "border-primary bg-primary-soft shadow-sm" : "border-border hover:bg-muted/60"
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

                {(() => {
                  const activePlan = plans.find((p) => p.id === tier) || { name: tier, price: 0 };
                  if (activePlan.price > 0) {
                    return (
                      <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-2.5 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Plan Selected</span>
                            <h4 className="text-sm font-bold text-slate-900">{activePlan.name} Tier</h4>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Amount</span>
                            <h4 className="text-base font-extrabold text-primary">₹ {activePlan.price?.toLocaleString("en-IN")}</h4>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>Razorpay Instant Payment Gateway (UPI / QR / Cards / NetBanking)</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Official GST Tax Invoice with attached PDF will be dispatched to <strong>{formData.email}</strong> upon payment confirmation.
                        </p>
                      </div>
                    );
                  }
                  return (
                    <p className="mt-4 text-xs text-muted-foreground">
                      The listing is activated in the directory upon secretariat review.
                    </p>
                  );
                })()}
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : step === steps.length - 1 ? (
                  (() => {
                    const activePlan = plans.find((p) => p.id === tier);
                    if (activePlan?.price > 0) {
                      return `🔒 Pay ₹${activePlan.price.toLocaleString("en-IN")} & Register`;
                    }
                    return "Complete Free Registration";
                  })()
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
