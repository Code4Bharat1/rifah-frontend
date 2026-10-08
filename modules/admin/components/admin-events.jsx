"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { CalendarDays, Plus, Loader2, MoreHorizontal, ChevronLeft, ChevronRight, LayoutGrid, List, Clock, CalendarPlus, History, Ticket, CalendarCheck, Radio, Search, ArrowUpDown, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { getEventStatus, getEventStatusConfig, parseEventTiming } from "@shared/lib/event-utils";
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

function CalendarView({ events, onEventClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-lg">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="grid grid-cols-7 border-b bg-muted/30">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="p-3 text-center text-sm font-medium text-muted-foreground">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} className="min-h-[120px] border-b border-r bg-muted/5" />;
          
          const yearNum = date.getFullYear();
          const monthNum = String(date.getMonth() + 1).padStart(2, '0');
          const dayNum = String(date.getDate()).padStart(2, '0');
          const dateStr = `${yearNum}-${monthNum}-${dayNum}`;
          
          const today = new Date();
          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

          const dayEvents = events.filter(e => {
            let eDate = e.date;
            if (e.status === "Scheduled" && e.scheduledAt) {
               const schDate = new Date(e.scheduledAt);
               eDate = `${schDate.getFullYear()}-${String(schDate.getMonth() + 1).padStart(2, '0')}-${String(schDate.getDate()).padStart(2, '0')}`;
            }
            if (eDate && eDate.includes("T")) eDate = eDate.split("T")[0];
            return eDate === dateStr;
          });

          return (
            <div key={dateStr} className="min-h-[120px] p-2 border-b border-r bg-white hover:bg-muted/10 transition-colors">
              <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${dateStr === todayStr ? 'bg-primary text-primary-foreground' : 'text-foreground'}`}>
                {date.getDate()}
              </span>
              <div className="mt-2 space-y-1.5 max-h-[80px] overflow-y-auto">
                {dayEvents.map(e => {
                  const status = getEventStatus(e);
                  const isLive = status === "Live";
                  const isEnded = status === "Ended";
                  const bgClass = isLive 
                    ? "bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300"
                    : isEnded 
                    ? "bg-slate-100 text-slate-500 opacity-80"
                    : "bg-primary/10 text-primary hover:bg-primary/20";

                  return (
                    <div 
                      key={e._id} 
                      onClick={() => onEventClick(e)}
                      className={`text-xs truncate px-2 py-1 rounded cursor-pointer transition-colors ${bgClass}`}
                      title={`${e.title} · ${status}`}
                    >
                      {isLive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block mr-1.5 align-middle" />}
                      {e.status === "Scheduled" && e.scheduledAt ? (
                        <span className="font-semibold mr-1">{new Date(e.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      ) : (
                        <span className="font-semibold mr-1">{e.time && e.time.split(' ')[0]}</span>
                      )}
                      {e.title}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function matchesEventDate(event, query) {
  if (!query) return false;
  const q = query.trim().toLowerCase();
  if (!q) return false;

  const datesToCheck = [];
  if (event.date) {
    const d = new Date(event.date);
    if (!isNaN(d.getTime())) datesToCheck.push(d);
  }
  if (event.scheduledAt) {
    const sd = new Date(event.scheduledAt);
    if (!isNaN(sd.getTime())) datesToCheck.push(sd);
  }

  for (const d of datesToCheck) {
    const year = d.getFullYear().toString();
    const monthNum = (d.getMonth() + 1).toString();
    const monthPad = monthNum.padStart(2, "0");
    const dayNum = d.getDate().toString();
    const dayPad = dayNum.padStart(2, "0");

    const monthLong = d.toLocaleString("en-US", { month: "long" }).toLowerCase();
    const monthShort = d.toLocaleString("en-US", { month: "short" }).toLowerCase();
    const localeDate = d.toLocaleDateString().toLowerCase();

    const dateFormats = [
      localeDate,
      `${monthNum}/${dayNum}/${year}`,
      `${monthPad}/${dayPad}/${year}`,
      `${dayNum}/${monthNum}/${year}`,
      `${dayPad}/${monthPad}/${year}`,
      `${year}-${monthPad}-${dayPad}`,
      `${year}/${monthPad}/${dayPad}`,
      `${dayNum}-${monthNum}-${year}`,
      `${dayPad}-${monthPad}-${year}`,
      `${dayNum} ${monthShort}`,
      `${dayNum} ${monthLong}`,
      `${monthShort} ${dayNum}`,
      `${monthLong} ${dayNum}`,
      `${dayNum} ${monthShort} ${year}`,
      `${dayNum} ${monthLong} ${year}`,
      `${monthShort} ${dayNum}, ${year}`,
      `${monthLong} ${dayNum}, ${year}`,
      `${monthNum}/${dayNum}`,
      `${dayNum}/${monthNum}`,
      monthLong,
      monthShort,
      year,
    ];

    if (dateFormats.some((df) => df.includes(q))) return true;
  }

  if (typeof event.date === "string" && event.date.toLowerCase().includes(q)) return true;
  if (typeof event.time === "string" && event.time.toLowerCase().includes(q)) return true;

  return false;
}

function matchesEventSearch(event, query) {
  if (!query || !query.trim()) return true;
  const q = query.trim().toLowerCase();

  // 1. Search by name/title
  if (event.title && event.title.toLowerCase().includes(q)) return true;

  // 2. Search by date
  if (matchesEventDate(event, q)) return true;

  // 3. Search by location/city, mode, category, sector as extra convenience
  if (event.city && event.city.toLowerCase().includes(q)) return true;
  if (event.mode && event.mode.toLowerCase().includes(q)) return true;
  if (event.eventCategory && event.eventCategory.toLowerCase().includes(q)) return true;
  if (event.industrySector && event.industrySector.toLowerCase().includes(q)) return true;

  return false;
}

function AdminEvents() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const isCentralAdmin = user?.role === "central_admin";
  const isChapterAdmin = pathname?.startsWith("/chapter-admin") || user?.role === "chapter_admin";
  const basePath = user?.role === "chapter_admin" ? "/chapter-admin/events" : user?.role === "state_admin" ? "/state-admin/events" : "/admin/events";
  const { data: eventsData, refetch } = useEvents();
  const events = Array.isArray(eventsData) ? eventsData : [];

  const [filterMode, setFilterMode] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");

  const now = new Date();
  const liveEvents = events.filter((e) => getEventStatus(e, now) === "Live");
  const upcomingEvents = events.filter((e) => getEventStatus(e, now) === "Upcoming");
  const endedEvents = events.filter((e) => getEventStatus(e, now) === "Ended");
  const todayEvents = events.filter((e) => parseEventTiming(e.date, e.time).isToday);
  const scheduledEvents = events.filter((e) => getEventStatus(e, now) === "Scheduled");
  const paidEvents = events.filter((e) => e.isPaid);

  const totalCount = events.length;
  const inPersonCount = events.filter((e) => e.mode === "In-person").length;
  const onlineCount = events.filter((e) => e.mode === "Online").length;
  const pendingCount = events.filter((e) => e.status === "Pending Approval").length;

  let displayEvents = events;
  if (filterMode === "live") {
    displayEvents = liveEvents;
  } else if (filterMode === "upcoming") {
    displayEvents = upcomingEvents;
  } else if (filterMode === "past" || filterMode === "ended") {
    displayEvents = endedEvents;
  } else if (filterMode === "today") {
    displayEvents = todayEvents;
  } else if (filterMode === "In-person") {
    displayEvents = events.filter((e) => e.mode === "In-person");
  } else if (filterMode === "Online") {
    displayEvents = events.filter((e) => e.mode === "Online");
  } else if (filterMode === "Pending") {
    displayEvents = events.filter((e) => e.status === "Pending Approval");
  } else if (filterMode === "Scheduled") {
    displayEvents = scheduledEvents;
  } else if (filterMode === "Paid") {
    displayEvents = paidEvents;
  }

  // Filter by search query (name / date)
  if (searchQuery.trim()) {
    displayEvents = displayEvents.filter((e) => matchesEventSearch(e, searchQuery));
  }

  // Sort events (Date Newest/Oldest, A-Z, Z-A)
  displayEvents = [...displayEvents].sort((a, b) => {
    if (sortBy === "name-asc") {
      return (a.title || "").localeCompare(b.title || "", undefined, { sensitivity: "base" });
    }
    if (sortBy === "name-desc") {
      return (b.title || "").localeCompare(a.title || "", undefined, { sensitivity: "base" });
    }
    if (sortBy === "date-asc") {
      const timeA = new Date(a.date || a.scheduledAt || 0).getTime();
      const timeB = new Date(b.date || b.scheduledAt || 0).getTime();
      return timeA - timeB;
    }
    // "date-desc" (default)
    const timeA = new Date(a.date || a.scheduledAt || 0).getTime();
    const timeB = new Date(b.date || b.scheduledAt || 0).getTime();
    return timeB - timeA;
  });

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
      role={user?.role === "state_admin" ? "state_admin" : user?.role === "chapter_admin" ? "chapter_admin" : "admin"}
      title="Events"
      subtitle="Chamber programme calendar & conferences"
      actions={
        <Button asChild>
          <Link href={`${basePath}/create`}>
            <Plus className="h-4 w-4 mr-2" /> Create event
          </Link>
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
          <StatCard
            label={isChapterAdmin ? "My Chapters Event" : "All Events"}
            value={String(totalCount)}
            icon={CalendarDays}
            tone="primary"
            active={filterMode === "all"}
            onClick={() => setFilterMode("all")}
          />
          <StatCard
            label="Live Now"
            value={String(liveEvents.length)}
            icon={Radio}
            tone={liveEvents.length > 0 ? "success" : "default"}
            active={filterMode === "live"}
            onClick={() => setFilterMode("live")}
          />
          <StatCard
            label="Upcoming"
            value={String(upcomingEvents.length)}
            icon={CalendarPlus}
            tone="info"
            active={filterMode === "upcoming"}
            onClick={() => setFilterMode("upcoming")}
          />
          <StatCard
            label="Ended"
            value={String(endedEvents.length)}
            icon={History}
            tone="default"
            active={filterMode === "ended" || filterMode === "past"}
            onClick={() => setFilterMode("ended")}
          />
          <StatCard
            label="Today"
            value={String(todayEvents.length)}
            icon={Clock}
            tone="primary"
            active={filterMode === "today"}
            onClick={() => setFilterMode("today")}
          />
          <StatCard
            label="Scheduled"
            value={String(scheduledEvents.length)}
            icon={CalendarCheck}
            tone="warning"
            active={filterMode === "Scheduled"}
            onClick={() => setFilterMode("Scheduled")}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-1">
          <h2 className="text-xl font-semibold tracking-tight">
            {filterMode === "live"
              ? "Live Events Now"
              : filterMode === "today"
              ? "Today's Events"
              : filterMode === "upcoming"
              ? "Upcoming Events"
              : filterMode === "past" || filterMode === "ended"
              ? "Ended Events"
              : filterMode === "Scheduled"
              ? "Scheduled Events"
              : filterMode === "Paid"
              ? "Paid Events"
              : isChapterAdmin
              ? "My Chapters Event"
              : "All Events"}
            {searchQuery.trim() && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({displayEvents.length} {displayEvents.length === 1 ? "result" : "results"})
              </span>
            )}
          </h2>
          <div className="bg-muted p-1 flex items-center gap-1 rounded-lg">
            <button onClick={() => setViewMode("table")} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === "table" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <List className="w-4 h-4 inline-block mr-1.5 align-text-bottom" /> Table
            </button>
            <button onClick={() => setViewMode("calendar")} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === "calendar" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <CalendarDays className="w-4 h-4 inline-block mr-1.5 align-text-bottom" /> Calendar
            </button>
          </div>
        </div>

        {/* Search & Sort Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search event by name or date (e.g. 26/09/2026, September)..."
              className="h-10 pl-10 pr-9 bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full"
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[195px] h-10 bg-white">
                <ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Sort by Date (Newest)</SelectItem>
                <SelectItem value="date-asc">Sort by Date (Oldest)</SelectItem>
                <SelectItem value="name-asc">Sort A - Z (Name)</SelectItem>
                <SelectItem value="name-desc">Sort Z - A (Name)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {viewMode === "calendar" ? (
          <CalendarView events={displayEvents} onEventClick={(e) => router.push(`${basePath}/${e._id}`)} />
        ) : (
        <Panel>
          <ResponsiveTable
            rows={displayEvents}
            empty={
              <div className="py-12 text-center text-sm text-muted-foreground">
                {searchQuery
                  ? `No events found matching "${searchQuery}".`
                  : "No events available."}
              </div>
            }
            onRowClick={(r) => router.push(`${basePath}/${r._id}`)}
            columns={[
              { 
                key: "title", 
                header: "Event",  
                cell: (r) => {
                  const status = getEventStatus(r);
                  const cfg = getEventStatusConfig(status);
                  const timing = parseEventTiming(r.date, r.time);

                  return (
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-foreground">{r.title}</span>
                      <div className="flex gap-1.5 flex-wrap items-center">
                        <Pill tone={cfg.tone} className={cfg.className}>
                          {cfg.dot && <span className="w-2 h-2 rounded-full bg-white inline-block shadow-xs" />}
                          {cfg.label}
                        </Pill>
                        {r.eventCategory && r.eventCategory !== "Meet" && <Pill tone={r.eventCategory === "Sports" ? "warning" : "info"}>{r.eventCategory}</Pill>}
                        {r.industrySector && <Pill tone="neutral" className="text-xs">{r.industrySector}</Pill>}
                        {(r.isRegistrationClosed || r.seatsFull) && <Pill tone="danger">Closed</Pill>}
                        {timing.isToday && status !== "Live" && status !== "Ended" && <Pill tone="success">Today</Pill>}
                        {r.isPaid ? <Pill tone="warning">Paid (₹{r.ticketPrice})</Pill> : <Pill tone="neutral">Free</Pill>}
                      </div>
                    </div>
                  );
                }
              },
              { key: "date", header: "Date", cell: (r) => {
                  const status = getEventStatus(r);
                  const isLive = status === "Live";
                  const isEnded = status === "Ended";

                  if (r.status === "Scheduled" && r.scheduledAt) {
                    const d = new Date(r.scheduledAt);
                    return (
                      <div className="flex flex-col gap-0.5 whitespace-nowrap">
                        <span className="text-xs font-medium text-primary">
                          Publishes: {d.toLocaleDateString()} · {d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Event: {new Date(r.date).toLocaleDateString()} · {r.time}
                        </span>
                      </div>
                    );
                  }
                  return (
                    <span className={`whitespace-nowrap ${isLive ? "font-semibold text-emerald-700 dark:text-emerald-400" : isEnded ? "text-muted-foreground" : "font-medium text-foreground"}`}>
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
                  <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Manage Event</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`${basePath}/${r._id}`}>View Event Page</Link>
                        </DropdownMenuItem>
                        {(isCentralAdmin || r.createdBy === user?._id) && (
                          <DropdownMenuItem onClick={() => setRegistrationsModal({ open: true, eventId: r._id, eventTitle: r.title })}>
                            View Registrations
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {isCentralAdmin && r.status === "Pending Approval" && (
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

                        {(isCentralAdmin || r.createdBy === user?._id) && (
                          <>
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
                              <Link href={`${basePath}/${r._id}/edit`}>Edit Event Details</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => {
                              setDeleteId(r._id);
                              setIsDeleteDialogOpen(true);
                            }}>
                              Delete Event
                            </DropdownMenuItem>
                          </>
                        )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ),
            },
            ]}
            mobile={(r) => {
              const status = getEventStatus(r);
              const cfg = getEventStatusConfig(status);
              return (
                <div className="rounded-xl border border-border p-3.5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{r.title}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {new Date(r.date).toLocaleDateString()} · {r.time} · {r.city}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Pill tone={cfg.tone} className={cfg.className}>
                        {cfg.dot && <span className="w-1.5 h-1.5 rounded-full bg-white inline-block mr-1" />}
                        {cfg.label}
                      </Pill>
                      <Pill tone="neutral">{r.mode}</Pill>
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline" className="mt-3">
                    <Link href={`/events/${r.slug || r._id}`}>
                      View event
                    </Link>
                  </Button>
                </div>
              );
            }}
          />
        </Panel>
        )}
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
