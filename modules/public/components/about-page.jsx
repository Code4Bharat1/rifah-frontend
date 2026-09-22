"use client";

import Link from "next/link";
import {
  Award,
  Briefcase,
  Building2,
  CalendarDays,
  Compass,
  Globe2,
  GraduationCap,
  Handshake,
  HeartHandshake,
  MapPin,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
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
      {/* ── 1. Banner (Hero) ── */}
      <section className="border-b border-border bg-navy text-navy-foreground">
        <div className="rifah-container py-10 sm:py-14">
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

      {/* ── 2. Rifah Statistics (Statics) ── */}
      <section className="border-b border-border/60 bg-muted/20 py-8 sm:py-12">
        <div className="rifah-container">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              RIFAH Statistics
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Key metrics and nationwide chamber reach
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Member businesses" value={String(kpi.totalBusinesses ?? 0)} icon={Building2} />
            <StatCard label="Regional chapters" value={String(chapters.length ?? 0)} icon={MapPin} />
            <StatCard label="Specialised units" value={String(totalUnits ?? 0)} icon={Users} />
            <StatCard label="Verified Members" value={String(kpi.verifiedBusinesses ?? 0)} icon={CalendarDays} />
          </div>
        </div>
      </section>

      {/* ── 3. Who we are? ── */}
      <section className="bg-background py-12 sm:py-16 border-b border-border/60">
        <div className="rifah-container max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Who we <span className="text-primary font-black">are</span>?
            </h2>
            <p className="mx-auto mt-3 max-w-3xl text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground leading-relaxed">
              RIFAH CHAMBER OF COMMERCE IS A VIBRANT BUSINESS NETWORK UNITING ENTREPRENEURS, PROFESSIONALS, AND ENTERPRISES. WE FOSTER ETHICAL BUSINESS PRACTICES, ECONOMIC EMPOWERMENT, AND INCLUSIVE GROWTH.
            </p>
          </div>

          <div className="mt-10 sm:mt-12 grid gap-8 md:grid-cols-2 lg:gap-12">
            {/* Column 1: OUR COMPANY */}
            <div className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-6 sm:p-8 shadow-xs">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-primary">
                  <Building2 className="h-4 w-4" />
                  <span>OUR COMPANY</span>
                </div>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  Established with a vision to promote responsible entrepreneurship,{" "}
                  <strong className="font-semibold text-foreground">
                    Rifah Chamber of Commerce
                  </strong>{" "}
                  is a not-for-profit organization dedicated to empowering businesses through ethical leadership, collaboration, and inclusive growth. We provide a trusted platform for entrepreneurs and professionals to thrive through mentorship, networking, and knowledge-sharing.
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Our core initiatives include business consulting, start-up incubation, international trade facilitation, and industrial advisory.
                </p>
              </div>

              <div className="pt-4 border-t border-border/50 mt-4">
                <Link
                  href="/discover"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors group"
                >
                  <span>Explore Directory</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>

            {/* Column 2: OUR LEADERSHIP */}
            <div className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-6 sm:p-8 shadow-xs">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-primary">
                  <Users className="h-4 w-4" />
                  <span>AWESOME TEAM & LEADERSHIP</span>
                </div>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  At Rifah Chamber of Commerce, our leadership brings together a diverse group of seasoned professionals, industry veterans, and changemakers driven by purpose and shared values.
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  From experienced business captains to social impact strategists, each team member plays a key role in shaping our roadmap and extending our footprint across national chapters and trade clusters.
                </p>
              </div>

              <div className="pt-4 border-t border-border/50 mt-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors group"
                >
                  <span>Connect with Central Admin</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Vision ── */}
      <section className="bg-muted/30 py-12 sm:py-16 border-b border-border/60">
        <div className="rifah-container max-w-4xl">
          <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/5 via-card to-background p-8 sm:p-12 shadow-sm text-center relative overflow-hidden">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm mb-4">
              <Compass className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Our Vision
            </h2>
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-foreground/90 font-medium max-w-2xl mx-auto">
              “To build a nationwide ethical business ecosystem that empowers entrepreneurs, drives sustainable industrial growth, and fosters economic self-reliance through collaboration and integrity.”
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. Mission ── */}
      <section className="bg-background py-12 sm:py-16 border-b border-border/60">
        <div className="rifah-container max-w-4xl">
          <div className="rounded-3xl border border-navy/20 bg-gradient-to-br from-navy/5 via-card to-background p-8 sm:p-12 shadow-sm text-center relative overflow-hidden">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-navy-foreground shadow-sm mb-4">
              <Target className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Our Mission
            </h2>
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-foreground/90 font-medium max-w-2xl mx-auto">
              “To create a platform where business is generated through effective networking, and to scale up existing businesses by implementing proper systems using the latest management techniques.”
            </p>
          </div>
        </div>
      </section>

      {/* ── 6. Values ── */}
      <section className="bg-muted/20 py-12 sm:py-16 border-b border-border/60">
        <div className="rifah-container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Our Core <span className="text-primary">Values</span>
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Our culture and chamber policies are anchored in timeless ethical frameworks and modern professionalism.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-primary/40 hover:shadow-md transition-all">
              <span className="inline-grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary mb-4">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <h3 className="text-base font-bold text-foreground">Integrity & Ethics</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Conducting business with absolute honesty, transparent governance, and adherence to fair, ethical practices.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-primary/40 hover:shadow-md transition-all">
              <span className="inline-grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary mb-4">
                <Handshake className="h-6 w-6" />
              </span>
              <h3 className="text-base font-bold text-foreground">Collaboration & Unity</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Fostering synergy, peer mentorship, and mutual commercial upliftment rather than destructive cutthroat competition.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-primary/40 hover:shadow-md transition-all">
              <span className="inline-grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary mb-4">
                <Sparkles className="h-6 w-6" />
              </span>
              <h3 className="text-base font-bold text-foreground">Excellence & Systems</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Embracing the latest business tools, digital infrastructure, R&D, and management systems to build world-class enterprises.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-primary/40 hover:shadow-md transition-all">
              <span className="inline-grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary mb-4">
                <HeartHandshake className="h-6 w-6" />
              </span>
              <h3 className="text-base font-bold text-foreground">Community Empowerment</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Empowering aspiring entrepreneurs, women, youth, and traditional artisans to create resilient livelihoods.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Our Services (What chamber does) ── */}
      <section className="bg-background py-12 sm:py-16 border-b border-border/60">
        <div className="rifah-container">
          <SectionHeader
            title="Our Services & Pillars"
            description="Four foundational pillars shape every service, module, and interaction in RIFAH Connect."
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p) => (
              <Panel key={p.title} bodyClassName="p-5">
                <span className="inline-grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
                  <p.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.body}</p>
              </Panel>
            ))}
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <Panel title="Regional Chapters" description="Active regional presence driving local commerce and networking">
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

            <Panel title="Specialised Focus Units" description="Targeted sectoral initiatives supporting specific industry needs">
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
      </section>

      {/* ── 8. Why Rifah (Why choose us from www.rifah.org) ── */}
      <section className="bg-muted/20 py-12 sm:py-16">
        <div className="rifah-container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Why <span className="text-primary">RIFAH</span>?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Why leading entrepreneurs, manufacturers, and service enterprises choose RIFAH Chamber of Commerce & Industry.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-primary/40 hover:shadow-md transition-all">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary mb-4">
                <Globe2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">Extensive Business Network</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Connect directly with verified businesses across regional chapters nationwide. Open doors to B2B collaborations, joint ventures, and buyer supply chains.
              </p>
            </div>

            <div className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-primary/40 hover:shadow-md transition-all">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary mb-4">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">Expert Guidance & Mentorship</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Gain direct access to seasoned corporate captains and domain specialists in finance, taxation, marketing, operations, and scaling.
              </p>
            </div>

            <div className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-primary/40 hover:shadow-md transition-all">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary mb-4">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">Training & Capacity Building</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Regular masterclasses, workshops, and seminars on business automation, modern management techniques, and digital transformation.
              </p>
            </div>

            <div className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-primary/40 hover:shadow-md transition-all">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary mb-4">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">Domestic & Global Exposure</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Opportunities to exhibit at national industrial expos, attend trade delegation summits, and participate in international business missions.
              </p>
            </div>

            <div className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-primary/40 hover:shadow-md transition-all sm:col-span-2 lg:col-span-2">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary mb-4">
                <Rocket className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">Structured Start-up & Cluster Support</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                From ideation to market launch, access specialized incubation desks, government cluster linkage, investor networking, and scaling blueprints tailored for growth.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

export { AboutPage };
export default AboutPage;
