"use client";
import { useParams, useRouter } from "next/navigation";
import { CalendarDays, Clock, MapPin, Users, Ticket, ArrowLeft, Edit, Trash2, Eye, Radio } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Panel, FieldRow, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { useEventDetail } from "@shared/hooks/use-rifah-api";
import { eventApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/api-client";
import { eventImage } from "@shared/lib/media";
import { useAuth } from "@shared/providers/auth-provider";
import { EventRegistrationsModal } from "./event-registrations-modal";
import { getEventStatus } from "@shared/lib/event-utils";

export function AdminEventDetail() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id;
  const { user } = useAuth();

  const { data: event, isLoading } = useEventDetail(eventId);
  const [registrationsModal, setRegistrationsModal] = useState(false);

  if (isLoading) {
    return (
      <AppShell role="admin" title="Event Details" subtitle="Loading...">
        <div className="p-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppShell>
    );
  }

  const basePath = user?.role === "chapter_admin" ? "/chapter-admin/events" : user?.role === "state_admin" ? "/state-admin/events" : "/admin/events";

  if (!event) {
    return (
      <AppShell role="admin" title="Event Not Found">
        <div className="p-12 text-center">
          <p className="text-muted-foreground">This event could not be found.</p>
          <Button asChild className="mt-4"><Link href={basePath}>← Back to Events</Link></Button>
        </div>
      </AppShell>
    );
  }

  const isCentralAdmin = user?.role === "central_admin";
  // Safely compare user._id (or id) with event.createdBy
  const userIdStr = String(user?._id || user?.id);
  const createdByStr = String(event.createdBy?._id || event.createdBy);
  const canEdit = isCentralAdmin || createdByStr === userIdStr;

  const coverUrl = event.coverImage ? resolveMediaUrl(event.coverImage) : eventImage;
  const seatsRemaining = Math.max(0, (event.seats || 100) - (event.registeredCount || 0));

  return (
    <AppShell
      role="admin"
      title={event.title}
      subtitle={`${event.chapter} · ${event.mode}`}
      actions={
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/events/${event.slug || event._id}`} target="_blank">
              <Eye className="h-4 w-4 mr-2" /> Public View
            </Link>
          </Button>
          {canEdit && (
            <Button variant="outline" asChild>
              <Link href={`${basePath}/${event._id}/edit`}>
                <Edit className="h-4 w-4 mr-2" /> Edit
              </Link>
            </Button>
          )}
          <Button asChild className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold">
            <Link href="/chapter-admin/live-control">
              <Radio className="h-4 w-4 mr-2" /> Operations Center
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {(event.coverImage || event.posterImage) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {event.coverImage && (
              <div className={`overflow-hidden rounded-2xl border border-border ${event.posterImage ? 'md:col-span-2' : 'md:col-span-3'}`}>
                <div className="w-full h-48 sm:h-64 lg:h-72 overflow-hidden bg-muted/20">
                  <img
                    src={coverUrl}
                    alt={event.title + " Banner"}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}
            {event.posterImage && (
              <div className={`overflow-hidden rounded-2xl border border-border ${event.coverImage ? 'md:col-span-1' : 'md:col-span-3'}`}>
                <div className="w-full h-48 sm:h-64 lg:h-72 overflow-hidden bg-muted/20 flex justify-center items-center bg-black/5">
                  <img
                    src={resolveMediaUrl(event.posterImage)}
                    alt={event.title + " Poster"}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard 
            label="Status" 
            value={getEventStatus(event)} 
            tone={getEventStatus(event) === "Live" ? "success" : getEventStatus(event) === "Upcoming" ? "info" : getEventStatus(event) === "Ended" ? "default" : "warning"} 
          />
          <StatCard label="Registered" value={String(event.registeredCount || 0)} icon={Users} tone="primary" />
          <StatCard label="Seats Remaining" value={String(seatsRemaining)} />
          <StatCard label="Mode" value={event.mode || "In-person"} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Main Details */}
          <div className="space-y-4">
            <Panel title="Event Information">
              <dl>
                <FieldRow label="Title" value={event.title} />
                <FieldRow label="Date" value={event.date ? new Date(event.date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "TBA"} />
                <FieldRow label="Time" value={event.time} />
                <FieldRow label="Venue" value={event.venue} />
                <FieldRow label="City" value={event.city} />
                <FieldRow label="Chapter" value={event.chapter} />
                <FieldRow label="Organiser" value={event.organizer} />
                <FieldRow label="Fee" value={event.isPaid ? `Paid (₹${event.ticketPrice})` : (event.fee && event.fee !== "Complimentary for Members" ? event.fee : "Free")} />
                <FieldRow label="Mode" value={event.mode} />
              </dl>
            </Panel>

            {event.description && (
              <Panel title="Description">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{event.description}</p>
              </Panel>
            )}

            {event.agenda && event.agenda.length > 0 && (
              <Panel title="Agenda">
                <ol className="space-y-3">
                  {event.agenda.map((a, i) => (
                    <li key={i} className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                      <span className="text-sm font-semibold text-primary">{a.time}</span>
                      <span className="text-sm">{a.title || a.item}</span>
                    </li>
                  ))}
                </ol>
              </Panel>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Panel title="Targeting">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Audience</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(event?.targetAudience || ["All"]).map(a => (
                      <Pill key={a} tone="primary">{a}</Pill>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Chapters</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(event?.targetChapters || ["All"]).map(c => (
                      <Pill key={c}>{c}</Pill>
                    ))}
                  </div>
                </div>
              </div>
            </Panel>

            {canEdit ? (
              <Panel title="Registrations">
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">{event.registeredCount || 0}</p>
                    <p className="text-xs text-muted-foreground">people registered</p>
                  </div>
                  <Button className="w-full" onClick={() => setRegistrationsModal(true)}>
                    View All Registrations
                  </Button>
                </div>
              </Panel>
            ) : (
              <Panel title="Registration">
                <div className="space-y-3 text-center">
                  <p className="text-sm text-muted-foreground">Register to attend this event.</p>
                  <Button asChild className="w-full">
                    <Link href={`/events/${event.slug || event._id}`}>
                      RSVP / Register
                    </Link>
                  </Button>
                </div>
              </Panel>
            )}
          </aside>
        </div>
      </div>

      <EventRegistrationsModal
        eventId={event._id}
        eventTitle={event.title}
        open={registrationsModal}
        onOpenChange={setRegistrationsModal}
      />
    </AppShell>
  );
}

export default AdminEventDetail;
