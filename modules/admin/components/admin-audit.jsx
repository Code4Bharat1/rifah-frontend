"use client";
import { ScrollText } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel } from "@shared/components/rifah/ui-bits";
import { useAuditLogs } from "@shared/hooks/use-rifah-api";

function AdminAudit() {
  const { data: auditData } = useAuditLogs();
  const auditLogs = auditData?.data || [];

  return (
    <AppShell role="admin" title="Audit log" subtitle="Immutable ledger of administrative actions and moderation events">
      <Panel bodyClassName="p-0 md:p-0">
        {auditLogs.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={ScrollText} title="No activity yet" description="Administrative actions will be logged here." />
          </div>
        ) : (
          <ol className="divide-y divide-border">
            {auditLogs.map((a) => (
              <li key={a._id} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 p-4">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-primary" aria-hidden />
                <div className="min-w-0">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <p className="min-w-0 text-sm font-semibold">{a.action}</p>
                    <Pill tone="primary">{a.user?.name || a.user?.role || "Secretariat"}</Pill>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">{a.entity} · {a.details ? JSON.stringify(a.details) : ""}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Panel>
    </AppShell>
  );
}

export { AdminAudit };
export default AdminAudit;
