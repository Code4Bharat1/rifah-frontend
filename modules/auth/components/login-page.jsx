"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, KeyRound, CheckCircle2, Lock, ArrowRight } from "lucide-react";
import { useState } from "react";

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

const quickDemoLogins = [
  {
    role: "RIFAH Admin",
    email: "admin@gmail.com",
    pass: "12345678",
    target: "/admin",
    icon: ShieldCheck,
    note: "All access chamber monitoring",
  },
];
import { authApi } from "@shared/lib/api-services";
import { GoogleAuthButton } from "@shared/components/rifah/google-button";

function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Forgot Password Modal State
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: enter email, 2: enter code & new password
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const user = await login({ email, password });
      if (user.role === "super_admin" || user.role === "secretariat") {
        router.push("/admin");
      } else if (user.role === "business_owner") {
        router.push("/biz");
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
    if (!forgotEmail) {
      setForgotError("Please enter your registered email address.");
      return;
    }
    setForgotError("");
    setForgotLoading(true);
    try {
      const res = await authApi.forgotPassword({ email: forgotEmail });
      setForgotSuccess(res.message || "Reset verification code generated.");
      if (res.data?.resetToken) {
        setResetCode(res.data.resetToken);
      }
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.message || "No account found with this email address.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetCode) {
      setForgotError("Please enter the 6-digit verification code.");
      return;
    }
    if (newPassword.length < 6) {
      setForgotError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError("Passwords do not match.");
      return;
    }

    setForgotError("");
    setForgotLoading(true);
    try {
      await authApi.resetPassword({
        email: forgotEmail,
        resetToken: resetCode,
        newPassword,
      });
      setForgotSuccess("Password reset successfully! You may now sign in.");
      setEmail(forgotEmail);
      setPassword("");
      setTimeout(() => {
        setIsForgotOpen(false);
        setForgotStep(1);
        setForgotSuccess("");
      }, 2000);
    } catch (err) {
      setForgotError(err.message || "Invalid or expired reset code.");
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
                      setForgotEmail(email);
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" /> Reset Password
            </DialogTitle>
            <DialogDescription>
              {forgotStep === 1
                ? "Enter your registered email address to receive a password reset verification code."
                : "Enter the 6-digit code and choose a new password."}
            </DialogDescription>
          </DialogHeader>

          {forgotSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-success-soft p-3 text-xs font-semibold text-success">
              <CheckCircle2 className="h-4 w-4 shrink-0" /> {forgotSuccess}
            </div>
          )}

          {forgotError && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive-soft p-3 text-xs font-semibold text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" /> {forgotError}
            </div>
          )}

          {forgotStep === 1 ? (
            <form onSubmit={handleSendResetCode} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="forgot-email">Registered Email</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="you@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>

              <DialogFooter className="pt-2 sm:justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsForgotOpen(false)}
                  disabled={forgotLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={forgotLoading}>
                  {forgotLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                    </>
                  ) : (
                    "Send Verification Code"
                  )}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="reset-code">6-Digit Verification Code</Label>
                <Input
                  id="reset-code"
                  type="text"
                  placeholder="e.g. 583921"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-pw">New Password</Label>
                <Input
                  id="new-pw"
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-new-pw">Confirm New Password</Label>
                <Input
                  id="confirm-new-pw"
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <DialogFooter className="pt-2 sm:justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForgotStep(1)}
                  disabled={forgotLoading}
                >
                  Back
                </Button>
                <Button type="submit" disabled={forgotLoading}>
                  {forgotLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting...
                    </>
                  ) : (
                    "Confirm Reset"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}

export { LoginPage };
export default LoginPage;
