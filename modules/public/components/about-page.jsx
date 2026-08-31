"use client";
import Link from "next/link";
import { Building2, CalendarDays, Handshake, MapPin, ShieldCheck, Target, Users } from "lucide-react";

import { PublicLayout } from "@shared/components/rifah/public-layout";
import { Pill } from "@shared/components/rifah/badges";
import { Panel, SectionHeader, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { chapters, units } from "@shared/lib/mock-data";

const pillars = [
  {
    icon: Handshake,
    title: "Networking",
    body: "Member-to-member introductions across chapters, trade meets and business clinics.",
  },
  {
    icon: Target,
    title: "Lead generation",
    body: "Buyer enquiries are routed to verified members matched by category, city and capacity.",
  },
  {
    icon: ShieldCheck,
    title: "Verification & trust",
    body: "The secretariat reviews documents before a listing carries the RIFAH verified badge.",
  },
  {
    icon: Users,
    title: "Member support",
    body: "Membership desks, advisory units and chapter secretaries support day-to-day needs.",
  },
];

function AboutPage() {
  return (
    <PublicLayout>
      <section className="border-b border-border bg-navy text-navy-foreground">
        <div className="rifah-container py-10 sm:py-14">
          <Pill tone="primary">Chamber of Commerce & Industry</Pill>
          <h1 className="mt-3 max-w-3xl text-2xl font-bold leading-tight sm:text-4xl">
            Together for a sustainable future
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-navy-foreground/75 sm:text-base">
            RIFAH Chamber of Commerce & Industry brings together manufacturers, traders, exporters and service
            businesses. RIFAH Connect is the chamber's digital platform for discovery, membership, enquiries and
            events — prototype content is shown for stakeholder review.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild variant="brand">
              <Link href="/register-business">Join RIFAH</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/contact">Contact the secretariat</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="rifah-container py-6 sm:py-10">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Member businesses" value="589" icon={Building2} />
          <StatCard label="Regional chapters" value={String(chapters.length)} icon={MapPin} />
          <StatCard label="Specialised units" value={String(units.length)} icon={Users} />
          <StatCard label="Events this year" value="20" icon={CalendarDays} />
        </div>

        <div className="mt-8">
          <SectionHeader
            title="What the chamber does"
            description="Four pillars shape every module in RIFAH Connect."
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {pillars.map((p) => (
              <Panel key={p.title} bodyClassName="p-4">
                <span className="inline-grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
                  <p.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 text-sm font-semibold">{p.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
              </Panel>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <Panel title="Chapters" description="Regional presence and member strength">
            <ul className="divide-y divide-border">
              {chapters.map((c) => (
                <li key={c.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.city}, {c.state} · {c.businesses} businesses · {c.events} events
                    </p>
                  </div>
                  <Pill tone={c.status === "Active" ? "success" : "neutral"}>{c.status}</Pill>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Specialised units" description="Focused working groups under the chapters">
            <ul className="divide-y divide-border">
              {units.map((u) => (
                <li key={u.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{u.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {u.chapter} · {u.focus} · {u.members} members
                    </p>
                  </div>
                  <Pill tone={u.status === "Active" ? "success" : "neutral"}>{u.status}</Pill>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel className="mt-8" title="Membership" description="Access to the directory, leads and events">
          <p className="text-sm text-muted-foreground">
            Members list products and services, receive routed buyer enquiries, join chamber events and access
            advisory support. Plans and inclusions are detailed on the membership page.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/membership">View membership plans</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/discover">Browse the directory</Link>
            </Button>
          </div>
        </Panel>
      </div>
    </PublicLayout>
  );
}


export { AboutPage };
export default AboutPage;
