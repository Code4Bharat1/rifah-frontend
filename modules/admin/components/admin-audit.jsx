"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Pill } from "@shared/components/rifah/badges";
import { auditApi } from "@shared/lib/api-services";
import { toast } from "sonner";
import { Loader2, Search, Activity } from "lucide-react";
import { Input } from "@shared/components/ui/input";
import { Button } from "@shared/components/ui/button";

export function AdminAudit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLogs = async (query = "") => {
    setLoading(true);
    try {
      const res = await auditApi.getLogs(query ? { search: query } : {});
      // Support nested pagination response or direct array
      const data = res?.data?.auditLogs || res?.data || res || [];
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLogs(searchTerm);
  };

  const getActionColor = (action) => {
    if (!action) return "gray";
    const a = action.toLowerCase();
    if (a.includes("create") || a.includes("add")) return "success";
    if (a.includes("delete") || a.includes("remove")) return "danger";
    if (a.includes("update") || a.includes("edit")) return "warning";
    return "primary";
  };

  return (
    <AppShell
      role="admin"
      title="Audit Logs"
      subtitle="System activity and admin actions"
    >
      <Panel bodyClassName="p-0">
        <div className="flex items-center gap-2 p-4 border-b border-border">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs by actor or action..."
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
                  <th className="px-5 py-3">Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
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
                    <td className="px-5 py-3 text-muted-foreground">
                      {log.summary}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </AppShell>
  );
}
