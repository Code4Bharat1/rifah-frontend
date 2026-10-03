"use client";
import { Building2, CheckCircle2, Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";

import { PublicLayout } from "@shared/components/rifah/public-layout";
import { Panel, SectionHeader } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { PhoneInput } from "@shared/components/ui/phone-input";
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
import { isValidName, isValidPhone } from "@shared/lib/validators";
import { toast } from "sonner";

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
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
      {/* 1. PREMIUM HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-14 sm:py-20 border-b border-white/5">
        {/* Premium Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-950 to-slate-950 pointer-events-none" />
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.04] pointer-events-none" />

        <div className="rifah-container relative z-10 text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight animate-[fadeInUp_0.8s_ease-out]">
            Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-emerald-300">RIFAH</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed animate-[fadeInUp_0.8s_ease-out_0.2s_both]">
            The central admin routes enquiries to the regional chapter within one working day.
          </p>
        </div>
      </section>

      <div className="rifah-container py-8 sm:py-12">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
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
                onChange={() => setIsDirty(true)}
                onReset={() => {
                  setResetKey((k) => k + 1);
                  setIsDirty(false);
                }}
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

                  if (!isValidName(payload.fullName)) {
                    toast.error("Enter a valid full name (letters only).");
                    setIsSubmitting(false);
                    return;
                  }

                  if (!isValidName(payload.organization)) {
                    toast.error("Enter a valid organisation name (letters only).");
                    setIsSubmitting(false);
                    return;
                  }

                  if (!isValidPhone(payload.phone)) {
                    toast.error("Enter a valid 10-digit phone number.");
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
                  <PhoneInput id="cphone" name="phone" required placeholder="Mobile number" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="cchapter">Chapter</Label>
                  <Select key={resetKey} name="chapter" onValueChange={() => setIsDirty(true)}>
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
                <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 mt-2">
                  <Button type="submit" size="lg" disabled={isSubmitting}>
                    <Send className="h-4 w-4 mr-2" /> {isSubmitting ? "Sending..." : "Send message"}
                  </Button>
                  {isDirty && (
                    <Button type="reset" variant="outline" size="lg" disabled={isSubmitting}>
                      Reset Form
                    </Button>
                  )}
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
