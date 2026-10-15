"use client";
import {
  Search,
  UserPlus,
  Users,
  MoreHorizontal,
  Mail,
  Building2,
  ShoppingBag,
  ShieldCheck,
  Globe,
  MapPin,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
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
import {
  Panel,
  ResponsiveTable,
  StatCard,
} from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@shared/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@shared/components/ui/dialog";
import { useAdminUsers, useCountries, useStates } from "@shared/hooks/use-rifah-api";
import { userApi } from "@shared/lib/api-services";
import { useAuth } from "@shared/providers/auth-provider";
import { usePathname, useRouter } from "next/navigation";

function AdminUsers() {
  const router = useRouter();
  const pathname = usePathname();
  const { user: currentUser } = useAuth();
  const isCentralAdmin = currentUser?.role === "central_admin";
  const isCountryAdmin = currentUser?.role === "country_admin";
  const isStateAdmin =
    pathname?.startsWith("/state-admin") ||
    currentUser?.role === "state_admin" ||
    currentUser?.activeWorkspace?.panelType === "state-admin";
  const isChapterAdmin =
    pathname?.startsWith("/chapter-admin") ||
    currentUser?.role === "chapter_admin" ||
    currentUser?.activeWorkspace?.panelType === "chapter-admin";

  const { data: countriesData } = useCountries({ status: "Active" });
  const rawCountries = Array.isArray(countriesData)
    ? countriesData
    : countriesData?.countries || countriesData?.data || [];
  const dbCountryNames = rawCountries.map((c) => c.name).filter(Boolean);
  const availableCountries = Array.from(new Set(["India", ...dbCountryNames]));

  // Central Admin defaults to India (they ARE the India Admin).
  // Country Admins are locked to their non-India country.
  const [countryFilter, setCountryFilter] = useState(
    isCountryAdmin ? currentUser?.country || "" : "India"
  );

  useEffect(() => {
    if (isCountryAdmin && currentUser?.country && countryFilter !== currentUser.country) {
      setCountryFilter(currentUser.country);
    }
  }, [isCountryAdmin, currentUser?.country]);

  const activeCountry = isCountryAdmin
    ? currentUser?.country || (countryFilter !== "all" ? countryFilter : null)
    : countryFilter === "all"
    ? null
    : countryFilter;

  const isNonIndia = Boolean(
    activeCountry && activeCountry.toLowerCase() !== "india"
  );

  const [stateFilter, setStateFilter] = useState("all");

  const { data: statesData } = useStates(
    activeCountry ? { country: activeCountry } : undefined
  );
  const rawStates = Array.isArray(statesData) ? statesData : statesData?.states || [];
  const availableStates = useMemo(() => {
    let list = rawStates;
    if (activeCountry) {
      list = list.filter((s) => {
        const sCountry = (s?.countryName || s?.country || "").trim().toLowerCase();
        if (!sCountry) return activeCountry.toLowerCase() === "india";
        return sCountry === activeCountry.toLowerCase();
      });
    }
    const names = list
      .map((s) => (typeof s === "string" ? s : s?.state || s?.name))
      .filter(Boolean);
    return Array.from(new Set(names)).sort();
  }, [rawStates, activeCountry]);

  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 300);
  const {
    data: usersData,
    refetch,
    isLoading,
    error,
  } = useAdminUsers({
    search: debouncedQ || undefined,
    country: activeCountry || undefined,
    state: stateFilter === "all" ? undefined : stateFilter,
  });

  // Try to extract users from various possible response formats
  let rows = [];
  if (Array.isArray(usersData)) {
    rows = usersData;
  } else if (usersData && typeof usersData === "object") {
    rows = Array.isArray(usersData.users)
      ? usersData.users
      : Array.isArray(usersData.data)
        ? usersData.data
        : Array.isArray(usersData.data?.users)
          ? usersData.data.users
          : [];
  }

  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);

  let displayRows = rows.filter((u) => {
    if (activeCountry) {
      const uCountry = (u.country || "").trim().toLowerCase();
      const targetCountry = activeCountry.trim().toLowerCase();
      if (uCountry && uCountry !== targetCountry) return false;
      if (!uCountry && targetCountry !== "india") return false;
    }
    if (stateFilter !== "all") {
      const uState = (u.state || "").trim().toLowerCase();
      if (uState !== stateFilter.trim().toLowerCase()) return false;
    }
    return true;
  });

  const totalCount = displayRows.length;
  const businessOwnersCount = displayRows.filter(
    (u) => u.role === "business_owner",
  ).length;
  const buyersCount = displayRows.filter((u) => u.role === "customer").length;
  const adminCount = displayRows.filter((u) =>
    ["central_admin", "country_admin", "state_admin", "chapter_admin"].includes(u.role),
  ).length;

  if (roleFilter === "business_owner") {
    displayRows = displayRows.filter((u) => u.role === "business_owner");
  } else if (roleFilter === "customer") {
    displayRows = displayRows.filter((u) => u.role === "customer");
  } else if (roleFilter === "admin") {
    displayRows = displayRows.filter((u) =>
      ["central_admin", "country_admin", "state_admin", "chapter_admin"].includes(u.role),
    );
  }
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  const handleChangeRole = async (user, newRole) => {
    const adminTiers = ["central_admin", "country_admin", "state_admin", "chapter_admin"];
    const responsibilityRoles = [...adminTiers];
    const hasExistingResponsibilityRole = responsibilityRoles.includes(user.role);
    const newRoleIsResponsibility = responsibilityRoles.includes(newRole);

    if (
      hasExistingResponsibilityRole &&
      newRoleIsResponsibility &&
      user.role !== newRole
    ) {
      toast.error(
        "This member already holds a responsibility role. Only business can be added as a second role.",
      );
      return;
    }

    try {
      if (adminTiers.includes(newRole)) {
        // Use the dedicated admin role assignment endpoint (hierarchy-enforced)
        await userApi.assignAdminRole(user._id, newRole);
      } else {
        // Use the generic status endpoint for customer / business_owner
        await userApi.updateUserStatus(user._id, { role: newRole });
      }
      toast.success(`Role updated to ${newRole.replace(/_/g, " ")}`);
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

  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete?._id) return;
    setIsDeletingUser(true);
    try {
      await userApi.deleteUser(userToDelete._id);
      toast.success(
        `Account for ${userToDelete.name} and all associated database records permanently deleted`
      );
      setUserToDelete(null);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to delete user account");
    } finally {
      setIsDeletingUser(false);
    }
  };

  return (
    <AppShell
      role={isStateAdmin ? "state_admin" : isChapterAdmin ? "chapter_admin" : "admin"}
      title={isStateAdmin || isChapterAdmin ? "Members" : "Users and roles"}
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
          <StatCard
            label="Total accounts"
            value={String(totalCount)}
            icon={Users}
            tone="primary"
            active={roleFilter === "all"}
            onClick={() => setRoleFilter("all")}
          />
          <StatCard
            label="Business owners"
            value={String(businessOwnersCount)}
            icon={Building2}
            active={roleFilter === "business_owner"}
            onClick={() => setRoleFilter("business_owner")}
          />
          <StatCard
            label="Buyers"
            value={String(buyersCount)}
            icon={ShoppingBag}
            active={roleFilter === "customer"}
            onClick={() => setRoleFilter("customer")}
          />
          <StatCard
            label="Administrators"
            value={String(adminCount)}
            icon={ShieldCheck}
            tone="warning"
            active={roleFilter === "admin"}
            onClick={() => setRoleFilter("admin")}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search users by name, email or role"
              className="h-11 pl-10"
            />
          </div>

          {/* ==========================================
              [COUNTRY_MODULE_DISABLED] Country Filter
          <div className="w-full sm:w-48">
            {isCountryAdmin ? (
              <div className="flex h-11 items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 text-xs font-semibold text-foreground">
                <Globe className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">{currentUser?.country || "Your Country"}</span>
              </div>
            ) : (
              <Select
                value={countryFilter}
                onValueChange={(v) => {
                  setCountryFilter(v);
                  setStateFilter("all");
                }}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <Globe className="h-4 w-4 text-muted-foreground mr-1 shrink-0" />
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {availableCountries.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          ========================================== */}

          {/* State / City Filter */}
          <div className="w-full sm:w-52">
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="h-11 rounded-xl">
                <MapPin className="h-4 w-4 text-muted-foreground mr-1 shrink-0" />
                <SelectValue placeholder={isNonIndia ? "All States / Cities" : "All States"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isNonIndia ? "All States / Cities" : "All States"}</SelectItem>
                {availableStates.map((st) => (
                  <SelectItem key={st} value={st}>
                    {st}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Panel>
          <ResponsiveTable
            rows={displayRows}
            isLoading={isLoading}
            empty={
              error ? (
                <EmptyState
                  icon={Users}
                  title="Error Loading Users"
                  description={
                    error.message ||
                    "You might not have permission to view this."
                  }
                />
              ) : (
                <EmptyState
                  icon={Users}
                  title="No users match"
                  description="Try a different search term."
                />
              )
            }
            columns={[
              {
                key: "name",
                header: "Name",
                cell: (r) => <span className="font-semibold">{r.name}</span>,
              },
              { key: "email", header: "Email", cell: (r) => r.email },
              {
                key: "role",
                header: "Role",
                cell: (r) => {
                  const roleName =
                    r.role === "central_admin"
                      ? "Central Admin"
                      : r.role === "country_admin"
                        ? "Country Admin"
                        : r.role === "state_admin"
                          ? (r.country && r.country.toLowerCase() !== "india" ? "State/City Admin" : "State Admin")
                          : r.role === "chapter_admin"
                            ? "Chapter Admin"
                            : r.role === "business_owner"
                              ? "Business Owner"
                              : r.role === "customer"
                                ? "Buyer"
                                : r.role;
                  return <Pill tone="primary">{roleName}</Pill>;
                },
              },
              {
                key: "status",
                header: "Status",
                cell: (r) => (
                  <Pill
                    tone={
                      (r.status || "active").toLowerCase() === "active"
                        ? "success"
                        : "warning"
                    }
                  >
                    {r.status || "Active"}
                  </Pill>
                ),
              },
              {
                key: "joined",
                header: "Joined",
                cell: (r) => new Date(r.createdAt).toLocaleDateString(),
              },
              {
                key: "act",
                header: "",
                cell: (r) => {
                  const isActive =
                    (r.status || "active").toLowerCase() === "active";
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
                        {!isChapterAdmin && !isStateAdmin && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleChangeRole(r, "customer")}
                              disabled={r.role === "customer"}
                            >
                              Make Buyer
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                if (r.role !== "business_owner") {
                                  router.push(
                                    `/admin/businesses/new?convertEmail=${encodeURIComponent(r.email)}`,
                                  );
                                }
                              }}
                              disabled={r.role === "business_owner"}
                            >
                              Make Business Owner
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleChangeRole(r, "state_admin")}
                              disabled={r.role === "state_admin"}
                            >
                              {r.country && r.country.toLowerCase() !== "india" ? "Make State/City Admin" : "Make State Admin"}
                            </DropdownMenuItem>
                            {/* ==========================================
                                [COUNTRY_MODULE_DISABLED] Make Country Admin
                            {isCentralAdmin && (r.country && r.country.toLowerCase() !== "india") && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleChangeRole(r, "country_admin")
                                }
                                disabled={r.role === "country_admin"}
                              >
                                Make Country Admin
                              </DropdownMenuItem>
                            )}
                            ========================================== */}
                            {isCentralAdmin && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleChangeRole(r, "central_admin")
                                }
                                disabled={r.role === "central_admin"}
                              >
                                Make Central Admin
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className={
                            isActive
                              ? "text-red-600 focus:bg-red-50"
                              : "text-green-600 focus:bg-green-50"
                          }
                          onClick={() => handleToggleStatus(r)}
                        >
                          {isActive ? "Suspend Account" : "Activate Account"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:bg-red-50 focus:text-red-700 font-medium cursor-pointer"
                          onClick={() => setUserToDelete(r)}
                        >
                          Delete Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                },
              },
            ]}
            mobile={(r) => {
              const isActive =
                (r.status || "active").toLowerCase() === "active";
              return (
                <div className="rounded-xl border border-border p-3.5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{r.name}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {r.email}
                      </p>
                    </div>
                    <Pill
                      tone={
                        (r.status || "active").toLowerCase() === "active"
                          ? "success"
                          : "warning"
                      }
                    >
                      {r.status || "Active"}
                    </Pill>
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1.5">
                    <Pill tone="primary">
                      {r.role === "central_admin"
                        ? "Central Admin"
                        : r.role === "country_admin"
                          ? "Country Admin"
                          : r.role === "state_admin"
                            ? (r.country && r.country.toLowerCase() !== "india" ? "State/City Admin" : "State Admin")
                            : r.role === "chapter_admin"
                              ? "Chapter Admin"
                              : r.role}
                    </Pill>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setSelectedUser(r)}
                    >
                      Manage
                    </Button>
                  </div>
                </div>
              );
            }}
          />
        </Panel>
      </div>

      {/* User Details Modal */}
      <Dialog
        open={!!selectedUser}
        onOpenChange={(o) => !o && setSelectedUser(null)}
      >
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
                <p className="text-xs font-medium text-muted-foreground">
                  Full Name
                </p>
                <p className="text-sm font-semibold mt-0.5">
                  {selectedUser?.name}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Email Address
                </p>
                <p className="text-sm font-semibold mt-0.5">
                  {selectedUser?.email}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Current Role
                </p>
                <p className="text-sm font-semibold mt-0.5 capitalize">
                  {selectedUser?.role?.replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Country & State / City
                </p>
                <p className="text-sm font-semibold mt-0.5">
                  {selectedUser?.country || "India"} {selectedUser?.state ? `• ${selectedUser.state}` : ""}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Phone
                </p>
                <p className="text-sm font-semibold mt-0.5">
                  {selectedUser?.phone || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  City & Chapter
                </p>
                <p className="text-sm font-semibold mt-0.5">
                  {selectedUser?.city || "N/A"} •{" "}
                  {selectedUser?.chapter || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Organization
                </p>
                <p className="text-sm font-semibold mt-0.5">
                  {selectedUser?.organization || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Status
                </p>
                <div className="mt-1">
                  <Pill
                    tone={
                      (selectedUser?.status || "active").toLowerCase() ===
                      "active"
                        ? "success"
                        : "warning"
                    }
                  >
                    {selectedUser?.status || "Active"}
                  </Pill>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Joined Date
                </p>
                <p className="text-sm font-semibold mt-0.5">
                  {selectedUser?.createdAt
                    ? new Date(selectedUser.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  User ID
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                  {selectedUser?._id}
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
              <Button
                variant={
                  (selectedUser?.status || "active").toLowerCase() === "active"
                    ? "outline"
                    : "default"
                }
                onClick={() => {
                  handleToggleStatus(selectedUser);
                  setSelectedUser(null);
                }}
              >
                {(selectedUser?.status || "active").toLowerCase() === "active"
                  ? "Suspend Account"
                  : "Activate Account"}
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  const target = selectedUser;
                  setSelectedUser(null);
                  setUserToDelete(target);
                }}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Modal */}
      <Dialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && !isDeletingUser && setUserToDelete(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Account Permanently
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete the account for{" "}
              <strong>{userToDelete?.name}</strong> ({userToDelete?.email})?
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 text-sm text-muted-foreground space-y-2">
            <p>
              This will permanently delete this user, their registered businesses,
              catalogues, memberships, enquiries, leads, and all related database records.
            </p>
            <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-3 text-red-700 dark:text-red-300 text-xs font-semibold">
              ⚠️ Warning: This action cannot be undone. All data will be completely wiped from the database.
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setUserToDelete(null)}
              disabled={isDeletingUser}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDeleteUser}
              disabled={isDeletingUser}
              className="gap-2"
            >
              {isDeletingUser ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting from database...
                </>
              ) : (
                "Yes, Delete Account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Member Modal */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite New Member</DialogTitle>
            <DialogDescription>
              Send an invitation email with a registration link to a prospective
              member.
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
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsInviteOpen(false)}
                disabled={isInviting}
              >
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
