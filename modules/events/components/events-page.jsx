"use client";
import Link from "next/link";
import { Clock, MapPin, Ticket, Users } from "lucide-react";
import { useState } from "react";

import { Pill } from "@shared/components/rifah/badges";
import { PublicLayout } from "@shared/components/rifah/public-layout";
import { SectionHeader } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@shared/components/ui/tabs";
import { events } from "@shared/lib/mock-data";
import { cn } from "@shared/lib/utils";

function EventsPage() {
  const [tab, setTab] = useState("Upcoming");
  const list = events.filter((e) => e.status === tab);

  return (
    <PublicLayout>
      <div className="rifah-container py-6 sm:py-10">
        <SectionHeader
          title="Events & trade meets"
          description="Structured networking, capability showcases and advisory clinics run by RIFAH chapters and units."
        />

        <Tabs value={tab} onValueChange={(v) => setTab(v )} className="mt-5">
          <TabsList>
            <TabsTrigger value="Upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="Past">Past</TabsTrigger>
          </TabsList>
        </Tabs>

        <ul className="mt-4 grid gap-3 lg:grid-cols-2">
          {list.map((ev) => (
            <li key={ev.id}>
              <Link href={`/events/${ev.id }`}
                className="flex h-full flex-col rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-primary/40 sm:p-5"
              >
                <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                  <div className="grid h-14 w-14 shrink-0 place-content-center rounded-xl bg-primary-soft text-center text-primary">
                    <span className="text-lg font-bold leading-none">{ev.date.split(" ")[0]}</span>
                    <span className="text-[11px] font-semibold uppercase">{ev.date.split(" ")[1]}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold leading-tight">{ev.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{ev.summary}</p>
                  </div>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{ev.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{ev.city}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{ev.seats}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Ticket className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{ev.fee}</span>
                  </div>
                </dl>
                <div className="mt-3 flex flex-1 flex-wrap items-end gap-1.5">
                  <Pill tone={ev.mode === "Online" ? "primary" : "neutral"}>{ev.mode}</Pill>
                  <Pill>{ev.chapter}</Pill>
                  {ev.registered && <Pill tone="success">Registered</Pill>}
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className={cn("mt-8 rounded-2xl border border-border bg-accent p-5 sm:p-6")}>
          <h2 className="text-base font-semibold">Host an event with RIFAH</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Premium and Enterprise members can propose chapter sessions, capability showcases and sector round tables.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/contact">Contact the events desk</Link>
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}


export { EventsPage };
export default EventsPage;
