"use client";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Separator } from "@shared/components/ui/separator";
import { Switch } from "@shared/components/ui/switch";

const fields = [
  { id: "name", label: "Full name", value: "Rehan Qureshi" },
  { id: "email", label: "Email", value: "rehan@example.com" },
  { id: "phone", label: "Phone", value: "Placeholder number" },
  { id: "org", label: "Organisation", value: "Demo buyer account" },
  { id: "city", label: "City", value: "Mumbai" },
  { id: "gst", label: "GST / Tax ID", value: "Placeholder ID" },
];

const prefs = [
  ["Email me when a member responds", true],
  ["SMS alerts for high-priority enquiries", false],
  ["Weekly digest of new member listings", true],
  ["Event invitations from my chapter", true],
] ;

function ProfilePage() {
  return (
    <AppShell role="customer" title="Profile & settings" subtitle="Buyer account details">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Panel title="Account details" description="Prototype form — values are not saved">
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
            {fields.map((f) => (
              <div key={f.id} className="grid gap-1.5">
                <Label htmlFor={f.id}>{f.label}</Label>
                <Input id={f.id} defaultValue={f.value} className="h-11" />
              </div>
            ))}
            <Separator className="sm:col-span-2" />
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Button type="submit">Save changes</Button>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </div>
          </form>
        </Panel>

        <div className="space-y-4">
          <Panel title="Notifications">
            <ul className="space-y-3.5">
              {prefs.map(([label, on]) => (
                <li key={label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <span className="text-sm">{label}</span>
                  <Switch defaultChecked={on} aria-label={label} />
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Security">
            <div className="grid gap-2">
              <Button variant="outline">Change password</Button>
              <Button variant="outline">Enable two-factor authentication</Button>
              <Button variant="ghost" className="text-destructive">
                Deactivate account
              </Button>
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}


const CustomerProfile = ProfilePage;

export { CustomerProfile };
export default CustomerProfile;
