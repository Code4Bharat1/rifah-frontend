"use client";
import { Megaphone, Send, Loader2 } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@shared/components/ui/dialog";
import { MoreHorizontal, Trash2, Undo2, Eye, Trash } from "lucide-react";

function AdminNotifications() {
  const [audience, setAudience] = useState("all");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const { data: notifData, refetch } = useNotifications();
  const { data: chaptersData } = useChapters();

  const notifications = Array.isArray(notifData?.notifications) ? notifData.notifications : (Array.isArray(notifData) ? notifData : []);
  const chapters = chaptersData || [];

  const [viewNotif, setViewNotif] = useState(null);
  const [confirmUndo, setConfirmUndo] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    try {
      await notificationApi.broadcast({
        title: title.trim(),
        body: message.trim(),
        targetRole: audience === "all" ? undefined : audience,
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
          <StatCard label="Broadcasts Desk" value="Active" icon={Megaphone} tone="primary" />
          <StatCard label="Recent Alerts" value={String(notifications.length)} tone="success" />
        </div>

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
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Annual Chamber General Meeting & Expo"
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

        <Panel 
          title="Recently sent alerts" 
          bodyClassName="p-0 md:p-0"
          actions={
            notifications.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setConfirmClear(true)} className="text-destructive">
                <Trash className="mr-2 h-4 w-4" /> Clear All
              </Button>
            )
          }
        >
          {notifications.length === 0 ? (
            <p className="p-6 text-center text-xs text-muted-foreground">No recent alerts.</p>
          ) : (
            <ul className="divide-y divide-border">
              {notifications.map((n) => (
                <li key={n._id} className="p-4">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <p className="min-w-0 text-sm font-semibold">{n.title}</p>
                    <div className="flex items-center gap-2">
                      <Pill>{n.type || "Broadcast"}</Pill>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => setViewNotif(n)}>
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
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.body || n.message}</p>
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
             <div className="bg-muted/50 p-4 rounded-lg text-sm text-foreground whitespace-pre-wrap">
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
