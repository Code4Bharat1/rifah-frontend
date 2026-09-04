"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Bell,
  Building2,
  CalendarDays,
  ChartNoAxesColumn,
  CreditCard,
  FileStack,
  Folder,
  MapPinned,
  MessageSquare,
  ScrollText,
  ShieldCheck,
  Star,
  Target,
  Users,
} from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";

import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Switch } from "@shared/components/ui/switch";
import { useSettings } from "@shared/hooks/use-rifah-api";
import { settingsApi } from "@shared/lib/api-services";

const modules = [
  { label: "Businesses", to: "/admin/businesses", icon: Building2 },
  { label: "Verification", to: "/admin/verification", icon: ShieldCheck },
  { label: "Users & roles", to: "/admin/users", icon: Users },
  { label: "Memberships", to: "/admin/memberships", icon: Star },
  { label: "Enquiries", to: "/admin/enquiries", icon: FileStack },
  { label: "Lead routing", to: "/admin/leads", icon: Target },
  { label: "Reviews", to: "/admin/reviews", icon: MessageSquare },
  { label: "Categories", to: "/admin/categories", icon: Folder },
  { label: "Chapters", to: "/admin/chapters", icon: MapPinned },
  { label: "Units", to: "/admin/units", icon: Users },
  { label: "Events", to: "/admin/events", icon: CalendarDays },
  { label: "Payments", to: "/admin/payments", icon: CreditCard },
  { label: "Announcements", to: "/admin/notifications", icon: Bell },
  { label: "Reports", to: "/admin/reports", icon: ChartNoAxesColumn },
  { label: "Audit log", to: "/admin/audit", icon: ScrollText },
] ;

const togglesTemplate = [
  { key: "manualVerificationRequired", title: "Manual verification required", desc: "Every new listing is reviewed by the secretariat", defaultOn: true },
  { key: "moderateReviewsBeforePublishing", title: "Moderate reviews before publishing", desc: "Buyer feedback stays hidden until approved", defaultOn: true },
  { key: "allowPublicEnquiryPosting", title: "Allow public enquiry posting", desc: "Buyers can post requirements without an account", defaultOn: false },
  { key: "autoRouteLeadsByCategory", title: "Auto-route leads by category", desc: "Match new enquiries to members automatically", defaultOn: true },
];

function AdminSettings() {
  const { data: globalSettings, refetch } = useSettings();
  const settings = globalSettings || {};
  
  const [chamberDetails, setChamberDetails] = useState({
    organisationName: "RIFAH Chamber of Commerce & Industries",
    secretariatEmail: "secretariat@example.org",
    supportPhone: "+00 0000 000000",
    membershipYear: "2026-27"
  });
  
  const [toggleStates, setToggleStates] = useState({});

  const [fees, setFees] = useState({
    registrationFee: 1000,
    defaultMembershipFee: 5000,
  });

  const [limits, setLimits] = useState({
    leadLimitPerMonth: 100,
    maxCatalogueItems: 50,
    maxImagesPerItem: 5,
  });

  useEffect(() => {
    if (globalSettings) {
      setChamberDetails({
        organisationName: globalSettings.organisationName || "RIFAH Chamber of Commerce & Industries",
        secretariatEmail: globalSettings.secretariatEmail || "secretariat@example.org",
        supportPhone: globalSettings.supportPhone || "+00 0000 000000",
        membershipYear: globalSettings.membershipYear || "2026-27"
      });
      
      const newToggles = {};
      togglesTemplate.forEach(t => {
        newToggles[t.key] = globalSettings[t.key] !== undefined ? globalSettings[t.key] : t.defaultOn;
      });
      setToggleStates(newToggles);

      setFees({
        registrationFee: globalSettings.registrationFee ?? 1000,
        defaultMembershipFee: globalSettings.defaultMembershipFee ?? 5000,
      });

      setLimits({
        leadLimitPerMonth: globalSettings.leadLimitPerMonth ?? 100,
        maxCatalogueItems: globalSettings.maxCatalogueItems ?? 50,
        maxImagesPerItem: globalSettings.maxImagesPerItem ?? 5,
      });
    }
  }, [globalSettings]);
  
  const handleToggle = async (key, value) => {
    // Optimistic UI update
    setToggleStates(prev => ({ ...prev, [key]: value }));
    try {
      await settingsApi.update({ [key]: value });
      toast.success("Settings updated");
    } catch (e) {
      // Revert on failure
      setToggleStates(prev => ({ ...prev, [key]: !value }));
      toast.error("Failed to update settings");
    }
  };

  const handleSaveChamberDetails = async () => {
    try {
      await settingsApi.update(chamberDetails);
      toast.success("Chamber details saved successfully!");
      refetch();
    } catch (e) {
      toast.error("Failed to save chamber details");
    }
  };

  const handleSaveFees = async () => {
    try {
      await settingsApi.update(fees);
      toast.success("Fees configuration saved!");
      refetch();
    } catch (e) {
      toast.error("Failed to save fees");
    }
  };

  const handleSaveLimits = async () => {
    try {
      await settingsApi.update(limits);
      toast.success("System limits saved!");
      refetch();
    } catch (e) {
      toast.error("Failed to save limits");
    }
  };

  return (
    <AppShell role="admin" title="Settings and modules" subtitle="Platform configuration for the secretariat">
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

        <Panel title="Moderation rules">
          <ul className="divide-y divide-border">
            {togglesTemplate.map(({ key, title, desc, defaultOn }) => {
              const isOn = toggleStates[key] !== undefined ? toggleStates[key] : defaultOn;
              return (
                <li key={title} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Switch 
                    checked={isOn} 
                    onCheckedChange={(checked) => handleToggle(key, checked)} 
                  />
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel title="Chamber details">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Organisation name</Label>
              <Input 
                value={chamberDetails.organisationName} 
                onChange={(e) => setChamberDetails({...chamberDetails, organisationName: e.target.value})}
                className="h-11" 
              />
            </div>
            <div className="space-y-1.5">
              <Label>Secretariat email</Label>
              <Input 
                value={chamberDetails.secretariatEmail}
                onChange={(e) => setChamberDetails({...chamberDetails, secretariatEmail: e.target.value})}
                className="h-11" 
              />
            </div>
            <div className="space-y-1.5">
              <Label>Support phone</Label>
              <Input 
                value={chamberDetails.supportPhone}
                onChange={(e) => setChamberDetails({...chamberDetails, supportPhone: e.target.value})}
                className="h-11" 
              />
            </div>
            <div className="space-y-1.5">
              <Label>Membership year</Label>
              <Input 
                value={chamberDetails.membershipYear}
                onChange={(e) => setChamberDetails({...chamberDetails, membershipYear: e.target.value})}
                className="h-11" 
              />
            </div>
            <div className="col-span-full pt-2">
              <Button onClick={handleSaveChamberDetails}>Save Changes</Button>
            </div>
          </div>
        </Panel>

        <Panel title="Fees configuration">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Registration fee (₹)</Label>
              <Input 
                type="number" 
                value={fees.registrationFee} 
                onChange={(e) => setFees({...fees, registrationFee: Number(e.target.value)})}
                className="h-11" 
              />
            </div>
            <div className="space-y-1.5">
              <Label>Default membership fee (₹)</Label>
              <Input 
                type="number" 
                value={fees.defaultMembershipFee} 
                onChange={(e) => setFees({...fees, defaultMembershipFee: Number(e.target.value)})}
                className="h-11" 
              />
            </div>
            <div className="col-span-full pt-2">
              <Button onClick={handleSaveFees}>Save Fees</Button>
            </div>
          </div>
        </Panel>

        <Panel title="System limits">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Lead limit per month</Label>
              <Input 
                type="number" 
                value={limits.leadLimitPerMonth} 
                onChange={(e) => setLimits({...limits, leadLimitPerMonth: Number(e.target.value)})}
                className="h-11" 
              />
              <p className="text-xs text-muted-foreground">Max leads a business can receive monthly</p>
            </div>
            <div className="space-y-1.5">
              <Label>Max catalogue items</Label>
              <Input 
                type="number" 
                value={limits.maxCatalogueItems} 
                onChange={(e) => setLimits({...limits, maxCatalogueItems: Number(e.target.value)})}
                className="h-11" 
              />
              <p className="text-xs text-muted-foreground">Max products a business can list</p>
            </div>
            <div className="space-y-1.5">
              <Label>Max images per item</Label>
              <Input 
                type="number" 
                value={limits.maxImagesPerItem} 
                onChange={(e) => setLimits({...limits, maxImagesPerItem: Number(e.target.value)})}
                className="h-11" 
              />
              <p className="text-xs text-muted-foreground">Max images allowed per product listing</p>
            </div>
            <div className="col-span-full pt-2">
              <Button onClick={handleSaveLimits}>Save Limits</Button>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}

export { AdminSettings };
export default AdminSettings;
