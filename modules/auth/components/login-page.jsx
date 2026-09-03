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
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

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

function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

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
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="hidden flex-col justify-between bg-navy p-10 lg:flex">
          <RifahLogo className="h-10" onDark />
          <div>
            <h2 className="max-w-sm text-3xl font-bold leading-tight tracking-tight text-primary-foreground">
              One chamber network for discovery, enquiries and verified trade.
            </h2>
            <p className="mt-3 max-w-sm text-sm text-primary-foreground/70">
              Members receive matched buyer enquiries, manage their catalogue and participate in chapter events from a
              single workspace.
            </p>
          </div>
          <p className="text-xs text-primary-foreground/50">RIFAH Connect · Production Authenticated Session</p>
        </div>

        <div className="flex items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-sm">
            <div className="lg:hidden">
              <RifahLogo className="h-9" />
            </div>
            <h1 className="mt-6 text-2xl font-bold tracking-tight lg:mt-0">Sign in</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Access your RIFAH account using your credentials.
            </p>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-success/30 bg-success-soft p-3 text-xs font-semibold text-success">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                <span>{successMsg}</span>
              </div>
            )}

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
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
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11"
                />
              </div>
              <label className="flex items-center gap-2.5 text-sm">
                <Checkbox defaultChecked /> <span>Keep me signed in</span>
              </label>
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">or</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <GoogleAuthButton
              roleTarget="customer"
              text="Continue with Google"
              onError={(msg) => setError(msg)}
            />

            <div className="my-6 border-t border-border" />

            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Don&apos;t have an account?</p>
              <div className="grid gap-2">
                <Link
                  href="/register"
                  className="flex items-center justify-between rounded-xl border border-border bg-surface p-3 text-left text-sm font-medium transition-colors hover:border-primary/40 hover:bg-muted/40"
                >
                  <div>
                    <span className="block font-semibold">Create a buyer account</span>
                    <span className="block text-xs text-muted-foreground">Post sourcing enquiries and find members</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>

                <Link
                  href="/register-business"
                  className="flex items-center justify-between rounded-xl border border-border bg-surface p-3 text-left text-sm font-medium transition-colors hover:border-primary/40 hover:bg-muted/40"
                >
                  <div>
                    <span className="block font-semibold">Register your business</span>
                    <span className="block text-xs text-muted-foreground">Join chamber directory & receive sales leads</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
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
export default LoginPage;
