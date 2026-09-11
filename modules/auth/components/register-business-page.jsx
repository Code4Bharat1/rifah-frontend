"use client";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Upload, Loader2, AlertCircle, RotateCcw, Shield, Mail, Sparkles, Building2, Zap, Check, Globe, FileText, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@shared/components/ui/dialog";
import { Textarea } from "@shared/components/ui/textarea";
import { cities, industries } from "@shared/lib/mock-data";
import { useChapters, useMembershipPlans, useCategories } from "@shared/hooks/use-rifah-api";
import { useAuth } from "@shared/providers/auth-provider";
import { authApi, paymentApi, businessApi, verificationApi } from "@shared/lib/api-services";
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

const FastInput = ({ value, onValueChange, ...props }) => {
  const [localValue, setLocalValue] = useState(value || "");
  
  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  return (
    <Input
      {...props}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => {
        if (localValue !== value) {
          onValueChange(localValue);
        }
      }}
    />
  );
};

const FastTextarea = ({ value, onValueChange, ...props }) => {
  const [localValue, setLocalValue] = useState(value || "");
  
  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  return (
    <Textarea
      {...props}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => {
        if (localValue !== value) {
          onValueChange(localValue);
        }
      }}
    />
  );
};

function RegisterBusiness({ isAdmin = false }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const convertEmail = searchParams.get("convertEmail") || "";
  
  const { registerBusiness } = useAuth();
  const { data: chaptersData } = useChapters();
  const { data: plansData } = useMembershipPlans();

  const chapters = chaptersData || [];
  
  const plans = React.useMemo(() => {
    return plansData ? Object.entries(plansData).map(([id, p]) => ({ id, ...p })) : [];
  }, [plansData]);

  const { data: categoriesData } = useCategories();
  
  const { mainCategories, subCategories } = React.useMemo(() => {
    const cats = Array.isArray(categoriesData) ? categoriesData : [];
    return {
      mainCategories: cats.filter(c => !c.parent),
      subCategories: cats.filter(c => c.parent)
    };
  }, [categoriesData]);

  const [step, setStep] = useState(0);
  const [tier, setTier] = useState("premium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(false);

  // Admin Specific
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // Region Selection Modal Popup State
  const [showRegionModal, setShowRegionModal] = useState(true);

  // GST Verification States (Step 0 for National)
  const [gstVerifying, setGstVerifying] = useState(false);
  const [gstVerified, setGstVerified] = useState(false);
  const [gstData, setGstData] = useState(null);
  const [gstSuccessMsg, setGstSuccessMsg] = useState("");
  const [gstErrorMsg, setGstErrorMsg] = useState("");

  // International Business Certificate Upload States (Step 0 for International)
  const [certFile, setCertFile] = useState(null);
  const [certDocType, setCertDocType] = useState("Certificate of Incorporation");
  const [certDocNumber, setCertDocNumber] = useState("");
  const [certPreview, setCertPreview] = useState(null);

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
    email: convertEmail || "",
    password: "",
    taxId: "",
    address: "",
    city: "",
    pincode: "",
    chapter: "",
    region: "national",
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

  const gstDebounceRef = useRef(null);

  const triggerGstVerification = (val) => {
    if (gstDebounceRef.current) {
      clearTimeout(gstDebounceRef.current);
    }
    gstDebounceRef.current = setTimeout(() => {
      handleVerifyGst(val);
    }, 400);
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
        let res;
        try {
          res = await businessApi.verifyGst(targetGst);
        } catch (apiErr) {
          console.warn("[GST Lookup Info]", apiErr.message);
          setGstVerified(false);
          setGstErrorMsg(apiErr.message || "Unable to reach GST verification service. You can still proceed by entering details manually.");
          setGstVerifying(false);
          return;
        }
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

      // If Admin and Cash Payment
      if (isAdmin && paymentMethod === "cash") {
         await businessApi.createAdmin({
            businessName: formData.businessName,
            ownerName: formData.contactPerson || formData.businessName,
            email: formData.email,
            phone: formData.phone,
            chapter: formData.chapter,
            industry: formData.industry,
            businessType: formData.businessType,
            city: formData.city,
            state: isInternational ? (formData.state || "International") : "Maharashtra",
            address: formData.address,
            pincode: formData.pincode,
            founded: formData.founded,
            employees: formData.employees,
            taxId: isInternational ? (certDocNumber || "") : (formData.taxId || "").trim().toUpperCase(),
            region: formData.region || "national",
            membershipTier: tier,
            about: formData.about,
            amountCollected: planAmount
         });
         
         // Notify admin and redirect
         setLoading(false);
         alert("Business registered successfully! An email with login credentials has been sent to the owner.");
         router.push("/admin/businesses");
         return;
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
        taxId: isInternational ? (certDocNumber || "") : (formData.taxId || "").trim().toUpperCase(),
        region: formData.region || "national",
        currency,
        verifiedToken,
      });

      // Step 1.5: If International and certificate file was selected, upload and attach document to verification
      if (isInternational && certFile) {
        try {
          const docRes = await verificationApi.uploadDocument(certFile);
          const uploadedUrl = docRes?.data?.fileUrl || docRes?.fileUrl;
          if (uploadedUrl) {
            await verificationApi.submit({
              documents: [
                {
                  type: certDocType || "Certificate of Incorporation",
                  name: certFile.name,
                  number: certDocNumber || "",
                  fileUrl: uploadedUrl,
                  status: "pending",
                },
              ],
            });
          }
        } catch (uploadErr) {
          console.warn("Certificate post-registration upload notice:", uploadErr);
        }
      }

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

  const Wrapper = isAdmin ? ({children}) => <div className="py-6 animate-in fade-in">{children}</div> : PublicLayout;

  return (
    <Wrapper>
      {/* INITIAL JURISDICTION SELECTION MODAL POPUP */}
      <Dialog open={showRegionModal && !isAdmin} onOpenChange={setShowRegionModal}>
        <DialogContent className="w-[94vw] max-w-xl p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl font-sans">
          <DialogHeader className="space-y-1.5 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold w-fit">
              <Sparkles className="h-3.5 w-3.5" /> Select Business Jurisdiction
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              Where is your business registered?
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Select your business jurisdiction to customize the verification and onboarding requirements.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
            {/* OPTION 1: NATIONAL (INDIA) */}
            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({ ...prev, region: "national" }));
                setShowRegionModal(false);
                setError("");
              }}
              className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                    INR (₹)
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                  National (India)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  For businesses registered & operating within India with 15-digit GSTIN number.
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    ✓ GSTIN Verification
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    ✓ Instant Auto-fill
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600">
                <span>Select National</span>
                <span>→</span>
              </div>
            </button>

            {/* OPTION 2: INTERNATIONAL */}
            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({ ...prev, region: "international" }));
                setShowRegionModal(false);
                setError("");
              }}
              className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    <Globe className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                    USD ($)
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  International
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  For overseas enterprises worldwide. No GST required — upload your Business Certificate.
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                    ✓ Certificate Upload
                  </span>
                  <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                    ✓ Global Network
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600">
                <span>Select International</span>
                <span>→</span>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

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
                if (formData.region === "national") {
                  const gst = (formData.taxId || "").trim().toUpperCase();
                  if (!gst) {
                    setError("GSTIN / GST Number is mandatory for Indian entities. Please enter your 15-character GST number and click Verify.");
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
                } else if (formData.region === "international") {
                  if (!certFile) {
                    setError("Official Business Certificate (Trade License / Incorporation Certificate) is required for International entities. Please upload your document.");
                    return;
                  }
                }
                if (!formData.businessName || formData.businessName.trim().length < 2) {
                  setError("Business name is required (at least 2 characters).");
                  return;
                }
              }

              // Strict Validation for Step 1 (Contact & Location)
              if (step === 1) {
                if (!formData.contactPerson || formData.contactPerson.trim().length < 2) {
                  setError("Authorised contact person name is mandatory. Please enter the contact person's name.");
                  return;
                }
                if (!formData.phone || formData.phone.trim().length < 7) {
                  setError("Mobile / Phone number is mandatory. Please enter a valid mobile number before proceeding.");
                  return;
                }
                if (!formData.city || formData.city.trim().length < 2) {
                  setError("City is mandatory. Please enter your business city.");
                  return;
                }
                if (!formData.chapter || !formData.chapter.trim()) {
                  setError("RIFAH Chapter is mandatory. Please select a chapter before proceeding.");
                  return;
                }
              }

              // Validation for Step 2 (Account)
              if (step === 2) {
                if (!formData.email || !formData.email.includes("@")) {
                  setError("Please provide a valid account email.");
                  return;
                }
                if (!isAdmin) {
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
                  {/* Jurisdiction Selector Toggle Bar */}
                  <div className="space-y-2 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Business Jurisdiction & Currency *
                      </Label>
                      <button
                        type="button"
                        onClick={() => setShowRegionModal(true)}
                        className="text-xs text-primary font-semibold hover:underline cursor-pointer"
                      >
                        Change Registration Type
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, region: "national" }));
                          setError("");
                        }}
                        className={cn(
                          "flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer",
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
                            GSTIN · PAN · INR (₹)
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
                          "flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer",
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
                            Certificate Upload · USD ($)
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* NATIONAL ONLY: 15-digit GSTIN Verification Box */}
                  {formData.region === "national" && (
                    <div className="space-y-2 sm:col-span-2 rounded-2xl border border-emerald-200/80 bg-emerald-50/30 dark:bg-emerald-950/20 dark:border-emerald-900/50 p-4 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="bgst" className="font-bold text-sm text-slate-900 dark:text-white">
                            GSTIN / GST Number <span className="text-destructive">*</span>
                          </Label>
                          <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                            Mandatory (India)
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-muted-foreground font-semibold">
                          {(formData.taxId || "").length}/15
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <div className="relative flex-1">
                          <FastInput
                            id="bgst"
                            required
                            maxLength={15}
                            value={formData.taxId}
                            onValueChange={(val) => {
                              const upperVal = val.toUpperCase().replace(/[^A-Z0-9]/g, "");
                              setFormData((prev) => ({ ...prev, taxId: upperVal }));
                              setGstVerified(false);
                              setGstData(null);
                              setGstSuccessMsg("");
                              setGstErrorMsg("");
                              setError("");
                              if (upperVal.length === 15) {
                                triggerGstVerification(upperVal);
                              }
                            }}
                            placeholder="e.g. 27AAACT2727Q1ZW"
                            className="font-mono uppercase tracking-wider text-sm h-11 pr-8 bg-white dark:bg-slate-900"
                          />
                          {gstVerified && (
                            <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
                          )}
                        </div>

                        {gstVerified ? (
                          <Button
                            type="button"
                            variant="outline"
                            className="border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-semibold shrink-0 gap-1.5 h-11 px-4"
                          >
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            Verified
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => handleVerifyGst()}
                            disabled={gstVerifying || !(formData.taxId || "").trim()}
                            className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 h-11 px-5 shadow-sm transition-all"
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
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Enter official 15-character Goods and Services Tax Identification Number (GSTIN) to auto-fetch business details.
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
                            {gstSuccessMsg || "GST Number Verified — details automatically filled into form fields."}
                          </span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* INTERNATIONAL ONLY: Business Certificate Upload Section (NO GST/TAX FIELD) */}
                  {formData.region === "international" && (
                    <div className="space-y-3 sm:col-span-2 rounded-2xl border border-blue-200/80 bg-blue-50/30 dark:bg-blue-950/20 dark:border-blue-900/50 p-4 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Label className="font-bold text-sm text-slate-900 dark:text-white">
                            Official Business Certificate / License <span className="text-destructive">*</span>
                          </Label>
                          <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                            International (USD)
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Upload your official Trade License, Certificate of Incorporation, Commercial Register, or Chamber Certificate.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Document Type
                          </Label>
                          <Select
                            value={certDocType}
                            onValueChange={setCertDocType}
                          >
                            <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-slate-900">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Certificate of Incorporation">Certificate of Incorporation / Registration</SelectItem>
                              <SelectItem value="Trade License">Trade License / Commercial License</SelectItem>
                              <SelectItem value="Commercial Register">Commercial Register Extract (CR)</SelectItem>
                              <SelectItem value="Chamber Certificate">Chamber of Commerce Certificate</SelectItem>
                              <SelectItem value="Tax Residency Certificate">Tax Residency / VAT Certificate</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="cert-num" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            License / Registration No. (Optional)
                          </Label>
                          <Input
                            id="cert-num"
                            value={certDocNumber}
                            onChange={(e) => setCertDocNumber(e.target.value)}
                            placeholder="e.g. CR-8839210 / LIC-994"
                            className="h-11 rounded-xl bg-white dark:bg-slate-900 font-mono uppercase"
                          />
                        </div>
                      </div>

                      {/* File Upload Box */}
                      <div className="pt-2">
                        {certFile ? (
                          <div className="flex items-center justify-between p-3.5 rounded-xl border border-blue-200 bg-white dark:bg-slate-900 shadow-2xs">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                                <FileText className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {certFile.name}
                                </p>
                                <p className="text-[11px] text-slate-400">
                                  {(certFile.size / (1024 * 1024)).toFixed(2)} MB · {certDocType}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setCertFile(null);
                                setCertPreview(null);
                              }}
                              className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-blue-200 dark:border-blue-900/60 rounded-2xl cursor-pointer bg-white/70 dark:bg-slate-900/60 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-2 pb-2 text-center px-4">
                              <Upload className="h-6 w-6 text-blue-500 mb-1" />
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Click to upload Business Certificate / Trade License *
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                PDF, PNG, JPG up to 15MB
                              </p>
                            </div>
                            <input
                              type="file"
                              accept=".pdf,image/png,image/jpeg,image/webp"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setCertFile(file);
                                  setError("");
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="bname">Business name *</Label>
                    <FastInput
                      id="bname"
                      required
                      value={formData.businessName}
                      onValueChange={(val) => {
                        setFormData({ ...formData, businessName: val });
                        setError("");
                      }}
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
                    <FastInput
                      id="byear"
                      inputMode="numeric"
                      value={formData.founded}
                      onValueChange={(val) => setFormData({ ...formData, founded: val })}
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
                    <FastTextarea
                      id="babout"
                      rows={3}
                      value={formData.about}
                      onValueChange={(val) => setFormData({ ...formData, about: val })}
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
                    <FastInput
                      id="cperson"
                      required
                      value={formData.contactPerson}
                      onValueChange={(val) => setFormData({ ...formData, contactPerson: val })}
                      placeholder="Authorised representative"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bphone">Mobile / Phone Number *</Label>
                    <FastInput
                      id="bphone"
                      type="tel"
                      required
                      value={formData.phone}
                      onValueChange={(val) => {
                        setFormData({ ...formData, phone: val });
                        setError("");
                      }}
                      placeholder="Mobile number (Mandatory)"
                    />
                    <p className="text-[10px] text-muted-foreground">Direct mobile contact is mandatory for lead notifications.</p>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="baddress">Address</Label>
                    <FastInput
                      id="baddress"
                      value={formData.address}
                      onValueChange={(val) => setFormData({ ...formData, address: val })}
                      placeholder="Street, area, premises"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bcity">City *</Label>
                    <FastInput
                      id="bcity"
                      required
                      value={formData.city}
                      onValueChange={(val) => {
                        setFormData({ ...formData, city: val });
                        setError("");
                      }}
                      placeholder="e.g. Mumbai, Bhopal, Dubai, London"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bpincode">Pincode / Postal code</Label>
                    <FastInput
                      id="bpincode"
                      inputMode="numeric"
                      value={formData.pincode}
                      onValueChange={(val) => setFormData({ ...formData, pincode: val })}
                      placeholder="Postal / Zip code"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="bchapter">RIFAH Chapter *</Label>
                    <Select
                      value={formData.chapter}
                      onValueChange={(v) => {
                        setFormData({ ...formData, chapter: v });
                        setError("");
                      }}
                    >
                      <SelectTrigger id="bchapter" className="h-11">
                        <SelectValue placeholder="Select mandatory chapter" />
                      </SelectTrigger>
                      <SelectContent>
                        {chapters.map((c) => (
                          <SelectItem key={c._id || c.name} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground">Select the nearest RIFAH chamber chapter for regional membership governance.</p>
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
                          className="text-xs font-semibold text-[#0060df] hover:underline"
                        >
                          Change Email
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <FastInput
                        id="reg-email"
                        type="email"
                        required
                        value={formData.email}
                        onValueChange={(val) => {
                          setFormData({ ...formData, email: val });
                          setError("");
                        }}
                        placeholder="e.g. info@business.com"
                        className={cn(
                          "h-11",
                          (!isAdmin && emailVerified)
                            ? "bg-emerald-50/50 border-emerald-200 text-emerald-900 pr-24 focus-visible:ring-emerald-500"
                            : (!isAdmin && otpSent) || (isAdmin && convertEmail)
                              ? "bg-slate-50 text-slate-500 pr-24"
                              : ""
                        )}
                        disabled={(!isAdmin && (emailVerified || otpSent)) || (isAdmin && !!convertEmail)}
                      />
                      {(!isAdmin && emailVerified) ? (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Verified</span>
                        </div>
                      ) : (
                        !isAdmin && !otpSent && (
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
                    {!isAdmin && !emailVerified && !otpSent && (
                      <p className="text-xs text-muted-foreground">
                        We will send a 6-digit verification code to confirm this email.
                      </p>
                    )}
                    {isAdmin && (
                      <p className="text-xs text-muted-foreground">
                        An auto-generated secure password will be sent to this email.
                      </p>
                    )}
                  </div>

                  {/* Step 2: 6-Digit Verification Code Box (Matching Forgot Password Theme) */}
                  {!isAdmin && otpSent && !emailVerified && (
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
                  {!isAdmin && emailVerified && (
                    <div className="space-y-2 animate-in fade-in duration-300 pt-1">
                      <Label htmlFor="reg-pass">Account Password *</Label>
                      <FastInput
                        id="reg-pass"
                        type="password"
                        required
                        autoFocus
                        value={formData.password}
                        onValueChange={(val) => {
                          setFormData({ ...formData, password: val });
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
                        {isAdmin && (
                          <div className="mt-4 flex flex-col space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Payment Method (Admin Override)</span>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setPaymentMethod("cash")}
                                className={cn(
                                  "flex-1 rounded-lg border py-2 px-3 text-sm font-semibold transition-all text-center",
                                  paymentMethod === "cash" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                                )}
                              >
                                Direct Cash
                              </button>
                              <button
                                type="button"
                                onClick={() => setPaymentMethod("online")}
                                className={cn(
                                  "flex-1 rounded-lg border py-2 px-3 text-sm font-semibold transition-all text-center",
                                  paymentMethod === "online" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                                )}
                              >
                                Online Gateway
                              </button>
                            </div>
                          </div>
                        )}
                        <p className="text-[11px] text-muted-foreground mt-3">
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
                      if (isAdmin && paymentMethod === "cash") {
                        return isIntl ? `Receive $${activeAmt} Cash & Register` : `Receive ₹${activeAmt.toLocaleString("en-IN")} Cash & Register`;
                      }
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
    </Wrapper>
  );
}

export { RegisterBusiness as RegisterBusinessPage };
export default RegisterBusiness;
