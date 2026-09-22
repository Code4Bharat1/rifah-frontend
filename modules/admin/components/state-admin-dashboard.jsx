"use client";
import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  MapPinned,
  Building2,
  Users,
  Plus,
  Loader2,
  ShieldCheck,
  UserPlus,
  Search,
  CheckCircle2,
  CalendarDays,
  FileStack,
  Activity,
  ScrollText,
  ArrowRight,
  MoreHorizontal,
  Eye,
  Edit2,
  UserCheck,
  Trash2,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from "recharts";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { getEventStatus, getEventStatusConfig } from "@shared/lib/event-utils";
import { MoreLink, Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Progress } from "@shared/components/ui/progress";
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
import {
  useChapters,
  useAdminOverview,
  useAllEnquiries,
  useEvents,
  useAuditLogs,
  useBusinesses,
} from "@shared/hooks/use-rifah-api";
import { chapterApi } from "@shared/lib/api-services";
import { useAuth } from "@shared/providers/auth-provider";

export function StateAdminDashboard({ isChaptersOnly = false }) {
  const { user } = useAuth();
  const stateName = user?.state || "State Region";

  const { data: chaptersData, refetch: refetchChapters, isLoading: isChaptersLoading } = useChapters();
  const { data: overviewData } = useAdminOverview();
  const { data: enquiriesData } = useAllEnquiries({ limit: 6 });
  const { data: eventsData } = useEvents({ limit: 5 });
  const { data: auditData } = useAuditLogs({ limit: 4 });

  const chapters = Array.isArray(chaptersData) ? chaptersData : (chaptersData?.chapters || []);
  const kpi = overviewData?.kpi || {};
  const membershipGrowth = overviewData?.membershipGrowth || [];
  const chaptersDist = overviewData?.chaptersDistribution || [];
  const mix = overviewData?.membershipMix || { Basic: 0, Premium: 0, Enterprise: 0 };
  const totalMembers = Object.values(mix).reduce((a, b) => a + b, 0) || 1;

  const enquiries = Array.isArray(enquiriesData)
    ? enquiriesData
    : (enquiriesData?.enquiries || enquiriesData?.data || []);

  const events = Array.isArray(eventsData)
    ? eventsData
    : (eventsData?.events || eventsData?.data || []);

  const auditLogs = Array.isArray(auditData)
    ? auditData
    : (auditData?.logs || auditData?.auditLogs || []);

  // Add Chapter Modal State
  const [openAddChapter, setOpenAddChapter] = useState(false);
  const [creatingChapter, setCreatingChapter] = useState(false);
  const [newChapter, setNewChapter] = useState({
    name: "",
    city: "",
    state: stateName,
    status: "Active",
    businessId: "",
    adminName: "",
    adminEmail: "",
  });

  const { data: businessesData } = useBusinesses({ limit: 150 });
  const rawBusinesses = Array.isArray(businessesData)
    ? businessesData
    : (businessesData?.businesses || businessesData?.data || []);

  const stateBusinesses = rawBusinesses.filter(
    (b) => String(b.state || "").toLowerCase().trim() === String(stateName || "").toLowerCase().trim()
  );
  const otherStateBusinesses = rawBusinesses.filter(
    (b) => String(b.state || "").toLowerCase().trim() !== String(stateName || "").toLowerCase().trim()
  );

  const handleSelectCreateChapterOwner = (bizId) => {
    if (!bizId || bizId === "custom") {
      setNewChapter((prev) => ({
        ...prev,
        businessId: "",
        adminName: "",
        adminEmail: "",
      }));
      return;
    }
    const biz = rawBusinesses.find((b) => String(b._id) === String(bizId));
    if (biz) {
      const ownerName = biz.owner?.name || biz.contactPerson || biz.name || "";
      const ownerEmail = biz.owner?.email || biz.ownerEmail || biz.email || "";
      setNewChapter((prev) => ({
        ...prev,
        businessId: bizId,
        adminName: ownerName,
        adminEmail: ownerEmail,
      }));
    }
  };

  // Assign Chapter Admin Modal State
  const [adminModalChapter, setAdminModalChapter] = useState(null);
  const [assigningAdmin, setAssigningAdmin] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "" });
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const chapterBizList = rawBusinesses.filter((b) => {
    if (!adminModalChapter) return false;
    const bChapter = String(b.chapter || "").toLowerCase().trim();
    const targetChapter = String(adminModalChapter.name || "").toLowerCase().trim();
    const bChapterId = String(b.chapterId || "");
    const targetId = String(adminModalChapter._id || adminModalChapter.id || "");
    return (bChapterId && bChapterId === targetId) || (bChapter && bChapter === targetChapter);
  });

  const otherBizList = rawBusinesses.filter((b) => {
    if (!adminModalChapter) return true;
    const bChapter = String(b.chapter || "").toLowerCase().trim();
    const targetChapter = String(adminModalChapter.name || "").toLowerCase().trim();
    const bChapterId = String(b.chapterId || "");
    const targetId = String(adminModalChapter._id || adminModalChapter.id || "");
    return !((bChapterId && bChapterId === targetId) || (bChapter && bChapter === targetChapter));
  });

  const handleSelectBusinessOwner = (bizId) => {
    setSelectedBusinessId(bizId);
    if (!bizId || bizId === "custom") {
      setNewAdmin({ name: "", email: "" });
      return;
    }
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

  // Chapters distribution list with fallbacks
  const displayedChaptersDist = chaptersDist.length > 0
    ? chaptersDist
    : chapters.slice(0, 6).map((c) => ({
        name: c.name,
        members: c.businessesCount || c.membersCount || 0,
      }));
  const maxDistributionMembers = Math.max(...displayedChaptersDist.map((c) => c.members), 1);

  const handleCreateChapter = async (e) => {
    e.preventDefault();
    if (!newChapter.name || !newChapter.city) {
      toast.error("Chapter Name and City are required");
      return;
    }
    setCreatingChapter(true);
    try {
      await chapterApi.create({
        name: newChapter.name,
        city: newChapter.city,
        state: stateName,
        status: newChapter.status || "Active",
        businessId: newChapter.businessId || undefined,
        adminName: newChapter.adminName || undefined,
        adminEmail: newChapter.adminEmail || undefined,
      });
      toast.success(
        newChapter.businessId || (newChapter.adminName && newChapter.adminEmail)
          ? `Chapter "${newChapter.name}" created and Admin appointed!`
          : `Chapter "${newChapter.name}" created successfully!`
      );
      setOpenAddChapter(false);
      setNewChapter({
        name: "",
        city: "",
        state: stateName,
        status: "Active",
        businessId: "",
        adminName: "",
        adminEmail: "",
      });
      refetchChapters();
    } catch (err) {
      toast.error(err.message || "Failed to create chapter.");
    } finally {
      setCreatingChapter(false);
    }
  };

  const handleAssignChapterAdmin = async (e) => {
    e.preventDefault();
    if (!selectedBusinessId && (!newAdmin.name || !newAdmin.email)) {
      toast.error("Please select a business owner or provide admin name and email");
      return;
    }
    if (!adminModalChapter) return;
    setAssigningAdmin(true);
    try {
      const chapterId = adminModalChapter._id || adminModalChapter.id;
      await chapterApi.assignAdmin(chapterId, {
        businessId: selectedBusinessId && selectedBusinessId !== "custom" ? selectedBusinessId : undefined,
        name: newAdmin.name,
        email: newAdmin.email,
      });
      toast.success(`Chapter Admin appointed for ${adminModalChapter.name}! Invitation sent.`);
      setAdminModalChapter(null);
      setSelectedBusinessId("");
      setNewAdmin({ name: "", email: "" });
      refetchChapters();
    } catch (err) {
      toast.error(err.message || "Failed to assign Chapter Admin.");
    } finally {
      setAssigningAdmin(false);
    }
  };

  // Edit Chapter Modal State
  const [openEditChapterModal, setOpenEditChapterModal] = useState(false);
  const [editChapterForm, setEditChapterForm] = useState({ id: "", name: "", city: "" });
  const [editChapterSubmitting, setEditChapterSubmitting] = useState(false);

  // Revoke Admin State
  const [adminToRevoke, setAdminToRevoke] = useState(null);
  const [isRevokingAdmin, setIsRevokingAdmin] = useState(false);

  // Delete Chapter State
  const [chapterToDelete, setChapterToDelete] = useState(null);
  const [isDeletingChapter, setIsDeletingChapter] = useState(false);

  const handleRenameChapter = async (e) => {
    e.preventDefault();
    if (!editChapterForm.name || !editChapterForm.id) {
      toast.error("Chapter name is required");
      return;
    }
    setEditChapterSubmitting(true);
    try {
      await chapterApi.update(editChapterForm.id, {
        name: editChapterForm.name,
        city: editChapterForm.city || undefined,
      });
      toast.success(`Chapter updated to ${editChapterForm.name}`);
      setOpenEditChapterModal(false);
      refetchChapters();
    } catch (err) {
      toast.error(err.message || "Failed to update chapter.");
    } finally {
      setEditChapterSubmitting(false);
    }
  };

  const handleRevokeChapterAdmin = async () => {
    if (!adminToRevoke) return;
    setIsRevokingAdmin(true);
    try {
      await chapterApi.removeAdmin(adminToRevoke.id);
      toast.success(`Chapter Admin revoked for ${adminToRevoke.name}`);
      setAdminToRevoke(null);
      refetchChapters();
    } catch (err) {
      toast.error(err.message || "Failed to revoke Chapter Admin.");
    } finally {
      setIsRevokingAdmin(false);
    }
  };

  const handleDeleteChapter = async () => {
    if (!chapterToDelete) return;
    setIsDeletingChapter(true);
    try {
      const chapterId = chapterToDelete._id || chapterToDelete.id;
      await chapterApi.deleteChapter(chapterId);
      toast.success(`Chapter ${chapterToDelete.name} deleted successfully`);
      setChapterToDelete(null);
      refetchChapters();
    } catch (err) {
      toast.error(err.message || "Failed to delete chapter.");
    } finally {
      setIsDeletingChapter(false);
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
            You are the appointed State Admin for <strong>{stateName}</strong>. You hold sole executive responsibility for appointing and managing <strong>Chapter Admins</strong> for all municipal desks in your state (such as {chapters.slice(0, 3).map((c) => c.city).filter(Boolean).join(", ") || "city branches"}), launching new chapters, and overseeing regional business growth.
          </p>
        </div>

        {/* Stats Grid - STRICTLY STATE ADMIN SIDEBAR FIELDS */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Member businesses"
            value={String(kpi.totalBusinesses ?? totalBusinesses)}
            hint={`+${membershipGrowth[membershipGrowth.length - 1]?.new || 0} this month`}
            icon={Building2}
            tone="primary"
            href="/state-admin/businesses"
          />
          <StatCard
            label="State chapters"
            value={String(totalChapters)}
            hint={`${activeChapters} active city desks`}
            icon={MapPinned}
            tone="default"
            href="/state-admin/chapters"
          />
          <StatCard
            label="Registered members"
            value={String(kpi.totalUsers || 0)}
            hint="Statewide membership base"
            icon={Users}
            tone="default"
            href="/state-admin/members"
          />
          <StatCard
            label="Regional enquiries"
            value={String(kpi.totalEnquiries ?? enquiries.length)}
            hint={`${enquiries.length} recent leads`}
            icon={FileStack}
            tone="success"
            href="/state-admin/enquiries"
          />
        </div>

        {!isChaptersOnly && (
          <>
            {/* Charts & Distribution Panels Row */}
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              {/* Membership Growth Bar Chart */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                <div className="mb-6">
                  <h3 className="text-lg font-bold tracking-tight">Membership growth</h3>
                  <p className="text-sm text-muted-foreground">
                    Total members and new registrations in {stateName}
                  </p>
                </div>
                <div className="h-[280px] w-full border-b border-border/40 pb-4">
                  {membershipGrowth.length === 0 || membershipGrowth.every((d) => d.total === 0) ? (
                    <div className="flex flex-col h-full items-center justify-center text-muted-foreground">
                      <Activity className="h-8 w-8 mb-2 opacity-20" />
                      <p className="text-sm">No membership growth data recorded yet.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={membershipGrowth} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 13, fill: "#888888" }}
                          dy={10}
                        />
                        <Tooltip
                          cursor={{ fill: "transparent" }}
                          contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                        />
                        <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={60}>
                          {membershipGrowth.map((entry, index) => (
                            <Cell key={`cell-${index}`} className="fill-primary" />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-3 divide-x divide-border/40 text-center">
                  <div>
                    <p className="text-2xl font-bold">
                      {membershipGrowth[membershipGrowth.length - 1]?.new || 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">New registrations</p>
                    <p className="text-[10px] text-green-600 font-medium mt-0.5">↗ Registrations up</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">91%</p>
                    <p className="text-xs text-muted-foreground mt-1">Renewal rate</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {Math.round(((mix.Premium + mix.Enterprise) / totalMembers) * 100) || 0}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Premium share</p>
                  </div>
                </div>
              </div>

              {/* Right Panels: Chapters Distribution & Membership Mix */}
              <div className="space-y-6">
                <Panel title="Chapters Distribution" action={<MoreLink href="/state-admin/chapters" />}>
                  <div className="space-y-5 mt-2">
                    {displayedChaptersDist.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No chapters data available in {stateName}.</p>
                    ) : (
                      displayedChaptersDist.map((c, idx) => {
                        const pct = Math.round((c.members / maxDistributionMembers) * 100);
                        return (
                          <div key={c.name || idx} className="space-y-1.5">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{c.name}</span>
                              <span className="font-semibold">{c.members}</span>
                            </div>
                            <Progress value={pct} className="h-2" />
                          </div>
                        );
                      })
                    )}
                  </div>
                </Panel>

                <Panel title="Membership mix">
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center justify-between bg-primary text-primary-foreground p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-sm font-medium">Enterprise member</span>
                      </div>
                      <span className="text-sm font-bold">{mix.Enterprise}</span>
                    </div>
                    <div className="flex items-center justify-between bg-red-50 text-red-700 p-3 rounded-lg border border-red-100">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        <span className="text-sm font-medium">Premium member</span>
                      </div>
                      <span className="text-sm font-bold">{mix.Premium}</span>
                    </div>
                    <div className="flex items-center justify-between bg-blue-50 text-blue-700 p-3 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">Basic member</span>
                      </div>
                      <span className="text-sm font-bold">{mix.Basic}</span>
                    </div>
                  </div>
                </Panel>
              </div>
            </div>

            {/* Enquiries & Regional Modules Row */}
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              {/* Recent enquiries */}
              <Panel
                title="Recent enquiries"
                description={`Lead flow across ${stateName} chapters`}
                action={<MoreLink href="/state-admin/enquiries" />}
              >
                {enquiries.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">
                    No recent enquiries in {stateName}.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {enquiries.slice(0, 5).map((e, idx) => (
                      <li
                        key={e._id || e.id || idx}
                        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border pb-2.5 last:border-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{e.title || "Buyer Requirement"}</p>
                          <p className="text-xs text-muted-foreground">
                            {e.buyerName || e.requesterName || "Buyer"} · {e.city || e.chapter || stateName} ·{" "}
                            {e.createdAt ? new Date(e.createdAt).toLocaleDateString() : "Recent"}
                          </p>
                        </div>
                        <Pill tone={(e.responses?.length || 0) > 0 ? "success" : "warning"}>
                          {e.responses?.length || 0} resp.
                        </Pill>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>

              {/* Right Column: Chapters & Events */}
              <div className="space-y-6">
                <Panel title="Chapters & Units" action={<MoreLink href="/state-admin/chapters" />}>
                  {chapters.length === 0 ? (
                    <p className="py-4 text-xs text-muted-foreground">No chapters found.</p>
                  ) : (
                    <ul className="space-y-3">
                      {chapters.slice(0, 5).map((c, idx) => (
                        <li key={c._id || c.id || c.name || idx} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.city}, {c.state}</p>
                          </div>
                          <span className="text-xs font-semibold tabular-nums">{c.units?.length || 0} units</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>

                <Panel title="Upcoming Events" action={<MoreLink href="/state-admin/events" />}>
                  {events.length === 0 ? (
                    <p className="py-4 text-xs text-muted-foreground">No scheduled events in {stateName}.</p>
                  ) : (
                    <ul className="space-y-2.5">
                      {events.slice(0, 4).map((evt, idx) => (
                        <li key={evt._id || evt.id || idx} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{evt.title}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {evt.chapter || evt.city || stateName} · {evt.startDate ? new Date(evt.startDate).toLocaleDateString() : "Upcoming"}
                            </p>
                          </div>
                          {(() => {
                            const st = getEventStatus(evt);
                            const cfg = getEventStatusConfig(st);
                            return (
                              <Pill tone={cfg.tone} className={cfg.className}>
                                {cfg.dot && <span className="w-1.5 h-1.5 rounded-full bg-white inline-block mr-1" />}
                                {cfg.label}
                              </Pill>
                            );
                          })()}
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>

                <Panel title="State Audit log" action={<MoreLink href="/state-admin/audit" />}>
                  {auditLogs.length === 0 ? (
                    <p className="py-4 text-xs text-muted-foreground">No recent state audit records.</p>
                  ) : (
                    <ul className="space-y-3">
                      {auditLogs.slice(0, 4).map((a, idx) => (
                        <li key={a._id || a.id || idx} className="min-w-0">
                          <p className="truncate text-sm font-medium">{a.action}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {a.entity} · {a.user?.name || "Admin"}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>
              </div>
            </div>
          </>
        )}

        {/* Chapters & Chapter Admins Management Table */}
        <Panel
          title={isChaptersOnly ? `Chapters in ${stateName}` : `Municipal Chapter Desks in ${stateName}`}
          description="Manage municipal branches and appoint Chapter Admins"
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
            isLoading={isChaptersLoading}
            emptyTitle={`No chapters established in ${stateName} yet`}
            emptyDescription="Click 'Add Chapter' to establish your first municipal branch."
            columns={[
              {
                key: "name",
                header: "Chapter / City",
                cell: (r) => (
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                      {r.name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-foreground">{r.name}</span>
                      <p className="text-xs text-muted-foreground">{r.city}, {r.state}</p>
                    </div>
                  </div>
                ),
              },
              {
                key: "admin",
                header: "Chapter Admin",
                cell: (r) =>
                  r.chapterAdmin ? (
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-medium text-xs text-foreground">
                        <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                        <span>{r.chapterAdmin.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {r.chapterAdmin.email}
                      </p>
                    </div>
                  ) : (
                    <Pill tone="warning">Unassigned</Pill>
                  ),
              },
              {
                key: "units",
                header: "City Desks / Units",
                cell: (r) => (
                  <span className="text-xs text-muted-foreground">
                    {r.units?.length || 0} unit{r.units?.length === 1 ? "" : "s"}
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
                key: "actions",
                header: "",
                cell: (r) => (
                  <div className="flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/state-admin/chapters/${r._id || r.id}`}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setAdminModalChapter(r);
                          setSelectedBusinessId("");
                          setNewAdmin({ name: r.chapterAdmin?.name || "", email: r.chapterAdmin?.email || "" });
                        }}>
                          <UserPlus className="mr-2 h-4 w-4" />
                          {r.hasAdmin || r.chapterAdmin ? "Reallocate Chapter Admin" : "Allocate Chapter Admin"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setEditChapterForm({ id: r._id || r.id, name: r.name, city: r.city || "" });
                          setOpenEditChapterModal(true);
                        }}>
                          <Edit2 className="mr-2 h-4 w-4" /> Edit Chapter Name
                        </DropdownMenuItem>
                        {(r.hasAdmin || r.chapterAdmin) && (
                          <DropdownMenuItem
                            className="text-orange-600 focus:bg-orange-50 dark:focus:bg-orange-950/50"
                            onClick={() => setAdminToRevoke({ id: r._id || r.id, name: r.name, adminName: r.chapterAdmin?.name })}
                          >
                            <UserCheck className="mr-2 h-4 w-4" /> Revoke Chapter Admin
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50"
                          onClick={() => setChapterToDelete(r)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Chapter
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ),
              },
            ]}
          />
        </Panel>
      </div>

      {/* Add Chapter Dialog */}
      <Dialog open={openAddChapter} onOpenChange={setOpenAddChapter}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Establish New Chapter</DialogTitle>
            <DialogDescription>
              Establish a new municipal chapter within your allocated state of {stateName}.
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

            {/* Optional Chapter Admin Section */}
            <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">
                  Appoint Chapter Admin <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
              </div>

              <div className="space-y-1.5">
                <Select
                  value={newChapter.businessId || undefined}
                  onValueChange={handleSelectCreateChapterOwner}
                >
                  <SelectTrigger id="create-biz-owner-select" className="w-full bg-background">
                    <SelectValue placeholder="Choose a registered business owner..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="custom">-- None / Assign Later --</SelectItem>
                    {stateBusinesses.length > 0 && (
                      <SelectGroup>
                        <SelectLabel className="text-xs font-semibold text-primary">
                          {stateName} Business Owners
                        </SelectLabel>
                        {stateBusinesses.map((b) => {
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
                    {otherStateBusinesses.length > 0 && (
                      <SelectGroup>
                        <SelectLabel className="text-xs font-semibold text-muted-foreground">
                          Other Registered Businesses
                        </SelectLabel>
                        {otherStateBusinesses.map((b) => {
                          const oName = b.owner?.name || b.contactPerson || b.name;
                          const oEmail = b.owner?.email || b.ownerEmail || b.email || "No email";
                          return (
                            <SelectItem key={b._id} value={b._id}>
                              <div className="flex flex-col text-left py-0.5">
                                <span className="font-medium text-xs text-foreground">{oName} ({b.name})</span>
                                <span className="text-[11px] text-muted-foreground">
                                  {b.state ? `${b.state} · ` : ""}{oEmail}
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
                  Selecting a business owner will automatically allocate them as Chapter Admin and send login credentials.
                </p>
              </div>

              {newChapter.businessId ? (
                <div className="rounded-lg border border-blue-200 bg-blue-50/70 dark:border-blue-900 dark:bg-blue-950/40 p-2.5 text-xs space-y-1">
                  <p className="font-semibold text-blue-950 dark:text-blue-200">
                    Appointee: {newChapter.adminName}
                  </p>
                  <p className="text-blue-800 dark:text-blue-300">{newChapter.adminEmail}</p>
                  <p className="text-[11px] text-blue-700/80 dark:text-blue-400">
                    Will be granted Chapter Admin access for this chapter upon creation.
                  </p>
                </div>
              ) : null}
            </div>

            <Button type="submit" className="w-full" disabled={creatingChapter}>
              {creatingChapter ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {creatingChapter ? "Establishing..." : "Establish Chapter"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign / Change Chapter Admin Dialog */}
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

            {/* Business Owner Selection Dropdown */}
            <div className="space-y-1.5">
              <Label htmlFor="biz-owner-select">Select Business Owner (Auto-fill)</Label>
              <Select
                value={selectedBusinessId || undefined}
                onValueChange={handleSelectBusinessOwner}
              >
                <SelectTrigger id="biz-owner-select" className="w-full">
                  <SelectValue placeholder="Choose a registered business owner..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="custom">-- Enter details manually --</SelectItem>
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
                Selecting a business owner automatically fetches and populates their full name and email.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adm-name">
                Chapter Admin Full Name {selectedBusinessId && selectedBusinessId !== "custom" ? "(Auto-filled)" : "*"}
              </Label>
              <Input
                id="adm-name"
                required={!selectedBusinessId || selectedBusinessId === "custom"}
                placeholder="e.g. Tariq Farooqi"
                value={newAdmin.name}
                onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="adm-email">
                Admin Email Address {selectedBusinessId && selectedBusinessId !== "custom" ? "(Auto-filled)" : "*"}
              </Label>
              <Input
                id="adm-email"
                type="email"
                required={!selectedBusinessId || selectedBusinessId === "custom"}
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

      {/* Edit Chapter Dialog */}
      <Dialog open={openEditChapterModal} onOpenChange={setOpenEditChapterModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Chapter</DialogTitle>
            <DialogDescription>
              Rename this chapter or update its city desk location.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRenameChapter} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-ch-name">Chapter Name *</Label>
              <Input
                id="edit-ch-name"
                required
                value={editChapterForm.name}
                onChange={(e) => setEditChapterForm({ ...editChapterForm, name: e.target.value })}
                placeholder="e.g. Pune City"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-ch-city">City / Municipal Desk</Label>
              <Input
                id="edit-ch-city"
                value={editChapterForm.city}
                onChange={(e) => setEditChapterForm({ ...editChapterForm, city: e.target.value })}
                placeholder="e.g. Pune"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpenEditChapterModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editChapterSubmitting}>
                {editChapterSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editChapterSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Revoke Chapter Admin Alert Dialog */}
      <AlertDialog open={!!adminToRevoke} onOpenChange={(open) => !open && setAdminToRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Chapter Admin for {adminToRevoke?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke {adminToRevoke?.adminName ? `"${adminToRevoke.adminName}"` : "the Chapter Admin"} from leading this chapter? Their executive access will be removed, and the chapter admin status will return to &apos;Unassigned&apos;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRevokingAdmin}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleRevokeChapterAdmin();
              }}
              disabled={isRevokingAdmin}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isRevokingAdmin ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isRevokingAdmin ? "Revoking..." : "Revoke Admin"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Chapter Alert Dialog */}
      <AlertDialog open={!!chapterToDelete} onOpenChange={(open) => !open && setChapterToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete {chapterToDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the chapter and safely detach its members and businesses, moving them to &apos;Unassigned&apos;. Any appointed Chapter Admin will also have their admin role revoked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingChapter}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteChapter();
              }}
              disabled={isDeletingChapter}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeletingChapter ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isDeletingChapter ? "Deleting..." : "Delete Chapter"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

export default StateAdminDashboard;
