"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Pill } from "@shared/components/rifah/badges";
import { auditApi } from "@shared/lib/api-services";
import { toast } from "sonner";
import { Loader2, Search, Activity, Globe, Laptop, Smartphone, Copy, Check, Shield } from "lucide-react";
import { Input } from "@shared/components/ui/input";
import { Button } from "@shared/components/ui/button";

import { useAuth } from "@shared/providers/auth-provider";

export function AdminAudit() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedIp, setCopiedIp] = useState(null);

  const handleCopyIp = (ip, e) => {
    e.stopPropagation();
    if (!ip) return;
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    toast.success(`Copied IP: ${ip}`);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  const getClientDevice = (log) => {
    if (log.device) return log.device;
    const ua = log.userAgent || "";
    if (/mobile|android|iphone|ipad|phone/i.test(ua)) {
      if (/iphone/i.test(ua)) return "iPhone (iOS)";
      if (/android/i.test(ua)) return "Android Phone";
      return "Mobile Device";
    }
    if (/windows/i.test(ua)) return "Windows PC / Laptop";
    if (/macintosh|mac os x/i.test(ua)) return "Mac / MacBook";
    return "Web Client";
  };

  const formatIp = (raw) => {
    if (!raw) return "127.0.0.1";
    const cleaned = String(raw).replace(/^::ffff:/, "");
    if (cleaned === "::1") return "127.0.0.1";
    return cleaned;
  };

  const isStateAdmin = user?.role === "state_admin";

  const fetchLogs = async (query = "") => {
    setLoading(true);
    try {
      const res = await auditApi.getLogs(query ? { search: query } : {});
      // Support nested pagination response or direct array
      const data = res?.data?.auditLogs || res?.data || res || [];
      const list = Array.isArray(data) ? data : [];

      // Filter out central_admin logs and DELETE action status for state admin / scoped views
      const filtered = list.filter((log) => {
        if (isStateAdmin) {
          if (log.actorRole === "central_admin") return false;
          if (log.action?.toUpperCase() === "DELETE") return false;
        } else if (log.action?.toUpperCase() === "DELETE") {
          return false;
        }
        return true;
      });

      setLogs(filtered);
    } catch (err) {
      toast.error(err.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLogs(searchTerm.trim());
  };

  const getActionColor = (action) => {
    if (!action) return "gray";
    const a = action.toLowerCase();
    if (a.includes("create") || a.includes("add")) return "success";
    if (a.includes("delete") || a.includes("remove")) return "danger";
    if (a.includes("update") || a.includes("edit")) return "warning";
    return "primary";
  };

  const currentRole = user?.role === "state_admin" ? "state_admin" : user?.role === "chapter_admin" ? "chapter_admin" : "admin";
  const subtitle = isStateAdmin
    ? `${user?.state || "State"} executive activity logs & appointed chapter admin actions`
    : "System activity and admin actions";

  return (
    <AppShell
      role={currentRole}
      title="Audit Logs"
      subtitle={subtitle}
    >
      <Panel bodyClassName="p-0">
        <div className="flex items-center gap-2 p-4 border-b border-border">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs by actor, action, IP or summary..."
              className="pl-9 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
          <Button type="button" variant="outline" onClick={() => { setSearchTerm(""); fetchLogs(""); }}>
            Reset
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
            <Activity className="h-10 w-10 mb-3 opacity-20" />
            <p>No activity logs found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
                <tr>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3">Actor</th>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">Target</th>
                  <th className="px-5 py-3">IP Address</th>
                  <th className="px-5 py-3">Device / MAC</th>
                  <th className="px-5 py-3">Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => {
                  const displayIp = formatIp(log.ipAddress);
                  const isLocal = displayIp === "127.0.0.1" || displayIp.startsWith("192.168.");
                  const isCopied = copiedIp === displayIp;
                  const deviceText = getClientDevice(log);
                  const isMobile = deviceText.toLowerCase().includes("mobile") || deviceText.toLowerCase().includes("iphone") || deviceText.toLowerCase().includes("android");

                  return (
                    <tr key={log._id || log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-5 py-3 text-muted-foreground whitespace-nowrap text-xs">
                        {new Date(log.createdAt).toLocaleString("en-GB", {
                          day: "2-digit", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit"
                        })}
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-medium text-foreground">{log.actorName}</div>
                        <div className="text-xs text-muted-foreground uppercase">{log.actorRole?.replace('_', ' ')}</div>
                      </td>
                      <td className="px-5 py-3">
                        <Pill tone={getActionColor(log.action)} className="text-[10px] uppercase tracking-wider font-bold">
                          {log.action}
                        </Pill>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{log.targetModel}</span>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 px-2 py-1 rounded text-xs">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isLocal ? "bg-amber-500" : "bg-emerald-500 animate-pulse"
                            }`}
                            title={isLocal ? "Local / Internal Connection" : "Public Internet IP"}
                          />
                          <span className="font-mono font-medium text-foreground">{displayIp}</span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyIp(displayIp, e)}
                            className="text-muted-foreground hover:text-foreground transition-colors ml-0.5"
                            title="Copy IP Address"
                          >
                            {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1 text-xs font-medium text-foreground">
                            {isMobile ? (
                              <Smartphone className="w-3.5 h-3.5 text-blue-500" />
                            ) : (
                              <Laptop className="w-3.5 h-3.5 text-indigo-500" />
                            )}
                            <span>{deviceText}</span>
                          </div>
                          <div
                            className="text-[10px] text-muted-foreground font-mono flex items-center gap-1"
                            title="Browser Sandbox Protection: W3C / IEEE web standards prohibit browsers from transmitting local hardware MAC addresses over internet HTTP/HTTPS connections for device security and user privacy."
                          >
                            <span className="text-slate-400 font-medium">MAC:</span>
                            <span className="bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded text-[10px] text-slate-500">
                              {log.macAddress || "Layer-2 Restricted (Sandbox)"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground max-w-md">
                        {log.summary}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </AppShell>
  );
}
