"use client";
import { useState, useEffect } from "react";
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
import {
  CheckCircle2,
  Loader2,
  KeyRound,
  Lock,
} from "lucide-react";

function ProfilePage() {
  const router = useRouter();
  const { user, refreshProfile, refreshUser, logout } = useAuth();

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
        <Panel title="Account details">
          {savedSuccess && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-success-soft p-3 text-xs font-semibold text-success">
              <CheckCircle2 className="h-4 w-4" /> Profile saved successfully.
            </div>
          )}
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
            <div className="grid gap-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-11"
                placeholder="Full name"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                disabled
                value={formData.email}
                className="h-11 bg-muted"
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
                className="h-11"
                placeholder="e.g. 27AAAAA0000A1Z5"
              />
            </div>
            <Separator className="sm:col-span-2" />
            <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
              <Button type="submit" disabled={saving}>
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
