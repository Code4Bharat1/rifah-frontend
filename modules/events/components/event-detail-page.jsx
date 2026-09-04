"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock, MapPin, Share2, Ticket, Users } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@shared/providers/auth-provider";

import { Pill } from "@shared/components/rifah/badges";
import { PublicLayout } from "@shared/components/rifah/public-layout";
import { FieldRow, Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { eventImage } from "@shared/lib/media";
import { useEventDetail, useEvents } from "@shared/hooks/use-rifah-api";
import { eventApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/api-client";

function EventDetail() {
  const params = useParams();
  const eventId = params?.eventId;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: event, isLoading } = useEventDetail(eventId);
  const { data: othersData } = useEvents({ status: "Upcoming", limit: 3 });

  const others = Array.isArray(othersData) ? othersData : (othersData?.events || []);

  const [registered, setRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);

  const isUserRegistered = Boolean(
    registered ||
    (user?._id && Array.isArray(event?.registeredUsers) && event.registeredUsers.some(
      (u) => String(u?._id || u) === String(user._id)
    ))
  );

  const handleRegister = async () => {
    if (!user) {
      toast.info("Please log in to RSVP / register for this event");
      window.location.href = `/login?redirect=/events/${eventId || event?.slug}`;
      return;
    }

    if (isUserRegistered) {
      toast.info("You are already registered for this event!");
      return;
    }

    setRegistering(true);
    try {
      await eventApi.register(event._id);
      setRegistered(true);
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("RSVP confirmed! You are registered for this event.");
    } catch (err) {
      console.error("Register error:", err);
      const message = err.message || "Failed to register for this event";
      if (message.toLowerCase().includes("already registered")) {
        setRegistered(true);
        toast.info("You are already registered for this event!");
      } else {
        toast.error(message);
      }
    } finally {
      setRegistering(false);
    }
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="rifah-container py-16 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading event details...</p>
        </div>
      </PublicLayout>
    );
  }

  if (!event) {
    return (
      <PublicLayout>
        <div className="rifah-container py-16 text-center">
          <h1 className="text-2xl font-bold">Event not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">This event may have ended or been rescheduled.</p>
          <Button asChild className="mt-6">
            <Link href="/events">Back to events</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const coverUrl = event.coverImage ? resolveMediaUrl(event.coverImage) : eventImage;

  return (
    <PublicLayout>
      <div className="rifah-container py-6 sm:py-10">
        <Link href="/events" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          ← All events
        </Link>

        <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="h-28 overflow-hidden sm:h-40">
                <img
                  src={coverUrl}
                  alt={`${event.title} — RIFAH event`}
                  width={1024}
                  height={640}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex flex-wrap gap-1.5">
                  <Pill tone={event.mode === "Online" ? "primary" : "neutral"}>{event.mode}</Pill>
                  <Pill>{event.chapter}</Pill>
                  <Pill tone={event.status === "Upcoming" ? "success" : "neutral"}>{event.status}</Pill>
                </div>
                <h1 className="mt-3 text-xl font-bold leading-tight tracking-tight sm:text-3xl">{event.title}</h1>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                  {event.summary || event.description || "Join this chamber event to connect with members and businesses."}
                </p>

                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 sm:grid-cols-4">
                  {[
                    { icon: CalendarDays, label: "Date", value: event.date ? new Date(event.date).toLocaleDateString() : "TBA" },
                    { icon: Clock, label: "Time", value: event.time },
                    { icon: MapPin, label: "Venue", value: event.venue },
                    { icon: Users, label: "Capacity", value: `${event.seats} seats` },
                  ].map((s) => (
                    <div key={s.label} className="min-w-0">
                      <dt className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        <s.icon className="h-3.5 w-3.5" /> {s.label}
                      </dt>
                      <dd className="mt-0.5 truncate text-sm font-semibold">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {event.agenda && event.agenda.length > 0 && (
                <Panel title="Agenda">
                  <ol className="space-y-3">
                    {event.agenda.map((a, i) => (
                      <li key={i} className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                        <span className="text-sm font-semibold text-primary">{a.time}</span>
                        <span className="text-sm">{a.item}</span>
                      </li>
                    ))}
                  </ol>
                </Panel>
              )}
              <Panel title="Event details">
                <dl>
                  <FieldRow label="Organiser" value={event.organizer} />
                  <FieldRow label="Chapter" value={event.chapter} />
                  <FieldRow label="Mode" value={event.mode} />
                  <FieldRow label="Location" value={`${event.venue}, ${event.city}`} />
                  <FieldRow label="Participation fee" value={event.fee} />
                  <FieldRow label="Who should attend" value="Member businesses, buyers and chapter invitees" />
                </dl>
              </Panel>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Panel title="Registration">
              {isUserRegistered ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                  <div className="mx-auto w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">You are registered!</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Confirmation has been recorded. Joining details will be shared prior to the session.
                  </p>
                  <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground flex justify-between">
                    <span>Status</span>
                    <span className="font-semibold text-emerald-600">RSVP Confirmed</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-2xl font-bold tracking-tight">{event.fee}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.max(0, (event.seats || 100) - (event.registeredCount || 0))} seats remaining
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    size="lg"
                    disabled={registering}
                    onClick={handleRegister}
                  >
                    {registering ? "Registering..." : "RSVP / Register"}
                  </Button>
                </div>
              )}
            </Panel>

            {others.length > 0 && (
              <Panel title="Other upcoming events">
                <ul className="space-y-3">
                  {others.map((o) => (
                    <li key={o._id || o.slug}>
                      <Link href={`/events/${o.slug || o._id}`} className="group block">
                        <p className="text-xs font-semibold text-primary">{o.date ? new Date(o.date).toLocaleDateString() : ""}</p>
                        <p className="text-sm font-medium leading-snug group-hover:underline">{o.title}</p>
                        <p className="text-xs text-muted-foreground">{o.city} · {o.mode}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}

export { EventDetail as EventDetailPage };
export default EventDetail;
