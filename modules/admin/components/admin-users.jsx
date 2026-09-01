"use client";
import { Search, UserPlus, Users, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@shared/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@shared/components/ui/dialog";
import { useAdminUsers } from "@shared/hooks/use-rifah-api";
import { userApi } from "@shared/lib/api-services";

function AdminUsers() {
  const [q, setQ] = useState("");
  const { data: usersData, refetch } = useAdminUsers({ search: q || undefined });
  const rows = Array.isArray(usersData) ? usersData : [];
  
  const [selectedUser, setSelectedUser] = useState(null);

  const handleChangeRole = async (user, newRole) => {
    try {
      await userApi.updateUserStatus(user._id, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to update role.");
    }
  };

  const handleToggleStatus = async (user) => {
    const currentStatus = (user.status || "active").toLowerCase();
    const newStatus = currentStatus === "active" ? "Suspended" : "Active";
    try {
      await userApi.updateUserStatus(user._id, { status: newStatus });
      toast.success(`User is now ${newStatus}`);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to update user status.");
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
              { key: "status", header: "Status", cell: (r) => <Pill tone={(r.status || "active").toLowerCase() === "active" ? "success" : "warning"}>{r.status || "Active"}</Pill> },
              { key: "joined", header: "Joined", cell: (r) => new Date(r.createdAt).toLocaleDateString() },
              {
                key: "act",
                header: "",
                cell: (r) => {
                  const isActive = (r.status || "active").toLowerCase() === "active";
                  return (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setSelectedUser(r)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleChangeRole(r, "customer")} disabled={r.role === "customer"}>
                          Make Buyer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeRole(r, "business_owner")} disabled={r.role === "business_owner"}>
                          Make Business Owner
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeRole(r, "secretariat")} disabled={r.role === "secretariat"}>
                          Make Secretariat
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className={isActive ? "text-red-600 focus:bg-red-50" : "text-green-600 focus:bg-green-50"}
                          onClick={() => handleToggleStatus(r)}
                        >
                          {isActive ? "Suspend Account" : "Activate Account"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                },
              },
            ]}
            mobile={(r) => {
              const isActive = (r.status || "active").toLowerCase() === "active";
              return (
              <div className="rounded-xl border border-border p-3.5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{r.name}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{r.email}</p>
                  </div>
                  <Pill tone={(r.status || "active").toLowerCase() === "active" ? "success" : "warning"}>{r.status || "Active"}</Pill>
                </div>
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1.5">
                  <Pill tone="primary">{r.role}</Pill>
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setSelectedUser(r)}>Manage</Button>
                </div>
              </div>
              );
            }}
          />
        </Panel>
      </div>

      {/* User Details Modal */}
      <Dialog open={!!selectedUser} onOpenChange={(o) => !o && setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Account information for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Full Name</p>
                <p className="text-sm font-semibold mt-0.5">{selectedUser?.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Email Address</p>
                <p className="text-sm font-semibold mt-0.5">{selectedUser?.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Current Role</p>
                <p className="text-sm font-semibold mt-0.5 capitalize">{selectedUser?.role?.replace("_", " ")}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Status</p>
                <div className="mt-1">
                  <Pill tone={(selectedUser?.status || "active").toLowerCase() === "active" ? "success" : "warning"}>
                    {selectedUser?.status || "Active"}
                  </Pill>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Joined Date</p>
                <p className="text-sm font-semibold mt-0.5">{selectedUser?.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">User ID</p>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">{selectedUser?._id}</p>
              </div>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setSelectedUser(null)}>Close</Button>
              <Button 
                variant={(selectedUser?.status || "active").toLowerCase() === "active" ? "destructive" : "default"}
                onClick={() => {
                  handleToggleStatus(selectedUser);
                  setSelectedUser(null);
                }}
              >
                {(selectedUser?.status || "active").toLowerCase() === "active" ? "Suspend Account" : "Activate Account"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export { AdminUsers };
export default AdminUsers;
