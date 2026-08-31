"use client";
import { Building2, CheckCircle2, Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";

import { PublicLayout } from "@shared/components/rifah/public-layout";
import { Panel, SectionHeader } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import { Textarea } from "@shared/components/ui/textarea";
import { chapters } from "@shared/lib/mock-data";

const desks = [
  { name: "Membership desk", detail: "Plan selection, upgrades and renewals" },
  { name: "Verification team", detail: "Document review and listing approvals" },
  { name: "Trade facilitation unit", detail: "Buyer enquiries and lead routing" },
  { name: "Events desk", detail: "Trade meets, clinics and chapter sessions" },
];

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <PublicLayout>
      <div className="rifah-container py-6 sm:py-10">
        <SectionHeader
          title="Contact RIFAH"
          description="The secretariat routes enquiries to the correct desk or regional chapter within one working day."
        />

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Panel title="Send a message">
            {sent ? (
              <div className="py-6 text-center">
                <span className="inline-grid h-12 w-12 place-items-center rounded-full bg-success-soft text-success">
                  <CheckCircle2 className="h-6 w-6" />
                </span>
                <h2 className="mt-3 text-base font-semibold">Message sent</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Reference MSG-3391. The secretariat will respond to your email.
                </p>
                <Button variant="outline" className="mt-5" onClick={() => setSent(false)}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form
                className="grid gap-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="cname">Full name</Label>
                  <Input id="cname" required placeholder="Your name" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="corg">Organisation</Label>
                  <Input id="corg" placeholder="Company or institution" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cemail">Email</Label>
                  <Input id="cemail" type="email" required placeholder="you@example.com" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cphone">Phone</Label>
                  <Input id="cphone" type="tel" placeholder="Mobile number" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cdesk">Which desk?</Label>
                  <Select>
                    <SelectTrigger id="cdesk">
                      <SelectValue placeholder="Select a desk" />
                    </SelectTrigger>
                    <SelectContent>
                      {desks.map((d) => (
                        <SelectItem key={d.name} value={d.name}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cchapter">Chapter</Label>
                  <Select>
                    <SelectTrigger id="cchapter">
                      <SelectValue placeholder="Select a chapter" />
                    </SelectTrigger>
                    <SelectContent>
                      {chapters.map((c) => (
                        <SelectItem key={c.name} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="cmsg">Message</Label>
                  <Textarea id="cmsg" rows={5} required placeholder="How can the chamber help?" />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" size="lg" className="w-full sm:w-auto sm:min-w-48">
                    <Send className="h-4 w-4" /> Send message
                  </Button>
                </div>
              </form>
            )}
          </Panel>

          <div className="space-y-4">
            <Panel title="Secretariat">
              <ul className="space-y-3 text-sm">
                <li className="flex gap-2.5">
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>RIFAH Chamber of Commerce & Industries — head secretariat</span>
                </li>
                <li className="flex gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>Demo address, Mumbai, Maharashtra</span>
                </li>
                <li className="flex gap-2.5">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>+91 00000 00000 (placeholder)</span>
                </li>
                <li className="flex gap-2.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>connect@rifah.example</span>
                </li>
                <li className="flex gap-2.5">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>Mon – Sat, 10:00 – 18:00</span>
                </li>
              </ul>
            </Panel>
            <Panel title="Desks">
              <ul className="space-y-2.5">
                {desks.map((d) => (
                  <li key={d.name} className="rounded-xl border border-border p-3">
                    <p className="text-sm font-semibold">{d.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{d.detail}</p>
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel title="Regional chapters">
              <ul className="space-y-2">
                {chapters.map((c) => (
                  <li key={c.name} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate">{c.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{c.city}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}


export { ContactPage };
export default ContactPage;
