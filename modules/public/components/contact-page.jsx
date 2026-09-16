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
import { useChapters, useSettings } from "@shared/hooks/use-rifah-api";
import { contactApi } from "@shared/lib/api-services";
import { toast } from "sonner";

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: chaptersData } = useChapters();
  const { data: settings, isLoading: isSettingsLoading } = useSettings({
    staleTime: 0,
    refetchOnMount: "always",
  });
  const chapters = chaptersData || [];

  const cleanSettings = settings?.data || settings || {};
  const orgName = cleanSettings.organisationName || "";
  const orgEmail = cleanSettings.centralAdminEmail || cleanSettings.secretariatEmail || "";
  const orgPhone = cleanSettings.supportPhone ? String(cleanSettings.supportPhone) : "";
  const orgAddress = cleanSettings.centralAdminAddress || cleanSettings.secretariatAddress || "";
  const orgHours = cleanSettings.workingHours || "";

  return (
    <PublicLayout>
      <div className="rifah-container py-6 sm:py-10">
        <SectionHeader
          title="Contact RIFAH"
          description="The central admin routes enquiries to the regional chapter within one working day."
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
                  The central admin will respond to your registered email shortly.
                </p>
                <Button variant="outline" className="mt-5" onClick={() => setSent(false)}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form
                className="grid gap-4 sm:grid-cols-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  const formData = new FormData(e.currentTarget);
                  const payload = {
                    fullName: formData.get("fullName"),
                    organization: formData.get("organization"),
                    email: formData.get("email"),
                    phone: formData.get("phone"),
                    desk: "General",
                    chapter: formData.get("chapter"),
                    message: formData.get("message"),
                  };

                  if (!payload.chapter) {
                    toast.error("Please select a chapter.");
                    setIsSubmitting(false);
                    return;
                  }

                  try {
                    await contactApi.submitQuery(payload);
                    setSent(true);
                  } catch (err) {
                    toast.error(err.message || "Failed to send message. Please try again.");
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="cname">Full name</Label>
                  <Input id="cname" name="fullName" required placeholder="Your name" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="corg">Organisation</Label>
                  <Input id="corg" name="organization" required placeholder="Company or institution" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cemail">Email</Label>
                  <Input id="cemail" name="email" type="email" required placeholder="you@example.com" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cphone">Phone</Label>
                  <Input id="cphone" name="phone" type="tel" required placeholder="Mobile number" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="cchapter">Chapter</Label>
                  <Select name="chapter">
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
                    name="message"
                    rows={4}
                    required
                    placeholder="Tell us what you need or how we can help..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" size="lg" disabled={isSubmitting}>
                    <Send className="h-4 w-4" /> {isSubmitting ? "Sending..." : "Send message"}
                  </Button>
                </div>
              </form>
            )}
          </Panel>

          <aside className="space-y-4">
            <Panel title="Central Admin">
              {isSettingsLoading ? (
                <div className="space-y-3 py-2 text-sm text-muted-foreground animate-pulse">
                  <div className="h-4 w-3/4 rounded bg-muted"></div>
                  <div className="h-4 w-1/2 rounded bg-muted"></div>
                  <div className="h-4 w-2/3 rounded bg-muted"></div>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  {(orgName || orgAddress) ? (
                    <p className="flex items-start gap-2.5">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="whitespace-pre-line leading-relaxed">
                        {orgName && <strong className="font-semibold block text-foreground">{orgName}</strong>}
                        {orgAddress && <span className="text-muted-foreground">{orgAddress}</span>}
                      </span>
                    </p>
                  ) : null}
                  {orgPhone ? (
                    <p className="flex items-center gap-2.5">
                      <Phone className="h-4 w-4 shrink-0 text-primary" />
                      <a href={`tel:${orgPhone.replace(/[^+\d]/g, "")}`} className="hover:underline text-foreground">
                        {orgPhone}
                      </a>
                    </p>
                  ) : null}
                  {orgEmail ? (
                    <p className="flex items-center gap-2.5">
                      <Mail className="h-4 w-4 shrink-0 text-primary" />
                      <a href={`mailto:${orgEmail}`} className="hover:underline text-foreground">
                        {orgEmail}
                      </a>
                    </p>
                  ) : null}
                  {orgHours ? (
                    <p className="flex items-center gap-2.5 text-xs text-muted-foreground">
                      <Clock className="h-4 w-4 shrink-0" />
                      <span>{orgHours}</span>
                    </p>
                  ) : null}
                </div>
              )}
            </Panel>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}

export { ContactPage };
export default ContactPage;
