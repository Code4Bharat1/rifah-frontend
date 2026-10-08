"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Ticket,
  Search,
  CheckCircle2,
  Sparkles,
  Building2,
  Laptop,
  ArrowRight,
  Share2,
  Download,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { useAuth } from "@shared/providers/auth-provider";
import { useEvents } from "@shared/hooks/use-rifah-api";
import { resolveMediaUrl } from "@shared/lib/api-client";
import { eventImage } from "@shared/lib/media";
import { EventShareModal } from "@shared/components/rifah/event-share-modal";
import { downloadTicketPdf } from "@shared/lib/ticket-pdf-generator";
import { toast } from "sonner";
import { cn } from "@shared/lib/utils";
import { getEventStatus, getEventStatusConfig, formatEventDate } from "@shared/lib/event-utils";

export function BizEvents() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeView, setActiveView] = useState("all"); // "all" | "my-passes" | "in-person" | "webinar"
  const [searchQuery, setSearchQuery] = useState("");
  const [sharingEvent, setSharingEvent] = useState(null);

  // Fetch all chamber events (nationwide + all chapters)
  const { data: eventsData, isLoading } = useEvents({ all: "true", limit: 100 });

  const rawList = Array.isArray(eventsData)
    ? eventsData
    : eventsData?.events || eventsData?.data || [];

  // Helper to test if logged-in user is registered for an event
  const isRegistered = (ev) => {
    if (!user?._id && !user?.id) return false;
    const myId = String(user?._id || user?.id);
    if (!Array.isArray(ev?.registeredUsers)) return false;
    return ev.registeredUsers.some((reg) => {
      const regUserId = String(reg?.user?._id || reg?.user || reg?._id || reg);
      return regUserId === myId;
    });
  };

  const myPassesList = useMemo(() => {
    return rawList.filter(isRegistered);
  }, [rawList, user]);

  const inPersonMeetsCount = useMemo(() => {
    return rawList.filter(
      (e) => (e.mode || "").toLowerCase() === "in-person"
    ).length;
  }, [rawList]);

  const webinarsCount = useMemo(() => {
    return rawList.filter((e) =>
      ["online", "hybrid"].includes((e.mode || "").toLowerCase())
    ).length;
  }, [rawList]);

  // Filtered dataset for display: only "All Events" or "My Passes"
  const displayedEvents = useMemo(() => {
    let list = rawList;

    if (activeView === "my-passes") {
      list = list.filter(isRegistered);
    } else if (activeView === "in-person") {
      list = list.filter((e) => (e.mode || "").toLowerCase() === "in-person");
    } else if (activeView === "webinar") {
      list = list.filter((e) => ["online", "hybrid"].includes((e.mode || "").toLowerCase()));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (ev) =>
          ev.title?.toLowerCase().includes(q) ||
          ev.description?.toLowerCase().includes(q) ||
          ev.city?.toLowerCase().includes(q) ||
          ev.chapter?.toLowerCase().includes(q) ||
          ev.venue?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [rawList, activeView, searchQuery, user]);

  return (
    <AppShell
      role="business"
      title="Events & Trade Meets"
      subtitle="Business Workspace · Chamber Meets, B2B Summits & Masterclasses"
    >
      <div className="space-y-6">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <button
            type="button"
            onClick={() => setActiveView("all")}
            className={cn(
              "text-left rounded-2xl border bg-card p-4 shadow-xs transition-all hover:border-primary/50 cursor-pointer",
              activeView === "all"
                ? "border-primary/60 ring-2 ring-primary/20"
                : "border-border"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                All Chamber Events
              </span>
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
                <CalendarDays className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
              {rawList.length}
            </p>
            <span className="mt-1 block text-xs text-muted-foreground">
              Total meets & summits
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView("my-passes")}
            className={cn(
              "text-left rounded-2xl border bg-card p-4 shadow-xs transition-all hover:border-emerald-500/60 cursor-pointer",
              activeView === "my-passes"
                ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-2 ring-emerald-500/30"
                : "border-border"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                My Passes
              </span>
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <Ticket className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-600 sm:text-3xl">
              {myPassesList.length}
            </p>
            <span className="mt-1 block text-xs font-medium text-emerald-600/80">
              {activeView === "my-passes" ? "✓ Viewing my passes" : "Click to view my passes"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView("in-person")}
            className={cn(
              "text-left rounded-2xl border bg-card p-4 shadow-xs transition-all hover:border-blue-500/60 cursor-pointer",
              activeView === "in-person"
                ? "border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 ring-2 ring-blue-500/30"
                : "border-border"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                In-Person Meets
              </span>
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-500/10 text-blue-600">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
              {inPersonMeetsCount}
            </p>
            <span className="mt-1 block text-xs text-muted-foreground">
              Chapter networking meets
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView("webinar")}
            className={cn(
              "text-left rounded-2xl border bg-card p-4 shadow-xs transition-all hover:border-purple-500/60 cursor-pointer",
              activeView === "webinar"
                ? "border-purple-500 bg-purple-50/40 dark:bg-purple-950/20 ring-2 ring-purple-500/30"
                : "border-border"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Webinars
              </span>
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-purple-500/10 text-purple-600">
                <Laptop className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
              {webinarsCount}
            </p>
            <span className="mt-1 block text-xs text-muted-foreground">
              Virtual masterclasses
            </span>
          </button>
        </div>

        {/* Filter Toolbar: Only "All Events", "My Passes" and Search */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Simple View Switcher: All Events vs My Passes */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveView("all")}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all border",
                  activeView === "all"
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                )}
              >
                <CalendarDays className="h-4 w-4" />
                <span>All Events</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold",
                    activeView === "all"
                      ? "bg-white/20 text-white"
                      : "bg-muted text-foreground"
                  )}
                >
                  {rawList.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView("my-passes")}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all border",
                  activeView === "my-passes"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                )}
              >
                <Ticket className="h-4 w-4" />
                <span>My Passes</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold",
                    activeView === "my-passes"
                      ? "bg-white/20 text-white"
                      : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                  )}
                >
                  {myPassesList.length}
                </span>
              </button>
            </div>

            {/* Live Search */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search events, cities, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 text-xs rounded-xl bg-muted/30 focus:bg-background"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Event Cards Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 rounded-2xl border border-border bg-card p-5 animate-pulse space-y-4"
              >
                <div className="h-40 w-full bg-muted rounded-xl" />
                <div className="space-y-2">
                  <div className="h-3 w-1/3 bg-muted rounded" />
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-muted text-muted-foreground mb-3">
              <CalendarDays className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              {activeView === "my-passes"
                ? "No Event Passes Yet"
                : "No Events Found"}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
              {activeView === "my-passes"
                ? "You have not registered for any events yet. Browse all events to reserve your pass!"
                : "There are no events matching your search. Try a different search term."}
            </p>
            {activeView === "my-passes" ? (
              <Button
                size="sm"
                onClick={() => setActiveView("all")}
                className="mt-4 gap-2 rounded-xl font-semibold"
              >
                <CalendarDays className="h-4 w-4" />
                <span>Browse All Events</span>
              </Button>
            ) : (
              searchQuery && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                  className="mt-4 text-xs rounded-xl"
                >
                  Clear Search
                </Button>
              )
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayedEvents.map((ev) => {
              const registered = isRegistered(ev);

              if (activeView === "my-passes") {
                const userReg = (ev.registeredUsers || []).find((reg) => {
                  const regUserId = String(reg?.user?._id || reg?.user || reg?._id || reg);
                  return regUserId === String(user?._id || user?.id);
                });

                const qrUserName = user ? (user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Member') : 'Attendee';
                const qrUserEmail = user ? user.email : 'N/A';
                const qrUserBusiness = user?.businessName || '';
                const qrEventName = ev?.title || '';
                const ticketId = userReg?.ticketId || `RIFAH-EVT-${new Date().getFullYear()}-${String(ev._id || '').slice(-4).toUpperCase()}`;
                const verificationToken = userReg?.verificationToken || '';
                const ticketType = userReg?.ticketType || (ev.isPaid ? "Member Pass" : "General Pass");
                const origin = typeof window !== 'undefined' ? window.location.origin : '';
                const tokenQuery = verificationToken ? `?token=${encodeURIComponent(verificationToken)}` : '';
                const secureVerifyUrl = `${origin}/verify/ticket/${encodeURIComponent(ticketId)}${tokenQuery}`;

                const handleDownloadPass = async () => {
                  try {
                    await downloadTicketPdf({
                      ticketId,
                      attendeeName: qrUserName,
                      attendeeEmail: qrUserEmail,
                      attendeeCompany: qrUserBusiness,
                      eventTitle: qrEventName,
                      eventDate: formatEventDate(ev.date),
                      eventTime: ev.time,
                      eventVenue: ev.venue || ev.location || "Chamber Main Hall",
                      eventCity: ev.city || "",
                      ticketType,
                      paymentStatus: userReg?.paymentStatus || (ev.isPaid ? "PAID" : "COMPLIMENTARY"),
                      amountPaid: userReg?.amountPaid || (ev.isPaid ? ev.ticketPrice : 0),
                      verificationUrl: secureVerifyUrl,
                    });
                    toast.success("Ticket PDF downloaded!");
                  } catch (e) {
                    toast.error("Could not download ticket PDF");
                  }
                };
                
                return (
                  <article key={ev._id || ev.slug} className="flex flex-col bg-card rounded-2xl shadow-sm border border-emerald-500/20 relative overflow-hidden transition-all hover:shadow-md hover:border-emerald-500/40">
                    <div className="p-4 bg-emerald-600 text-white">
                      <div className="flex justify-between items-start mb-2">
                        <Pill className="bg-white/20 text-white border-none text-[9px] uppercase tracking-wider px-2 py-0.5 font-bold shadow-none">{ev.mode || "In-Person"}</Pill>
                        <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-bold backdrop-blur-sm tracking-wider">RSVP CONFIRMED</span>
                      </div>
                      <h3 className="font-bold text-sm leading-snug line-clamp-2">{ev.title}</h3>
                      <p className="text-[11px] text-emerald-100 mt-1.5 flex items-center gap-1 font-medium"><CalendarDays className="w-3 h-3 shrink-0"/> {formatEventDate(ev.date)} · {ev.time}</p>
                    </div>
                    
                    {/* Dashed line tear */}
                    <div className="w-full border-t-2 border-dashed border-border my-0 relative bg-card">
                      <div className="absolute -left-3 -top-3 w-6 h-6 bg-background rounded-full border-r border-border"></div>
                      <div className="absolute -right-3 -top-3 w-6 h-6 bg-background rounded-full border-l border-border"></div>
                    </div>
                    
                    <div className="p-4 flex flex-col items-center bg-card">
                      <div className="flex items-center justify-between w-full mb-2">
                        <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest">Digital Entry Pass</p>
                        <span className="text-[9px] font-mono text-muted-foreground font-semibold">{ticketId}</span>
                      </div>
                      <div className="p-1.5 bg-white rounded-xl border border-gray-200 shadow-xs mb-2">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(secureVerifyUrl)}`} alt="Entry Pass QR" className="w-[100px] h-[100px]" />
                      </div>
                      <a href={`/verify/ticket/${ticketId}${tokenQuery}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-emerald-600 hover:underline mb-3 font-semibold flex items-center gap-1">
                        Open Verification Link
                      </a>
                      
                      <div className="w-full text-left space-y-2 px-1">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">Attendee</p>
                            <p className="font-bold text-foreground text-xs truncate">{qrUserName}</p>
                          </div>
                          {qrUserBusiness && (
                            <div className="text-right min-w-0 shrink-0 max-w-[45%]">
                              <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">Business</p>
                              <p className="font-bold text-foreground text-xs truncate">{qrUserBusiness}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                           <span className="truncate">{qrUserEmail}</span>
                           <span className="font-semibold text-emerald-600">{ticketType}</span>
                        </div>
                      </div>
                      
                      <div className="w-full grid grid-cols-2 gap-2 mt-4">
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="outline" 
                          onClick={handleDownloadPass}
                          className="w-full rounded-xl text-xs h-8 gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 font-semibold"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </Button>
                        <Button asChild size="sm" variant="default" className="w-full rounded-xl text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                          <Link href={`/events/${ev._id || ev.slug}`}>Details</Link>
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              }

              return (
                <article
                  key={ev._id || ev.slug}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:border-primary/40 hover:shadow-sm"
                >
                  <div>
                    <div className="relative h-44 overflow-hidden bg-muted">
                      <img
                        src={ev.coverImage ? resolveMediaUrl(ev.coverImage) : eventImage}
                        alt={`${ev.title} — RIFAH event`}
                        loading="lazy"
                        width={1024}
                        height={640}
                        onError={(event) => {
                          event.currentTarget.src = eventImage;
                        }}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute left-3 top-3 flex items-center gap-1.5 flex-wrap">
                        {(() => {
                          const status = getEventStatus(ev);
                          const cfg = getEventStatusConfig(status);
                          return (
                            <Pill tone={cfg.tone} className={cn("text-[10px] font-bold shadow-xs", cfg.className)}>
                              {cfg.dot && <span className="w-1.5 h-1.5 rounded-full bg-white inline-block mr-1" />}
                              {cfg.label}
                            </Pill>
                          );
                        })()}
                        <Pill tone="navy" className="bg-navy text-white text-[10px] font-semibold">
                          {ev.mode || "In-person"}
                        </Pill>
                        {ev.chapter && (
                          <span className="rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-white border border-white/10">
                            {ev.chapter}
                          </span>
                        )}
                      </div>
                      {registered && (
                        <div className="absolute right-3 top-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Pass Confirmed</span>
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4.5">
                      <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                        <CalendarDays className="h-3.5 w-3.5" /> {formatEventDate(ev.date) || ev.date} · {ev.time}
                      </p>
                      <h3 className="mt-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                        {ev.title}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {ev.venue}{ev.city ? ` · ${ev.city}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="p-4.5 pt-0 flex items-center gap-2">
                    <Button asChild size="sm" variant="outline" className="flex-1 rounded-xl">
                      <Link href={`/events/${ev._id || ev.slug}`}>
                        View Event Details
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setSharingEvent(ev)}
                      className="rounded-xl h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:border-primary/50 shrink-0"
                      title="Share Event"
                      aria-label={`Share ${ev.title}`}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Chamber Host / Partnership Notice */}
        <div className="rounded-2xl border border-border bg-gradient-to-r from-primary/5 via-card to-card p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Host a Capability Showcase or Sponsor an Event</span>
            </h3>
            <p className="text-xs text-muted-foreground max-w-xl">
              RIFAH Chamber verified business members can propose chapter roundtables, industry clinics, and sponsor upcoming B2B summits to gain direct visibility.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button asChild size="sm" variant="outline" className="rounded-xl text-xs font-semibold">
              <Link href="/biz/messages">
                <span>Contact Secretariat</span>
              </Link>
            </Button>
            <Button asChild size="sm" className="rounded-xl text-xs font-semibold gap-1.5">
              <Link href="/events">
                <span>Public Events Portal</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <EventShareModal
        event={sharingEvent}
        open={Boolean(sharingEvent)}
        onOpenChange={(open) => {
          if (!open) setSharingEvent(null);
        }}
      />
    </AppShell>
  );
}
