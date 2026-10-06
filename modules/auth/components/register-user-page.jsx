"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Building2,
  RotateCcw,
  Shield,
  Sparkles,
  Globe,
  Briefcase,
  Layers,
  Check,
  Zap,
  Star,
  Crown,
  ChevronDown,
} from "lucide-react";
import { PublicLayout } from "@shared/components/rifah/public-layout";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { cn } from "@shared/lib/utils";
import { useAuth } from "@shared/providers/auth-provider";
import { authApi } from "@shared/lib/api-services";
import { COUNTRIES } from "@shared/lib/countries";
import { CATEGORIES_DATA } from "@shared/lib/categories-data";
import { INDIAN_STATES_AND_CITIES } from "@shared/lib/indian-states-cities";
import { INTERNATIONAL_COUNTRIES_AND_CITIES } from "@shared/lib/international-countries-cities";
import { SUBSCRIBER_TIERS } from "@shared/lib/subscription-models";
import { toast } from "sonner";

export function RegisterUserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams?.get("redirect");
  const { register } = useAuth();

  // Multi-step: 1 = Contact & Security, 2 = Business & Location, 3 = Membership Tier
  const [step, setStep] = useState(1);

  // Form State
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneCountryCode: "+91",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    // Step 2: Location & Business
    regionType: "national", // "national" or "international"
    country: "India",
    state: "",
    city: "",
    businessName: "",
    category: "",
    subCategory: "",
    // Step 3: Tier selection
    selectedTier: "tier_1", // Default to Tier I (Free)
    agreeTerms: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Email verification state
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifiedToken, setVerifiedToken] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(150);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [emailConflictError, setEmailConflictError] = useState("");
  const otpInputRefs = useRef([]);

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (otpSent && !emailVerified && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpSent, emailVerified, otpTimer]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleEmailChange = (value) => {
    setForm((prev) => ({ ...prev, email: value }));
    if (emailConflictError) setEmailConflictError("");
    if (error) setError("");
    if (emailVerified) {
      setEmailVerified(false);
      setVerifiedToken(null);
      setOtpSent(false);
    }
  };

  const handleEditEmail = () => {
    setEmailVerified(false);
    setVerifiedToken(null);
    setOtpSent(false);
    setOtpDigits(["", "", "", "", "", ""]);
    setOtpError("");
    setOtpSuccess("");
    setDevOtp("");
    setEmailConflictError("");
  };

  const handleSendOtp = async () => {
    const cleanEmail = form.email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setError("Please enter a valid email address first.");
      return;
    }

    setOtpSending(true);
    setOtpError("");
    setOtpSuccess("");
    setEmailConflictError("");
    setError("");

    try {
      const res = await authApi.sendRegisterOtp(cleanEmail, "customer");
      setOtpSent(true);
      setOtpTimer(150);
      setOtpSuccess(res?.message || `A 6-digit verification code has been sent to ${cleanEmail}`);
      if (res?.devOtp) setDevOtp(res.devOtp);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (err) {
      const errMsg = err?.message || "Failed to send verification code.";
      if (errMsg.toLowerCase().includes("already registered") || errMsg.toLowerCase().includes("already exists")) {
        setEmailConflictError(errMsg);
      } else {
        setOtpError(errMsg);
      }
    } finally {
      setOtpSending(false);
    }
  };

  const handleOtpDigitChange = (index, value) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length > 1) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        if (cleaned[i]) newDigits[i] = cleaned[i];
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

  const handleVerifyOtp = async () => {
    const code = otpDigits.join("");
    if (code.length !== 6) {
      setOtpError("Please enter all 6 digits of the verification code.");
      return;
    }

    setOtpVerifying(true);
    setOtpError("");
    try {
      const res = await authApi.verifyRegisterOtp(form.email.toLowerCase().trim(), code, "customer");
      const token = res?.verifiedToken || res?.data?.verifiedToken;
      if (!token) throw new Error("Verification token missing from response.");
      setVerifiedToken(token);
      setEmailVerified(true);
      setOtpSuccess("Email verified successfully.");
      toast.success("Email verified successfully.");
    } catch (err) {
      setOtpError(err?.message || "Invalid or expired verification code.");
    } finally {
      setOtpVerifying(false);
    }
  };

  // Indian States & Cities
  const indianStates = useMemo(() => Object.keys(INDIAN_STATES_AND_CITIES).sort(), []);
  const indianCities = useMemo(() => {
    if (!form.state || !INDIAN_STATES_AND_CITIES[form.state]) return [];
    const cities = INDIAN_STATES_AND_CITIES[form.state].map((item) =>
      typeof item === "string" ? item : item.city
    );
    return Array.from(new Set(cities)).sort();
  }, [form.state]);

  // International Countries & Cities
  const internationalCountries = useMemo(() => Object.keys(INTERNATIONAL_COUNTRIES_AND_CITIES).sort(), []);
  const internationalCities = useMemo(() => {
    if (!form.country || !INTERNATIONAL_COUNTRIES_AND_CITIES[form.country]) return [];
    const cities = INTERNATIONAL_COUNTRIES_AND_CITIES[form.country].map((c) =>
      typeof c === "string" ? c : c.city
    );
    return Array.from(new Set(cities)).sort();
  }, [form.country]);

  // Categories & Subcategories
  const categoriesList = useMemo(() => Object.keys(CATEGORIES_DATA).sort(), []);
  const subCategoriesList = useMemo(() => {
    if (!form.category || !CATEGORIES_DATA[form.category]) return [];
    return CATEGORIES_DATA[form.category];
  }, [form.category]);

  // Validation before going to Step 2
  const validateStep1 = () => {
    setError("");
    if (!form.name.trim() || form.name.trim().length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return false;
    }
    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return false;
    }
    if (!emailVerified) {
      setError("Please verify your email with the 6-digit OTP code before proceeding.");
      return false;
    }
    if (!form.phoneNumber.trim()) {
      setError("Please enter your mobile phone number.");
      return false;
    }
    if (!form.password || form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  // Validation before going to Step 3
  const validateStep2 = () => {
    setError("");
    if (form.regionType === "national") {
      if (!form.state) {
        setError("Please select your State.");
        return false;
      }
      if (!form.city) {
        setError("Please select your City.");
        return false;
      }
    } else {
      if (!form.country) {
        setError("Please select your Country.");
        return false;
      }
      if (!form.city) {
        setError("Please select your City.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (validateStep2()) setStep(3);
    }
  };

  const handlePrev = () => {
    setError("");
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateStep1() || !validateStep2()) return;
    if (!form.agreeTerms) {
      setError("Please accept the terms & conditions to create your account.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const selectedPlanObj = SUBSCRIBER_TIERS.find((t) => t.id === form.selectedTier) || SUBSCRIBER_TIERS[0];
      const fullPhone = `${form.phoneCountryCode}${form.phoneNumber.replace(/\D/g, "")}`;

      await register({
        name: form.name.trim(),
        email: form.email.toLowerCase().trim(),
        password: form.password,
        phone: fullPhone,
        country: form.regionType === "national" ? "India" : form.country,
        countryCode: form.phoneCountryCode,
        state: form.regionType === "national" ? form.state : (form.country || "International"),
        city: form.city,
        businessName: form.businessName.trim(),
        organization: form.businessName.trim(),
        category: form.category,
        subCategory: form.subCategory,
        subscriberTier: selectedPlanObj.name,
        verifiedToken,
      });

      toast.success("Account created successfully! Welcome to RIFAH User Portal.");

      if (redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")) {
        router.push(redirectParam);
      } else {
        router.push("/user");
      }
    } catch (err) {
      setError(err?.message || "Failed to create account. Please check your details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-10 px-4 sm:px-6">
        <div className="w-full max-w-2xl">
          {/* Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
            {/* Top decorative stripe */}
            <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />

            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-3">
                    <UserRound className="h-3.5 w-3.5" />
                    <span>Member & User Registration</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-500">
                    Step {step} of 3
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create your member account</h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Access chamber networking, business discovery, enquiries, LMS, and personalized member tiers.
                </p>

                {/* Stepper Progress */}
                <div className="mt-5 grid grid-cols-3 gap-2">
                  <div className={cn("h-1.5 rounded-full transition-all duration-300", step >= 1 ? "bg-blue-600" : "bg-slate-200")} />
                  <div className={cn("h-1.5 rounded-full transition-all duration-300", step >= 2 ? "bg-blue-600" : "bg-slate-200")} />
                  <div className={cn("h-1.5 rounded-full transition-all duration-300", step >= 3 ? "bg-blue-600" : "bg-slate-200")} />
                </div>
              </div>

              {/* Error banner */}
              {error && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 animate-in fade-in-50">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Step 1: Contact & Security */}
              {step === 1 && (
                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <Label htmlFor="user-name" className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Full Name *
                    </Label>
                    <div className="relative">
                      <UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="user-name"
                        type="text"
                        placeholder="e.g. Mohd Tariq"
                        value={form.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className="pl-10 h-11 rounded-xl border-slate-200 text-sm focus:border-blue-500 focus:ring-blue-500/20"
                        required
                      />
                    </div>
                  </div>

                  {/* Email with Inline OTP Verification */}
                  <div className="space-y-1.5">
                    <Label htmlFor="user-email" className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Email Address (with OTP Verification) *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="user-email"
                        type="email"
                        placeholder="you@domain.com"
                        value={form.email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        disabled={emailVerified}
                        className={cn(
                          "pl-10 pr-28 h-11 rounded-xl border-slate-200 text-sm focus:border-blue-500 focus:ring-blue-500/20",
                          emailVerified && "bg-emerald-50/50 border-emerald-300 text-emerald-900"
                        )}
                        required
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        {emailVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Verified
                          </span>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={handleSendOtp}
                            disabled={otpSending || !form.email || !form.email.includes("@")}
                            className="h-8 px-3 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                          >
                            {otpSending ? <Loader2 className="h-3 w-3 animate-spin" /> : otpSent ? "Resend" : "Send OTP"}
                          </Button>
                        )}
                      </div>
                    </div>

                    {emailConflictError && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                        <span>{emailConflictError}</span>
                        <Link href="/login" className="font-bold underline text-blue-600 hover:text-blue-800 ml-2">
                          Sign In
                        </Link>
                      </div>
                    )}

                    {/* OTP Box */}
                    {otpSent && !emailVerified && (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 mt-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-700">Enter 6-digit Verification Code:</p>
                          <span className="text-xs font-mono font-medium text-slate-500">
                            Expires in: {formatTimer(otpTimer)}
                          </span>
                        </div>

                        <div className="flex justify-between gap-2">
                          {otpDigits.map((digit, idx) => (
                            <input
                              key={idx}
                              ref={(el) => (otpInputRefs.current[idx] = el)}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              className="w-10 h-11 text-center text-base font-bold rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                          ))}
                        </div>

                        {otpError && <p className="text-xs text-rose-600 font-medium">{otpError}</p>}
                        {otpSuccess && <p className="text-xs text-emerald-600 font-medium">{otpSuccess}</p>}

                        <div className="flex items-center justify-between pt-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleEditEmail}
                            className="text-xs text-slate-500 hover:text-slate-700 p-0 h-auto"
                          >
                            Change email
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleVerifyOtp}
                            disabled={otpVerifying || otpDigits.join("").length !== 6}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-4"
                          >
                            {otpVerifying ? <Loader2 className="h-3 w-3 animate-spin" /> : "Verify Code"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Phone with Country Code Dropdown */}
                  <div>
                    <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Mobile Phone Number *
                    </Label>
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-5 sm:col-span-4 relative">
                        <select
                          value={form.phoneCountryCode}
                          onChange={(e) => handleChange("phoneCountryCode", e.target.value)}
                          className="w-full h-11 pl-2.5 pr-6 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
                        >
                          {COUNTRIES.map((c) => (
                            <option key={`${c.code}-${c.dialCode}`} value={c.dialCode}>
                              {c.flag} {c.dialCode} ({c.name})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                      </div>
                      <div className="col-span-7 sm:col-span-8 relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          type="tel"
                          placeholder="e.g. 9876543210"
                          value={form.phoneNumber}
                          onChange={(e) => handleChange("phoneNumber", e.target.value)}
                          className="pl-10 h-11 rounded-xl border-slate-200 text-sm focus:border-blue-500 focus:ring-blue-500/20"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Passwords */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="user-pass" className="text-xs font-semibold text-slate-700 mb-1.5 block">
                        Password *
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="user-pass"
                          type={showPassword ? "text" : "password"}
                          placeholder="Min. 6 chars"
                          value={form.password}
                          onChange={(e) => handleChange("password", e.target.value)}
                          className="pl-10 pr-10 h-11 rounded-xl border-slate-200 text-sm focus:border-blue-500 focus:ring-blue-500/20"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="user-confirm-pass" className="text-xs font-semibold text-slate-700 mb-1.5 block">
                        Confirm Password *
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="user-confirm-pass"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Repeat password"
                          value={form.confirmPassword}
                          onChange={(e) => handleChange("confirmPassword", e.target.value)}
                          className="pl-10 pr-10 h-11 rounded-xl border-slate-200 text-sm focus:border-blue-500 focus:ring-blue-500/20"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Next Button */}
                  <div className="pt-3">
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <span>Continue to Business & Location</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Location & Business Details */}
              {step === 2 && (
                <div className="space-y-4">
                  {/* Business Name */}
                  <div>
                    <Label htmlFor="business-name" className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Business / Organization Name
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="business-name"
                        type="text"
                        placeholder="e.g. Apex Engineering Solutions"
                        value={form.businessName}
                        onChange={(e) => handleChange("businessName", e.target.value)}
                        className="pl-10 h-11 rounded-xl border-slate-200 text-sm focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  {/* National vs International Toggle */}
                  <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl">
                    <Label className="text-xs font-semibold text-slate-700 mb-2 block">
                      Region / Geographical Presence *
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            regionType: "national",
                            country: "India",
                            state: "",
                            city: "",
                          }));
                        }}
                        className={cn(
                          "py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all",
                          form.regionType === "national"
                            ? "bg-white border-blue-600 text-blue-700 shadow-sm ring-1 ring-blue-600"
                            : "bg-transparent border-slate-200 text-slate-600 hover:bg-white/60"
                        )}
                      >
                        <MapPin className="h-4 w-4" />
                        <span>National (India)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            regionType: "international",
                            country: "United Arab Emirates",
                            state: "",
                            city: "",
                          }));
                        }}
                        className={cn(
                          "py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all",
                          form.regionType === "international"
                            ? "bg-white border-blue-600 text-blue-700 shadow-sm ring-1 ring-blue-600"
                            : "bg-transparent border-slate-200 text-slate-600 hover:bg-white/60"
                        )}
                      >
                        <Globe className="h-4 w-4" />
                        <span>International (Global)</span>
                      </button>
                    </div>
                  </div>

                  {/* Cascading State/Country & City Selection */}
                  {form.regionType === "national" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Indian State */}
                      <div>
                        <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                          State *
                        </Label>
                        <div className="relative">
                          <select
                            value={form.state}
                            onChange={(e) => {
                              const st = e.target.value;
                              setForm((prev) => ({ ...prev, state: st, city: "" }));
                            }}
                            className="w-full h-11 pl-3.5 pr-8 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
                          >
                            <option value="">Select State</option>
                            {indianStates.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Indian City */}
                      <div>
                        <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                          City *
                        </Label>
                        <div className="relative">
                          <select
                            value={form.city}
                            onChange={(e) => handleChange("city", e.target.value)}
                            disabled={!form.state}
                            className="w-full h-11 pl-3.5 pr-8 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
                          >
                            <option value="">{form.state ? "Select City" : "Choose state first"}</option>
                            {indianCities.map((ct) => (
                              <option key={ct} value={ct}>
                                {ct}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* International Country */}
                      <div>
                        <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                          Country *
                        </Label>
                        <div className="relative">
                          <select
                            value={form.country}
                            onChange={(e) => {
                              const cty = e.target.value;
                              setForm((prev) => ({ ...prev, country: cty, city: "" }));
                            }}
                            className="w-full h-11 pl-3.5 pr-8 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
                          >
                            <option value="">Select Country</option>
                            {internationalCountries.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* International City */}
                      <div>
                        <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                          City *
                        </Label>
                        <div className="relative">
                          <select
                            value={form.city}
                            onChange={(e) => handleChange("city", e.target.value)}
                            disabled={!form.country}
                            className="w-full h-11 pl-3.5 pr-8 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
                          >
                            <option value="">{form.country ? "Select City" : "Choose country first"}</option>
                            {internationalCities.map((ct) => (
                              <option key={ct} value={ct}>
                                {ct}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Industry Category */}
                  <div>
                    <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Industry Category
                    </Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <select
                        value={form.category}
                        onChange={(e) => {
                          const cat = e.target.value;
                          setForm((prev) => ({ ...prev, category: cat, subCategory: "" }));
                        }}
                        className="w-full h-11 pl-10 pr-8 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
                      >
                        <option value="">Select Primary Industry</option>
                        {categoriesList.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Cascading Sub-Category */}
                  <div>
                    <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Sub-Category / Specialization
                    </Label>
                    <div className="relative">
                      <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <select
                        value={form.subCategory}
                        onChange={(e) => handleChange("subCategory", e.target.value)}
                        disabled={!form.category}
                        className="w-full h-11 pl-10 pr-8 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
                      >
                        <option value="">
                          {form.category ? "Select Specialized Sub-category" : "Select Category first"}
                        </option>
                        {subCategoriesList.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="pt-3 flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrev}
                      className="h-12 px-5 rounded-xl border-slate-200 text-slate-700 font-semibold"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1.5" />
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <span>Choose Member Plan</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Member Tier Selection (Option 1 Hybrid) */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="text-center sm:text-left">
                    <h2 className="text-base font-bold text-slate-900">Select Your Membership Tier</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      You can start with the Free plan now and upgrade anytime inside your dashboard.
                    </p>
                  </div>

                  {/* Tier Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {SUBSCRIBER_TIERS.map((tier) => {
                      const isSelected = form.selectedTier === tier.id;
                      const isFree = tier.costingInr === 0;

                      return (
                        <div
                          key={tier.id}
                          onClick={() => handleChange("selectedTier", tier.id)}
                          className={cn(
                            "relative p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between",
                            isSelected
                              ? "border-blue-600 bg-blue-50/40 shadow-sm"
                              : "border-slate-200/90 hover:border-slate-300 bg-white"
                          )}
                        >
                          {/* Popular or Free Badge */}
                          {tier.isPopular && (
                            <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold tracking-wider uppercase">
                              Popular
                            </span>
                          )}
                          {isFree && (
                            <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold tracking-wider uppercase">
                              Zero Cost
                            </span>
                          )}

                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <h3 className="font-bold text-sm text-slate-900">{tier.name}</h3>
                              <div
                                className={cn(
                                  "w-4 h-4 rounded-full border flex items-center justify-center",
                                  isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"
                                )}
                              >
                                {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                              </div>
                            </div>

                            <div className="flex items-baseline gap-1 my-2">
                              <span className="text-2xl font-black text-slate-950">
                                ₹{tier.costingInr}
                              </span>
                              <span className="text-xs text-slate-500 font-medium">/ month</span>
                            </div>

                            <p className="text-[11px] text-slate-600 line-clamp-2 mb-3">
                              {tier.summary}
                            </p>

                            <ul className="space-y-1.5 text-[11px] text-slate-700">
                              {tier.bulletPoints?.slice(0, 3).map((bp, i) => (
                                <li key={i} className="flex items-center gap-1.5">
                                  <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                                  <span>{bp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Terms checkbox */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.agreeTerms}
                        onChange={(e) => handleChange("agreeTerms", e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs text-slate-600">
                        I agree to RIFAH Chamber's{" "}
                        <Link href="/terms" className="text-blue-600 underline font-semibold">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-blue-600 underline font-semibold">
                          Privacy Policy
                        </Link>
                        .
                      </span>
                    </label>
                  </div>

                  {/* Final Buttons */}
                  <div className="pt-3 flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrev}
                      className="h-12 px-5 rounded-xl border-slate-200 text-slate-700 font-semibold"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1.5" />
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <>
                          <span>
                            {form.selectedTier === "tier_1"
                              ? "Create Free Account & Go to Dashboard"
                              : "Continue with Selected Tier"}
                          </span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Bottom sign-in prompt */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <p>
                  Already have an account?{" "}
                  <Link href="/login" className="font-bold text-blue-600 hover:underline">
                    Sign in here
                  </Link>
                </p>
                <Link
                  href="/register-business"
                  className="font-semibold text-slate-600 hover:text-blue-700 inline-flex items-center gap-1"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Register Chamber Business instead</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
