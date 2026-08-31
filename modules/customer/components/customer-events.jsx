"use client";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { useEvents } from "@shared/hooks/use-rifah-api";

function MyEvents() {
  const { data: eventsData } = useEvents();
  const allEvents = eventsData?.events || [];

  return (
    <AppShell
      role="customer"
      title="Events & Meets"
      subtitle="Upcoming chamber programmes and registrations"
      actions={
        <Button asChild variant="outline">
          <Link href="/events">All events</Link>
        </Button>
      }
    >
      <div className="space-y-4">
        <Panel title="Upcoming Chamber Events" description="Open programmes and seminars">
          {allEvents.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No upcoming events listed.</p>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {allEvents.map((e) => (
                <li key={e._id || e.slug}>
                  <Link
                    href={`/events/${e.slug || e._id}`}
                    className="block rounded-xl border border-border p-4 transition-colors hover:border-primary/40"
                  >
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                      <p className="min-w-0 truncate text-sm font-semibold">{e.title}</p>
                      <Pill tone={e.mode === "Online" ? "primary" : "neutral"}>{e.mode}</Pill>
                    </div>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" /> {e.date} · {e.time}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" /> {e.venue}, {e.city}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}

export { MyEvents as CustomerEvents };
export default MyEvents;
