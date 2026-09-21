"use client";
import Link from "next/link";
import { Clock, MapPin, Ticket, Users, Share2, ImageIcon } from "lucide-react";
import { useState } from "react";

import { Pill } from "@shared/components/rifah/badges";
import { PublicLayout } from "@shared/components/rifah/public-layout";
import { resolveMediaUrl } from "@shared/lib/api-client";
import { SectionHeader } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@shared/components/ui/tabs";
import { useEvents } from "@shared/hooks/use-rifah-api";
import { EventShareModal } from "@shared/components/rifah/event-share-modal";
import { cn } from "@shared/lib/utils";
import { getEventStatus, getEventStatusConfig } from "@shared/lib/event-utils";

function EventsPage() {
  const [tab, setTab] = useState("All");
  const [creatorRole, setCreatorRole] = useState("all");
  const [sharingEvent, setSharingEvent] = useState(null);
  const { data: eventsData, isLoading } = useEvents({ 
    creatorRole: creatorRole === "all" ? undefined : creatorRole 
  });
  const rawList = Array.isArray(eventsData)
    ? eventsData
    : (eventsData?.events || eventsData?.data || []);

  const list = rawList.filter((ev) => {
    const status = getEventStatus(ev);
    if (tab === "Upcoming") return status === "Upcoming";
    if (tab === "Live") return status === "Live";
    if (tab === "Past" || tab === "Ended") return status === "Ended";
    return true;
  });

  return (
    <PublicLayout>
      <div className="rifah-container py-6 sm:py-10">
        <SectionHeader
          title="Events & trade meets"
          description="Structured networking, capability showcases and advisory clinics run by RIFAH chapters and units."
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-5">
          <Tabs value={tab} onValueChange={(v) => setTab(v)}>
            <TabsList>
              <TabsTrigger value="All">All</TabsTrigger>
              <TabsTrigger value="Upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="Live">Live</TabsTrigger>
              <TabsTrigger value="Ended">Ended</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "All Events" },
              { id: "central_admin", label: "Central" },
              { id: "state_admin", label: "State" },
              { id: "chapter_admin", label: "Chapter" },
            ].map((role) => (
              <button
                key={role.id}
                onClick={() => setCreatorRole(role.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                  creatorRole === role.id 
                    ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                    : "bg-surface text-muted-foreground border-border hover:bg-muted"
                )}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>

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
                  <div className="w-full h-40 sm:h-48 overflow-hidden rounded-xl bg-muted/20 mb-4">
                    {ev.posterImage || ev.coverImage ? (
                      <img 
                        src={resolveMediaUrl(ev.posterImage || ev.coverImage)} 
                        alt={ev.title}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-300">
                        <ImageIcon className="h-10 w-10 opacity-50" />
                      </div>
                    )}
                  </div>
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
                      <Ticket className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{ev.isPaid ? `₹${ev.ticketPrice}` : (ev.fee && ev.fee !== "Complimentary for Members" ? ev.fee : "Free")}</span>
                    </div>
                  </dl>
                  <div className="mt-3 flex flex-1 flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(() => {
                        const status = getEventStatus(ev);
                        const cfg = getEventStatusConfig(status);
                        return (
                          <Pill tone={cfg.tone} className={cfg.className}>
                            {cfg.dot && <span className="w-1.5 h-1.5 rounded-full bg-white inline-block mr-1" />}
                            {cfg.label}
                          </Pill>
                        );
                      })()}
                      <Pill tone={ev.mode === "Online" ? "primary" : "neutral"}>{ev.mode}</Pill>
                      {ev.chapter && <Pill>{ev.chapter}</Pill>}
                      {ev.isPaid ? <Pill tone="warning">Paid (₹{ev.ticketPrice})</Pill> : <Pill tone="success">Free</Pill>}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSharingEvent(ev);
                      }}
                      className="rounded-xl h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border/60 shrink-0 gap-1.5"
                      title="Share Event"
                      aria-label={`Share ${ev.title}`}
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Share</span>
                    </Button>
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

      <EventShareModal
        event={sharingEvent}
        open={Boolean(sharingEvent)}
        onOpenChange={(open) => {
          if (!open) setSharingEvent(null);
        }}
      />
    </PublicLayout>
  );
}

export { EventsPage };
export default EventsPage;
