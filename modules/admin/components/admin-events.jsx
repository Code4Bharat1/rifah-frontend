"use client";
import Link from "next/link";
import { CalendarDays, Plus, Loader2 } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Textarea } from "@shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@shared/components/ui/sheet";
import { useEvents } from "@shared/hooks/use-rifah-api";
import { eventApi } from "@shared/lib/api-services";

function AdminEvents() {
  const { data: eventsData, refetch } = useEvents();
  const events = eventsData?.data || [];

  const [openAdd, setOpenAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "10:00 AM - 01:00 PM",
    mode: "In-person",
    location: "Chamber Conference Hall",
    city: "Mumbai",
    chapter: "Mumbai Chapter",
  });

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;
    setLoading(true);
    try {
      await eventApi.create(newEvent);
      setOpenAdd(false);
      setNewEvent({
        title: "",
        description: "",
        date: "",
        time: "10:00 AM - 01:00 PM",
        mode: "In-person",
        location: "Chamber Conference Hall",
        city: "Mumbai",
        chapter: "Mumbai Chapter",
      });
      refetch();
    } catch (err) {
      alert(err.message || "Failed to create event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell
      role="admin"
      title="Events"
      subtitle="Chamber programme calendar & conferences"
      actions={
        <Button onClick={() => setOpenAdd(true)}>
          <Plus className="h-4 w-4" /> Create event
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total events" value={String(events.length)} icon={CalendarDays} tone="primary" />
          <StatCard
            label="In-person"
            value={String(events.filter((e) => e.mode === "In-person").length)}
            tone="success"
          />
          <StatCard
            label="Online / Webinar"
            value={String(events.filter((e) => e.mode === "Online").length)}
          />
          <StatCard label="Program Desk" value="Active" tone="warning" />
        </div>

        <Panel title="All events">
          <ResponsiveTable
            rows={events}
            columns={[
              { key: "title", header: "Event", cell: (r) => <span className="font-semibold">{r.title}</span> },
              { key: "date", header: "Date", cell: (r) => `${new Date(r.date).toLocaleDateString()} · ${r.time}` },
              { key: "mode", header: "Mode", cell: (r) => r.mode },
              { key: "chapter", header: "Chapter", cell: (r) => r.chapter },
              { key: "city", header: "City", cell: (r) => r.city },
              {
                key: "act",
                header: "",
                cell: (r) => (
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/events/${r.slug || r._id}`}>
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
                      {new Date(r.date).toLocaleDateString()} · {r.city} · {r.mode}
                    </p>
                  </div>
                  <Pill tone="success">{r.mode}</Pill>
                </div>
                <Button asChild size="sm" variant="outline" className="mt-3">
                  <Link href={`/events/${r.slug || r._id}`}>
                    View event
                  </Link>
                </Button>
              </div>
            )}
          />
        </Panel>
      </div>

      <Sheet open={openAdd} onOpenChange={setOpenAdd}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-left">Publish Chamber Event</SheetTitle>
            <SheetDescription className="text-left">Schedule an event or workshop for members.</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleCreateEvent} className="mt-4 space-y-4 px-4 pb-8">
            <div className="space-y-1.5">
              <Label htmlFor="ev-title">Title *</Label>
              <Input
                id="ev-title"
                required
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="e.g. Export Growth Conclave"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="ev-date">Date *</Label>
                <Input
                  id="ev-date"
                  type="date"
                  required
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ev-mode">Mode</Label>
                <Select value={newEvent.mode} onValueChange={(val) => setNewEvent({ ...newEvent, mode: val })}>
                  <SelectTrigger id="ev-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In-person">In-person</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-city">City</Label>
              <Input
                id="ev-city"
                value={newEvent.city}
                onChange={(e) => setNewEvent({ ...newEvent, city: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-loc">Venue / Link</Label>
              <Input
                id="ev-loc"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-desc">Description</Label>
              <Textarea
                id="ev-desc"
                rows={3}
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish Event"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}

export { AdminEvents };
export default AdminEvents;
