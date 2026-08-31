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
import { useState } from "react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill, StatusBadge, VerificationBadge } from "@shared/components/rifah/badges";
import { MoreLink, Panel, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import {
  useMyEnquiries,
  useNotifications,
  useConversations,
  useEvents,
} from "@shared/hooks/use-rifah-api";
import { useAuth } from "@shared/providers/auth-provider";

function CustomerHome() {
  const { user } = useAuth();
  const { data: enquiriesData } = useMyEnquiries();
  const { data: notifData } = useNotifications();
  const { data: convData } = useConversations();
  const { data: eventsData } = useEvents({ status: "Upcoming", limit: 3 });

  const enquiries = enquiriesData?.enquiries || [];
  const savedBusinesses = user?.savedBusinesses || [];
  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unreadCount || 0;
  const conversations = convData || [];
  const events = eventsData?.events || [];

  return (
    <AppShell
      role="customer"
      title={`Welcome back, ${user?.name?.split(" ")[0] || "Buyer"}`}
      subtitle={`${user?.organization || "Buyer Account"} · ${user?.city || "RIFAH Connect"}`}
      actions={
        <Button asChild>
          <Link href="/enquiry/new">
            <Send className="h-4 w-4" /> New enquiry
          </Link>
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Search entry */}
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary to-navy p-4 sm:p-6">
          <h2 className="text-base font-semibold text-primary-foreground sm:text-lg">
            What are you sourcing today?
          </h2>
          <form
            className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = "/discover";
            }}
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
          <StatCard
            label="Open enquiries"
            value={String(enquiries.length)}
            hint={`${enquiries.filter((e) => e.status === "Responded").length} responded`}
            icon={FileStack}
            tone="primary"
            href="/me/enquiries"
          />
          <StatCard
            label="Conversations"
            value={String(conversations.length)}
            hint="Supplier threads"
            icon={MessageSquare}
            tone="success"
            href="/me/messages"
          />
          <StatCard
            label="Saved businesses"
            value={String(savedBusinesses.length)}
            icon={Bookmark}
            href="/me/saved"
          />
          <StatCard
            label="Notifications"
            value={String(unreadCount)}
            hint="Unread"
            icon={Bell}
            tone="warning"
            href="/me/notifications"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <Panel
              title="My enquiries"
              description="Latest sourcing requirements you posted"
              action={<MoreLink href="/me/enquiries" />}
            >
              {enquiries.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No sourcing enquiries posted yet.
                  <div className="mt-3">
                    <Button asChild size="sm">
                      <Link href="/enquiry/new">Post an RFQ</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <ul className="space-y-3">
                  {enquiries.slice(0, 4).map((e) => (
                    <li key={e._id} className="rounded-xl border border-border p-3.5">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{e.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {e.category} · {e.city} · {new Date(e.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <StatusBadge status={e.status} />
                      </div>
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <Pill>Qty: {e.quantity}</Pill>
                        {e.budget && <Pill>Budget: {e.budget}</Pill>}
                        <Pill tone={e.responses?.length > 0 ? "success" : "neutral"}>
                          {e.responses?.length || 0} response{e.responses?.length === 1 ? "" : "s"}
                        </Pill>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="Saved businesses" action={<MoreLink href="/me/saved" />}>
              {savedBusinesses.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">
                  No saved businesses yet. Bookmark suppliers from the directory for fast access.
                </p>
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {savedBusinesses.slice(0, 4).map((b) => (
                    <li key={b._id || b.slug}>
                      <Link
                        href={`/business/${b.slug || b._id}`}
                        className="block rounded-xl border border-border p-3.5 transition-colors hover:border-primary/40"
                      >
                        <p className="truncate text-sm font-semibold">{b.name}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {b.industry} · {b.city}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <VerificationBadge status={b.verification} compact />
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-warning text-warning" /> {(b.rating || 5).toFixed(1)}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          <div className="space-y-4">
            <Panel title="Messages" action={<MoreLink href="/me/messages" />}>
              {conversations.length === 0 ? (
                <p className="py-4 text-xs text-muted-foreground">No active conversations.</p>
              ) : (
                <ul className="space-y-3">
                  {conversations.slice(0, 3).map((c, i) => (
                    <li key={i} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                        {(c.otherUser?.name || "U")[0]}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{c.otherUser?.name || "Member"}</span>
                        <span className="block truncate text-xs text-muted-foreground">{c.lastMessage?.body || "New thread"}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="Upcoming events" action={<MoreLink href="/events" />}>
              <ul className="space-y-3">
                {events.map((e) => (
                  <li key={e._id || e.slug}>
                    <Link
                      href={`/events/${e.slug || e._id}`}
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
              {notifications.length === 0 ? (
                <p className="py-4 text-xs text-muted-foreground">No notifications.</p>
              ) : (
                <ul className="space-y-3">
                  {notifications.slice(0, 4).map((n) => (
                    <li key={n._id} className="flex gap-2.5">
                      <span
                        className={
                          !n.read
                            ? "mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand"
                            : "mt-1.5 h-2 w-2 shrink-0 rounded-full bg-muted"
                        }
                        aria-hidden
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">{n.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">{n.message}</span>
                        <span className="block text-[11px] text-muted-foreground">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export { CustomerHome as CustomerDashboard };
export default CustomerHome;
