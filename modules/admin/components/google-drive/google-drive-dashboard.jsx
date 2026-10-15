"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@shared/providers/auth-provider";
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
  FileText,
  KeyRound,
  ChevronRight,
  Database,
  Sparkles,
} from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/components/ui/card";
import { Badge } from "@shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@shared/components/ui/dialog";

export function GoogleDriveDashboard() {
  const { user } = useAuth();
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
      accent: "from-blue-600 to-indigo-700",
      description:
        "Master business registry, verified status, categories, GSTIN numbers, contact details, and locations.",
      meta: data?.fileLinks?.businesses || {},
    },
    {
      key: "users",
      title: "User Information",
      fileName: "RIFAH_Users.xlsx",
      icon: Users,
      accent: "from-teal-600 to-emerald-700",
      description:
        "Platform membership roster, administrative assignments, roles, chapters, contact emails, and phone numbers.",
      meta: data?.fileLinks?.users || {},
    },
    {
      key: "revenue_sharing",
      title: "Revenue Sharing Information",
      fileName: "RIFAH_Revenue_Sharing.xlsx",
      icon: Wallet,
      accent: "from-emerald-600 to-green-700",
      description:
        "Line-item transaction ledger with exact rupee allocations for Central, State, and Chapter beneficiaries.",
      meta: data?.fileLinks?.revenueSharing || {},
    },
    {
      key: "event_attendees",
      title: "Event Attendees (Grouped)",
      fileName: "RIFAH_Event_Attendees.xlsx",
      icon: CalendarDays,
      accent: "from-indigo-600 to-purple-700",
      description:
        "Complete attendee registrations categorized and grouped by event name with dedicated event tabs.",
      meta: data?.fileLinks?.eventAttendees || {},
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner / Integration Status */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 p-6 md:p-8 shadow-2xl">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/20">
                <HardDrive className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                  Google Drive Platform Integration
                </h1>
                <p className="text-sm text-slate-400">
                  Central Shared Folder & Automated Excel Spreadsheet Synchronization
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {data?.isConnected ? (
                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 gap-1.5 px-3 py-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Connected to Google Drive
                </Badge>
              ) : (
                <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 gap-1.5 px-3 py-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Disconnected / Standby Cache Mode
                </Badge>
              )}

              {data?.googleEmail && (
                <Badge variant="outline" className="border-slate-700 bg-slate-800/60 text-slate-300">
                  Account: {data.googleEmail}
                </Badge>
              )}

              {data?.syncedAdminsCount !== undefined && (
                <Badge variant="outline" className="border-slate-700 bg-slate-800/60 text-slate-300 gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                  {data.syncedAdminsCount} Authorized Admins Synced
                </Badge>
              )}

              {data?.failedCount > 0 && (
                <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 gap-1">
                  <XCircle className="h-3.5 w-3.5" />
                  {data.failedCount} Failed Syncs
                </Badge>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {data?.folderWebViewLink && (
              <Button
                asChild
                variant="outline"
                className="border-indigo-500/40 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 hover:text-white"
              >
                <a href={data.folderWebViewLink} target="_blank" rel="noopener noreferrer">
                  <Folder className="mr-2 h-4 w-4 text-indigo-400" />
                  Open in Google Drive
                  <ExternalLink className="ml-1.5 h-3.5 w-3.5 opacity-70" />
                </a>
              </Button>
            )}

            {isCentralAdmin && (
              <>
                <Button
                  onClick={() => handleSyncSpreadsheet("all")}
                  disabled={syncingTarget === "all"}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-600/25"
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${syncingTarget === "all" ? "animate-spin" : ""}`}
                  />
                  {syncingTarget === "all" ? "Syncing Platform..." : "Sync All Workbooks"}
                </Button>

                {data?.isConnected ? (
                  <Button
                    onClick={handleDisconnect}
                    variant="ghost"
                    className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 border border-transparent hover:border-rose-500/30"
                  >
                    <Unlink className="mr-2 h-4 w-4" />
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    onClick={handleConnect}
                    variant="default"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    <Link2 className="mr-2 h-4 w-4" />
                    Connect Google Account
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Central Folder Details Pill */}
        {data?.folderName && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                <Folder className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Shared Central Directory
                </div>
                <div className="text-sm font-medium text-white">{data.folderName}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400">
              <div>
                <span className="text-slate-500">Folder ID: </span>
                <code className="rounded bg-slate-800 px-2 py-0.5 text-slate-300 font-mono">
                  {data.folderId || "Auto-Provisioned"}
                </code>
              </div>
              <div>
                <span className="text-slate-500">Last Full Sync: </span>
                <span className="text-slate-300">{formatDate(data.lastFullSyncAt)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <TabsList className="bg-slate-900 border border-slate-800 p-1">
            <TabsTrigger value="workbooks" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Synchronized Spreadsheets
            </TabsTrigger>
            <TabsTrigger value="admins" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Admin Access & Permissions ({data?.syncedAdminsCount || 0})
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Clock className="mr-2 h-4 w-4" />
              Sync History & Diagnostics
              {data?.failedCount > 0 && (
                <span className="ml-2 rounded-full bg-rose-500/80 px-1.5 py-0.2 text-[10px] text-white">
                  {data.failedCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                loadStatus();
                loadLogs(logFilter);
              }}
              className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
            >
              <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* TAB 1: WORKBOOKS GRID */}
        <TabsContent value="workbooks" className="space-y-6 focus:outline-none">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {workbooks.map((wb) => {
              const Icon = wb.icon;
              const isSyncing = syncingTarget === wb.key;
              const meta = wb.meta;
              const hasError = meta?.status === "failed";
              const isSynced = meta?.status === "synced";

              return (
                <Card
                  key={wb.key}
                  className="relative overflow-hidden border-slate-800 bg-slate-900/80 backdrop-blur-sm transition-all hover:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/5"
                >
                  <div className={`h-1.5 w-full bg-gradient-to-r ${wb.accent}`} />

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${wb.accent} text-white shadow-md`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-white">{wb.title}</CardTitle>
                          <CardDescription className="text-xs font-mono text-slate-400">
                            {wb.fileName}
                          </CardDescription>
                        </div>
                      </div>

                      {hasError ? (
                        <Badge className="bg-rose-500/15 text-rose-400 border-rose-500/30 gap-1">
                          <XCircle className="h-3 w-3" />
                          Sync Failed
                        </Badge>
                      ) : isSynced ? (
                        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Synchronized
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-700/50 text-slate-300 border-slate-600 gap-1">
                          <Clock className="h-3 w-3" />
                          Pending Initial Sync
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-1">
                    <p className="text-sm text-slate-400 leading-relaxed min-h-[40px]">
                      {wb.description}
                    </p>

                    {/* Workbook Statistics */}
                    <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-950/60 p-3 text-center border border-slate-800/60">
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-slate-500">
                          Total Records
                        </div>
                        <div className="mt-1 text-base font-semibold text-white">
                          {meta?.rowCount !== undefined ? meta.rowCount.toLocaleString() : "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-slate-500">
                          File Size
                        </div>
                        <div className="mt-1 text-base font-semibold text-white">
                          {formatFileSize(meta?.fileSize)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-slate-500">
                          Last Synced
                        </div>
                        <div className="mt-1 text-xs font-medium text-slate-300 truncate" title={formatDate(meta?.lastSyncedAt)}>
                          {meta?.lastSyncedAt ? new Date(meta.lastSyncedAt).toLocaleDateString() : "Never"}
                        </div>
                      </div>
                    </div>

                    {hasError && meta?.errorMessage && (
                      <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-2.5 text-xs text-rose-300">
                        <span className="font-semibold">Error: </span>
                        {meta.errorMessage}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-2">
                        {meta?.webViewLink ? (
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
                          >
                            <a href={meta.webViewLink} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-1.5 h-3.5 w-3.5 text-blue-400" />
                              View in Drive
                            </a>
                          </Button>
                        ) : null}

                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                          <a href={googleDriveApi.getDownloadUrl(wb.key)} download>
                            <Download className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                            Download .xlsx
                          </a>
                        </Button>
                      </div>

                      {isCentralAdmin && (
                        <Button
                          onClick={() => handleSyncSpreadsheet(wb.key)}
                          disabled={isSyncing}
                          size="sm"
                          className="bg-indigo-600/90 hover:bg-indigo-600 text-white"
                        >
                          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                          {isSyncing ? "Syncing..." : "Sync Now"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Sync Engine Features Card */}
          <Card className="border-slate-800 bg-slate-900/50 p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Database className="h-4 w-4 text-indigo-400" />
                  Real-time Platform-wide Synchronization Engine
                </h3>
                <p className="text-sm text-slate-400">
                  Every time a member registers, a business is verified, an event registration is recorded, or revenue share is calculated, the synchronization engine automatically schedules a debounced, atomic update to ensure Google Drive and platform records stay 100% consistent.
                </p>
              </div>

              {isCentralAdmin && (
                <Button
                  onClick={handleRetryFailed}
                  disabled={retrying || (data?.failedCount || 0) === 0}
                  variant="outline"
                  className="border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${retrying ? "animate-spin" : ""}`} />
                  Retry Failed Tasks
                </Button>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* TAB 2: ADMIN ACCESS & ROLE SYNCHRONIZATION */}
        <TabsContent value="admins" className="space-y-6 focus:outline-none">
          <Card className="border-slate-800 bg-slate-900/80">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-indigo-400" />
                    Authorized Administrator Access Roster
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-400 mt-1">
                    The central Google Drive archive is strictly restricted to Central Admins, State Admins, and Chapter Admins. Platform role changes automatically add or revoke Google Drive folder permissions.
                  </CardDescription>
                </div>

                {isCentralAdmin && (
                  <Button
                    onClick={handleSyncPermissions}
                    disabled={reconcilingPermissions}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white self-start sm:self-auto"
                  >
                    <FolderSync className={`mr-2 h-4 w-4 ${reconcilingPermissions ? "animate-spin" : ""}`} />
                    {reconcilingPermissions ? "Reconciling Access..." : "Reconcile Admin Access"}
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {data?.syncedAdmins && data.syncedAdmins.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3.5">Administrator</th>
                        <th className="px-4 py-3.5">Email Address</th>
                        <th className="px-4 py-3.5">Platform Role</th>
                        <th className="px-4 py-3.5">Chapter / Scope</th>
                        <th className="px-4 py-3.5">Drive Access</th>
                        <th className="px-4 py-3.5">Permission Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                      {data.syncedAdmins.map((admin) => (
                        <tr key={admin._id || admin.email} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3.5 font-medium text-white">
                            {admin.name || "Administrator"}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-xs text-slate-300">
                            {admin.email}
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge
                              variant="outline"
                              className={`capitalize ${
                                admin.role?.includes("central")
                                  ? "border-purple-500/40 text-purple-300 bg-purple-500/10"
                                  : admin.role?.includes("state")
                                  ? "border-blue-500/40 text-blue-300 bg-blue-500/10"
                                  : "border-teal-500/40 text-teal-300 bg-teal-500/10"
                              }`}
                            >
                              {admin.role?.replace(/_/g, " ")}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5 text-slate-400 text-xs">
                            {[admin.state, admin.chapter].filter(Boolean).join(" · ") || "All National"}
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge className="bg-slate-800 text-slate-200 border-slate-700 capitalize">
                              {admin.accessRole || "writer"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5">
                            {admin.status === "synced" ? (
                              <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Granted & Active
                              </Badge>
                            ) : admin.status === "failed" ? (
                              <Badge className="bg-rose-500/15 text-rose-400 border-rose-500/30 gap-1" title={admin.error}>
                                <AlertCircle className="h-3 w-3" />
                                Sync Failed
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 gap-1">
                                <Clock className="h-3 w-3" />
                                Pending Sync
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <ShieldCheck className="mx-auto h-12 w-12 text-slate-600 mb-3" />
                  <p className="text-base font-medium text-slate-300">No admin permissions synchronized yet</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Click &quot;Reconcile Admin Access&quot; above to scan all platform administrators and grant them access to the shared folder.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: SYNC HISTORY & DIAGNOSTICS */}
        <TabsContent value="logs" className="space-y-6 focus:outline-none">
          <Card className="border-slate-800 bg-slate-900/80">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-indigo-400" />
                    Synchronization Logs & Diagnostics
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-400 mt-1">
                    Audit trail of all automated and manual spreadsheet synchronizations, failure traces, and retry attempts.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-1">
                    {["all", "success", "failed"].map((f) => (
                      <button
                        key={f}
                        onClick={() => {
                          setLogFilter(f);
                          loadLogs(f);
                        }}
                        className={`rounded px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                          logFilter === f
                            ? "bg-indigo-600 text-white"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  {isCentralAdmin && (
                    <Button
                      onClick={handleRetryFailed}
                      disabled={retrying}
                      size="sm"
                      variant="outline"
                      className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                    >
                      <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${retrying ? "animate-spin" : ""}`} />
                      Retry Failed
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {logsLoading ? (
                <div className="py-12 text-center text-slate-400">
                  <RefreshCw className="mx-auto h-8 w-8 animate-spin text-indigo-400 mb-2" />
                  <p>Loading synchronization logs...</p>
                </div>
              ) : logs.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3.5">Target</th>
                        <th className="px-4 py-3.5">Task Type</th>
                        <th className="px-4 py-3.5">Trigger</th>
                        <th className="px-4 py-3.5">Duration</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-4 py-3.5">Timestamp</th>
                        <th className="px-4 py-3.5 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                      {logs.map((log) => {
                        const isSuccess = log.status === "success";
                        const isFailed = log.status === "failed";

                        return (
                          <tr key={log._id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="px-4 py-3.5 font-medium text-white capitalize">
                              {log.target?.replace(/_/g, " ")}
                            </td>
                            <td className="px-4 py-3.5 text-xs text-slate-400 capitalize">
                              {log.taskType?.replace(/_/g, " ")}
                            </td>
                            <td className="px-4 py-3.5 text-xs">
                              <Badge variant="outline" className="border-slate-700 bg-slate-800/60 text-slate-300 capitalize">
                                {log.trigger}
                              </Badge>
                            </td>
                            <td className="px-4 py-3.5 text-xs font-mono text-slate-400">
                              {log.durationMs ? `${log.durationMs}ms` : "—"}
                            </td>
                            <td className="px-4 py-3.5">
                              {isSuccess ? (
                                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Success
                                </Badge>
                              ) : isFailed ? (
                                <Badge className="bg-rose-500/15 text-rose-400 border-rose-500/30 gap-1">
                                  <XCircle className="h-3 w-3" />
                                  Failed
                                </Badge>
                              ) : (
                                <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 gap-1">
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                  Processing
                                </Badge>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-xs text-slate-400">
                              {formatDate(log.createdAt)}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              {isFailed ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedErrorLog(log)}
                                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-8 px-2 text-xs"
                                >
                                  <Eye className="mr-1 h-3.5 w-3.5" />
                                  View Error
                                </Button>
                              ) : (
                                <span className="text-xs text-slate-500 font-mono">
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
                <div className="py-12 text-center text-slate-400">
                  <Clock className="mx-auto h-10 w-10 text-slate-600 mb-2" />
                  <p>No synchronization logs found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Error Details Modal */}
      <Dialog open={Boolean(selectedErrorLog)} onOpenChange={(open) => !open && setSelectedErrorLog(null)}>
        <DialogContent className="max-w-2xl border-slate-800 bg-slate-900 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="h-5 w-5" />
              Synchronization Diagnostic Error Details
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Target: <span className="font-semibold text-slate-200 uppercase">{selectedErrorLog?.target}</span> ·
              Attempt: <span className="font-semibold text-slate-200">{selectedErrorLog?.attemptCount || 1} of {selectedErrorLog?.maxAttempts || 3}</span> ·
              Logged at: {formatDate(selectedErrorLog?.createdAt)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Error Message
              </label>
              <div className="mt-1 rounded-lg border border-rose-500/30 bg-rose-950/30 p-3 text-sm text-rose-300 font-mono">
                {selectedErrorLog?.errorMessage || "Unknown Error"}
              </div>
            </div>

            {selectedErrorLog?.errorDetails && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Stack Trace & Diagnostics
                </label>
                <div className="mt-1 max-h-56 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-400 whitespace-pre-wrap">
                  {selectedErrorLog.errorDetails}
                </div>
              </div>
            )}

            {selectedErrorLog?.nextRetryAt && (
              <div className="text-xs text-amber-400 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Next automatic retry scheduled for: {formatDate(selectedErrorLog.nextRetryAt)}
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-4">
            <Button
              variant="outline"
              onClick={() => setSelectedErrorLog(null)}
              className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Close
            </Button>

            {isCentralAdmin && selectedErrorLog?.target && (
              <Button
                onClick={() => {
                  const target = selectedErrorLog.target;
                  setSelectedErrorLog(null);
                  handleSyncSpreadsheet(target);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry This Task Now
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
