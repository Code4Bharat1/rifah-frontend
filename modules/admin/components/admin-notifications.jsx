"use client";
import { Megaphone, Send, Loader2, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Panel, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { Textarea } from "@shared/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@shared/components/ui/dialog";
import { useAuth } from "@shared/providers/auth-provider";
import { useNotifications, useChapters, useStates } from "@shared/hooks/use-rifah-api";
import { notificationApi } from "@shared/lib/api-services";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@shared/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@shared/components/ui/command";
import { cn } from "@shared/lib/utils";
import { MoreHorizontal, Trash2, Undo2, Eye, Trash, Calendar, MapPin, Clock, Building2, Check, ChevronsUpDown } from "lucide-react";

function MultiSelectDropdown({ options, selected, toggleOption, placeholder = "Select..." }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-[40px] px-3 py-2 font-normal"
        >
          <div className="flex flex-wrap gap-1 text-left">
            {(!selected || selected.length === 0) ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selected.map(item => (
                <div key={item} className="bg-primary/10 text-primary text-xs rounded-full px-2.5 py-0.5 font-medium border border-primary/20">
                  {item}
                </div>
              ))
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] sm:w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option, index) => (
                <CommandItem
                  key={`${option}-${index}`}
                  value={option}
                  onSelect={() => toggleOption(option)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      (selected || []).includes(option) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function formatEventDate(val) {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function AdminNotifications({ expectedRole }) {
  const pathname = usePathname();
  const routeRole =
    expectedRole ||
    (pathname?.startsWith("/state-admin")
      ? "state_admin"
      : pathname?.startsWith("/chapter-admin")
      ? "chapter_admin"
      : pathname?.startsWith("/admin")
      ? "admin"
      : null);

  const { user } = useAuth();
  const role = routeRole || (user?.role === "chapter_admin" ? "chapter_admin" : user?.role === "state_admin" ? "state_admin" : "admin");

  const isCentralAdmin = role === "admin";
  const isStateAdmin = role === "state_admin";
  const isChapterAdmin = role === "chapter_admin";

  const [audience, setAudience] = useState("all");
  const [targetStates, setTargetStates] = useState([]);
  const [targetChapters, setTargetChapters] = useState([]);

  useEffect(() => {
    if (isStateAdmin && user?.state && targetStates.length === 0) {
      setTargetStates([user.state]);
    }
    if (isChapterAdmin && user?.chapter && targetChapters.length === 0) {
      setTargetChapters([user.chapter]);
    }
  }, [isStateAdmin, isChapterAdmin, user?.state, user?.chapter]);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("All");

  const { data: notifData, refetch } = useNotifications();
  const { data: chaptersData } = useChapters();
  const { data: statesData } = useStates();

  const notifications = Array.isArray(notifData?.notifications) ? notifData.notifications : (Array.isArray(notifData) ? notifData : []);
  const chaptersList = chaptersData || [];
  const statesList = statesData || [];

  const stateOptions = ["All", ...statesList.map(s => (typeof s === 'string' ? s : (s.state || s.name || "Unknown")))];
  
  // Filter chapters based on selected states
  const filteredChapters = chaptersList.filter(ch => {
    if (isChapterAdmin) return ch.name === user?.chapter;
    if (isStateAdmin) return ch.state === user?.state;
    if (!targetStates.length || targetStates.includes("All")) return true;
    return targetStates.includes(ch.state);
  });

  const chapterOptions = ["All", ...filteredChapters.map(c => c.name)];

  const toggleState = (val) => {
    if (val === "All") {
      setTargetStates(targetStates.includes("All") ? [] : ["All"]);
      setTargetChapters([]);
    } else {
      let next = targetStates.includes(val) ? targetStates.filter(s => s !== val) : [...targetStates, val];
      next = next.filter(s => s !== "All");
      setTargetStates(next);
      setTargetChapters([]);
    }
  };

  const toggleChapter = (val) => {
    if (val === "All") {
      setTargetChapters(targetChapters.includes("All") ? [] : ["All"]);
    } else {
      let next = targetChapters.includes(val) ? targetChapters.filter(c => c !== val) : [...targetChapters, val];
      next = next.filter(c => c !== "All");
      setTargetChapters(next);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const broadcastCount = notifications.filter(n => n.type === "Broadcast" || n.broadcastId).length;
  
  const predefinedTypes = ["Lead", "Enquiry", "Message", "Membership", "Payment", "Event", "Review", "Account", "Verification", "System", "General", "Announcement"];
  const availableTypes = Array.from(new Set(notifications.map(n => n?.type || "System")));
  const filterOptions = ["All", ...new Set([...predefinedTypes, ...availableTypes])].filter(Boolean);

  const displayedNotifications = notifications.filter(n => {
    // Status Filter
    if (filter === "unread" && n.isRead) return false;
    if (filter === "broadcasts" && !(n.type === "Broadcast" || n.broadcastId)) return false;
    
    // Type Filter
    if (typeFilter !== "All" && (n?.type || "System") !== typeFilter) return false;

    return true;
  });

  const [viewNotif, setViewNotif] = useState(null);
  const [confirmUndo, setConfirmUndo] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await notificationApi.broadcast({
        title: title.trim(),
        body: message.trim(),
        targetRole: audience === "all" ? undefined : audience,
        state: isCentralAdmin ? (targetStates.includes("All") ? "all" : targetStates) : (user?.state || undefined),
        chapter: (isStateAdmin || isCentralAdmin) ? (targetChapters.includes("All") ? "all" : targetChapters) : (user?.chapter || undefined),
      });
      toast.success("Broadcast announcement sent successfully!");
      setTitle("");
      setMessage("");
      if (isCentralAdmin) {
        setTargetStates([]);
        setTargetChapters([]);
      } else if (isStateAdmin) {
        setTargetChapters([]);
      }
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to send announcement.");
    } finally {
      setSending(false);
    }
  };

  const handleUndoGlobal = async () => {
    if (!confirmUndo) return;
    try {
      await notificationApi.deleteBroadcast(confirmUndo);
      toast.success("Broadcast successfully recalled from all users.");
      setConfirmUndo(null);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to recall broadcast.");
    }
  };

  const handleDeleteLocal = async () => {
    if (!confirmDelete) return;
    try {
      await notificationApi.deleteLocal(confirmDelete);
      toast.success("Notification deleted from your list.");
      setConfirmDelete(null);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to delete notification.");
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationApi.clearAll();
      toast.success("All notifications cleared from your list.");
      setConfirmClear(false);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to clear notifications.");
    }
  };

  return (
    <AppShell role={role} title="Announcements & Broadcasts" subtitle="Chamber-wide circulars and alerts">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="All Alerts"
            value={String(notifications.length)}
            icon={Bell}
            tone="primary"
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
          <StatCard
            label="Unread / New"
            value={String(unreadCount)}
            icon={Eye}
            tone="warning"
            active={filter === "unread"}
            onClick={() => setFilter(filter === "unread" ? "all" : "unread")}
          />
          <StatCard
            label="Broadcasts"
            value={String(broadcastCount)}
            icon={Megaphone}
            tone="brand"
            active={filter === "broadcasts"}
            onClick={() => setFilter(filter === "broadcasts" ? "all" : "broadcasts")}
          />
          <StatCard
            label="Broadcast Desk"
            value="Compose"
            icon={Send}
            tone="success"
            onClick={() => {
              const el = document.getElementById("compose-panel");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          />
        </div>

        <div id="compose-panel">
          <Panel title="Compose announcement">
            <form onSubmit={handleBroadcast} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Audience / Role</Label>
                  <Select value={audience} onValueChange={setAudience}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Registered Users</SelectItem>
                      <SelectItem value="business_owner">Member Businesses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {isCentralAdmin && (
                  <div className="space-y-1.5">
                    <Label>Target States</Label>
                    <MultiSelectDropdown 
                      options={stateOptions}
                      selected={targetStates}
                      toggleOption={toggleState}
                      placeholder="Select states..."
                    />
                  </div>
                )}
                {(isCentralAdmin || isStateAdmin) && (
                  <div className="space-y-1.5">
                    <Label>Target Chapters</Label>
                    <MultiSelectDropdown 
                      options={chapterOptions}
                      selected={targetChapters}
                      toggleOption={toggleChapter}
                      placeholder="Select chapters..."
                    />
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Subject of the notification"
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Message</Label>
                <Textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write the announcement body"
                />
              </div>
              <Button type="submit" disabled={sending} className="w-full sm:w-auto">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="mr-1 h-4 w-4" /> Send announcement</>}
              </Button>
            </form>
          </Panel>
        </div>

        <Panel 
          title={filter === "unread" ? "Unread alerts" : filter === "broadcasts" ? "Broadcast history" : "Recently sent alerts"} 
          bodyClassName="p-0 md:p-0"
          action={
            <div className="flex items-center gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-8 text-xs w-[140px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.map((opt) => (
                    <SelectItem key={opt} value={opt} className="text-xs">
                      {opt === "All" ? "All Categories" : opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {notifications.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => setConfirmClear(true)} className="text-destructive h-8">
                  <Trash className="mr-2 h-4 w-4" /> Clear All
                </Button>
              )}
            </div>
          }
        >
          {displayedNotifications.length === 0 ? (
            <p className="p-6 text-center text-xs text-muted-foreground">
              {filter === "unread" ? "No unread alerts." : filter === "broadcasts" ? "No broadcasts sent." : "No recent alerts."}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {displayedNotifications.map((n) => (
                <li key={n._id} className="p-4">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="flex items-center gap-2">
                      <p className={`min-w-0 text-sm ${!n.isRead ? "font-bold" : "font-medium"}`}>
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">New</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Pill>{n.type || "Broadcast"}</Pill>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={async () => {
                            setViewNotif(n);
                            if (!n.isRead) {
                              try {
                                await notificationApi.markAsRead(n._id);
                                refetch();
                              } catch (e) {}
                            }
                          }}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setConfirmDelete(n._id)} className="text-destructive focus:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete for Me
                          </DropdownMenuItem>
                          {n.broadcastId && (
                            <DropdownMenuItem onClick={() => setConfirmUndo(n.broadcastId)} className="text-destructive focus:bg-destructive/10 font-medium">
                              <Undo2 className="mr-2 h-4 w-4" /> Undo Broadcast (Global)
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">{n.body || n.message}</p>
                  {(n.eventDate || n.eventCity || n.metadata?.eventDate || n.metadata?.eventCity) && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {(n.eventDate || n.metadata?.eventDate) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-[11px] font-medium border border-blue-200/60 dark:border-blue-800/40">
                          <Calendar className="h-3 w-3 shrink-0 text-blue-600 dark:text-blue-400" />
                          {formatEventDate(n.eventDate || n.metadata?.eventDate)}
                        </span>
                      )}
                      {(n.eventCity || n.metadata?.eventCity) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[11px] font-medium border border-emerald-200/60 dark:border-emerald-800/40">
                          <MapPin className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          {n.eventCity || n.metadata?.eventCity}
                        </span>
                      )}
                      {(n.eventTime || n.metadata?.eventTime) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[11px] font-medium border border-slate-200/60 dark:border-slate-700">
                          <Clock className="h-3 w-3 shrink-0 text-slate-500" />
                          {n.eventTime || n.metadata?.eventTime}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="mt-1 text-[11px] text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
      {/* View Details Modal */}
      <Dialog open={!!viewNotif} onOpenChange={(o) => !o && setViewNotif(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{viewNotif?.title}</DialogTitle>
            <DialogDescription>
              {new Date(viewNotif?.createdAt).toLocaleString()} · {viewNotif?.type || "Broadcast"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
             {/* Event Information Block */}
             {(viewNotif?.eventDate || viewNotif?.eventCity || viewNotif?.metadata?.eventDate || viewNotif?.metadata?.eventCity || viewNotif?.type?.toLowerCase() === "event") && (
               <div className="rounded-lg border bg-blue-50/40 dark:bg-blue-950/20 p-3.5 space-y-2.5 border-blue-200/60 dark:border-blue-900/40">
                 <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 uppercase tracking-wider">Event Details</p>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                   {(viewNotif?.eventDate || viewNotif?.metadata?.eventDate) && (
                     <div className="flex items-center gap-2 text-foreground">
                       <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                       <span className="font-medium text-muted-foreground">Date:</span>
                       <span className="font-semibold">{formatEventDate(viewNotif.eventDate || viewNotif.metadata?.eventDate)}</span>
                     </div>
                   )}
                   {(viewNotif?.eventCity || viewNotif?.metadata?.eventCity) && (
                     <div className="flex items-center gap-2 text-foreground">
                       <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                       <span className="font-medium text-muted-foreground">City:</span>
                       <span className="font-semibold">{viewNotif.eventCity || viewNotif.metadata?.eventCity}</span>
                     </div>
                   )}
                   {(viewNotif?.eventTime || viewNotif?.metadata?.eventTime) && (
                     <div className="flex items-center gap-2 text-foreground">
                       <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                       <span className="font-medium text-muted-foreground">Time:</span>
                       <span className="font-semibold">{viewNotif.eventTime || viewNotif.metadata?.eventTime}</span>
                     </div>
                   )}
                   {(viewNotif?.eventVenue || viewNotif?.metadata?.eventVenue) && (
                     <div className="flex items-center gap-2 text-foreground sm:col-span-2">
                       <Building2 className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                       <span className="font-medium text-muted-foreground">Venue:</span>
                       <span className="font-semibold truncate">{viewNotif.eventVenue || viewNotif.metadata?.eventVenue}</span>
                     </div>
                   )}
                 </div>
               </div>
             )}

             <div className="bg-muted/50 p-4 rounded-lg text-sm text-foreground whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
               {viewNotif?.body || viewNotif?.message}
             </div>
             {viewNotif?.broadcastId && (
               <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                 <Megaphone className="h-4 w-4" /> This was a global broadcast (ID: {viewNotif.broadcastId})
               </div>
             )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewNotif(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete (Local) Confirmation Modal */}
      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete for Me?</DialogTitle>
            <DialogDescription>
              This will remove the notification from your personal list. It will NOT recall the broadcast from other users.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteLocal}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Undo (Global) Confirmation Modal */}
      <Dialog open={!!confirmUndo} onOpenChange={(o) => !o && setConfirmUndo(null)}>
        <DialogContent className="sm:max-w-[425px] border-destructive">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2"><Undo2 className="h-5 w-5"/> Undo Global Broadcast</DialogTitle>
            <DialogDescription className="pt-2 text-foreground font-medium">
              Are you absolutely sure you want to recall this broadcast?
            </DialogDescription>
            <p className="text-sm text-muted-foreground mt-2">
              This action will instantly delete this notification from every single user's dashboard across the entire platform.
            </p>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setConfirmUndo(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleUndoGlobal}>Yes, Recall Broadcast</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear All Confirmation Modal */}
      <Dialog open={confirmClear} onOpenChange={setConfirmClear}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Clear All Notifications?</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear your entire notification history? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setConfirmClear(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleClearAll}>Clear All</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export { AdminNotifications };
export default AdminNotifications;
