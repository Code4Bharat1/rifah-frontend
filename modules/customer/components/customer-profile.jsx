"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Separator } from "@shared/components/ui/separator";
import { Switch } from "@shared/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@shared/components/ui/dialog";
import { useAuth } from "@shared/providers/auth-provider";
import { userApi, authApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/api-client";
import {
  CheckCircle2,
  Loader2,
  KeyRound,
  Lock,
  Camera,
  Pencil,
  AlertTriangle,
  X,
} from "lucide-react";
import { toast } from "sonner";

function ProfilePage() {
  const router = useRouter();
  const { user, refreshProfile, refreshUser, logout } = useAuth();

  // View vs Edit Mode State
  const [isEditing, setIsEditing] = useState(false);

  // Avatar Upload State
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarErr, setAvatarErr] = useState(false);
  const fileInputRef = useRef(null);

  // Profile Form State
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    organization: user?.organization || "",
    city: user?.city || "",
    taxId: user?.taxId || "",
  });
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Change Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [pwData, setPwData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        organization: user.organization || "",
        city: user.city || "",
        taxId: user.taxId || "",
      });
    }
  }, [user]);

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image size must be under 5 MB.");
      return;
    }

    setAvatarError("");
    setAvatarLoading(true);
    try {
      await userApi.uploadAvatar(file);
      if (typeof refreshProfile === "function") await refreshProfile();
      else if (typeof refreshUser === "function") await refreshUser();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Avatar upload failed:", err);
      setAvatarError(err.message || "Failed to upload profile photo.");
    } finally {
      setAvatarLoading(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleDeleteAvatar = async () => {
    setAvatarLoading(true);
    try {
      await userApi.updateProfile({ avatar: "" });
      if (typeof refreshProfile === "function") await refreshProfile();
      else if (typeof refreshUser === "function") await refreshUser();
      toast.success("Profile photo removed successfully.");
    } catch (err) {
      toast.error(err.message || "Failed to remove profile photo.");
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        organization: user.organization || "",
        city: user.city || "",
        taxId: user.taxId || "",
      });
    }
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        organization: formData.organization,
        city: formData.city,
        taxId: formData.taxId,
      };
      if (formData.email && formData.email.trim()) {
        payload.email = formData.email.trim();
      }
      await userApi.updateProfile(payload);
      if (typeof refreshProfile === "function") await refreshProfile();
      else if (typeof refreshUser === "function") await refreshUser();
      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (!pwData.currentPassword) {
      setPwError("Please enter your current password.");
      return;
    }
    if (pwData.newPassword.length < 6) {
      setPwError("New password must be at least 6 characters long.");
      return;
    }
    if (pwData.newPassword !== pwData.confirmPassword) {
      setPwError("New password and confirm password do not match.");
      return;
    }

    setPwSaving(true);
    try {
      await authApi.changePassword({
        currentPassword: pwData.currentPassword,
        newPassword: pwData.newPassword,
      });
      setPwSuccess("Password changed successfully!");
      setPwData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPwSuccess("");
      }, 1500);
    } catch (err) {
      setPwError(err.message || "Failed to change password. Please verify current password.");
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <AppShell role="customer" title="Profile & settings" subtitle="Buyer account details">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Panel 
          title="Account details"
          action={
            !isEditing ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-1.5 font-medium hover:border-primary/50 hover:bg-primary/5"
              >
                <Pencil className="h-3.5 w-3.5 text-primary" /> Edit Profile
              </Button>
            ) : null
          }
        >
          {savedSuccess && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-success-soft p-3 text-xs font-semibold text-success">
              <CheckCircle2 className="h-4 w-4" /> Profile saved successfully.
            </div>
          )}

          {/* Profile Photo Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 pb-6 mb-6 border-b border-border/80">
            <div className="relative group">
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full border-2 border-primary/20 p-0.5 overflow-hidden shadow-sm bg-muted/40">
                {user?.avatar && !avatarErr ? (
                  <img
                    src={resolveMediaUrl(user.avatar)}
                    alt={user?.name || "User Avatar"}
                    onError={() => setAvatarErr(true)}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary to-navy text-xl sm:text-2xl font-bold text-white uppercase">
                    {user?.name?.slice(0, 2) || "CU"}
                  </div>
                )}
                {avatarLoading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-[1px]">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                )}
              </div>

                {/* Delete Avatar Button (appears on hover) */}
                {user?.avatar && (
                  <button
                    type="button"
                    onClick={handleDeleteAvatar}
                    disabled={avatarLoading}
                    className="absolute -top-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 cursor-pointer ring-2 ring-white z-10"
                    title="Remove profile photo"
                    aria-label="Remove profile photo"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}

                {/* Camera Upload Button */}
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={avatarLoading}
                  className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full bg-primary text-white shadow-md hover:bg-primary/90 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 z-10 cursor-pointer"
                  title="Upload profile photo"
                  aria-label="Upload profile photo"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

            <div className="flex-1 text-center sm:text-left min-w-0 pt-1">
              <h3 className="text-lg sm:text-xl font-bold text-foreground truncate">
                {user?.name || "Buyer Account"}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {user?.organization ? `${user.organization} · ` : ""}{user?.email}
              </p>
              <p className="text-[11px] text-muted-foreground mt-2">
                Click the camera icon to upload or update your profile picture (JPG, PNG, WebP max 5MB).
              </p>
              {avatarError && (
                <p className="text-xs font-semibold text-destructive mt-1.5 flex items-center gap-1 justify-center sm:justify-start">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {avatarError}
                </p>
              )}
            </div>
          </div>

          {/* View Mode (Read-only cards) */}
          {!isEditing ? (
            <div className="space-y-4">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5">
                  <span className="text-xs font-medium text-muted-foreground block">Full Name</span>
                  <span className="text-sm font-semibold text-foreground mt-0.5 block">{formData.name || "—"}</span>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5">
                  <span className="text-xs font-medium text-muted-foreground block">Email Address</span>
                  <span className="text-sm font-semibold text-foreground mt-0.5 flex items-center gap-1.5 truncate">
                    {formData.email || "—"}
                    <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      Verified
                    </span>
                  </span>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5">
                  <span className="text-xs font-medium text-muted-foreground block">Phone Number</span>
                  <span className="text-sm font-semibold text-foreground mt-0.5 block">{formData.phone || "Not provided"}</span>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5">
                  <span className="text-xs font-medium text-muted-foreground block">Organisation / Enterprise</span>
                  <span className="text-sm font-semibold text-foreground mt-0.5 block">{formData.organization || "Not specified"}</span>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5">
                  <span className="text-xs font-medium text-muted-foreground block">City</span>
                  <span className="text-sm font-semibold text-foreground mt-0.5 block">{formData.city || "Not specified"}</span>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5">
                  <span className="text-xs font-medium text-muted-foreground block">GST / Tax ID</span>
                  <span className="text-sm font-semibold text-foreground mt-0.5 font-mono block">{formData.taxId || "Not provided"}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Edit Mode (Interactive form) */
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
              <div className="grid gap-1.5">
                <Label htmlFor="name">Full name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-11"
                  placeholder="Full name"
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  disabled
                  value={formData.email}
                  className="h-11 bg-muted cursor-not-allowed"
                  placeholder="Email address"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-11"
                  placeholder="Phone number"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="org">Organisation</Label>
                <Input
                  id="org"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="h-11"
                  placeholder="Organisation"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="h-11"
                  placeholder="City"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="taxId">GST / Tax ID</Label>
                <Input
                  id="taxId"
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  className="h-11 uppercase"
                  placeholder="e.g. 27AAAAA0000A1Z5"
                />
              </div>
              <Separator className="sm:col-span-2" />
              <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                <Button type="submit" disabled={saving} className="font-semibold min-w-32">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </Panel>

        <div className="space-y-4">
          <Panel title="Notifications">
            <ul className="space-y-3.5 text-sm">
              <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <span className="text-foreground">Email me when a member responds</span>
                <Switch defaultChecked />
              </li>
              <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <span className="text-foreground">SMS alerts for high-priority enquiries</span>
                <Switch />
              </li>
              <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <span className="text-foreground">Weekly digest of new member listings</span>
                <Switch defaultChecked />
              </li>
              <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <span className="text-foreground">Event invitations from my chapter</span>
                <Switch defaultChecked />
              </li>
            </ul>
          </Panel>

          <Panel title="Security">
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-center h-10 font-medium"
                onClick={() => {
                  setPwError("");
                  setPwSuccess("");
                  setPwData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  setIsPasswordModalOpen(true);
                }}
              >
                <Lock className="mr-2 h-4 w-4 text-muted-foreground" />
                Change password
              </Button>
            </div>
          </Panel>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" /> Change Password
            </DialogTitle>
            <DialogDescription>
              Update your account password to maintain security.
            </DialogDescription>
          </DialogHeader>

          {pwSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-success-soft p-3 text-xs font-semibold text-success">
              <CheckCircle2 className="h-4 w-4" /> {pwSuccess}
            </div>
          )}

          {pwError && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive-soft p-3 text-xs font-semibold text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" /> {pwError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="current-pw">Current Password</Label>
              <Input
                id="current-pw"
                type="password"
                placeholder="Enter current password"
                value={pwData.currentPassword}
                onChange={(e) => setPwData({ ...pwData, currentPassword: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-pw">New Password</Label>
              <Input
                id="new-pw"
                type="password"
                placeholder="At least 6 characters"
                value={pwData.newPassword}
                onChange={(e) => setPwData({ ...pwData, newPassword: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-pw">Confirm New Password</Label>
              <Input
                id="confirm-pw"
                type="password"
                placeholder="Repeat new password"
                value={pwData.confirmPassword}
                onChange={(e) => setPwData({ ...pwData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <DialogFooter className="pt-2 sm:justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasswordModalOpen(false)}
                disabled={pwSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pwSaving}>
                {pwSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export { ProfilePage as CustomerProfile };
export default ProfilePage;
