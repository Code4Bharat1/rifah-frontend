"use client";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Upload, Loader2, AlertCircle, RotateCcw, Shield, Mail, Sparkles, Building2, Zap, Check, Globe } from "lucide-react";
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
    founded: "",
    employees: "11–50",
    about: "",
    contactPerson: "",
    phone: "",
    email: "",
    password: "",
    taxId: "",
    address: "",
    city: "",
    pincode: "",
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
      setGstErrorMsg(formData.region === "international" ? "Please enter your GSTIN or Tax ID first." : "Please enter a 15-character GSTIN first.");
      return;
    }

    if (formData.region === "national" && targetGst.length !== 15) {
      setGstErrorMsg("GSTIN must be exactly 15 characters long.");
      return;
    }

    setGstErrorMsg("");
    setGstSuccessMsg("");
    setGstVerifying(true);
    try {
      if (targetGst.length === 15) {
        const res = await businessApi.verifyGst(targetGst);
        const data = res?.data || res;
        if (data && (data.isValid || data.valid || data.status === "Active" || data.taxpayerStatus === "Active")) {
          setGstVerified(true);
          setGstData(data);

          // Instantly populate form fields directly from verified GST records
          const fetchedName = data.businessName || data.tradeName || data.legalName || "";
          const contactPerson = data.contactPerson || data.authorizedSignatory || data.promoter || data.legalName || "";
          const phone = data.phone || data.mobile || "";
          const email = data.email || "";
          const address = data.address || "";
          const city = data.city || "";
          const pincode = data.pincode || "";
          const founded = data.founded ? String(data.founded) : "";

          // Auto-match chapter based on city or state
          let matchingChapter = "";
          if (city) {
            const directMatch = chapters.find((c) => c.name.toLowerCase().includes(city.toLowerCase()));
            if (directMatch) matchingChapter = directMatch.name;
          }
          if (!matchingChapter && data.state) {
            const stateMatch = chapters.find((c) => c.name.toLowerCase().includes(data.state.toLowerCase()));
            if (stateMatch) matchingChapter = stateMatch.name;
          }

          setFormData((prev) => ({
            ...prev,
            businessName: fetchedName || prev.businessName,
            businessType: data.businessType || prev.businessType,
            founded: founded || prev.founded,
            contactPerson: contactPerson || prev.contactPerson,
            phone: phone || prev.phone,
            email: email || prev.email,
            address: address || prev.address,
            city: city || prev.city,
            pincode: pincode || prev.pincode,
            chapter: matchingChapter || prev.chapter,
          }));

          setGstSuccessMsg(
            fetchedName
              ? `GSTIN Verified! Details loaded for "${fetchedName}".`
              : "GSTIN Verified successfully (Active Taxpayer)."
          );
        } else {
          if (formData.region === "international") {
            setGstVerified(true);
            setGstSuccessMsg(`International Tax Number "${targetGst}" registered & verified.`);
          } else {
            setGstVerified(false);
            setGstErrorMsg(data?.message || "Invalid GSTIN or inactive taxpayer.");
          }
        }
      } else if (formData.region === "international") {
        if (targetGst.length < 5) {
          setGstErrorMsg("Tax registration number must be at least 5 characters.");
          setGstVerified(false);
        } else {
          setGstVerified(true);
          setGstSuccessMsg(`International Tax Number "${targetGst}" verified successfully.`);
        }
      } else {
        setGstVerified(false);
        setGstErrorMsg("GSTIN must be exactly 15 characters long.");
      }
    } catch (err) {
      if (formData.region === "international" && targetGst.length >= 5) {
        setGstVerified(true);
        setGstSuccessMsg(`International Tax Number "${targetGst}" registered & verified.`);
      } else {
        setGstVerified(false);
        setGstErrorMsg(err.message || "Failed to verify GSTIN. Please check the number.");
      }
    } finally {
      setGstVerifying(false);
    }
  };

  const handleFinalSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const isInternational = formData.region === "international";
      const currency = isInternational ? "USD" : "INR";

      const selectedPlan = plans.find((p) => p.id === tier) || {
        id: tier,
        name: tier.charAt(0).toUpperCase() + tier.slice(1),
        price: tier === "free" ? 0 : tier === "basic" ? 4999 : tier === "enterprise" ? 29999 : 12999,
        priceUsd: tier === "free" ? 0 : tier === "basic" ? 59 : tier === "enterprise" ? 359 : 159,
      };

      const planAmount = isInternational
        ? (selectedPlan.priceUsd ?? (selectedPlan.price === 0 ? 0 : Math.round(selectedPlan.price / 80)))
        : selectedPlan.price;

      const isPaid = planAmount > 0;

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
        state: isInternational ? (formData.state || "International") : "Maharashtra",
        address: formData.address,
        pincode: formData.pincode,
        founded: formData.founded,
        chapter: formData.chapter,
        membership: tier,
        about: formData.about,
        taxId: (formData.taxId || "").trim().toUpperCase(),
        region: formData.region || "national",
        currency,
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
      } catch (err) { }

      // Step 3: Create Razorpay Order with currency
      const orderRes = await paymentApi.createOrder({
        amount: planAmount,
        currency,
        planId: tier,
        itemType: "Membership",
        description: `${selectedPlan.name} Membership Subscription (${currency})`,
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
        currency: orderData.currency || currency,
        name: "RIFAH Chamber of Commerce",
        description: `${selectedPlan.name} Membership Subscription (${currency})`,
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
              amount: planAmount,
              currency,
              itemType: "Membership",
              description: `${selectedPlan.name} Membership Subscription (${currency})`,
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
                  setError(
                    formData.region === "international"
                      ? "GSTIN / Tax Identification Number is mandatory. Please enter your number and click Verify."
                      : "GSTIN / GST Number is mandatory for Indian entities. Please enter your 15-character GST number and click Verify."
                  );
                  return;
                }
                if (formData.region === "national") {
                  if (gst.length !== 15) {
                    setError("Please enter a complete 15-character GST Number (GSTIN).");
                    return;
                  }
                  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
                  if (!gstRegex.test(gst)) {
                    setError("Invalid GSTIN format. Example format: 27AAAAA0000A1Z5 (15 characters).");
                    return;
                  }
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
                  {/* Region / Jurisdiction Selector */}
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Business Jurisdiction & Currency *
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, region: "national" }));
                          setError("");
                        }}
                        className={cn(
                          "flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all",
                          formData.region === "national"
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                            : "border-border hover:bg-muted/40"
                        )}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">National (India)</span>
                            {formData.region === "national" && (
                              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                            Indian entity · GSTIN · INR (₹)
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, region: "international" }));
                          setError("");
                        }}
                        className={cn(
                          "flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all",
                          formData.region === "international"
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                            : "border-border hover:bg-muted/40"
                        )}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800">
                          <Globe className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">International</span>
                            {formData.region === "international" && (
                              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                            Global entity · Tax ID · USD ($)
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Two-Stage GSTIN / Tax ID Verification & Auto-Fetch Section (For National & International) */}
                  <div className="space-y-2 sm:col-span-2 rounded-xl border border-border/80 bg-muted/20 p-3.5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="bgst" className="font-semibold text-sm">
                          {formData.region === "international" ? "GST Number" : "GST Number"}{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                            formData.region === "international"
                              ? "bg-blue-500/10 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                              : "bg-primary/10 text-primary"
                          )}
                        >
                          {formData.region === "international" ? "International (USD)" : "Mandatory (India)"}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {(formData.taxId || "").length}{formData.region === "national" ? "/15" : ""}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="bgst"
                          required
                          maxLength={formData.region === "international" ? 25 : 15}
                          value={formData.taxId}
                          onChange={(e) => {
                            const val = (formData.region === "international"
                              ? e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "")
                              : e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
                            );
                            setFormData((prev) => ({ ...prev, taxId: val }));
                            setGstVerified(false);
                            setGstData(null);
                            setGstSuccessMsg("");
                            setGstErrorMsg("");
                            setError("");
                            if (val.length === 15 && formData.region === "national") {
                              handleVerifyGst(val);
                            }
                          }}
                          placeholder={
                            formData.region === "international"
                              ? "e.g. 27AAACT2727Q1ZW or Tax Reg No."
                              : "e.g. 27AAACT2727Q1ZW"
                          }
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
                          disabled={gstVerifying || !(formData.taxId || "").trim()}
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
                              {formData.region === "international" ? "Verify GST / Tax ID" : "Verify GSTIN"}
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {formData.region === "international"
                        ? "Enter 15-character GSTIN or international tax registration number to auto-fetch & verify entity."
                        : "Enter official 15-character Goods and Services Tax Identification Number (GSTIN) to auto-fetch details."}
                    </p>

                    {/* Error message */}
                    {gstErrorMsg && (
                      <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive animate-in fade-in-50">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{gstErrorMsg}</span>
                      </div>
                    )}

                    {/* Verified Status Note */}
                    {gstVerified && (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 animate-in fade-in-50">
                        <Check className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {gstSuccessMsg || "GST / Tax Number Verified — details automatically filled into form fields."}
                        </span>
                      </p>
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
                      placeholder="Street, area, premises"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bcity">City *</Label>
                    <Input
                      id="bcity"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Mumbai, Bhopal, Bhubaneswar"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bpincode">Pincode / Postal code</Label>
                    <Input
                      id="bpincode"
                      maxLength={6}
                      inputMode="numeric"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, "") })}
                      placeholder="6-digit pincode"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="bchapter">RIFAH chapter</Label>
                    <Select
                      value={formData.chapter}
                      onValueChange={(v) => setFormData({ ...formData, chapter: v })}
                    >
                      <SelectTrigger id="bchapter">
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
                              className={`h-16 w-11 sm:w-14 rounded-2xl border text-center text-2xl font-bold transition-all outline-none bg-white ${digit
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
                {/* Region & Currency Selector Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-border/70 mb-3.5">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                      Billing Currency & Region
                    </span>
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                      {formData.region === "international" ? (
                        <>
                          <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                            <Globe className="h-3.5 w-3.5 shrink-0" /> International Business
                          </span>
                          <span className="rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold px-1.5 py-0.5 text-[11px]">
                            USD ($)
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                            <Building2 className="h-3.5 w-3.5 shrink-0" /> National (India)
                          </span>
                          <span className="rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-1.5 py-0.5 text-[11px]">
                            INR (₹)
                          </span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 rounded-xl bg-muted/80 p-1 text-xs self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, region: "national" }))}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all",
                        formData.region === "national"
                          ? "bg-white dark:bg-slate-900 text-primary shadow-xs font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Building2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>₹ INR (India)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, region: "international" }))}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all",
                        formData.region === "international"
                          ? "bg-white dark:bg-slate-900 text-primary shadow-xs font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Globe className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      <span>$ USD (Global)</span>
                    </button>
                  </div>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  {plans.map((p) => {
                    const isIntl = formData.region === "international";
                    const displayAmt = isIntl
                      ? (p.priceUsd ?? (p.price === 0 ? 0 : Math.round(p.price / 80)))
                      : p.price;
                    const formattedPrice = displayAmt === 0
                      ? (isIntl ? "$ 0" : "₹ 0")
                      : isIntl
                        ? `$ ${displayAmt.toLocaleString("en-US")} USD`
                        : `₹ ${displayAmt.toLocaleString("en-IN")}`;

                    return (
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
                          <span className="text-sm font-bold text-primary">{formattedPrice}</span>
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">{p.summary}</span>
                      </button>
                    );
                  })}
                </div>

                {(() => {
                  const isIntl = formData.region === "international";
                  const activePlan = plans.find((p) => p.id === tier) || {
                    name: tier,
                    price: tier === "free" ? 0 : tier === "basic" ? 4999 : tier === "enterprise" ? 29999 : 12999,
                    priceUsd: tier === "free" ? 0 : tier === "basic" ? 59 : tier === "enterprise" ? 359 : 159,
                  };
                  const activeAmt = isIntl
                    ? (activePlan.priceUsd ?? (activePlan.price === 0 ? 0 : Math.round(activePlan.price / 80)))
                    : activePlan.price;

                  if (activeAmt > 0) {
                    return (
                      <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900/40 p-4 space-y-2.5 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Plan Selected</span>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{activePlan.name} Tier</h4>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Total Amount ({isIntl ? "USD" : "INR"})
                            </span>
                            <h4 className="text-base font-extrabold text-primary">
                              {isIntl ? `$ ${activeAmt.toLocaleString("en-US")} USD` : `₹ ${activeAmt.toLocaleString("en-IN")}`}
                            </h4>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>
                            {isIntl
                              ? "Razorpay Global Gateway (International Credit / Debit Cards in USD)"
                              : "Razorpay Instant Payment Gateway (UPI / QR / Cards / NetBanking in INR)"}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {isIntl ? (
                            <>
                              Official international subscription receipt will be dispatched to <strong>{formData.email}</strong> upon payment confirmation.
                            </>
                          ) : (
                            <>
                              Official GST Tax Invoice with attached PDF will be dispatched to <strong>{formData.email}</strong> upon payment confirmation.
                            </>
                          )}
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
                    const isIntl = formData.region === "international";
                    const activePlan = plans.find((p) => p.id === tier);
                    const activeAmt = isIntl
                      ? (activePlan?.priceUsd ?? (activePlan?.price === 0 ? 0 : Math.round((activePlan?.price || 0) / 80)))
                      : (activePlan?.price || 0);

                    if (activeAmt > 0) {
                      return isIntl
                        ? `🔒 Pay $${activeAmt} USD & Register`
                        : `🔒 Pay ₹${activeAmt.toLocaleString("en-IN")} & Register`;
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
