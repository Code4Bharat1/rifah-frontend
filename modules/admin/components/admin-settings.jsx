"use client";
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

const toggles = [
  ["Manual verification required", "Every new listing is reviewed by the secretariat", true],
  ["Moderate reviews before publishing", "Buyer feedback stays hidden until approved", true],
  ["Allow public enquiry posting", "Buyers can post requirements without an account", false],
  ["Auto-route leads by category", "Match new enquiries to members automatically", true],
] ;

function AdminSettings() {
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
            {toggles.map(([title, desc, on]) => (
              <li key={title} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
                </div>
                <Switch defaultChecked={on} onCheckedChange={(checked) => toast.success(`${title} ${checked ? 'enabled' : 'disabled'}`)} />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Chamber details">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Organisation name</Label>
              <Input defaultValue="RIFAH Chamber of Commerce & Industries" className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label>Secretariat email</Label>
              <Input defaultValue="secretariat@example.org" className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label>Support phone</Label>
              <Input defaultValue="+00 0000 000000" className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label>Membership year</Label>
              <Input defaultValue="2026–27" className="h-11" />
            </div>
            <div className="col-span-full pt-2">
              <Button onClick={() => {
                toast.success("Settings saved successfully!");
              }}>Save Changes</Button>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}


export { AdminSettings };
export default AdminSettings;
