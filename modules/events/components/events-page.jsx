"use client";
import Link from "next/link";
import { Clock, MapPin, Ticket, Users } from "lucide-react";
import { useState } from "react";

import { Pill } from "@shared/components/rifah/badges";
import { PublicLayout } from "@shared/components/rifah/public-layout";
import { SectionHeader } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@shared/components/ui/tabs";
import { useEvents } from "@shared/hooks/use-rifah-api";
import { cn } from "@shared/lib/utils";

function EventsPage() {
  const [tab, setTab] = useState("Upcoming");
  const { data: eventsData, isLoading } = useEvents({ status: tab });
  const list = Array.isArray(eventsData)
    ? eventsData
    : (eventsData?.events || eventsData?.data || []);

  return (
    <PublicLayout>
      <div className="rifah-container py-6 sm:py-10">
        <SectionHeader
          title="Events & trade meets"
          description="Structured networking, capability showcases and advisory clinics run by RIFAH chapters and units."
        />

        <Tabs value={tab} onValueChange={(v) => setTab(v)} className="mt-5">
          <TabsList>
            <TabsTrigger value="Upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="Past">Past</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 rounded-2xl border border-border bg-surface/50 animate-pulse" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No {tab.toLowerCase()} events listed currently.
          </div>
        ) : (
          <ul className="mt-4 grid gap-3 lg:grid-cols-2">
            {list.map((ev) => (
              <li key={ev._id || ev.slug}>
                <Link
                  href={`/events/${ev.slug || ev._id}`}
                  className="flex h-full flex-col rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-primary/40 sm:p-5"
                >
                  <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                    <div className="grid h-14 w-14 shrink-0 place-content-center rounded-xl bg-primary-soft text-center text-primary px-1">
                      {(() => {
                        try {
                          const d = new Date(ev.date);
                          if (!isNaN(d.getTime())) {
                            return (
                              <>
                                <span className="text-base font-bold leading-tight">{d.getDate()}</span>
                                <span className="text-[10px] uppercase font-semibold tracking-wider text-primary/80">
                                  {d.toLocaleDateString("en-US", { month: "short" })}
                                </span>
                              </>
                            );
                          }
                        } catch {}
                        return <span className="text-xs font-bold leading-none">{ev.date}</span>;
                      })()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold leading-tight">{ev.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {ev.summary || ev.description || "Join this chamber event to connect with members and businesses."}
                      </p>
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
                      <Users className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{ev.seats} seats ({ev.registeredCount || 0} registered)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Ticket className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{ev.fee}</span>
                    </div>
                  </dl>
                  <div className="mt-3 flex flex-1 flex-wrap items-end gap-1.5">
                    <Pill tone={ev.mode === "Online" ? "primary" : "neutral"}>{ev.mode}</Pill>
                    <Pill>{ev.chapter}</Pill>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

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
