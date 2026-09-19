"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { 
  ArrowLeft, Building2, MapPin, Users, UserCog, Mail, Briefcase, Phone,
  Loader2, ShieldAlert, KeyRound, CheckCircle2, Image as ImageIcon, Camera, Pencil, Check, ChevronsUpDown, X
} from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Panel, StatCard, ResponsiveTable } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Checkbox } from "@shared/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@shared/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@shared/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@shared/components/ui/command";
import { cn } from "@shared/lib/utils";
import { useStateDetails, useBusinesses } from "@shared/hooks/use-rifah-api";
import { stateApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/api-client";
import { useAuth } from "@shared/providers/auth-provider";

export default function AdminStateDetails({ stateName }) {
  const router = useRouter();
  const { user } = useAuth();
  const isCentralAdmin = user?.role === "central_admin";
  const currentRole = isCentralAdmin ? "admin" : "state_admin";
  const backHref = "/admin/states";
  
  const { data, isLoading, refetch } = useStateDetails(stateName);

  const [openAdminModal, setOpenAdminModal] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", phone: "", state: stateName });

  const { data: businessesData } = useBusinesses({ limit: 150 });
  const rawBusinesses = Array.isArray(businessesData)
    ? businessesData
    : (businessesData?.businesses || businessesData?.data || []);
  const eligibleBusinesses = rawBusinesses.filter(b => b.owner);

  const [openCombobox, setOpenCombobox] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");

  const handleSelectBusinessOwner = (bizId) => {
    setSelectedBusinessId(bizId);
    const biz = rawBusinesses.find((b) => String(b._id) === String(bizId));
    if (biz) {
      setNewAdmin((prev) => ({
        ...prev,
        name: biz.owner?.name || biz.contactPerson || biz.name || "",
        email: biz.owner?.email || biz.ownerEmail || biz.email || "",
        phone: biz.owner?.phone || biz.phone || "",
      }));
    }
  };

  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileData, setProfileData] = useState({ address: "", email: "", phone: "", useAdminContact: false });
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  if (isLoading) {
    return (
      <AppShell role={currentRole} title="State Details">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  if (!data) {
    return (
      <AppShell role={currentRole} title="State Details">
        <div className="text-center py-20">
          <p className="text-muted-foreground">State not found.</p>
          <Button variant="link" onClick={() => router.push(backHref)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
      </AppShell>
    );
  }
  // API response usually wraps data in { success: true, data: { ... } }
  const payload = data?.data || data;
  const { admin, chapters, chaptersCount, totalBusinesses, profile } = payload || {};
  const handleChangeAdmin = async (e) => {
    e.preventDefault();
    setAdminLoading(true);
    try {
      await stateApi.assignAdmin({
        ...newAdmin,
        businessId: selectedBusinessId || undefined,
        explicitStateName: stateName
      });
      toast.success("State Admin successfully allocated/updated!");
      setOpenAdminModal(false);
      setNewAdmin({ name: "", email: "", phone: "", state: stateName });
      setSelectedBusinessId("");
      refetch();
    } catch (error) {
      toast.error(error.message || "Failed to change admin.");
    } finally {
      setAdminLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      let imageUrl = previewImage;
      if (selectedImageFile) {
        const uploadRes = await stateApi.uploadStateCover(selectedImageFile);
        imageUrl = uploadRes.data.url;
      }
      
      await stateApi.updateStateProfile(stateName, {
        ...profileData,
        image: imageUrl
      });
      
      toast.success("State Profile updated successfully!");
      setOpenProfileModal(false);
      refetch();
    } catch (error) {
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const openEditProfile = () => {
    const isUsingAdminContact = admin && profile?.email === admin.email && profile?.phone === admin.phone;
    setProfileData({
      address: profile?.address || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      useAdminContact: isUsingAdminContact || false
    });
    setPreviewImage(profile?.image || "");
    setSelectedImageFile(null);
    setOpenProfileModal(true);
  };

  return (
    <AppShell
      role={currentRole}
      title={`State: ${stateName}`}
      subtitle={`National structure details for ${stateName}`}
      actions={
        <Button variant="outline" asChild>
          <Link href={backHref}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Status Header */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{stateName}</h2>
              <p className="text-sm text-muted-foreground">State/Territory View</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Pill tone={admin ? "success" : "warning"}>
              {admin ? "Active State Admin" : "Needs Admin"}
            </Pill>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard 
            label="Total City Desks (Chapters)" 
            value={chaptersCount || 0} 
            icon={MapPin} 
            tone="primary" 
          />
          <StatCard 
            label="Total Businesses" 
            value={totalBusinesses || 0} 
            icon={Building2} 
            tone="success" 
          />
        </div>

        {/* Two-Column Layout for Admin & Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content (2/3) - Chapters List */}
          <div className="lg:col-span-2 space-y-6">
            <Panel 
              title="City Desks (Chapters) in this State" 
              subtitle="All registered chapters operating under this state's jurisdiction."
            >
              <ResponsiveTable
                rows={chapters || []}
                columns={[
                  {
                    key: "name",
                    header: "Chapter Name",
                    cell: (r) => (
                      <div>
                        <p className="font-medium">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.city}</p>
                      </div>
                    ),
                  },
                  {
                    key: "admin",
                    header: "Chapter Admin",
                    cell: (r) => (
                      <div>
                        {r.chapterAdmin ? (
                          <>
                            <p className="text-sm">{r.chapterAdmin.name}</p>
                            <p className="text-xs text-muted-foreground">{r.chapterAdmin.email}</p>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Unassigned</span>
                        )}
                      </div>
                    ),
                  },
                  {
                    key: "status",
                    header: "Status",
                    cell: (r) => (
                      <Pill tone={r.status === "Active" ? "success" : "gray"}>
                        {r.status}
                      </Pill>
                    ),
                  },
                ]}
              />
            </Panel>
          </div>

          {/* Sidebar (1/3) - Admin Details */}
          <div className="space-y-6">
            <Panel title="State Profile" className="border-t-4 border-t-primary" action={
              <Button variant="ghost" size="sm" onClick={openEditProfile} className="h-8 text-primary">
                <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
              </Button>
            }>
              <div className="space-y-4">
                <div className="relative w-full aspect-video bg-muted/30 rounded-xl overflow-hidden border border-border">
                  {profile?.image ? (
                    <img src={resolveMediaUrl(profile.image)} alt={stateName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50">
                      <ImageIcon className="h-8 w-8 mb-2" />
                      <span className="text-xs font-medium">No Cover Image</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3 pt-2 text-sm">
                  {profile?.address && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                      <span className="leading-snug text-foreground">{profile.address}</span>
                    </div>
                  )}
                  {profile?.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4 shrink-0 text-primary" />
                      <span className="truncate text-foreground">{profile.email}</span>
                    </div>
                  )}
                  {profile?.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0 text-primary" />
                      <span className="text-foreground">{profile.phone}</span>
                    </div>
                  )}
                  {!profile?.address && !profile?.email && !profile?.phone && (
                    <p className="text-xs text-muted-foreground italic">No profile details added yet.</p>
                  )}
                </div>
              </div>
            </Panel>

            <Panel title="State Admin" className="border-t-4 border-t-blue-500">
              <div className="space-y-6">
                {admin ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                        <UserCog className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{admin.name}</p>
                        <Pill tone="success" className="mt-1">Active</Pill>
                      </div>
                    </div>
                    
                    <div className="space-y-3 pt-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{admin.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{admin.phone || "Not provided"}</span>
                      </div>
                    </div>

                    {isCentralAdmin && (
                      <div className="pt-4 border-t border-border">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            setNewAdmin({ name: "", email: "", phone: "", state: stateName });
                            setOpenAdminModal(true);
                          }}
                        >
                          <KeyRound className="mr-2 h-4 w-4" /> Reallocate Admin
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          This will immediately revoke the current admin and send new credentials.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-4">
                    <div className="mx-auto h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                      <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">No Admin Assigned</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        This state does not have an executive State Admin yet.
                      </p>
                    </div>
                    
                    {isCentralAdmin && (
                      <Button 
                        onClick={() => {
                          setNewAdmin({ name: "", email: "", phone: "", state: stateName });
                          setOpenAdminModal(true);
                        }}
                      >
                        Allocate State Admin
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Panel>
          </div>

        </div>
      </div>

      {/* Admin Allocation Modal */}
      <Dialog open={openAdminModal} onOpenChange={setOpenAdminModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {admin ? "Reallocate State Admin" : "Allocate State Admin"}
            </DialogTitle>
            <DialogDescription>
              Assign a new State Admin for {stateName}. An email with login credentials will be sent automatically.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleChangeAdmin} className="space-y-4 pt-4">
            <div className="space-y-2">
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
                            setNewAdmin((prev) => ({ ...prev, name: "", email: "", phone: "" }));
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
                      <CommandGroup>
                        {eligibleBusinesses.map((b) => {
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
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-name">Full Name *</Label>
              <Input
                id="admin-name"
                placeholder="e.g. Rahul Sharma"
                value={newAdmin.name}
                onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email Address *</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@example.com"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-phone">Phone Number</Label>
              <Input
                id="admin-phone"
                type="tel"
                placeholder="+91..."
                value={newAdmin.phone}
                onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOpenAdminModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={adminLoading}>
                {adminLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {admin ? "Reallocate Admin" : "Allocate Admin"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Modal */}
      <Dialog open={openProfileModal} onOpenChange={setOpenProfileModal}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit State Profile</DialogTitle>
            <DialogDescription>
              Update the official cover image and contact details for {stateName}.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>State Cover Image</Label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-xl hover:bg-muted/30 transition-colors bg-background">
                <div className="space-y-2 text-center w-full relative">
                  {previewImage ? (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden group">
                      <img src={resolveMediaUrl(previewImage)} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button type="button" variant="secondary" size="sm" onClick={() => document.getElementById("profile-image-upload").click()}>
                          <Camera className="w-4 h-4 mr-2" /> Change Image
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center cursor-pointer" onClick={() => document.getElementById("profile-image-upload").click()}>
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                      <div className="flex text-sm text-muted-foreground">
                        <span className="relative font-semibold text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
                          <span>Upload a file</span>
                        </span>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-muted-foreground/70 mt-1">PNG, JPG, WEBP up to 5MB</p>
                    </div>
                  )}
                  <input 
                    id="profile-image-upload" 
                    type="file" 
                    className="sr-only" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setSelectedImageFile(file);
                        setPreviewImage(URL.createObjectURL(file));
                      }
                    }} 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-address">Office Address</Label>
              <Input
                id="profile-address"
                placeholder="e.g. H.No. 42, Block B, Connaught Place, New Delhi"
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
              />
            </div>

            <div className="flex items-start space-x-3 rounded-lg border border-border bg-muted/30 p-3">
              <Checkbox 
                id="profile-use-admin-contact" 
                checked={profileData.useAdminContact}
                onCheckedChange={(checked) => {
                  if (checked && admin) {
                    setProfileData({ ...profileData, useAdminContact: true, email: admin.email || "", phone: admin.phone || "" });
                  } else {
                    setProfileData({ ...profileData, useAdminContact: false, email: "", phone: "" });
                  }
                }}
                disabled={!admin}
              />
              <div className="space-y-1 leading-none">
                <label htmlFor="profile-use-admin-contact" className="text-sm font-medium leading-none cursor-pointer">
                  Use State Admin's Contact Info
                </label>
                <p className="text-[11px] text-muted-foreground">
                  {admin ? "This will automatically use the current State Admin's email and phone." : "No State Admin is currently allocated."}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profile-email">Public Email</Label>
                <Input
                  id="profile-email"
                  type="email"
                  placeholder="contact@delhi.rifah.in"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  disabled={profileData.useAdminContact}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-phone">Public Phone</Label>
                <Input
                  id="profile-phone"
                  type="tel"
                  placeholder="+91..."
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  disabled={profileData.useAdminContact}
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOpenProfileModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={profileLoading}>
                {profileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>


    </AppShell>
  );
}
