"use client";
import React, { useState } from "react";
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
  ShieldCheck,
} from "lucide-react";
import { PublicLayout } from "@shared/components/rifah/public-layout";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { useAuth } from "@shared/providers/auth-provider";
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

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!form.email.trim() || !form.email.includes("@")) {
      setError("Please enter a valid email address.");
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
        email: form.email.toLowerCase().trim(),
        password: form.password,
        phone: form.phone.trim(),
        city: form.city.trim(),
        role: "customer",
      });

      toast.success("Account created successfully! Welcome to RIFAH.");
      if (redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")) {
        router.push(redirectParam);
      } else {
        router.push("/customer");
      }
    } catch (err) {
      setError(err?.message || "Failed to create customer account. Please try again.");
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
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[11px] font-semibold tracking-wide uppercase mb-0.5">
                    <ShieldCheck className="h-3 w-3" /> Customer Registration
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    Create Buyer Account
                  </h1>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 mb-6">
                Discover verified chamber businesses, submit direct enquiries, receive instant quotations, and communicate directly with suppliers.
              </p>

              {error && (
                <div className="mb-5 rounded-xl bg-destructive/10 border border-destructive/20 p-3 flex items-start gap-2.5 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">Full Name *</Label>
                  <div className="relative">
                    <UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="e.g. Imran Khan"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="pl-10 h-10.5 rounded-xl border-slate-200 text-sm focus:border-emerald-500 focus:ring-emerald-500/20"
                      required
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="pl-10 h-10.5 rounded-xl border-slate-200 text-sm focus:border-emerald-500 focus:ring-emerald-500/20"
                      required
                    />
                  </div>
                </div>

                {/* Phone & City Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">Mobile Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type="tel"
                        placeholder="+91 9876543210"
                        value={form.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        className="pl-10 h-10.5 rounded-xl border-slate-200 text-sm focus:border-emerald-500 focus:ring-emerald-500/20"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">City / Location *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="e.g. Mumbai"
                        value={form.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        className="pl-10 h-10.5 rounded-xl border-slate-200 text-sm focus:border-emerald-500 focus:ring-emerald-500/20"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 6 chars"
                        value={form.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        className="pl-10 pr-9 h-10.5 rounded-xl border-slate-200 text-sm focus:border-emerald-500 focus:ring-emerald-500/20"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        value={form.confirmPassword}
                        onChange={(e) => handleChange("confirmPassword", e.target.value)}
                        className="pl-10 pr-9 h-10.5 rounded-xl border-slate-200 text-sm focus:border-emerald-500 focus:ring-emerald-500/20"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                  disabled={submitting}
                  className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Customer Account
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Alternative Actions */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2.5 text-center text-xs">
                <p className="text-slate-500">
                  Already have an account?{" "}
                  <Link
                    href={redirectParam ? `/login?role=customer&redirect=${encodeURIComponent(redirectParam)}` : "/login?role=customer"}
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
