"use client";
import Link from "next/link";
import { CalendarDays, Plus, Loader2, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Textarea } from "@shared/components/ui/textarea";
import { Checkbox } from "@shared/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@shared/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@shared/components/ui/dropdown-menu";
import { useEvents } from "@shared/hooks/use-rifah-api";
import { eventApi } from "@shared/lib/api-services";
import { useAuth } from "@shared/providers/auth-provider";
import { EventRegistrationsModal } from "./event-registrations-modal";

function AdminEvents() {
  const { user } = useAuth();
  const isSuperAdmin = ["super_admin", "secretariat"].includes(user?.role);
  const { data: eventsData, refetch } = useEvents();
  const events = Array.isArray(eventsData) ? eventsData : [];

  const [filterMode, setFilterMode] = useState("all");

  const today = new Date().toISOString().split("T")[0];

  const upcomingEvents = events.filter(e => e.date >= today);
  const pastEvents = events.filter(e => e.date < today);
  const todayEvents = events.filter(e => e.date === today);

  const totalCount = events.length;
  const inPersonCount = events.filter((e) => e.mode === "In-person").length;
  const onlineCount = events.filter((e) => e.mode === "Online").length;
  const pendingCount = events.filter((e) => e.status === "Pending Approval").length;

  let displayEvents = events;
  if (filterMode === "upcoming") {
    displayEvents = upcomingEvents;
  } else if (filterMode === "past") {
    displayEvents = pastEvents;
  } else if (filterMode === "today") {
    displayEvents = todayEvents;
  } else if (filterMode === "In-person") {
    displayEvents = events.filter((e) => e.mode === "In-person");
  } else if (filterMode === "Online") {
    displayEvents = events.filter((e) => e.mode === "Online");
  } else if (filterMode === "Pending") {
    displayEvents = events.filter((e) => e.status === "Pending Approval");
  }


  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [registrationsModal, setRegistrationsModal] = useState({ open: false, eventId: null, eventTitle: "" });

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await eventApi.delete(deleteId);
      toast.success("Event deleted permanently");
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
      refetch();
    } catch (e) {
      toast.error(e.message || "Failed to delete event");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AppShell
      role="admin"
      title="Events"
      subtitle="Chamber programme calendar & conferences"
      actions={
        <Button asChild>
          <Link href="/admin/events/create">
            <Plus className="h-4 w-4 mr-2" /> Create event
          </Link>
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <button type="button" onClick={() => setFilterMode("all")} className={`text-left transition-all duration-200 focus:outline-none rounded-2xl ${filterMode === "all" ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-md scale-[1.02]" : "opacity-75 hover:opacity-100 hover:scale-[1.01]"}`}>
            <StatCard label="All Events" value={String(totalCount)} icon={CalendarDays} tone="primary" />
          </button>
          <button type="button" onClick={() => setFilterMode("today")} className={`text-left transition-all duration-200 focus:outline-none rounded-2xl ${filterMode === "today" ? "ring-2 ring-success ring-offset-2 ring-offset-background shadow-md scale-[1.02]" : "opacity-75 hover:opacity-100 hover:scale-[1.01]"}`}>
            <StatCard label="Today" value={String(todayEvents.length)} tone="success" />
          </button>
          <button type="button" onClick={() => setFilterMode("upcoming")} className={`text-left transition-all duration-200 focus:outline-none rounded-2xl ${filterMode === "upcoming" ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-md scale-[1.02]" : "opacity-75 hover:opacity-100 hover:scale-[1.01]"}`}>
            <StatCard label="Upcoming" value={String(upcomingEvents.length)} />
          </button>
          <button type="button" onClick={() => setFilterMode("past")} className={`text-left transition-all duration-200 focus:outline-none rounded-2xl ${filterMode === "past" ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-md scale-[1.02]" : "opacity-75 hover:opacity-100 hover:scale-[1.01]"}`}>
            <StatCard label="Past Events" value={String(pastEvents.length)} />
          </button>
          <button type="button" onClick={() => setFilterMode("Pending")} className={`text-left transition-all duration-200 focus:outline-none rounded-2xl ${filterMode === "Pending" ? "ring-2 ring-warning ring-offset-2 ring-offset-background shadow-md scale-[1.02]" : "opacity-75 hover:opacity-100 hover:scale-[1.01]"}`}>
            <StatCard label="Pending Approval" value={String(pendingCount)} tone="warning" />
          </button>
        </div>

        <Panel title={filterMode === "today" ? "Today's Events" : filterMode === "upcoming" ? "Upcoming Events" : filterMode === "past" ? "Past Events" : "All Events"}>
          <ResponsiveTable
            rows={displayEvents}
            columns={[
              { 
                key: "title", 
                header: "Event", 
                cell: (r) => {
                  const isToday = r.date === today;
                  return (
                    <div className="flex flex-col gap-1">
                      <Link href={`/admin/events/${r._id}`} className="font-semibold hover:text-primary hover:underline">{r.title}</Link>
                      <div className="flex gap-1.5">
                        <Pill tone={r.status === "Pending Approval" ? "warning" : r.status === "Draft" ? "neutral" : "success"}>
                          {r.status || "Upcoming"}
                        </Pill>
                        {isToday && <Pill tone="success">Today</Pill>}
                        {r.date < today && <Pill tone="neutral">Past</Pill>}
                      </div>
                    </div>
                  );
                }
              },
              { key: "date", header: "Date", cell: (r) => {
                  const isToday = r.date === today;
                  return (
                    <span className={isToday ? "font-bold text-emerald-600" : ""}>
                      {new Date(r.date).toLocaleDateString()} · {r.time}
                    </span>
                  );
                }
              },
              { key: "mode", header: "Mode", cell: (r) => r.mode },
              { key: "city", header: "Location", cell: (r) => r.city || "Online" },
              { key: "att", header: "Registered", cell: (r) => <span className="font-semibold">{r.registeredCount || 0}</span> },
              {
                key: "act",
                header: "",
                cell: (r) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Manage Event</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/events/${r._id}`}>View Event Page</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setRegistrationsModal({ open: true, eventId: r._id, eventTitle: r.title })}>
                        View Registrations
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {isSuperAdmin && r.status === "Pending Approval" && (
                        <DropdownMenuItem onClick={async () => {
                          try {
                            await eventApi.update(r._id, { status: "Upcoming" });
                            toast.success("Event Approved & Published!");
                            refetch();
                          } catch(e) {
                            toast.error("Failed to approve event");
                          }
                        }} className="font-medium text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700">
                          Approve & Publish Event
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={async () => {
                        try {
                          await eventApi.update(r._id, { mode: r.mode === "In-person" ? "Online" : "In-person" });
                          toast.success("Event mode updated");
                          refetch();
                        } catch(e) {
                          toast.error("Failed to update event");
                        }
                      }}>
                        Toggle Mode (Online/In-person)
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/events/${r._id}/edit`}>Edit Event Details</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => {
                        setDeleteId(r._id);
                        setIsDeleteDialogOpen(true);
                      }}>
                        Delete Event
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to completely delete this event? This action cannot be undone and will remove all registrations.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2 sm:space-x-0 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EventRegistrationsModal
        eventId={registrationsModal.eventId}
        eventTitle={registrationsModal.eventTitle}
        open={registrationsModal.open}
        onOpenChange={(open) => setRegistrationsModal(prev => ({ ...prev, open }))}
      />
    </AppShell>
  );
}

export { AdminEvents };
export default AdminEvents;
