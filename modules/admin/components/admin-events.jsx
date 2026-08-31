"use client";
import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { events } from "@shared/lib/mock-data";

function AdminEvents() {
  return (
    <AppShell
      role="admin"
      title="Events"
      subtitle="Chamber programme calendar"
      actions={
        <Button>
          <Plus className="h-4 w-4" /> Create event
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total events" value={String(events.length)} icon={CalendarDays} tone="primary" />
          <StatCard label="Upcoming" value={String(events.filter((e) => e.status === "Upcoming").length)} tone="success" />
          <StatCard label="Past" value={String(events.filter((e) => e.status === "Past").length)} />
          <StatCard label="Registrations" value="486" tone="warning" />
        </div>

        <Panel title="All events">
          <ResponsiveTable
            rows={events}
            columns={[
              { key: "title", header: "Event", cell: (r) => <span className="font-semibold">{r.title}</span> },
              { key: "date", header: "Date", cell: (r) => `${r.date} · ${r.time}` },
              { key: "mode", header: "Mode", cell: (r) => r.mode },
              { key: "chapter", header: "Chapter", cell: (r) => r.chapter },
              { key: "city", header: "City", cell: (r) => r.city },
              { key: "status", header: "Status", cell: (r) => <Pill tone={r.status === "Upcoming" ? "success" : "neutral"}>{r.status}</Pill> },
              {
                key: "act",
                header: "",
                cell: (r) => (
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/events/${r.id }`}>
                      Open
                    </Link>
                  </Button>
                ),
              },
            ]}
            mobile={(r) => (
              <div className="rounded-xl border border-border p-3.5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{r.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {r.date} · {r.city} · {r.mode}
                    </p>
                  </div>
                  <Pill tone={r.status === "Upcoming" ? "success" : "neutral"}>{r.status}</Pill>
                </div>
                <Button asChild size="sm" variant="outline" className="mt-3">
                  <Link href={`/events/${r.id }`}>
                    Manage event
                  </Link>
                </Button>
              </div>
            )}
          />
        </Panel>
      </div>
    </AppShell>
  );
}


export { AdminEvents };
export default AdminEvents;
