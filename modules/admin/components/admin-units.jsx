"use client";
import { Plus, Users } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Panel, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { units } from "@shared/lib/mock-data";

function AdminUnits() {
  return (
    <AppShell
      role="admin"
      title="Specialised units"
      subtitle="Focus groups operating under the chapters"
      actions={
        <Button>
          <Plus className="h-4 w-4" /> New unit
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Units" value={String(units.length)} icon={Users} tone="primary" />
          <StatCard label="Active" value={String(units.filter((u) => u.status === "Active").length)} tone="success" />
          <StatCard label="Planned" value={String(units.filter((u) => u.status !== "Active").length)} tone="warning" />
          <StatCard label="Enrolled members" value={String(units.reduce((a, u) => a + u.members, 0))} />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {units.map((u) => (
            <Panel key={u.id} title={u.name} description={u.focus}>
              <div className="flex flex-wrap items-center gap-1.5">
                <Pill tone={u.status === "Active" ? "success" : "warning"}>{u.status}</Pill>
                <Pill>{u.chapter}</Pill>
                <Pill>{u.members} members</Pill>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline">
                  Manage members
                </Button>
                <Button size="sm" variant="ghost">
                  Edit unit
                </Button>
              </div>
            </Panel>
          ))}
        </div>
      </div>
    </AppShell>
  );
}


export { AdminUnits };
export default AdminUnits;
