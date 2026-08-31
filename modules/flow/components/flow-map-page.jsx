"use client";
import { ArrowDown, ArrowRight, CheckCircle2, ChevronDown, HelpCircle, X } from "lucide-react";
import { useState } from "react";

import { LogoMark } from "@shared/components/rifah/brand";
import { Button } from "@shared/components/ui/button";
import { Checkbox } from "@shared/components/ui/checkbox";
import {
  adminJourney,
  buyerJourney,
  businessJourney,
  checklistItems,
  coreFlow,
  getBlockDetail,
  ecosystem,
  modules,
  openQuestions,
  roles,


} from "@shared/lib/flow-map";
import { cn } from "@shared/lib/utils";

const roleTone = {
  public: "border-primary/25 bg-primary-soft text-accent-foreground",
  customer: "border-brand/25 bg-brand-soft text-brand",
  business: "border-success/25 bg-success-soft text-success",
  admin: "border-navy bg-navy text-navy-foreground",
};

const roleDot = {
  public: "bg-primary",
  customer: "bg-brand",
  business: "bg-success",
  admin: "bg-navy",
};

function Badge({ children, tone = "muted" }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
        tone === "muted" && "border-border bg-muted text-muted-foreground",
        tone === "brand" && "border-brand/25 bg-brand-soft text-brand",
        tone === "primary" && "border-primary/25 bg-primary-soft text-accent-foreground",
      )}
    >
      {children}
    </span>
  );
}

function ToConfirm() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-warning/35 bg-warning-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-warning-foreground">
      To Confirm
    </span>
  );
}

function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  collapsible = true,
}






) {
  const [open, setOpen] = useState(true);
  return (
    <section id={id} className="rifah-container scroll-mt-20 py-8 md:py-12">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          {eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>}
          <h2 className="mt-1 text-xl font-bold tracking-tight md:text-3xl">{title}</h2>
          {description && <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>}
        </div>
        {collapsible && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-surface md:hidden"
            aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
          </button>
        )}
      </div>
      <div className={cn("mt-5", collapsible && !open && "hidden md:block")}>{children}</div>
    </section>
  );
}

function FlowMapPage() {
  const [activeRole, setActiveRole] = useState(null);
  const [detail, setDetail] = useState(null);
  const [checks, setChecks] = useState({});
  const [statuses, setStatuses] = useState({});

  const dim = (role) => activeRole !== null && activeRole !== role;
  const openMap = (role) => (label, confirm) =>
    setDetail(getBlockDetail(label, { role, kind: "map", toConfirm: confirm }));

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="hero-navy text-navy-foreground">
        <div className="rifah-container py-8 md:py-14">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid shrink-0 place-items-center rounded-xl bg-navy-foreground/95 p-2">
                <LogoMark className="h-8 w-auto md:h-10" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-navy-foreground/70">
                  Product Flow / Wireframe Validation
                </p>
                <h1 className="truncate text-2xl font-bold tracking-tight md:text-4xl">RIFAH Connect</h1>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <span className="rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-foreground">
                MVP Flow
              </span>
              <span className="rounded-full border border-navy-foreground/25 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-navy-foreground/85">
                Requirements Validation
              </span>
            </div>
          </div>
          <p className="mt-5 max-w-2xl text-base font-medium text-navy-foreground/90 md:text-lg">
            Digital Business Network &amp; Lead Generation Platform
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-navy-foreground/80">
            {["Discover", "Connect", "Enquire", "Respond", "Grow"].map((s, i) => (
              <span key={s} className="flex items-center gap-2">
                {i > 0 && <ArrowRight className="h-3.5 w-3.5 text-brand" />}
                {s}
              </span>
            ))}
          </div>
          <p className="mt-6 max-w-3xl rounded-2xl border border-navy-foreground/15 bg-navy-foreground/5 p-4 text-sm leading-relaxed text-navy-foreground/85">
            <strong className="font-semibold text-navy-foreground">What is RIFAH Connect?</strong> One ecosystem where
            the chamber&apos;s member businesses publish a verified presence, buyers discover and send requirements, and
            RIFAH routes those requirements as qualified leads — with membership, events, trust and administration around
            it. This page is a flow map for validation, not the final application.
          </p>
        </div>
      </header>

      {/* Legend + role selector */}
      <div className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
        <div className="rifah-container flex items-center gap-3 overflow-x-auto py-3 no-scrollbar">
          <span className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Highlight
          </span>
          {roles.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setActiveRole(activeRole === r.id ? null : r.id)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                activeRole === r.id ? roleTone[r.id] : "border-border bg-muted text-muted-foreground",
              )}
            >
              {r.title}
            </button>
          ))}
          {activeRole && (
            <button
              type="button"
              onClick={() => setActiveRole(null)}
              className="shrink-0 text-xs font-semibold text-primary hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Roles */}
      <Section
        id="roles"
        eyebrow="Section 01"
        title="Who uses RIFAH Connect?"
        description="Tap a role to highlight its journey through every flow on this page."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {roles.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                setActiveRole(activeRole === r.id ? null : r.id);
                setDetail(getBlockDetail(r.title, { role: r.id, kind: "role", detail: r.blurb }));
              }}
              className={cn(
                "min-h-24 rounded-2xl border p-4 text-left transition-all",
                activeRole === r.id
                  ? "border-primary bg-surface shadow-[var(--shadow-elevated)] ring-2 ring-primary/30"
                  : "border-border bg-surface hover:border-primary/40",
                dim(r.id) && "opacity-45",
              )}
            >
              <span className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", roleDot[r.id])} />
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  {r.id === "admin" ? "Control layer" : "Ecosystem role"}
                </span>
              </span>
              <span className="mt-2 block text-base font-bold tracking-tight">{r.title}</span>
              <span className="mt-1 block text-sm text-muted-foreground">{r.blurb}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 rounded-2xl border border-border bg-muted/50 p-3 text-[11px] font-semibold text-muted-foreground">
          {[
            ["bg-primary", "Core module"],
            ["bg-brand", "Primary action"],
            ["bg-success", "User success"],
            ["bg-warning", "Pending / To confirm"],
            ["bg-navy", "Admin / Control"],
          ].map(([c, l]) => (
            <span key={l} className="flex items-center gap-1.5">
              <span className={cn("h-2.5 w-2.5 rounded-full", c)} />
              {l}
            </span>
          ))}
        </div>
      </Section>

      {/* Core flow */}
      <Section
        id="core"
        eyebrow="Section 02 — most important"
        title="How RIFAH Connect Works"
        description="The core value chain. Tap any node to see what happens, who uses it and what comes next."
      >
        <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-stretch">
          {coreFlow.map((n, i) => (
            <div key={n.id} className="flex items-center gap-2 lg:contents">
              <button
                type="button"
                onClick={() =>
                  setDetail(
                    getBlockDetail(n.label, { role: n.role, kind: "flow", detail: n.what, toConfirm: n.toConfirm }),
                  )
                }
                className={cn(
                  "min-w-0 flex-1 rounded-xl border bg-surface px-3.5 py-3 text-left transition-all lg:flex-none lg:min-w-[9.5rem]",
                  detail?.title === n.label
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border hover:border-primary/50",
                  n.emphasis && "shadow-[var(--shadow-card)]",
                  dim(n.role) && "opacity-40",
                )}
              >
                <span className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", roleDot[n.role])} />
                  {n.emphasis && (
                    <span className="rounded bg-brand px-1.5 text-[10px] font-bold text-brand-foreground">
                      {n.emphasis}
                    </span>
                  )}
                  {n.toConfirm && <ToConfirm />}
                </span>
                <span
                  className={cn(
                    "mt-1.5 block text-sm font-semibold leading-snug",
                    n.emphasis && "text-base font-bold",
                  )}
                >
                  {n.label}
                </span>
              </button>
              {i < coreFlow.length - 1 && (
                <>
                  <ArrowDown className="h-4 w-4 shrink-0 text-muted-foreground lg:hidden" />
                  <span className="hidden shrink-0 items-center self-center lg:flex">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Strongest emphasis: <strong>1 Customer/Buyer → 2 Enquiry → 3 RIFAH Lead Routing → 4 Business → 5
          Response &amp; Communication.</strong>
        </p>
      </Section>

      {/* Ecosystem */}
      <Section
        id="ecosystem"
        eyebrow="Section 03"
        title="Three-sided ecosystem"
        description="Buyers and businesses both transact through the RIFAH Connect platform layer."
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
          {ecosystem.map((col, i) => (
            <div key={col.title} className="lg:contents">
              <div
                className={cn(
                  "rounded-2xl border p-4 transition-opacity",
                  col.role === "admin" ? "border-navy bg-navy text-navy-foreground" : "border-border bg-surface",
                  dim(col.role) && "opacity-45",
                )}
              >
                <h3 className="text-sm font-bold uppercase tracking-wider">{col.title}</h3>
                <ul className="mt-3 space-y-1.5">
                  {col.items.map((it) => (
                    <li key={it}>
                      <button
                        type="button"
                        onClick={() =>
                          setDetail(getBlockDetail(it, { role: col.role, kind: "ecosystem", group: col.title }))
                        }
                        className={cn(
                          "w-full rounded-lg px-2.5 py-1.5 text-left text-sm font-medium transition-colors",
                          col.role === "admin"
                            ? "bg-navy-foreground/10 hover:bg-navy-foreground/20"
                            : "bg-muted hover:bg-primary-soft",
                        )}
                      >
                        {it}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              {i < ecosystem.length - 1 && (
                <div className="flex justify-center">
                  <ArrowDown className="h-5 w-5 text-brand lg:hidden" />
                  <ArrowRight className="hidden h-5 w-5 text-brand lg:block" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Buyer journey */}
      <Section
        id="buyer"
        eyebrow="Section 04 — primary journey"
        title="Customer / Buyer journey"
        description="The most important user journey in the platform."
      >
        <div
          className={cn(
            "rounded-3xl border border-brand/25 bg-brand-soft p-4 md:p-6",
            dim("customer") && "opacity-50",
          )}
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {buyerJourney.map((s) => (
              <button
                key={s.no}
                type="button"
                onClick={() =>
                  setDetail(
                    getBlockDetail(s.label, {
                      role: "customer",
                      kind: "journey",
                      detail: s.detail,
                      toConfirm: s.toConfirm,
                    }),
                  )
                }
                className="rounded-2xl border border-border bg-surface p-4 text-left transition-colors hover:border-brand/50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black tracking-tight text-brand">{s.no}</span>
                  {s.toConfirm && <ToConfirm />}
                </div>
                <p className="mt-1 text-sm font-bold">{s.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.detail}</p>
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs font-semibold text-brand">
            Discover → Search → Evaluate → Enquire → Match → Respond → Communicate → Close
          </p>
        </div>
      </Section>

      {/* Business journey */}
      <Section
        id="business"
        eyebrow="Section 05"
        title="Business / Member journey"
        description="From registration to closing a lead. Tap a step for detail."
      >
        <ol className={cn("grid gap-2 sm:grid-cols-2 xl:grid-cols-3", dim("business") && "opacity-50")}>
          {businessJourney.map((s, i) => (
            <li key={s.label}>
              <details className="group rounded-2xl border border-border bg-surface p-3.5 open:border-success/50">
                <summary className="flex cursor-pointer list-none items-center gap-2.5">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-success-soft text-xs font-bold text-success">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{s.label}</span>
                  {s.toConfirm && <ToConfirm />}
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-2 pl-9 text-xs leading-relaxed text-muted-foreground">{s.detail}</p>
                <button
                  type="button"
                  onClick={() =>
                    setDetail(
                      getBlockDetail(s.label, {
                        role: "business",
                        kind: "journey",
                        detail: s.detail,
                        toConfirm: s.toConfirm,
                      }),
                    )
                  }
                  className="mt-2 ml-9 text-[11px] font-bold uppercase tracking-wider text-primary hover:underline"
                >
                  See sample data
                </button>
              </details>
            </li>
          ))}
        </ol>
      </Section>

      {/* Admin journey */}
      <Section
        id="admin"
        eyebrow="Section 06 — control layer"
        title="RIFAH Admin journey"
        description="Centralised administration across businesses, users, memberships, directory, leads, reviews, chapters, events and reports."
      >
        <div
          className={cn(
            "rounded-3xl border border-navy bg-navy p-4 text-navy-foreground md:p-6",
            dim("admin") && "opacity-50",
          )}
        >
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {adminJourney.map((s, i) => (
              <button
                key={s.label}
                type="button"
                onClick={() =>
                  setDetail(getBlockDetail(s.label, { role: "admin", kind: "journey", detail: s.detail }))
                }
                className="rounded-2xl border border-navy-foreground/15 bg-navy-foreground/5 p-3.5 text-left transition-colors hover:bg-navy-foreground/15"
              >
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-brand text-[11px] font-bold text-brand-foreground">
                    {i + 1}
                  </span>
                  <p className="min-w-0 truncate text-sm font-bold">{s.label}</p>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-navy-foreground/75">{s.detail}</p>
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Modules */}
      <Section
        id="modules"
        eyebrow="Section 07"
        title="RIFAH Connect modules"
        description="Functional areas identified in the requirements, grouped as connected module cards."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {modules.map((m) => (
            <div
              key={m.group}
              className={cn(
                "rounded-2xl border border-border bg-surface p-4 transition-opacity",
                dim(m.role) && "opacity-45",
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", roleDot[m.role])} />
                <button
                  type="button"
                  onClick={() => setDetail(getBlockDetail(m.group, { role: m.role, kind: "module", group: m.group }))}
                  className="min-w-0 truncate text-left text-sm font-bold uppercase tracking-wider hover:text-primary"
                >
                  {m.group}
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {m.items.map((it) => (
                  <button
                    key={it}
                    type="button"
                    onClick={() => setDetail(getBlockDetail(it, { role: m.role, kind: "module", group: m.group }))}
                    className="rounded-lg bg-muted px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-primary-soft hover:text-accent-foreground"
                  >
                    {it}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Connection map */}
      <Section
        id="connections"
        eyebrow="Section 08"
        title="Connection map"
        description="How the control layer, the directory and the buyer demand side connect."
      >
        <div className="rounded-3xl border border-border bg-surface p-4 md:p-8">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-3">
            <MapNode label="RIFAH Admin" tone="navy" onOpen={openMap("admin")} />
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
              <MapNode label="Businesses" onOpen={openMap("admin")} tone="primary" />
              <MapNode label="Memberships" onOpen={openMap("admin")} tone="primary" />
              <MapNode label="Events" onOpen={openMap("admin")} tone="primary" />
            </div>
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
            <MapNode label="Business Profile" onOpen={openMap("business")} tone="soft" />
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
            <MapNode label="Products / Services" onOpen={openMap("business")} tone="soft" />
            <div className="flex flex-col items-center text-muted-foreground">
              <ArrowDown className="h-5 w-5 rotate-180" />
              <span className="text-[10px] font-bold uppercase tracking-wider">discovered by</span>
            </div>
            <MapNode label="Customer / Buyer" onOpen={openMap("customer")} tone="brand" />
            <ArrowDown className="h-5 w-5 text-brand" />
            <MapNode label="Enquiry" onOpen={openMap("customer")} tone="brand" />
            <ArrowDown className="h-5 w-5 text-brand" />
            <MapNode label="Lead Routing" onOpen={openMap("admin")} tone="navy" confirm />
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
            <MapNode label="Business" onOpen={openMap("business")} tone="success" />
            <ArrowDown className="h-5 w-5 text-success" />
            <MapNode label="Response" onOpen={openMap("business")} tone="success" />
            <ArrowDown className="h-5 w-5 text-success" />
            <MapNode label="Messaging" onOpen={openMap("business")} tone="soft" />
          </div>
        </div>
      </Section>

      {/* Validation checklist */}
      <Section
        id="validation"
        eyebrow="Section 09"
        title="Client validation checklist"
        description="Confirm each area during the meeting, or flag it for discussion."
        collapsible={false}
      >
        <div className="rounded-3xl border border-border bg-surface p-4 md:p-6">
          <ul className="grid gap-2 md:grid-cols-2">
            {checklistItems.map((item) => {
              const status = statuses[item] ?? "";
              return (
                <li
                  key={item}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-background p-3"
                >
                  <label className="flex min-w-0 items-center gap-3">
                    <Checkbox
                      checked={!!checks[item]}
                      onCheckedChange={(v) => setChecks((p) => ({ ...p, [item]: !!v }))}
                    />
                    <span
                      className={cn(
                        "min-w-0 text-sm font-medium",
                        checks[item] && "text-muted-foreground line-through",
                      )}
                    >
                      {item}
                    </span>
                  </label>
                  <div className="flex shrink-0 gap-1">
                    {(
                      [
                        ["Confirmed", "success"],
                        ["Needs Discussion", "warning"],
                        ["Not in Scope", "muted"],
                      ] 
                    ).map(([label, tone]) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setStatuses((p) => ({ ...p, [item]: p[item] === label ? "" : label }))}
                        className={cn(
                          "rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors",
                          status === label
                            ? tone === "success"
                              ? "border-success/30 bg-success-soft text-success"
                              : tone === "warning"
                                ? "border-warning/35 bg-warning-soft text-warning-foreground"
                                : "border-border bg-muted text-muted-foreground"
                            : "border-border bg-surface text-muted-foreground hover:border-primary/40",
                        )}
                        title={label}
                      >
                        {label === "Confirmed" ? "Conf" : label === "Needs Discussion" ? "Disc" : "N/S"}
                      </button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 font-semibold text-success">
              <CheckCircle2 className="h-4 w-4" />
              {Object.values(checks).filter(Boolean).length} / {checklistItems.length} reviewed
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setChecks({});
                setStatuses({});
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </Section>

      {/* Open questions */}
      <Section
        id="questions"
        eyebrow="Section 10"
        title="Questions to confirm"
        description="Intentionally unanswered — these are the clarification points for the client meeting."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {openQuestions.map((g) => (
            <div key={g.group} className="rounded-2xl border border-warning/30 bg-warning-soft/60 p-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 shrink-0 text-warning-foreground" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-warning-foreground">{g.group}</h3>
              </div>
              <ul className="mt-3 space-y-2">
                {g.questions.map((q) => (
                  <li
                    key={q}
                    className="rounded-xl border border-dashed border-warning/40 bg-surface p-3 text-sm leading-relaxed"
                  >
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* Closing */}
      <footer className="hero-navy mt-6 text-navy-foreground">
        <div className="rifah-container flex flex-col items-center gap-3 py-12 text-center md:py-16">
          <span className="grid place-items-center rounded-xl bg-navy-foreground/95 p-2">
            <LogoMark className="h-9 w-auto" />
          </span>
          <h2 className="text-2xl font-bold tracking-tight md:text-4xl">RIFAH Connect</h2>
          <p className="max-w-xl text-sm text-navy-foreground/85 md:text-base">
            One ecosystem connecting businesses, buyers and opportunities.
          </p>
          <p className="text-sm font-semibold text-brand-foreground">
            <span className="rounded-full bg-brand px-4 py-1.5">
              Discover → Connect → Enquire → Respond → Grow
            </span>
          </p>
          <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-navy-foreground/60">
            Next Step: Detailed Mobile-First UI/UX Wireframes
          </p>
        </div>
      </footer>

      {/* Detail panel */}
      {detail && (
        <div className="fixed inset-x-0 bottom-0 z-50 p-3 md:inset-x-auto md:bottom-4 md:right-4 md:w-[23rem] md:p-0">
          <div className="max-h-[75vh] overflow-y-auto rounded-3xl border border-border bg-surface p-4 shadow-[var(--shadow-elevated)]">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <span className="flex flex-wrap items-center gap-2">
                  <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", roleDot[detail.role])} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {detail.kind}
                  </span>
                  {detail.toConfirm && <ToConfirm />}
                </span>
                <h3 className="mt-1 text-lg font-bold tracking-tight">{detail.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setDetail(null)}
                aria-label="Close detail panel"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <dl className="mt-4 space-y-3">
              {[
                ["What happens here?", detail.what],
                ["Who uses it?", detail.who],
                ["Next step", detail.next],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl bg-muted p-3">
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{k}</dt>
                  <dd className="mt-1 text-sm leading-relaxed">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-3 rounded-2xl border border-border p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Sample data</p>
              <ul className="mt-2 space-y-2">
                {detail.data.map((d) => (
                  <li key={d.label} className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{d.label}</p>
                    <p className="text-sm leading-relaxed">{d.value}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge tone="primary">MVP Flow</Badge>
              {detail.toConfirm && <Badge tone="brand">Needs client confirmation</Badge>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MapNode({
  label,
  tone,
  confirm,
  onOpen,
}




) {
  const tones = {
    navy: "border-navy bg-navy text-navy-foreground",
    primary: "border-primary/25 bg-primary-soft text-accent-foreground",
    brand: "border-brand/25 bg-brand-soft text-brand",
    success: "border-success/25 bg-success-soft text-success",
    soft: "border-border bg-muted text-foreground",
  };
  return (
    <button
      type="button"
      onClick={() => onOpen?.(label, confirm)}
      className={cn(
        "flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-center text-sm font-bold transition-transform hover:scale-[1.02]",
        tones[tone],
      )}
    >
      {label}
      {confirm && <ToConfirm />}
    </button>
  );
}


export { FlowMapPage };
export default FlowMapPage;
