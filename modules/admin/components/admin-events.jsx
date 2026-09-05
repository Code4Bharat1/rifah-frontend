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

function AdminEvents() {
  const { data: eventsData, refetch } = useEvents();
  const events = Array.isArray(eventsData) ? eventsData : [];

  const [filterMode, setFilterMode] = useState("all");

  const totalCount = events.length;
  const inPersonCount = events.filter((e) => e.mode === "In-person").length;
  const onlineCount = events.filter((e) => e.mode === "Online").length;

  let displayEvents = events;
  if (filterMode === "In-person") {
    displayEvents = events.filter((e) => e.mode === "In-person");
  } else if (filterMode === "Online") {
    displayEvents = events.filter((e) => e.mode === "Online");
  }


  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <button type="button" onClick={() => setFilterMode("all")} className={`text-left transition-all duration-200 focus:outline-none rounded-2xl ${filterMode === "all" ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-md scale-[1.02]" : "opacity-75 hover:opacity-100 hover:scale-[1.01]"}`}>
            <StatCard label="Total events" value={String(totalCount)} icon={CalendarDays} tone="primary" />
          </button>
          <button type="button" onClick={() => setFilterMode("In-person")} className={`text-left transition-all duration-200 focus:outline-none rounded-2xl ${filterMode === "In-person" ? "ring-2 ring-success ring-offset-2 ring-offset-background shadow-md scale-[1.02]" : "opacity-75 hover:opacity-100 hover:scale-[1.01]"}`}>
            <StatCard label="In-person" value={String(inPersonCount)} tone="success" />
          </button>
          <button type="button" onClick={() => setFilterMode("Online")} className={`text-left transition-all duration-200 focus:outline-none rounded-2xl ${filterMode === "Online" ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-md scale-[1.02]" : "opacity-75 hover:opacity-100 hover:scale-[1.01]"}`}>
            <StatCard label="Online / Webinar" value={String(onlineCount)} />
          </button>
          <div className="text-left opacity-75">
            <StatCard label="Program Desk" value="Active" tone="warning" />
          </div>
        </div>

        <Panel title="All events">
          <ResponsiveTable
            rows={displayEvents}
            columns={[
              { 
                key: "title", 
                header: "Event", 
                cell: (r) => (
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold">{r.title}</span>
                    <div>
                      <Pill tone={r.status === "Draft" ? "neutral" : "success"}>
                        {r.status || "Upcoming"}
                      </Pill>
                    </div>
                  </div>
                )
              },
              { key: "date", header: "Date", cell: (r) => `${new Date(r.date).toLocaleDateString()} · ${r.time}` },
              { key: "mode", header: "Mode", cell: (r) => r.mode },
              { key: "city", header: "Location", cell: (r) => r.city || "Online" },
              { key: "att", header: "Attendees", cell: (r) => r.attendees?.length || 0 },
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
                        <Link href={`/events/${r.slug || r._id}`}>View Event Page</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
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
    </AppShell>
  );
}

export { AdminEvents };
export default AdminEvents;
