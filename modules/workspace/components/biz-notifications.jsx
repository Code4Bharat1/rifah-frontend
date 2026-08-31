"use client";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { notifications } from "@shared/lib/mock-data";

function BizNotifications() {
  return (
    <AppShell
      role="business"
      title="Notifications"
      subtitle={`${notifications.filter((n) => n.unread).length} unread`}
      actions={<Button variant="outline">Mark all as read</Button>}
    >
      <Panel bodyClassName="p-0 md:p-0">
        <ul className="divide-y divide-border">
          {notifications.map((n) => (
            <li key={n.id} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 p-4">
              <span
                className={n.unread ? "mt-1.5 h-2 w-2 rounded-full bg-brand" : "mt-1.5 h-2 w-2 rounded-full bg-muted"}
                aria-hidden
              />
              <div className="min-w-0">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <p className="min-w-0 text-sm font-semibold">{n.title}</p>
                  <Pill>{n.type}</Pill>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{n.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </AppShell>
  );
}


export { BizNotifications };
export default BizNotifications;
