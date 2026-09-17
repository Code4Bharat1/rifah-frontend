"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { 
  ArrowLeft, Building2, MapPin, Users, UserCog, Mail, Briefcase, Phone,
  Loader2, ShieldAlert, KeyRound, CheckCircle2 
} from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Panel, StatCard, ResponsiveTable } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@shared/components/ui/dialog";
import { useStateDetails } from "@shared/hooks/use-rifah-api";
import { stateApi } from "@shared/lib/api-services";
import { useAuth } from "@shared/providers/auth-provider";

export default function AdminStateDetails({ stateName }) {
  const router = useRouter();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";
  const currentRole = isSuperAdmin ? "admin" : "state_admin";
  const backHref = "/admin/states";
  
  const { data, isLoading, refetch } = useStateDetails(stateName);

  const [openAdminModal, setOpenAdminModal] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", phone: "", state: stateName });

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

  const { admin, chapters, chaptersCount, totalBusinesses } = data;

  const handleChangeAdmin = async (e) => {
    e.preventDefault();
    setAdminLoading(true);
    try {
      await stateApi.assignAdmin(newAdmin);
      toast.success("State Admin successfully allocated/updated!");
      setOpenAdminModal(false);
      setNewAdmin({ name: "", email: "", phone: "", state: stateName });
      refetch();
    } catch (error) {
      toast.error(error.message || "Failed to change admin.");
    } finally {
      setAdminLoading(false);
    }
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
            <Panel title="State Admin" className="h-full border-t-4 border-t-blue-500">
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

                    {isSuperAdmin && (
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
                    
                    {isSuperAdmin && (
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

    </AppShell>
  );
}
