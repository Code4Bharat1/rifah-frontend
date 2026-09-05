"use client";
import { Search, UserPlus, Users, MoreHorizontal, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@shared/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@shared/components/ui/dialog";
import { useAdminUsers } from "@shared/hooks/use-rifah-api";
import { userApi } from "@shared/lib/api-services";
import { useAuth } from "@shared/providers/auth-provider";

function AdminUsers() {
  const { user: currentUser } = useAuth();
  const isChapterAdmin = currentUser?.role === "chapter_admin";
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 300);
  const { data: usersData, refetch, isLoading, error } = useAdminUsers({ search: debouncedQ || undefined });
  
  console.log("Admin Users Data:", usersData, "Error:", error);

  // Try to extract users from various possible response formats
  let rows = [];
  if (Array.isArray(usersData)) {
    rows = usersData;
  } else if (usersData && typeof usersData === "object") {
    rows = Array.isArray(usersData.users) ? usersData.users : 
           (Array.isArray(usersData.data) ? usersData.data : 
           (Array.isArray(usersData.data?.users) ? usersData.data.users : []));
  }
  
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);

  const totalCount = rows.length;
  const businessOwnersCount = rows.filter((u) => u.role === "business_owner").length;
  const buyersCount = rows.filter((u) => u.role === "customer").length;
  const secretariatCount = rows.filter((u) => u.role === "super_admin" || u.role === "secretariat").length;

  let displayRows = rows;
  if (roleFilter === "business_owner") {
    displayRows = rows.filter((u) => u.role === "business_owner");
  } else if (roleFilter === "customer") {
    displayRows = rows.filter((u) => u.role === "customer");
  } else if (roleFilter === "secretariat") {
    displayRows = rows.filter((u) => u.role === "super_admin" || u.role === "secretariat");
  }
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

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

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setIsInviting(true);
    try {
      await userApi.inviteUser({ email: inviteEmail });
      toast.success("Invitation sent successfully");
      setIsInviteOpen(false);
      setInviteEmail("");
    } catch (err) {
      toast.error(err.message || "Failed to send invite");
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <AppShell
      role="admin"
      title="Users and roles"
      subtitle={`${rows.length} accounts registered`}
      actions={
        <Button onClick={() => setIsInviteOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invite Member
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <button type="button" onClick={() => setRoleFilter("all")} className={`text-left transition-all duration-200 focus:outline-none rounded-2xl ${roleFilter === "all" ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-md scale-[1.02]" : "opacity-75 hover:opacity-100 hover:scale-[1.01]"}`}>
            <StatCard label="Total accounts" value={String(totalCount)} icon={Users} tone="primary" />
          </button>
          <button type="button" onClick={() => setRoleFilter("business_owner")} className={`text-left transition-all duration-200 focus:outline-none rounded-2xl ${roleFilter === "business_owner" ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-md scale-[1.02]" : "opacity-75 hover:opacity-100 hover:scale-[1.01]"}`}>
            <StatCard label="Business owners" value={String(businessOwnersCount)} />
          </button>
          <button type="button" onClick={() => setRoleFilter("customer")} className={`text-left transition-all duration-200 focus:outline-none rounded-2xl ${roleFilter === "customer" ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-md scale-[1.02]" : "opacity-75 hover:opacity-100 hover:scale-[1.01]"}`}>
            <StatCard label="Buyers" value={String(buyersCount)} />
          </button>
          <button type="button" onClick={() => setRoleFilter("secretariat")} className={`text-left transition-all duration-200 focus:outline-none rounded-2xl ${roleFilter === "secretariat" ? "ring-2 ring-warning ring-offset-2 ring-offset-background shadow-md scale-[1.02]" : "opacity-75 hover:opacity-100 hover:scale-[1.01]"}`}>
            <StatCard label="Secretariat admins" value={String(secretariatCount)} tone="warning" />
          </button>
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
            rows={displayRows}
            isLoading={isLoading}
            empty={
              error ? (
                <EmptyState icon={Users} title="Error Loading Users" description={error.message || "You might not have permission to view this."} />
              ) : (
                <EmptyState icon={Users} title="No users match" description="Try a different search term." />
              )
            }
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
                        {!isChapterAdmin && (
                          <DropdownMenuItem onClick={() => handleChangeRole(r, "secretariat")} disabled={r.role === "secretariat"}>
                            Make Secretariat
                          </DropdownMenuItem>
                        )}
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
                <p className="text-xs font-medium text-muted-foreground">Phone</p>
                <p className="text-sm font-semibold mt-0.5">{selectedUser?.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">City & Chapter</p>
                <p className="text-sm font-semibold mt-0.5">{selectedUser?.city || "N/A"} • {selectedUser?.chapter || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Organization</p>
                <p className="text-sm font-semibold mt-0.5">{selectedUser?.organization || "N/A"}</p>
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

      {/* Invite Member Modal */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite New Member</DialogTitle>
            <DialogDescription>
              Send an invitation email with a registration link to a prospective member.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInvite}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    className="pl-9"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)} disabled={isInviting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isInviting}>
                {isInviting ? "Sending..." : "Send Invitation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export { AdminUsers };
export default AdminUsers;
