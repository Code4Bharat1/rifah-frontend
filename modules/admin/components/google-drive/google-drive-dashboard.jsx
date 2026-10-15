"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@shared/providers/auth-provider";
import { usePathname } from "next/navigation";
import { googleDriveApi } from "@shared/lib/api-services";
import { toast } from "sonner";
import {
  Folder,
  FolderSync,
  HardDrive,
  ExternalLink,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ShieldCheck,
  Users,
  Building2,
  Wallet,
  CalendarDays,
  FileSpreadsheet,
  Link2,
  Unlink,
  Eye,
  AlertCircle,
  Database,
  Shield,
  FileDown,
} from "lucide-react";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel, StatCard } from "@shared/components/rifah/ui-bits";
import { Pill } from "@shared/components/rifah/badges";
import { Button } from "@shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@shared/components/ui/dialog";

export function GoogleDriveDashboard({ expectedRole }) {
  const { user } = useAuth();
  const pathname = usePathname();

  const effectiveRole =
    expectedRole ||
    (pathname?.startsWith("/chapter-admin")
      ? "chapter_admin"
      : pathname?.startsWith("/state-admin")
      ? "state_admin"
      : user?.role === "chapter_admin"
      ? "chapter_admin"
      : user?.role === "state_admin"
      ? "state_admin"
      : "admin");

  const isCentralAdmin =
    user?.role === "central_admin" ||
    user?.role === "secretariat" ||
    user?.role === "super_admin" ||
    user?.role === "admin";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [syncingTarget, setSyncingTarget] = useState(null);
  const [reconcilingPermissions, setReconcilingPermissions] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [selectedErrorLog, setSelectedErrorLog] = useState(null);
  const [activeTab, setActiveTab] = useState("workbooks");
  const [logFilter, setLogFilter] = useState("all");

  const loadStatus = async () => {
    try {
      setLoading(true);
      const res = await googleDriveApi.getStatus();
      if (res?.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load Google Drive status");
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async (status = "") => {
    try {
      setLogsLoading(true);
      const res = await googleDriveApi.getLogs({
        status: status === "all" ? "" : status,
        limit: 30,
      });
      if (res?.success) {
        setLogs(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load logs:", err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
    loadLogs();
  }, []);

  const handleConnect = async () => {
    try {
      const res = await googleDriveApi.getAuthUrl();
      if (res?.data?.authUrl) {
        window.location.href = res.data.authUrl;
      }
    } catch (err) {
      toast.error(err.message || "Could not generate Google Drive authorization URL");
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect this Google Drive account?")) return;
    try {
      await googleDriveApi.disconnect();
      toast.success("Google Drive disconnected successfully");
      loadStatus();
    } catch (err) {
      toast.error(err.message || "Failed to disconnect account");
    }
  };

  const handleSyncSpreadsheet = async (target) => {
    try {
      setSyncingTarget(target);
      const res = await googleDriveApi.triggerSync(target);
      if (res?.success) {
        toast.success(
          target === "all"
            ? "Full platform synchronization complete!"
            : `Spreadsheet '${target}' synchronized successfully!`
        );
        loadStatus();
        loadLogs(logFilter);
      }
    } catch (err) {
      toast.error(err.message || "Synchronization failed");
    } finally {
      setSyncingTarget(null);
    }
  };

  const handleSyncPermissions = async () => {
    try {
      setReconcilingPermissions(true);
      const res = await googleDriveApi.syncPermissions();
      if (res?.success) {
        toast.success(
          `Admin permissions reconciled! (${res.data?.added?.length || 0} added, ${
            res.data?.removed?.length || 0
          } revoked)`
        );
        loadStatus();
        loadLogs(logFilter);
      }
    } catch (err) {
      toast.error(err.message || "Failed to reconcile admin permissions");
    } finally {
      setReconcilingPermissions(false);
    }
  };

  const handleRetryFailed = async () => {
    try {
      setRetrying(true);
      const res = await googleDriveApi.retryFailed();
      toast.success(`Retried ${res?.data?.length || 0} failed synchronization tasks`);
      loadStatus();
      loadLogs(logFilter);
    } catch (err) {
      toast.error(err.message || "Retry attempt encountered errors");
    } finally {
      setRetrying(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Never";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "Never" : d.toLocaleString();
  };

  const workbooks = [
    {
      key: "businesses",
      title: "Business Information",
      fileName: "RIFAH_Businesses.xlsx",
      icon: Building2,
      accent: "from-blue-600 to-indigo-600",
      description:
        "Master business registry, verification status, categories, GSTIN numbers, contact details, and locations.",
      meta: data?.fileLinks?.businesses || {},
    },
    {
      key: "users",
      title: "User Information",
      fileName: "RIFAH_Users.xlsx",
      icon: Users,
      accent: "from-teal-600 to-emerald-600",
      description:
        "Platform membership roster, administrative assignments, roles, chapters, contact emails, and phone numbers.",
      meta: data?.fileLinks?.users || {},
    },
    {
      key: "revenue_sharing",
      title: "Revenue Sharing Ledger",
      fileName: "RIFAH_Revenue_Sharing.xlsx",
      icon: Wallet,
      accent: "from-emerald-600 to-green-600",
      description:
        "Line-item transaction ledger with exact rupee allocations for Central, State, and Chapter beneficiaries.",
      meta: data?.fileLinks?.revenueSharing || {},
    },
    {
      key: "event_attendees",
      title: "Event Attendees (Grouped)",
      fileName: "RIFAH_Event_Attendees.xlsx",
      icon: CalendarDays,
      accent: "from-indigo-600 to-purple-600",
      description:
        "Complete attendee registrations categorized and grouped by event name with dedicated event tabs.",
      meta: data?.fileLinks?.eventAttendees || {},
    },
  ];

  const pageTitle =
    effectiveRole === "chapter_admin"
      ? "Google Drive Archive"
      : effectiveRole === "state_admin"
      ? "Google Drive Archive"
      : "Google Drive Integration";

  const pageSubtitle =
    effectiveRole === "chapter_admin"
      ? "Chapter administrative archive · Synchronized platform spreadsheets"
      : effectiveRole === "state_admin"
      ? "State administrative archive · Synchronized platform spreadsheets"
      : "Central shared archive · Automated Excel spreadsheet synchronization & access control";

  return (
    <AppShell
      role={effectiveRole}
      title={pageTitle}
      subtitle={pageSubtitle}
      actions={
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadStatus();
              loadLogs(logFilter);
            }}
            disabled={loading}
            className="rounded-full h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm shrink-0 gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {data?.folderWebViewLink && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-full h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm shrink-0 gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
            >
              <a href={data.folderWebViewLink} target="_blank" rel="noopener noreferrer">
                <Folder className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Open Drive Folder</span>
                <span className="sm:hidden">Drive</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            </Button>
          )}

          {isCentralAdmin && (
            <Button
              onClick={() => handleSyncSpreadsheet("all")}
              disabled={syncingTarget === "all"}
              size="sm"
              className="rounded-full gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-8 sm:h-9 px-2.5 sm:px-4 text-xs sm:text-sm shrink-0 shadow-xs"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${syncingTarget === "all" ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">
                {syncingTarget === "all" ? "Syncing..." : "Sync All Workbooks"}
              </span>
              <span className="sm:hidden">Sync All</span>
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Row 1: KPI StatCards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard
            label="Drive Connection"
            value={data?.isConnected ? "Connected" : "Standby Mode"}
            hint={data?.googleEmail ? `Account: ${data.googleEmail}` : "Local cache fallback active"}
            icon={HardDrive}
            tone={data?.isConnected ? "success" : "warning"}
            active={data?.isConnected}
          />
          <StatCard
            label="Synchronized Workbooks"
            value="4 Workbooks"
            hint="Businesses, Users, Revenue, Events"
            icon={FileSpreadsheet}
            tone="primary"
          />
          <StatCard
            label="Authorized Admins"
            value={String(data?.syncedAdminsCount || 0)}
            hint="Role-synced folder permissions"
            icon={ShieldCheck}
            tone="brand"
          />
          <StatCard
            label="Sync Diagnostics"
            value={data?.failedCount > 0 ? `${data.failedCount} Issues` : "100% Synced"}
            hint={
              data?.lastFullSyncAt
                ? `Last full sync: ${new Date(data.lastFullSyncAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "Continuous autosync"
            }
            icon={data?.failedCount > 0 ? AlertTriangle : CheckCircle2}
            tone={data?.failedCount > 0 ? "danger" : "success"}
          />
        </div>

        {/* Row 2: Central Platform Archive Hero Card */}
        <div className="rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs relative overflow-hidden transition-all">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary shadow-xs">
                  <Folder className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                    RIFAH Central Shared Archive
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Platform-wide centralized storage for official Excel spreadsheets with automatic role-based administrator access
                  </p>
                </div>
              </div>

              {/* Status Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {data?.isConnected ? (
                  <Pill tone="success">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Connected to Google Drive
                  </Pill>
                ) : (
                  <Pill tone="warning">
                    <AlertTriangle className="h-3 w-3" />
                    Disconnected / Standby Local Cache
                  </Pill>
                )}

                {data?.googleEmail && (
                  <Pill tone="neutral">Account: {data.googleEmail}</Pill>
                )}

                {data?.syncedAdminsCount !== undefined && (
                  <Pill tone="primary">
                    <ShieldCheck className="h-3 w-3" />
                    {data.syncedAdminsCount} Authorized Admins
                  </Pill>
                )}

                {data?.failedCount > 0 && (
                  <Pill tone="danger">
                    <XCircle className="h-3 w-3" />
                    {data.failedCount} Failed Syncs
                  </Pill>
                )}
              </div>
            </div>

            {/* Central Admin Controls */}
            {isCentralAdmin && (
              <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
                {data?.isConnected ? (
                  <Button
                    onClick={handleDisconnect}
                    variant="outline"
                    size="sm"
                    className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 h-8 sm:h-9 text-xs sm:text-sm"
                  >
                    <Unlink className="mr-1.5 h-3.5 w-3.5" />
                    Disconnect Google Account
                  </Button>
                ) : (
                  <Button
                    onClick={handleConnect}
                    size="sm"
                    className="rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold h-8 sm:h-9 px-4 text-xs sm:text-sm shadow-xs"
                  >
                    <Link2 className="mr-1.5 h-3.5 w-3.5" />
                    Connect Official Google Account
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Directory Details Sub-strip */}
          {data?.folderName && (
            <div className="mt-4 pt-3.5 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">Archive Directory:</span>
                <span className="font-semibold text-primary">{data.folderName}</span>
                {data?.folderWebViewLink && (
                  <a
                    href={data.folderWebViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline font-medium ml-1"
                  >
                    View in Drive <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span>
                  Folder ID:{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground">
                    {data.folderId || "Auto-Provisioned"}
                  </code>
                </span>
                <span>•</span>
                <span>Last full sync: {formatDate(data.lastFullSyncAt)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Row 3: Tabs Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <TabsList className="bg-muted/70 p-1 rounded-xl sm:rounded-2xl border border-border/60 gap-1 w-full sm:w-auto">
              <TabsTrigger
                value="workbooks"
                className="rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs"
              >
                <FileSpreadsheet className="mr-1.5 h-4 w-4 text-primary" />
                Synchronized Workbooks
              </TabsTrigger>
              <TabsTrigger
                value="admins"
                className="rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs"
              >
                <ShieldCheck className="mr-1.5 h-4 w-4 text-brand" />
                Admin Access Roster
                {data?.syncedAdminsCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-primary-soft text-primary px-1.5 py-0.2 text-[10px] font-bold">
                    {data.syncedAdminsCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="logs"
                className="rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs"
              >
                <Clock className="mr-1.5 h-4 w-4 text-muted-foreground" />
                Sync History & Diagnostics
                {data?.failedCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-destructive/15 text-destructive px-1.5 py-0.2 text-[10px] font-bold">
                    {data.failedCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {activeTab === "logs" && (
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                {["all", "success", "failed"].map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setLogFilter(f);
                      loadLogs(f);
                    }}
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition-colors ${
                      logFilter === f
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* TAB 1: WORKBOOKS */}
          <TabsContent value="workbooks" className="space-y-6 focus:outline-none">
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
              {workbooks.map((wb) => {
                const Icon = wb.icon;
                const isSyncing = syncingTarget === wb.key;
                const meta = wb.meta;
                const hasError = meta?.status === "failed";
                const isSynced = meta?.status === "synced";

                return (
                  <div
                    key={wb.key}
                    className="relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs hover:border-primary/40 hover:shadow-md transition-all duration-200"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary shadow-xs">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-foreground">{wb.title}</h3>
                            <p className="text-xs font-mono text-muted-foreground">
                              {wb.fileName}
                            </p>
                          </div>
                        </div>

                        {hasError ? (
                          <Pill tone="danger">
                            <XCircle className="h-3 w-3" />
                            Sync Failed
                          </Pill>
                        ) : isSynced ? (
                          <Pill tone="success">
                            <CheckCircle2 className="h-3 w-3" />
                            Synchronized
                          </Pill>
                        ) : (
                          <Pill tone="neutral">
                            <Clock className="h-3 w-3" />
                            Pending Sync
                          </Pill>
                        )}
                      </div>

                      {/* Description */}
                      <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {wb.description}
                      </p>

                      {/* Mini Stats Grid */}
                      <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-muted/40 p-2.5 text-center border border-border/40">
                        <div>
                          <div className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
                            Records
                          </div>
                          <div className="mt-0.5 text-sm sm:text-base font-bold text-foreground">
                            {meta?.rowCount !== undefined ? meta.rowCount.toLocaleString() : "—"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
                            File Size
                          </div>
                          <div className="mt-0.5 text-sm sm:text-base font-bold text-foreground">
                            {formatFileSize(meta?.fileSize)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
                            Last Synced
                          </div>
                          <div
                            className="mt-0.5 text-xs font-medium text-foreground truncate"
                            title={formatDate(meta?.lastSyncedAt)}
                          >
                            {meta?.lastSyncedAt
                              ? new Date(meta.lastSyncedAt).toLocaleDateString()
                              : "Never"}
                          </div>
                        </div>
                      </div>

                      {hasError && meta?.errorMessage && (
                        <div className="mt-3 rounded-xl bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">
                            <strong>Sync Error:</strong> {meta.errorMessage}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Actions Footer */}
                    <div className="mt-5 pt-3.5 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {meta?.webViewLink ? (
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="rounded-full h-8 px-3 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
                          >
                            <a href={meta.webViewLink} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3.5 w-3.5" />
                              View in Drive
                            </a>
                          </Button>
                        ) : null}

                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="rounded-full h-8 px-3 text-xs gap-1 text-muted-foreground hover:text-foreground"
                        >
                          <a href={googleDriveApi.getDownloadUrl(wb.key)} download>
                            <Download className="h-3.5 w-3.5" />
                            Download .xlsx
                          </a>
                        </Button>
                      </div>

                      {isCentralAdmin && (
                        <Button
                          onClick={() => handleSyncSpreadsheet(wb.key)}
                          disabled={isSyncing}
                          size="sm"
                          className="rounded-full h-8 px-3 text-xs gap-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
                        >
                          <RefreshCw
                            className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`}
                          />
                          {isSyncing ? "Syncing..." : "Sync Now"}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sync Engine Details Panel */}
            <Panel
              title="Continuous Multi-Sheet Synchronization Engine"
              description="Platform events trigger atomic debounced Excel updates to guarantee that Google Drive stays 100% consistent with the active database."
              action={
                isCentralAdmin && (
                  <Button
                    onClick={handleRetryFailed}
                    disabled={retrying || (data?.failedCount || 0) === 0}
                    variant="outline"
                    size="sm"
                    className="rounded-full h-8 text-xs gap-1.5"
                  >
                    <RefreshCw className={`h-3 w-3 ${retrying ? "animate-spin" : ""}`} />
                    Retry Failed Tasks
                  </Button>
                )
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
                <div className="rounded-xl border border-border/50 bg-muted/20 p-3.5 space-y-1">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <Database className="h-3.5 w-3.5 text-primary" />
                    Automated Event Triggers
                  </div>
                  <p>
                    New member registrations, verification approvals, event bookings, and revenue share recalculations automatically update their respective workbooks in near real-time.
                  </p>
                </div>
                <div className="rounded-xl border border-border/50 bg-muted/20 p-3.5 space-y-1">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-brand" />
                    Role-Based Access
                  </div>
                  <p>
                    Every chapter admin and state admin is granted direct Google Drive permissions based on their platform assignments. Permission revocations happen automatically when roles change.
                  </p>
                </div>
                <div className="rounded-xl border border-border/50 bg-muted/20 p-3.5 space-y-1">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-emerald-600" />
                    Resilient Local Cache
                  </div>
                  <p>
                    Spreadsheets are cached in local platform storage so administrative downloads remain instantly available even during network interruptions or Google API rate limits.
                  </p>
                </div>
              </div>
            </Panel>
          </TabsContent>

          {/* TAB 2: ADMIN ACCESS ROSTER */}
          <TabsContent value="admins" className="space-y-6 focus:outline-none">
            <Panel
              title="Authorized Administrator Access Roster"
              description="Platform administrators with verified permissions to view and edit spreadsheets in the shared Google Drive directory."
              action={
                isCentralAdmin && (
                  <Button
                    onClick={handleSyncPermissions}
                    disabled={reconcilingPermissions}
                    size="sm"
                    className="rounded-full h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
                  >
                    <FolderSync
                      className={`h-3.5 w-3.5 ${reconcilingPermissions ? "animate-spin" : ""}`}
                    />
                    {reconcilingPermissions
                      ? "Reconciling Permissions..."
                      : "Reconcile Admin Access"}
                  </Button>
                )
              }
            >
              {data?.syncedAdmins && data.syncedAdmins.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-border/70">
                  <table className="w-full text-left text-sm text-foreground">
                    <thead className="bg-muted/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60">
                      <tr>
                        <th className="px-4 py-3">Administrator</th>
                        <th className="px-4 py-3">Email Address</th>
                        <th className="px-4 py-3">Platform Role</th>
                        <th className="px-4 py-3">Chapter / Scope</th>
                        <th className="px-4 py-3">Drive Permission</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 bg-card">
                      {data.syncedAdmins.map((admin) => (
                        <tr
                          key={admin._id || admin.email}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3 font-semibold text-foreground">
                            {admin.name || "Administrator"}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                            {admin.email}
                          </td>
                          <td className="px-4 py-3">
                            <Pill
                              tone={
                                admin.role?.includes("central")
                                  ? "primary"
                                  : admin.role?.includes("state")
                                  ? "brand"
                                  : "neutral"
                              }
                            >
                              {admin.role?.replace(/_/g, " ")}
                            </Pill>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {[admin.state, admin.chapter].filter(Boolean).join(" · ") ||
                              "All National"}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs capitalize text-foreground">
                            {admin.accessRole || "writer"}
                          </td>
                          <td className="px-4 py-3">
                            {admin.status === "synced" ? (
                              <Pill tone="success">
                                <CheckCircle2 className="h-3 w-3" />
                                Granted & Active
                              </Pill>
                            ) : admin.status === "failed" ? (
                              <Pill tone="danger" title={admin.error}>
                                <AlertCircle className="h-3 w-3" />
                                Sync Failed
                              </Pill>
                            ) : (
                              <Pill tone="warning">
                                <Clock className="h-3 w-3" />
                                Pending Sync
                              </Pill>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-base font-semibold text-foreground">
                    No admin permissions synchronized yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                    Click &quot;Reconcile Admin Access&quot; above to scan all platform administrators and grant them access to the shared folder.
                  </p>
                </div>
              )}
            </Panel>
          </TabsContent>

          {/* TAB 3: SYNC HISTORY & DIAGNOSTICS */}
          <TabsContent value="logs" className="space-y-6 focus:outline-none">
            <Panel
              title="Synchronization Logs & Diagnostics"
              description="Complete historical audit trail of all automated and manual spreadsheet synchronizations, row counts, and retry traces."
              action={
                isCentralAdmin && (
                  <Button
                    onClick={handleRetryFailed}
                    disabled={retrying}
                    variant="outline"
                    size="sm"
                    className="rounded-full h-8 text-xs gap-1.5"
                  >
                    <RefreshCw className={`h-3 w-3 ${retrying ? "animate-spin" : ""}`} />
                    Retry Failed
                  </Button>
                )
              }
            >
              {logsLoading ? (
                <div className="py-12 text-center text-muted-foreground">
                  <RefreshCw className="mx-auto h-7 w-7 animate-spin text-primary mb-2" />
                  <p className="text-xs">Loading synchronization logs...</p>
                </div>
              ) : logs.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-border/70">
                  <table className="w-full text-left text-sm text-foreground">
                    <thead className="bg-muted/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60">
                      <tr>
                        <th className="px-4 py-3">Target</th>
                        <th className="px-4 py-3">Task Type</th>
                        <th className="px-4 py-3">Trigger</th>
                        <th className="px-4 py-3">Duration</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Timestamp</th>
                        <th className="px-4 py-3 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 bg-card">
                      {logs.map((log) => {
                        const isSuccess = log.status === "success";
                        const isFailed = log.status === "failed";

                        return (
                          <tr
                            key={log._id}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-4 py-3 font-semibold text-foreground capitalize">
                              {log.target?.replace(/_/g, " ")}
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground capitalize">
                              {log.taskType?.replace(/_/g, " ")}
                            </td>
                            <td className="px-4 py-3">
                              <Pill tone="neutral">{log.trigger}</Pill>
                            </td>
                            <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                              {log.durationMs ? `${log.durationMs}ms` : "—"}
                            </td>
                            <td className="px-4 py-3">
                              {isSuccess ? (
                                <Pill tone="success">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Success
                                </Pill>
                              ) : isFailed ? (
                                <Pill tone="danger">
                                  <XCircle className="h-3 w-3" />
                                  Failed
                                </Pill>
                              ) : (
                                <Pill tone="primary">
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                  Processing
                                </Pill>
                              )}
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">
                              {formatDate(log.createdAt)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {isFailed ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedErrorLog(log)}
                                  className="rounded-full text-destructive hover:bg-destructive/10 h-7 px-2.5 text-xs gap-1"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  View Error
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground font-mono">
                                  {log.metadata?.rowCount !== undefined
                                    ? `${log.metadata.rowCount} rows`
                                    : "—"}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <Clock className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm font-semibold text-foreground">No synchronization logs found</p>
                </div>
              )}
            </Panel>
          </TabsContent>
        </Tabs>

        {/* Error Diagnostic Dialog */}
        <Dialog
          open={Boolean(selectedErrorLog)}
          onOpenChange={(open) => !open && setSelectedErrorLog(null)}
        >
          <DialogContent className="max-w-xl rounded-2xl sm:rounded-3xl border border-border bg-card p-6 shadow-xl text-foreground">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive font-bold text-lg">
                <AlertTriangle className="h-5 w-5" />
                Synchronization Error Diagnostics
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Target: <span className="font-semibold text-foreground uppercase">{selectedErrorLog?.target}</span> ·
                Attempt: <span className="font-semibold text-foreground">{selectedErrorLog?.attemptCount || 1} of {selectedErrorLog?.maxAttempts || 3}</span> ·
                Logged at: {formatDate(selectedErrorLog?.createdAt)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Error Message
                </label>
                <div className="mt-1 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive font-mono">
                  {selectedErrorLog?.errorMessage || "Unknown error"}
                </div>
              </div>

              {selectedErrorLog?.errorDetails && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Diagnostics & Stack Trace
                  </label>
                  <div className="mt-1 max-h-52 overflow-y-auto rounded-xl border border-border bg-muted/40 p-3 font-mono text-xs text-muted-foreground whitespace-pre-wrap">
                    {selectedErrorLog.errorDetails}
                  </div>
                </div>
              )}

              {selectedErrorLog?.nextRetryAt && (
                <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  Next automatic retry scheduled for: {formatDate(selectedErrorLog.nextRetryAt)}
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedErrorLog(null)}
                className="rounded-full text-xs"
              >
                Close
              </Button>

              {isCentralAdmin && selectedErrorLog?.target && (
                <Button
                  size="sm"
                  onClick={() => {
                    const target = selectedErrorLog.target;
                    setSelectedErrorLog(null);
                    handleSyncSpreadsheet(target);
                  }}
                  className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-1.5 font-semibold"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry This Task Now
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}

export default GoogleDriveDashboard;
