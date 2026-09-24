"use client";
import Link from "next/link";
import { MapPin, Plus, Users, Loader2, MoreHorizontal, CheckCircle2, Globe } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@shared/components/ui/dialog";
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
import { useChapters, useBusinesses } from "@shared/hooks/use-rifah-api";
import { chapterApi } from "@shared/lib/api-services";
import { useAuth } from "@shared/providers/auth-provider";
import { isValidName } from "@shared/lib/validators";

function AdminChapters() {
  const { user } = useAuth();
  const isCentralAdmin = user?.role === "central_admin";
  const { data: chaptersData, refetch } = useChapters();
  const chapters = chaptersData || [];

  const [openAdd, setOpenAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adminModalChapter, setAdminModalChapter] = useState(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "" });

  const { data: businessesData } = useBusinesses({ limit: 150 });
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
    if (!adminModalChapter) return false;
    const bChapter = String(b.chapter || "").toLowerCase().trim();
    const targetChapter = String(adminModalChapter.name || "").toLowerCase().trim();
    const bChapterId = String(b.chapterId || "");
    const targetId = String(adminModalChapter._id || adminModalChapter.id || "");
    return (bChapterId && bChapterId === targetId) || (bChapter && bChapter === targetChapter);
  });

  const otherBizList = eligibleBusinesses.filter((b) => {
    if (!adminModalChapter) return true;
    const bChapter = String(b.chapter || "").toLowerCase().trim();
    const targetChapter = String(adminModalChapter.name || "").toLowerCase().trim();
    const bChapterId = String(b.chapterId || "");
    const targetId = String(adminModalChapter._id || adminModalChapter.id || "");
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

  const [newChapter, setNewChapter] = useState({
    name: "",
    city: "",
    state: "Maharashtra",
    status: "Active",
  });

  const totalUnits = chapters.reduce((sum, c) => sum + (c.units?.length || 0), 0);

  const handleCreateChapter = async (e) => {
    e.preventDefault();
    if (!newChapter.name || !newChapter.city) return;
    if (!isValidName(newChapter.name)) {
      toast.error("Enter a valid chapter name (letters only).");
      return;
    }
    setLoading(true);
    try {
      await chapterApi.create(newChapter);
      toast.success("Chapter created successfully");
      setOpenAdd(false);
      setNewChapter({ name: "", city: "", state: "Maharashtra", status: "Active" });
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to create chapter.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await chapterApi.update(id, { status });
      toast.success(`Chapter marked as ${status}`);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to update chapter.");
    }
  };

  const handleAssignAdmin = async (e) => {
    e.preventDefault();
    if (!selectedBusinessId || !adminModalChapter) return;
    setLoading(true);
    try {
      const chapterId = adminModalChapter._id || adminModalChapter.id;
      await chapterApi.assignAdmin(chapterId, { businessId: selectedBusinessId });
      setAdminModalChapter(null);
      setSelectedBusinessId("");
      setNewAdmin({ name: "", email: "" });
      toast.success("Admin assigned successfully. Email invitation sent!");
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to assign admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell
      role="admin"
      title="Chapters and units"
      subtitle="Regional structure and branch desks of RIFAH Chamber"
      actions={
        isCentralAdmin ? (
          <Button onClick={() => setOpenAdd(true)}>
            <Plus className="h-4 w-4" /> New chapter
          </Button>
        ) : null
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Chapters" value={String(chapters.length)} icon={MapPin} tone="primary" />
          <StatCard label="Specialised units" value={String(totalUnits)} icon={Users} />
          <StatCard label="Active Chapters" value={String(chapters.filter((c) => c.status === "Active").length)} icon={CheckCircle2} tone="success" />
          <StatCard label="Regions" value="Pan-India" icon={Globe} tone="warning" />
        </div>

        <Panel title="Regional Chapters">
          <ResponsiveTable
            rows={chapters}
            columns={[
              { key: "name", header: "Chapter", cell: (r) => <span className="font-semibold">{r.name}</span> },
              { key: "loc", header: "Location", cell: (r) => `${r.city}, ${r.state}` },
              { key: "units", header: "Active Units", cell: (r) => r.units?.length || 0 },
              { key: "status", header: "Status", cell: (r) => <Pill tone={r.status === "Active" ? "success" : "warning"}>{r.status}</Pill> },
              {
                key: "act",
                header: "",
                cell: (r) => isCentralAdmin ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/chapters/${r._id || r.id}`}>
                          View Details & Manage Admin
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleUpdateStatus(r._id || r.id, "Active")} disabled={r.status === "Active"}>
                        Mark as Active
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateStatus(r._id || r.id, "Inactive")} disabled={r.status === "Inactive"}>
                        Mark as Inactive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null,
              },
            ]}
            mobile={(r) => (
              <div className="rounded-xl border border-border p-3.5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{r.name}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {r.city}, {r.state}
                    </p>
                  </div>
                  <Pill tone={r.status === "Active" ? "success" : "warning"}>{r.status}</Pill>
                </div>
              </div>
            )}
          />
        </Panel>

        <Panel title="Specialised focus units across chapters">
          <div className="grid gap-3 sm:grid-cols-2">
            {chapters.flatMap((c) => (c.units || []).map((u) => ({ ...u, chapterName: c.name }))).map((u, i) => (
              <div key={i} className="rounded-xl border border-border p-3.5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <p className="min-w-0 truncate text-sm font-semibold">{u.name}</p>
                  <Pill tone={u.status === "Active" ? "success" : "warning"}>{u.status || "Active"}</Pill>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{u.focus}</p>
                <p className="mt-2 text-xs font-medium text-primary">
                  {u.chapterName}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Chamber Chapter</DialogTitle>
            <DialogDescription>Establish a new regional chapter branch.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateChapter} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="ch-name">Chapter Name *</Label>
              <Input
                id="ch-name"
                required
                value={newChapter.name}
                onChange={(e) => setNewChapter({ ...newChapter, name: e.target.value })}
                placeholder="e.g. Pune Chapter"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ch-city">City *</Label>
              <Input
                id="ch-city"
                required
                value={newChapter.city}
                onChange={(e) => setNewChapter({ ...newChapter, city: e.target.value })}
                placeholder="e.g. Pune"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ch-state">State</Label>
              <Input
                id="ch-state"
                value={newChapter.state}
                onChange={(e) => setNewChapter({ ...newChapter, state: e.target.value })}
                placeholder="Maharashtra"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Chapter"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!adminModalChapter}
        onOpenChange={(open) => {
          if (!open) {
            setAdminModalChapter(null);
            setSelectedBusinessId("");
            setNewAdmin({ name: "", email: "" });
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Chapter Admin</DialogTitle>
            <DialogDescription>
              Assign an admin for {adminModalChapter?.name}. Only businesses with an active paid membership and
              verified status are eligible. They will receive an email with their login credentials.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignAdmin} className="space-y-4 py-4">
            {/* Business Owner Select (eligible = paid + verified only) */}
            <div className="space-y-1.5">
              <Label htmlFor="biz-owner-select">Select Business Owner *</Label>
              <Select
                value={selectedBusinessId || undefined}
                onValueChange={handleSelectBusinessOwner}
              >
                <SelectTrigger id="biz-owner-select" className="w-full">
                  <SelectValue placeholder="Choose a paid, verified business owner..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {eligibleBusinesses.length === 0 && (
                    <div className="px-3 py-2 text-xs text-muted-foreground">
                      No paid & verified businesses found yet.
                    </div>
                  )}
                  {chapterBizList.length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="text-xs font-semibold text-primary">
                        {adminModalChapter?.name} Owners
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
              <p className="text-[11px] text-muted-foreground">
                Only businesses with an active paid membership and verified status appear here.
              </p>
            </div>

            {selectedBusinessId && (
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                <p className="font-medium text-foreground">{newAdmin.name}</p>
                <p className="text-xs text-muted-foreground">{newAdmin.email}</p>
              </div>
            )}
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading || !selectedBusinessId}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Send Invitation
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export { AdminChapters };
export default AdminChapters;
