"use client";
import { useParams, useRouter } from "next/navigation";
import { CalendarDays, Clock, MapPin, Users, Ticket, ArrowLeft, Edit, Trash2, Eye } from "lucide-react";
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
import { EventRegistrationsModal } from "./event-registrations-modal";

export function AdminEventDetail() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id;

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

  if (!event) {
    return (
      <AppShell role="admin" title="Event Not Found">
        <div className="p-12 text-center">
          <p className="text-muted-foreground">This event could not be found.</p>
          <Button asChild className="mt-4"><Link href="/admin/events">← Back to Events</Link></Button>
        </div>
      </AppShell>
    );
  }

  const coverUrl = event.coverImage ? resolveMediaUrl(event.coverImage) : eventImage;
  const seatsRemaining = Math.max(0, (event.seats || 100) - (event.registeredCount || 0));

  return (
    <AppShell
      role="admin"
      title={event.title}
      subtitle={`${event.chapter} · ${event.mode}`}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/events/${event.slug || event._id}`} target="_blank">
              <Eye className="h-4 w-4 mr-2" /> Public View
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/events/${event._id}/edit`}>
              <Edit className="h-4 w-4 mr-2" /> Edit
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Cover Image - only show if uploaded */}
        {event.coverImage && (
          <div className="overflow-hidden rounded-2xl border border-border">
            <div className="h-32 sm:h-48 overflow-hidden">
              <img
                src={coverUrl}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Status" value={event.status || "Draft"} tone={event.status === "Upcoming" ? "success" : "warning"} />
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
                <FieldRow label="Fee" value={event.fee} />
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
                    {(event.targetAudience || ["All"]).map(a => (
                      <Pill key={a} tone="primary">{a}</Pill>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Chapters</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(event.targetChapters || ["All"]).map(c => (
                      <Pill key={c}>{c}</Pill>
                    ))}
                  </div>
                </div>
              </div>
            </Panel>

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
