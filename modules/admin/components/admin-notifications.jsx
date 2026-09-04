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

function AdminNotifications() {
  const [audience, setAudience] = useState("all");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const { data: notifData, refetch } = useNotifications();
  const { data: chaptersData } = useChapters();

  const notifications = Array.isArray(notifData?.notifications) ? notifData.notifications : (Array.isArray(notifData) ? notifData : []);
  const chapters = chaptersData || [];

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

  const handleDelete = async (broadcastId) => {
    if (!confirm("Are you sure you want to undo this broadcast? It will be removed from all users' panels.")) return;
    try {
      await notificationApi.deleteBroadcast(broadcastId);
      toast.success("Broadcast successfully recalled from all users.");
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to delete broadcast.");
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

        <Panel title="Recently sent alerts" bodyClassName="p-0 md:p-0">
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
                      {n.broadcastId && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-destructive hover:bg-destructive/10" 
                          onClick={() => handleDelete(n.broadcastId)}
                          title="Undo / Recall Broadcast"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </Button>
                      )}
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
    </AppShell>
  );
}

export { AdminNotifications };
export default AdminNotifications;
