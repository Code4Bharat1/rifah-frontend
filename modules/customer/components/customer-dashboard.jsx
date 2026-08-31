"use client";
import Link from "next/link";
import {
  Bell,
  Bookmark,
  CalendarDays,
  FileStack,
  MessageSquare,
  Search,
  Send,
  Star,
} from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill, StatusBadge, VerificationBadge } from "@shared/components/rifah/badges";
import { MoreLink, Panel, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import {
  businesses,
  conversations,
  enquiries,
  events,
  notifications,
  savedBusinessIds,
} from "@shared/lib/mock-data";

function CustomerHome() {
  const myEnquiries = enquiries.slice(0, 4);
  const saved = businesses.filter((b) => savedBusinessIds.includes(b.id));
  const myEvents = events.filter((e) => e.registered);
  const unread = notifications.filter((n) => n.unread).length;

  return (
    <AppShell
      role="customer"
      title="Welcome back, Rehan"
      subtitle="Buyer account · Mumbai Chapter"
      actions={
        <Button asChild>
          <Link href="/enquiry/new">
            <Send className="h-4 w-4" /> New enquiry
          </Link>
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Search entry — the buyer's most common intent */}
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary to-navy p-4 sm:p-6">
          <h2 className="text-base font-semibold text-primary-foreground sm:text-lg">
            What are you sourcing today?
          </h2>
          <form
            className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search verified members, products or services" className="h-12 bg-surface pl-10" />
            </div>
            <Button asChild size="lg" variant="soft" className="h-12">
              <Link href="/discover">Search directory</Link>
            </Button>
          </form>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Open enquiries" value="6" hint="2 awaiting your review" icon={FileStack} tone="primary" href="/me/enquiries" />
          <StatCard label="Responses" value="14" hint="From 9 member businesses" icon={MessageSquare} tone="success" href="/me/messages" />
          <StatCard label="Saved businesses" value={String(saved.length)} icon={Bookmark} href="/me/saved" />
          <StatCard label="Notifications" value={String(unread)} hint="Unread" icon={Bell} tone="warning" href="/me/notifications" />
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <Panel
              title="My enquiries"
              description="Latest sourcing requirements you posted"
              action={<MoreLink href="/me/enquiries" />}
            >
              <ul className="space-y-3">
                {myEnquiries.map((e) => (
                  <li key={e.id} className="rounded-xl border border-border p-3.5">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{e.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {e.id} · {e.category} · {e.createdAt}
                        </p>
                      </div>
                      <StatusBadge status={e.status} />
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      <Pill>{e.quantity}</Pill>
                      <Pill>By {e.requiredBy}</Pill>
                      <Pill tone={e.responses > 0 ? "success" : "neutral"}>
                        {e.responses} response{e.responses === 1 ? "" : "s"}
                      </Pill>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Saved businesses" action={<MoreLink href="/me/saved" />}>
              <ul className="grid gap-3 sm:grid-cols-2">
                {saved.map((b) => (
                  <li key={b.id}>
                    <Link href={`/business/${b.id }`}
                      className="block rounded-xl border border-border p-3.5 transition-colors hover:border-primary/40"
                    >
                      <p className="truncate text-sm font-semibold">{b.name}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {b.industry} · {b.city}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <VerificationBadge status={b.verification} compact />
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-warning text-warning" /> {b.rating.toFixed(1)}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          <div className="space-y-4">
            <Panel title="Messages" action={<MoreLink href="/me/messages" />}>
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
                    <span className="shrink-0 text-[11px] text-muted-foreground">{c.time}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="My events" action={<MoreLink href="/me/events" />}>
              <ul className="space-y-3">
                {myEvents.map((e) => (
                  <li key={e.id}>
                    <Link href={`/events/${e.id }`}
                      className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-xl border border-border p-3 transition-colors hover:border-primary/40"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                        <CalendarDays className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{e.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {e.date} · {e.city}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Notifications" action={<MoreLink href="/me/notifications" />}>
              <ul className="space-y-3">
                {notifications.slice(0, 4).map((n) => (
                  <li key={n.id} className="flex gap-2.5">
                    <span
                      className={
                        n.unread
                          ? "mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand"
                          : "mt-1.5 h-2 w-2 shrink-0 rounded-full bg-muted"
                      }
                      aria-hidden
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{n.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">{n.body}</span>
                      <span className="block text-[11px] text-muted-foreground">{n.time}</span>
                    </span>
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


const CustomerDashboard = CustomerHome;

export { CustomerDashboard };
export default CustomerDashboard;
