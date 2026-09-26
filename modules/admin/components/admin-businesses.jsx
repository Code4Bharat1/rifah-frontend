"use client";

import Link from "next/link";
import {
  Building2,
  Search,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Download,
  Filter,
  X,
  Clock,
  MapPin,
  RotateCcw,
  Check,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { MembershipBadge, Pill, VerificationBadge } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@shared/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import { useBusinesses, useStates, useChapters } from "@shared/hooks/use-rifah-api";
import { businessApi } from "@shared/lib/api-services";
import { useAuth } from "@shared/providers/auth-provider";
import { cn } from "@shared/lib/utils";

function formatDate(dateInput) {
  if (!dateInput) return "—";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);
  const dateStr = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${dateStr}, ${timeStr}`;
}

function resolveDisplayChapter(item, availableChapters = []) {
  const cur = (item?.chapter || "").trim();
  if (cur && cur.toLowerCase() !== "unassigned" && cur.toLowerCase() !== "none") {
    return cur;
  }

  const city = (item?.city || "").toLowerCase().trim();
  const state = (item?.state || "").toLowerCase().trim();

  // Try matching available chapters from API
  if (availableChapters.length > 0) {
    if (city) {
      const match = availableChapters.find((c) => {
        const cNorm = c.toLowerCase().replace(/\s+chapter$/i, "");
        return city.includes(cNorm) || cNorm.includes(city);
      });
      if (match) return match;
    }
    if (state) {
      const match = availableChapters.find((c) => {
        const cNorm = c.toLowerCase().replace(/\s+chapter$/i, "");
        return state.includes(cNorm) || cNorm.includes(state);
      });
      if (match) return match;
    }
  }

  // Standard city to chapter mapping
  if (
    city.includes("mumbai") ||
    city.includes("bombay") ||
    city.includes("navi mumbai") ||
    city.includes("thane")
  ) {
    return "Mumbai Chapter";
  }
  if (city.includes("pune") || city.includes("poona")) {
    return "Pune Chapter";
  }
  if (city.includes("aurangabad") || city.includes("sambhajinagar")) {
    return "Aurangabad Chapter";
  }
  if (city.includes("chennai") || city.includes("madras")) {
    return "Chennai Chapter";
  }
  if (
    city.includes("delhi") ||
    city.includes("noida") ||
    city.includes("gurgaon") ||
    city.includes("gurugram")
  ) {
    return "Delhi NCR Chapter";
  }
  if (city.includes("bengaluru") || city.includes("bangalore")) {
    return "Bengaluru Chapter";
  }
  if (city.includes("hyderabad")) {
    return "Hyderabad Chapter";
  }
  if (city.includes("nashik")) {
    return "Nashik Chapter";
  }

  // State fallback
  if (state.includes("maharashtra")) return "Mumbai Chapter";
  if (state.includes("tamil")) return "Chennai Chapter";
  if (state.includes("karnataka")) return "Bengaluru Chapter";
  if (state.includes("delhi")) return "Delhi NCR Chapter";
  if (state.includes("telangana")) return "Hyderabad Chapter";

  return availableChapters[0] || "Mumbai Chapter";
}

const VERIFICATION_OPTIONS = [
  { value: "all", label: "All Verification" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const PLAN_OPTIONS = [
  { value: "all", label: "All Plans" },
  { value: "free", label: "Free" },
  { value: "silver", label: "Silver" },
  { value: "gold", label: "Gold" },
  { value: "platinum", label: "Platinum" },
  { value: "diamond", label: "Diamond" },
];

function AdminBusinesses() {
  const { user } = useAuth();
  const basePath =
    user?.role === "chapter_admin"
      ? "/chapter-admin"
      : user?.role === "state_admin"
      ? "/state-admin"
      : "/admin";

  // Filter States
  const [q, setQ] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [chapterFilter, setChapterFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'pending', 'approved', 'rejected'
  const [planFilter, setPlanFilter] = useState("all"); // 'all', 'free', 'silver', 'gold', 'platinum', 'diamond'

  // Status Action Modal State
  const [statusTargetBusiness, setStatusTargetBusiness] = useState(null);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  // States & Chapters for Filter Dropdowns
  const { data: statesData } = useStates();
  const rawStates = Array.isArray(statesData) ? statesData : statesData?.states || [];
  const availableStates = useMemo(() => {
    const list = rawStates
      .map((s) => (typeof s === "string" ? s : s?.state || s?.name))
      .filter(Boolean);
    return Array.from(new Set(list)).sort();
  }, [rawStates]);

  const { data: chaptersData } = useChapters();
  const rawChapters = Array.isArray(chaptersData) ? chaptersData : chaptersData?.chapters || [];
  const availableChapters = useMemo(() => {
    const list = rawChapters
      .map((c) => (typeof c === "string" ? c : c?.name || c?.chapter))
      .filter(Boolean);
    return Array.from(new Set(list)).sort();
  }, [rawChapters]);

  // Query businesses with FIFO sorting & filters
  const {
    data: businessesData,
    isLoading,
    refetch,
  } = useBusinesses({
    search: q.trim() || undefined,
    state: stateFilter === "all" ? undefined : stateFilter,
    chapter: chapterFilter === "all" ? undefined : chapterFilter,
    verification: statusFilter === "all" ? undefined : statusFilter,
    membership: planFilter === "all" ? undefined : planFilter,
    sort: "fifo",
    limit: 1000,
    includeRejected: true,
  });

  const rawRows = Array.isArray(businessesData) ? businessesData : [];

  // Filter & sort rows in FIFO order (First In First Out / earliest created first)
  const rows = useMemo(() => {
    let list = [...rawRows];

    // Client-side fallback checks for instant responsiveness
    if (stateFilter !== "all") {
      list = list.filter(
        (b) => (b.state || "").trim().toLowerCase() === stateFilter.trim().toLowerCase()
      );
    }
    if (chapterFilter !== "all") {
      const cleanCh = chapterFilter.replace(/\s+Chapter$/i, "").toLowerCase();
      list = list.filter((b) =>
        (b.chapter || "").toLowerCase().replace(/\s+chapter$/i, "").includes(cleanCh)
      );
    }
    if (statusFilter !== "all") {
      const sf = statusFilter.toLowerCase();
      if (sf === "approved") {
        list = list.filter((b) => {
          const v = (b.verification || "").toLowerCase();
          return v === "verified" || v === "approved" || b.isVerified === true;
        });
      } else if (sf === "pending") {
        list = list.filter((b) => {
          const v = (b.verification || "").toLowerCase();
          return (
            ["pending", "under_review", "unverified", "correction_requested"].includes(v) &&
            !b.isVerified
          );
        });
      } else if (sf === "rejected") {
        list = list.filter((b) => {
          const v = (b.verification || "").toLowerCase();
          const s = (b.status || "").toLowerCase();
          return v === "rejected" || s === "rejected";
        });
      }
    }
    if (planFilter !== "all") {
      list = list.filter(
        (b) => (b.membership || "free").toLowerCase() === planFilter.toLowerCase()
      );
    }
    if (q.trim()) {
      const searchLower = q.trim().toLowerCase();
      list = list.filter(
        (b) =>
          (b.name || "").toLowerCase().includes(searchLower) ||
          (b.membershipId || "").toLowerCase().includes(searchLower) ||
          (b._id || "").toLowerCase().includes(searchLower) ||
          (b.city || "").toLowerCase().includes(searchLower) ||
          (b.state || "").toLowerCase().includes(searchLower) ||
          (b.chapter || "").toLowerCase().includes(searchLower) ||
          (b.contactPerson || "").toLowerCase().includes(searchLower) ||
          (b.email || "").toLowerCase().includes(searchLower) ||
          (b.phone || "").toLowerCase().includes(searchLower)
      );
    }

    // STRICT FIFO Order: Earliest created business first (ascending)
    list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));

    // Map rows with 1-based Sr. No. and derived Membership ID & formatted action date
    return list.map((item, idx) => {
      const resolvedChapter = resolveDisplayChapter(item, availableChapters);
      return {
        ...item,
        srNo: idx + 1,
        chapter: resolvedChapter,
        membershipId:
          item.membershipId ||
          (item._id ? `RIFAH-MEM-${item._id.toString().slice(-6).toUpperCase()}` : "—"),
        lastActionDateFormatted: formatDate(
          item.lastActionDate || item.updatedAt || item.createdAt
        ),
      };
    });
  }, [rawRows, stateFilter, chapterFilter, statusFilter, planFilter, q, availableChapters]);

  const isFiltered =
    q.trim() !== "" ||
    stateFilter !== "all" ||
    chapterFilter !== "all" ||
    statusFilter !== "all" ||
    planFilter !== "all";

  const handleResetFilters = () => {
    setQ("");
    setStateFilter("all");
    setChapterFilter("all");
    setStatusFilter("all");
    setPlanFilter("all");
  };

  const handleConfirmToggleStatus = async () => {
    if (!statusTargetBusiness) return;
    const b = statusTargetBusiness;
    const newStatus = b.status === "active" ? "suspended" : "active";
    try {
      setIsStatusUpdating(true);
      await businessApi.updateStatus(b._id, { status: newStatus });
      toast.success(
        `Business ${newStatus === "active" ? "activated" : "suspended"} successfully`
      );
      setStatusTargetBusiness(null);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to update business status.");
    } finally {
      setIsStatusUpdating(false);
    }
  };

  // Download / Export Directory functionality
  const handleExportDirectory = () => {
    if (!rows.length) {
      toast.error("No businesses available to export.");
      return;
    }

    const headers = [
      "Sr. No.",
      "Membership ID",
      "Business Name",
      "City",
      "State",
      "Chapter",
      "Membership Plan",
      "Verification Status",
      "Business Status",
      "Last Action Performed Date",
      "Contact Person",
      "Phone",
      "Email",
      "Registration Date",
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvLines = [
      headers.join(","),
      ...rows.map((r) =>
        [
          escapeCsv(r.srNo),
          escapeCsv(r.membershipId),
          escapeCsv(r.name),
          escapeCsv(r.city || ""),
          escapeCsv(r.state || ""),
          escapeCsv(r.chapter || ""),
          escapeCsv(r.membership || "Free"),
          escapeCsv(r.verification || "unverified"),
          escapeCsv(r.status || "Active"),
          escapeCsv(r.lastActionDateFormatted),
          escapeCsv(r.contactPerson || ""),
          escapeCsv(r.phone || ""),
          escapeCsv(r.email || ""),
          escapeCsv(r.createdAt ? new Date(r.createdAt).toISOString().split("T")[0] : ""),
        ].join(",")
      ),
    ];

    const csvContent = csvLines.join("\r\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `rifah_member_businesses_fifo_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${rows.length} businesses successfully in FIFO order`);
  };

  return (
    <AppShell
      role="admin"
      title="Member businesses"
      subtitle={
        isFiltered
          ? `Showing ${rows.length} of ${rawRows.length} listed businesses (Filtered)`
          : `${rows.length} listed businesses`
      }
      actions={
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-full flex items-center gap-2 font-medium"
            onClick={handleExportDirectory}
          >
            <Download className="h-4 w-4" />
            Export directory
          </Button>
          {(user?.role === "central_admin" || user?.role === "super_admin") && (
            <Button asChild className="rounded-full bg-blue-600 hover:bg-blue-700">
              <Link href={`${basePath}/businesses/new`}>Add Business</Link>
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {/* Search & Main Select Filters */}
        <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, city, chapter or membership ID..."
              className="h-11 pl-10"
            />
          </div>

          {/* State Filter */}
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {availableStates.map((st) => (
                <SelectItem key={st} value={st}>
                  {st}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Chapter Filter */}
          <Select value={chapterFilter} onValueChange={setChapterFilter}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="All Chapters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chapters</SelectItem>
              {availableChapters.map((ch) => (
                <SelectItem key={ch} value={ch}>
                  {ch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Verification Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              {VERIFICATION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Membership Plan Filter */}
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="All Plans" />
            </SelectTrigger>
            <SelectContent>
              {PLAN_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quick Filter Badges / Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Quick filters:
          </span>

          {/* Status Quick Pills */}
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
              statusFilter === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground hover:bg-muted border-border"
            )}
          >
            All Status
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === "pending" ? "all" : "pending")}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5",
              statusFilter === "pending"
                ? "bg-amber-500 text-white border-amber-600 dark:bg-amber-600"
                : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
            )}
          >
            {statusFilter === "pending" && <Check className="h-3 w-3" />}
            Pending
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === "approved" ? "all" : "approved")}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5",
              statusFilter === "approved"
                ? "bg-emerald-600 text-white border-emerald-700 dark:bg-emerald-600"
                : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
            )}
          >
            {statusFilter === "approved" && <Check className="h-3 w-3" />}
            Approved
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === "rejected" ? "all" : "rejected")}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5",
              statusFilter === "rejected"
                ? "bg-rose-600 text-white border-rose-700 dark:bg-rose-600"
                : "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
            )}
          >
            {statusFilter === "rejected" && <Check className="h-3 w-3" />}
            Rejected
          </button>

          <span className="text-border mx-1">|</span>

          {/* Plan Quick Pills */}
          {["free", "silver", "gold", "platinum", "diamond"].map((tier) => {
            const isSelected = planFilter.toLowerCase() === tier;
            return (
              <button
                key={tier}
                type="button"
                onClick={() => setPlanFilter(isSelected ? "all" : tier)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium border capitalize transition-colors flex items-center gap-1.5",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground hover:bg-muted border-border"
                )}
              >
                {isSelected && <Check className="h-3 w-3" />}
                {tier}
              </button>
            );
          })}

          {/* Clear Filters Button */}
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-7 text-xs text-muted-foreground hover:text-foreground ml-auto flex items-center gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset filters
            </Button>
          )}
        </div>

        {/* Panel with Record Count & FIFO Table */}
        <Panel className="overflow-hidden">
          {/* Record Count Header Bar */}
          <div className="px-4 py-3 border-b border-border flex flex-wrap items-center justify-between gap-3 bg-muted/20">
            <div className="flex items-center gap-2.5 text-sm">
              <span className="font-bold text-foreground">Showing {rows.length}</span>
              <span className="text-muted-foreground">
                {rows.length === 1 ? "business record" : "business records"}
              </span>
              <span className="text-[11px] font-mono font-medium text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                FIFO order
              </span>
              {isFiltered && (
                <span className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-medium">
                  Filtered from {rawRows.length} total
                </span>
              )}
            </div>

            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-8 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <X className="h-3.5 w-3.5" />
                Clear all filters
              </Button>
            )}
          </div>

          <ResponsiveTable
            rows={rows}
            empty={
              <EmptyState
                icon={Building2}
                title="No businesses match"
                description={
                  isFiltered
                    ? "Try adjusting your search criteria or resetting filters."
                    : "No businesses found in directory."
                }
              />
            }
            columns={[
              {
                key: "srNo",
                header: "SR. NO.",
                className: "w-16 text-center",
                cell: (r, i) => (
                  <span className="font-mono text-xs font-semibold text-muted-foreground">
                    {r.srNo || i + 1}
                  </span>
                ),
              },
              {
                key: "membershipId",
                header: "MEMBERSHIP ID",
                cell: (r) => (
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground border border-border whitespace-nowrap">
                    {r.membershipId}
                  </span>
                ),
              },
              {
                key: "name",
                header: "BUSINESS",
                cell: (r) => (
                  <div className="min-w-[180px]">
                    <span className="font-semibold text-sm text-foreground block">{r.name}</span>
                    {r.contactPerson && (
                      <span className="text-xs text-muted-foreground">{r.contactPerson}</span>
                    )}
                  </div>
                ),
              },
              {
                key: "city",
                header: "LOCATION",
                cell: (r) => (
                  <span className="text-sm">
                    {r.city || "—"}
                    {r.state ? `, ${r.state}` : ""}
                  </span>
                ),
              },
              {
                key: "chapter",
                header: "CHAPTER",
                cell: (r) => <span className="text-sm font-medium">{r.chapter || "—"}</span>,
              },
              {
                key: "plan",
                header: "PLAN",
                cell: (r) => <MembershipBadge tier={r.membership} />,
              },
              {
                key: "ver",
                header: "VERIFICATION",
                cell: (r) => <VerificationBadge status={r.verification} compact />,
              },
              {
                key: "lastActionDate",
                header: "LAST ACTION DATE",
                cell: (r) => (
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {r.lastActionDateFormatted}
                  </span>
                ),
              },
              {
                key: "act",
                header: "",
                className: "text-right",
                cell: (r) => (
                  <Link
                    href={`${basePath}/businesses/${r._id}`}
                    className="text-sm font-medium text-primary hover:underline whitespace-nowrap"
                  >
                    View
                  </Link>
                ),
              },
            ]}
            mobile={(r, i) => (
              <div className="rounded-xl border border-border p-3.5 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      #{r.srNo || i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{r.name}</p>
                      <p className="text-xs font-mono text-muted-foreground">{r.membershipId}</p>
                    </div>
                  </div>
                  <VerificationBadge status={r.verification} compact />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>
                    {r.city || "—"}
                    {r.state ? `, ${r.state}` : ""}
                  </span>
                  <span>•</span>
                  <Pill>{r.chapter || "No chapter"}</Pill>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/50 text-xs">
                  <div className="flex items-center gap-2">
                    <MembershipBadge tier={r.membership} />
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Last action: {r.lastActionDateFormatted}</span>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap gap-2 pt-1">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`${basePath}/businesses/${r._id}`}>View Details</Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setStatusTargetBusiness(r)}
                  >
                    {r.status === "active" ? "Suspend" : "Activate"}
                  </Button>
                </div>
              </div>
            )}
          />
        </Panel>
      </div>

      {/* Suspend / Activate Confirmation Alert Dialog */}
      <AlertDialog
        open={!!statusTargetBusiness}
        onOpenChange={(open) => !open && setStatusTargetBusiness(null)}
      >
        <AlertDialogContent className="sm:max-w-[440px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-full ${
                  statusTargetBusiness?.status === "active"
                    ? "bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400"
                    : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                }`}
              >
                {statusTargetBusiness?.status === "active" ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
              </div>
              <AlertDialogTitle className="text-lg font-bold">
                {statusTargetBusiness?.status === "active"
                  ? "Suspend Business"
                  : "Activate Business"}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2 text-sm leading-relaxed text-muted-foreground">
              {statusTargetBusiness?.status === "active" ? (
                <>
                  Are you sure you want to suspend{" "}
                  <strong className="text-foreground">
                    {statusTargetBusiness?.name}
                  </strong>
                  ? Once suspended, this business will not be visible to members or
                  publicly listed in the directory.
                </>
              ) : (
                <>
                  Are you sure you want to activate{" "}
                  <strong className="text-foreground">
                    {statusTargetBusiness?.name}
                  </strong>
                  ? Once activated, this business will be restored and listed publicly in
                  the directory.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel
              disabled={isStatusUpdating}
              onClick={() => setStatusTargetBusiness(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isStatusUpdating}
              onClick={(e) => {
                e.preventDefault();
                handleConfirmToggleStatus();
              }}
              className={
                statusTargetBusiness?.status === "active"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }
            >
              {isStatusUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isStatusUpdating
                ? statusTargetBusiness?.status === "active"
                  ? "Suspending..."
                  : "Activating..."
                : statusTargetBusiness?.status === "active"
                ? "Yes, Suspend"
                : "Yes, Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

export { AdminBusinesses };
export default AdminBusinesses;
