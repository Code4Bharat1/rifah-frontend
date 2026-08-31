"use client";
import Link from "next/link";
import {
  ArrowUpRight,
  Eye,
  MessageSquare,
  Package,
  ShieldCheck,
  Star,
  Target,
} from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { MembershipBadge, Pill, StatusBadge, VerificationBadge } from "@shared/components/rifah/badges";
import { MoreLink, Panel, StatCard, TrendNote } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Progress } from "@shared/components/ui/progress";
import { conversations, enquiries, getBusiness, leadTrend, notifications } from "@shared/lib/mock-data";

function BusinessHome() {
  const business = getBusiness("abc-manufacturing");
  const leads = enquiries.slice(0, 5);
  const max = Math.max(...leadTrend.map((d) => d.views));
  const completeness = 82;

  return (
    <AppShell
      role="business"
      title={business.name}
      subtitle="Business workspace · Mumbai Chapter"
      actions={
        <Button asChild variant="outline">
          <Link href={`/business/${business.id }`}>
            <Eye className="h-4 w-4" /> View public profile
          </Link>
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="New leads" value="12" hint="This week" icon={Target} tone="brand" href="/biz/leads" />
          <StatCard label="Open enquiries" value="8" hint="3 need a response" icon={MessageSquare} tone="primary" href="/biz/enquiries" />
          <StatCard label="Profile views" value="860" hint="Last 30 days" icon={Eye} tone="success" href="/biz/analytics" />
          <StatCard label="Catalogue items" value="18" hint="4 drafts" icon={Package} href="/biz/catalogue" />
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <Panel
              title="Matched leads"
              description="Buyer enquiries routed to your categories"
              action={<MoreLink href="/biz/leads" />}
            >
              <ul className="space-y-3">
                {leads.map((l) => (
                  <li key={l.id} className="rounded-xl border border-border p-3.5">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{l.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {l.id} · {l.location} · {l.createdAt}
                        </p>
                      </div>
                      <StatusBadge status={l.status} />
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      <Pill tone={l.priority === "High" ? "danger" : "neutral"}>{l.priority} priority</Pill>
                      <Pill>{l.quantity}</Pill>
                      <Pill>By {l.requiredBy}</Pill>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm">Respond</Button>
                      <Button size="sm" variant="outline">
                        View details
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel
              title="Performance"
              description="Leads, enquiries and profile views by month"
              action={<MoreLink href="/biz/analytics" />}
            >
              <div className="flex items-end gap-2 sm:gap-4" role="img" aria-label="Monthly profile views bar chart">
                {leadTrend.map((d) => (
                  <div key={d.month} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                    <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">{d.views}</span>
                    <div
                      className="w-full rounded-t-md bg-primary"
                      style={{ height: `${(d.views / max) * 120}px` }}
                    />
                    <span className="text-[11px] text-muted-foreground">{d.month}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
                {[
                  { label: "Leads", value: "46" },
                  { label: "Enquiries", value: "58" },
                  { label: "Conversion", value: "21%" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-lg font-bold tabular-nums">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <TrendNote>Views up 21% versus the previous month</TrendNote>
              </div>
            </Panel>
          </div>

          <div className="space-y-4">
            <Panel title="Profile completeness">
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-bold tabular-nums">{completeness}%</p>
                <MembershipBadge tier={business.membership} />
              </div>
              <Progress value={completeness} className="mt-3" />
              <ul className="mt-4 space-y-2 text-sm">
                {[
                  ["Business details", true],
                  ["Catalogue (18 items)", true],
                  ["Certifications", true],
                  ["Gallery images", false],
                  ["Bank details for invoices", false],
                ].map(([label, done]) => (
                  <li key={String(label)} className="flex items-center justify-between gap-3">
                    <span className={done ? "text-muted-foreground" : "font-medium"}>{label }</span>
                    <Pill tone={done ? "success" : "warning"}>{done ? "Done" : "Pending"}</Pill>
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link href="/biz/profile">Complete profile</Link>
              </Button>
            </Panel>

            <Panel title="Verification & membership">
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Verification</span>
                  <VerificationBadge status={business.verification} compact />
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Plan</span>
                  <MembershipBadge tier={business.membership} />
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Renews</span>
                  <span className="font-medium">14 Nov 2026</span>
                </li>
              </ul>
              <div className="mt-4 grid gap-2">
                <Button asChild>
                  <Link href="/biz/membership">
                    Manage membership <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/biz/verification">
                    <ShieldCheck className="h-4 w-4" /> Verification status
                  </Link>
                </Button>
              </div>
            </Panel>

            <Panel title="Recent messages" action={<MoreLink href="/biz/messages" />}>
              <ul className="space-y-3">
                {conversations.slice(0, 3).map((c) => (
                  <li key={c.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                      {c.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{c.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{c.last}</span>
                    </span>
                    {c.unread > 0 && (
                      <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-brand px-1 text-[11px] font-bold text-primary-foreground">
                        {c.unread}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Reviews" action={<MoreLink href="/biz/analytics" />}>
              <div className="flex items-center gap-3">
                <p className="text-3xl font-bold tabular-nums">{business.rating.toFixed(1)}</p>
                <div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={i < Math.round(business.rating) ? "h-4 w-4 fill-warning text-warning" : "h-4 w-4 text-muted"}
                      />
                    ))}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{business.reviews} published reviews</p>
                </div>
              </div>
            </Panel>

            <Panel title="Notifications" action={<MoreLink href="/biz/notifications" />}>
              <ul className="space-y-3">
                {notifications.slice(0, 4).map((n) => (
                  <li key={n.id} className="min-w-0">
                    <p className="truncate text-sm font-medium">{n.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{n.body}</p>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>
      </div>
    </AppShell>
  );
}


const BizDashboard = BusinessHome;

export { BizDashboard };
export default BizDashboard;
