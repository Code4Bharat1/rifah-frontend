"use client";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock, MapPin, Share2, Ticket, Users } from "lucide-react";
import { useState } from "react";

import { Pill } from "@shared/components/rifah/badges";
import { PublicLayout } from "@shared/components/rifah/public-layout";
import { FieldRow, Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { eventImage } from "@shared/lib/media";
import { events, } from "@shared/lib/mock-data";

function EventDetail() {
  const params = useParams();
  const eventId = params?.eventId;
  const event = events.find((e) => e.id === eventId) || events[0];
  if (!event) return null;
  const [registered, setRegistered] = useState(event.registered);
  const others = events.filter((e) => e.id !== event.id && e.status === "Upcoming").slice(0, 3);

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
                  src={eventImage}
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
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">{event.summary}</p>

                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 sm:grid-cols-4">
                  {[
                    { icon: CalendarDays, label: "Date", value: event.date },
                    { icon: Clock, label: "Time", value: event.time },
                    { icon: MapPin, label: "Venue", value: event.venue },
                    { icon: Users, label: "Seats", value: event.seats },
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
              <Panel title="Agenda">
                <ol className="space-y-3">
                  {event.agenda.map((a) => (
                    <li key={a.time} className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                      <span className="text-sm font-semibold text-primary">{a.time}</span>
                      <span className="text-sm">{a.item}</span>
                    </li>
                  ))}
                </ol>
              </Panel>
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
              <Panel title="Venue">
                <div className="grid h-40 place-items-center rounded-xl border border-dashed border-border bg-muted text-xs text-muted-foreground">
                  Map placeholder — {event.mode === "Online" ? "joining link shared after registration" : event.venue}
                </div>
              </Panel>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Panel title="Registration">
              {registered ? (
                <div className="rounded-xl border border-success/30 bg-success-soft p-3">
                  <p className="flex items-center gap-2 text-sm font-semibold text-success">
                    <CheckCircle2 className="h-4 w-4" /> You are registered
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your pass will be available in My events before the session.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2.5 text-sm">
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Fee</span>
                    <span className="font-medium">{event.fee}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Availability</span>
                    <span className="font-medium">{event.seats}</span>
                  </li>
                </ul>
              )}
              <div className="mt-4 grid gap-2">
                <Button
                  size="lg"
                  variant={registered ? "outline" : "default"}
                  disabled={event.status === "Past"}
                  onClick={() => setRegistered((r) => !r)}
                >
                  <Ticket className="h-4 w-4" />
                  {event.status === "Past"
                    ? "Event concluded"
                    : registered
                      ? "Cancel registration"
                      : "Register for this event"}
                </Button>
                <Button variant="ghost" size="lg">
                  <Share2 className="h-4 w-4" /> Share event
                </Button>
              </div>
            </Panel>
            <Panel title="Other upcoming events">
              <ul className="space-y-3">
                {others.map((e) => (
                  <li key={e.id}>
                    <Link href={`/events/${e.id }`}
                      className="block rounded-xl border border-border p-3 transition-colors hover:border-primary/40"
                    >
                      <p className="text-sm font-semibold leading-snug">{e.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {e.date} · {e.city}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-[56px] z-30 border-t border-border bg-surface/95 p-3 backdrop-blur md:hidden">
        <Button
          size="lg"
          className="w-full"
          variant={registered ? "outline" : "default"}
          disabled={event.status === "Past"}
          onClick={() => setRegistered((r) => !r)}
        >
          <Ticket className="h-4 w-4" />
          {registered ? "Cancel registration" : "Register for this event"}
        </Button>
      </div>
    </PublicLayout>
  );
}


const EventDetailPage = EventDetail;

export { EventDetailPage };
export default EventDetailPage;
