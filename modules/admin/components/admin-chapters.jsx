"use client";
import { MapPin, Plus, Users } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { chapters, units } from "@shared/lib/mock-data";

function AdminChapters() {
  return (
    <AppShell
      role="admin"
      title="Chapters and units"
      subtitle="Regional structure of the chamber"
      actions={
        <Button>
          <Plus className="h-4 w-4" /> New chapter
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Chapters" value={String(chapters.length)} icon={MapPin} tone="primary" />
          <StatCard label="Specialised units" value={String(units.length)} icon={Users} />
          <StatCard label="Chapter events" value={String(chapters.reduce((a, c) => a + c.events, 0))} tone="success" />
          <StatCard label="Forming" value={String(chapters.filter((c) => c.status === "Forming").length)} tone="warning" />
        </div>

        <Panel title="Chapters">
          <ResponsiveTable
            rows={chapters}
            columns={[
              { key: "name", header: "Chapter", cell: (r) => <span className="font-semibold">{r.name}</span> },
              { key: "loc", header: "Location", cell: (r) => `${r.city}, ${r.state}` },
              { key: "businesses", header: "Businesses", cell: (r) => r.businesses },
              { key: "members", header: "Members", cell: (r) => r.members },
              { key: "events", header: "Events", cell: (r) => r.events },
              { key: "status", header: "Status", cell: (r) => <Pill tone={r.status === "Active" ? "success" : "warning"}>{r.status}</Pill> },
            ]}
            mobile={(r) => (
              <div className="rounded-xl border border-border p-3.5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{r.name}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {r.city}, {r.state} · {r.lead}
                    </p>
                  </div>
                  <Pill tone={r.status === "Active" ? "success" : "warning"}>{r.status}</Pill>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <Pill>{r.businesses} businesses</Pill>
                  <Pill>{r.members} members</Pill>
                  <Pill>{r.events} events</Pill>
                </div>
              </div>
            )}
          />
        </Panel>

        <Panel title="Specialised units">
          <div className="grid gap-3 sm:grid-cols-2">
            {units.map((u) => (
              <div key={u.id} className="rounded-xl border border-border p-3.5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <p className="min-w-0 truncate text-sm font-semibold">{u.name}</p>
                  <Pill tone={u.status === "Active" ? "success" : "warning"}>{u.status}</Pill>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{u.focus}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {u.chapter} · {u.members} members
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}


export { AdminChapters };
export default AdminChapters;
