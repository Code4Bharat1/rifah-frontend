"use client";

import Link from "next/link";
import {
  BookOpen,
  Newspaper,
  Users,
} from "lucide-react";

import { PublicLayout } from "@shared/components/rifah/public-layout";

function AboutPage() {
  return (
    <PublicLayout>
      {/* ── Section 1: Who we are? ── */}
      <section className="bg-background py-12 sm:py-16 lg:py-20 border-b border-border/60">
        <div className="rifah-container max-w-5xl">
          {/* Main Heading */}
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Who we <span className="text-primary font-black">are</span>?
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground leading-relaxed">
              RIFAH CHAMBER OF COMMERCE IS A VIBRANT BUSINESS NETWORK UNITING ENTREPRENEURS, PROFESSIONALS, AND ENTERPRISES. WE FOSTER ETHICAL BUSINESS PRACTICES, ECONOMIC EMPOWERMENT, AND INCLUSIVE GROWTH.
            </p>
          </div>

          {/* Two-Column Grid: Our Company & Awesome Team */}
          <div className="mt-12 sm:mt-16 grid gap-10 md:grid-cols-2 lg:gap-16">
            {/* Column 1: OUR COMPANY */}
            <div className="flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary">
                  OUR COMPANY
                </h2>
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
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary">
                  AWESOME TEAM
                </h2>
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

      {/* ── Section 2: How can we help you today? ── */}
      <section className="bg-muted/20 py-12 sm:py-16 lg:py-20">
        <div className="rifah-container max-w-6xl">
          {/* Section Heading */}
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              How can we <span className="text-primary font-black">help you</span> today?
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground leading-relaxed">
              LET US CONNECT YOU WITH THE RIGHT RESOURCES, GUIDANCE, OR EXPERTISE TO MOVE YOUR BUSINESS FORWARD.
            </p>
          </div>

          {/* 3 Cards Grid */}
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
