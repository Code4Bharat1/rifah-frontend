"use client";
import { Megaphone, Send } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Panel, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { Textarea } from "@shared/components/ui/textarea";
import { chapters, notifications } from "@shared/lib/mock-data";

function AdminNotifications() {
  const [audience, setAudience] = useState("members");
  const [chapter, setChapter] = useState("all");

  return (
    <AppShell role="admin" title="Announcements" subtitle="Broadcasts are simulated in this prototype">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Sent this month" value="12" icon={Megaphone} tone="primary" />
          <StatCard label="Open rate" value="64%" tone="success" />
          <StatCard label="Scheduled" value="2" tone="warning" />
          <StatCard label="Recipients" value="3,140" />
        </div>

        <Panel title="Compose announcement">
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Audience</Label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="members">Member businesses</SelectItem>
                    <SelectItem value="buyers">Buyers</SelectItem>
                    <SelectItem value="all">Everyone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Chapter</Label>
                <Select value={chapter} onValueChange={setChapter}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All chapters</SelectItem>
                    {chapters.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input placeholder="e.g. Renewal window opens next week" className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label>Message</Label>
              <Textarea rows={4} placeholder="Write the announcement body" />
            </div>
            <Button className="w-full sm:w-auto">
              <Send className="h-4 w-4" /> Send announcement
            </Button>
          </div>
        </Panel>

        <Panel title="Recently sent" bodyClassName="p-0 md:p-0">
          <ul className="divide-y divide-border">
            {notifications.map((n) => (
              <li key={n.id} className="p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <p className="min-w-0 text-sm font-semibold">{n.title}</p>
                  <Pill>{n.type}</Pill>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{n.time}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}


export { AdminNotifications };
export default AdminNotifications;
