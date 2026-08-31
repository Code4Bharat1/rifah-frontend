"use client";
import { Search, UserPlus, Users } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { users } from "@shared/lib/mock-data";

function AdminUsers() {
  const [q, setQ] = useState("");
  const rows = users.filter((u) => [u.name, u.email, u.role].join(" ").toLowerCase().includes(q.toLowerCase()));

  return (
    <AppShell
      role="admin"
      title="Users and roles"
      subtitle={`${users.length} accounts in the prototype dataset`}
      actions={
        <Button>
          <UserPlus className="h-4 w-4" /> Invite user
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total accounts" value="3,140" icon={Users} tone="primary" />
          <StatCard label="Business owners" value="872" />
          <StatCard label="Buyers" value="2,241" />
          <StatCard label="Secretariat staff" value="27" tone="warning" />
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users by name, email or role" className="h-11 pl-10" />
        </div>

        <Panel>
          <ResponsiveTable
            rows={rows}
            empty={<EmptyState icon={Users} title="No users match" description="Try a different search term." />}
            columns={[
              { key: "name", header: "Name", cell: (r) => <span className="font-semibold">{r.name}</span> },
              { key: "email", header: "Email", cell: (r) => r.email },
              { key: "role", header: "Role", cell: (r) => <Pill tone="primary">{r.role}</Pill> },
              { key: "status", header: "Status", cell: (r) => <Pill tone={r.status === "Active" ? "success" : "warning"}>{r.status}</Pill> },
              { key: "joined", header: "Joined", cell: (r) => r.joined },
              {
                key: "act",
                header: "",
                cell: () => (
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost">
                      Edit role
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive">
                      Suspend
                    </Button>
                  </div>
                ),
              },
            ]}
            mobile={(r) => (
              <div className="rounded-xl border border-border p-3.5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{r.name}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{r.email}</p>
                  </div>
                  <Pill tone={r.status === "Active" ? "success" : "warning"}>{r.status}</Pill>
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <Pill tone="primary">{r.role}</Pill>
                  <Pill>Joined {r.joined}</Pill>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline">
                    Edit role
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive">
                    Suspend
                  </Button>
                </div>
              </div>
            )}
          />
        </Panel>
      </div>
    </AppShell>
  );
}


export { AdminUsers };
export default AdminUsers;
