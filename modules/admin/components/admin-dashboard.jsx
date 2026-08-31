"use client";
import Link from "next/link";
import { Building2, CalendarDays, ShieldCheck, Users, Wallet } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { MembershipBadge, Pill, VerificationBadge } from "@shared/components/rifah/badges";
import { MoreLink, Panel, StatCard, TrendNote } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Progress } from "@shared/components/ui/progress";
import { adminTrend, auditLogs, businesses, chapters, enquiries, payments } from "@shared/lib/mock-data";

function AdminHome() {
  const pending = businesses.filter((b) => b.verification !== "verified").slice(0, 5);
  const maxMembers = Math.max(...adminTrend.map((d) => d.members));

  return (
    <AppShell
      role="admin"
      title="Chamber administration"
      subtitle="RIFAH Secretariat · all chapters"
      actions={
        <Button asChild variant="outline">
          <Link href="/admin/reports">View reports</Link>
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Member businesses" value="872" hint="+82 this month" icon={Building2} tone="primary" href="/admin/businesses" />
          <StatCard label="Verification queue" value="24" hint="6 need correction" icon={ShieldCheck} tone="warning" href="/admin/verification" />
          <StatCard label="Registered users" value="3,140" icon={Users} href="/admin/users" />
          <StatCard label="Payments this month" value="41" hint="2 failed" icon={Wallet} tone="success" href="/admin/payments" />
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <Panel title="Membership growth" description="Total members and new registrations">
              <div className="flex items-end gap-2 sm:gap-4" role="img" aria-label="Membership growth by month">
                {adminTrend.map((d) => (
                  <div key={d.month} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                    <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">{d.members}</span>
                    <div className="w-full rounded-t-md bg-primary" style={{ height: `${(d.members / maxMembers) * 130}px` }} />
                    <span className="text-[11px] text-muted-foreground">{d.month}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
                {[
                  ["New registrations", "82"],
                  ["Renewal rate", "91%"],
                  ["Premium share", "38%"],
                ].map(([l, v]) => (
                  <div key={l}>
                    <p className="text-lg font-bold tabular-nums">{v}</p>
                    <p className="text-xs text-muted-foreground">{l}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <TrendNote>Registrations up 17% month on month</TrendNote>
              </div>
            </Panel>

            <Panel
              title="Verification queue"
              description="Businesses awaiting secretariat action"
              action={<MoreLink href="/admin/verification" />}
            >
              <ul className="space-y-3">
                {pending.map((b) => (
                  <li key={b.id} className="rounded-xl border border-border p-3.5">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{b.name}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {b.industry} · {b.city} · {b.chapter}
                        </p>
                      </div>
                      <VerificationBadge status={b.verification} compact />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm">Approve</Button>
                      <Button size="sm" variant="outline">
                        Request correction
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive">
                        Reject
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Recent enquiries" description="Lead flow across the chamber" action={<MoreLink href="/admin/enquiries" />}>
              <ul className="space-y-2.5">
                {enquiries.slice(0, 5).map((e) => (
                  <li key={e.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border pb-2.5 last:border-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{e.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {e.id} · {e.requester} · {e.location}
                      </p>
                    </div>
                    <Pill tone={e.responses > 0 ? "success" : "warning"}>{e.responses} resp.</Pill>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          <div className="space-y-4">
            <Panel title="Chapters" action={<MoreLink href="/admin/chapters" />}>
              <ul className="space-y-3">
                {chapters.slice(0, 5).map((c, i) => (
                  <li key={c.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{c.name}</p>
                      <Progress value={90 - i * 13} className="mt-1.5" />
                    </div>
                    <span className="text-xs font-semibold tabular-nums">{c.businesses}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Membership mix">
              <ul className="space-y-2.5">
                {(["Enterprise", "Premium", "Basic", "Free"] ).map((tier, i) => (
                  <li key={tier} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <MembershipBadge tier={tier} />
                    <span className="text-xs font-semibold tabular-nums">{[42, 331, 288, 211][i]}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Latest payments" action={<MoreLink href="/admin/payments" />}>
              <ul className="space-y-2.5">
                {payments.slice(0, 4).map((p) => (
                  <li key={p.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{p.payer}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {p.id} · {p.date}
                      </p>
                    </div>
                    <Pill tone={p.status === "Paid" ? "success" : p.status === "Pending" ? "warning" : "danger"}>
                      {p.status}
                    </Pill>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Audit log" action={<MoreLink href="/admin/audit" />}>
              <ul className="space-y-3">
                {auditLogs.slice(0, 4).map((a) => (
                  <li key={a.id} className="min-w-0">
                    <p className="truncate text-sm font-medium">{a.action}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {a.target} · {a.actor}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{a.time}</p>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Upcoming events" action={<MoreLink href="/admin/events" />}>
              <ul className="space-y-2.5">
                {["RIFAH Trade Connect Meet", "MSME Growth Forum", "Export Readiness Workshop"].map((t) => (
                  <li key={t} className="flex items-center gap-2.5">
                    <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
                    <span className="min-w-0 truncate text-sm">{t}</span>
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


const AdminDashboard = AdminHome;

export { AdminDashboard };
export default AdminDashboard;
