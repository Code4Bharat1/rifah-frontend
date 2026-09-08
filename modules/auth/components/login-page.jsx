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
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
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
      <div className="grid min-h-[calc(100vh-68px)] lg:h-[calc(100vh-68px)] lg:max-h-[calc(100vh-68px)] lg:grid-cols-12 bg-[#f8fafc] overflow-y-auto lg:overflow-hidden no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Left Hero / Brand Showcase (Hidden on mobile, shown on lg+) */}
        <div className="relative hidden lg:flex lg:col-span-7 flex-col justify-between overflow-hidden bg-[#071328] p-8 xl:p-12 text-white select-none h-full">
          {/* Skyscraper background image with smooth gradient blend */}
          <div className="absolute right-0 top-0 bottom-0 w-[72%] xl:w-[68%] pointer-events-none select-none overflow-hidden">
            <img
              src="/images/login-building.jpg"
              alt="RIFAH Architecture"
              className="h-full w-full object-cover object-center"
            />
            {/* Smooth gradient fade to blend with text naturally */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#071328] via-[#071328]/80 via-35% to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#071328] via-transparent to-transparent" />

            {/* Illuminated RIFAH Building Logo on glass facade */}
            <div className="absolute top-[28%] right-[14%] xl:right-[18%] flex items-center gap-2.5 z-10 pointer-events-none drop-shadow-[0_0_20px_rgba(56,189,248,0.6)]">
              <svg className="w-9 h-9 shrink-0 filter drop-shadow" viewBox="0 0 100 100" fill="none">
                <path d="M15 15 L50 50 L15 85 L32 85 L60 50 L32 15 Z" fill="#38bdf8" />
                <path d="M42 15 L77 50 L42 85 L59 85 L87 50 L59 15 Z" fill="#ffffff" />
              </svg>
              <div className="text-white">
                <div className="text-sm xl:text-base font-extrabold tracking-wider leading-none">RIFAH</div>
                <div className="text-[7px] xl:text-[8px] font-semibold text-slate-200 tracking-wider leading-tight uppercase mt-0.5">
                  Chamber Of Commerce<br />And Industry
                </div>
              </div>
            </div>

            {/* Script text in the sky: Stronger Businesses A Brighter Tomorrow */}
            <div className="absolute top-6 right-8 xl:top-8 xl:right-10 z-10 text-right pointer-events-none select-none">
              <div
                className="text-2xl xl:text-3xl text-sky-200/90 leading-[1.1] font-bold"
                style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
              >
                <span>Stronger</span><br />
                <span>Businesses</span><br />
                <span>A Brighter</span><br />
                <span>Tomorrow</span>
              </div>
              <div className="flex justify-end mt-1">
                <svg width="105" height="12" viewBox="0 0 105 12" fill="none">
                  <path d="M 5 6 Q 52 1 100 8" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Top Tag */}
          <div className="relative z-10 flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#38bdf8]">
              RIFAH CONNECT
            </span>
            <div className="h-[2px] w-8 rounded-full bg-[#38bdf8]" />
          </div>

          {/* Middle Content: Heading, Subtitle, 4 Pillars & Stats */}
          <div className="relative z-10 my-auto space-y-4 xl:space-y-5 max-w-xl py-2">
            <h1 className="text-2xl sm:text-3xl xl:text-[36px] 2xl:text-[40px] font-extrabold tracking-tight text-white leading-[1.18]">
              One chamber network<br />
              for discovery, enquiries<br />
              and <span className="text-[#38bdf8]">verified trade.</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-md">
              Members receive matched buyer enquiries, manage their catalogue and participate in chapter events from a single workspace.
            </p>

            {/* 4 Feature Badges in a row */}
            <div className="grid grid-cols-4 gap-2 xl:gap-3 pt-1">
              <div className="flex flex-col items-start gap-1.5">
                <div className="flex h-9 w-9 xl:h-10 xl:w-10 items-center justify-center rounded-xl bg-[#0c1e38]/80 border border-sky-500/20 text-[#38bdf8] shadow-sm">
                  <Users className="h-4 w-4 xl:h-5 xl:w-5 stroke-[2]" />
                </div>
                <span className="text-[11px] font-medium text-slate-200 leading-tight">Verified Network</span>
              </div>
              <div className="flex flex-col items-start gap-1.5">
                <div className="flex h-9 w-9 xl:h-10 xl:w-10 items-center justify-center rounded-xl bg-[#0c1e38]/80 border border-sky-500/20 text-[#38bdf8] shadow-sm">
                  <BarChart3 className="h-4 w-4 xl:h-5 xl:w-5 stroke-[2]" />
                </div>
                <span className="text-[11px] font-medium text-slate-200 leading-tight">Business Opportunities</span>
              </div>
              <div className="flex flex-col items-start gap-1.5">
                <div className="flex h-9 w-9 xl:h-10 xl:w-10 items-center justify-center rounded-xl bg-[#0c1e38]/80 border border-sky-500/20 text-[#38bdf8] shadow-sm">
                  <Calendar className="h-4 w-4 xl:h-5 xl:w-5 stroke-[2]" />
                </div>
                <span className="text-[11px] font-medium text-slate-200 leading-tight">Events & Collaborations</span>
              </div>
              <div className="flex flex-col items-start gap-1.5">
                <div className="flex h-9 w-9 xl:h-10 xl:w-10 items-center justify-center rounded-xl bg-[#0c1e38]/80 border border-sky-500/20 text-[#38bdf8] shadow-sm">
                  <ShieldCheck className="h-4 w-4 xl:h-5 xl:w-5 stroke-[2]" />
                </div>
                <span className="text-[11px] font-medium text-slate-200 leading-tight">Trusted Ecosystem</span>
              </div>
            </div>

            {/* Stats Row (4 stats across with indicator lines & dividers) */}
            <div className="flex items-center gap-3 xl:gap-4 pt-3 border-t border-slate-700/40">
              {/* Stat 1 */}
              <div className="flex items-center gap-2">
                <div className="w-[3px] h-7 bg-[#dc2626] rounded-full shrink-0" />
                <div>
                  <div className="text-base xl:text-lg font-bold text-white leading-none">5,000+</div>
                  <div className="text-[10px] xl:text-[11px] text-slate-300 font-medium mt-0.5">Verified Members</div>
                </div>
              </div>

              <div className="h-6 w-px bg-slate-700/60" />

              {/* Stat 2 */}
              <div className="flex items-center gap-2">
                <div className="w-[2px] h-7 bg-sky-400 rounded-full shrink-0" />
                <div>
                  <div className="text-base xl:text-lg font-bold text-white leading-none">28+</div>
                  <div className="text-[10px] xl:text-[11px] text-slate-300 font-medium mt-0.5">Chapters Across India</div>
                </div>
              </div>

              <div className="h-6 w-px bg-slate-700/60" />

              {/* Stat 3 */}
              <div className="flex items-center gap-2">
                <div className="w-[3px] h-7 bg-[#dc2626] rounded-full shrink-0" />
                <div>
                  <div className="text-base xl:text-lg font-bold text-white leading-none">50+</div>
                  <div className="text-[10px] xl:text-[11px] text-slate-300 font-medium mt-0.5">Events Every Year</div>
                </div>
              </div>

              <div className="h-6 w-px bg-slate-700/60" />

              {/* Stat 4 */}
              <div className="flex items-center gap-2">
                <div className="w-[3px] h-7 bg-[#dc2626] rounded-full shrink-0" />
                <div>
                  <div className="text-base xl:text-lg font-bold text-white leading-none">100+</div>
                  <div className="text-[10px] xl:text-[11px] text-slate-300 font-medium mt-0.5">Business Categories</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Tagline on bottom-left & Floating Quote Card on bottom-right */}
          <div className="relative z-10 flex items-end justify-between gap-3 pt-2">
            {/* Tagline on bottom-left */}
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-6 bg-[#dc2626]" />
              <span className="text-[10px] font-semibold tracking-[0.22em] text-slate-400 uppercase">
                TOGETHER FOR A SUSTAINABLE FUTURE
              </span>
            </div>

            {/* Frosted Glass Quote Card */}
            <div className="rounded-2xl border border-white/10 bg-[#071328]/85 backdrop-blur-md p-4 shadow-2xl max-w-[230px] text-left">
              <span className="text-2xl font-serif text-[#38bdf8] leading-none block select-none">“</span>
              <p className="mt-1 text-xs font-semibold text-slate-100 leading-snug">
                Building connections today for a stronger tomorrow.
              </p>
              <div className="mt-2.5 h-0.5 w-8 rounded-full bg-[#dc2626]" />
            </div>
          </div>
        </div>

        {/* Right Form Container - Responsive for mobile & desktop */}
        <div className="lg:col-span-5 flex items-center justify-center p-3 sm:p-5 lg:p-6 xl:p-8 bg-[#f8fafc] min-h-full overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="w-full max-w-[450px] rounded-[28px] sm:rounded-[32px] border border-slate-100 bg-white p-5 sm:p-7 xl:p-8 shadow-[0_12px_45px_-12px_rgba(0,0,0,0.08)] relative overflow-hidden my-auto">
            {/* Top Right Decorative Watermark with Curved Lines and Connect / Collaborate / Grow */}
            <div className="absolute top-0 right-0 pointer-events-none select-none w-44 h-44 overflow-hidden">
              <svg viewBox="0 0 160 160" fill="none" className="w-full h-full text-sky-400/30">
                <path d="M 160 20 A 140 140 0 0 0 20 160" stroke="currentColor" strokeWidth="1" />
                <path d="M 160 45 A 115 115 0 0 0 45 160" stroke="currentColor" strokeWidth="1" />
                <path d="M 160 70 A 90 90 0 0 0 70 160" stroke="currentColor" strokeWidth="1" />
                <path d="M 160 95 A 65 65 0 0 0 95 160" stroke="currentColor" strokeWidth="1" />
                <path d="M 160 120 A 40 40 0 0 0 120 160" stroke="currentColor" strokeWidth="1" />
              </svg>
              <div className="absolute top-5 right-6 flex flex-col items-start gap-1 text-[11px] font-semibold text-slate-400/90 leading-tight">
                <span>Connect</span>
                <span>Collaborate</span>
                <span>Grow</span>
              </div>
            </div>

            {/* Header */}
            <div className="relative z-10">
              <h1 className="text-2xl sm:text-[25px] font-bold tracking-tight text-slate-900">
                {t("title")}
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
                {t("subtitle")}
              </p>
            </div>

            {error && (
              <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive animate-in fade-in-50 relative z-10">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-50 p-2 text-xs font-semibold text-emerald-700 animate-in fade-in-50 relative z-10">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form className="mt-4 space-y-3 relative z-10" onSubmit={handleSubmit}>
              {/* Email Field with Left Icon */}
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                  Email
                </Label>
                <div className="relative flex items-center rounded-xl bg-[#f0f4f9] border border-transparent focus-within:border-[#0077e6] focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all px-3.5 py-2.5">
                  <Mail className="h-4 w-4 text-slate-400 mr-2.5 shrink-0 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                  />
                </div>
              </div>

              {/* Password Field with Left Lock & Right Eye Toggle */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                    Password
                  </Label>
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
                    className="text-xs font-semibold text-[#0077e6] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative flex items-center rounded-xl bg-[#f0f4f9] border border-transparent focus-within:border-[#0077e6] focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all px-3.5 py-2.5">
                  <Lock className="h-4 w-4 text-slate-400 mr-2.5 shrink-0 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none pr-7"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Keep me signed in */}
              <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer pt-0.5 select-none">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#0077e6] focus:ring-[#0077e6] accent-[#0077e6] cursor-pointer"
                />
                <span className="text-xs text-slate-600">Keep me signed in</span>
              </label>

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 sm:h-11 rounded-xl bg-[#0077e6] hover:bg-[#0066cc] text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all mt-0.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("signingIn")}
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-3 flex items-center justify-center relative z-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                OR
              </span>
            </div>

            {/* Google Login Button */}
            <div className="relative z-10">
              <GoogleAuthButton
                roleTarget="customer"
                text="Continue with Google"
                className="w-full h-10 sm:h-10.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-2xs transition-all flex items-center justify-center gap-2.5"
                onError={(msg) => setError(msg)}
              />
            </div>

            {/* Don't have an account? Section */}
            <div className="mt-3.5 sm:mt-4 rounded-2xl border border-slate-100 bg-[#f8fafc] p-2.5 sm:p-3 space-y-1.5 relative z-10">
              <p className="text-xs font-bold text-slate-800 px-1">Don&apos;t have an account?</p>
              <div className="grid gap-1.5">
                <Link
                  href="/register"
                  className="group flex items-center justify-between rounded-xl border border-slate-100 bg-white p-2.5 transition-all hover:border-slate-200 hover:shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-[#0284c7]">
                      <Building2 className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-800">Create a buyer account</span>
                      <span className="block text-[10px] text-slate-500">Post sourcing enquiries and find members</span>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-700 shrink-0 mr-1" />
                </Link>

                <Link
                  href="/register-business"
                  className="group flex items-center justify-between rounded-xl border border-slate-100 bg-white p-2.5 transition-all hover:border-slate-200 hover:shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-[#0284c7]">
                      <UserRound className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-800">Register your business</span>
                      <span className="block text-[10px] text-slate-500">Join chamber directory & receive sales leads</span>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-700 shrink-0 mr-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
        <DialogContent className="w-[94vw] max-w-[480px] rounded-[24px] sm:rounded-[28px] p-5 sm:p-8 border border-slate-100 bg-white shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Header with Circular Icon Badge */}
          <div className="flex items-start gap-3 sm:gap-4 mb-2">
            <div className="flex h-11 w-11 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-full bg-[#f0f7ff] text-[#0060df] border border-[#d9ebfb]">
              <KeyRound className="h-5 w-5 sm:h-7 sm:w-7 stroke-[2.2]" />
            </div>
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-[#0f172a]">
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

                {/* 6 Individual Digit Input Boxes - Responsive across all phone screens */}
                <div className="flex items-center justify-between gap-1.5 sm:gap-2.5 my-3">
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
                      className={`h-12 w-9 sm:h-14 sm:w-11 md:h-16 md:w-14 rounded-xl sm:rounded-2xl border text-center text-lg sm:text-xl md:text-2xl font-bold transition-all outline-none bg-white ${
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
