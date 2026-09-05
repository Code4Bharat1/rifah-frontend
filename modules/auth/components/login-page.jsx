"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Loader2,
  KeyRound,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Shield,
  Building2,
  UserRound,
  Mail,
  Check,
  RotateCcw,
  Eye,
  EyeOff,
  Users,
  BarChart3,
  Calendar,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

import { RifahLogo } from "@shared/components/rifah/brand";
import { PublicLayout } from "@shared/components/rifah/public-layout";
import { Button } from "@shared/components/ui/button";
import { Checkbox } from "@shared/components/ui/checkbox";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@shared/components/ui/dialog";
import { useAuth } from "@shared/providers/auth-provider";
import { authApi } from "@shared/lib/api-services";
import { GoogleAuthButton } from "@shared/components/rifah/google-button";

const quickDemoLogins = [
  { 
    role: "RIFAH Admin",
    email: "[EMAIL_ADDRESS]",
    pass: "12345678",
    target: "/admin",
    icon: ShieldCheck,
    note: "All access chamber monitoring",
  },
  {
    role: "Business Owner",
    email: "aslam@bakkabags.example",
    pass: "Password@123",
    target: "/biz",
    icon: Building2,
    note: "Leads, catalogue & verification",
  },
  {
    role: "Customer / Buyer",
    email: "buyer@example.com",
    pass: "Password@123",
    target: "/me",
    icon: UserRound,
    note: "Enquiries, saved & messages",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const t = useTranslations("Login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Forgot Password Modal State
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: enter email, 2: enter code & new password
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(150); // 2:30 minutes
  const otpInputRefs = useRef([]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  // Countdown timer for Step 2 OTP entry
  useEffect(() => {
    let interval = null;
    if (isForgotOpen && forgotStep === 2 && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isForgotOpen, forgotStep, otpTimer]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
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
      setResetCode(newDigits.join(""));
      const nextIndex = Math.min(cleaned.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleaned.slice(-1);
    setOtpDigits(newDigits);
    setResetCode(newDigits.join(""));

    if (cleaned && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = async () => {
    setForgotError("");
    setForgotSuccess("");
    setForgotLoading(true);
    try {
      const res = await authApi.forgotPassword(forgotEmail.trim());
      setForgotSuccess(res?.message || `A new verification code has been sent to ${forgotEmail}.`);
      setOtpDigits(["", "", "", "", "", ""]);
      setResetCode("");
      setOtpTimer(150);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 50);
    } catch (err) {
      setForgotError(err.message || "Failed to resend code.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const user = await login({ email, password });
      if (user.requirePasswordReset) {
        router.push("/change-password");
      } else if (user.role === "business_owner") {
        router.push("/biz");
      } else if (user.role === "chapter_admin") {
        const slug = user.chapter.toLowerCase().replace(/\s+/g, '-');
        router.push(`/${slug}/admin`);
      } else if (user.role === "super_admin" || user.role === "secretariat") {
        router.push("/admin");
      } else {
        router.push("/me");
      }
    } catch (err) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetCode = async (e) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.trim()) {
      setForgotError("Please enter your registered email address.");
      return;
    }
    setForgotError("");
    setForgotSuccess("");
    setForgotLoading(true);
    try {
      const res = await authApi.forgotPassword(forgotEmail.trim());
      setForgotSuccess(res?.message || `A 6-digit verification code has been sent to ${forgotEmail}.`);
      setResetCode("");
      setOtpDigits(["", "", "", "", "", ""]);
      setOtpTimer(150); // 02:30 countdown
      setForgotStep(2);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      setForgotError(err.message || "Failed to send reset code. Please check your email address.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    const fullCode = (otpDigits.join("").trim() || resetCode.trim());
    if (!fullCode || fullCode.length !== 6) {
      setForgotError("Please enter the complete 6-digit verification code.");
      return;
    }

    setForgotLoading(true);
    try {
      const res = await authApi.verifyResetCode({
        email: forgotEmail.trim(),
        resetToken: fullCode,
      });
      setResetCode(fullCode);
      setForgotSuccess(res?.message || "Code verified successfully! Now choose your new password.");
      setNewPassword("");
      setConfirmPassword("");
      setForgotStep(3);
    } catch (err) {
      setForgotError(err.message || "Invalid or expired verification code. Please check and try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    if (!newPassword || newPassword.length < 6) {
      setForgotError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError("Passwords do not match. Please re-enter.");
      return;
    }

    setForgotLoading(true);
    try {
      const res = await authApi.resetPassword({
        email: forgotEmail.trim(),
        resetToken: resetCode.trim(),
        newPassword,
      });

      setIsForgotOpen(false);
      setEmail(forgotEmail.trim());
      setPassword("");
      setError("");
      setSuccessMsg(res?.message || "Password has been reset successfully! Please sign in with your new password.");

      // Reset dialog form state
      setForgotStep(1);
      setResetCode("");
      setNewPassword("");
      setConfirmPassword("");
      setForgotError("");
      setForgotSuccess("");
    } catch (err) {
      setForgotError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <PublicLayout bare>
      <div className="grid h-[calc(100vh-68px)] lg:grid-cols-12 bg-[#f8fafc] overflow-hidden">
        {/* Left Hero / Brand Showcase (Hidden on mobile, shown on lg+) */}
        <div className="relative hidden lg:flex lg:col-span-7 flex-col justify-between overflow-hidden bg-[#071328] p-8 xl:p-12 text-white select-none h-full">
          {/* Skyscraper background image with wider coverage to remove gap */}
          <div className="absolute right-0 top-0 bottom-0 w-[72%] pointer-events-none select-none overflow-hidden">
            <img
              src="/images/login-building.jpg"
              alt="RIFAH Architecture"
              className="h-full w-full object-cover object-center"
            />
            {/* Smooth gradient fade to blend with text naturally */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#071328] via-[#071328]/75 via-35% to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#071328] via-transparent to-transparent" />

            {/* Red curved accent arc at top-right */}
            <svg
              className="absolute -top-3 -right-3 w-48 h-48 pointer-events-none opacity-95"
              viewBox="0 0 150 150"
              fill="none"
            >
              <path
                d="M 150 5 C 95 20 40 75 5 150"
                stroke="#C90000"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Top Tag */}
          <div className="relative z-10 flex items-center gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">
              RIFAH CONNECT
            </span>
            <div className="h-0.5 w-10 rounded-full bg-sky-500/60" />
          </div>

          {/* Middle Content: Heading, Subtitle & 4 Pillars */}
          <div className="relative z-10 my-auto space-y-4 max-w-lg py-2">
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold tracking-tight text-white leading-[1.2]">
              One chamber network<br />
              for discovery, enquiries<br />
              and <span className="text-[#38bdf8]">verified trade.</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-md">
              Members receive matched buyer enquiries, manage their catalogue and participate in chapter events from a single workspace.
            </p>

            {/* 4 Feature Items in a row */}
            <div className="grid grid-cols-4 gap-2.5 pt-1.5">
              <div className="flex flex-col items-start gap-1.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400">
                  <Users className="h-4 w-4 stroke-[2]" />
                </div>
                <span className="text-[11px] font-medium text-slate-200 leading-tight">Verified Network</span>
              </div>
              <div className="flex flex-col items-start gap-1.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400">
                  <BarChart3 className="h-4 w-4 stroke-[2]" />
                </div>
                <span className="text-[11px] font-medium text-slate-200 leading-tight">Business Opportunities</span>
              </div>
              <div className="flex flex-col items-start gap-1.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400">
                  <Calendar className="h-4 w-4 stroke-[2]" />
                </div>
                <span className="text-[11px] font-medium text-slate-200 leading-tight">Events & Collaborations</span>
              </div>
              <div className="flex flex-col items-start gap-1.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400">
                  <ShieldCheck className="h-4 w-4 stroke-[2]" />
                </div>
                <span className="text-[11px] font-medium text-slate-200 leading-tight">Trusted Ecosystem</span>
              </div>
            </div>
          </div>

          {/* Floating Quote Card on bottom-right & Bottom Brand Tag on bottom-left */}
          <div className="relative z-10 flex items-end justify-between gap-3 pt-2">
            {/* Tagline on bottom-left */}
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-5 bg-slate-500/60" />
              <span className="text-[10px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                TOGETHER FOR A SUSTAINABLE FUTURE
              </span>
            </div>

            {/* Frosted Glass Quote Card */}
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3.5 shadow-xl backdrop-blur-md max-w-[210px] text-left">
              <span className="text-2xl font-serif text-sky-400 leading-none block select-none">“</span>
              <p className="mt-0.5 text-xs font-bold text-white leading-snug">Stronger Businesses</p>
              <p className="text-[11px] text-slate-300">A Brighter Tomorrow</p>
              <div className="mt-2 h-0.5 w-6 rounded-full bg-[#C90000]" />
            </div>
          </div>
        </div>

        {/* Right Form Container - Fits on screen without scrolling */}
        <div className="lg:col-span-5 flex items-center justify-center p-4 sm:p-6 lg:p-8 h-full overflow-hidden">
          <div className="w-full max-w-[400px] rounded-[24px] border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.06)] space-y-3.5">
            {/* Header */}
            <div className="text-center md:text-left">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{t("title")}</h1>
              <p className="mt-0.5 text-xs text-slate-500">{t("subtitle")}</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive animate-in fade-in-50">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-700 animate-in fade-in-50">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form className="space-y-3" onSubmit={handleSubmit}>
              {/* Email Field with Left Icon */}
              <div className="space-y-1">
                <Label htmlFor="email" className="text-[11px] font-semibold text-slate-700">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="h-10 pl-9 rounded-lg bg-[#f0f6ff]/40 border-slate-200 text-xs focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[11px] font-semibold text-slate-700">Password</Label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email || "");
                      setResetCode("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setForgotError("");
                      setForgotSuccess("");
                      setForgotStep(1);
                      setIsForgotOpen(true);
                    }}
                    className="text-[11px] font-semibold text-[#0066cc] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 pl-9 rounded-lg bg-[#f0f6ff]/40 border-slate-200 text-xs focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              {/* Keep me signed in */}
              <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer pt-0.5 select-none">
                <Checkbox
                  id="keep-signed"
                  defaultChecked
                  className="h-3.5 w-3.5 rounded border-slate-300 data-[state=checked]:bg-[#0066cc] data-[state=checked]:border-[#0066cc]"
                />
                <span className="text-[11px]">{t("keepSignedIn")}</span>
              </label>

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-lg bg-[#0066cc] hover:bg-[#0052a3] text-white font-semibold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> {t("signingIn")}
                  </>
                ) : (
                  <>
                    <span>{t("signInButton")}</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-2.5 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-white px-2.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                OR
              </span>
            </div>

            {/* Google Login Button */}
            <GoogleAuthButton
              roleTarget="customer"
              text="Continue with Google"
              className="h-10 rounded-lg border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs"
              onError={(msg) => setError(msg)}
            />

            {/* Don't have an account? Section */}
            <div className="mt-3 rounded-xl border border-slate-200/80 bg-[#f8fafc] p-2.5 space-y-1.5">
              <p className="text-[11px] font-semibold text-slate-800">Don&apos;t have an account?</p>
              <div className="grid gap-1.5">
                <Link
                  href="/register"
                  className="group flex items-center justify-between rounded-lg border border-slate-200/80 bg-white p-2 transition-all hover:border-slate-300 hover:shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-slate-600">
                      <UserRound className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold text-slate-800">Create a buyer account</span>
                      <span className="block text-[10px] text-slate-500">Post sourcing enquiries and find members</span>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-700 shrink-0 ml-1" />
                </Link>

                <Link
                  href="/register-business"
                  className="group flex items-center justify-between rounded-lg border border-slate-200/80 bg-white p-2 transition-all hover:border-slate-300 hover:shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-slate-600">
                      <Building2 className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold text-slate-800">Register your business</span>
                      <span className="block text-[10px] text-slate-500">Join chamber directory & receive sales leads</span>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-700 shrink-0 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-[28px] p-7 sm:p-8 border border-slate-100 bg-white shadow-2xl">
          {/* Header with Circular Icon Badge matching Image */}
          <div className="flex items-start gap-4 mb-2">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f0f7ff] text-[#0060df] border border-[#d9ebfb]">
              <KeyRound className="h-7 w-7 stroke-[2.2]" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold tracking-tight text-[#0f172a]">
                {forgotStep === 1 && (
                  <>
                    Reset <span className="text-[#C90000]">Password</span>
                  </>
                )}
                {forgotStep === 2 && (
                  <>
                    Enter Verification <span className="text-[#C90000]">Code</span>
                  </>
                )}
                {forgotStep === 3 && "Create New Password"}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-[#64748b] leading-normal">
                {forgotStep === 1 && "Enter your registered email address to receive a 6-digit verification code."}
                {forgotStep === 2 && (
                  <>
                    We sent a 6-digit verification code to{" "}
                    <span className="font-semibold text-[#0060df]">{forgotEmail}</span>. Please enter it below.
                  </>
                )}
                {forgotStep === 3 && "Verification successful! Please choose a new password for your account."}
              </DialogDescription>
            </div>
          </div>

          {forgotSuccess && (
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> {forgotSuccess}
            </div>
          )}

          {forgotError && (
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" /> {forgotError}
            </div>
          )}

          {/* Step 1: Enter Email Form */}
          {forgotStep === 1 && (
            <form onSubmit={handleSendResetCode} className="space-y-4 pt-2">
              <div>
                <Label htmlFor="forgot-email" className="block text-sm font-bold text-[#0f172a] mb-2">
                  Registered Email
                </Label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#0060df]">
                    <Mail className="h-5 w-5 stroke-[2]" />
                  </div>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="you@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0060df] focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              {/* Info Notice Box matching reference image */}
              <div className="flex items-start gap-3 rounded-xl border border-[#d9ebfb] bg-[#f0f7ff] p-3.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#dbeafe] text-[#0060df]">
                  <Shield className="h-4 w-4 stroke-[2.2]" />
                </div>
                <div className="text-xs leading-relaxed text-[#475569]">
                  We&apos;ll send a 6-digit verification code to this email address.
                  <br />
                  Please check your inbox and spam folder.
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsForgotOpen(false)}
                  disabled={forgotLoading}
                  className="h-11 px-6 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={forgotLoading}
                  className="h-11 px-6 rounded-xl bg-[#0060df] hover:bg-[#0051bd] text-white font-semibold flex items-center gap-2 shadow-sm transition-all"
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      <span>Send Verification Code</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Step 2: Enter OTP Code Form matching user's image */}
          {forgotStep === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 pt-1" autoComplete="off">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-bold text-[#0f172a]">
                    6-Digit Verification Code
                  </Label>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={forgotLoading}
                    className="text-xs font-semibold text-[#0060df] hover:underline flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <span>Resend code</span>
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>

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

              {/* Timer Notice matching reference image */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 my-4">
                <Shield className="h-3.5 w-3.5 text-[#0060df]" />
                <span>
                  Enter the code within{" "}
                  <span className="font-bold text-[#C90000]">{formatTimer(otpTimer)}</span> minutes
                </span>
              </div>

              <div className="h-px bg-slate-100 my-4" />

              {/* Action Buttons matching reference image */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setForgotStep(1);
                    setForgotError("");
                    setForgotSuccess("");
                  }}
                  disabled={forgotLoading}
                  className="h-12 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors"
                >
                  <Mail className="h-4 w-4 text-slate-500" />
                  <span>Change Email</span>
                </Button>
                <Button
                  type="submit"
                  disabled={forgotLoading || otpDigits.join("").length < 6}
                  className="h-12 rounded-xl bg-[#0060df] hover:bg-[#0051bd] text-white font-semibold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  {forgotLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Shield className="h-4 w-4 stroke-[2.2]" />
                      <span>Verify OTP</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Create New Password Form matching user's image */}
          {forgotStep === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4 pt-1" autoComplete="off">
              <div>
                <Label htmlFor="new-pw" className="block text-sm font-bold text-[#0f172a] mb-2">
                  New Password
                </Label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <Input
                    id="new-pw"
                    name="new-pw"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0060df] focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {/* Helper text matching screenshot */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                  <Shield className="h-3.5 w-3.5 text-[#0060df] shrink-0 stroke-[2.2]" />
                  <span>Use at least 6 characters with a mix of letters, numbers &amp; symbols</span>
                </div>
              </div>

              <div>
                <Label htmlFor="confirm-new-pw" className="block text-sm font-bold text-[#0f172a] mb-2">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <Input
                    id="confirm-new-pw"
                    name="confirm-new-pw"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0060df] focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setForgotStep(2);
                    setForgotError("");
                    setForgotSuccess("");
                  }}
                  disabled={forgotLoading}
                  className="h-11 px-8 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={forgotLoading || !newPassword || newPassword.length < 6}
                  className="h-11 px-6 rounded-xl bg-[#0060df] hover:bg-[#0051bd] text-white font-semibold flex items-center gap-2 shadow-sm transition-all"
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <span>Set Password &amp; Sign In</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Bottom Decorative Color Stripe matching RIFAH theme */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#0060df] via-[#0060df] via-80% to-[#dc2626] rounded-b-[28px] absolute bottom-0 left-0" />
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}

export { LoginPage };
