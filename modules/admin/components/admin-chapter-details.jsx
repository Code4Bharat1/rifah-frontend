"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { 
  ArrowLeft, Building2, MapPin, Users, UserCog, Mail, Briefcase, 
  Loader2, ShieldAlert, KeyRound, CheckCircle2 
} from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Panel, StatCard } from "@shared/components/rifah/ui-bits";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import { useChapterDetails, useBusinesses } from "@shared/hooks/use-rifah-api";
import { chapterApi } from "@shared/lib/api-services";
import { useAuth } from "@shared/providers/auth-provider";

export default function AdminChapterDetails({ chapterId }) {
  const router = useRouter();
  const { user } = useAuth();
  const isChapterAdmin = user?.role === "chapter_admin";
  const isStateAdmin = user?.role === "state_admin";
  const currentRole = isChapterAdmin ? "chapter_admin" : isStateAdmin ? "state_admin" : "admin";
  const backHref = isChapterAdmin ? "/chapter-admin" : isStateAdmin ? "/state-admin/chapters" : "/admin/chapters";
  const businessesHref = isChapterAdmin ? "/chapter-admin/businesses" : isStateAdmin ? "/state-admin/businesses" : "/admin/businesses";
  const membersHref = isChapterAdmin ? "/chapter-admin/members" : isStateAdmin ? "/state-admin/members" : "/admin/users";
  const unitsHref = isChapterAdmin ? "/chapter-admin/units" : isStateAdmin ? "/state-admin/chapters" : "/admin/units";
  const { data, isLoading, refetch } = useChapterDetails(chapterId);
  const { data: businessesData } = useBusinesses({ limit: 150 });

  const [openAdminModal, setOpenAdminModal] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "" });

  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  if (isLoading) {
    return (
      <AppShell role={currentRole} title="Chapter Details">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  if (!data || !data.chapter) {
    return (
      <AppShell role={currentRole} title="Chapter Details">
        <div className="text-center py-20">
          <p className="text-muted-foreground">Chapter not found.</p>
          <Button variant="link" onClick={() => router.push(backHref)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
      </AppShell>
    );
  }

  const { chapter, stats, admin } = data;

  const rawBusinesses = Array.isArray(businessesData)
    ? businessesData
    : (businessesData?.businesses || businessesData?.data || []);

  const isEligibleBusiness = (b) =>
    b.isPaid === true &&
    b.membership &&
    b.membership !== "Free" &&
    ["verified", "Verified", "approved", "Approved"].includes(b.verification);

  const eligibleBusinesses = rawBusinesses.filter(isEligibleBusiness);

  const chapterBizList = eligibleBusinesses.filter((b) => {
    if (!chapter) return false;
    const bChapter = String(b.chapter || "").toLowerCase().trim();
    const targetChapter = String(chapter.name || "").toLowerCase().trim();
    const bChapterId = String(b.chapterId || "");
    const targetId = String(chapter._id || chapter.id || "");
    return (bChapterId && bChapterId === targetId) || (bChapter && bChapter === targetChapter);
  });

  const otherBizList = eligibleBusinesses.filter((b) => {
    if (!chapter) return true;
    const bChapter = String(b.chapter || "").toLowerCase().trim();
    const targetChapter = String(chapter.name || "").toLowerCase().trim();
    const bChapterId = String(b.chapterId || "");
    const targetId = String(chapter._id || chapter.id || "");
    return !((bChapterId && bChapterId === targetId) || (bChapter && bChapter === targetChapter));
  });

  const handleSelectBusinessOwner = (bizId) => {
    setSelectedBusinessId(bizId);
    const biz = rawBusinesses.find((b) => String(b._id) === String(bizId));
    if (biz) {
      const ownerName = biz.owner?.name || biz.contactPerson || biz.name || "";
      const ownerEmail = biz.owner?.email || biz.ownerEmail || biz.email || "";
      setNewAdmin({
        name: ownerName,
        email: ownerEmail,
      });
    }
  };

  const handleChangeAdmin = async (e) => {
    e.preventDefault();
    if (!newAdmin.name?.trim() || !newAdmin.email?.trim()) {
      toast.error("Please provide both admin name and email");
      return;
    }
    setAdminLoading(true);
    try {
      await chapterApi.assignAdmin(chapterId, {
        businessId: selectedBusinessId || undefined,
        name: newAdmin.name.trim(),
        email: newAdmin.email.trim(),
      });
      toast.success(admin ? "Admin role successfully reallocated!" : "Admin successfully appointed!");
      setOpenAdminModal(false);
      setNewAdmin({ name: "", email: "" });
      setSelectedBusinessId("");
      refetch();
    } catch (error) {
      toast.error(error.message || "Failed to change admin.");
    } finally {
      setAdminLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    setStatusLoading(true);
    try {
      const newStatus = chapter.status === "Active" ? "Inactive" : "Active";
      await chapterApi.updateStatus(chapterId, newStatus);
      toast.success(`Chapter has been ${newStatus === "Active" ? "activated" : "deactivated"}.`);
      setOpenStatusModal(false);
      refetch();
    } catch (error) {
      toast.error(error.message || "Failed to update chapter status.");
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <AppShell
      role={currentRole}
      title={chapter.name}
      subtitle={`Regional branch in ${chapter.city}, ${chapter.state}`}
      actions={
        !isChapterAdmin && (
          <Button variant="outline" asChild>
            <Link href={backHref}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>
        )
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
              <h2 className="text-lg font-bold text-foreground">{chapter.name}</h2>
              <p className="text-sm text-muted-foreground">{chapter.address || "No address provided"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Pill tone={chapter.status === "Active" ? "success" : "warning"}>
              {chapter.status}
            </Pill>
            {!isChapterAdmin && (
              <Button
                size="sm"
                variant={chapter.status === "Active" ? "destructive" : "default"}
                onClick={() => setOpenStatusModal(true)}
              >
                {chapter.status === "Active" ? "Deactivate" : "Activate"}
              </Button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            label="Total Businesses" 
            value={stats.businessesCount || 0} 
            icon={Building2} 
            tone="primary" 
            href={businessesHref}
          />
          <StatCard 
            label="Verified Members" 
            value={stats.customersCount || 0} 
            icon={Users} 
            tone="success" 
            href={membersHref}
          />
          <StatCard 
            label="Specialised Units" 
            value={chapter.units?.length || 0} 
            icon={Briefcase} 
            tone="warning" 
            href={unitsHref}
          />
        </div>

        {/* Admin Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel title="Chapter Administration" icon={<ShieldAlert className="h-4 w-4" />}>
            {admin ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold uppercase">
                    {admin.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{admin.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                      <Mail className="mr-1 h-3 w-3" /> {admin.email}
                    </p>
                  </div>
                  <Pill tone="primary">Chapter Admin</Pill>
                </div>
                
                <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs border border-blue-100 flex gap-2 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" />
                  <p>Appointed to manage businesses, units, and operations within this chapter.</p>
                </div>

                {!isChapterAdmin && (
                  <div className="pt-2 border-t border-border">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setSelectedBusinessId("");
                        setNewAdmin({ name: "", email: "" });
                        setOpenAdminModal(true);
                      }}
                    >
                      <KeyRound className="mr-2 h-4 w-4" /> Reallocate Admin
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      This will revoke the current administrator and assign a new user.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <UserCog className="h-10 w-10 text-muted-foreground opacity-20 mx-auto mb-3" />
                <h3 className="font-semibold text-sm">No Chapter Administrator Assigned</h3>
                <p className="text-xs text-muted-foreground mt-1 mb-4 max-w-sm mx-auto">
                  Appoint or reallocate a Chapter Administrator to manage businesses and operations for {chapter.name}.
                </p>
                {!isChapterAdmin && (
                  <Button 
                    onClick={() => {
                      setSelectedBusinessId("");
                      setNewAdmin({ name: "", email: "" });
                      setOpenAdminModal(true);
                    }}
                  >
                    <KeyRound className="mr-2 h-4 w-4" /> Reallocate Admin
                  </Button>
                )}
              </div>
            )}
          </Panel>

          {/* Units Summary (Optional visual filler) */}
          <Panel title="Active Focus Units" icon={<Briefcase className="h-4 w-4" />}>
            {chapter.units && chapter.units.length > 0 ? (
              <div className="space-y-3">
                {chapter.units.map((unit) => (
                  <div key={unit._id} className="flex justify-between items-center p-3 border border-border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{unit.name}</p>
                      <p className="text-xs text-muted-foreground">{unit.focus}</p>
                    </div>
                    <Pill tone={unit.status === "Active" ? "success" : "gray"}>{unit.status}</Pill>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No specialised units created yet.</p>
            )}
          </Panel>
        </div>
      </div>

      {/* Change / Reallocate Admin Dialog */}
      <Dialog 
        open={openAdminModal} 
        onOpenChange={(open) => {
          setOpenAdminModal(open);
          if (!open) {
            setSelectedBusinessId("");
            setNewAdmin({ name: "", email: "" });
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{admin ? "Reallocate Chapter Admin" : "Allocate Chapter Admin"}</DialogTitle>
            <DialogDescription>
              {admin 
                ? `Reallocate administrator for ${chapter.name}. This will revoke access from ${admin.name} and assign a new user.`
                : `Appoint a new administrator for ${chapter.name}. They will receive login credentials by email.`
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleChangeAdmin} className="space-y-4 pt-2">
            {admin && (
              <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-xs border border-amber-200 flex gap-2 items-start dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50">
                <KeyRound className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">What happens next?</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Current admin ({admin.name}) will be downgraded to a regular user.</li>
                    <li>A removal notification email will be sent to them.</li>
                    <li>New admin will receive an email with login credentials.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Business Owner Select (optional shortcut) */}
            {eligibleBusinesses.length > 0 && (
              <div className="space-y-1.5">
                <Label htmlFor="biz-owner-select">Select Business Owner (Optional)</Label>
                <Select
                  value={selectedBusinessId || undefined}
                  onValueChange={handleSelectBusinessOwner}
                >
                  <SelectTrigger id="biz-owner-select" className="w-full">
                    <SelectValue placeholder="Choose a paid & verified owner..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {chapterBizList.length > 0 && (
                      <SelectGroup>
                        <SelectLabel className="text-xs font-semibold text-primary">
                          {chapter.name} Businesses
                        </SelectLabel>
                        {chapterBizList.map((b) => {
                          const oName = b.owner?.name || b.contactPerson || b.name;
                          const oEmail = b.owner?.email || b.ownerEmail || b.email || "No email";
                          return (
                            <SelectItem key={b._id} value={b._id}>
                              <div className="flex flex-col text-left py-0.5">
                                <span className="font-medium text-xs text-foreground">{oName} ({b.name})</span>
                                <span className="text-[11px] text-muted-foreground">{oEmail}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    )}
                    {otherBizList.length > 0 && (
                      <SelectGroup>
                        <SelectLabel className="text-xs font-semibold text-muted-foreground">
                          {chapterBizList.length > 0 ? "Other State Business Owners" : "Registered Business Owners"}
                        </SelectLabel>
                        {otherBizList.map((b) => {
                          const oName = b.owner?.name || b.contactPerson || b.name;
                          const oEmail = b.owner?.email || b.ownerEmail || b.email || "No email";
                          return (
                            <SelectItem key={b._id} value={b._id}>
                              <div className="flex flex-col text-left py-0.5">
                                <span className="font-medium text-xs text-foreground">{oName} ({b.name})</span>
                                <span className="text-[11px] text-muted-foreground">
                                  {b.chapter ? `${b.chapter} · ` : ""}{oEmail}
                                </span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="admin-name">Admin Name *</Label>
              <Input
                id="admin-name"
                placeholder="e.g. Rahul Sharma"
                value={newAdmin.name}
                onChange={(e) => {
                  setSelectedBusinessId("");
                  setNewAdmin({ ...newAdmin, name: e.target.value });
                }}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="admin-email">Admin Email *</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="e.g. rahul@example.com"
                value={newAdmin.email}
                onChange={(e) => {
                  setSelectedBusinessId("");
                  setNewAdmin({ ...newAdmin, email: e.target.value });
                }}
                required
              />
            </div>

            <Button type="submit" className="w-full mt-2" disabled={adminLoading}>
              {adminLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (admin ? "Reallocate Admin" : "Confirm Allocation")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Toggle Status Modal */}
      <Dialog open={openStatusModal} onOpenChange={setOpenStatusModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{chapter.status === "Active" ? "Deactivate Chapter" : "Activate Chapter"}</DialogTitle>
            <DialogDescription>
              {chapter.status === "Active" 
                ? "This will block all logins for customers, businesses, and admins associated with this chapter. Are you sure you want to proceed?" 
                : "This will restore access for all users associated with this chapter. Are you sure?"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setOpenStatusModal(false)} disabled={statusLoading}>
              Cancel
            </Button>
            <Button 
              variant={chapter.status === "Active" ? "destructive" : "default"} 
              onClick={handleToggleStatus} 
              disabled={statusLoading}
            >
              {statusLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {chapter.status === "Active" ? "Confirm Deactivation" : "Confirm Activation"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </AppShell>
  );
}
