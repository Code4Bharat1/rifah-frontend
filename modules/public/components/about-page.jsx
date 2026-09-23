"use client";

import Link from "next/link";
import {
  Award,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Compass,
  Globe2,
  GraduationCap,
  Handshake,
  Heart,
  HeartHandshake,
  Landmark,
  MapPin,
  Megaphone,
  Rocket,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

import { PublicLayout } from "@shared/components/rifah/public-layout";
import { Pill } from "@shared/components/rifah/badges";
import { Panel, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { useChapters, usePublicStats } from "@shared/hooks/use-rifah-api";

// ── 10 Core Ethical Values (Official Charter) ──
const coreValues = [
  {
    num: "01",
    title: "Non-Riba",
    subtitle: "Interest-Free Dealings",
    icon: Scale,
    description:
      "Upholding financial transactions free from interest, promoting equitable risk-sharing and asset-backed financing.",
    arabic: "الربا",
  },
  {
    num: "02",
    title: "Transparency",
    subtitle: "Al-Wadih",
    icon: Sparkles,
    description:
      "Ensuring clarity and openness in all business transactions, fostering trust and accountability.",
    arabic: "الوضوح",
  },
  {
    num: "03",
    title: "Cooperation",
    subtitle: "Ta'awun",
    icon: Handshake,
    description:
      "Encouraging mutual assistance and collaboration among members to achieve collective success.",
    arabic: "التعاون",
  },
  {
    num: "04",
    title: "Justice and Equity",
    subtitle: "Al-Adl wal-Ihsan",
    icon: Scale,
    description:
      "Promoting fairness, equality, and compassion in all commercial dealings and relationships.",
    arabic: "العدل والإحسان",
  },
  {
    num: "05",
    title: "Lawfulness",
    subtitle: "Halal",
    icon: CheckCircle2,
    description:
      "Adhering strictly to products, services, and transactions that comply with Islamic ethical guidelines.",
    arabic: "الحلال",
  },
  {
    num: "06",
    title: "Responsibility",
    subtitle: "Amanah",
    icon: ShieldCheck,
    description:
      "Upholding a sense of duty and accountability towards investors, employees, customers, and society.",
    arabic: "الأمانة",
  },
  {
    num: "07",
    title: "Integrity",
    subtitle: "Sidq",
    icon: HeartHandshake,
    description:
      "Demonstrating truthfulness and honesty in advertising, negotiations, and contract fulfillment.",
    arabic: "الصدق",
  },
  {
    num: "08",
    title: "Social Responsibility",
    subtitle: "Zakat and Sadaqah",
    icon: Heart,
    description:
      "Contributing to the welfare of society through charitable giving and community development.",
    arabic: "الزكاة والصدقة",
  },
  {
    num: "09",
    title: "Prohibition of Deceit & Exploitation",
    subtitle: "Gharar and Maysir",
    icon: ShieldAlert,
    description:
      "Avoiding ambiguity, fraud, excessive uncertainty, and speculative behaviors in business activities.",
    arabic: "الغرر والميسر",
  },
  {
    num: "10",
    title: "Stewardship",
    subtitle: "Khilafah",
    icon: Globe2,
    description:
      "Recognizing that wealth and resources are trusts from God, to be used responsibly for the benefit of the community and environment.",
    arabic: "الخلافة",
  },
];

// ── 8 Core Chamber Services ──
const chamberServices = [
  {
    icon: Rocket,
    title: "Entrepreneurship Development",
    description:
      "Cultivating next-generation business leaders, fostering innovation, and mentoring aspiring founders to launch and scale viable enterprises.",
  },
  {
    icon: CalendarDays,
    title: "Business Summit & Trade Fairs",
    description:
      "Organizing flagship national and regional business expos, B2B exhibitions, trade delegations, and high-impact networking conclaves.",
  },
  {
    icon: GraduationCap,
    title: "Training & Skill Development",
    description:
      "Conducting practical masterclasses, executive workshops, Islamic finance modules, compliance training, automation, and modern management techniques.",
  },
  {
    icon: Briefcase,
    title: "Business Startup & Consultancy",
    description:
      "Providing end-to-end guidance for emerging startups, feasibility studies, strategic planning, legal structuring, and expert mentoring.",
  },
  {
    icon: Award,
    title: "Business Recognition & Platform",
    description:
      "Enhancing credibility with verified directory listings, official chamber trust badges, business excellence recognitions, and media visibility.",
  },
  {
    icon: Landmark,
    title: "Government Schemes & Facilities",
    description:
      "Facilitating access to MSME incentives, government subsidies, industrial financial schemes, institutional grants, and statutory clearances.",
  },
  {
    icon: Megaphone,
    title: "Advocacy & Representation",
    description:
      "Voicing industrial, trading, and commercial interests before regulatory authorities, industry councils, and governmental policymakers.",
  },
  {
    icon: Users,
    title: "Women Empowerment",
    description:
      "Delivering dedicated entrepreneurship programs, skill enhancement, networking desks, and market linkage specifically tailored for women-led enterprises.",
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
      {/* ── 1. Hero Banner ── */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-navy via-navy to-[#0a192f] text-navy-foreground py-14 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-40" />
        <div className="rifah-container relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-semibold text-amber-300 backdrop-blur-xs mb-4">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>RIFAH CHAMBER OF COMMERCE & INDUSTRY</span>
          </div>

          <h1 className="max-w-4xl text-3xl font-extrabold tracking-tight sm:text-5xl leading-tight sm:leading-tight">
            Together for a <span className="text-amber-400">Sustainable</span> & Ethical Future
          </h1>

          <p className="mt-5 max-w-3xl text-sm sm:text-base leading-relaxed text-navy-foreground/80 font-normal">
            RIFAH is a non-governmental organization connecting entrepreneurs, professionals, and business
            leaders to promote business growth, ethical trade, and sustainable development.
          </p>
          <p className="mt-2.5 max-w-3xl text-sm sm:text-base leading-relaxed text-navy-foreground/75 font-normal">
            It supports SMEs and startups through resources, opportunities, and networking while promoting
            Islamic business principles, integrity, transparency, and responsible entrepreneurship.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <Button asChild variant="brand" className="font-semibold shadow-md px-6 py-2.5 h-auto">
              <Link href="/register-business">Join RIFAH Chamber</Link>
            </Button>
            <Button
              asChild
              className="border border-white/20 bg-white/10 text-white font-semibold hover:bg-white hover:text-navy shadow-sm transition-all px-6 py-2.5 h-auto backdrop-blur-xs"
            >
              <Link href="/discover">Explore Directory</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="text-navy-foreground/80 hover:text-white hover:bg-white/10 font-medium px-4 py-2.5 h-auto"
            >
              <Link href="/contact">Contact Central Admin →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── 2. Rifah Statistics ── */}
      <section className="border-b border-border/60 bg-muted/20 py-8 sm:py-12">
        <div className="rifah-container">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                RIFAH Statistics
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Nationwide chamber reach, verified enterprises, and collaborative network
              </p>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Live Network Metrics
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Member businesses" value={String(kpi.totalBusinesses ?? 0)} icon={Building2} />
            <StatCard label="Regional chapters" value={String(chapters.length ?? 0)} icon={MapPin} />
            <StatCard label="Specialised units" value={String(totalUnits ?? 0)} icon={Users} />
            <StatCard label="Verified Members" value={String(kpi.verifiedBusinesses ?? 0)} icon={CalendarDays} />
          </div>
        </div>
      </section>

      {/* ── 3. Vision & Mission (Dual Spotlight) ── */}
      <section className="bg-background py-14 sm:py-20 border-b border-border/60">
        <div className="rifah-container">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Vision & <span className="text-primary">Mission</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground">
              Guiding our collective roadmap towards an equitable economic order and responsible enterprise growth.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Vision Card */}
            <div className="relative flex flex-col justify-between rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-background p-8 sm:p-10 shadow-xs hover:shadow-md transition-all">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                    <Compass className="h-6 w-6" />
                  </span>
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                    Our Vision
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Global Ethical & Prosperous Ecosystem
                </h3>
                <blockquote className="mt-4 text-sm sm:text-base leading-relaxed text-foreground/90 font-medium italic border-l-2 border-primary/40 pl-4 py-1">
                  “To foster a global ecosystem of ethical and prosperous businesses, guided by Islamic principles, contributing to a just and equitable economic order for the benefit of all humanity.”
                </blockquote>
              </div>

              <div className="mt-6 pt-4 border-t border-border/60 text-xs text-muted-foreground">
                Committed to social equity, fair economic opportunities, and human dignity.
              </div>
            </div>

            {/* Mission Card */}
            <div className="relative flex flex-col justify-between rounded-3xl border border-navy/20 bg-gradient-to-br from-navy/5 via-card to-background p-8 sm:p-10 shadow-xs hover:shadow-md transition-all">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-navy-foreground shadow-sm">
                    <Target className="h-6 w-6" />
                  </span>
                  <span className="rounded-full border border-navy/30 bg-navy/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-navy dark:text-navy-foreground">
                    Our Mission
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Empowering & Uniting Entrepreneurs
                </h3>
                <blockquote className="mt-4 text-sm sm:text-base leading-relaxed text-foreground/90 font-medium italic border-l-2 border-navy/40 pl-4 py-1">
                  “To empower and unite businesses and entrepreneurs, facilitating their growth and success through adherence to Islamic business ethics, promoting fair trade, transparency, cooperation, and social responsibility, while actively contributing to economic development and community well-being.”
                </blockquote>
              </div>

              <div className="mt-6 pt-4 border-t border-border/60 text-xs text-muted-foreground">
                Action-oriented support delivering mentorship, capacity building, and market access.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Who We Are ── */}
      <section className="bg-muted/20 py-14 sm:py-20 border-b border-border/60">
        <div className="rifah-container max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Who We <span className="text-primary font-black">Are</span>
            </h2>
            <p className="mx-auto mt-3 max-w-3xl text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground leading-relaxed">
              RIFAH CHAMBER OF COMMERCE & INDUSTRY IS A NON-GOVERNMENTAL ORGANIZATION CONNECTING ENTREPRENEURS, PROFESSIONALS, AND BUSINESS LEADERS TO PROMOTE BUSINESS GROWTH, ETHICAL TRADE, AND SUSTAINABLE DEVELOPMENT.
            </p>
          </div>

          <div className="mt-10 sm:mt-12 grid gap-8 md:grid-cols-2 lg:gap-10">
            {/* Column 1: OUR FOUNDATION */}
            <div className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-6 sm:p-8 shadow-xs">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-primary">
                  <Building2 className="h-4 w-4" />
                  <span>OUR ORGANIZATION</span>
                </div>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  Established with a mission to promote responsible entrepreneurship,{" "}
                  <strong className="font-semibold text-foreground">
                    RIFAH Chamber of Commerce & Industry
                  </strong>{" "}
                  supports SMEs and startups through resources, high-value opportunities, and nationwide networking. We bridge traditional trade sectors with cutting-edge business practices, anchored in Islamic business principles, integrity, transparency, and responsible entrepreneurship.
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Our ecosystem encompasses business incubation, trade summits, training academies, and industrial advocacy desks.
                </p>
              </div>

              <div className="pt-4 border-t border-border/50 mt-6">
                <Link
                  href="/discover"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors group"
                >
                  <span>Explore Verified Directory</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>

            {/* Column 2: OUR LEADERSHIP */}
            <div className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-6 sm:p-8 shadow-xs">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-primary">
                  <Users className="h-4 w-4" />
                  <span>TEAM & COLLECTIVE LEADERSHIP</span>
                </div>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  At RIFAH, our national leadership and regional steering committees bring together seasoned entrepreneurs, industrial captains, Islamic finance advisors, and social impact strategists driven by ethical values.
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Each committee member plays a vital role in nurturing local chapters, orchestrating industry summits, and representing business interests at federal and state levels.
                </p>
              </div>

              <div className="pt-4 border-t border-border/50 mt-6">
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

      {/* ── 5. Values: 10 Core Ethical Values (The Poster Charter) ── */}
      <section className="bg-background py-16 sm:py-24 border-b border-border/60">
        <div className="rifah-container">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary mb-3">
              Ethical Business Charter
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Our 10 Core <span className="text-primary">Values</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Guided by timeless Islamic principles, our commercial framework champions honesty, equitable risk-sharing, and community well-being.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {coreValues.map((val) => {
              const IconComponent = val.icon;
              return (
                <div
                  key={val.num}
                  className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:border-primary/50 hover:shadow-md transition-all duration-200"
                >
                  <div>
                    {/* Top Row: Num & Arabic */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-mono font-bold text-muted-foreground/80 px-2 py-0.5 rounded-md bg-muted/60">
                        {val.num}
                      </span>
                      <span className="text-xs font-semibold text-primary/80 dir-rtl tracking-wide font-sans">
                        {val.arabic}
                      </span>
                    </div>

                    {/* Icon */}
                    <div className="mb-3.5 inline-grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                      <IconComponent className="h-5 w-5" />
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-foreground leading-snug">
                      {val.title}
                    </h3>
                    <p className="text-xs font-semibold text-primary mt-0.5">
                      ({val.subtitle})
                    </p>

                    {/* Description */}
                    <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
                      {val.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/40 text-[11px] font-medium text-muted-foreground/70 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-primary/70 shrink-0" />
                    <span>Ethical Standard</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 6. Our Services (8 Core Pillars) ── */}
      <section className="bg-muted/20 py-16 sm:py-24 border-b border-border/60">
        <div className="rifah-container">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary mb-3">
              Chamber Offerings
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Our <span className="text-primary">Services</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Empowering enterprises from inception to scale through end-to-end ecosystem support, skill academies, and advocacy.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {chamberServices.map((service, index) => {
              const ServiceIcon = service.icon;
              return (
                <div
                  key={service.title}
                  className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 shadow-xs hover:border-primary/40 hover:shadow-md transition-all duration-200"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                        <ServiceIcon className="h-6 w-6" />
                      </span>
                      <span className="text-xs font-mono font-bold text-muted-foreground/60">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {service.title}
                    </h3>
                    <p className="mt-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-border/50 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">RIFAH Initiative</span>
                    <Link
                      href="/register-business"
                      className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>Join</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Regional Chapters and Focus Units */}
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
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

      {/* ── 7. Why RIFAH ── */}
      <section className="bg-background py-16 sm:py-24 border-b border-border/60">
        <div className="rifah-container">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Why <span className="text-primary">RIFAH</span>?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Why leading entrepreneurs, manufacturers, and service enterprises choose RIFAH Chamber of Commerce & Industry.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-primary/40 hover:shadow-md transition-all">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary mb-4">
                <Globe2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">Extensive Business Network</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Connect directly with verified businesses across regional chapters nationwide. Open doors to B2B collaborations, joint ventures, and trusted buyer supply chains.
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

      {/* ── 8. Call To Action Banner ── */}
      <section className="bg-gradient-to-r from-navy via-navy to-[#0a192f] text-navy-foreground py-14 sm:py-16">
        <div className="rifah-container text-center max-w-3xl">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Ready to grow your enterprise ethically?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-navy-foreground/80 leading-relaxed">
            Join hundreds of ethical entrepreneurs, businesses, and industrial leaders across India. Unlock networking, verified credibility, and nationwide collaboration.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild variant="brand" className="font-semibold shadow-lg px-8 py-3 h-auto text-base">
              <Link href="/register-business">Apply for RIFAH Membership</Link>
            </Button>
            <Button
              asChild
              className="border border-white/20 bg-white/10 text-white font-semibold hover:bg-white hover:text-navy shadow-sm transition-all px-8 py-3 h-auto text-base backdrop-blur-xs"
            >
              <Link href="/membership">View Membership Benefits</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

export { AboutPage };
export default AboutPage;
