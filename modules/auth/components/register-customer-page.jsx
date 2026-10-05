"use client";
import React, { useState, useRef, useEffect } from "react";
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
  Loader2,
  CheckCircle2,
  AlertCircle,
  Building2,
  RotateCcw,
  Shield,
  Pencil,
  Sparkles,
} from "lucide-react";
import { PublicLayout } from "@shared/components/rifah/public-layout";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { cn } from "@shared/lib/utils";
import { useAuth } from "@shared/providers/auth-provider";
import { authApi } from "@shared/lib/api-services";
import { toast } from "sonner";

export function RegisterCustomerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams?.get("redirect");
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    password: "",
    confirmPassword: "",
    agreeTerms: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Email verification state (matches business registration pattern)
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

  // Countdown timer for OTP
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

    setError("");
    setEmailConflictError("");
    setOtpError("");
    setOtpSuccess("");
    setOtpSending(true);

    try {
      const res = await authApi.sendRegisterOtp(cleanEmail, "customer");
      setOtpSent(true);
      setOtpTimer(150);
      const returnedOtp = res?.data?.otp || res?.otp;
      if (returnedOtp) {
        setDevOtp(returnedOtp);
      }
      setOtpDigits(["", "", "", "", "", ""]);
      setOtpSuccess(res?.message || `Verification code sent to ${cleanEmail}`);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      const errMsg =
        err?.message || "Failed to send verification code. Please check your email.";
      if (
        errMsg.toLowerCase().includes("already exists") ||
        errMsg.toLowerCase().includes("registered") ||
        errMsg.toLowerCase().includes("duplicity")
      ) {
        setEmailConflictError(errMsg);
      } else {
        setError(errMsg);
      }
    } finally {
      setOtpSending(false);
    }
  };

  const handleResendOtp = async () => {
    const cleanEmail = form.email.toLowerCase().trim();
    setOtpSending(true);
    setOtpError("");
    setOtpSuccess("");

    try {
      const res = await authApi.sendRegisterOtp(cleanEmail, "customer");
      const returnedOtp = res?.data?.otp || res?.otp;
      if (returnedOtp) {
        setDevOtp(returnedOtp);
      }
      setOtpSuccess(res?.message || "A fresh verification code has been sent to your email.");
      setOtpTimer(150);
      setOtpDigits(["", "", "", "", "", ""]);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      setOtpError(err?.message || "Failed to resend code. Please try again.");
    } finally {
      setOtpSending(false);
    }
  };

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
      setOtpError("");
      const nextIndex = Math.min(cleaned.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleaned;
    setOtpDigits(newDigits);
    setOtpError("");

    if (cleaned && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const cleanEmail = form.email.toLowerCase().trim();
    const code = otpDigits.join("").trim();

    if (code.length !== 6) {
      setOtpError("Please enter all 6 digits of the verification code.");
      return;
    }

    setOtpError("");
    setOtpVerifying(true);

    try {
      const res = await authApi.verifyRegisterOtp(cleanEmail, code, "customer");
      const token = res?.data?.verifiedToken || res?.verifiedToken;
      setVerifiedToken(token);
      setEmailVerified(true);
      setOtpSuccess("Email verified successfully! Complete your details below to create your account.");
      toast.success("Email verified successfully!");
    } catch (err) {
      setOtpError(err?.message || "Invalid or expired verification code. Please try again.");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    const cleanEmail = form.email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!emailVerified || !verifiedToken) {
      setError("Please verify your email address using the 6-digit OTP code before proceeding.");
      if (!otpSent) {
        handleSendOtp();
      }
      return;
    }

    if (!form.phone.trim() || form.phone.trim().length < 8) {
      setError("Please enter a valid mobile number.");
      return;
    }

    if (!form.city.trim()) {
      setError("Please enter your city.");
      return;
    }

    if (!form.password || form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!form.agreeTerms) {
      setError("You must agree to the Terms of Service to continue.");
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name: form.name.trim(),
        email: cleanEmail,
        password: form.password,
        phone: form.phone.trim(),
        city: form.city.trim(),
        role: "customer",
        verifiedToken,
      });

      toast.success("Account created and verified successfully! Welcome to RIFAH.");

      if (redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")) {
        router.push(redirectParam);
      } else {
        router.push("/customer");
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
        <div className="w-full max-w-lg">
          {/* Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
            {/* Top decorative stripe */}
            <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-3">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>Customer Registration</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create your customer account</h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Discover verified businesses, request custom quotes, and track your enquiries with verified email security.
                </p>
              </div>

              {/* Error banner */}
              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive animate-in fade-in-50">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full name */}
                <div>
                  <Label htmlFor="cust-name" className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Full Name *
                  </Label>
                  <div className="relative">
                    <UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="cust-name"
                      type="text"
                      placeholder="e.g. Mohd Tariq"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="pl-10 h-11 rounded-xl border-slate-200 text-sm focus:border-emerald-500 focus:ring-emerald-500/20"
                      required
                    />
                  </div>
                </div>

                {/* Email Address with Inline OTP Verification */}
                <div className="space-y-1.5">
                  <Label htmlFor="cust-email" className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                    <Input
                      id="cust-email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      placeholder="e.g. your.name@gmail.com"
                      className={cn(
                        "pl-10 h-11 rounded-xl text-sm transition-all duration-200",
                        emailConflictError
                          ? "border-rose-500 focus-visible:ring-rose-500 bg-rose-50/30 text-rose-900 pr-10"
                          : emailVerified
                          ? "bg-emerald-50/50 border-emerald-300 text-emerald-900 pr-36 focus-visible:ring-emerald-500"
                          : otpSent
                          ? "bg-slate-50 text-slate-600 pr-24 border-slate-300"
                          : "border-slate-200 pr-28 focus:border-emerald-500 focus:ring-emerald-500/20"
                      )}
                      disabled={emailVerified || otpSent}
                    />

                    {/* Right action button inside email input */}
                    {emailVerified ? (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Verified</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleEditEmail}
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                        >
                          <Pencil className="h-3 w-3" />
                          <span>Edit</span>
                        </Button>
                      </div>
                    ) : otpSent && !emailVerified ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleEditEmail}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-3 text-xs text-emerald-700 hover:text-emerald-800 border-slate-200 hover:bg-slate-100 bg-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </Button>
                    ) : (
                      !otpSent && (
                        <Button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={otpSending || !form.email || !form.email.includes("@")}
                          size="sm"
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
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

                  {/* Conflict Error Message */}
                  {emailConflictError && (
                    <div className="flex items-start gap-2 text-xs text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200 mt-1 animate-in fade-in">
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="font-semibold text-rose-900">Email Already Registered</p>
                        <p className="text-[11px] text-rose-700">{emailConflictError}</p>
                        <Link
                          href={`/login?role=customer&email=${encodeURIComponent(form.email)}`}
                          className="inline-block text-[11px] font-bold text-rose-800 hover:underline pt-0.5"
                        >
                          Click here to sign in with this account &rarr;
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Helper / Status Notice */}
                  {emailVerified ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium mt-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>Email address verified successfully.</span>
                    </div>
                  ) : !otpSent && !emailConflictError ? (
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      We will send a 6-digit verification code to confirm this email.
                    </span>
                  ) : null}
                </div>

                {/* Inline 6-Digit OTP Verification Box (matches Business Registration UX) */}
                {otpSent && !emailVerified && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 sm:p-5 space-y-4 shadow-sm animate-in fade-in duration-200">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-bold text-slate-900">
                          6-Digit Verification Code
                        </Label>
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={otpSending || otpTimer > 0}
                          className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:no-underline cursor-pointer"
                        >
                          <span>Resend code</span>
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">
                        Enter the code sent to <strong className="text-slate-800">{form.email}</strong>
                      </p>

                      {/* 6 Individual Digit Inputs */}
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 my-3 w-full max-w-full">
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
                            className={`h-12 w-9 sm:h-14 sm:w-12 rounded-xl sm:rounded-2xl border text-center text-xl sm:text-2xl font-bold transition-all outline-none bg-white ${
                              digit
                                ? "border-emerald-500 text-slate-900 shadow-sm"
                                : "border-slate-200 text-slate-900"
                            } focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Timer */}
                    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 my-2">
                      <Shield className="h-3.5 w-3.5 text-emerald-600" />
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

                    {devOtp && (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-100/70 border border-emerald-300 text-xs text-emerald-950 animate-in fade-in">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-emerald-700 shrink-0" />
                          <span>
                            Verification Code:{" "}
                            <strong className="font-mono text-sm tracking-widest font-extrabold text-emerald-700">
                              {devOtp}
                            </strong>
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const digits = String(devOtp).split("").slice(0, 6);
                            while (digits.length < 6) digits.push("");
                            setOtpDigits(digits);
                            setOtpError("");
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer transition-all"
                        >
                          Auto-fill Code
                        </button>
                      </div>
                    )}

                    <Button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={otpVerifying || otpDigits.join("").length !== 6}
                      className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
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

                {/* Phone & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <Label htmlFor="cust-phone" className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Mobile Number *
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="cust-phone"
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={form.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        className="pl-10 h-11 rounded-xl border-slate-200 text-sm focus:border-emerald-500 focus:ring-emerald-500/20"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cust-city" className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      City *
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="cust-city"
                        type="text"
                        placeholder="e.g. Mumbai"
                        value={form.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        className="pl-10 h-11 rounded-xl border-slate-200 text-sm focus:border-emerald-500 focus:ring-emerald-500/20"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <Label htmlFor="cust-pass" className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Password *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="cust-pass"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 6 chars"
                        value={form.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        className="pl-10 pr-9 h-11 rounded-xl border-slate-200 text-sm focus:border-emerald-500 focus:ring-emerald-500/20"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cust-confirm-pass" className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Confirm Password *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="cust-confirm-pass"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        value={form.confirmPassword}
                        onChange={(e) => handleChange("confirmPassword", e.target.value)}
                        className="pl-10 pr-9 h-11 rounded-xl border-slate-200 text-sm focus:border-emerald-500 focus:ring-emerald-500/20"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms agreement */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={form.agreeTerms}
                    onChange={(e) => handleChange("agreeTerms", e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-xs text-slate-600 cursor-pointer">
                    I agree to RIFAH&apos;s Terms of Service and Privacy Policy
                  </label>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={submitting || !emailVerified}
                  className={cn(
                    "w-full h-11 rounded-xl text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2",
                    emailVerified
                      ? "bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                      : "bg-slate-300 text-slate-500 cursor-not-allowed hover:bg-slate-300"
                  )}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Customer Account</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                {!emailVerified && (
                  <p className="text-center text-[11px] text-slate-400">
                    Verify your email address above to enable account creation.
                  </p>
                )}
              </form>

              {/* Alternative Actions */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2.5 text-center text-xs">
                <p className="text-slate-500">
                  Already have an account?{" "}
                  <Link
                    href={
                      redirectParam
                        ? `/login?role=customer&redirect=${encodeURIComponent(redirectParam)}`
                        : "/login?role=customer"
                    }
                    className="font-semibold text-emerald-600 hover:underline"
                  >
                    Sign in here
                  </Link>
                </p>

                <div className="pt-2">
                  <Link
                    href="/register-business"
                    className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium py-1 px-3 rounded-lg border border-slate-200/80 hover:bg-slate-50 transition-colors"
                  >
                    <Building2 className="h-3.5 w-3.5 text-sky-600" />
                    Are you a vendor? Register your business
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

export default RegisterCustomerPage;
