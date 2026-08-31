"use client";
import { useState } from "react";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Separator } from "@shared/components/ui/separator";
import { Switch } from "@shared/components/ui/switch";
import { useAuth } from "@shared/providers/auth-provider";
import { userApi } from "@shared/lib/api-services";
import { CheckCircle2, Loader2 } from "lucide-react";

function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    organization: user?.organization || "",
    city: user?.city || "",
  });
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userApi.updateProfile(formData);
      await refreshUser();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
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
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                disabled
                value={formData.email}
                className="h-11 bg-muted"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="org">Organisation</Label>
              <Input
                id="org"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="h-11"
              />
            </div>
            <Separator className="sm:col-span-2" />
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </div>
          </form>
        </Panel>

        <div className="space-y-4">
          <Panel title="Notifications">
            <ul className="space-y-3.5 text-sm">
              <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <span>Email alerts on RFQ responses</span>
                <Switch defaultChecked />
              </li>
              <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <span>Chapter event invitations</span>
                <Switch defaultChecked />
              </li>
            </ul>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}

export { ProfilePage as CustomerProfile };
export default ProfilePage;
