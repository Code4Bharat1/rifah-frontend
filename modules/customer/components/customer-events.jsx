"use client";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { events } from "@shared/lib/mock-data";

function MyEvents() {
  const registered = events.filter((e) => e.registered);
  const other = events.filter((e) => !e.registered);

  return (
    <AppShell
      role="customer"
      title="My events"
      subtitle="Registrations and upcoming chamber programmes"
      actions={
        <Button asChild variant="outline">
          <Link href="/events">All events</Link>
        </Button>
      }
    >
      <div className="space-y-4">
        <Panel title="Registered" description={`${registered.length} confirmed registrations`}>
          <ul className="grid gap-3 md:grid-cols-2">
            {registered.map((e) => (
              <li key={e.id}>
                <Link href={`/events/${e.id }`}
                  className="block rounded-xl border border-border p-4 transition-colors hover:border-primary/40"
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <p className="min-w-0 truncate text-sm font-semibold">{e.title}</p>
                    <Pill tone="success">Registered</Pill>
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
        </Panel>

        <Panel title="Recommended for you" description="Open programmes matching your sourcing interests">
          <ul className="grid gap-3 md:grid-cols-2">
            {other.map((e) => (
              <li key={e.id} className="rounded-xl border border-border p-4">
                <p className="truncate text-sm font-semibold">{e.title}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {e.date} · {e.city} · {e.mode}
                </p>
                <Button asChild size="sm" variant="outline" className="mt-3">
                  <Link href={`/events/${e.id }`}>
                    View event
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}


const CustomerEvents = MyEvents;

export { CustomerEvents };
export default CustomerEvents;
