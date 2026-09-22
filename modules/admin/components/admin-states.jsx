"use client";
import Link from "next/link";
import { useState } from "react";
import { MapPin, Plus, Users, Loader2, ShieldCheck, Mail, MoreHorizontal, UserCheck, Trash2, Building2, Edit2, Eye, Check, ChevronsUpDown, X } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { PhoneInput } from "@shared/components/ui/phone-input";
import { Label } from "@shared/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@shared/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@shared/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@shared/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@shared/components/ui/command";
import { cn } from "@shared/lib/utils";
import { Checkbox } from "@shared/components/ui/checkbox";
import { useStates, useBusinesses } from "@shared/hooks/use-rifah-api";
import { stateApi } from "@shared/lib/api-services";
import { useAuth } from "@shared/providers/auth-provider";

export function AdminStates() {
  const { user } = useAuth();
  const isCentralAdmin = user?.role === "central_admin";
  const { data: statesData, refetch, isLoading } = useStates();
  const states = Array.isArray(statesData) ? statesData : [];

  const { data: businessesData } = useBusinesses({ limit: 150 });
  const rawBusinesses = Array.isArray(businessesData)
    ? businessesData
    : (businessesData?.businesses || businessesData?.data || []);

  const eligibleBusinesses = rawBusinesses.filter(b => b.owner);

  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [targetState, setTargetState] = useState("");
  const [stateToDelete, setStateToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [openCombobox, setOpenCombobox] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    imageFile: null,
    useAdminContact: false,
  });

  const stateBizList = eligibleBusinesses.filter(
    (b) => targetState && String(b.state || "").toLowerCase().trim() === targetState.toLowerCase().trim()
  );
  const otherBizList = eligibleBusinesses.filter(
    (b) => !(targetState && String(b.state || "").toLowerCase().trim() === targetState.toLowerCase().trim())
  );

  const handleSelectBusinessOwner = (bizId) => {
    setSelectedBusinessId(bizId);
    const biz = rawBusinesses.find((b) => String(b._id) === String(bizId));
    if (biz) {
      setForm((f) => ({
        ...f,
        email: biz.owner?.email || biz.ownerEmail || biz.email || "",
        phone: biz.owner?.phone || biz.phone || "",
        useAdminContact: true,
      }));
    }
  };

  // Edit State Modal
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ oldState: "", newState: "" });
  const [editSubmitting, setEditSubmitting] = useState(false);

  const totalStates = states.length;
  const statesWithAdmin = states.filter((s) => s.hasAdmin).length;
  const totalChapters = states.reduce((sum, s) => sum + (s.chaptersCount || 0), 0);
  const totalBusinesses = states.reduce((sum, s) => sum + (s.totalBusinesses || 0), 0);

  const handleOpenAddState = (prefillState = "") => {
    setTargetState(prefillState);
    setSelectedBusinessId("");
    setForm({ name: prefillState || "", email: "", phone: "", address: "", imageFile: null, useAdminContact: false });
    setOpenModal(true);
  };

  const handleOpenAllocate = (prefillState = "") => {
    handleOpenAddState(prefillState);
  };

  const handleAddState = async (e) => {
    e.preventDefault();
    if (!form.name) {
      toast.error("State Name is required.");
      return;
    }
    if (!form.phone || !form.phone.trim()) {
      toast.error("Contact phone number is mandatory.");
      return;
    }
    setSubmitting(true);
    try {
      let imageUrl = "";
      if (form.imageFile) {
        const uploadRes = await stateApi.uploadStateCover(form.imageFile);
        imageUrl = uploadRes.data?.url || uploadRes.url || "";
      }

      await stateApi.createState({
        name: form.name,
        businessId: selectedBusinessId || undefined,
        address: form.address,
        image: imageUrl,
        contactEmail: form.email,
        contactPhone: form.phone,
      });

      toast.success(selectedBusinessId ? `State ${form.name} created and Admin allocated!` : `State ${form.name} created successfully!`);
      setOpenModal(false);
      setTargetState("");
      setSelectedBusinessId("");
      setForm({ name: "", email: "", phone: "", address: "", imageFile: null, useAdminContact: false });
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to add State.");
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

  const handleDeleteState = async () => {
    if (!stateToDelete) return;
    setIsDeleting(true);
    try {
      await stateApi.deleteState(stateToDelete);
      toast.success(`State ${stateToDelete} deleted successfully`);
      setStateToDelete(null);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to delete State.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRenameState = async (e) => {
    e.preventDefault();
    if (!editForm.newState) {
      toast.error("New state name is required");
      return;
    }
    setEditSubmitting(true);
    try {
      await stateApi.renameState(editForm.oldState, editForm.newState);
      toast.success(`State renamed to ${editForm.newState}`);
      setOpenEditModal(false);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to rename State.");
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <AppShell
      role="admin"
      title="States & Regional Leadership"
      subtitle="National structure: Central Admin allocates State Admins to manage Chapter Admins"
      actions={
        isCentralAdmin ? (
          <Button onClick={() => handleOpenAddState()} className="gap-2">
            <Plus className="h-4 w-4" /> Add State
          </Button>
        ) : null
      }
    >
      <div className="space-y-6">
        {/* Delegation Architecture Info Banner */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900 shadow-xs dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200">
          <p className="font-semibold text-sm">3-Tier Geographic Delegation System</p>
          <p className="mt-1 text-blue-800/90 dark:text-blue-300">
            As Central Admin, you assign <strong>State Admins</strong> to oversee states. The State Admin for that state then holds the exclusive authority to assign and manage <strong>Chapter Admins</strong> for individual cities (e.g., Mumbai, Pune, Nagpur).
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
                  isCentralAdmin ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/states/${r.state}`}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenAllocate(r.state)}>
                          {r.hasAdmin ? "Reallocate State Admin" : "Allocate State Admin"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setEditForm({ oldState: r.state, newState: r.state });
                          setOpenEditModal(true);
                        }}>
                          <Edit2 className="mr-2 h-4 w-4" /> Edit State Name
                        </DropdownMenuItem>
                        {r.hasAdmin && (
                          <DropdownMenuItem
                            className="text-orange-600 focus:bg-orange-50 dark:focus:bg-orange-950/50"
                            onClick={() => handleRemoveAdmin(r.state)}
                          >
                            <UserCheck className="mr-2 h-4 w-4" /> Revoke State Admin
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50"
                          onClick={() => setStateToDelete(r.state)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete State
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null,
              },
            ]}
          />
        </Panel>
      </div>

      {/* Add State Dialog */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add State</DialogTitle>
            <DialogDescription>
              Create a new state profile and optionally assign a State Admin from the registered business owners list.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddState} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="st-name">State Name *</Label>
              <Input
                id="st-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Maharashtra"
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="st-biz-select">Select Business Owner (Optional)</Label>
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-full justify-between font-normal h-11"
                    id="st-biz-select"
                  >
                    {selectedBusinessId
                      ? (() => {
                          const b = eligibleBusinesses.find((bz) => bz._id === selectedBusinessId);
                          if (!b) return "Choose a business owner...";
                          const oName = b.owner?.name || b.contactPerson || b.name;
                          return `${oName} (${b.name})`;
                        })()
                      : "Choose a business owner..."}
                    <div className="flex items-center gap-1 border-l pl-2 border-border/50">
                      {selectedBusinessId ? (
                        <div 
                          role="button" 
                          tabIndex={0} 
                          className="flex items-center justify-center p-0.5 hover:bg-muted/80 rounded-md transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedBusinessId("");
                            setForm((f) => ({ ...f, email: "", phone: "", useAdminContact: false }));
                          }}
                        >
                          <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </div>
                      ) : null}
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search by name, business or email..." />
                    <CommandList>
                      <CommandEmpty>No business owner found.</CommandEmpty>
                      {stateBizList.length > 0 && (
                        <CommandGroup heading={`${targetState} Owners`}>
                          {stateBizList.map((b) => {
                            const oName = b.owner?.name || b.contactPerson || b.name;
                            const oEmail = b.owner?.email || b.ownerEmail || b.email || "No email";
                            return (
                              <CommandItem
                                key={b._id}
                                value={`${oName} ${b.name} ${oEmail} ${b._id}`}
                                onSelect={() => {
                                  handleSelectBusinessOwner(b._id);
                                  setOpenCombobox(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedBusinessId === b._id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col text-left py-0.5">
                                  <span className="font-medium text-xs text-foreground">{oName} ({b.name})</span>
                                  <span className="text-[11px] text-muted-foreground">{oEmail}</span>
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      )}
                      {otherBizList.length > 0 && (
                        <CommandGroup heading={stateBizList.length > 0 ? "Other Businesses" : "Registered Business Owners"}>
                          {otherBizList.map((b) => {
                            const oName = b.owner?.name || b.contactPerson || b.name;
                            const oEmail = b.owner?.email || b.ownerEmail || b.email || "No email";
                            return (
                              <CommandItem
                                key={b._id}
                                value={`${oName} ${b.name} ${oEmail} ${b.state || ""} ${b._id}`}
                                onSelect={() => {
                                  handleSelectBusinessOwner(b._id);
                                  setOpenCombobox(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedBusinessId === b._id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col text-left py-0.5">
                                  <span className="font-medium text-xs text-foreground">{oName} ({b.name})</span>
                                  <span className="text-[11px] text-muted-foreground">
                                    {b.state ? `${b.state} · ` : ""}{oEmail}
                                  </span>
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {selectedBusinessId && (
              <div className="flex items-start space-x-3 rounded-lg border border-border bg-muted/30 p-3">
                <Checkbox 
                  id="use-admin-contact" 
                  checked={form.useAdminContact}
                  onCheckedChange={(checked) => setForm({ ...form, useAdminContact: checked })}
                  className="mt-0.5"
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="use-admin-contact" className="text-sm font-medium leading-none cursor-pointer">
                    Use Admin's contact details for "Our Presence" landing page
                  </Label>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    If unchecked, you can manually enter a different email and phone number below.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="st-email">Contact Email</Label>
                <Input
                  id="st-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. hello@state.com"
                  disabled={selectedBusinessId && form.useAdminContact}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="st-phone">Contact Phone *</Label>
                <PhoneInput
                  id="st-phone"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="98765 43210"
                  disabled={selectedBusinessId && form.useAdminContact}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="st-image">State Cover Image</Label>
              <Input
                id="st-image"
                type="file"
                accept="image/*"
                onChange={(e) => setForm({ ...form, imageFile: e.target.files[0] })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="st-address">Office Address</Label>
              <Input
                id="st-address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="e.g. 123 Main St, Mumbai"
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {submitting ? "Saving..." : "Add State"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit State Name Dialog */}
      <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit State Name</DialogTitle>
            <DialogDescription>
              Rename this state across all Chapters, Members, and Businesses.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRenameState} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="new-st-name">State / Region Name *</Label>
              <Input
                id="new-st-name"
                required
                value={editForm.newState}
                onChange={(e) => setEditForm({ ...editForm, newState: e.target.value })}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpenEditModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editSubmitting}>
                {editSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Delete State Alert Dialog */}
      <AlertDialog open={!!stateToDelete} onOpenChange={(open) => !open && setStateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete {stateToDelete}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the state and safely detach all its Chapters, Members, Roles, and Businesses, moving them to 'Unassigned'.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDeleteState();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete State"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

export default AdminStates;
