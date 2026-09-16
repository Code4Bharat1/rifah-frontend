"use client";
import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Building2,
  Users,
  Plus,
  Loader2,
  ShieldCheck,
  UserPlus,
  Mail,
  MoreHorizontal,
  CheckCircle2,
  Ticket,
  FileCheck2,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@shared/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@shared/components/ui/dropdown-menu";
import { useChapters } from "@shared/hooks/use-rifah-api";
import { chapterApi } from "@shared/lib/api-services";
import { useAuth } from "@shared/providers/auth-provider";

export function StateAdminDashboard({ isChaptersOnly = false }) {
  const { user } = useAuth();
  const stateName = user?.state || "State Region";

  const { data: chaptersData, refetch, isLoading } = useChapters();
  const chapters = Array.isArray(chaptersData) ? chaptersData : [];

  // Add Chapter Modal State
  const [openAddChapter, setOpenAddChapter] = useState(false);
  const [creatingChapter, setCreatingChapter] = useState(false);
  const [newChapter, setNewChapter] = useState({
    name: "",
    city: "",
    state: stateName,
    status: "Active",
  });

  // Assign Chapter Admin Modal State
  const [adminModalChapter, setAdminModalChapter] = useState(null);
  const [assigningAdmin, setAssigningAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "" });
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const totalChapters = chapters.length;
  const activeChapters = chapters.filter((c) => c.status === "Active").length;
  const totalUnits = chapters.reduce((sum, c) => sum + (c.units?.length || 0), 0);
  const totalBusinesses = chapters.reduce((sum, c) => sum + (c.businessesCount || 0), 0);
  const displayedChapters = statusFilter === "active" ? chapters.filter((c) => c.status === "Active") : chapters;

  const filteredChapters = displayedChapters.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q) ||
      c.lead?.toLowerCase().includes(q)
    );
  });

  const handleCreateChapter = async (e) => {
    e.preventDefault();
    if (!newChapter.name || !newChapter.city) {
      toast.error("Chapter Name and City are required");
      return;
    }
    setCreatingChapter(true);
    try {
      await chapterApi.create({
        ...newChapter,
        state: stateName, // Lock to state admin's state
      });
      toast.success(`Chapter Admin "${newChapter.name}" created successfully!`);
      setOpenAddChapter(false);
      setNewChapter({ name: "", city: "", state: stateName, status: "Active" });
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to create chapter admin.");
    } finally {
      setCreatingChapter(false);
    }
  };

  const handleAssignChapterAdmin = async (e) => {
    e.preventDefault();
    if (!newAdmin.name || !newAdmin.email || !adminModalChapter) {
      toast.error("Admin Name and Email are required");
      return;
    }
    setAssigningAdmin(true);
    try {
      const chapterId = adminModalChapter._id || adminModalChapter.id;
      await chapterApi.assignAdmin(chapterId, newAdmin);
      toast.success(`Chapter Admin appointed for ${adminModalChapter.name}! Invitation sent.`);
      setAdminModalChapter(null);
      setNewAdmin({ name: "", email: "" });
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to assign Chapter Admin.");
    } finally {
      setAssigningAdmin(false);
    }
  };

  return (
    <AppShell
      role="state_admin"
      title={isChaptersOnly ? `${stateName} Chapters` : `${stateName} State Administration`}
      subtitle={
        isChaptersOnly
          ? `City chapters and appointed Chapter Admins across ${stateName}`
          : `State Executive Desk · Appoint chapter admins and oversee regional growth`
      }
    >
      <div className="space-y-6">
        {/* Executive Authority Banner */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-foreground shadow-xs">
          <div className="flex items-center gap-2 font-semibold text-sm text-primary">
            <ShieldCheck className="h-5 w-5" />
            <span>{stateName} Regional Executive Authority</span>
          </div>
          <p className="mt-1 text-muted-foreground">
            You are the appointed State Admin for <strong>{stateName}</strong>. You hold sole executive responsibility for appointing and managing <strong>Chapter Admins</strong> for all city desks in your state (such as Mumbai, Pune, Nagpur), launching new municipal branches, and overseeing regional business growth.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Chapters"
            value={String(totalChapters)}
            icon={MapPin}
            tone="primary"
            active={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
          />
          <StatCard
            label="Active City Desks"
            value={String(activeChapters)}
            icon={CheckCircle2}
            tone="success"
            active={statusFilter === "active"}
            onClick={() => setStatusFilter(statusFilter === "active" ? "all" : "active")}
          />
          <StatCard
            label="Specialised Units"
            value={String(totalUnits)}
            icon={Users}
            href="/chapter-admin/units"
          />
          <StatCard
            label="State Businesses"
            value={String(totalBusinesses)}
            icon={Building2}
            tone="warning"
            href="/chapter-admin/businesses"
          />
        </div>

        {/* Chapters & Chapter Admins Management Table */}
        <Panel
          title={`Chapters in ${stateName}${statusFilter === "active" ? " (Active)" : ""}`}
          action={
            <div className="flex items-center gap-2">
              <div className="relative w-48 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search city or admin..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>
              <Button size="sm" onClick={() => setOpenAddChapter(true)} className="gap-1">
                <Plus className="h-3.5 w-3.5" /> Add Chapter
              </Button>
            </div>
          }
        >
          <ResponsiveTable
            rows={filteredChapters}
            isLoading={isLoading}
            emptyTitle={`No chapters established in ${stateName} yet`}
            emptyDescription="Click 'Add Chapter' to establish your first municipal branch."
            columns={[
              {
                key: "name",
                header: "Chapter",
                cell: (r) => (
                  <div>
                    <span className="font-semibold text-sm text-foreground">{r.name}</span>
                    <p className="text-xs text-muted-foreground">{r.city}, {r.state}</p>
                  </div>
                ),
              },
              {
                key: "lead",
                header: "Chapter Lead",
                cell: (r) => (
                  <div className="text-xs text-foreground font-medium">
                    {r.lead || "Chapter Secretary"}
                  </div>
                ),
              },
              {
                key: "units",
                header: "Active Units",
                cell: (r) => (
                  <span className="text-xs text-muted-foreground">
                    {r.units?.length || 0} units
                  </span>
                ),
              },
              {
                key: "businesses",
                header: "Businesses",
                cell: (r) => (
                  <span className="text-xs font-semibold text-foreground">
                    {r.businessesCount || 0}
                  </span>
                ),
              },
              {
                key: "status",
                header: "Status",
                cell: (r) => (
                  <Pill tone={r.status === "Active" ? "success" : "warning"}>
                    {r.status}
                  </Pill>
                ),
              },
              {
                key: "action",
                header: "",
                cell: (r) => (
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      className="h-8 text-xs gap-1.5"
                      onClick={() => setAdminModalChapter(r)}
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Appoint Chapter Admin
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </Panel>
      </div>

      {/* Add Chapter Dialog */}
      <Dialog open={openAddChapter} onOpenChange={setOpenAddChapter}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Establish New Chapter</DialogTitle>
            <DialogDescription>
              Establish a new city chapter within your allocated state of {stateName}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateChapter} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="city-name">City Name *</Label>
              <Input
                id="city-name"
                required
                placeholder="e.g. Nagpur"
                value={newChapter.city}
                onChange={(e) => {
                  const cityVal = e.target.value;
                  setNewChapter({
                    ...newChapter,
                    city: cityVal,
                    name: cityVal ? `${cityVal} Chapter` : "",
                  });
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ch-name">Official Chapter Name *</Label>
              <Input
                id="ch-name"
                required
                placeholder="e.g. Nagpur Chapter"
                value={newChapter.name}
                onChange={(e) => setNewChapter({ ...newChapter, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ch-state">State / Region</Label>
              <Input
                id="ch-state"
                disabled
                value={stateName}
                className="bg-muted text-muted-foreground"
              />
            </div>
            <Button type="submit" className="w-full" disabled={creatingChapter}>
              {creatingChapter ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {creatingChapter ? "Establishing..." : "Establish Chapter"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign / Change Chapter Admin Dialog */}
      <Dialog open={!!adminModalChapter} onOpenChange={(open) => !open && setAdminModalChapter(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Appoint Chapter Admin</DialogTitle>
            <DialogDescription>
              Appoint an administrator for <strong>{adminModalChapter?.name}</strong> ({adminModalChapter?.city}, {stateName}).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignChapterAdmin} className="space-y-4 pt-2">
            <div className="rounded-lg bg-blue-50/70 p-3 text-xs text-blue-900 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
              <p className="font-semibold mb-1">Appointment Process:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>They will be granted administrative authority for {adminModalChapter?.city}.</li>
                <li>Login credentials will be sent to their email.</li>
                <li>They will manage member KYC and local networking events.</li>
              </ul>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="adm-name">Chapter Admin Full Name *</Label>
              <Input
                id="adm-name"
                required
                placeholder="e.g. Tariq Farooqi"
                value={newAdmin.name}
                onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="adm-email">Admin Email Address *</Label>
              <Input
                id="adm-email"
                type="email"
                required
                placeholder="e.g. tariq@rifah.org"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full" disabled={assigningAdmin}>
              {assigningAdmin ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {assigningAdmin ? "Appointing..." : "Confirm & Appoint Chapter Admin"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export default StateAdminDashboard;
