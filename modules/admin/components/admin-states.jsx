"use client";
import Link from "next/link";
import { useState } from "react";
import { MapPin, Plus, Users, Loader2, ShieldCheck, Mail, Phone, MoreHorizontal, UserCheck, Trash2, Building2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@shared/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@shared/components/ui/dropdown-menu";
import { useStates } from "@shared/hooks/use-rifah-api";
import { stateApi } from "@shared/lib/api-services";
import { useAuth } from "@shared/providers/auth-provider";

export function AdminStates() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";
  const { data: statesData, refetch, isLoading } = useStates();
  const states = Array.isArray(statesData) ? statesData : [];

  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    state: "",
    name: "",
    email: "",
    phone: "",
  });

  const totalStates = states.length;
  const statesWithAdmin = states.filter((s) => s.hasAdmin).length;
  const totalChapters = states.reduce((sum, s) => sum + (s.chaptersCount || 0), 0);
  const totalBusinesses = states.reduce((sum, s) => sum + (s.totalBusinesses || 0), 0);

  const handleOpenAllocate = (prefillState = "") => {
    setForm({
      state: prefillState,
      name: "",
      email: "",
      phone: "",
    });
    setOpenModal(true);
  };

  const handleAssignAdmin = async (e) => {
    e.preventDefault();
    if (!form.state || !form.name || !form.email) {
      toast.error("State, Admin Name, and Email are required");
      return;
    }
    setSubmitting(true);
    try {
      await stateApi.assignAdmin(form);
      toast.success(`State Admin allocated for ${form.state}! Credentials sent via email.`);
      setOpenModal(false);
      setForm({ state: "", name: "", email: "", phone: "" });
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to allocate State Admin.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveAdmin = async (stateName) => {
    if (!confirm(`Are you sure you want to revoke the State Admin for ${stateName}?`)) return;
    try {
      await stateApi.removeAdmin(stateName);
      toast.success(`State Admin revoked for ${stateName}`);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to revoke State Admin.");
    }
  };

  return (
    <AppShell
      role="admin"
      title="States & Regional Leadership"
      subtitle="National structure: Super Admin allocates State Admins to manage Chapter Admin"
      actions={
        isSuperAdmin ? (
          <Button onClick={() => handleOpenAllocate()} className="gap-2">
            <Plus className="h-4 w-4" /> Allocate State Admin
          </Button>
        ) : null
      }
    >
      <div className="space-y-6">
        {/* Delegation Architecture Info Banner */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900 shadow-xs dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200">
          <p className="font-semibold text-sm">3-Tier Geographic Delegation System</p>
          <p className="mt-1 text-blue-800/90 dark:text-blue-300">
            As Super Admin, you assign <strong>State Admins</strong> to oversee states. The State Admin for that state then holds the exclusive authority to assign and manage <strong>Chapter Admins</strong> for individual cities (e.g., Mumbai, Pune, Nagpur).
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="States Active" value={String(totalStates)} icon={MapPin} tone="primary" />
          <StatCard label="States with Admins" value={String(statesWithAdmin)} icon={UserCheck} tone="success" />
          <StatCard label="Total Chapter Admins" value={String(totalChapters)} icon={Users} />
          <StatCard label="Regional Businesses" value={String(totalBusinesses)} icon={Building2} tone="warning" />
        </div>

        {/* States Table */}
        <Panel title="State Desks">
          <ResponsiveTable
            rows={states}
            isLoading={isLoading}
            emptyTitle="No states registered yet"
            emptyDescription="Allocate a State Admin above to initialize your first state desk."
            columns={[
              {
                key: "state",
                header: "State / Territory",
                cell: (r) => (
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                      {r.state?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-semibold text-foreground text-sm">{r.state}</span>
                      <p className="text-xs text-muted-foreground">{r.chaptersCount} Chapter Admin{r.chaptersCount === 1 ? "" : "s"}</p>
                    </div>
                  </div>
                ),
              },
              {
                key: "admin",
                header: "State Admin",
                cell: (r) =>
                  r.admin ? (
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-medium text-xs text-foreground">
                        <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                        <span>{r.admin.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {r.admin.email}
                      </p>
                    </div>
                  ) : (
                    <Pill tone="warning">Unassigned</Pill>
                  ),
              },
              {
                key: "chapters",
                header: "City Desks",
                cell: (r) => (
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {r.chapters && r.chapters.length > 0 ? (
                      r.chapters.map((c) => (
                        <span key={c._id} className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                          {c.city || c.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No Chapter Admin yet</span>
                    )}
                  </div>
                ),
              },
              {
                key: "status",
                header: "Status",
                cell: (r) => (
                  <Pill tone={r.hasAdmin ? "success" : "gray"}>
                    {r.hasAdmin ? "Active Admin" : "Needs Admin"}
                  </Pill>
                ),
              },
              {
                key: "actions",
                header: "",
                cell: (r) =>
                  isSuperAdmin ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenAllocate(r.state)}>
                          {r.hasAdmin ? "Reallocate State Admin" : "Allocate State Admin"}
                        </DropdownMenuItem>
                        {r.hasAdmin && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50"
                              onClick={() => handleRemoveAdmin(r.state)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Revoke State Admin
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null,
              },
            ]}
          />
        </Panel>
      </div>

      {/* Allocate State Admin Dialog */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Allocate State Admin</DialogTitle>
            <DialogDescription>
              Assign a State Admin for a state. They will have exclusive executive authority to appoint Chapter Admins for cities in that state.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignAdmin} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="st-name">State / Region Name *</Label>
              <Input
                id="st-name"
                required
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                placeholder="e.g. Maharashtra"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="st-admin-name">State Admin Full Name *</Label>
              <Input
                id="st-admin-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Ramesh Patil"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="st-email">Admin Email Address *</Label>
              <Input
                id="st-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="e.g. ramesh.patil@rifah.org"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="st-phone">Phone Number (Optional)</Label>
              <Input
                id="st-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="e.g. +91 98200 12345"
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {submitting ? "Allocating..." : "Allocate & Send Credentials"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export default AdminStates;
