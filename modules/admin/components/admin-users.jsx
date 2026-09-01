"use client";
import { Search, UserPlus, Users } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { useAdminUsers } from "@shared/hooks/use-rifah-api";
import { userApi } from "@shared/lib/api-services";

function AdminUsers() {
  const [q, setQ] = useState("");
  const { data: usersData, refetch } = useAdminUsers({ search: q || undefined });
  const rows = Array.isArray(usersData) ? usersData : [];

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "active" ? "suspended" : "active";
    try {
      await userApi.updateUserStatus(user._id, { status: newStatus });
      refetch();
    } catch (err) {
      alert(err.message || "Failed to update user status.");
    }
  };

  return (
    <AppShell
      role="admin"
      title="Users and roles"
      subtitle={`${rows.length} accounts registered`}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total accounts" value={String(rows.length)} icon={Users} tone="primary" />
          <StatCard
            label="Business owners"
            value={String(rows.filter((u) => u.role === "business_owner").length)}
          />
          <StatCard
            label="Buyers"
            value={String(rows.filter((u) => u.role === "customer").length)}
          />
          <StatCard
            label="Secretariat admins"
            value={String(rows.filter((u) => u.role === "super_admin" || u.role === "secretariat").length)}
            tone="warning"
          />
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search users by name, email or role"
            className="h-11 pl-10"
          />
        </div>

        <Panel>
          <ResponsiveTable
            rows={rows}
            empty={<EmptyState icon={Users} title="No users match" description="Try a different search term." />}
            columns={[
              { key: "name", header: "Name", cell: (r) => <span className="font-semibold">{r.name}</span> },
              { key: "email", header: "Email", cell: (r) => r.email },
              { key: "role", header: "Role", cell: (r) => <Pill tone="primary">{r.role}</Pill> },
              { key: "status", header: "Status", cell: (r) => <Pill tone={r.status === "active" ? "success" : "warning"}>{r.status || "active"}</Pill> },
              { key: "joined", header: "Joined", cell: (r) => new Date(r.createdAt).toLocaleDateString() },
              {
                key: "act",
                header: "",
                cell: (r) => (
                  <Button
                    size="sm"
                    variant={r.status === "active" ? "ghost" : "destructive"}
                    onClick={() => handleToggleStatus(r)}
                  >
                    {r.status === "active" ? "Suspend" : "Activate"}
                  </Button>
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
                  <Pill tone={r.status === "active" ? "success" : "warning"}>{r.status || "active"}</Pill>
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <Pill tone="primary">{r.role}</Pill>
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
