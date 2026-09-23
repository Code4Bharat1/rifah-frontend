"use client";
import { Megaphone, Send, Loader2, Bell } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Panel, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { Textarea } from "@shared/components/ui/textarea";
import { useNotifications, useChapters } from "@shared/hooks/use-rifah-api";
import { notificationApi } from "@shared/lib/api-services";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@shared/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Undo2, Eye, Trash, Calendar, MapPin, Clock, Building2 } from "lucide-react";

function formatEventDate(val) {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function AdminNotifications() {
  const [audience, setAudience] = useState("all");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState("all");

  const { data: notifData, refetch } = useNotifications();
  const { data: chaptersData } = useChapters();

  const notifications = Array.isArray(notifData?.notifications) ? notifData.notifications : (Array.isArray(notifData) ? notifData : []);
  const chapters = chaptersData || [];

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const broadcastCount = notifications.filter(n => n.type === "Broadcast" || n.broadcastId).length;
  const displayedNotifications = filter === "unread"
    ? notifications.filter(n => !n.isRead)
    : filter === "broadcasts"
    ? notifications.filter(n => n.type === "Broadcast" || n.broadcastId)
    : notifications;

  const [viewNotif, setViewNotif] = useState(null);
  const [confirmUndo, setConfirmUndo] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    if (audience === "chapter" && !selectedChapter) {
      toast.error("Please select a chapter to broadcast to.");
      return;
    }
    
    setSending(true);
    try {
      await notificationApi.broadcast({
        title: title.trim(),
        body: message.trim(),
        targetRole: ["all", "chapter"].includes(audience) ? undefined : audience,
        chapter: audience === "chapter" ? selectedChapter : undefined,
      });
      toast.success("Broadcast announcement sent successfully!");
      setTitle("");
      setMessage("");
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
    <AppShell role="admin" title="Announcements & Broadcasts" subtitle="Chamber-wide circulars and alerts">
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
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Audience</Label>
                  <Select value={audience} onValueChange={setAudience}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Registered Users</SelectItem>
                      <SelectItem value="business_owner">Member Businesses</SelectItem>
                      <SelectItem value="customer">Buyers</SelectItem>
                      <SelectItem value="chapter">Specific Chapter Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {audience === "chapter" && (
                  <div className="space-y-1.5">
                    <Label>Select Chapter</Label>
                    <Select value={selectedChapter} onValueChange={setSelectedChapter}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Choose a chapter..." />
                      </SelectTrigger>
                      <SelectContent>
                        {chapters.map((ch) => (
                          <SelectItem key={ch._id || ch.name} value={ch.name}>
                            {ch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
          actions={
            notifications.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setConfirmClear(true)} className="text-destructive">
                <Trash className="mr-2 h-4 w-4" /> Clear All
              </Button>
            )
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
