"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, ShieldCheck, X, MapPin, Building2, User } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Card, CardContent } from "@shared/components/ui/card";
import { roleApi, userApi, stateApi, chapterApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/media";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@shared/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";

const LEADER_ROLES = [
  "Chairman",
  "Co-Founder",
  "President",
  "Vice President",
  "Secretary",
  "Joint Secretary",
  "Treasurer",
  "Director",
  "Executive Member",
  "Board Member",
  "Advisor",
  "Other"
];

function RoleCard({ role, onEdit, onDelete }) {
  const avatarUrl = role.userId?.avatar ? resolveMediaUrl(role.userId.avatar) : null;
  const isInactive = role.status === "Inactive";

  const getLevelBadge = (level) => {
    switch (level) {
      case "Central":
        return <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider border border-amber-200 shadow-sm">Central</span>;
      case "State":
        return <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider border border-blue-200 shadow-sm">State</span>;
      case "Chapter":
        return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-200 shadow-sm">Chapter</span>;
      default:
        return null;
    }
  };

  return (
    <div className={`group relative flex flex-col rounded-2xl border ${isInactive ? "bg-muted/40 border-border/50" : "bg-card border-border shadow-sm hover:shadow-xl hover:-translate-y-1"} transition-all duration-300 overflow-hidden`}>
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-background/80 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-border">
        <Button variant="ghost" size="icon" onClick={() => onEdit(role)} className="h-7 w-7 text-muted-foreground hover:text-primary">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(role)} className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="p-6 flex-1 flex flex-col items-center text-center">
        <div className="relative mb-5">
          {avatarUrl ? (
            <img src={avatarUrl} alt={role.userId?.name} className="h-20 w-20 rounded-full object-cover shrink-0 border-4 border-background shadow-md bg-muted" />
          ) : (
            <div className="h-20 w-20 rounded-full shrink-0 bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl border-4 border-background shadow-md">
              {role.userId?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}
          <div className="absolute -bottom-3 inset-x-0 flex justify-center z-10">
             {getLevelBadge(role.level)}
          </div>
        </div>
        
        <h3 className="font-bold text-foreground text-lg truncate w-full mt-2">{role.userId?.name}</h3>
        <p className="text-[13px] font-bold text-primary mt-1 px-3 py-1 bg-primary/5 rounded-full border border-primary/10">{role.role}</p>

        {role.level === "State" && role.state && (
          <div className="flex items-center text-xs text-muted-foreground mt-3 font-medium bg-muted/50 px-2.5 py-1 rounded-md border border-border/50">
            <MapPin className="h-3 w-3 mr-1" /> {role.state}
          </div>
        )}
        {role.level === "Chapter" && role.chapterId && (
          <div className="flex items-center text-xs text-muted-foreground mt-3 font-medium bg-muted/50 px-2.5 py-1 rounded-md border border-border/50">
            <MapPin className="h-3 w-3 mr-1" /> {role.chapterId.name || "Chapter"}
          </div>
        )}

        {(role.businessId?.name || role.userId?.organization) && (
          <div className="flex items-center justify-center text-xs text-muted-foreground mt-auto pt-5 max-w-full truncate">
            <Building2 className="h-3.5 w-3.5 mr-1.5 shrink-0 opacity-70" />
            <span className="truncate">{role.businessId?.name || role.userId?.organization}</span>
          </div>
        )}
      </div>

      {isInactive && (
        <div className="absolute top-3 left-3 z-10">
           <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wide border border-slate-200">Inactive</span>
        </div>
      )}
    </div>
  );
}

function AddEditRoleModal({ isOpen, onClose, roleToEdit }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  
  const [formData, setFormData] = useState({
    role: "President",
    status: "Active",
    displayOrder: 0,
    level: "Central",
    state: "",
    chapterId: ""
  });

  // Fetch users for search
  const { data: usersData, isLoading: searchingUsers } = useQuery({
    queryKey: ["users-search", search, userRoleFilter],
    queryFn: () => {
      let roleParam = undefined;
      if (userRoleFilter === "admins") roleParam = "central_admin,state_admin,chapter_admin";
      else if (userRoleFilter === "business_owner") roleParam = "business_owner";
      return userApi.getAdminUsers({ search, limit: 50, role: roleParam });
    },
    enabled: isOpen && step === 1,
  });

  // Fetch states and chapters for dropdowns
  const { data: statesRes } = useQuery({
    queryKey: ["admin-states"],
    queryFn: () => stateApi.list(),
    enabled: isOpen && formData.level === "State",
  });
  const states = statesRes?.data || [];

  const { data: chaptersRes } = useQuery({
    queryKey: ["admin-chapters"],
    queryFn: () => chapterApi.list(),
    enabled: isOpen && formData.level === "Chapter",
  });
  const chapters = chaptersRes?.data || [];

  const isEditing = !!roleToEdit;

  const mutation = useMutation({
    mutationFn: (data) => isEditing ? roleApi.update(roleToEdit._id, data) : roleApi.create(data),
    onSuccess: () => {
      toast.success(isEditing ? "Role updated successfully" : "Role assigned successfully");
      queryClient.invalidateQueries(["admin-leaders"]);
      handleClose();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to save role assignment");
    }
  });

  // Setup form when editing
  
  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        setSelectedUser(roleToEdit.userId);
        setFormData({
          role: roleToEdit.role,
          status: roleToEdit.status,
          displayOrder: roleToEdit.displayOrder || 0,
          level: roleToEdit.level || "Central",
          state: roleToEdit.state || "",
          chapterId: roleToEdit.chapterId?._id || roleToEdit.chapterId || ""
        });
        setStep(2);
      } else {
        setStep(1);
        setSearch("");
        setSelectedUser(null);
        setFormData({ role: "President", status: "Active", displayOrder: 0, level: "Central", state: "", chapterId: "" });
      }
    }
  }, [isOpen, isEditing, roleToEdit]);

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    // Validation
    if (formData.level === "State" && !formData.state) {
      return toast.error("Please select a State");
    }
    if (formData.level === "Chapter" && !formData.chapterId) {
      return toast.error("Please select a Chapter");
    }

    const payload = {
      userId: selectedUser._id,
      businessId: selectedUser._id === roleToEdit?.userId?._id 
        ? (roleToEdit?.businessId?._id || roleToEdit?.businessId || null)
        : (selectedUser.savedBusinesses?.[0] || null),
      role: formData.role,
      status: formData.status,
      displayOrder: formData.displayOrder,
      level: formData.level,
      state: formData.level === "State" ? formData.state : null,
      chapterId: formData.level === "Chapter" ? formData.chapterId : null,
    };

    mutation.mutate(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{isEditing ? "Edit Leadership Role" : "Assign Leadership Role"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the hierarchy, role or status of this leader." : "Search for a user and assign them a leadership role at the Central, State, or Chapter level."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 py-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search user by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                <SelectTrigger className="w-[140px] shrink-0">
                  <SelectValue placeholder="Filter Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="admins">Admins Only</SelectItem>
                  <SelectItem value="business_owner">Business Owners</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="border rounded-xl max-h-[350px] overflow-y-auto bg-muted/10">
              {searchingUsers ? (
                <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center">
                   <ShieldCheck className="h-8 w-8 mb-2 opacity-20 animate-pulse" />
                   Loading users...
                </div>
              ) : usersData?.data?.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">No users found</div>
              ) : usersData?.data?.map(u => (
                <div 
                  key={u._id} 
                  className="p-3 border-b last:border-0 hover:bg-muted/50 cursor-pointer flex items-center gap-3 transition-colors"
                  onClick={() => {
                    setSelectedUser(u);
                    setStep(2);
                  }}
                >
                  {u.avatar ? (
                    <img src={resolveMediaUrl(u.avatar)} alt="" className="h-10 w-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                      {u.name?.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && selectedUser && (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="flex items-center gap-3 p-4 bg-muted/40 rounded-xl border border-border shadow-sm">
               {selectedUser.avatar ? (
                  <img src={resolveMediaUrl(selectedUser.avatar)} alt="" className="h-12 w-12 rounded-full object-cover shrink-0 border-2 border-background shadow-sm" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0 border-2 border-background shadow-sm">
                    {selectedUser.name?.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-bold text-base leading-tight">{selectedUser.name}</p>
                  <p className="text-xs text-muted-foreground font-medium">{selectedUser.organization || selectedUser.email}</p>
                </div>
                <Button type="button" variant="outline" size="sm" className="ml-auto text-xs h-7" onClick={() => setStep(1)}>
                  Change User
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <label className="text-xs font-semibold text-foreground">Hierarchy Level</label>
                <Select value={formData.level} onValueChange={(val) => setFormData({...formData, level: val, state: "", chapterId: ""})}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Central">Central (National)</SelectItem>
                    <SelectItem value="State">State Level</SelectItem>
                    <SelectItem value="Chapter">Chapter Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <label className="text-xs font-semibold text-foreground">Role Designation</label>
                <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEADER_ROLES.map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.level === "State" && (
                <div className="space-y-2 col-span-2">
                  <label className="text-xs font-semibold text-foreground">Select State</label>
                  <Select value={formData.state} onValueChange={(val) => setFormData({...formData, state: val})}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map(s => (
                        <SelectItem key={s._id} value={s.name}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.level === "Chapter" && (
                <div className="space-y-2 col-span-2">
                  <label className="text-xs font-semibold text-foreground">Select Chapter</label>
                  <Select value={formData.chapterId} onValueChange={(val) => setFormData({...formData, chapterId: val})}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select Chapter" />
                    </SelectTrigger>
                    <SelectContent>
                      {chapters.map(c => (
                        <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <label className="text-xs font-semibold text-foreground">Status</label>
                <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active (Visible)</SelectItem>
                    <SelectItem value="Inactive">Inactive (Hidden)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <label className="text-xs font-semibold text-foreground">Display Order</label>
                <Input 
                  type="number" 
                  min="0"
                  className="bg-background"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value) || 0})}
                />
                <p className="text-[10px] text-muted-foreground mt-1">Lower numbers appear first</p>
              </div>
            </div>
            
            <DialogFooter className="pt-4 border-t border-border mt-6">
              <Button type="button" variant="ghost" onClick={handleClose} disabled={mutation.isPending}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending} className="px-8">
                {mutation.isPending ? "Saving..." : "Save Role"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function AdminRolesPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalState, setModalState] = useState({ isOpen: false, leader: null });
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, leader: null });

  const queryClient = useQueryClient();

  const queryParams = {
    ...(search && { search }),
    ...(roleFilter !== "all" && { role: roleFilter }),
    ...(levelFilter !== "all" && { level: levelFilter }),
    ...(statusFilter !== "all" && { status: statusFilter }),
    limit: 50
  };

  const { data, isLoading } = useQuery({
    queryKey: ["admin-leaders", queryParams],
    queryFn: () => roleApi.getAll(queryParams),
    keepPreviousData: true
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => roleApi.delete(id),
    onSuccess: () => {
      toast.success("Role removed successfully");
      queryClient.invalidateQueries(["admin-leaders"]);
      setDeleteDialog({ isOpen: false, leader: null });
    },
    onError: (err) => toast.error(err.message || "Failed to remove role")
  });

  const roles = data?.data || data?.roles || data?.leaders || [];

  return (
    <AppShell
      role="admin"
      title="Leadership Roles"
      subtitle="Manage chamber hierarchy and public directory"
      actions={
        <Button onClick={() => setModalState({ isOpen: true, leader: null })} className="gap-2 shrink-0 rounded-xl shadow-sm">
          <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Assign New Role</span>
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="bg-card border border-border p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leaders by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 w-full bg-background border-muted-foreground/20 rounded-xl"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="h-10 w-[140px] bg-background border-muted-foreground/20 rounded-xl shrink-0">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Central">Central</SelectItem>
                <SelectItem value="State">State</SelectItem>
                <SelectItem value="Chapter">Chapter</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="h-10 w-[160px] bg-background border-muted-foreground/20 rounded-xl shrink-0">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {LEADER_ROLES.map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 w-[120px] bg-background border-muted-foreground/20 rounded-xl shrink-0">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[280px] rounded-2xl bg-muted/40 animate-pulse border border-border" />
            ))}
          </div>
        ) : roles.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center bg-card rounded-2xl border border-border shadow-sm">
            <div className="h-16 w-16 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-4 border border-primary/10">
              <ShieldCheck className="h-8 w-8 opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No roles assigned</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-2">Assign members to leadership roles at the Central, State, or Chapter level to build your public directory.</p>
            <Button onClick={() => setModalState({ isOpen: true, leader: null })} variant="default" className="mt-6 rounded-xl shadow-sm px-6">
              Assign First Role
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {roles.map(role => (
              <RoleCard 
                key={role._id} 
                role={role} 
                onEdit={(r) => setModalState({ isOpen: true, leader: r })}
                onDelete={(r) => setDeleteDialog({ isOpen: true, leader: r })}
              />
            ))}
          </div>
        )}
      </div>

      <AddEditRoleModal 
        isOpen={modalState.isOpen} 
        onClose={() => setModalState({ isOpen: false, leader: null })} 
        roleToEdit={modalState.leader} 
      />

      <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => !open && setDeleteDialog({ isOpen: false, leader: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Leadership Assignment</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{deleteDialog.leader?.userId?.name}</strong> from the <strong>{deleteDialog.leader?.role}</strong> role?
              <br/><br/>
              This will only remove their leadership status. Their user/business account will NOT be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 border-t border-border pt-4">
            <Button variant="ghost" onClick={() => setDeleteDialog({ isOpen: false, leader: null })} disabled={deleteMutation.isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate(deleteDialog.leader._id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Removing..." : "Yes, Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
