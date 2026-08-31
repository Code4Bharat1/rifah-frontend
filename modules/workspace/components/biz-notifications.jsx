"use client";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { useNotifications } from "@shared/hooks/use-rifah-api";
import { notificationApi } from "@shared/lib/api-services";

function BizNotifications() {
  const { data: notifData, refetch } = useNotifications();
  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unreadCount || 0;

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
      subtitle={`${unreadCount} unread alerts`}
      actions={
        unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllRead}>
            Mark all as read
          </Button>
        )
      }
    >
      <Panel bodyClassName="p-0 md:p-0">
        {notifications.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No notifications at this time.</p>
        ) : (
          <ul className="divide-y divide-border">
            {notifications.map((n) => (
              <li key={n._id} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 p-4">
                <span
                  className={!n.read ? "mt-1.5 h-2 w-2 rounded-full bg-brand" : "mt-1.5 h-2 w-2 rounded-full bg-muted"}
                  aria-hidden
                />
                <div className="min-w-0">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <p className="min-w-0 text-sm font-semibold">{n.title}</p>
                    <Pill>{n.type || "System"}</Pill>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </AppShell>
  );
}

export { BizNotifications };
export default BizNotifications;
