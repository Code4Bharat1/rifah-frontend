"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, KeyRound } from "lucide-react";

import { RifahLogo } from "@shared/components/rifah/brand";
import { PublicLayout } from "@shared/components/rifah/public-layout";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { useAuth } from "@shared/providers/auth-provider";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, changePassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError("Please fill in both fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      // Hit the new change-password endpoint via AuthContext
      const updatedUser = await changePassword({ newPassword: password });
      toast.success("Password changed successfully!");
      
      // Redirect to correct dashboard based on role
      if (updatedUser?.role === "chapter_admin") {
        const slug = updatedUser.chapter.toLowerCase().replace(/\s+/g, '-');
        router.push(`/${slug}/admin`);
      } else if (updatedUser?.role === "super_admin" || updatedUser?.role === "secretariat") {
        router.push("/admin");
      } else if (updatedUser?.role === "business_owner") {
        router.push("/biz");
      } else {
        router.push("/me");
      }
    } catch (err) {
      setError(err.message || "Failed to change password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout bare>
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 sm:px-8">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-border">
          <div className="flex justify-center pb-6">
            <RifahLogo className="h-10" />
          </div>
          
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <KeyRound className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Change Your Password</h1>
            <p className="mt-2 text-sm text-slate-500">
              For your security, please choose a new password before accessing your account dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="mt-6 w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save and Continue
            </Button>
          </form>
        </div>
      </div>
    </PublicLayout>
  );
}
