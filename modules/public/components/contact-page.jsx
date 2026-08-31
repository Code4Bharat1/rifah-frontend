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
import { useChapters } from "@shared/hooks/use-rifah-api";

const desks = [
  { name: "Membership desk", detail: "Plan selection, upgrades and renewals" },
  { name: "Verification team", detail: "Document review and listing approvals" },
  { name: "Trade facilitation unit", detail: "Buyer enquiries and lead routing" },
  { name: "Events desk", detail: "Trade meets, clinics and chapter sessions" },
];

function ContactPage() {
  const [sent, setSent] = useState(false);
  const { data: chaptersData } = useChapters();
  const chapters = chaptersData || [];

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
                  The secretariat will respond to your registered email shortly.
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
                        <SelectItem key={c._id || c.name} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="cmsg">Message</Label>
                  <Textarea
                    id="cmsg"
                    rows={4}
                    required
                    placeholder="Tell us what you need or how we can help..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" size="lg">
                    <Send className="h-4 w-4" /> Send message
                  </Button>
                </div>
              </form>
            )}
          </Panel>

          <aside className="space-y-4">
            <Panel title="Central Secretariat">
              <div className="space-y-3 text-sm">
                <p className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    RIFAH Chamber of Commerce & Industry
                    <br />
                    Central Secretariat, Byculla, Mumbai 400 008
                  </span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  <a href="tel:+912223456789" className="hover:underline">
                    +91 22 2345 6789
                  </a>
                </p>
                <p className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-primary" />
                  <a href="mailto:secretariat@rifah.org" className="hover:underline">
                    secretariat@rifah.org
                  </a>
                </p>
                <p className="flex items-center gap-2.5 text-xs text-muted-foreground">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span>Mon–Fri · 09:30–18:00 IST</span>
                </p>
              </div>
            </Panel>

            <Panel title="Desks & working units">
              <ul className="space-y-2.5 text-xs">
                {desks.map((d) => (
                  <li key={d.name} className="rounded-lg bg-surface-muted p-2.5">
                    <p className="font-semibold text-foreground">{d.name}</p>
                    <p className="text-muted-foreground">{d.detail}</p>
                  </li>
                ))}
              </ul>
            </Panel>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}

export { ContactPage };
export default ContactPage;
