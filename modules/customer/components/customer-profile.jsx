"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  Save,
  KeyRound,
} from "lucide-react";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { useAuth } from "@shared/providers/auth-provider";
import { userApi, authApi } from "@shared/lib/api-services";
import { toast } from "sonner";

export function CustomerProfile() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?role=customer&redirect=${encodeURIComponent("/customer/profile")}`);
    }
  }, [user, authLoading]);

  // Profile info state
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        city: user.city || "",
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSavingProfile(true);
    try {
      await userApi.updateProfile({
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
        city: profileForm.city.trim(),
      });
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      toast.error("Enter current password");
      return;
    }
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setSavingPassword(true);
    try {
      await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password changed successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(err?.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <AppShell
      role="customer"
      title="My Profile"
      subtitle="Manage your buyer account details, contact info and security"
    >
      <div className="max-w-3xl space-y-6">
        {/* Personal Contact Details Card */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border/60">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Contact Information</h3>
              <p className="text-xs text-muted-foreground">Used by vendors to respond to your enquiries</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold text-foreground mb-1.5 block">Full Name</Label>
                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                    className="pl-9 h-10 text-xs rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-foreground mb-1.5 block">Email Address (Read-only)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={profileForm.email}
                    disabled
                    className="pl-9 h-10 text-xs rounded-xl bg-muted/40 cursor-not-allowed opacity-80"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-foreground mb-1.5 block">Mobile Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                    className="pl-9 h-10 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-foreground mb-1.5 block">City / Delivery Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={profileForm.city}
                    onChange={(e) => setProfileForm((p) => ({ ...p, city: e.target.value }))}
                    className="pl-9 h-10 text-xs rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                disabled={savingProfile}
                className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    Save Details
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border/60">
            <div className="h-10 w-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Account Security</h3>
              <p className="text-xs text-muted-foreground">Change your password to keep your account secure</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label className="text-xs font-semibold text-foreground mb-1.5 block">Current Password</Label>
              <div className="relative max-w-sm">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showCurrent ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                  className="pl-9 pr-9 h-10 text-xs rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold text-foreground mb-1.5 block">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showNew ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                    className="pl-9 pr-9 h-10 text-xs rounded-xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-foreground mb-1.5 block">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Re-enter new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    className="pl-9 h-10 text-xs rounded-xl"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                disabled={savingPassword}
                variant="outline"
                className="h-9 px-4 rounded-xl text-xs font-semibold"
              >
                {savingPassword ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Updating...
                  </>
                ) : (
                  <>Update Password</>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
export default CustomerProfile;
