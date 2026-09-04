"use client";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@shared/components/ui/dialog";
import { useNotifications } from "@shared/hooks/use-rifah-api";
import { notificationApi } from "@shared/lib/api-services";
import { useState } from "react";
import { Megaphone, Eye } from "lucide-react";

function formatRelativeTime(dateString) {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (isNaN(date.getTime())) return "Recently";
  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} ${diffInMinutes === 1 ? "minute ago" : "minutes ago"}`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? "hour ago" : "hours ago"}`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} ${Math.floor(diffInDays / 7) === 1 ? "week ago" : "weeks ago"}`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function safeText(val, fallback = "") {
  if (!val) return fallback;
  if (typeof val === "string" || typeof val === "number") return String(val);
  if (typeof val === "object") {
    if (typeof val.text === "string") return val.text;
    if (typeof val.body === "string") return val.body;
    if (typeof val.message === "string") return val.message;
    if (typeof val.title === "string") return val.title;
    return fallback;
  }
  return fallback;
}

function BizNotifications() {
  const [viewNotif, setViewNotif] = useState(null);
  const { data: notifData, refetch } = useNotifications();
  const notifications = Array.isArray(notifData) ? notifData : (notifData?.notifications || []);
  const unreadCount = typeof notifData?.unreadCount === "number"
    ? notifData.unreadCount
    : notifications.filter((n) => !n.isRead && !n.readAt).length;

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppShell
      role="business"
      title="Notifications"
      subtitle={`${unreadCount} unread`}
      actions={
        <Button variant="outline" onClick={handleMarkAllRead}>
          Mark all as read
        </Button>
      }
    >
      <Panel bodyClassName="p-0 md:p-0">
        {notifications.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No notifications at this time.</p>
        ) : (
          <ul className="divide-y divide-border">
            {notifications.map((n) => {
              const isUnread = !n.isRead && !n.readAt;
              const titleText = safeText(n.title || n.type, "Notification");
              const bodyText = safeText(n.body || n.message, "");

              return (
                <li
                  key={n._id || n.id}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3.5 p-4 hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors"
                >
                  <span
                    className={
                      isUnread
                        ? "mt-1.5 h-2.5 w-2.5 rounded-full bg-[#C90000] shrink-0"
                        : "mt-1.5 h-2.5 w-2.5 rounded-full bg-transparent shrink-0"
                    }
                    aria-hidden
                  />
                  <div className="min-w-0 pr-2">
                    <p className={`text-sm ${isUnread ? "font-bold text-foreground" : "font-medium text-foreground"}`}>{titleText}</p>
                    {Boolean(bodyText) && (
                      <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed line-clamp-1">{bodyText}</p>
                    )}
                    <p className="mt-1.5 text-[11px] text-muted-foreground/80">
                      {formatRelativeTime(n.createdAt)}
                    </p>
                  </div>
                  <div className="shrink-0 pt-0.5 flex flex-col items-end gap-2">
                    <Pill>{n.type || "System"}</Pill>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs" 
                      onClick={async () => {
                        setViewNotif({ ...n, title: titleText, body: bodyText });
                        if (isUnread) {
                          try {
                            await notificationApi.markAsRead(n._id || n.id);
                            refetch();
                          } catch (e) {}
                        }
                      }}
                    >
                      <Eye className="mr-1 h-3 w-3" /> View
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
      
      {/* View Details Modal */}
      <Dialog open={!!viewNotif} onOpenChange={(o) => !o && setViewNotif(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{viewNotif?.title}</DialogTitle>
            <DialogDescription>
              {viewNotif ? formatRelativeTime(viewNotif.createdAt) : ""} · {viewNotif?.type || "Broadcast"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
             <div className="bg-muted/50 p-4 rounded-lg text-sm text-foreground whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
               {viewNotif?.body || viewNotif?.message}
             </div>
             {viewNotif?.broadcastId && (
               <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                 <Megaphone className="h-4 w-4" /> This was a global broadcast
               </div>
             )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewNotif(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export { BizNotifications };
export default BizNotifications;
