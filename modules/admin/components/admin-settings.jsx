"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Building2,
  CalendarDays,
  ChartNoAxesColumn,
  Compass,
  CreditCard,
  Eye,
  EyeOff,
  FileStack,
  GraduationCap,
  MapPin,
  MapPinned,
  MessageSquare,
  Radio,
  ScrollText,
  Shield,
  ShieldCheck,
  Star,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";

import { Input } from "@shared/components/ui/input";
import { PhoneInput } from "@shared/components/ui/phone-input";
import { Label } from "@shared/components/ui/label";
import { useSettings } from "@shared/hooks/use-rifah-api";
import { settingsApi, authApi } from "@shared/lib/api-services";
import { useAuth } from "@shared/providers/auth-provider";
import { isValidPhone } from "@shared/lib/validators";

// Central-admin-only modules that have no state-admin/chapter-admin equivalent route.
const adminModules = [
  { label: "Operations Center", to: "/admin/operations", icon: Radio },
  { label: "Businesses", to: "/admin/businesses", icon: Building2 },
  { label: "Enquiries", to: "/admin/enquiries", icon: FileStack },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Feeds", to: "/admin/feeds", icon: Compass },
  { label: "Business Analytics", to: "/admin/networking-analytics", icon: TrendingUp },
  { label: "Memberships", to: "/admin/memberships", icon: Star },
  { label: "Reviews", to: "/admin/reviews", icon: MessageSquare },
  { label: "Central Admin", to: "/admin/central-admin", icon: Shield },
  { label: "States", to: "/admin/states", icon: MapPin },
  { label: "Chapters", to: "/admin/chapters", icon: MapPinned },
  { label: "Units", to: "/admin/units", icon: Users },
  { label: "Events", to: "/admin/events", icon: Ticket },
  { label: "Payments", to: "/admin/payments", icon: CreditCard },
  { label: "Notifications", to: "/admin/notifications", icon: Bell },
  { label: "Reports", to: "/admin/reports", icon: ChartNoAxesColumn },
  { label: "Audit logs", to: "/admin/audit", icon: ScrollText },
  { label: "Roles & RBAC", to: "/admin/roles", icon: ShieldCheck },
  { label: "LMS", to: "/admin/lms", icon: GraduationCap },
];

const stateAdminModules = [
  { label: "Operations Center", to: "/state-admin/operations", icon: Radio },
  { label: "Chapters", to: "/state-admin/chapters", icon: MapPinned },
  { label: "Members", to: "/state-admin/members", icon: Users },
  { label: "Businesses", to: "/state-admin/businesses", icon: Building2 },
  { label: "Feeds", to: "/state-admin/feeds", icon: Compass },
  { label: "Business Analytics", to: "/state-admin/networking-analytics", icon: TrendingUp },
  { label: "Enquiries", to: "/state-admin/enquiries", icon: FileStack },
  { label: "Events", to: "/state-admin/events", icon: CalendarDays },
  { label: "Roles & RBAC", to: "/state-admin/roles", icon: ShieldCheck },
  { label: "Notifications", to: "/state-admin/notifications", icon: Bell },
  { label: "Reports", to: "/state-admin/reports", icon: ChartNoAxesColumn },
  { label: "Audit logs", to: "/state-admin/audit", icon: ScrollText },
  { label: "LMS", to: "/state-admin/lms", icon: GraduationCap },
];

const chapterAdminModules = [
  { label: "Operations Center", to: "/chapter-admin/operations", icon: Radio },
  { label: "Members", to: "/chapter-admin/members", icon: Users },
  { label: "Businesses", to: "/chapter-admin/businesses", icon: Building2 },
  { label: "Verification", to: "/chapter-admin/verification", icon: ShieldCheck },
  { label: "Events", to: "/chapter-admin/events", icon: CalendarDays },
  { label: "Feeds", to: "/chapter-admin/feeds", icon: Compass },
  { label: "Business Analytics", to: "/chapter-admin/networking-analytics", icon: TrendingUp },
  { label: "Enquiries", to: "/chapter-admin/enquiries", icon: FileStack },
  { label: "Roles & RBAC", to: "/chapter-admin/roles", icon: ShieldCheck },
  { label: "Notifications", to: "/chapter-admin/notifications", icon: Bell },
  { label: "Reports", to: "/chapter-admin/reports", icon: ChartNoAxesColumn },
  { label: "Audit logs", to: "/chapter-admin/audit", icon: ScrollText },
  { label: "LMS", to: "/chapter-admin/lms", icon: GraduationCap },
  { label: "Reviews", to: "/chapter-admin/reviews", icon: MessageSquare },
  { label: "Units", to: "/chapter-admin/units", icon: Users },
  { label: "Payments", to: "/chapter-admin/payments", icon: CreditCard },
];

const ROLE_CONFIG = {
  state_admin: {
    basePath: "/state-admin",
    title: "Settings and modules",
    subtitle: "Platform configuration for state administration",
    modules: stateAdminModules,
  },
  chapter_admin: {
    basePath: "/chapter-admin",
    title: "Settings and modules",
    subtitle: "Platform configuration for chapter administration",
    modules: chapterAdminModules,
  },
  admin: {
    basePath: "/admin",
    title: "Settings and modules",
    subtitle: "Platform configuration for central admin",
    modules: adminModules,
  },
};

function getRoleConfig(role) {
  return ROLE_CONFIG[role] || ROLE_CONFIG.admin;
}

export function AdminSettings({ expectedRole }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const role = user?.role || expectedRole || "admin";
  const { basePath, title, subtitle, modules } = getRoleConfig(role);
  
  // BUG-017: Chamber details, moderation rules, fees and system limits are
  // organisation-wide settings owned by Central Admin. State/chapter admins
  // should only see the module shortcuts and their own account security.
  const isCentralAdmin = role === "admin" || role === "central_admin";
  const { data: globalSettings, refetch, isLoading } = useSettings();

  const [chamberDetails, setChamberDetails] = useState({
    organisationName: "RIFAH Chamber of Commerce & Industry",
    secretariatEmail: "secretariat@rifah.org",
    supportPhone: "+91 22 2345 6789",
    secretariatAddress: "Central Admin Office, Byculla, Mumbai 400 008",
    workingHours: "Mon–Fri · 09:30–18:00 IST",
    membershipYear: "2026-27"
  });

  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingChamber, setSavingChamber] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const handleChangePassword = async () => {
    if (!passwords.currentPassword || !passwords.newPassword) return toast.error("Please fill both password fields.");
    if (passwords.currentPassword === passwords.newPassword) return toast.error("New password cannot be the same as the current password.");
    if (passwords.newPassword.length < 6) return toast.error("New password must be at least 6 characters.");

    setSavingPassword(true);
    try {
      await authApi.changePassword({ oldPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success("Password changed successfully!");
      setPasswords({ currentPassword: "", newPassword: "" });
    } catch (e) {
      toast.error(e.message || "Failed to change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  useEffect(() => {
    if (globalSettings) {
      setChamberDetails({
        organisationName: globalSettings.organisationName || "RIFAH Chamber of Commerce & Industry",
        secretariatEmail: globalSettings.secretariatEmail || "secretariat@rifah.org",
        supportPhone: globalSettings.supportPhone || "+91 22 2345 6789",
        secretariatAddress: globalSettings.secretariatAddress || "Central Admin Office, Byculla, Mumbai 400 008",
        workingHours: globalSettings.workingHours || "Mon–Fri · 09:30–18:00 IST",
        membershipYear: globalSettings.membershipYear || "2026-27"
      });
    }
  }, [globalSettings]);

  const handleSaveChamberDetails = async () => {
    if (!isValidPhone(chamberDetails.supportPhone)) {
      toast.error("Enter a valid support phone number.");
      return;
    }
    setSavingChamber(true);
    try {
      await settingsApi.update(chamberDetails);
      toast.success("Chamber details saved successfully!");
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    } catch (e) {
      toast.error(e?.message || "Failed to save chamber details");
    } finally {
      setSavingChamber(false);
    }
  };

  return (
    <AppShell role={role || "admin"} title={title} subtitle={subtitle}>
      <div className="space-y-4">
        <Panel title="All admin modules">
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((m) => (
              <Button key={m.to} asChild variant="outline" className="h-auto justify-start gap-3 px-3.5 py-3">
                <Link href={m.to}>
                  <m.icon className="h-4 w-4 shrink-0 text-primary" />
                  <span className="min-w-0 truncate">{m.label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </Panel>

        {isCentralAdmin && (
          <Panel title="Chamber details">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Organisation name</Label>
                <Input
                  value={chamberDetails.organisationName}
                  onChange={(e) => setChamberDetails({ ...chamberDetails, organisationName: e.target.value })}
                  className="h-11"
                  placeholder="RIFAH Chamber of Commerce & Industry"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Central Admin email</Label>
                <Input
                  type="email"
                  value={chamberDetails.secretariatEmail}
                  onChange={(e) => setChamberDetails({ ...chamberDetails, secretariatEmail: e.target.value })}
                  className="h-11"
                  placeholder="admin@rifah.org"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Support phone *</Label>
                <PhoneInput
                  required
                  value={chamberDetails.supportPhone}
                  onChange={(e) => setChamberDetails({ ...chamberDetails, supportPhone: e.target.value })}
                  placeholder="22 2345 6789"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Membership year</Label>
                <Input
                  value={chamberDetails.membershipYear}
                  onChange={(e) => setChamberDetails({ ...chamberDetails, membershipYear: e.target.value })}
                  className="h-11"
                  placeholder="2026-27"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Central Admin address</Label>
                <Input
                  value={chamberDetails.secretariatAddress}
                  onChange={(e) => setChamberDetails({ ...chamberDetails, secretariatAddress: e.target.value })}
                  className="h-11"
                  placeholder="Central Admin Office, Byculla, Mumbai 400 008"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Working hours / Timings</Label>
                <Input
                  value={chamberDetails.workingHours}
                  onChange={(e) => setChamberDetails({ ...chamberDetails, workingHours: e.target.value })}
                  className="h-11"
                  placeholder="Mon–Fri · 09:30–18:00 IST"
                />
              </div>
              <div className="col-span-full pt-2">
                <Button onClick={handleSaveChamberDetails} disabled={savingChamber}>
                  {savingChamber ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </Panel>
        )}

        <Panel title="Security & Authentication">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 max-w-3xl">
            <div className="space-y-1.5">
              <Label>Current password</Label>
              <div className="relative">
                <Input
                  type={showPasswords ? "text" : "password"}
                  placeholder="Enter current password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground flex items-center justify-center"
                >
                  {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>New password</Label>
              <div className="relative">
                <Input
                  type={showPasswords ? "text" : "password"}
                  placeholder="Enter new password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground flex items-center justify-center"
                >
                  {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Minimum 6 characters required</p>
            </div>
            <div className="col-span-full pt-2">
              <Button onClick={handleChangePassword} disabled={savingPassword}>
                {savingPassword ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}

export default AdminSettings;
