"use client";

import Link from "next/link";
import {
  Building2,
  CalendarDays,
  Handshake,
  MapPin,
  ShieldCheck,
  Target,
  Users,
  BookOpen,
  Newspaper,
  ArrowRight,
} from "lucide-react";

import { PublicLayout } from "@shared/components/rifah/public-layout";
import { Pill } from "@shared/components/rifah/badges";
import { Panel, SectionHeader, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { useChapters, usePublicStats } from "@shared/hooks/use-rifah-api";

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
    body: "The central admin reviews documents before a listing carries the RIFAH verified badge.",
  },
  {
    icon: Users,
    title: "Member support",
    body: "Membership desks, advisory units and chapter secretaries support day-to-day needs.",
  },
];

function AboutPage() {
  const { data: chaptersData } = useChapters();
  const { data: statsData } = usePublicStats();

  const chapters = chaptersData || [];
  const kpi = statsData?.kpi || {};

  const totalUnits = chapters.reduce((sum, c) => sum + (c.units?.length || 0), 0);

  return (
    <PublicLayout>
      {/* ── 1. Initial Content: Hero Banner ── */}
      <section className="border-b border-border bg-navy text-navy-foreground">
        <div className="rifah-container py-10 sm:py-14">
          <Pill tone="primary">Chamber of Commerce & Industry</Pill>
          <h1 className="mt-3 max-w-3xl text-2xl font-bold leading-tight sm:text-4xl">
            Together for a sustainable future
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-navy-foreground/75 sm:text-base">
            RIFAH Chamber of Commerce & Industry brings together manufacturers, traders, exporters and service
            businesses. RIFAH Connect is the chamber's digital platform for discovery, membership, enquiries and
            events.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="brand" className="font-semibold shadow-md">
              <Link href="/register-business">Join RIFAH</Link>
            </Button>
            <Button
              asChild
              className="border border-white/20 bg-white text-navy font-semibold hover:bg-slate-100 hover:text-navy shadow-sm transition-colors"
            >
              <Link href="/contact">Contact central admin</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── 1. Initial Content: Stats, Pillars, and Regional Chapters ── */}
      <div className="rifah-container py-6 sm:py-10">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Member businesses" value={String(kpi.totalBusinesses ?? 0)} icon={Building2} />
          <StatCard label="Regional chapters" value={String(chapters.length ?? 0)} icon={MapPin} />
          <StatCard label="Specialised units" value={String(totalUnits ?? 0)} icon={Users} />
          <StatCard label="Verified Members" value={String(kpi.verifiedBusinesses ?? 0)} icon={CalendarDays} />
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
                <li key={c._id || c.slug} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.city}, {c.state} · {c.businessesCount || 0} businesses · {c.eventsCount || 0} events
                    </p>
                  </div>
                  <Pill tone={c.status === "Active" ? "success" : "neutral"}>{c.status}</Pill>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Specialised focus units" description="Targeted support initiatives under chapters">
            <ul className="divide-y divide-border">
              {chapters.flatMap((c) => (c.units || []).map((u) => ({ ...u, chapterName: c.name }))).slice(0, 6).map((u, i) => (
                <li key={i} className="py-3">
                  <p className="text-sm font-medium text-foreground">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.focus} · ({u.chapterName})</p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      {/* ── 2. Below Down: Who we are? ── */}
      <section className="bg-background py-12 sm:py-16 lg:py-20 border-t border-border/60">
        <div className="rifah-container max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Who we <span className="text-primary font-black">are</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground leading-relaxed">
              RIFAH CHAMBER OF COMMERCE IS A VIBRANT BUSINESS NETWORK UNITING ENTREPRENEURS, PROFESSIONALS, AND ENTERPRISES. WE FOSTER ETHICAL BUSINESS PRACTICES, ECONOMIC EMPOWERMENT, AND INCLUSIVE GROWTH.
            </p>
          </div>

          <div className="mt-12 sm:mt-16 grid gap-10 md:grid-cols-2 lg:gap-16">
            {/* Column 1: OUR COMPANY */}
            <div className="flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary">
                  OUR COMPANY
                </h3>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  Established with a vision to promote responsible entrepreneurship,{" "}
                  <strong className="font-semibold text-foreground">
                    Rifah Chamber of Commerce
                  </strong>{" "}
                  is a not-for-profit organization dedicated to empowering businesses through ethical leadership, collaboration, and inclusive growth. We provide a trusted platform for entrepreneurs and professionals to thrive through mentorship, networking, and knowledge-sharing.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  Our core services include business consulting, start-up support, international trade, and financial advisory.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/discover"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors group"
                >
                  <span>View Our Services</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>

            {/* Column 2: AWESOME TEAM */}
            <div className="flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary">
                  AWESOME TEAM
                </h3>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  At Rifah Chamber of Commerce, our leadership team brings together a diverse group of professionals and changemakers driven by purpose and passion. From experienced business leaders to social impact strategists, each team member plays a key role in shaping our vision and extending our impact across sectors and regions.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors group"
                >
                  <span>Meet Our Team</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Below Down: How can we help you today? ── */}
      <section className="bg-muted/20 py-12 sm:py-16 lg:py-20 border-t border-border/60">
        <div className="rifah-container max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              How can we <span className="text-primary font-black">help you</span> today?
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground leading-relaxed">
              LET US CONNECT YOU WITH THE RIGHT RESOURCES, GUIDANCE, OR EXPERTISE TO MOVE YOUR BUSINESS FORWARD.
            </p>
          </div>

          <div className="mt-12 sm:mt-16 grid gap-6 md:grid-cols-3">
            {/* Card 1: Documentation */}
            <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs hover:border-primary/40 hover:shadow-md transition-all group">
              <div>
                <div className="grid h-12 w-12 place-items-center rounded-xl border border-border/80 bg-background text-foreground shadow-2xs mb-5 group-hover:border-primary/40 transition-colors">
                  <BookOpen className="h-6 w-6 stroke-[1.5] text-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2.5">
                  Documentation
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  Ensure smooth operations and compliance with our comprehensive documentation support. From registrations to regulatory filings, we help you stay organized and audit-ready.
                </p>
              </div>
            </div>

            {/* Card 2: Knowledge Base */}
            <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs hover:border-primary/40 hover:shadow-md transition-all group">
              <div>
                <div className="grid h-12 w-12 place-items-center rounded-xl border border-border/80 bg-background text-foreground shadow-2xs mb-5 group-hover:border-primary/40 transition-colors">
                  <Newspaper className="h-6 w-6 stroke-[1.5] text-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2.5">
                  Knowledge Base
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  Access a rich repository of insights, guides, and industry updates tailored for entrepreneurs and professionals. Our Knowledge Base is your go-to resource for informed decision-making and continuous learning.
                </p>
              </div>
            </div>

            {/* Card 3: Community Forum */}
            <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs hover:border-primary/40 hover:shadow-md transition-all group">
              <div>
                <div className="grid h-12 w-12 place-items-center rounded-xl border border-border/80 bg-background text-foreground shadow-2xs mb-5 group-hover:border-primary/40 transition-colors">
                  <Users className="h-6 w-6 stroke-[1.5] text-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2.5">
                  Community Forum
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  Join our Community Forum to connect, collaborate, and grow with like-minded entrepreneurs and professionals. Share experiences, ask questions, and build meaningful business relationships in a supportive environment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

export { AboutPage };
export default AboutPage;
