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
import { useAuth } from "@shared/providers/auth-provider";

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

  const { user } = useAuth();

  const canSeeEvent = (ev) => {
    if (!ev) return true;
    if (["central_admin", "state_admin", "chapter_admin"].includes(user?.role)) return true;
    
    const access = ev.registrationAccess || "All";
    if (access === "Chapter Admins Only" || access === "State Secretaries Only") {
      if (!user) return false;
    }
    
    if (ev.targetAudience && ev.targetAudience.length > 0 && !ev.targetAudience.includes("All")) {
      const roleDisplay = user?.role === "business_owner" ? "Businesses" : "Consumers";
      const audiences = ev.targetAudience.map(a => (typeof a === "string" ? a.trim().toLowerCase() : ""));
      if (!audiences.includes("all") && (!user || !audiences.includes(roleDisplay.toLowerCase()))) return false;
    }

    if (ev.targetStates && ev.targetStates.length > 0) {
      const states = ev.targetStates.map(s => (typeof s === "string" ? s.trim().toLowerCase() : ""));
      if (!states.includes("all")) {
        if (!user || !user.state || !states.includes(user.state.trim().toLowerCase())) return false;
      }
    }

    if (ev.targetChapters && ev.targetChapters.length > 0) {
      const chapters = ev.targetChapters.map(c => (typeof c === "string" ? c.trim().toLowerCase() : ""));
      if (!chapters.includes("all")) {
        if (!user || !user.chapter || !chapters.includes(user.chapter.trim().toLowerCase())) return false;
      }
    }
    return true;
  };

  const list = rawList.filter((ev) => {
    if (!canSeeEvent(ev)) return false;
    const status = getEventStatus(ev);
    if (tab === "Upcoming") return status === "Upcoming";
    if (tab === "Live") return status === "Live";
    if (tab === "Past" || tab === "Ended") return status === "Ended";
    return true;
  }).sort((a, b) => {
    const statusWeight = { "Live": 0, "Upcoming": 1, "Ended": 2 };
    const statusA = getEventStatus(a);
    const statusB = getEventStatus(b);
    
    if (statusWeight[statusA] !== statusWeight[statusB]) {
      return statusWeight[statusA] - statusWeight[statusB];
    }
    
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    
    // For ended events, show most recently ended first
    if (statusA === "Ended") {
      return dateB - dateA;
    }
    // For upcoming/live, show closest ones first
    return dateA - dateB;
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
            {list.map((ev, evIdx) => (
              <li key={ev._id || ev.slug || `ev-${evIdx}`}>
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
                    {(() => {
                      const isEventPaid = Boolean(
                        ev?.isPaid === true || 
                        ev?.isPaid === "true" || 
                        ev?.isPaid === "Paid" || 
                        Number(ev?.ticketPrice) > 0 || 
                        Number(ev?.memberPrice) > 0 || 
                        (ev?.fee && ev.fee !== "Free" && ev.fee !== "Complimentary for Members")
                      );
                      const guestBase = Number(ev?.ticketPrice) || (ev?.fee ? parseInt(ev.fee.replace(/\D/g, '')) || 0 : 0);
                      const memberBase = Number(ev?.memberPrice) || 0;
                      const guestTotal = guestBase + Math.round(guestBase * 0.18);
                      const memberTotal = memberBase + Math.round(memberBase * 0.18);
                      
                      return isEventPaid ? (
                        <div className="col-span-2 flex items-center gap-2 mt-1 p-1.5 px-2 bg-emerald-500/10 rounded-md border border-emerald-500/20">
                          <Ticket className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                          <div className="flex items-center justify-between gap-3 w-full">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 text-emerald-700">
                                <span className="text-[9px] font-bold uppercase tracking-wider">Member:</span>
                                <span className="font-bold text-sm leading-none">₹{memberTotal}</span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground border-l border-emerald-500/30 pl-3">
                                <span className="text-[9px] font-semibold uppercase tracking-wider">Guest:</span>
                                <span className="font-semibold text-sm leading-none">₹{guestTotal}</span>
                              </div>
                            </div>
                            <span className="text-[9px] text-muted-foreground font-medium shrink-0">incl. 18% GST</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Ticket className="h-3.5 w-3.5 shrink-0" /> 
                          <span className="truncate">{ev.fee && ev.fee !== "Complimentary for Members" ? ev.fee : "Free"}</span>
                        </div>
                      );
                    })()}
                  </dl>
                  {ev.totalSeats > 0 && (
                    <div className="mt-4 pt-3 border-t border-border/40">
                      <div className="flex justify-between items-center text-[10px] font-semibold mb-1.5 uppercase tracking-wide">
                        <span className="text-muted-foreground">Seats Booked</span>
                        <span className={ev.registeredCount >= ev.totalSeats ? "text-destructive" : "text-primary"}>
                          {ev.registeredCount || 0} / {ev.totalSeats}
                        </span>
                      </div>
                      <div className="w-full bg-muted/80 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${ev.registeredCount >= ev.totalSeats ? 'bg-destructive' : 'bg-primary'}`} 
                          style={{ width: `${Math.min(100, ((ev.registeredCount || 0) / ev.totalSeats) * 100)}%` }} 
                        />
                      </div>
                    </div>
                  )}
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
                      {(() => {
                        const isEventPaid = Boolean(
                          ev?.isPaid === true || 
                          ev?.isPaid === "true" || 
                          ev?.isPaid === "Paid" || 
                          Number(ev?.ticketPrice) > 0 || 
                          Number(ev?.memberPrice) > 0 || 
                          (ev?.fee && ev.fee !== "Free" && ev.fee !== "Complimentary for Members")
                        );
                        return isEventPaid ? <Pill tone="warning">Paid</Pill> : <Pill tone="success">Free</Pill>;
                      })()}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {getEventStatus(ev) !== "Ended" && (
                        ev.totalSeats > 0 && (ev.registeredCount || 0) >= ev.totalSeats ? (
                          <div className="flex items-center bg-destructive/10 text-destructive text-[10px] font-bold px-3 rounded-xl border border-destructive/20 h-8 shadow-sm">
                            Seats Full
                          </div>
                        ) : (
                          <Button
                            asChild
                            size="sm"
                            variant="default"
                            className="rounded-xl h-8 px-3 text-xs shadow-sm cursor-pointer"
                          >
                            <span>Register</span>
                          </Button>
                        )
                      )}
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
